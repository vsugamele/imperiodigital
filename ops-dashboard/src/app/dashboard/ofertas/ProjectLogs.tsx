"use client";

import { Oferta } from './types';

interface ProjectLogsProps {
    oferta: Oferta;
}

export default function ProjectLogs({ oferta }: ProjectLogsProps) {
    const logs = oferta.status.logs || [];

    const getLogType = (msg: string) => {
        if (msg.startsWith('✅') || msg.includes('concluíd')) return 'success';
        if (msg.startsWith('❌') || msg.includes('Erro') || msg.includes('Falha')) return 'error';
        if (msg.startsWith('🔄') || msg.includes('Rodando') || msg.includes('Executando')) return 'progress';
        if (msg.startsWith('🧠')) return 'ai';
        if (msg.startsWith('🏛️')) return 'imperius';
        if (msg.startsWith('🔁')) return 'retry';
        return 'info';
    };

    const getLogColor = (type: string) => {
        switch (type) {
            case 'success': return '#4EDC88';
            case 'error': return '#EF4444';
            case 'progress': return '#F59E0B';
            case 'ai': return '#C084FC';
            case 'imperius': return '#F59E0B';
            case 'retry': return '#60A5FA';
            default: return 'rgba(255,255,255,0.6)';
        }
    };

    return (
        <div style={{
            background: '#000',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.05)',
            fontFamily: 'monospace',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#4EDC88' }}>●</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#4EDC88' }}>
                        WORKER ALEX
                    </span>
                </div>
                <div style={{ fontSize: '10px', opacity: 0.5 }}>
                    {logs.length} eventos
                </div>
            </div>

            {/* Log Content */}
            <div style={{
                padding: '16px',
                maxHeight: '500px',
                overflowY: 'auto'
            }}>
                {logs.length === 0 ? (
                    <div style={{ opacity: 0.4, textAlign: 'center', padding: '40px' }}>
                        Nenhum log disponível
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {logs.map((log, i) => {
                            const type = getLogType(log.msg);
                            const color = getLogColor(type);
                            const isLast = i === logs.length - 1;

                            return (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        padding: '8px 10px',
                                        background: isLast ? 'rgba(78, 220, 136, 0.05)' : 'transparent',
                                        borderRadius: '6px',
                                        borderLeft: isLast ? '2px solid #4EDC88' : 'none'
                                    }}
                                >
                                    <span style={{
                                        fontSize: '10px',
                                        opacity: 0.3,
                                        minWidth: '70px'
                                    }}>
                                        {new Date(log.data).toLocaleTimeString('pt-BR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}
                                    </span>
                                    <span style={{
                                        fontSize: '11px',
                                        color,
                                        lineHeight: '1.4'
                                    }}>
                                        {isLast && <span style={{ marginRight: '4px' }}>›</span>}
                                        {log.msg}
                                    </span>
                                </div>
                            );
                        })}

                        {oferta.status.executando && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 10px',
                                color: '#4EDC88'
                            }}>
                                <span style={{
                                    display: 'inline-block',
                                    animation: 'blink 1s infinite'
                                }}>_</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div style={{
                padding: '10px 18px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '10px'
            }}>
                <div style={{ opacity: 0.5 }}>
                    Fase {oferta.status.fase}/7
                </div>
                <div style={{
                    color: oferta.status.executando ? '#F59E0B' : '#4EDC88',
                    fontWeight: 700
                }}>
                    {oferta.status.executando ? 'PROCESSANDO' : oferta.status.mensagem}
                </div>
            </div>
        </div>
    );
}
