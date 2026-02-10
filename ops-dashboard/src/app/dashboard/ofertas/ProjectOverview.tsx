"use client";

import { Oferta } from './types';

interface ProjectOverviewProps {
    oferta: Oferta;
    onCopyHeadlines: () => void;
    onViewFile: (path: string) => void;
}

export default function ProjectOverview({ oferta, onCopyHeadlines, onViewFile }: ProjectOverviewProps) {
    const avatar = oferta.fases?.['2-avatar']?.avatar;
    const mecanismo = oferta.fases?.['4-mecanismo']?.mecanismo;
    const ofertaData = oferta.fases?.['5-oferta']?.oferta;
    const copyData = oferta.fases?.['6-copy']?.copy;
    const hipoteses = oferta.fases?.['7-validacao']?.hipoteses;

    const cardStyle = {
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '14px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.06)'
    };

    const labelStyle = {
        fontSize: '10px',
        fontWeight: 800,
        letterSpacing: '1px',
        opacity: 0.5,
        marginBottom: '10px',
        display: 'block'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Metrics Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px'
            }}>
                {[
                    { label: 'Dores', value: oferta.metricas?.doresIdentificadas || 0, color: '#EF4444', icon: '🎯' },
                    { label: 'Headlines', value: copyData?.headlines || 0, color: '#3B82F6', icon: '✍️' },
                    { label: 'Bônus', value: oferta.metricas?.bonusEstrategicos || 0, color: '#F59E0B', icon: '🎁' },
                    { label: 'Score', value: oferta.status.mindCritics?.score ? `${oferta.status.mindCritics.score}/100` : '-', color: '#C084FC', icon: '🧠' }
                ].map((metric, i) => (
                    <div key={i} style={{
                        background: `${metric.color}10`,
                        borderRadius: '12px',
                        padding: '16px',
                        border: `1px solid ${metric.color}30`,
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>{metric.icon}</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: metric.color }}>{metric.value}</div>
                        <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>{metric.label}</div>
                    </div>
                ))}
            </div>

            {/* Avatar & Mecanismo Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                {/* Avatar Card */}
                <div style={cardStyle}>
                    <span style={labelStyle}>🎯 AVATAR</span>
                    {avatar ? (
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                                {avatar.nome}, {avatar.idade} anos
                            </div>
                            <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '4px' }}>
                                {avatar.profissao}
                            </div>
                            <div style={{
                                marginTop: '12px',
                                padding: '12px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '8px',
                                borderLeft: '3px solid #EF4444'
                            }}>
                                <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '4px' }}>DOR PRINCIPAL</div>
                                <div style={{ fontSize: '13px', color: '#EF4444' }}>{avatar.dorPrincipal}</div>
                            </div>
                            <div style={{
                                marginTop: '8px',
                                padding: '12px',
                                background: 'rgba(168, 85, 247, 0.1)',
                                borderRadius: '8px',
                                borderLeft: '3px solid #A855F7'
                            }}>
                                <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '4px' }}>MEDO PRINCIPAL</div>
                                <div style={{ fontSize: '13px', color: '#A855F7' }}>{avatar.medoPrincipal}</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ opacity: 0.4, fontSize: '13px' }}>Avatar não definido</div>
                    )}
                </div>

                {/* Mecanismo Card */}
                <div style={cardStyle}>
                    <span style={labelStyle}>💡 MECANISMO ÚNICO</span>
                    {mecanismo ? (
                        <div>
                            <div style={{
                                fontSize: '20px',
                                fontWeight: 800,
                                color: '#F59E0B',
                                marginBottom: '8px'
                            }}>
                                {mecanismo.nome}
                            </div>
                            <div style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                background: 'rgba(78, 220, 136, 0.2)',
                                borderRadius: '12px',
                                fontSize: '11px',
                                color: '#4EDC88',
                                marginBottom: '12px'
                            }}>
                                ⏱️ {mecanismo.duracao}
                            </div>
                            <div style={{
                                padding: '12px',
                                background: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '8px',
                                borderLeft: '3px solid #F59E0B',
                                marginBottom: '12px'
                            }}>
                                <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '4px' }}>INSIGHT CENTRAL</div>
                                <div style={{ fontSize: '13px', fontStyle: 'italic' }}>"{mecanismo.insight}"</div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {mecanismo.passos?.map((passo, i) => (
                                    <span key={i} style={{
                                        padding: '4px 10px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '6px',
                                        fontSize: '11px'
                                    }}>
                                        {i + 1}. {passo}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ opacity: 0.4, fontSize: '13px' }}>Mecanismo não definido</div>
                    )}
                </div>
            </div>

            {/* Oferta Card */}
            <div style={cardStyle}>
                <span style={labelStyle}>💰 ESCADA DE OFERTA</span>
                {ofertaData ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {/* Low Ticket */}
                        <div style={{
                            padding: '16px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '12px',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '8px' }}>LOW TICKET</div>
                            <div style={{ fontSize: '26px', fontWeight: 800, color: '#3B82F6' }}>
                                R${ofertaData.lowticket.preco}
                            </div>
                            <div style={{ fontSize: '11px', marginTop: '8px', opacity: 0.7 }}>
                                {ofertaData.lowticket.nome}
                            </div>
                        </div>

                        {/* Mid Ticket */}
                        <div style={{
                            padding: '16px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: '12px',
                            border: '2px solid rgba(245, 158, 11, 0.3)',
                            textAlign: 'center',
                            position: 'relative'
                        }}>
                            {ofertaData.midticket.desconto && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '-10px',
                                    background: '#EF4444',
                                    color: '#fff',
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    fontSize: '10px',
                                    fontWeight: 800
                                }}>
                                    -{ofertaData.midticket.desconto}
                                </div>
                            )}
                            <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '8px' }}>MID TICKET ⭐</div>
                            <div style={{ fontSize: '26px', fontWeight: 800, color: '#F59E0B' }}>
                                R${ofertaData.midticket.preco}
                            </div>
                            {ofertaData.midticket.valorTotal && (
                                <div style={{ fontSize: '11px', textDecoration: 'line-through', opacity: 0.5 }}>
                                    R${ofertaData.midticket.valorTotal}
                                </div>
                            )}
                            <div style={{ fontSize: '11px', marginTop: '8px', opacity: 0.7 }}>
                                {ofertaData.midticket.nome}
                            </div>
                        </div>

                        {/* High Ticket */}
                        <div style={{
                            padding: '16px',
                            background: 'rgba(168, 85, 247, 0.1)',
                            borderRadius: '12px',
                            border: '1px solid rgba(168, 85, 247, 0.2)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '8px' }}>HIGH TICKET</div>
                            <div style={{ fontSize: '26px', fontWeight: 800, color: '#A855F7' }}>
                                R${ofertaData.highticket.preco}
                            </div>
                            <div style={{ fontSize: '11px', marginTop: '8px', opacity: 0.7 }}>
                                {ofertaData.highticket.nome}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ opacity: 0.4, fontSize: '13px' }}>Oferta não definida</div>
                )}
            </div>

            {/* Headlines Card */}
            {copyData?.topHeadlines && copyData.topHeadlines.length > 0 && (
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span style={{ ...labelStyle, marginBottom: 0 }}>✍️ TOP HEADLINES</span>
                        <button
                            onClick={onCopyHeadlines}
                            style={{
                                padding: '6px 12px',
                                background: 'rgba(59, 130, 246, 0.2)',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#3B82F6',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            📋 Copiar Todas
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {copyData.topHeadlines.slice(0, 5).map((headline, i) => (
                            <div key={i} style={{
                                padding: '12px 14px',
                                background: 'rgba(0,0,0,0.25)',
                                borderRadius: '8px',
                                fontSize: '13px',
                                lineHeight: '1.5',
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'flex-start'
                            }}>
                                <span style={{
                                    background: 'rgba(59, 130, 246, 0.3)',
                                    color: '#60A5FA',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: 700
                                }}>
                                    {i + 1}
                                </span>
                                <span>{headline}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Hipóteses A/B Card */}
            {hipoteses && hipoteses.length > 0 && (
                <div style={cardStyle}>
                    <span style={labelStyle}>🧪 HIPÓTESES A/B</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {hipoteses.map((hip, i) => (
                            <div key={i} style={{
                                padding: '14px',
                                background: hip.status === 'vencedora'
                                    ? 'rgba(78, 220, 136, 0.1)'
                                    : 'rgba(255,255,255,0.02)',
                                borderRadius: '10px',
                                border: hip.status === 'vencedora'
                                    ? '2px solid rgba(78, 220, 136, 0.3)'
                                    : '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: hip.status === 'vencedora' ? '#4EDC88' : 'rgba(255,255,255,0.1)',
                                        color: hip.status === 'vencedora' ? '#000' : '#fff',
                                        borderRadius: '8px',
                                        fontWeight: 800,
                                        fontSize: '14px'
                                    }}>
                                        {hip.letra}
                                    </span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '14px' }}>
                                            {hip.nome}
                                            {hip.status === 'vencedora' && (
                                                <span style={{ color: '#4EDC88', marginLeft: '8px' }}>⭐ VENCEDORA</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '11px', opacity: 0.6 }}>{hip.angle}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#F59E0B' }}>
                                        R${hip.precoMid}
                                    </div>
                                    <div style={{ fontSize: '10px', opacity: 0.5 }}>Mid Ticket</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Vantagens */}
            {oferta.vantagens && oferta.vantagens.length > 0 && (
                <div style={cardStyle}>
                    <span style={labelStyle}>✨ VANTAGENS COMPETITIVAS</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {oferta.vantagens.map((v, i) => (
                            <span key={i} style={{
                                padding: '8px 14px',
                                background: 'rgba(78, 220, 136, 0.1)',
                                border: '1px solid rgba(78, 220, 136, 0.2)',
                                borderRadius: '20px',
                                fontSize: '12px',
                                color: '#4EDC88'
                            }}>
                                ✓ {v}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
