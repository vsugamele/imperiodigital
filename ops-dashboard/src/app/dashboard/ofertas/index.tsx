"use client";

import { useState, useEffect } from 'react';
import { Oferta, ArquivoItem, ArquivoInfo, OfertasTabType } from './types';
import ProjectSidebar from './ProjectSidebar';
import ProjectOverview from './ProjectOverview';
import ProjectPhases from './ProjectPhases';
import ProjectLogs from './ProjectLogs';
import HackerversoTab from './HackerversoTab';

export default function OfertasHub() {
    const [ofertas, setOfertas] = useState<Oferta[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOferta, setSelectedOferta] = useState<Oferta | null>(null);
    const [activeTab, setActiveTab] = useState<OfertasTabType>('overview');
    const [searchTerm, setSearchTerm] = useState('');

    // Phase expansion state
    const [expandedFases, setExpandedFases] = useState<Record<string, boolean>>({});
    const [arquivosVisiveis, setArquivosVisiveis] = useState<Record<string, ArquivoItem[]>>({});

    // Hackerverso
    const [hackerverso, setHackerverso] = useState<{ pasta?: string; arquivos: ArquivoItem[] }>({ arquivos: [] });

    // File viewer
    const [arquivoSelecionado, setArquivoSelecionado] = useState<ArquivoInfo | null>(null);
    const [conteudoVisualizado, setConteudoVisualizado] = useState<string | null>(null);
    const [carregandoArquivo, setCarregandoArquivo] = useState(false);

    // New project modal
    const [showModal, setShowModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectIdea, setNewProjectIdea] = useState('');
    const [creating, setCreating] = useState(false);

    // Load ofertas
    useEffect(() => {
        loadOfertas();
        const t = setInterval(loadOfertas, 5000);
        return () => clearInterval(t);
    }, []);

    // Load hackerverso when project changes
    useEffect(() => {
        setArquivoSelecionado(null);
        setConteudoVisualizado(null);
        if (selectedOferta?.safeName) {
            loadHackerverso(selectedOferta.safeName);
        } else {
            setHackerverso({ arquivos: [] });
        }
    }, [selectedOferta?.safeName]);

    const loadOfertas = async () => {
        try {
            const response = await fetch('/api/ofertas');
            if (response.ok) {
                const data = await response.json();
                const lista = data.ofertas || [];
                setOfertas(lista);
                setSelectedOferta(prev => {
                    if (!lista.length) return null;
                    if (!prev) return lista[0];
                    return lista.find((o: Oferta) => o.safeName === prev.safeName) || lista[0];
                });
            }
        } catch (error) {
            console.error('Error loading ofertas:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadHackerverso = async (projeto: string) => {
        try {
            const response = await fetch(`/api/ofertas/hackerverso?projeto=${encodeURIComponent(projeto)}`);
            if (!response.ok) return setHackerverso({ arquivos: [] });
            const data = await response.json();
            const arquivos = (data.arquivos || []).map((a: { nome: string; caminho: string; tamanho: number; modificado: string }) => ({
                nome: a.nome,
                caminho: a.caminho,
                tipo: a.nome.endsWith('.json') ? 'json' : 'arquivo',
                tamanho: a.tamanho,
                modificado: a.modificado,
            }));
            setHackerverso({ pasta: data.pasta, arquivos });
        } catch {
            setHackerverso({ arquivos: [] });
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName) return;

        setCreating(true);
        try {
            const response = await fetch('/api/ofertas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: newProjectName,
                    ideia: newProjectIdea
                })
            });

            if (response.ok) {
                setNewProjectName('');
                setNewProjectIdea('');
                setShowModal(false);
                await loadOfertas();
            } else {
                alert('Erro ao criar projeto');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Erro ao conectar com a API');
        } finally {
            setCreating(false);
        }
    };

    const toggleFase = async (faseKey: string) => {
        if (!selectedOferta) return;
        const uiKey = `${selectedOferta.safeName}::${faseKey}`;
        const isExpanded = expandedFases[uiKey];
        setExpandedFases(prev => ({ ...prev, [uiKey]: !isExpanded }));

        if (!isExpanded) {
            await loadArquivosFase(selectedOferta.safeName, faseKey);
        }
    };

    const loadArquivosFase = async (safeName: string, faseKey: string) => {
        try {
            const response = await fetch(`/api/ofertas/arquivos?projeto=${safeName}&fase=${faseKey}`);
            if (response.ok) {
                const data = await response.json();
                const uiKey = `${safeName}::${faseKey}`;
                setArquivosVisiveis(prev => ({ ...prev, [uiKey]: data.arquivos || [] }));
            }
        } catch (error) {
            console.error('Error loading arquivos:', error);
        }
    };

    const abrirArquivo = async (caminho: string) => {
        setCarregandoArquivo(true);
        try {
            const response = await fetch(`/api/ofertas/visualizar?path=${encodeURIComponent(caminho)}`);
            if (response.ok) {
                const data = await response.json();
                setArquivoSelecionado(data);
                setConteudoVisualizado(data.conteudo || null);
            } else {
                alert('Erro ao abrir arquivo');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erro ao abrir arquivo');
        } finally {
            setCarregandoArquivo(false);
        }
    };

    const abrirPasta = (caminho: string) => {
        window.open(`file://${caminho}`, '_blank');
    };

    const retryPipeline = async () => {
        if (!selectedOferta) return;
        try {
            const response = await fetch('/api/ofertas', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    safeName: selectedOferta.safeName,
                    tipo: 'retry_pipeline'
                })
            });
            if (response.ok) {
                await loadOfertas();
            } else {
                alert('Erro ao reprocessar');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erro ao conectar com a API');
        }
    };

    const copyHeadlines = () => {
        const headlines = selectedOferta?.fases?.['6-copy']?.copy?.topHeadlines;
        if (headlines && headlines.length > 0) {
            navigator.clipboard.writeText(headlines.join('\n\n'));
            alert('Headlines copiadas!');
        }
    };

    const openInVSCode = () => {
        if (selectedOferta) {
            window.open(`vscode://file/C:/Users/vsuga/clawd/projects/ofertas/outputs/${selectedOferta.safeName}`, '_blank');
        }
    };

    const tabs: { id: OfertasTabType; label: string; icon: string }[] = [
        { id: 'overview', label: 'Visão Geral', icon: '📊' },
        { id: 'fases', label: 'Fases', icon: '📁' },
        { id: 'hackerverso', label: 'Hackerverso', icon: '🧬' },
        { id: 'logs', label: 'Logs', icon: '📜' },
    ];

    const formatTamanho = (bytes?: number) => {
        if (!bytes) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getIconTipo = (tipo: string) => {
        switch (tipo) {
            case 'markdown': return '📝';
            case 'json': return '⚙️';
            case 'texto': return '📄';
            case 'codigo': return '💻';
            default: return '📁';
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)',
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            display: 'flex'
        }}>
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}} />

            {/* Sidebar */}
            <ProjectSidebar
                ofertas={ofertas}
                selectedOferta={selectedOferta}
                loading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onSelectOferta={(oferta) => {
                    setSelectedOferta(oferta);
                    setArquivoSelecionado(null);
                    setConteudoVisualizado(null);
                    setActiveTab('overview');
                }}
                onNewProject={() => setShowModal(true)}
            />

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {selectedOferta ? (
                    <>
                        {/* Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>
                                    {selectedOferta.nome}
                                </h1>
                                <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '4px' }}>
                                    {selectedOferta.status.progresso} completo • Fase {selectedOferta.status.fase}/7
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {selectedOferta.status.executando ? (
                                    <span style={{
                                        padding: '10px 16px',
                                        background: 'rgba(245, 158, 11, 0.2)',
                                        borderRadius: '10px',
                                        color: '#F59E0B',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <span style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: '#F59E0B',
                                            animation: 'blink 1s infinite'
                                        }} />
                                        Processando...
                                    </span>
                                ) : selectedOferta.status.erro || selectedOferta.status.progresso !== '100%' ? (
                                    <button
                                        onClick={retryPipeline}
                                        style={{
                                            padding: '10px 16px',
                                            background: 'rgba(245, 158, 11, 0.2)',
                                            border: 'none',
                                            borderRadius: '10px',
                                            color: '#F59E0B',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🔄 Reprocessar
                                    </button>
                                ) : null}
                                <button
                                    onClick={copyHeadlines}
                                    style={{
                                        padding: '10px 16px',
                                        background: 'rgba(59, 130, 246, 0.2)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        color: '#60A5FA',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    📋 Copiar Headlines
                                </button>
                                <button
                                    onClick={openInVSCode}
                                    style={{
                                        padding: '10px 16px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    💻 VS Code
                                </button>
                            </div>
                        </div>

                        {/* Content Area with Vertical Tabs */}
                        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                            {/* Vertical Tabs */}
                            <div style={{
                                width: '180px',
                                minWidth: '180px',
                                borderRight: '1px solid rgba(255,255,255,0.05)',
                                padding: '16px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                            }}>
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        style={{
                                            padding: '12px 14px',
                                            background: activeTab === tab.id
                                                ? 'rgba(245, 158, 11, 0.15)'
                                                : 'transparent',
                                            border: activeTab === tab.id
                                                ? '1px solid rgba(245, 158, 11, 0.3)'
                                                : '1px solid transparent',
                                            borderRadius: '10px',
                                            color: activeTab === tab.id ? '#F59E0B' : 'rgba(255,255,255,0.6)',
                                            fontSize: '13px',
                                            fontWeight: activeTab === tab.id ? 700 : 500,
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}

                                {/* Imperius Insight Card */}
                                {selectedOferta.status.imperiusInsight && (
                                    <div style={{
                                        marginTop: 'auto',
                                        padding: '14px',
                                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(245, 158, 11, 0.2)'
                                    }}>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#F59E0B', marginBottom: '6px' }}>
                                            🏛️ IMPERIUS
                                        </div>
                                        <div style={{ fontSize: '11px', lineHeight: '1.4', opacity: 0.8 }}>
                                            {selectedOferta.status.imperiusInsight.insight.slice(0, 80)}...
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tab Content */}
                            <div style={{
                                flex: 1,
                                padding: '24px',
                                overflowY: 'auto'
                            }}>
                                {activeTab === 'overview' && (
                                    <ProjectOverview
                                        oferta={selectedOferta}
                                        onCopyHeadlines={copyHeadlines}
                                    />
                                )}

                                {activeTab === 'fases' && (
                                    <ProjectPhases
                                        oferta={selectedOferta}
                                        arquivosVisiveis={arquivosVisiveis}
                                        expandedFases={expandedFases}
                                        onToggleFase={toggleFase}
                                        onViewFile={abrirArquivo}
                                        onOpenFolder={abrirPasta}
                                    />
                                )}

                                {activeTab === 'hackerverso' && (
                                    <HackerversoTab
                                        hackerverso={hackerverso}
                                        onViewFile={abrirArquivo}
                                    />
                                )}

                                {activeTab === 'logs' && (
                                    <ProjectLogs oferta={selectedOferta} />
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '16px',
                        opacity: 0.5
                    }}>
                        <span style={{ fontSize: '48px' }}>🚀</span>
                        <span style={{ fontSize: '16px' }}>Selecione um projeto para começar</span>
                    </div>
                )}
            </div>

            {/* File Viewer Modal */}
            {arquivoSelecionado && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '40px'
                }}>
                    <div style={{
                        background: '#111',
                        width: '100%',
                        maxWidth: '900px',
                        maxHeight: '80vh',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            background: 'rgba(0,0,0,0.3)',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '20px' }}>{getIconTipo(arquivoSelecionado.tipo)}</span>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{arquivoSelecionado.nome}</div>
                                    <div style={{ fontSize: '10px', opacity: 0.5 }}>
                                        {formatTamanho(arquivoSelecionado.tamanho)}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => window.open(`vscode://file/${encodeURIComponent(arquivoSelecionado.caminho)}`, '_blank')}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        background: 'transparent',
                                        color: '#fff',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📝 Editar
                                </button>
                                <button
                                    onClick={() => {
                                        setArquivoSelecionado(null);
                                        setConteudoVisualizado(null);
                                    }}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'rgba(239, 68, 68, 0.2)',
                                        color: '#EF4444',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✕ Fechar
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{
                            padding: '20px',
                            flex: 1,
                            overflow: 'auto',
                            fontFamily: arquivoSelecionado.tipo === 'codigo' || arquivoSelecionado.tipo === 'json'
                                ? 'monospace'
                                : 'Inter, sans-serif',
                            fontSize: '13px',
                            lineHeight: '1.6'
                        }}>
                            {carregandoArquivo ? (
                                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
                                    ⏳ Carregando...
                                </div>
                            ) : conteudoVisualizado ? (
                                <pre style={{
                                    margin: 0,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    color: 'rgba(255,255,255,0.8)'
                                }}>
                                    {conteudoVisualizado}
                                </pre>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
                                    ❌ Não foi possível carregar o conteúdo
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* New Project Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#111',
                        width: '100%',
                        maxWidth: '500px',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '32px'
                    }}>
                        <h2 style={{ margin: '0 0 24px', fontSize: '24px', fontWeight: 900 }}>
                            💡 NOVA <span style={{ color: '#F59E0B' }}>IDEIA</span>
                        </h2>

                        <form onSubmit={handleCreateProject}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', opacity: 0.6 }}>
                                    NOME DO PROJETO
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Ex: Stop Smoking, Método Lado Certeiro..."
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', opacity: 0.6 }}>
                                    DESCREVA SUA IDEIA (PROMPT)
                                </label>
                                <textarea
                                    placeholder="Ex: Um método natural para parar de fumar em 30 dias..."
                                    value={newProjectIdea}
                                    onChange={(e) => setNewProjectIdea(e.target.value)}
                                    rows={4}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        outline: 'none',
                                        resize: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    CANCELAR
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || !newProjectName}
                                    style={{
                                        flex: 2,
                                        padding: '14px',
                                        background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#000',
                                        fontWeight: 900,
                                        cursor: (creating || !newProjectName) ? 'not-allowed' : 'pointer',
                                        opacity: (creating || !newProjectName) ? 0.5 : 1
                                    }}
                                >
                                    {creating ? 'CRIANDO...' : 'CRIAR PROJETO'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
