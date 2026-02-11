"use client";

import { ArquivoItem } from './types';

interface HackerversoTabProps {
    hackerverso: { pasta?: string; arquivos: ArquivoItem[] };
    onViewFile: (path: string) => void;
}

const HACKERVERSO_LABELS: Record<string, { label: string; color: string }> = {
    '00-resumo.json': { label: 'Resumo Executivo', color: '#F59E0B' },
    '01-multidao-faminta.json': { label: 'Etapa 01 — Multidão Faminta', color: '#EF4444' },
    '02-problemas.json': { label: 'Etapa 02 — Problemas do Avatar', color: '#EF4444' },
    '03-lago.json': { label: 'Etapa 03 — O Lago (Sub-mercado)', color: '#A855F7' },
    '04-falhas.json': { label: 'Etapa 04 — Falhas do Concorrente', color: '#A855F7' },
    '05-mecanismo.json': { label: 'Etapa 05 — Mecanismo Único', color: '#F59E0B' },
    '06-escada-valor.json': { label: 'Etapa 06 — Escada de Valor', color: '#4EDC88' },
    '07-bonus.json': { label: 'Etapa 07 — Bônus Irresistíveis', color: '#4EDC88' },
    '08-lowticket.json': { label: 'Etapa 08 — Oferta Lowticket', color: '#3B82F6' },
    '09-vsl.json': { label: 'Etapa 09 — VSL', color: '#3B82F6' },
    '10-pagina.json': { label: 'Etapa 10 — Página de Vendas A/B', color: '#3B82F6' },
    '11-upsell.json': { label: 'Etapa 11 — Script Upsell', color: '#C084FC' },
    '12-orderbump.json': { label: 'Etapa 12 — Copy OrderBump', color: '#C084FC' },
    '13-psicologica.json': { label: 'Etapa 13 — Análise Psicológica', color: '#C084FC' },
    '14-avancado.json': { label: 'Etapa 14 — Estudo Avançado do Avatar', color: '#F59E0B' }
};

export default function HackerversoTab({ hackerverso, onViewFile }: HackerversoTabProps) {
    if (hackerverso.arquivos.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '60px 40px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧬</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
                    Hackerverso não executado
                </div>
                <div style={{ fontSize: '13px', opacity: 0.5 }}>
                    Execute o pipeline para gerar as 14 etapas do Copy Generator
                </div>
            </div>
        );
    }


    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
                borderRadius: '14px',
                border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>🧬</span>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#60A5FA' }}>
                            HACKERVERSO · 14 ETAPAS
                        </div>
                        {hackerverso.pasta && (
                            <div style={{ fontSize: '11px', opacity: 0.5 }}>
                                {hackerverso.pasta}
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>
                    Metodologia completa de criação de ofertas irresistíveis
                </div>
            </div>

            {/* Files Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {hackerverso.arquivos.map((arq, i) => {
                    const config = HACKERVERSO_LABELS[arq.nome] || {
                        label: arq.nome,
                        color: '#fff'
                    };

                    return (
                        <button
                            key={`${arq.nome}-${i}`}
                            onClick={() => onViewFile(arq.caminho)}
                            style={{
                                padding: '14px 18px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderLeft: `3px solid ${config.color}`,
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '13px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{
                                    fontSize: '16px',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: `${config.color}20`,
                                    borderRadius: '6px'
                                }}>
                                    ⚙️
                                </span>
                                <span style={{ fontWeight: 600 }}>{config.label}</span>
                            </div>
                            <span style={{
                                fontSize: '10px',
                                opacity: 0.4,
                                padding: '4px 8px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '4px'
                            }}>
                                JSON
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
