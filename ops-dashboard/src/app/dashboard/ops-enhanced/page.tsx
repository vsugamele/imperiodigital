"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

const CrabwalkMonitor = dynamic(() => import("./crabwalk/page"), { ssr: false });

// ============================================
// TIPOS
// ============================================

type Task = {
  id: string;
  title: string;
  description: string;
  status: "backlog" | "doing" | "done" | "blocked";
  priority: "high" | "medium" | "low";
  labels: string[];
  assignee?: string;
  notes?: string;
  updatedAt?: string;
};

type ScheduledPost = {
  id: string;
  profile: string;
  platform: string;
  scheduledAt: string;
  status: "scheduled" | "posted" | "in_progress" | "failed";
  content: string;
  jobId?: string;
  costBrl?: number;
};

type ArchitectureNode = {
  id: string;
  name: string;
  type: "service" | "storage" | "api" | "automation";
  status: "healthy" | "warning" | "error";
  description: string;
  connections: string[];
  uptime?: string;
};

type Routine = {
  id: string;
  name: string;
  schedule: string;
  nextRun: string;
  lastRun: string;
  status: "active" | "paused" | "error";
  description: string;
  type: "daily" | "weekly" | "hourly";
};

type Alert = {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};

type CostStats = {
  today: number;
  week: number;
  month: number;
  byProject: Record<string, number>;
};

// ============================================
// DADOS MOCKADOS
// ============================================

const mockTasks: Task[] = [
  { id: "1", title: "Corrigir scheduler do no_cost", description: "Verificar por que imagens no_cost não estão sendo usadas", status: "doing", priority: "high", labels: ["bug", "scheduler"] },
  { id: "2", title: "Melhorar tracking de custos", description: "Adicionar custo por imagem gerada no dashboard", status: "backlog", priority: "medium", labels: ["feature", "dashboard"] },
  { id: "3", title: "Criar alerts automáticos", description: "Enviar Telegram quando pipeline falhar", status: "doing", priority: "high", labels: ["automation"] },
  { id: "4", title: "Atualizar logo do Command Center", description: "Substituir por design mais profissional", status: "done", priority: "low", labels: ["design"] },
];

