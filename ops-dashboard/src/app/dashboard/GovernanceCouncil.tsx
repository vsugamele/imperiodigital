"use client";

import React, { useState } from "react";

type Deliberation = {
    role: string;
    agent: string;
    status: string;
    rationale: string;
    score: number;
};

type CouncilState = {
    projectName: string;
    status: string;
    consensusScore: number;
    deliberations: Deliberation[];
};

export default function GovernanceCouncil() {
    const [deliberation, setDeliberation] = useState<CouncilState | null>(null);
    const [loading, setLoading] = useState(false);

    const startReview = async (name: string) => {
        setLoading(true);
        try {
            const res = await fetch("/api/governance/council", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId: "demo", projectName: name })
            });
            const data = await res.json();
            if (data.ok) setDeliberation(data);
        } catch (err) {
            console.error("Governance review failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>⚖️</span> Conselho de Governança Agentica
                    </h3>
                    <p style={{ fontSize: '11px', opacity: 0.5, marginTop: '4px' }}>Avaliação multi-agente de projetos e decisões</p>
                </div>
                {!deliberation && !loading && (
                    <button
                        onClick={() => startReview("Pipeline VaaS v2")}
                        className="glass-card"
                        style={{
                            padding: '8px 16px',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: 'var(--accent)',
                            color: '#000',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Simular Auditoria
                    </button>
                )}
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>Os Agentes estão deliberando... ⏳</div>}

            {deliberation && (
                <div style={{ animation: 'fadeIn 0.5s ease' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div>
                            <div style={{ fontSize: '10px', opacity: 0.5, textTransform: 'uppercase' }}>PROJETO EM PAUTA</div>
                            <div style={{ fontSize: '16px', fontWeight: 800 }}>{deliberation.projectName}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 900, color: deliberation.consensusScore > 80 ? '#4edc88' : '#fbbf24' }}>
                                {deliberation.consensusScore}%
                            </div>
                            <div style={{ fontSize: '9px', fontWeight: 800 }}>CONSENSO</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                padding: '4px 12px',
                                borderRadius: '100px',
                                background: deliberation.status === 'Approved' ? 'rgba(78, 220, 136, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                                color: deliberation.status === 'Approved' ? '#4edc88' : '#fbbf24',
                                fontSize: '11px',
                                fontWeight: 800
                            }}>
                                {deliberation.status.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {deliberation.deliberations.map((d, i) => (
                            <div key={i} style={{
                                padding: '16px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '12px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontWeight: 800, fontSize: '13px' }}>{d.role}</span>
                                        <span style={{ fontSize: '10px', opacity: 0.4 }}>via {d.agent}</span>
                                    </div>
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        color: d.status === 'Approved' ? '#4edc88' : '#fb6b6b'
                                    }}>{d.status}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '12px', opacity: 0.7, lineHeight: 1.5, fontStyle: 'italic' }}>
                                    &quot;{d.rationale}&quot;
                                </p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setDeliberation(null)}
                        style={{
                            marginTop: '20px',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            opacity: 0.3,
                            fontSize: '11px',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        Limpar Ata da Reunião
                    </button>
                </div>
            )}
        </section>
    );
}
