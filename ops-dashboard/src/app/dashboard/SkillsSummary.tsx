"use client";

import React, { useState, useEffect } from 'react';

// Static skills catalog
const STATIC_SKILLS = [
  { name: "Alex Core", type: "orchestration", desc: "Cérebro orquestrador", icon: "🧠" },
  { name: "iGaming Engine", type: "production", desc: "Geração de vídeos 4K", icon: "🎰" },
  { name: "PetSelect UK", type: "curation", desc: "Curadoria viral pet", icon: "🐾" },
  { name: "Upload-Post API", type: "distribution", desc: "Postagem automática", icon: "📤" },
  { name: "ElevenLabs TTS", type: "audio", desc: "Narração ultra-realista", icon: "🎙️" },
  { name: "Gemini Vision", type: "analysis", desc: "Análise de imagens", icon: "👁️" },
  { name: "FFmpeg Engine", type: "production", desc: "Processamento vídeo", icon: "🎬" },
  { name: "Marketing Ledger", type: "analytics", desc: "Tracking de gastos", icon: "📊" }
];

const typeColors: Record<string, string> = {
  orchestration: "#a855f7",
  production: "#ffd93d",
  curation: "#60a5fa",
  distribution: "#4edc88",
  audio: "#f472b6",
  analysis: "#fb923c",
  analytics: "#818cf8"
};

type LiveSkill = {
  name: string;
  files: string[];
  updatedAtMs: number;
};

export default function SkillsSummary() {
  const [showLive, setShowLive] = useState(false);
  const [liveSkills, setLiveSkills] = useState<LiveSkill[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  // Load live skills when tab is clicked
  useEffect(() => {
    if (!showLive) return;

    let mounted = true;

    // Use a small timeout or state guard if needed, but here we just ensure we set loading
    setLiveLoading(true);

    fetch("/api/skills", { cache: "no-store" })
      .then(res => res.ok ? res.json() : { ok: false })
      .then(data => {
        if (mounted && data.ok && data.skills) {
          setLiveSkills(data.skills);
        }
      })
      .catch(() => { })
      .finally(() => {
        if (mounted) setLiveLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [showLive]);

  // Determine which skills to show
  const displaySkills = showLive && liveSkills.length > 0
    ? liveSkills.map(s => ({
      name: s.name,
      type: "clawdbot",
      desc: `${s.files.length} arquivo(s)`,
      icon: "🦞",
      isLive: true
    }))
    : STATIC_SKILLS.map(s => ({ ...s, isLive: false }));

  return (
    <section className="glass-card" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent)' }}>⚡</span>
          Skills
          <span style={{
            fontSize: '10px',
            background: 'rgba(78, 220, 136, 0.1)',
            color: '#4edc88',
            padding: '2px 8px',
            borderRadius: '10px',
            fontWeight: 700
          }}>
            {displaySkills.length}
          </span>
        </h3>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setShowLive(false)}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: 'none',
              background: !showLive ? 'rgba(78, 220, 136, 0.15)' : 'rgba(255,255,255,0.05)',
              color: !showLive ? '#4edc88' : '#888',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            📋 Catálogo
          </button>
          <button
            type="button"
            onClick={() => setShowLive(true)}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: 'none',
              background: showLive ? 'rgba(78, 220, 136, 0.15)' : 'rgba(255,255,255,0.05)',
              color: showLive ? '#4edc88' : '#888',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🦞 Live
          </button>
        </div>
      </div>

      {/* Loading state for live */}
      {showLive && liveLoading && (
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '10px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '12px'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>
            🦞 Carregando skills do ClawdBot...
          </div>
        </div>
      )}

      {/* Empty state for live */}
      {showLive && !liveLoading && liveSkills.length === 0 && (
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '10px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '12px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🦞</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>
            Nenhuma skill live encontrada
          </div>
          <div style={{ fontSize: '10px', opacity: 0.4, marginTop: '4px' }}>
            Verifique a API /api/skills
          </div>
        </div>
      )}

      {/* Skills Grid */}
      {!(showLive && liveLoading) && !(showLive && liveSkills.length === 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
          {displaySkills.map((skill, i) => {
            const color = skill.isLive ? '#4edc88' : (typeColors[skill.type] || '#6b7280');

            return (
              <div key={i} style={{
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.02)',
                borderLeft: `3px solid ${color}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px' }}>{skill.icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: color }}>
                    {skill.name}
                  </span>
                </div>
                <p style={{ fontSize: '9px', opacity: 0.5, margin: 0, lineHeight: 1.3 }}>
                  {skill.desc}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