const mockSchedules: ScheduledPost[] = [
  { id: "s1", profile: "TEO", platform: "Instagram", scheduledAt: "2026-02-03T10:00:00", status: "scheduled", content: "Reels TEO - 10:00", costBrl: 0.003 },
  { id: "s2", profile: "TEO", platform: "Instagram", scheduledAt: "2026-02-03T13:00:00", status: "scheduled", content: "Reels TEO - 13:00", costBrl: 0.003 },
  { id: "s3", profile: "TEO", platform: "Instagram", scheduledAt: "2026-02-03T16:00:00", status: "scheduled", content: "Reels TEO - 16:00", costBrl: 0.003 },
  { id: "s4", profile: "TEO", platform: "Instagram", scheduledAt: "2026-02-03T19:00:00", status: "scheduled", content: "Reels TEO - 19:00", costBrl: 0.003 },
  { id: "s5", profile: "TEO", platform: "Instagram", scheduledAt: "2026-02-03T21:00:00", status: "scheduled", content: "Reels TEO - 21:00", costBrl: 0.003 },
  { id: "s6", profile: "TEO", platform: "Instagram", scheduledAt: "2026-02-03T23:00:00", status: "scheduled", content: "Reels TEO - 23:00", costBrl: 0.003 },
  { id: "s7", profile: "JONATHAN", platform: "Instagram", scheduledAt: "2026-02-03T10:00:00", status: "scheduled", content: "Reels JONATHAN - 10:00", costBrl: 0.003 },
  { id: "s8", profile: "JONATHAN", platform: "Instagram", scheduledAt: "2026-02-03T13:00:00", status: "scheduled", content: "Reels JONATHAN - 13:00", costBrl: 0.003 },
  { id: "s9", profile: "JONATHAN", platform: "Instagram", scheduledAt: "2026-02-03T16:00:00", status: "scheduled", content: "Reels JONATHAN - 16:00", costBrl: 0.003 },
  { id: "s10", profile: "JONATHAN", platform: "Instagram", scheduledAt: "2026-02-03T19:00:00", status: "scheduled", content: "Reels JONATHAN - 19:00", costBrl: 0.003 },
  { id: "s11", profile: "JONATHAN", platform: "Instagram", scheduledAt: "2026-02-03T21:00:00", status: "scheduled", content: "Reels JONATHAN - 21:00", costBrl: 0.003 },
  { id: "s12", profile: "JONATHAN", platform: "Instagram", scheduledAt: "2026-02-03T23:00:00", status: "scheduled", content: "Reels JONATHAN - 23:00", costBrl: 0.003 },
  { id: "s13", profile: "LAISE", platform: "Instagram", scheduledAt: "2026-02-03T10:00:00", status: "scheduled", content: "Reels LAISE - 10:00", costBrl: 0.003 },
  { id: "s14", profile: "LAISE", platform: "Instagram", scheduledAt: "2026-02-03T13:00:00", status: "scheduled", content: "Reels LAISE - 13:00", costBrl: 0.003 },
  { id: "s15", profile: "LAISE", platform: "Instagram", scheduledAt: "2026-02-03T16:00:00", status: "scheduled", content: "Reels LAISE - 16:00", costBrl: 0.003 },
  { id: "s16", profile: "LAISE", platform: "Instagram", scheduledAt: "2026-02-03T19:00:00", status: "scheduled", content: "Reels LAISE - 19:00", costBrl: 0.003 },
  { id: "s17", profile: "LAISE", platform: "Instagram", scheduledAt: "2026-02-03T21:00:00", status: "scheduled", content: "Reels LAISE - 21:00", costBrl: 0.003 },
  { id: "s18", profile: "LAISE", platform: "Instagram", scheduledAt: "2026-02-03T23:00:00", status: "scheduled", content: "Reels LAISE - 23:00", costBrl: 0.003 },
  { id: "s19", profile: "PEDRO", platform: "Instagram", scheduledAt: "2026-02-03T10:00:00", status: "scheduled", content: "Reels PEDRO - 10:00", costBrl: 0.003 },
  { id: "s20", profile: "PEDRO", platform: "Instagram", scheduledAt: "2026-02-03T13:00:00", status: "scheduled", content: "Reels PEDRO - 13:00", costBrl: 0.003 },
  { id: "s21", profile: "PEDRO", platform: "Instagram", scheduledAt: "2026-02-03T16:00:00", status: "scheduled", content: "Reels PEDRO - 16:00", costBrl: 0.003 },
  { id: "s22", profile: "PEDRO", platform: "Instagram", scheduledAt: "2026-02-03T19:00:00", status: "scheduled", content: "Reels PEDRO - 19:00", costBrl: 0.003 },
  { id: "s23", profile: "PEDRO", platform: "Instagram", scheduledAt: "2026-02-03T21:00:00", status: "scheduled", content: "Reels PEDRO - 21:00", costBrl: 0.003 },
  { id: "s24", profile: "PEDRO", platform: "Instagram", scheduledAt: "2026-02-03T23:00:00", status: "scheduled", content: "Reels PEDRO - 23:00", costBrl: 0.003 },
  { id: "s25", profile: "PETSELECT", platform: "Instagram", scheduledAt: "2026-02-03T09:00:00", status: "scheduled", content: "Carrossel - 09:00 UK", costBrl: 0.0004 },
  { id: "s26", profile: "PETSELECT", platform: "Instagram", scheduledAt: "2026-02-03T13:00:00", status: "scheduled", content: "Imagem - 13:00 UK", costBrl: 0.0001 },
  { id: "s27", profile: "PETSELECT", platform: "Instagram", scheduledAt: "2026-02-03T19:00:00", status: "scheduled", content: "Reels - 19:00 UK", costBrl: 0.0001 },
];

