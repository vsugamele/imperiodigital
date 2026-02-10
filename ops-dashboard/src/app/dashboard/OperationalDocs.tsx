"use client";

import { useState, useEffect } from "react";

// ==================== OPERATIONAL DOCS COMPONENT ====================

export default function OperationalDocs() {
  const [activeTab, setActiveTab] = useState<string>("overview");

  const tabs = [
    { id: "overview", label: "📊 Overview", icon: "📊" },
    { id: "objectives", label: "🎯 Objetivos", icon: "🎯" },
    { id: "produto-x", label: "📦 Produto X", icon: "📦" },
    { id: "processos", label: "⚙️ Processos", icon: "⚙️" },
    { id: "redes", label: "📱 Redes", icon: "📱" },
    { id: "kpis", label: "📈 KPIs", icon: "📈" },
  ];

  const objectives = {
    primary: [
      { title: "Infoprodutos", desc: "Cursos, mentorias, ebooks", icon: "📚", revenue: "R$50K/mês" },
      { title: "SAAS", desc: "Ferramentas e plataformas", icon: "🛠️", revenue: "R$30K/mês" },
      { title: "Perfis Sociais", desc: "TikTok, Insta, YouTube, FB", icon: "📱", revenue: "R$20K/mês" },
    ],
    secondary: [
      { title: "Facebook Dark", desc: "Monetização de páginas", icon: "📘" },
      { title: "YouTube Dark", desc: "Vídeos anônimos monetizados", icon: "📺" },
      { title: "TikTok Shop", desc: "Vendas diretas", icon: "🎵" },
      { title: "Encapsulados", desc: "Venda worldwide", icon: "🌍" },
      { title: "Dropshipping Europa", desc: "Produtos validados", icon: "🇪🇺" },
    ]
  };

  const produtoXProcess = [
    { step: "1", title: "ENTRADA", desc: "Produto X entra na esteira", color: "#4edc88" },
    { step: "2", title: "VSL", desc: "Eugene cria mecanismo único + VSL", color: "#a78bfa" },
    { step: "3", title: "VANTAGENS", desc: "Dan Kennedy define vantagens", color: "#ffd93d" },
    { step: "4", title: "BÔNUS", desc: "Gary cria bônus estratégicos", color: "#ff6b6b" },
    { step: "5", title: "PÁGINAS", desc: "Landing + Vendas + Obrigado", color: "#38bdf8" },
    { step: "6", title: "UPSELLS", desc: "Hormozi estrutura ofertas", color: "#fb923c" },
    { step: "7", title: "EMAIL", desc: "Sequência automatizada", color: "#f472b6" },
    { step: "8", title: "AUTOMAÇÃO", desc: "Todo o funil rodando", color: "#22d3ee" },
  ];

  const redesSociais = [
    { name: "TikTok", objetivo: "Viralidade", formato: "Shorts 30-60s", estrategia: "Trends + Vendas diretas" },
    { name: "Instagram", objetivo: "Autoridade", formato: "Reels + Carrosséis", estrategia: "Comunidade + Conversão" },
    { name: "YouTube", objetivo: "Authority", formato: "VSLs + Mini-cursos", estrategia: "Tráfego + Membership" },
    { name: "Pinterest", objetivo: "Tráfego", formato: "Pins de conversão", estrategia: "SEO + Links" },
    { name: "Facebook", objetivo: "Monetização", formato: "Dark posts + Grupos", estrategia: "Ads + Vendas" },
  ];

  const kpis = [
    { name: "Receita Diária", meta: "R$1.000", atual: "R$0", status: "🔴" },
    { name: "CAC", meta: "< R$50", atual: "-", status: "⚪" },
    { name: "LTV", meta: "> R$500", atual: "-", status: "⚪" },
    { name: "Conversão", meta: "> 3%", atual: "-", status: "⚪" },
    { name: "ROI Ads", meta: "> 300%", atual: "-", status: "⚪" },
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      padding: '32px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900 }}>
          🏢 <span style={{ color: 'var(--accent)' }}>OPERACIONAL</span>
        </h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.6, fontSize: '14px' }}>
          Documentação operacional do Império Digital
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === tab.id 
                ? 'rgba(78, 220, 136, 0.15)' 
                : 'rgba(255,255,255,0.03)',
              color: activeTab === tab.id 
                ? '#4edc88' 
                : 'rgba(255,255,255,0.6)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overview" && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* Missão */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800 }}>
              🎯 Missão do Império
            </h3>
            <ul style={{ padding: '0 0 0 20px', margin: 0, lineHeight: 2 }}>
              <li>Criar e vender infoprodutos</li>
              <li>Criar e vender SAAS</li>
              <li>Perfis em todas as redes sociais</li>
              <li>Monetizar através de múltiplas fontes</li>
            </ul>
          </div>

          {/* Processo Produto X */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800 }}>
              📦 Processo Produto X
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {produtoXProcess.map(p => (
                <span key={p.step} style={{
                  padding: '6px 12px',
                  background: `${p.color}22`,
                  border: `1px solid ${p.color}44`,
                  borderRadius: '6px',
                  fontSize: '11px'
                }}>
                  {p.title}
                </span>
              ))}
            </div>
          </div>

          {/* Fontes de Receita */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800 }}>
              💰 Fontes de Receita
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {objectives.primary.map(obj => (
                <div key={obj.title} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px'
                }}>
                  <div>
                    <span style={{ marginRight: '8px' }}>{obj.icon}</span>
                    <strong>{obj.title}</strong>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>{obj.desc}</div>
                  </div>
                  <span style={{ color: '#4edc88', fontWeight: 700 }}>{obj.revenue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Automation Level */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800 }}>
              🤖 Nível de Automação
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Produção</span>
                <span style={{ color: '#ffd93d' }}>80%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                <div style={{ width: '80%', height: '100%', background: '#ffd93d', borderRadius: '3px' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Distribuição</span>
                <span style={{ color: '#4edc88' }}>95%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                <div style={{ width: '95%', height: '100%', background: '#4edc88', borderRadius: '3px' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Vendas</span>
                <span style={{ color: '#a78bfa' }}>60%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                <div style={{ width: '60%', height: '100%', background: '#a78bfa', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "objectives" && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          
          {/* Primary Objectives */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 800 }}>
              🎯 Objetivos Primários
            </h3>
            {objectives.primary.map((obj, i) => (
              <div key={i} style={{
                padding: '16px',
                background: `${i === 0 ? '#4edc88' : i === 1 ? '#a78bfa' : '#ffd93d'}11`,
                border: `1px solid ${i === 0 ? '#4edc88' : i === 1 ? '#a78bfa' : '#ffd93d'}44`,
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>{obj.icon}</span>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{obj.title}</h4>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', opacity: 0.7 }}>{obj.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', opacity: 0.5 }}>Meta mensal</span>
                  <span style={{ color: '#4edc88', fontWeight: 800 }}>{obj.revenue}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Secondary Objectives */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 800 }}>
              🔄 Objetivos Secundários
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {objectives.secondary.map((obj, i) => (
                <div key={i} style={{
                  padding: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px'
                }}>
                  <span style={{ fontSize: '20px', marginRight: '8px' }}>{obj.icon}</span>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{obj.title}</div>
                  <div style={{ fontSize: '11px', opacity: 0.6 }}>{obj.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "produto-x" && (
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 800 }}>
            📦 Pipeline Produto X
          </h3>
          
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            overflowX: 'auto',
            paddingBottom: '16px'
          }}>
            {produtoXProcess.map((step, i) => (
              <div key={step.step} style={{
                minWidth: '140px',
                padding: '20px 16px',
                background: `${step.color}11`,
                border: `2px solid ${step.color}`,
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: step.color,
                  color: '#000',
                  fontWeight: 900,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto'
                }}>
                  {step.step}
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 800 }}>{step.title}</h4>
                <p style={{ margin: 0, fontSize: '11px', opacity: 0.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
          
          <div style={{ 
            marginTop: '24px', 
            padding: '16px', 
            background: 'rgba(78, 220, 136, 0.1)', 
            border: '1px solid rgba(78, 220, 136, 0.3)',
            borderRadius: '12px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 700, color: '#4edc88' }}>
              🤖 Automação Total
            </h4>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>
              Todo o pipeline está automatizado. Entrada → Processamento → Output acontece sem intervenção humana.
            </p>
          </div>
        </div>
      )}

      {activeTab === "processos" && (
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 800 }}>
            ⚙️ Processos Automatizados
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <ProcessCard 
              title="VSL Generator" 
              worker="Eugene" 
              guru="Kennedy"
              desc="Gera VSL completo a partir de inputs básicos"
              status="ready"
            />
            <ProcessCard 
              title="Landing Page" 
              worker="Alex" 
              guru="Sugarman"
              desc="Cria páginas de vendas com copy persuasivo"
              status="ready"
            />
            <ProcessCard 
              title="Email Sequence" 
              worker="Eugene" 
              guru="Halbert"
              desc="Sequências de email para cada estágio do funil"
              status="ready"
            />
            <ProcessCard 
              title="Social Posts" 
              worker="Gary" 
              guru="Fascinations"
              desc="Posts otimizados para cada rede social"
              status="ready"
            />
            <ProcessCard 
              title="Ads Copy" 
              worker="Eugene" 
              guru="Carlton"
              desc="Copys para anúncios com alto CTR"
              status="ready"
            />
            <ProcessCard 
              title="Upsell Strategy" 
              worker="Hormozi" 
              guru="Makepeace"
              desc="Estrutura de upsells e bônus"
              status="ready"
            />
          </div>
        </div>
      )}

      {activeTab === "redes" && (
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 800 }}>
            📱 Estratégias por Rede
          </h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '12px', textAlign: 'left', opacity: 0.5, fontSize: '12px' }}>REDE</th>
                <th style={{ padding: '12px', textAlign: 'left', opacity: 0.5, fontSize: '12px' }}>OBJETIVO</th>
                <th style={{ padding: '12px', textAlign: 'left', opacity: 0.5, fontSize: '12px' }}>FORMATO</th>
                <th style={{ padding: '12px', textAlign: 'left', opacity: 0.5, fontSize: '12px' }}>ESTRATÉGIA</th>
              </tr>
            </thead>
            <tbody>
              {redesSociais.map((rede, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 700 }}>{rede.name}</td>
                  <td style={{ padding: '16px 12px', fontSize: '13px' }}>{rede.objetivo}</td>
                  <td style={{ padding: '16px 12px', fontSize: '13px', opacity: 0.7 }}>{rede.formato}</td>
                  <td style={{ padding: '16px 12px', fontSize: '13px', opacity: 0.7 }}>{rede.estrategia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "kpis" && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {kpis.map((kpi, i) => (
            <div key={i} className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px' }}>{kpi.status}</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>{kpi.name}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', opacity: 0.7, marginBottom: '8px' }}>
                <span>Meta</span>
                <span>Atual</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}>
                <span style={{ color: '#4edc88' }}>{kpi.meta}</span>
                <span style={{ color: kpi.atual === 'R$0' ? '#ff6b6b' : '#ffd93d' }}>{kpi.atual}</span>
              </div>
            </div>
          ))}
        </div>
      )}

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

function ProcessCard({ title, worker, guru, desc, status }: { title: string, worker: string, guru: string, desc: string, status: string }) {
  return (
    <div style={{
      padding: '20px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{title}</h4>
        <span style={{
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '10px',
          fontWeight: 700,
          background: status === 'ready' ? 'rgba(78, 220, 136, 0.2)' : 'rgba(255, 217, 61, 0.2)',
          color: status === 'ready' ? '#4edc88' : '#ffd93d'
        }}>
          {status === 'ready' ? '✅ PRONTO' : '⏳ EM DEV'}
        </span>
      </div>
      <p style={{ margin: '0 0 16px 0', fontSize: '13px', opacity: 0.7 }}>{desc}</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '11px' }}>
          🤖 {worker}
        </span>
        <span style={{ padding: '4px 10px', background: 'rgba(167, 139, 250, 0.2)', borderRadius: '6px', fontSize: '11px', color: '#a78bfa' }}>
          🎓 {guru}
        </span>
      </div>
    </div>
  );
}
