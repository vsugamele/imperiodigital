'use client';

import { useState, useEffect } from 'react';

interface Vertical {
    id: string;
    nome: string;
    perfis: string[];
    status: 'producao' | 'ativo' | 'planejamento';
    tipo: string;
    objetivo: string;
    kpis: Record<string, number>;
    automacoes: string[];
    gaps: string[];
    metricas_tempo_real?: Record<string, number>;
}

interface Estrategia {
    tipo: string;
    descricao: string;
}

interface VerticaisData {
    verticais: Vertical[];
    framework_lancamento: {
        estrategias: Estrategia[];
        funil_conteudo: {
            etapas: { fase: number; nome: string; objetivo: string }[];
        };
        framework_criativo: {
            elementos: string[];
            prova_social: string[];
        };
        dores_avatar: {
            categorias: { tipo: string; exemplos: string[] }[];
        };
    };
    produtos_jp_freitas: {
        nome: string;
        tipo: string;
        preco: number | null;
        objetivo: string;
    }[];
    auditoria_projetos: {
        id: string;
        nome: string;
        vertical: string;
        checklists: Record<string, string[]>;
    }[];
    learning_engine: {
        padronizacao_universal: Record<string, string[]>;
    };
    frameworks_conhecimento?: {
        niveis_criativo: {
            camadas: {
                nivel: number;
                nome: string;
                elementos: string[];
            }[];
        };
    };
    resumo: {
        total_verticais: number;
        em_producao: number;
        ativas: number;
        planejamento: number;
    };
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    producao: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22C55E', label: '🟢 Produção' },
    ativo: { bg: 'rgba(234, 179, 8, 0.2)', text: '#EAB308', label: '🟡 Ativo' },
    planejamento: { bg: 'rgba(249, 115, 22, 0.2)', text: '#F97316', label: '🟠 Planejamento' }
};

