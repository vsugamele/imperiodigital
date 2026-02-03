"use client";

import React from 'react';
import empireData from '@/lib/data/empire.json';

export default function TaskMap() {
    const { strategic_roadmap } = empireData;

    if (!strategic_roadmap) return null;

    return (
        <section className="glass-card" style={{ padding: '32px', marginTop: '20px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: 'var(--accent)' }}>🗺️</span> Mapa Estratégico (Roadmap)
                </h3>
                <p style={{ margin: '8px 0 0 0', opacity: 0.5, fontSize: '14px' }}>
                    Visão de longo prazo e progresso das fundações do Império
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {strategic_roadmap.map((section, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'var(--accent)',
                            marginBottom: '16px',
                            opacity: 0.8
                        }}>
                            {section.category}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {section.items.map((item, iIdx) => (
                                <div key={iIdx} className="glass-card" style={{
                                    padding: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: item.status === 'done' ? 'var(--accent)' : item.status === 'in_progress' ? '#ffcc00' : 'rgba(255,255,255,0.1)',
                                        boxShadow: item.status === 'done' ? '0 0 10px var(--accent)' : item.status === 'in_progress' ? '0 0 10px #ffcc00' : 'none'
                                    }}></div>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        opacity: item.status === 'done' ? 0.9 : 0.6,
                                        textDecoration: item.status === 'done' ? 'line-through' : 'none'
                                    }}>
                                        {item.task}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {idx < strategic_roadmap.length - 1 && (
                            <div style={{
                                position: 'absolute',
                                right: '-12px',
                                top: '50%',
                                width: '1px',
                                height: '40px',
                                background: 'rgba(255,255,255,0.05)',
                                display: 'none' // Hidden on mobile/auto-flow
                            }}></div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
