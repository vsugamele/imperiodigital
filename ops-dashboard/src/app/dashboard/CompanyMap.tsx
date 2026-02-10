"use client";

import { useState, useEffect } from "react";

// ==================== COMPANY MAP COMPONENT ====================

type CompanyMapProps = {
  onNavigate?: (section: string) => void;
};

type Section = {
  id: string;
  name: string;
  icon: string;
  description: string;
  components: Component[];
  color: string;
};

type Component = {
  id: string;
  name: string;
  type: "worker" | "guru" | "system" | "team";
  role?: string;
  status?: string;
  metrics?: Record<string, any>;
};

export default function CompanyMap({ onNavigate }: CompanyMapProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  // ==================== SECTIONS ====================
  
  const sections: Section[] = [
    {
      id: "core",
      name: "🧠 Cérebro Central",
      icon: "🧠",
      description: "O Alex orchestrates everything",
      color: "#4edc88",
      components: [
        { id: "alex", name: "Alex", type: "worker", role: "Autopilot & Orchestrator", status: "working" },
        { id: "security", name: "Security", type: "system", role: "Proteção contra injections" },
        { id: "autopilot", name: "Autopilot", type: "system", role: "Automação de tarefas" },
      ]
    },
    {
      id: "content",
      name: "📱 Criação de Conteúdo",
      icon: "📱",
      description: "Workers de criação e distribuição",
      color: "#ffd93d",
      components: [
        { id: "gary", name: "Gary", type: "worker", role: "Growth & Conteúdo", status: "idle" },
        { id: "eugene", name: "Eugene", type: "worker", role: "Copy & Headlines", status: "idle" },
        { id: "hormozi", name: "Hormozi", type: "worker", role: "Offers & Vendas", status: "idle" },
      ]
    },
    {
      id: "gurus",
      name: "🎓 Mestres de Copy",
      icon: "🎓",
      description: "Gurus lendários de copywriting",
      color: "#a78bfa",
      components: [
        { id: "kennedy", name: "Dan Kennedy", type: "guru", role: "Autoridade & Controle" },
        { id: "halbert", name: "Gary Halbert", type: "guru", role: "Curiosidade & Direct Mail" },
        { id: "makepeace", name: "Clayton Makepeace", type: "guru", role: "Emoção & Urgência" },
        { id: "carlton", name: "John Carlton", type: "guru", role: "Confronto & Direto" },
        { id: "sugarman", name: "Joe Sugarman", type: "guru", role: "Fluxo & VSL" },
        { id: "bencivenga", name: "Gary Bencivenga", type: "guru", role: "Prova Lógica" },
        { id: "fascinations", name: "Paulo Copy", type: "guru", role: "Fascinations" },
        { id: "yoshitani", name: "Yoshitani", type: "guru", role: "Analytics & Métricas" },
      ]
    },
    {
      id: "infrastructure",
      name: "🏗️ Infraestrutura",
      icon: "🏗️",
      description: "Sistemas e APIs",
      color: "#38bdf8",
      components: [
        { id: "api-hub", name: "API Hub", type: "system", role: "Auditoria interna" },
        { id: "worker-brain", name: "Worker Brain", type: "system", role: "Monitoramento de workers" },
        { id: "security-module", name: "Security Module", type: "system", role: "Proteção contra ataques" },
      ]
    },
    {
      id: "team",
      name: "👥 Team",
      icon: "👥",
      description: "Membros humanos",
      color: "#ff6b6b",
      components: [
        { id: "vinicius", name: "Vinicius", type: "team", role: "CEO & Estrategista" },
        { id: "admin", name: "Admin Team", type: "team", role: "Operações" },
      ]
    },
  ];

  // ==================== ALEX RULES ====================
  
  const alexRules = `
  ╔═══════════════════════════════════════════════════════════════╗
  ║                    🤖 REGRAS DO ALEX                        ║
  ╠═══════════════════════════════════════════════════════════════╣
  ║                                                               ║
  ║  🎯 MISSÃO:                                                ║
  ║  AutonomousOps - Operar sem depender do Vinicius              ║
  ║                                                               ║
  ║  📋 PRINCÍPIOS:                                            ║
  ║  1. Autonomia - Decidir sem perguntar para tarefas menores    ║
  ║  2. Eficiência - Fazer mais com menos recursos             ║
  ║  3. Segurança - Proteger contra injeções e ataques           ║
  ║  4. Qualidade - Entregar trabalho de alto nível              ║
  ║  5. Transparência - Relatar tudo que faz                    ║
  ║                                                               ║
  ║  🚫 RESTRIÇÕES:                                            ║
  ║  - Não enviar mensagens externas sem autorização             ║
  ║  - Não acessar arquivos fora do workspace                   ║
  ║  - Não executar comandos destrutivos sem confirmação        ║
  ║  - Não expor dados sensíveis em logs                       ║
  ║                                                               ║
  ║  ✅ PERMISSÕES:                                            ║
  ║  - Ler/escrever arquivos no workspace                      ║
  ║  - Executar scripts de automação                           ║
  ║  - Enviar alertas para Telegram                            ║
  ║  - Gerar relatórios e métricas                             ║
  ║  - Coordenar workers do ecossistema                        ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `;

  // ==================== WORKFLOW ====================
  
  const workflow = `
  ┌─────────────────────────────────────────────────────────────────┐
  │                    🔄 FLUXO DE TRABALHO                         │
  └─────────────────────────────────────────────────────────────────┘
  
  1️⃣  INPUT
     └─► Vinicius define tarefa ou automática (cron)
  
  2️⃣  PROCESSAMENTO  
     └─► Alex recebe e orquestra
         ├─► Se conteúdo → Gary/Eugene
         └─► Se oferta → Hormozi
             └─► Gurus são consultados para técnica
  
  3️⃣  EXECUÇÃO
     └─► Worker executa com gurus especializados
  
  4️⃣  OUTPUT
     └─► Relatório + Alerta Telegram + Dashboard
  
  5️⃣  APRENDIZADO
     └─► Brain atualiza + Metrics coletadas
  
  ───────────────────────────────────────────────────────────────
  
  💰 CUSTOS CONTROLADOS:
  • Vertex AI: no_cost (tier gratuito)
  • APIs Externas: Apenas o necessário
  • yt-dlp: 100% gratuito
  • Whisper: 100% gratuito
  `;

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      padding: '32px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }}>
          🗺️ <span style={{ color: 'var(--accent)' }}>MAPA DA EMPRESA</span>
        </h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.6, fontSize: '14px' }}>
          Entenda como o ecossistema funciona
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
            style={{
              padding: '16px 24px',
              borderRadius: '12px',
              border: 'none',
              background: activeSection === section.id 
                ? `${section.color}22` 
                : 'rgba(255,255,255,0.05)',
              color: activeSection === section.id 
                ? section.color 
                : 'rgba(255,255,255,0.6)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '20px' }}>{section.icon}</span>
            <span>{section.name}</span>
            <span style={{ 
              background: section.color,
              color: '#000',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 700
            }}>
              {section.components.length}
            </span>
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left: Company Map */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 800 }}>
            🗺️ Arquitetura do Ecossistema
          </h2>

          {/* Mind Map Visualization */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px' 
          }}>
            {/* Central Brain */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                padding: '20px 32px',
                background: 'linear-gradient(135deg, #4edc8822, #4edc8844)',
                border: '2px solid #4edc88',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧠</div>
                <div style={{ fontWeight: 800, fontSize: '16px' }}>ALEX</div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>Cérebro Central</div>
              </div>
            </div>

            {/* Connected Sections */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '12px' 
            }}>
              {sections.filter(s => s.id !== 'core').map(section => (
                <div
                  key={section.id}
                  style={{
                    padding: '16px',
                    background: `${section.color}11`,
                    border: `1px solid ${section.color}44`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setActiveSection(section.id)}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <span>{section.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>
                      {section.name}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '4px' 
                  }}>
                    {section.components.slice(0, 4).map(comp => (
                      <span key={comp.id} style={{
                        padding: '2px 8px',
                        background: `${section.color}22`,
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: section.color
                      }}>
                        {comp.name}
                      </span>
                    ))}
                    {section.components.length > 4 && (
                      <span style={{
                        padding: '2px 8px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        fontSize: '10px'
                      }}>
                        +{section.components.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Rules & Workflow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Alex Rules */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800 }}>
              🤖 Regras do Alex
            </h3>
            <pre style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '10px',
              lineHeight: 1.6,
              overflow: 'auto',
              maxHeight: '200px',
              whiteSpace: 'pre-wrap'
            }}>
              {alexRules}
            </pre>
          </div>

          {/* Workflow */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800 }}>
              🔄 Fluxo de Trabalho
            </h3>
            <pre style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '10px',
              lineHeight: 1.6,
              overflow: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {workflow}
            </pre>
          </div>
        </div>
      </div>

      {/* Expanded Section Detail */}
      {activeSection && (
        <div className="glass-card" style={{ padding: '32px', marginTop: '24px' }}>
          {(() => {
            const section = sections.find(s => s.id === activeSection);
            if (!section) return null;
            
            return (
              <>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{section.icon}</span>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>
                        {section.name}
                      </h2>
                      <p style={{ margin: '4px 0 0 0', opacity: 0.6, fontSize: '14px' }}>
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection(null)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Fechar
                  </button>
                </div>

                {/* Components Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                  gap: '16px' 
                }}>
                  {section.components.map(comp => (
                    <div
                      key={comp.id}
                      style={{
                        padding: '20px',
                        background: `${section.color}11`,
                        border: `1px solid ${section.color}44`,
                        borderRadius: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <div style={{ 
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: `${section.color}22`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px'
                        }}>
                          {comp.type === 'worker' ? '🤖' : 
                           comp.type === 'guru' ? '🎓' : 
                           comp.type === 'team' ? '👤' : '⚙️'}
                        </div>
                        {comp.status && (
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: comp.status === 'working' 
                              ? '#4edc8822' 
                              : 'rgba(255,255,255,0.1)',
                            color: comp.status === 'working' 
                              ? '#4edc88' 
                              : 'rgba(255,255,255,0.5)'
                          }}>
                            {comp.status === 'working' ? '🔄 working' : '💤 idle'}
                          </span>
                        )}
                      </div>
                      
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800 }}>
                        {comp.name}
                      </h4>
                      
                      <p style={{ margin: 0, fontSize: '13px', opacity: 0.6 }}>
                        {comp.role}
                      </p>
                      
                      <div style={{ 
                        marginTop: '12px', 
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <span style={{
                          padding: '2px 8px',
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '4px',
                          fontSize: '10px',
                          textTransform: 'capitalize'
                        }}>
                          {comp.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Stats Footer */}
      <div style={{ 
        marginTop: '40px',
        padding: '24px',
        background: 'rgba(78, 220, 136, 0.1)',
        border: '1px solid rgba(78, 220, 136, 0.3)',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#4edc88' }}>4</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>Workers</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#a78bfa' }}>8</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>Gurus</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#ffd93d' }}>3</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>Systems</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#ff6b6b' }}>2</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>Team</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#38bdf8' }}>17</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>Total Minds</div>
        </div>
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
        }
      `}</style>
    </div>
  );
}