export default function VerticaisHub() {
    const [data, setData] = useState<VerticaisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVertical, setSelectedVertical] = useState<Vertical | null>(null);
    const [selectedAudit, setSelectedAudit] = useState<{ id?: string; nome?: string; type?: string; checklists?: Record<string, string[]> } | null>(null);
    const [activeTab, setActiveTab] = useState<'verticais' | 'framework' | 'produtos' | 'reflexoes' | 'auditoria'>('verticais');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await fetch('/api/intel/verticals');
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Error loading verticals:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div style={{ fontSize: '24px' }}>🔄 Carregando Verticais...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)' }}>
                    Dados de verticais não encontrados
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, margin: 0 }}>
                        🏢 Imperio Digital - Verticais
                    </h1>
                    <p style={{ fontSize: '14px', opacity: 0.7, margin: '4px 0 0' }}>
                        Visão estratégica por projeto de negócio
                    </p>
                </div>

                {/* Resumo Rápido */}
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: '#22C55E' }}>
                            {data.resumo.em_producao}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.7 }}>Produção</div>
                    </div>
                    <div style={{
                        background: 'rgba(234, 179, 8, 0.15)',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: '#EAB308' }}>
                            {data.resumo.ativas}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.7 }}>Ativas</div>
                    </div>
                    <div style={{
                        background: 'rgba(249, 115, 22, 0.15)',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: '#F97316' }}>
                            {data.resumo.planejamento}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.7 }}>Planejamento</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '24px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '12px'
            }}>
                {[
                    { id: 'verticais', label: '🏗️ Verticais', icon: '🏗️' },
                    { id: 'framework', label: '🎯 Framework', icon: '🎯' },
                    { id: 'produtos', label: '📦 Produtos', icon: '📦' },
                    { id: 'reflexoes', label: '🧠 Reflexões' },
                    { id: 'auditoria', label: '🔍 Auditoria IA', icon: '🔍' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'verticais' | 'framework' | 'produtos' | 'reflexoes' | 'auditoria')}
                        style={{
                            padding: '10px 20px',
                            background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
                            border: activeTab === tab.id ? '1px solid #6366F1' : '1px solid transparent',
                            borderRadius: '8px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: activeTab === tab.id ? 700 : 500,
                            fontSize: '14px'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'verticais' && (
                <div style={{ display: 'grid', gridTemplateColumns: selectedVertical ? '1fr 1fr' : '1fr', gap: '24px' }}>
                    {/* Lista de Verticais */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {data.verticais.map(vertical => (
                            <div
                                key={vertical.id}
                                onClick={() => setSelectedVertical(vertical)}
                                style={{
                                    background: selectedVertical?.id === vertical.id
                                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%)'
                                        : 'rgba(255,255,255,0.03)',
                                    border: selectedVertical?.id === vertical.id
                                        ? '1px solid rgba(99, 102, 241, 0.5)'
                                        : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                                            {vertical.nome}
                                        </h3>
                                        <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.7 }}>
                                            {vertical.objetivo}
                                        </p>
                                    </div>
                                    <span style={{
                                        background: statusColors[vertical.status].bg,
                                        color: statusColors[vertical.status].text,
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 700
                                    }}>
                                        {statusColors[vertical.status].label}
                                    </span>
                                </div>

                                {vertical.perfis.length > 0 && (
                                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {vertical.perfis.map(perfil => (
                                            <span key={perfil} style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '11px'
                                            }}>
                                                @{perfil}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
                                    {Object.entries(vertical.kpis).slice(0, 3).map(([key, value]) => (
                                        <div key={key} style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#6366F1' }}>
                                                {value}
                                            </div>
                                            <div style={{ fontSize: '10px', opacity: 0.5, textTransform: 'capitalize' }}>
                                                {key.replace(/_/g, ' ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedVertical && (
                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            padding: '24px'
                        }}>
                            <h2 style={{ margin: '0 0 20px', fontSize: '22px' }}>
                                📊 {selectedVertical.nome}
                            </h2>

                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ margin: '0 0 8px', fontSize: '12px', opacity: 0.5, letterSpacing: '1px' }}>
                                    🤖 AUTOMAÇÕES ATIVAS
                                </h4>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {selectedVertical.automacoes.map(auto => (
                                        <span key={auto} style={{
                                            background: 'rgba(34, 197, 94, 0.2)',
                                            color: '#22C55E',
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }}>
                                            ✅ {auto}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ margin: '0 0 8px', fontSize: '12px', opacity: 0.5, letterSpacing: '1px' }}>
                                    ⚠️ GAPS IDENTIFICADOS
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {selectedVertical.gaps.map(gap => (
                                        <div key={gap} style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '13px'
                                        }}>
                                            🔴 {gap}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedVertical.metricas_tempo_real && (
                                <div>
                                    <h4 style={{ margin: '0 0 8px', fontSize: '12px', opacity: 0.5, letterSpacing: '1px' }}>
                                        📈 MÉTRICAS EM TEMPO REAL
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                        {Object.entries(selectedVertical.metricas_tempo_real).map(([key, value]) => (
                                            <div key={key} style={{
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                padding: '16px',
                                                borderRadius: '12px',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: '28px', fontWeight: 900, color: '#6366F1' }}>
                                                    {value}
                                                </div>
                                                <div style={{ fontSize: '11px', opacity: 0.6, textTransform: 'capitalize' }}>
                                                    {key.replace(/_/g, ' ')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'framework' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        padding: '24px'
                    }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>📊 Funil de Conteúdo</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {data.framework_lancamento.funil_conteudo.etapas.map((etapa, idx) => (
                                <div key={etapa.fase} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    background: `rgba(99, 102, 241, ${0.1 + idx * 0.05})`,
                                    borderRadius: '8px'
                                }}>
                                    <span style={{
                                        background: '#6366F1',
                                        color: '#fff',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 900,
                                        fontSize: '14px'
                                    }}>
                                        {etapa.fase}
                                    </span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{etapa.nome}</div>
                                        <div style={{ fontSize: '11px', opacity: 0.6 }}>{etapa.objetivo}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        padding: '24px'
                    }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>🎯 Estratégias de Lançamento</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {data.framework_lancamento.estrategias.map(est => (
                                <span key={est.tipo} style={{
                                    background: 'rgba(236, 72, 153, 0.15)',
                                    border: '1px dashed rgba(236, 72, 153, 0.5)',
                                    color: '#EC4899',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    textTransform: 'uppercase'
                                }}>
                                    {est.tipo.replace(/_/g, ' ')}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'produtos' && (
                <div>
                    <h3 style={{ margin: '0 0 20px', fontSize: '18px' }}>📦 Produtos JP Freitas</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        {data.produtos_jp_freitas.map(produto => (
                            <div key={produto.nome} style={{
                                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(0,0,0,0.3) 100%)',
                                border: '1px solid rgba(249, 115, 22, 0.3)',
                                borderRadius: '16px',
                                padding: '20px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎓</div>
                                <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 800 }}>
                                    {produto.nome}
                                </h4>
                                <div style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    marginBottom: '8px'
                                }}>
                                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#22C55E' }}>
                                        {produto.preco ? `R$ ${produto.preco.toLocaleString()}` : 'A definir'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '11px', opacity: 0.6 }}>
                                    {produto.objetivo}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'reflexoes' && data.frameworks_conhecimento && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: '18px' }}>🎥 OS 4 NÍVEIS DO CRIATIVO</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {data.frameworks_conhecimento.niveis_criativo.camadas.map((camada) => (
                                <div key={camada.nivel} style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    borderLeft: '4px solid #6366F1'
                                }}>
                                    <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: '4px' }}>{camada.nivel}.0</div>
                                    <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '8px' }}>{camada.nome}</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {camada.elementos.map((el: string) => (
                                            <span key={el} style={{
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                color: '#a5a6f6',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '11px'
                                            }}>
                                                {el}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'auditoria' && (
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '12px', opacity: 0.5, marginBottom: '12px', textTransform: 'uppercase' }}>⚙️ Padronização Universal</h4>
                            <div
                                onClick={() => setSelectedAudit({ type: 'learning' })}
                                style={{
                                    padding: '12px',
                                    background: selectedAudit?.type === 'learning' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.03)',
                                    border: selectedAudit?.type === 'learning' ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 700
                                }}
                            >
                                📈 Regras de Crescimento
                            </div>
                        </div>

                        <h4 style={{ fontSize: '12px', opacity: 0.5, marginBottom: '12px', textTransform: 'uppercase' }}>📂 Projetos em Auditoria</h4>
                        {data.auditoria_projetos.map(audit => (
                            <div
                                key={audit.id}
                                onClick={() => setSelectedAudit(audit)}
                                style={{
                                    padding: '16px',
                                    background: selectedAudit?.id === audit.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                                    border: selectedAudit?.id === audit.id ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '4px' }}>{audit.nome}</div>
                                <div style={{ fontSize: '10px', opacity: 0.5 }}>Vertical: {audit.vertical}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {!selectedAudit ? (
                            <div style={{ textAlign: 'center', opacity: 0.5, paddingTop: '100px' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧐</div>
                                <div>Selecione um projeto ou regra para auditar</div>
                            </div>
                        ) : selectedAudit.type === 'learning' ? (
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px' }}>📈 Padronização Global</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    {Object.entries(data.learning_engine.padronizacao_universal).map(([key, items]) => (
                                        <div key={key} className="glass-card" style={{ padding: '20px' }}>
                                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', marginBottom: '16px' }}>
                                                {key.replace(/_/g, ' ')}
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {items.map((item: string, i: number) => (
                                                    <div key={i} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ color: '#22c55e' }}>✅</span> {item}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>🔍 {selectedAudit.nome}</h2>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                                            AI CHECK
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    {selectedAudit.checklists && Object.entries(selectedAudit.checklists).map(([category, items]) => (
                                        <div key={category} className="glass-card" style={{ padding: '20px' }}>
                                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                {category.replace(/_/g, ' ')}
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {items.map((item: string, i: number) => (
                                                    <div key={i} style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '10px',
                                                        fontSize: '13px',
                                                        padding: '8px',
                                                        background: 'rgba(255,255,255,0.02)',
                                                        borderRadius: '6px'
                                                    }}>
                                                        <input type="checkbox" readOnly />
                                                        <span style={{ opacity: 0.9 }}>{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid #eab308', borderRadius: '12px' }}>
                                    <div style={{ fontWeight: 800, color: '#eab308', marginBottom: '4px', fontSize: '14px' }}>🤖 IMPERIUS ADVISOR</div>
                                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                                        Sugestão: Priorize os ajustes de Bio no perfil **{selectedAudit.nome}** para aumentar a conversão imediata. Recomendo também iniciar a padronização de histórias conforme o Learning Engine.
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