const mockArchitecture: ArchitectureNode[] = [
  { id: "clawdbot", name: "Clawdbot", type: "service", status: "healthy", description: "Agente principal que orquestra tudo", connections: ["telegram", "scripts", "supabase"], uptime: "99.9%" },
  { id: "upload-post", name: "Upload-Post API", type: "api", status: "healthy", description: "Agenda e publica posts nas plataformas", connections: ["instagram", "tiktok", "youtube"], uptime: "99.5%" },
  { id: "supabase", name: "Supabase", type: "storage", status: "healthy", description: "Banco de dados e autenticação", connections: ["dashboard", "clawdbot"], uptime: "99.99%" },
  { id: "drive", name: "Google Drive", type: "storage", status: "healthy", description: "Armazena imagens, vídeos e referências", connections: ["scripts", "rclone"], uptime: "100%" },
  { id: "gemini", name: "Gemini API", type: "api", status: "healthy", description: "Gera imagens 9:16 para os reels", connections: ["scripts"], uptime: "99.0%" },
  { id: "rclone", name: "RClone", type: "automation", status: "healthy", description: "Sincroniza arquivos com Drive", connections: ["drive", "scripts"], uptime: "100%" },
  { id: "ffmpeg", name: "FFmpeg", type: "automation", status: "healthy", description: "Cria vídeos com Ken Burns effect", connections: ["scripts"], uptime: "100%" },
];

const mockRoutines: Routine[] = [
  { id: "r1", name: "iGaming D+1 Schedule", schedule: "5 7 * * *", nextRun: "2026-02-03 07:05", lastRun: "2026-02-02 07:05", status: "active", description: "Gera 6 vídeos por perfil e agenda para amanhã", type: "daily" },
  { id: "r2", name: "PetSelect D+1 Schedule", schedule: "15 7 * * *", nextRun: "2026-02-03 07:15", lastRun: "2026-02-02 07:15", status: "active", description: "Gera carousel e agenda para amanhã", type: "daily" },
  { id: "r3", name: "Healthcheck D+1", schedule: "25 7 * * *", nextRun: "2026-02-03 07:25", lastRun: "2026-02-02 07:25", status: "active", description: "Verifica se todos os produtos têm posts agendados", type: "daily" },
  { id: "r4", name: "Upload-Post Status Poll", schedule: "0 9,21 * * *", nextRun: "2026-02-02 21:00", lastRun: "2026-02-02 09:00", status: "active", description: "Verifica status dos posts agendados", type: "hourly" },
  { id: "r5", name: "Ops Autopilot", schedule: "0 */6 * * *", nextRun: "2026-02-02 12:00", lastRun: "2026-02-02 06:00", status: "active", description: "Avança tasks do kanban automaticamente", type: "hourly" },
  { id: "r6", name: "Vanessa Weekly Plan", schedule: "0 8 * * 1", nextRun: "2026-02-02 08:00", lastRun: "2026-01-26 08:00", status: "active", description: "Prepara estrutura de conteúdo semanal", type: "weekly" },
];

const projects = [
  { id: "igaming", name: "iGaming", color: "#4edc88", profiles: ["TEO", "JONATHAN", "LAISE", "PEDRO"], postsPerDay: 24, costPerPost: 0.003 },
  { id: "petselect", name: "PetSelect UK", color: "#ffd93d", profiles: ["PETSELECT"], postsPerDay: 3, costPerPost: 0.0002 },
  { id: "jp", name: "Projeto JP", color: "#a78bfa", profiles: ["JP"], postsPerDay: 0, costPerPost: 0 },
  { id: "vanessa", name: "Vanessa Equilibre", color: "#38bdf8", profiles: ["VANESSA"], postsPerDay: 4, costPerPost: 0 },
];

// ============================================
// COMPONENTES
// ============================================

