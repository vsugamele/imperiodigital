"use client";

import { Oferta, ArquivoItem } from './types';

interface ProjectPhasesProps {
    oferta: Oferta;
    arquivosVisiveis: Record<string, ArquivoItem[]>;
    expandedFases: Record<string, boolean>;
    onToggleFase: (faseKey: string) => void;
    onViewFile: (path: string) => void;
    onOpenFolder: (path: string) => void;
}

const FASE_CONFIG: Record<string, { nome: string; icon: string }> = {
    '1-pesquisa': { nome: 'Pesquisa & Avatar', icon: '🔍' },
    '2-avatar': { nome: 'Análise de Mercado', icon: '📊' },
    '3-mercado': { nome: 'Mecanismo Único', icon: '💡' },
    '4-mecanismo': { nome: 'Arquitetura da Oferta', icon: '📦' },
    '5-oferta': { nome: 'Copy & Conversão', icon: '✍️' },
    '6-copy': { nome: 'Validação', icon: '🧪' },
    '7-validacao': { nome: 'Lançamento', icon: '🚀' }
};

export default function ProjectPhases({
    oferta,
    arquivosVisiveis,
    expandedFases,
    onToggleFase,
    onViewFile,
    onOpenFolder
}: ProjectPhasesProps) {

    const faseUiKey = (faseKey: string) => `${oferta.safeName}::${faseKey}`;

    const formatTamanho = (bytes?: number) => {
        if (!bytes) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getIconTipo = (tipo: string) => {
        switch (tipo) {
            case 'pasta': return '📁';
            case 'markdown': return '📝';
            case 'json': return '⚙️';
            case 'texto': return '📄';
            default: return '📁';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(oferta.fases).map(([key, fase]) => {
                const config = FASE_CONFIG[key] || { nome: key, icon: '📁' };
                const uiKey = faseUiKey(key);
                const arquivos = arquivosVisiveis[uiKey] || [];
                const isExpanded = expandedFases[uiKey];

                return (
                    <div key={key} style={{
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '12px',
                        border: fase.completo
                            ? '1px solid rgba(78, 220, 136, 0.2)'
                            : '1px solid rgba(255,255,255,0.05)',
                        overflow: 'hidden'
                    }}>
                        {/* Phase Header */}
                        <div
                            onClick={() => onToggleFase(key)}
                            style={{
                                padding: '16px 18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                background: isExpanded
                                    ? 'rgba(255,255,255,0.03)'
                                    : 'transparent',
                                transition: 'background 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '20px' }}>{config.icon}</span>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{config.nome}</div>
                                    {fase.status === 'completed' && fase.dataCompleto && (
                                        <div style={{ fontSize: '10px', opacity: 0.5 }}>
                                            Concluído em {fase.dataCompleto}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {fase.completo ? (
                                    <span style={{
                                        padding: '4px 10px',
                                        background: 'rgba(78, 220, 136, 0.2)',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        color: '#4EDC88',
                                        fontWeight: 700
                                    }}>
                                        ✓ Completo
                                    </span>
                                ) : fase.status === 'active' ? (
                                    <span style={{
                                        padding: '4px 10px',
                                        background: 'rgba(245, 158, 11, 0.2)',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        color: '#F59E0B',
                                        fontWeight: 700,
                                        animation: 'blink 1s infinite'
                                    }}>
                                        ⏳ Em Progresso
                                    </span>
                                ) : (
                                    <span style={{
                                        padding: '4px 10px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        opacity: 0.5
                                    }}>
                                        Pendente
                                    </span>
                                )}
                                <span style={{
                                    fontSize: '12px',
                                    transform: isExpanded ? 'rotate(180deg)' : 'none',
                                    transition: 'transform 0.2s'
                                }}>▼</span>
                            </div>
                        </div>

                        {/* Phase Content */}
                        {isExpanded && (
                            <div style={{
                                padding: '0 18px 18px',
                                borderTop: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                {/* Quick Preview if available */}
                                {key === '2-avatar' && fase.avatar && (
                                    <div style={{
                                        padding: '14px',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        borderRadius: '10px',
                                        marginTop: '14px',
                                        marginBottom: '14px'
                                    }}>
                                        <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '6px' }}>AVATAR DEFINIDO</div>
                                        <div style={{ fontSize: '14px' }}>
                                            <strong>{fase.avatar.nome}</strong>, {fase.avatar.idade} • {fase.avatar.profissao}
                                        </div>
                                    </div>
                                )}

                                {key === '4-mecanismo' && fase.mecanismo && (
                                    <div style={{
                                        padding: '14px',
                                        background: 'rgba(245, 158, 11, 0.1)',
                                        borderRadius: '10px',
                                        marginTop: '14px',
                                        marginBottom: '14px'
                                    }}>
                                        <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '6px' }}>MECANISMO ÚNICO</div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#F59E0B' }}>
                                            {fase.mecanismo.nome}
                                        </div>
                                        <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
                                            {fase.mecanismo.insight}
                                        </div>
                                    </div>
                                )}

                                {key === '3-mercado' && fase.gap && (
                                    <div style={{
                                        padding: '14px',
                                        background: 'rgba(168, 85, 247, 0.1)',
                                        borderRadius: '10px',
                                        marginTop: '14px',
                                        marginBottom: '14px'
                                    }}>
                                        <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '6px' }}>GAP DE MERCADO</div>
                                        <div style={{ fontSize: '13px' }}>{fase.gap}</div>
                                    </div>
                                )}

                                {/* Files */}
                                <div style={{ marginTop: '14px' }}>
                                    {arquivos.length === 0 ? (
                                        <div style={{ fontSize: '12px', opacity: 0.4, padding: '10px 0' }}>
                                            Nenhum arquivo encontrado nesta fase
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {arquivos.map((arq, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        padding: '10px 14px',
                                                        background: 'rgba(0,0,0,0.2)',
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ fontSize: '14px' }}>{getIconTipo(arq.tipo)}</span>
                                                        <span style={{ fontSize: '13px' }}>{arq.nome}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ fontSize: '10px', opacity: 0.4 }}>
                                                            {formatTamanho(arq.tamanho)}
                                                        </span>
                                                        {arq.tipo === 'pasta' ? (
                                                            <button
                                                                onClick={() => onOpenFolder(arq.caminho)}
                                                                style={{
                                                                    padding: '5px 10px',
                                                                    background: 'rgba(255,255,255,0.05)',
                                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                                    borderRadius: '6px',
                                                                    color: '#fff',
                                                                    fontSize: '10px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                Abrir
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => onViewFile(arq.caminho)}
                                                                style={{
                                                                    padding: '5px 10px',
                                                                    background: 'rgba(59, 130, 246, 0.2)',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    color: '#3B82F6',
                                                                    fontSize: '10px',
                                                                    fontWeight: 600,
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                Ver
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Direct file link if available */}
                                {fase.arquivo && (
                                    <button
                                        onClick={() => onViewFile(fase.arquivo!)}
                                        style={{
                                            marginTop: '12px',
                                            padding: '10px 14px',
                                            background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            borderRadius: '8px',
                                            color: '#60A5FA',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            width: '100%',
                                            textAlign: 'left',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        📄 Ver Artefato Principal
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
