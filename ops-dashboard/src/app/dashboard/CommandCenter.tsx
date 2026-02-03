"use client";

import { useEffect, useState, useRef } from "react";

type AlexStatus = {
  status: "thinking" | "working" | "standby" | "error";
  currentTask: string | null;
  lastActivity: string;
  uptime: number;
  memory: number;
  messagesProcessed: number;
  automationsRunning: number;
  cpu: number;
};

type PipelineStatus = {
  product: string;
  status: "healthy" | "warning" | "critical" | "offline";
  currentStep: string;
  progress: number;
  lastRun: string;
  nextScheduled: string;
  videosToday: number;
  costToday: number;
};

type CronJob = {
  name: string;
  schedule: string;
  nextRun: string;
  lastRun: string;
  status: "ok" | "failed" | "running" | "pending";
};

type SystemMetric = {
  name: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
};

// --- Auxiliary Components ---
const ToolCallVisualizer = ({ tool }: { tool: { name: string, status: 'running' | 'done', result?: string } }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '8px',
      padding: '8px 12px',
      marginTop: '8px',
      fontSize: '11px',
      cursor: 'pointer'
    }} onClick={() => setExpanded(!expanded)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: tool.status === 'running' ? '#ffd93d' : '#4edc88',
            boxShadow: `0 0 6px ${tool.status === 'running' ? '#ffd93d' : '#4edc88'}`
          }} className={tool.status === 'running' ? 'pulse-live' : ''} />
          <span style={{ fontWeight: 600, opacity: 0.8 }}>
            {tool.status === 'running' ? 'Executando' : 'Concluído'}: <code>{tool.name}</code>
          </span>
        </div>
        <span style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </div>
      {expanded && tool.result && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '10px',
          whiteSpace: 'pre-wrap',
          maxHeight: '150px',
          overflowY: 'auto',
          opacity: 0.7
        }}>
          {tool.result}
        </div>
      )}
    </div>
  );
};