export default function OpsDashboardEnhanced() {
  const [activeTab, setActiveTab] = useState<"overview" | "kanban" | "schedule" | "crabwalk" | "architecture" | "routines">("overview");
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [costStats, setCostStats] = useState<CostStats>({
    today: 0.08,
    week: 0.45,
    month: 1.82,
    byProject: { igaming: 0.07, petselect: 0.01, jp: 0, vanessa: 0 }
  });

  // Simular WebSocket com alertas em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        const newAlert: Alert = {
          id: Date.now().toString(),
          type: Math.random() > 0.7 ? "warning" : "info",
          title: "Pipeline Update",
          message: `Novo post agendado: ${["TEO", "JONATHAN", "LAISE", "PETSELECT"][Math.floor(Math.random() * 4)]}`,
          timestamp: new Date().toISOString(),
          read: false
        };
        setAlerts(prev => [newAlert, ...prev].slice(0, 10));
      }
    }, 5000);

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      healthy: "#4edc88",
      active: "#4edc88",
      success: "#4edc88",
      warning: "#ffd93d",
      error: "#ff6b6b",
      blocked: "#ff6b6b",
      doing: "#ffd93d",
      in_progress: "#38bdf8",
      high: "#ff6b6b",
      medium: "#ffd93d",
      low: "#4edc88"
    };
    return colors[status] || "#a0a0a0";
  }

  // Drag & Drop para Kanban
  const handleDragStart = useCallback((taskId: string) => {
    setDraggedTask(taskId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, newStatus: Task["status"]) => {
    e.preventDefault();
    if (draggedTask) {
      setTasks(prev => prev.map(t => 
        t.id === draggedTask ? { ...t, status: newStatus } : t
      ));
      setDraggedTask(null);
    }
  }, [draggedTask]);

  const columns = [
    { id: "backlog" as const, title: "Backlog", color: "#a0a0a0" },
    { id: "doing" as const, title: "Em Andamento", color: "#ffd93d" },
    { id: "blocked" as const, title: "Bloqueado", color: "#ff6b6b" },
    { id: "done" as const, title: "Concluído", color: "#4edc88" },
  ];

  const unreadAlerts = alerts.filter(a => !a.read).length;

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #0d1117 100%)',
      color: '#fff',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>
              🎛️ <span style={{ color: 'var(--accent)' }}>OPS</span> DASHBOARD <span style={{ fontSize: '12px', opacity: 0.5, fontWeight: 400 }}>v2.0</span>
            </h1>
            <p style={{ margin: '4px 0 0 0', opacity: 0.5, fontSize: '12px' }}>
              Controle operacional • {currentTime.toLocaleString('pt-BR')}
            </p>
          </div>
          
          {/* Quick Stats */}
          <div style={{ display: 'flex', gap: '24px' }}>
            {projects.map(p => (
              <div key={p.id} style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: p.color, 
                  margin: '0 auto 4px' 
                }} />
                <div style={{ fontSize: '11px', opacity: 0.6 }}>{p.name}</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{p.postsPerDay}</div>
              </div>
            ))}
          </div>

          {/* Alerts Button */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowAlerts(!showAlerts)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#fff'
              }}
            >
              🔔 Alertas
              {unreadAlerts > 0 && (
                <span style={{
                  background: '#ff6b6b',
                  color: '#fff',
                  borderRadius: '100px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontWeight: 700
                }}>
                  {unreadAlerts}
                </span>
              )}
            </button>
            
            {showAlerts && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '350px',
                background: '#1a1a2e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
                zIndex: 200
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <strong>🔔 Notificações em Tempo Real</strong>
                </div>
                {alerts.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', opacity: 0.5 }}>
                    Nenhum alerta novo
                  </div>
                ) : (
                  alerts.map(alert => (
                    <div key={alert.id} style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      background: alert.read ? 'transparent' : 'rgba(78, 220, 136, 0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ color: getStatusColor(alert.type) }}>●</span>
                        <strong style={{ fontSize: '13px' }}>{alert.title}</strong>
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>{alert.message}</div>
                      <div style={{ fontSize: '10px', opacity: 0.4 }}>
                        {new Date(alert.timestamp).toLocaleTimeString('pt-BR')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <nav style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
          {[
            { id: "overview", label: "📊 Overview", icon: "📊" },
            { id: "kanban", label: "📋 Kanban", icon: "📋" },
            { id: "schedule", label: "📅 Timeline", icon: "📅" },
            { id: "crabwalk", label: "🦀 Crabwalk", icon: "🦀" },
            { id: "architecture", label: "🏗️ Arquitetura", icon: "🏗️" },
            { id: "routines", label: "🔄 Rotinas", icon: "🔄" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === tab.id ? 'rgba(78, 220, 136, 0.15)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent)' : 'rgba(255,255,255,0.6)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main style={{ padding: '32px' }}>
        
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            
            {/* Cost Stats Card */}
            <div className="glass-card" style={{ gridColumn: 'span 2', padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>
                💰 Custos do Dia
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#4edc88' }}>R$ {costStats.today.toFixed(2)}</div>
                  <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>Hoje</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8' }}>R$ {costStats.week.toFixed(2)}</div>
                  <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>Esta Semana</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffd93d' }}>R$ {costStats.month.toFixed(2)}</div>
                  <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>Este Mês</div>
                </div>
              </div>
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '8px' }}>Por Projeto:</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {Object.entries(costStats.byProject).map(([project, cost]) => (
                    <div key={project} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ 
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: projects.find(p => p.id === project)?.color || '#fff'
                      }} />
                      <span style={{ fontSize: '12px' }}>{project}: R$ {cost.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects Overview */}
            {projects.map(project => (
              <div key={project.id} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{project.name}</h3>
                  <div style={{ 
                    width: '10px', height: '10px', borderRadius: '50%', 
                    background: project.color, boxShadow: `0 0 10px ${project.color}` 
                  }} />
                </div>
                <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '12px' }}>
                  {project.profiles.join(", ")}
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}>{project.postsPerDay}</div>
                    <div style={{ fontSize: '10px', opacity: 0.5 }}>posts/dia</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: project.color }}>
                      R$ {(project.postsPerDay * project.costPerPost).toFixed(3)}
                    </div>
                    <div style={{ fontSize: '10px', opacity: 0.5 }}>custo/dia</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Today's Schedule */}
            <div className="glass-card" style={{ gridColumn: 'span 4', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                  📅 Posts Agendados para Amanhã (2026-02-03)
                </h3>
                <span style={{ 
                  background: 'rgba(78, 220, 136, 0.15)', 
                  color: 'var(--accent)',
                  padding: '6px 12px', 
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  {mockSchedules.length} posts • R$ {(mockSchedules.reduce((a, b) => a + (b.costBrl || 0), 0)).toFixed(3)}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '12px' }}>
                {mockSchedules.slice(0, 16).map(post => (
                  <div key={post.id} style={{
                    padding: '14px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '12px',
                    borderLeft: `3px solid ${projects.find(p => p.profiles.some(pp => post.profile.includes(pp)))?.color || '#fff'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>
                      {post.profile.substring(0, 4)}
                    </div>
                    <div style={{ fontSize: '10px', opacity: 0.6 }}>{post.platform}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '8px' }}>
                      {new Date(post.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CRABWALK MONITOR */}
        {activeTab === "crabwalk" && (
          <div style={{ height: "calc(100vh - 220px)" }}>
            <CrabwalkMonitor />
          </div>
        )}

        {/* KANBAN COM DRAG & DROP */}
        {activeTab === "kanban" && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {columns.map(col => (
              <div 
                key={col.id} 
                className="glass-card" 
                style={{ padding: '16px', minHeight: '500px' }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: `2px solid ${col.color}`
                }}>
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>{col.title}</span>
                  <span style={{ 
                    background: col.color, 
                    color: '#000',
                    padding: '2px 8px',
                    borderRadius: '100px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    {tasks.filter(t => t.status === col.id).length}
                  </span>
                </div>
                
                {tasks.filter(t => t.status === col.id).map(task => (
                  <div 
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    style={{
                      padding: '14px',
                      background: draggedTask === task.id ? 'rgba(78, 220, 136, 0.1)' : 'rgba(0,0,0,0.4)',
                      borderRadius: '10px',
                      marginBottom: '10px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'grab',
                      opacity: draggedTask === task.id ? 0.5 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ 
                        fontSize: '9px',
                        background: getStatusColor(task.priority) + '22',
                        color: getStatusColor(task.priority),
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 700
                      }}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.6, lineHeight: 1.4 }}>
                      {task.description}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '10px', flexWrap: 'wrap' }}>
                      {task.labels.map(label => (
                        <span key={label} style={{
                          fontSize: '