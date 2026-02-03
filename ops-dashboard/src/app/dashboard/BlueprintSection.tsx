"use client";

import React, { useState } from 'react';
import empireData from '@/lib/data/empire.json';

export default function BlueprintSection() {
    const [isOpen, setIsOpen] = useState(true);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    const projects = empireData.projects as Array<{
        name: string;
        status: string;
        cost: string;
        blueprint: string;
        stack: string[];
        flow?: string[];
    }>;

    return (
        <section className="glass-card" style={{ padding: '24px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: isOpen ? '24px' : '0' }} onClick={() => setIsOpen(!isOpen)}>
                <h3 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--accent)' }}>🗺️</span> Diretivas de Operação & Blueprints
                </h3>
                <span style={{ fontSize: '20px', color: 'var(--accent)' }}>{isOpen ? '−' : '+'}</span>
            </div>

            {isOpen && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                    {projects.map((p, i) => (
                        <div
                            key={i}
                            className="glass-card"
                            style={{
                                padding: '20px',
                                background: 'rgba(255,255,255,0.02)',
                                border: selectedProject === p.name ? '2px solid var(--accent)' : '1px solid var(--card-border)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => setSelectedProject(selectedProject === p.name ? null : p.name)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                <h4 style={{ margin: 0, color: 'var(--accent)', fontWeight: 800 }}>{p.name}</h4>
                                <span style={{ fontSize: '10px', background: 'rgba(78, 220, 136, 0.1)', padding: '2px 6px', borderRadius: '4px', opacity: 0.8 }}>
                                    {p.status}
                                </span>
                            </div>
                            <p style={{ fontSize: '13px', color: '#ccc', margin: '0 0 8px 0', lineHeight: 1.5 }}>{p.blueprint.slice(0, 100)}...</p>

                            {selectedProject === p.name && (
                                <div style={{ marginTop: '16px', borderTop: '1px solid var(--card-border)', paddingTop: '16px', animation: 'fadeIn 0.3s ease' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>DETALHES DO BLUEPRINT:</div>
                                    <p style={{ fontSize: '13px', color: '#fff', marginBottom: '12px' }}>{p.blueprint}</p>

                                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>STACK TÉCNICA:</div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {p.stack.map(s => (
                                            <span key={s} style={{ fontSize: '11px', background: '#222', padding: '2px 8px', borderRadius: '4px' }}>{s}</span>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                                        Custo Base: {p.cost}
                                    </div>

                                    {p.flow && (
                                        <div style={{ marginTop: '20px', background: 'rgba(78, 220, 136, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(78, 220, 136, 0.1)' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px', textTransform: 'uppercase' }}>Fluxo de Operação (Core):</div>
                                            {p.flow.map((step, idx) => (
                                                <div key={idx} style={{ fontSize: '12px', color: '#eee', marginBottom: '4px', display: 'flex', gap: '8px' }}>
                                                    <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{idx + 1}.</span>
                                                    <span>{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
}