export default function CommandCenter() {
  const [alex, setAlex] = useState<AlexStatus | null>(null);
  const [pipelines, setPipelines] = useState<PipelineStatus[]>([]);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "pipelines" | "alex" | "architecture" | "schedule" | "crabwalk" | "chat">("overview");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chatMessages, setChatMessages] = useState<Array<{
    role: 'user' | 'assistant',
    content: string,
    time: string,
    toolCalls?: Array<{ name: string, status: 'running' | 'done', result?: string }>
  }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const uptimeRef = useRef(0);

  // Simular dados do Alex em tempo real (em produção, isso viria de uma API)
  useEffect(() => {
    // Tempo
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Uptime simulation
    uptimeRef.current = Date.now();

    // Simular status do Alex
    const mockAlex: AlexStatus = {
      status: "working",
      currentTask: "Processando automações do daily report",
      lastActivity: new Date().toISOString(),
      uptime: Math.floor((Date.now() - uptimeRef.current) / 1000) + 86400,
      memory: 245,
      messagesProcessed: 127,
      automationsRunning: 3,
      cpu: 23
    };
    setAlex(mockAlex);

    // Pipelines
    const mockPipelines: PipelineStatus[] = [
      { product: "TEO", status: "healthy", currentStep: "Idle", progress: 100, lastRun: new Date(Date.now() - 3600000).toISOString(), nextScheduled: new Date(Date.now() + 86400000).toISOString(), videosToday: 6, costToday: 0 },
      { product: "JONATHAN", status: "healthy", currentStep: "Idle", progress: 100, lastRun: new Date(Date.now() - 3600000).toISOString(), nextScheduled: new Date(Date.now() + 86400000).toISOString(), videosToday: 6, costToday: 0 },
      { product: "LAISE", status: "warning", currentStep: "Generating", progress: 60, lastRun: new Date(Date.now() - 1800000).toISOString(), nextScheduled: new Date(Date.now() + 86400000).toISOString(), videosToday: 4, costToday: 0.12 },
      { product: "PEDRO", status: "healthy", currentStep: "Idle", progress: 100, lastRun: new Date(Date.now() - 7200000).toISOString(), nextScheduled: new Date(Date.now() + 86400000).toISOString(), videosToday: 6, costToday: 0 },
      { product: "PETSELECT", status: "healthy", currentStep: "Idle", progress: 100, lastRun: new Date(Date.now() - 14400000).toISOString(), nextScheduled: new Date(Date.now() + 43200000).toISOString(), videosToday: 3, costToday: 0.05 },
    ];
    setPipelines(mockPipelines);

    // Cron Jobs
    const mockCrons: CronJob[] = [
      { name: "igaming_schedule_dplus1", schedule: "5 7 * * *", nextRun: getNextRun("5 7 * * *"), lastRun: new Date(Date.now() - 54000000).toISOString(), status: "ok" },
      { name: "igaming_poll_status", schedule: "0 9,21 * * *", nextRun: getNextRun("0 9,21 * * *"), lastRun: new Date(Date.now() - 43200000).toISOString(), status: "ok" },
      { name: "ops_autopilot", schedule: "0 */6 * * *", nextRun: getNextRun("0 */6 * * *"), lastRun: new Date(Date.now() - 21600000).toISOString(), status: "ok" },
      { name: "jp_schedule", schedule: "45 7 * * *", nextRun: getNextRun("45 7 * * *"), lastRun: new Date(Date.now() - 54000000).toISOString(), status: "ok" },
      { name: "vanessa_weekly", schedule: "0 8 * * 1", nextRun: getNextRun("0 8 * * 1"), lastRun: new Date(Date.now() - 259200000).toISOString(), status: "pending" },
    ];
    setCronJobs(mockCrons);

    // Métricas
    const mockMetrics: SystemMetric[] = [
      { name: "CPU Usage", value: 23, unit: "%", status: "good" },
      { name: "Memory", value: 245, unit: "MB", status: "good" },
      { name: "Disk", value: 68, unit: "%", status: "warning" },
      { name: "Network", value: 12, unit: "MB/s", status: "good" },
      { name: "Tokens Today", value: 156000, unit: "", status: "good" },
      { name: "Cost Today", value: 0.17, unit: "USD", status: "good" },
    ];
    setMetrics(mockMetrics);

    return () => {
      clearInterval(timer);
    };
  }, []);

  function getNextRun(cron: string): string {
    try {
      // Parse cron expression manually for common patterns
      const parts = cron.split(' ');
      if (parts.length !== 5) return new Date(Date.now() + 3600000).toISOString();

      const [minute, hour, , , dayOfWeek] = parts;
      const now = new Date();
      const next = new Date(now);

      // Parse hour(s) - handle comma-separated
      const hours = hour.includes(',') ? hour.split(',').map(Number) :
        hour.includes('/') ? Array.from({ length: 24 / parseInt(hour.split('/')[1]) }, (_, i) => i * parseInt(hour.split('/')[1])) :
          hour === '*' ? [now.getHours()] : [parseInt(hour)];

      const mins = parseInt(minute) || 0;

      // Find next occurrence
      next.setSeconds(0);
      next.setMilliseconds(0);
      next.setMinutes(mins);

      // Find next valid hour
      let foundHour = hours.find(h => h > now.getHours() || (h === now.getHours() && mins > now.getMinutes()));
      if (foundHour !== undefined) {
        next.setHours(foundHour);
      } else {
        // Next day
        next.setDate(next.getDate() + 1);
        next.setHours(hours[0]);
      }

      // Handle day of week (0 = Sunday)
      if (dayOfWeek !== '*') {
        const targetDay = parseInt(dayOfWeek);
        const currentDay = next.getDay();
        if (currentDay !== targetDay) {
          const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
          next.setDate(next.getDate() + daysUntil);
        }
      }

      return next.toISOString();
    } catch {
      return new Date(Date.now() + 3600000).toISOString();
    }
  }

  function formatUptime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "healthy": case "ok": case "good": return "#4edc88";
      case "warning": case "pending": return "#ffd93d";
      case "critical": case "failed": case "error": return "#ff6b6b";
      default: return "#a0a0a0";
    }
  }

  const tabs = [
    { id: "overview", label: "📊 Overview", icon: "📊" },
    { id: "pipelines", label: "🔄 Pipelines", icon: "🔄" },
    { id: "alex", label: "🤖 Alex Live", icon: "🤖" },
    { id: "architecture", label: "🏗️ Arquitetura", icon: "🏗️" },
    { id: "schedule", label: "📅 Cronograma", icon: "📅" },
    { id: "crabwalk", label: "🦀 Crabwalk", icon: "🦀" },
    { id: "chat", label: "💬 Chat", icon: "💬" },
  ];

  return (
    <div className="command-center" style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900 }}>
            🎛️ <span style={{ color: 'var(--accent)' }}>COMMAND</span> CENTER
          </h1>
          <p style={{ margin: '4px 0 0 0', opacity: 0.5, fontSize: '13px' }}>
            Empire Control System v2.0 • {currentTime.toLocaleString('pt-BR')}
          </p>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent)' }}>
              {pipelines.filter(p => p.status === 'healthy').length}/{pipelines.length}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.5 }}>Pipelines OK</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#4edc88' }}>
              {cronJobs.filter(c => c.status === 'ok').length}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.5 }}>Jobs OK</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#ffd93d' }}>
              ${metrics.find(m => m.name === 'Cost Today')?.value.toFixed(2) || '0.00'}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.5 }}>Custo Hoje</div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav style={{
        padding: '16px 40px',
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? 'rgba(78, 220, 136, 0.2)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent)' : 'rgba(255,255,255,0.6)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ padding: '32px 40px' }}>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

            {/* Pipeline Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {pipelines.map(pipeline => (
                <div key={pipeline.product} className="glass-card" style={{
                  padding: '20px',
                  border: `1px solid ${getStatusColor(pipeline.status)}44`,
                  background: `${getStatusColor(pipeline.status)}08`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{pipeline.product}</h3>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: getStatusColor(pipeline.status),
                      boxShadow: `0 0 10px ${getStatusColor(pipeline.status)}`
                    }} />
                  </div>

                  <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>
                    {pipeline.currentStep}
                  </div>

                  {/* Progress */}
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '12px' }}>
                    <div style={{
                      width: `${pipeline.progress}%`,
                      height: '100%',
                      background: getStatusColor(pipeline.status),
                      borderRadius: '2px',
                      transition: 'width 0.3s'
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.6 }}>
                    <span>📹 {pipeline.videosToday} hoje</span>
                    <span>💰 ${pipeline.costToday.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* System Metrics */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700 }}>
                📈 System Metrics
              </h3>
              {metrics.map(metric => (
                <div key={metric.name} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', opacity: 0.8 }}>{metric.name}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: getStatusColor(metric.status) }}>
                      {metric.value}{metric.unit}
                    </span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                    <div style={{
                      width: `${Math.min(100, metric.value)}%`,
                      height: '100%',
                      background: getStatusColor(metric.status),
                      borderRadius: '2px'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALEX LIVE */}
        {activeTab === "alex" && alex && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>

            {/* Alex Avatar */}
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: getStatusColor(alex.status) + '22',
                border: `2px solid ${getStatusColor(alex.status)}`,
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                boxShadow: `0 0 40px ${getStatusColor(alex.status)}44`
              }}>
                {alex.status === 'thinking' ? '🧠' : alex.status === 'working' ? '⚡' : '😴'}
              </div>

              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 900 }}>
                ALEX
              </h2>
              <div style={{
                display: 'inline-block',
                padding: '4px 16px',
                borderRadius: '100px',
                background: getStatusColor(alex.status) + '22',
                color: getStatusColor(alex.status),
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '24px'
              }}>
                {alex.status.toUpperCase()}
              </div>

              <div style={{ textAlign: 'left', fontSize: '14px', opacity: 0.8 }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ opacity: 0.5, fontSize: '11px' }}>Tarefa Atual</div>
                  <div style={{ fontWeight: 600 }}>{alex.currentTask || "Idle"}</div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ opacity: 0.5, fontSize: '11px' }}>Uptime</div>
                  <div style={{ fontWeight: 600 }}>{formatUptime(alex.uptime)}</div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ opacity: 0.5, fontSize: '11px' }}>Mensagens Processadas</div>
                  <div style={{ fontWeight: 600 }}>{alex.messagesProcessed}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.5, fontSize: '11px' }}>Automações Ativas</div>
                  <div style={{ fontWeight: 600 }}>{alex.automationsRunning}</div>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700 }}>
                📝 Atividade Recente
              </h3>
              {[
                { time: "22:14", action: "Gerou vídeo TEO com no_cost", type: "success" },
                { time: "22:11", action: "Executou pipeline health check", type: "info" },
                { time: "22:06", action: "Respondeu mensagem do Vinicius", type: "info" },
                { time: "22:00", action: "Daily report enviado", type: "success" },
                { time: "21:55", action: "Atualizou dashboard de custos", type: "info" },
              ].map((log, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <span style={{ opacity: 0.5, fontSize: '12px', minWidth: '50px' }}>{log.time}</span>
                  <span style={{ flex: 1 }}>{log.action}</span>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: log.type === 'success' ? '#4edc88' : '#ffd93d',
                    marginTop: '6px'
                  }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PIPELINES */}
        {activeTab === "pipelines" && (
          <div>
            {pipelines.map(pipeline => (
              <div key={pipeline.product} className="glass-card" style={{
                padding: '24px',
                marginBottom: '16px',
                border: `1px solid ${getStatusColor(pipeline.status)}44`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>{pipeline.product}</h3>
                  <div style={{
                    padding: '6px 16px',
                    borderRadius: '100px',
                    background: getStatusColor(pipeline.status) + '22',
                    color: getStatusColor(pipeline.status),
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    {pipeline.status.toUpperCase()}
                  </div>
                </div>

                {/* Pipeline Steps */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  {["📥 IMG", "🎨 GEN", "🎬 VID", "☁️ UP", "📅 SCH"].map((step, i) => {
                    const stepComplete = i < (pipeline.progress / 100) * 5;
                    return (
                      <div key={i} style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        background: stepComplete ? 'rgba(78, 220, 136, 0.1)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${stepComplete ? '#4edc88' : 'transparent'}`,
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: 600,
                        opacity: stepComplete ? 1 : 0.5
                      }}>
                        {step}
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '32px', fontSize: '13px', opacity: 0.7 }}>
                  <span>🕐 Último: {new Date(pipeline.lastRun).toLocaleString('pt-BR')}</span>
                  <span>📅 Próximo: {new Date(pipeline.nextScheduled).toLocaleString('pt-BR')}</span>
                  <span>📹 {pipeline.videosToday} vídeos hoje</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ARCHITECTURE */}
        {activeTab === "architecture" && (
          <div className="glass-card" style={{ padding: '40px' }}>
            <h3 style={{ margin: '0 0 30px 0', fontSize: '20px', fontWeight: 800 }}>🏗️ Arquitetura do Sistema</h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
              marginBottom: '40px'
            }}>
              {[
                { name: "CLAWDBOT", desc: "Main Agent", color: "#4edc88" },
                { name: "UPLOAD-POST", desc: "Scheduler API", color: "#ffd93d" },
                { name: "SUPABASE", desc: "Database", color: "#a78bfa" },
                { name: "DRIVE", desc: "Storage", color: "#38bdf8" },
              ].map(layer => (
                <div key={layer.name} style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: layer.color + '11',
                  border: `1px solid ${layer.color}44`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                    {layer.name === "CLAWDBOT" ? "🤖" : layer.name === "SUPABASE" ? "🗄️" : layer.name === "DRIVE" ? "☁️" : "📡"}
                  </div>
                  <div style={{ fontWeight: 700 }}>{layer.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>{layer.desc}</div>
                </div>
              ))}
            </div>

            {/* Fluxo */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <span style={{ padding: '8px 16px', background: 'rgba(78, 220, 136, 0.1)', borderRadius: '8px' }}>📸 Imagens</span>
              <span>→</span>
              <span style={{ padding: '8px 16px', background: 'rgba(255, 217, 61, 0.1)', borderRadius: '8px' }}>🎨 Gemini</span>
              <span>→</span>
              <span style={{ padding: '8px 16px', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '8px' }}>🎬 FFmpeg</span>
              <span>→</span>
              <span style={{ padding: '8px 16px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px' }}>☁️ Drive</span>
              <span>→</span>
              <span style={{ padding: '8px 16px', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px' }}>📅 Upload-Post</span>
            </div>
          </div>
        )}

        {/* SCHEDULE */}
        {activeTab === "schedule" && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 800 }}>📅 Cronograma de Automações</h3>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', opacity: 0.5, fontSize: '12px' }}>JOB</th>
                  <th style={{ padding: '12px', textAlign: 'left', opacity: 0.5, fontSize: '12px' }}>CRON</th>
                  <th style={{ padding: '12px', textAlign: 'left', opacity: 0.5, fontSize: '12px' }}>PRÓXIMA EXECUÇÃO</th>
                  <th style={{ padding: '12px', textAlign: 'left', opacity: 0.5, fontSize: '12px' }}>ÚLTIMA</th>
                  <th style={{ padding: '12px', textAlign: 'left', opacity: 0.5, fontSize: '12px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {cronJobs.map(job => (
                  <tr key={job.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px 12px', fontWeight: 600 }}>{job.name}</td>
                    <td style={{ padding: '16px 12px', fontFamily: 'monospace', fontSize: '12px', opacity: 0.7 }}>{job.schedule}</td>
                    <td style={{ padding: '16px 12px', fontSize: '13px' }}>{new Date(job.nextRun).toLocaleString('pt-BR')}</td>
                    <td style={{ padding: '16px 12px', fontSize: '13px', opacity: 0.7 }}>{new Date(job.lastRun).toLocaleString('pt-BR')}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '100px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: getStatusColor(job.status) + '22',
                        color: getStatusColor(job.status)
                      }}>
                        {job.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CRABWALK */}
        {activeTab === "crabwalk" && (
          <div style={{ height: 'calc(100vh - 200px)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>🦀</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Crabwalk Monitor</h3>
                  <p style={{ margin: 0, fontSize: '11px', opacity: 0.6 }}>OpenClaw Real-Time Companion</p>
                </div>
              </div>
              <a
                href="http://localhost:3002"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '11px'
                }}
              >
                🔗 Abrir em nova aba
              </a>
            </div>
            <iframe
              src="http://localhost:3002"
              style={{
                width: '100%',
                height: 'calc(100% - 60px)',
                border: 'none',
                background: '#0a0a0a'
              }}
              title="Crabwalk Monitor"
            />
          </div>
        )}

        {/* CHAT */}
        {activeTab === "chat" && (
          <div className="glass-card" style={{
            height: 'calc(100vh - 200px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>🦞</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>OpenClaw Chat</h3>
                  <p style={{ margin: 0, fontSize: '11px', opacity: 0.6 }}>Terminal direto com Alex</p>
                </div>
              </div>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                padding: '6px 12px',
                borderRadius: '20px',
                background: 'rgba(78, 220, 136, 0.2)',
                color: '#4edc88'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#4edc88',
                  animation: 'pulse 2s infinite'
                }} />
                Conectado
              </span>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'rgba(0,0,0,0.2)'
            }}>
              {chatMessages.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  opacity: 0.5
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🦞</div>
                  <p style={{ fontSize: '14px' }}>Envie uma mensagem para o Alex</p>
                  <p style={{ fontSize: '11px', opacity: 0.6 }}>
                    Ex: "status do sistema", "rodar pipeline igaming", "verificar posts agendados"
                  </p>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                    background: msg.role === 'user'
                      ? 'rgba(78, 220, 136, 0.15)'
                      : 'rgba(255,255,255,0.05)',
                    border: msg.role === 'user'
                      ? '1px solid rgba(78, 220, 136, 0.3)'
                      : '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ fontSize: '13px', lineHeight: 1.5 }}>{msg.content}</div>

                    {/* Tool Calls Visualizer */}
                    {msg.toolCalls?.map((tool, idx) => (
                      <ToolCallVisualizer key={idx} tool={tool} />
                    ))}

                    <div style={{
                      fontSize: '9px',
                      opacity: 0.5,
                      marginTop: '8px',
                      textAlign: msg.role === 'user' ? 'right' : 'left'
                    }}>
                      {msg.time}
                    </div>
                  </div>
                ))
              )}
              {chatSending && (
                <div style={{
                  alignSelf: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div className="spinner" style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid rgba(78, 220, 136, 0.2)',
                    borderTopColor: '#4edc88',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span style={{ fontSize: '12px', opacity: 0.7 }}>Alex está pensando...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!chatInput.trim() || chatSending) return;

                const userMessage = chatInput.trim();
                const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                setChatMessages(prev => [...prev, { role: 'user', content: userMessage, time: now }]);
                setChatInput('');
                setChatSending(true);

                try {
                  const res = await fetch('/api/openclaw-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userMessage })
                  });
                  const data = await res.json();

                  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  setChatMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.ok ? data.response : `❌ ${data.error}`,
                    time: now,
                    toolCalls: data.toolCalls
                  }]);
                } catch (err) {
                  const errorTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  setChatMessages(prev => [...prev, {
                    role: 'assistant',
                    content: '❌ Erro ao conectar com OpenClaw. Verifique se o Gateway está rodando.',
                    time: errorTime
                  }]);
                } finally {
                  setChatSending(false);
                }
              }}
              style={{
                padding: '16px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                gap: '12px'
              }}
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Digite sua mensagem para o Alex..."
                disabled={chatSending}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={chatSending || !chatInput.trim()}
                style={{
                  padding: '12px 24px',
                  background: chatInput.trim() ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  color: chatInput.trim() ? '#000' : '#666',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: chatInput.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                {chatSending ? '...' : 'Enviar'}
              </button>
            </form>
          </div>
        )}

      </main>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
