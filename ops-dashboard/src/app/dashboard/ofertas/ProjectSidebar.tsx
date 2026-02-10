"use client";

import { Oferta } from './types';

interface ProjectSidebarProps {
    ofertas: Oferta[];
    selectedOferta: Oferta | null;
    loading: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onSelectOferta: (oferta: Oferta) => void;
    onNewProject: () => void;
}

export default function ProjectSidebar({
    ofertas,
    selectedOferta,
    loading,
    searchTerm,
    onSearchChange,
    onSelectOferta,
    onNewProject
}: ProjectSidebarProps) {
    const getProgressColor = (progresso: string) => {
        const p = parseInt(progresso);
        if (p >= 80) return '#4EDC88';
        if (p >= 50) return '#F59E0B';
        return '#EF4444';
    };

    const filteredOfertas = ofertas.filter(o =>
        o.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{
            width: '380px',
            minWidth: '380px',
            height: 'calc(100vh - 100px)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(0,0,0,0.2)'
        }}>
            {/* Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
                    🚀 Projetos
                </h2>

                {/* Search */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="🔍 Buscar..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '12px 14px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            color: '#fff',
                            fontSize: '13px',
                            outline: 'none'
                        }}
                    />
                    <button
                        onClick={onNewProject}
                        style={{
                            padding: '12px 16px',
                            background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            color: '#000',
                            fontWeight: 800,
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* List */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                        ⏳ Carregando...
                    </div>
                ) : filteredOfertas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                        Nenhum projeto encontrado
                    </div>
                ) : (
                    filteredOfertas.map((oferta) => {
                        const isSelected = selectedOferta?.safeName === oferta.safeName;
                        const progresso = parseInt(oferta.status.progresso) || 0;
                        const avatar = oferta.fases?.['2-avatar']?.avatar;

                        return (
                            <div
                                key={oferta.safeName}
                                onClick={() => onSelectOferta(oferta)}
                                style={{
                                    padding: '16px',
                                    background: isSelected
                                        ? 'rgba(245, 158, 11, 0.12)'
                                        : 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    border: isSelected
                                        ? '2px solid rgba(245, 158, 11, 0.4)'
                                        : '1px solid rgba(255,255,255,0.05)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 700 }}>{oferta.nome}</div>
                                        <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '2px' }}>
                                            {new Date(oferta.createdAt).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        background: `${getProgressColor(oferta.status.progresso)}22`,
                                        color: getProgressColor(oferta.status.progresso)
                                    }}>
                                        {oferta.status.progresso}
                                    </div>
                                </div>

                                {/* Avatar Preview */}
                                {avatar && (
                                    <div style={{
                                        padding: '8px 10px',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        borderRadius: '8px',
                                        marginBottom: '10px',
                                        fontSize: '11px'
                                    }}>
                                        <span style={{ opacity: 0.6 }}>👤</span>{' '}
                                        <strong>{avatar.nome}</strong>, {avatar.idade} anos
                                        <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>
                                            {avatar.dorPrincipal}
                                        </div>
                                    </div>
                                )}

                                {/* Progress Bar */}
                                <div style={{
                                    height: '3px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '2px',
                                    overflow: 'hidden',
                                    marginBottom: '10px'
                                }}>
                                    <div style={{
                                        width: `${progresso}%`,
                                        height: '100%',
                                        background: getProgressColor(oferta.status.progresso),
                                        transition: 'width 0.3s'
                                    }} />
                                </div>

                                {/* Status */}
                                {oferta.status.executando && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '10px',
                                        color: '#F59E0B'
                                    }}>
                                        <span style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: '#F59E0B',
                                            animation: 'blink 1s infinite'
                                        }} />
                                        Processando...
                                    </div>
                                )}

                                {!oferta.status.executando && oferta.status.erro && (
                                    <div style={{ fontSize: '10px', color: '#EF4444' }}>
                                        ⚠️ {oferta.status.mensagem}
                                    </div>
                                )}

                                {/* Metrics Row */}
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                    {oferta.metricas?.doresIdentificadas && (
                                        <span style={{ fontSize: '10px', opacity: 0.6 }}>
                                            🎯 {oferta.metricas.doresIdentificadas} dores
                                        </span>
                                    )}
                                    {oferta.status.mindCritics?.score && (
                                        <span style={{ fontSize: '10px', color: '#C084FC' }}>
                                            🧠 {oferta.status.mindCritics.score}/100
                                        </span>
                                    )}
                                    {oferta.status.hipoteseVencedora && (
                                        <span style={{ fontSize: '10px', color: '#4EDC88' }}>
                                            ⭐ {oferta.status.hipoteseVencedora}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
