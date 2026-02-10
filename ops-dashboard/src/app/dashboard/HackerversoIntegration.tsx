"use client";

import React, { useState } from "react";

interface HackerversoTool {
  id: string;
  name: string;
  description: string;
  category: string;
  passo?: number;
  icon: string;
  priority: "high" | "medium" | "low";
}

export default function HackerversoIntegration() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const tools: HackerversoTool[] = [
    // ALGORITMO DA ESCALA
    { id: "passo1", name: "Multidão Faminta", description: "Defina o avatar completo do seu cliente ideal", category: "avatar", passo: 1, icon: "👥", priority: "high" },
    { id: "passo2", name: "Descobridor de Problemas", description: "Mapeie todas as dores do avatar", category: "problemas", passo: 2, icon: "😖", priority: "high" },
    { id: "passo3", name: "O LAGO", description: "Identifique sub-mercados e nichos", category: "mercado", passo: 3, icon: "🎯", priority: "medium" },
    { id: "passo4", name: "Falhas do Concorrente", description: "Encontre gaps no mercado atual", category: "concorrentes", passo: 4, icon: "🔍", priority: "medium" },
    { id: "passo5", name: "Mecanismo Diferente", description: "Crie diferenciação única", category: "diferenciacao", passo: 5, icon: "⚡", priority: "medium" },
    { id: "passo6", name: "Escada de Valor", description: "Estruture produtos em escada", category: "oferta", passo: 6, icon: "📈", priority: "high" },
    { id: "passo7", name: "Brainstorming de Oferta", description: "Crie oferta multi-milionária", category: "oferta", passo: 7, icon: "💡", priority: "high" },
    { id: "passo8", name: "Oferta Lowticket", description: "Crie produto de porta de entrada", category: "oferta", passo: 8, icon: "🚪", priority: "high" },
    
    // FERRAMENTAS AVANÇADAS
    { id: "avatar-avancado", name: "Estudo Avançado do Avatar", description: "Análise psicológica completa", category: "avatar", icon: "🧠", priority: "medium" },
    { id: "avatar-trauma", name: "Resumo Psicológico - TRAUMA", description: "Identifique gatilhos emocionais", category: "avatar", icon: "💔", priority: "medium" },
    { id: "vsl-hacker", name: "VSL Hacker", description: "Gere script completo de VSL", category: "copy", icon: "🎬", priority: "high" },
    { id: "upsell-script", name: "Script de Upsell", description: "Gere copy para vídeos de upsell", category: "copy", icon: "⬆️", priority: "medium" },
    { id: "orderbump-copy", name: "Copy de Orderbump", description: "Gere copy para orderbump", category: "copy", icon: "🛒", priority: "medium" },
  ];

  const categories = [
    { id: "avatar", name: "🎯 Avatar", color: "#3B82F6" },
    { id: "problemas", name: "😖 Problemas", color: "#EF4444" },
    { id: "mercado", name: "🎪 Mercado", color: "#F59E0B" },
    { id: "concorrentes", name: "⚔️ Concorrentes", color: "#A855F7" },
    { id: "diferenciacao", name: "✨ Diferenciação", color: "#4EDC88" },
    { id: "oferta", name: "💰 Oferta", color: "#22C55E" },
    { id: "copy", name: "📝 Copy", color: "#EC4899" },
  ];

  const openHackerverso = (tool: HackerversoTool) => {
    // Em produção, abriria diretamente a ferramenta no Hackerverso
    window.open(`https://app.hackerverso.com/${tool.id}`, '_blank');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "#EF4444";
      case "medium": return "#F59E0B";
      case "low": return "#4EDC88";
      default: return "#fff";
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)',
      padding: '32px',
      color: '#fff',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <span style={{ fontSize: '40px' }}>🧠</span>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }}>
            HACKERVERSO <span style={{ color: '#4EDC88' }}>INTEGRATION</span>
          </h1>
        </div>
        <p style={{ margin: 0, opacity: 0.6, fontSize: '14px' }}>
          Ferramentas do Algoritmo da Esaca integradas ao Command Center
        </p>
      </div>

      {/* Quick Access */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
        {[
          { title: "🎯 Criar Avatar", desc: "Defina seu cliente ideal", href: "https://app.hackerverso.com/passo-1-multidao-faminta" },
          { title: "💰 Criar Oferta", desc: "Monte escada de valor", href: "https://app.hackerverso.com/passo-8-criador-de-oferta-de-lowticket" },
          { title: "🎬 VSL Hacker", desc: "Gere script de VSL", href: "https://app.hackerverso.com/vsl-hacker" },
        ].map((item, i) => (
          <a 
            key={i}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(78, 220, 136, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(78, 220, 136, 0.2)',
              textDecoration: 'none',
              color: '#fff',
              transition: 'transform 0.2s',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{item.title}</div>
            <div style={{ fontSize: '13px', opacity: 0.6 }}>{item.desc}</div>
          </a>
        ))}
      </div>

      {/* Algorithm Steps */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 700 }}>
          📈 ALGORITMO DA ESCALA (8 Passos)
        </h2>
        
        {/* Progress */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: '8px', borderRadius: '4px', background: i < 8 ? 'linear-gradient(90deg, #F59E0B, #EF4444)' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {tools.filter(t => t.passo).map(tool => (
            <button
              key={tool.id}
              onClick={() => openHackerverso(tool)}
              style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>{tool.icon}</span>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  background: `linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 900
                }}>
                  {tool.passo}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{tool.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.6 }}>{tool.description}</div>
              <div style={{ 
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: getPriorityColor(tool.priority)
              }} />
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Tools */}
      <div>
        <h2 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 700 }}>
          ⚡ FERRAMENTAS AVANÇADAS
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {tools.filter(t => !t.passo).map(tool => (
            <button
              key={tool.id}
              onClick={() => openHackerverso(tool)}
              style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>{tool.icon}</span>
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  background: `${getPriorityColor(tool.priority)}20`,
                  color: getPriorityColor(tool.priority),
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {tool.priority === 'high' ? 'ALTA' : tool.priority === 'medium' ? 'MÉDIA' : 'BAIXA'}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{tool.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.6 }}>{tool.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Workflow */}
      <div style={{ marginTop: '48px', padding: '24px', background: 'rgba(78, 220, 136, 0.05)', borderRadius: '16px', border: '1px solid rgba(78, 220, 136, 0.1)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>
          🔄 FLUXO RECOMENDADO
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ padding: '8px 16px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '8px', fontSize: '13px' }}>PASSO 1: Avatar</span>
          <span style={{ color: '#F59E0B' }}>→</span>
          <span style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontSize: '13px' }}>PASSO 2: Problemas</span>
          <span style={{ color: '#F59E0B' }}>→</span>
          <span style={{ padding: '8px 16px', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '8px', fontSize: '13px' }}>PASSO 3-5: Análise</span>
          <span style={{ color: '#F59E0B' }}>→</span>
          <span style={{ padding: '8px 16px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '8px', fontSize: '13px' }}>PASSO 6-8: Oferta</span>
          <span style={{ color: '#F59E0B' }}>→</span>
          <span style={{ padding: '8px 16px', background: 'rgba(236, 72, 153, 0.2)', borderRadius: '8px', fontSize: '13px' }}>VSL Hacker</span>
        </div>
      </div>

      {/* Open Hackerverso */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <a 
          href="https://app.hackerverso.com/VMVNL4W3H5"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #4EDC88 0%, #22C55E 100%)',
            borderRadius: '12px',
            color: '#000',
            fontSize: '16px',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          🚀 ABRIR HACKERVERSO COMPLETO
        </a>
      </div>
    </div>
  );
}
