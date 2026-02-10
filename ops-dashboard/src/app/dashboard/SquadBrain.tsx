"use client";

import React from "react";

export default function SquadBrain() {
  const agents = [
    { name: "MIDAS", archetype: "The Commander", role: "Squad Lead", icon: "👑", color: "#F59E0B" },
    { name: "DASH", archetype: "The Analyzer", role: "Performance Analyst", icon: "📊", color: "#A855F7" },
    { name: "NOVA", archetype: "The Creator", role: "Creative Analyst", icon: "✨", color: "#3B82F6" },
    { name: "TRACK", archetype: "The Tracker", role: "Pixel Specialist", icon: "🎯", color: "#4EDC88" },
  ];

  const thresholds = [
    { metric: "ROAS", kill: "<1.0", warning: "1.0-2.0", scale: ">2.5", killColor: "#EF4444" },
    { metric: "CPA", kill: ">2x target", warning: ">1.5x", scale: "<target", killColor: "#EF4444" },
    { metric: "CTR", kill: "<0.5%", warning: "0.5-1%", scale: ">2%", killColor: "#EF4444" },
    { metric: "Frequência", kill: ">4", warning: ">3", scale: "<2", killColor: "#EF4444" },
  ];

  const hookCategories = [
    { category: "PROBLEMA", when: "Dor intensa", example: "Você está cansado de..." },
    { category: "RESULTADO", when: "Promessa clara", example: "Ganhe R$1000/semana" },
    { category: "CURIOSIDADE", when: "Mistério", example: "O segredo que..." },
    { category: "CONTROVERSIA", when: "Polarizar", example: "Você está errado se..." },
    { category: "PROVA SOCIAL", when: "Validação", example: "1000 pessoas já..." },
    { category: "TUTORIAL", when: "Educação", example: "Aprenda em 3 passos..." },
  ];

  const workflows = {
    launch: [
      { step: "1", action: "Valida modelo de negócio", cmd: "unit-economics" },
      { step: "2", action: "Escolhe estratégia", cmd: "funnel-selection" },
      { step: "3", action: "Arquiteta campanha", cmd: "campaign-structure" },
      { step: "4", action: "Cria brief", cmd: "@creative-analyst" },
    ],
    optimization: [
      { step: "1", action: "Diagnóstico de métricas", cmd: "@performance-analyst" },
      { step: "2", action: "Aplica kill/scale rules", cmd: "@performance-analyst" },
      { step: "3", action: "Realoca budget", cmd: "@performance-analyst" },
    ]
  };

  const frameworks = [
    { name: "Jeremy Haynes", percent: 60, items: ["DSL Revolution", "CBO vs ABO", "Kill/Scale Rules"] },
    { name: "Brian Moncada", percent: 21, items: ["Andromeda Method", "Metric Thresholds"] },
    { name: "Alex Hormozi", percent: 11, items: ["Unit Economics", "LTV/CAC Ratio"] },
    { name: "Brandon Carter", percent: 6, items: ["Hook Testing"] },
    { name: "Jordan Stupar", percent: 2, items: ["Creative Strategy"] },
  ];

  const commands = [
    { cmd: "#audit", desc: "Auditoria completa de tracking" },
    { cmd: "#diagnose", desc: "Diagnóstico de métricas" },
    { cmd: "#kill-scale", desc: "Aplica regras kill/scale" },
    { cmd: "#budget", desc: "Otimiza alocação de budget" },
  ];

  const skills = {
    STRATEGIC: ["Campaign Structure", "Funnel Selection", "Scale Readiness", "Unit Economics"],
    DIAGNOSTIC: ["Metric Diagnosis", "Tracking Audit", "Funnel Analysis", "Attribution"],
    GENERATIVE: ["Hook Generator", "Creative Brief", "Copy Generator", "DSL Structure"],
    OPTIMIZATION: ["Kill/Scale Rules", "Budget Allocation", "Audience Expansion"],
    AUTOMATION: ["Campaign Monitor"],
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)',
      padding: '32px',
      color: '#fff',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }}>
        SQUAD <span style={{ color: '#4EDC88' }}>INTELLIGENCE</span>
      </h1>
      <p style={{ margin: '8px 0 32px', opacity: 0.6 }}>
        18 Skills • 47 Frameworks • 4 Agentes de IA
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* AGENTS HIERARCHY */}
        <div style={{ gridColumn: 'span 2', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '24px' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '20px' }}>🤖 HIERARQUIA DOS AGENTES</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '24px', fontSize: '11px' }}>
            <span style={{ color: '#4EDC88' }}>MIDAS define</span>
            <span>→</span>
            <span style={{ color: '#4EDC88' }}>TRACK configura</span>
            <span>→</span>
            <span style={{ color: '#4EDC88' }}>NOVA cria</span>
            <span>→</span>
            <span style={{ color: '#F59E0B' }}>MIDAS lança</span>
            <span>→</span>
            <span style={{ color: '#A855F7' }}>DASH monitora</span>
            <span>→</span>
            <span style={{ color: '#F59E0B' }}>MIDAS escala</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {agents.map(agent => (
              <div key={agent.name} style={{ padding: '16px', background: `${agent.color}10`, borderRadius: '12px', border: `1px solid ${agent.color}30`, textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{agent.icon}</div>
                <div style={{ fontWeight: 700, color: agent.color }}>{agent.name}</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>{agent.archetype}</div>
                <div style={{ fontSize: '12px', opacity: 0.5 }}>{agent.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* WORKFLOW CHAINS */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '20px' }}>🔄 SKILL CHAINS</h2>
          
          <div style={{ marginBottom: '24px' }}>
            <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(78, 220, 136, 0.2)', color: '#4EDC88', fontSize: '12px', fontWeight: 700 }}>NEW CAMPAIGN</span>
            {workflows.launch.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginTop: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>{w.step}</div>
                <div style={{ flex: 1, fontSize: '13px' }}>{w.action}</div>
                <code style={{ background: w.cmd.includes('@') ? 'rgba(168, 85, 247, 0.2)' : 'rgba(59, 130, 246, 0.2)', color: w.cmd.includes('@') ? '#A855F7' : '#3B82F6', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>{w.cmd}</code>
              </div>
            ))}
          </div>

          <div>
            <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', fontSize: '12px', fontWeight: 700 }}>OPTIMIZATION</span>
            {workflows.optimization.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginTop: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>{w.step}</div>
                <div style={{ flex: 1, fontSize: '13px' }}>{w.action}</div>
                <code style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#A855F7', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>{w.cmd}</code>
              </div>
            ))}
          </div>
        </div>

        {/* THRESHOLDS */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '20px' }}>📊 THRESHOLDS</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 70px', gap: '8px', marginBottom: '8px', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '11px', fontWeight: 700, opacity: 0.6 }}>
            <div>MÉTRICA</div>
            <div style={{ color: '#EF4444', textAlign: 'center' }}>KILL</div>
            <div style={{ color: '#F59E0B', textAlign: 'center' }}>WARN</div>
            <div style={{ color: '#4EDC88', textAlign: 'center' }}>SCALE</div>
          </div>
          {thresholds.map((t, idx) => (
            <div key={`${t.metric}-${idx}`} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 70px', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '8px', borderLeft: `3px solid ${t.killColor}`, fontSize: '12px' }}>
              <div style={{ fontWeight: 600 }}>{t.metric}</div>
              <div style={{ color: '#EF4444', textAlign: 'center' }}>{t.kill}</div>
              <div style={{ color: '#F59E0B', textAlign: 'center' }}>{t.warning}</div>
              <div style={{ color: '#4EDC88', textAlign: 'center' }}>{t.scale}</div>
            </div>
          ))}
        </div>

        {/* HOOK CATEGORIES */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '20px' }}>🎯 HOOKS (0-3s)</h2>
          <p style={{ margin: '0 0 16px', opacity: 0.6, fontSize: '13px' }}>Os 3 primeiros segundos determinam tudo!</p>
          {hookCategories.map(h => (
            <div key={h.category} style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#3B82F6', fontSize: '13px' }}>{h.category}</span>
                <span style={{ fontSize: '11px', opacity: 0.6 }}>{h.when}</span>
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, fontStyle: 'italic' }}>&ldquo;{h.example}&rdquo;</div>
            </div>
          ))}
        </div>

        {/* COMMANDS */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '20px' }}>💻 COMANDOS</h2>
          {commands.map(c => (
            <div key={c.cmd} style={{ padding: '14px', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
              <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(168, 85, 257, 0.2)', borderRadius: '4px', fontSize: '14px', fontWeight: 700, color: '#A855F7', marginBottom: '6px' }}>{c.cmd}</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* FRAMEWORKS */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '20px' }}>🎓 47 FRAMEWORKS</h2>
          {frameworks.map(f => (
            <div key={f.name} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{f.name}</span>
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', fontSize: '12px', fontWeight: 600 }}>{f.percent}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${f.percent}%`, height: '100%', background: 'linear-gradient(90deg, #F59E0B, #EF4444)', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>

        {/* SKILLS */}
        <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '20px' }}>🎯 18 SKILLS</h2>
          {Object.entries(skills).map(([cat, list]) => (
            <div key={cat} style={{ marginBottom: '20px' }}>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: cat === 'STRATEGIC' ? 'rgba(78, 220, 136, 0.2)' : cat === 'DIAGNOSTIC' ? 'rgba(59, 130, 246, 0.2)' : cat === 'GENERATIVE' ? 'rgba(168, 85, 257, 0.2)' : cat === 'OPTIMIZATION' ? 'rgba(251, 146, 60, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: cat === 'STRATEGIC' ? '#4EDC88' : cat === 'DIAGNOSTIC' ? '#3B82F6' : cat === 'GENERATIVE' ? '#A855F7' : cat === 'OPTIMIZATION' ? '#FB923C' : '#EF4444' }}>{cat}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {list.map((s, i) => (
                  <span key={i} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '12px' }}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
