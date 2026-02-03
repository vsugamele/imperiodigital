"use client";

import React from 'react';

export default function OperationalManual() {
    const roles = [
        { role: 'Curadoria', resp: 'Alimentar GDrive (/no_cost/images) com fotos reais', tool: 'Google Drive' },
        { role: 'Operador de IA', resp: 'Monitorar PM2 e logs de erro do Clawdbot', tool: 'CLI / Dashboard' },
        { role: 'Head de Marketing', resp: 'Analisar métricas em MarketingSummary e ajustar agenda', tool: 'Ops Dashboard' },
        { role: 'Desenvolvedor', resp: 'Criar novas skills e otimizar scripts de vídeo', tool: 'VS Code / GitHub' }
    ];

    const actions = [
        { status: 'queued', action: 'Aguardando processamento. Nenhuma ação necessária.' },
        { status: 'scheduled', action: 'Post pronto e agendado. Monitorar se entra em pending.' },
        { status: 'status_check_failed', action: 'Erro de comunicação. Operador deve conferir no Instagram.' }
    ];

    return (
        <section className="glass-card" style={{ padding: '24px', marginTop: '20px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent)' }}>📖</span> Manual do Operador (OpenClaw)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6, marginBottom: '16px' }}>Responsabilidades do Time</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {roles.map((r, i) => (
                            <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '13px' }}>{r.role}</div>
                                <div style={{ fontSize: '12px', opacity: 0.7 }}>{r.resp}</div>
                                <div style={{ fontSize: '11px', opacity: 0.4, fontStyle: 'italic' }}>Ferramenta: {r.tool}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6, marginBottom: '16px' }}>Guia de Status & Ação</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {actions.map((a, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.02)',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ fontWeight: 800, fontSize: '12px', marginBottom: '4px' }}>
                                    Status: <span style={{ color: 'var(--accent)' }}>{a.status}</span>
                                </div>
                                <div style={{ fontSize: '12px', opacity: 0.8 }}>{a.action}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
