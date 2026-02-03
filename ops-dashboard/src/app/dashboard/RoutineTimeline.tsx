"use client";

import React, { useState } from 'react';
import empireData from '@/lib/data/empire.json';

export default function RoutineTimeline() {
    const { routines } = empireData;
    const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);

    return (
        <section className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent)' }}>📟</span> Cronograma de Rotinas Empire
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {routines.map((item, idx) => (
                    <div
                        key={idx}
                        onClick={() => setSelectedRoutine(selectedRoutine === item.task ? null : item.task)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '16px',
                            background: selectedRoutine === item.task ? 'rgba(78, 220, 136, 0.1)' : 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                            border: selectedRoutine === item.task ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                        }}
                    >
                        <div style={{
                            fontSize: '18px',
                            fontWeight: 900,
                            color: 'var(--accent)',
                            minWidth: '60px'
                        }}>
                            {item.time}
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '15px' }}>{item.task}</div>
                            <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '2px' }}>{item.project}</div>
                        </div>

                        <div style={{
                            padding: '4px 12px',
                            borderRadius: '100px',
                            fontSize: '10px',
                            fontWeight: 800,
                            background: item.status === 'active' ? 'rgba(78, 220, 136, 0.1)' : 'rgba(255,255,255,0.05)',
                            color: item.status === 'active' ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                            border: `1px solid ${item.status === 'active' ? 'rgba(78, 220, 136, 0.2)' : 'rgba(255,255,255,0.05)'}`
                        }}>
                            {item.status.toUpperCase()}
                        </div>

                        {selectedRoutine === item.task && item.flow && (
                            <div style={{
                                gridColumn: '1 / -1',
                                width: '100%',
                                marginTop: '16px',
                                padding: '16px',
                                background: 'rgba(0,0,0,0.4)',
                                borderRadius: '8px',
                                border: '1px solid rgba(78, 220, 136, 0.2)',
                                zIndex: 10
                            }}>
                                <div style={{ fontSize: '11px', fontWeight: 800, marginBottom: '10px', opacity: 0.6, textTransform: 'uppercase' }}>Fluxo de Execução:</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {item.flow.map((step: string, sIdx: number) => (
                                        <div key={sIdx} style={{ fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                                            {step}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {selectedRoutine && (
                <div style={{ marginTop: '12px', fontSize: '11px', opacity: 0.5, textAlign: 'center' }}>
                    Aperte no job para recolher os detalhes
                </div>
            )}
        </section>
    );
}
