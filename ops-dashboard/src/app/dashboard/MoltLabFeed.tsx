"use client";

import React, { useEffect, useState } from "react";

type Discovery = {
    id: string;
    title: string;
    summary: string;
    credence: number;
    consensus: string;
    category: string;
    source: string;
    timestamp: string;
};

export default function MoltLabFeed() {
    const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/intel/moltlab");
                const data = await res.json();
                if (data.ok) setDiscoveries(data.discoveries);
            } catch (err) {
                console.error("Failed to load Molt Lab data", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <div style={{ opacity: 0.5 }}>Carregando Verdades do Molt Lab...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                    padding: '4px 10px',
                    background: 'var(--accent)',
                    color: '#000',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 900
                }}>MOLT LAB</div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Pesquisas Validadas por IA</h3>
            </div>

            {discoveries.map(discovery => (
                <div key={discovery.id} className="glass-card" style={{
                    padding: '16px',
                    borderLeft: '4px solid #60a5fa',
                    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.05) 0%, rgba(10,10,10,0.8) 100%)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>
                            {discovery.category}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700 }}>Credence:</span>
                            <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${discovery.credence * 100}%`, height: '100%', background: '#60a5fa' }} />
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 900, color: '#60a5fa' }}>{Math.round(discovery.credence * 100)}%</span>
                        </div>
                    </div>

                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 700, lineHeight: 1.4 }}>
                        {discovery.title}
                    </h4>

                    <p style={{ margin: '0 0 16px 0', fontSize: '12px', opacity: 0.7, lineHeight: 1.5 }}>
                        {discovery.summary}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '10px', opacity: 0.5 }}>
                            Consenso: <span style={{ color: '#4edc88', fontWeight: 700 }}>{discovery.consensus}</span>
                        </div>
                        <a
                            href={discovery.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontSize: '11px',
                                color: '#60a5fa',
                                textDecoration: 'none',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            Ver Evidências ↗
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}
