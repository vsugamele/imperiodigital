"use client";

import React, { useState, useRef, useCallback } from 'react';

// Static architecture data embedded directly
const architectureData = {
    nodes: [
        { id: "alex_core", label: "Alex (Clawdbot)", type: "agent", desc: "Cérebro orquestrador. Gerencia decisões e logs." },
        { id: "igaming_engine", label: "iGaming Vertical", type: "module", desc: "Motor de geração de conteúdo apostas." },
        { id: "vaas_module", label: "VaaS (Posting)", type: "module", desc: "Automação de upload social." },
        { id: "petselect_engine", label: "PetSelect UK", type: "module", desc: "Curadoria conteúdo viral pet." },
        { id: "supabase_db", label: "Supabase (Infra)", type: "database", desc: "Nuvem de dados e Kanban." },
        { id: "elevenlabs_tts", label: "ElevenLabs API", type: "external", desc: "Narração ultra-realista." }
    ],
    edges: [
        { from: "alex_core", to: "igaming_engine" },
        { from: "alex_core", to: "vaas_module" },
        { from: "alex_core", to: "petselect_engine" },
        { from: "igaming_engine", to: "elevenlabs_tts" },
        { from: "vaas_module", to: "supabase_db" },
        { from: "alex_core", to: "supabase_db" }
    ]
};

const nodeTypeColors: Record<string, string> = {
    agent: "#4edc88",
    module: "#60a5fa",
    database: "#a855f7",
    external: "#ffd93d"
};

const nodeTypeIcons: Record<string, string> = {
    agent: "🧠",
    module: "📦",
    database: "🗄️",
    external: "🌐"
};

export default function ArchitectureMap() {
    const [viewMode, setViewMode] = useState<'cards' | 'flow'>('cards');
    const [exporting, setExporting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const nodes = architectureData.nodes;
    const edges = architectureData.edges;

    // Export architecture as PNG
    const handleExport = useCallback(async () => {
        if (!containerRef.current || exporting) return;

        setExporting(true);
        try {
            // Dynamic import html2canvas
            const html2canvas = (await import('html2canvas')).default;

            const canvas = await html2canvas(containerRef.current, {
                backgroundColor: '#0a0a0a',
                scale: 2,
                logging: false
            });

            const link = document.createElement('a');
            link.download = `architecture_${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Export failed:', error);
            // Fallback: copy SVG-like representation
            alert('Para exportar PNG, instale: npm install html2canvas');
        } finally {
            setExporting(false);
        }
    }, [exporting]);

    // Group nodes by type
    const agents = nodes.filter(n => n.type === 'agent');
    const modules = nodes.filter(n => n.type === 'module');
    const databases = nodes.filter(n => n.type === 'database');
    const externals = nodes.filter(n => n.type === 'external');

    return (
        <section ref={containerRef} className="glass-card" style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--accent)' }}>🏗️</span>
                    Arquitetura do Sistema
                </h3>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        type="button"
                        onClick={() => setViewMode('cards')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: viewMode === 'cards' ? 'rgba(78, 220, 136, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: viewMode === 'cards' ? '#4edc88' : '#888',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        📦 Cards
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('flow')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: viewMode === 'flow' ? 'rgba(78, 220, 136, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: viewMode === 'flow' ? '#4edc88' : '#888',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Fluxo
                    </button>
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={exporting}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'rgba(167, 139, 250, 0.2)',
                            color: '#a78bfa',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: exporting ? 'wait' : 'pointer',
                            opacity: exporting ? 0.6 : 1
                        }}
                    >
                        {exporting ? '⏳ Exportando...' : '📷 Export PNG'}
                    </button>
                </div>
            </div>

            {/* Cards View */}
            {viewMode === 'cards' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    {nodes.map((node) => {
                        const color = nodeTypeColors[node.type] || '#6b7280';
                        const icon = nodeTypeIcons[node.type] || '📦';

                        return (
                            <div key={node.id} style={{
                                padding: '12px',
                                borderRadius: '10px',
                                background: 'rgba(255,255,255,0.02)',
                                borderLeft: `3px solid ${color}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                    <span>{icon}</span>
                                    <span style={{ fontSize: '9px', textTransform: 'uppercase', color: color, fontWeight: 700 }}>
                                        {node.type}
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 700 }}>{node.label}</div>
                                <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '4px', lineHeight: 1.3 }}>
                                    {node.desc}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Flow View */}
            {viewMode === 'flow' && (
                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '12px',
                    padding: '20px'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Control Plane */}
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#4edc88', marginBottom: '8px', textTransform: 'uppercase' }}>
                                🎮 Control Plane
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {agents.map(node => (
                                    <div key={node.id} style={{
                                        padding: '10px 14px',
                                        background: 'rgba(78, 220, 136, 0.1)',
                                        border: '1px solid rgba(78, 220, 136, 0.3)',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        fontWeight: 600
                                    }}>
                                        🧠 {node.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', fontSize: '18px', opacity: 0.3 }}>↓</div>

                        {/* Processing */}
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#60a5fa', marginBottom: '8px', textTransform: 'uppercase' }}>
                                ⚙️ Processing Modules
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {modules.map(node => (
                                    <div key={node.id} style={{
                                        padding: '10px 14px',
                                        background: 'rgba(96, 165, 250, 0.1)',
                                        border: '1px solid rgba(96, 165, 250, 0.3)',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        fontWeight: 600
                                    }}>
                                        📦 {node.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', fontSize: '18px', opacity: 0.3 }}>↓</div>

                        {/* External & Storage */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: '#a855f7', marginBottom: '8px', textTransform: 'uppercase' }}>
                                    🗄️ Storage
                                </div>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {databases.map(node => (
                                        <div key={node.id} style={{
                                            padding: '10px 14px',
                                            background: 'rgba(168, 85, 247, 0.1)',
                                            border: '1px solid rgba(168, 85, 247, 0.3)',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            fontWeight: 600
                                        }}>
                                            🗄️ {node.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: '#ffd93d', marginBottom: '8px', textTransform: 'uppercase' }}>
                                    🌐 External APIs
                                </div>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {externals.map(node => (
                                        <div key={node.id} style={{
                                            padding: '10px 14px',
                                            background: 'rgba(255, 217, 61, 0.1)',
                                            border: '1px solid rgba(255, 217, 61, 0.3)',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            fontWeight: 600
                                        }}>
                                            🌐 {node.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Connections */}
            <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, opacity: 0.4, marginBottom: '8px', textTransform: 'uppercase' }}>
                    Conexões
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {edges.slice(0, 6).map((edge, i) => (
                        <span key={i} style={{
                            background: 'rgba(78, 220, 136, 0.08)',
                            color: 'var(--accent)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '9px',
                            fontWeight: 600
                        }}>
                            {edge.from} → {edge.to}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
