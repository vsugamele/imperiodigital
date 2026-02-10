"use client";

import { useState, useEffect } from 'react';

interface Oferta {
  nome: string;
  safeName: string;
  status: {
    fase: number;
    progresso: string;
    proximo: string;
    executando?: boolean;
    mensagem?: string;
    logs?: { data: string; msg: string }[];
    hipoteseVencedora?: string;
    imperiusInsight?: {
      data: string;
      insight: string;
      acaoSugerida: string;
      prioridade: 'Alta' | 'Média' | 'Baixa';
    };
    mindCritics?: {
      score: number;
      arquivo: string;
    };
  };
  fases: Record<string, { status: string; completo: boolean; arquivo?: string }>;
  createdAt: string;
  metricas?: {
    doresIdentificadas?: number;
    headlinesCriadas?: number;
    bonusEstrategicos?: number;
  };
  vantagens?: string[];
}

interface ArquivoItem {
  nome: string;
  caminho: string;
  tipo: 'pasta' | 'arquivo';
  tamanho?: number;
  modificado?: string;
}

interface ArquivoInfo {
  tipo: 'markdown' | 'json' | 'texto' | 'codigo' | 'outro';
  caminho: string;
  nome: string;
  tamanho: number;
  modificado: string;
  conteudo?: string;
}

export default function OfertasHub() {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOferta, setSelectedOferta] = useState<Oferta | null>(null);
  const [expandedFases, setExpandedFases] = useState<Record<string, boolean>>({});
  const [arquivosVisiveis, setArquivosVisiveis] = useState<Record<string, ArquivoItem[]>>({});

  // Estados para visualização de arquivos
  const [arquivoSelecionado, setArquivoSelecionado] = useState<ArquivoInfo | null>(null);
  const [conteudoVisualizado, setConteudoVisualizado] = useState<string | null>(null);
  const [carregandoArquivo, setCarregandoArquivo] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hackerverso, setHackerverso] = useState<{ pasta?: string; arquivos: ArquivoItem[] }>({ arquivos: [] });

  // Estados para novo projeto
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectIdea, setNewProjectIdea] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadOfertas();
    const t = setInterval(loadOfertas, 5000);
    return () => clearInterval(t);
  }, []);

  const loadOfertas = async () => {
    try {
      const response = await fetch('/api/ofertas');
      if (response.ok) {
        const data = await response.json();
        const lista = data.ofertas || [];
        setOfertas(lista);

        // Preserva seleção atual durante auto-refresh (evita voltar pro 1º card)
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

  const getFaseNome = (num: string) => {
    const nomes: Record<string, string> = {
      '1': 'Pesquisa & Avatar',
      '2': 'Análise de Mercado',
      '3': 'Mecanismo Único',
      '4': 'Arquitetura da Oferta',
      '5': 'Copy & Conversão',
      '6': 'Validação',
      '7': 'Lançamento'
    };
    return nomes[num] || '';
  };

  const getFaseIcon = (num: string) => {
    const icons: Record<string, string> = {
      '1': '🔍',
      '2': '📊',
      '3': '💡',
      '4': '📦',
      '5': '✍️',
      '6': '🧪',
      '7': '🚀'
    };
    return icons[num] || '📁';
  };

  const getProgressColor = (progresso: string) => {
    const p = parseInt(progresso);
    if (p >= 80) return '#4EDC88';
    if (p >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const faseUiKey = (safeName: string, faseKey: string) => `${safeName}::${faseKey}`;

  useEffect(() => {
    // Ao trocar projeto, limpa visualização para não misturar arquivo/fase de outro projeto
    setArquivoSelecionado(null);
    setConteudoVisualizado(null);
    if (selectedOferta?.safeName) {
      loadHackerverso(selectedOferta.safeName);
    } else {
      setHackerverso({ arquivos: [] });
    }
  }, [selectedOferta?.safeName]);

  const toggleFase = async (key: string) => {
    if (!selectedOferta) return;
    const uiKey = faseUiKey(selectedOferta.safeName, key);
    const isExpanded = expandedFases[uiKey];
    setExpandedFases(prev => ({ ...prev, [uiKey]: !isExpanded }));

    if (!isExpanded) {
      await loadArquivosFase(selectedOferta.safeName, key);
    }
  };

  const loadArquivosFase = async (safeName: string, faseKey: string) => {
    try {
      const response = await fetch(`/api/ofertas/arquivos?projeto=${safeName}&fase=${faseKey}`);
      if (response.ok) {
        const data = await response.json();
        const uiKey = faseUiKey(safeName, faseKey);
        setArquivosVisiveis(prev => ({ ...prev, [uiKey]: data.arquivos || [] }));
      }
    } catch (error) {
      console.error('Error loading arquivos:', error);
    }
  };

  const aplicarAjusteImperius = async (safeName: string) => {
    try {
      const response = await fetch('/api/ofertas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          safeName,
          tipo: 'aplicar_imperius'
        })
      });

      if (response.ok) {
        await loadOfertas();
        const updated = await response.json();
        setSelectedOferta(updated.dashboard);
      } else {
        alert('Erro ao aplicar ajuste');
      }
    } catch (error) {
      console.error('Error applying adjustment:', error);
      alert('Erro ao conectar com a API');
    }
  };

  const retryPipeline = async (safeName: string) => {
    try {
      const response = await fetch('/api/ofertas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          safeName,
          tipo: 'retry_pipeline'
        })
      });

      if (response.ok) {
        await loadOfertas();
      } else {
        alert('Erro ao reprocessar');
      }
    } catch (error) {
      console.error('Error retrying pipeline:', error);
      alert('Erro ao conectar com a API');
    }
  };

  const loadHackerverso = async (projeto: string) => {
    try {
      const response = await fetch(`/api/ofertas/hackerverso?projeto=${encodeURIComponent(projeto)}`);
      if (!response.ok) return setHackerverso({ arquivos: [] });
      const data = await response.json();
      const arquivos = (data.arquivos || []).map((a: any) => ({
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

  const getIconTipo = (tipo: string) => {
    switch (tipo) {
      case 'pasta': return '📁';
      case 'markdown': return '📝';
      case 'json': return '⚙️';
      case 'texto': return '📄';
      case 'codigo': return '💻';
      default: return '📁';
    }
  };

  const formatTamanho = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getHackerversoLabel = (fileName: string) => {
    const labels: Record<string, string> = {
      '00-resumo.json': 'Resumo Executivo',
      '01-multidao-faminta.json': 'Etapa 01 — Multidão Faminta',
      '02-problemas.json': 'Etapa 02 — Problemas do Avatar',
      '03-lago.json': 'Etapa 03 — O Lago (Sub-mercado)',
      '04-falhas.json': 'Etapa 04 — Falhas do Concorrente',
      '05-mecanismo.json': 'Etapa 05 — Mecanismo Único',
      '06-escada-valor.json': 'Etapa 06 — Escada de Valor',
      '07-bonus.json': 'Etapa 07 — Bônus Irresistíveis',
      '08-lowticket.json': 'Etapa 08 — Oferta Lowticket',
      '09-vsl.json': 'Etapa 09 — VSL',
      '10-pagina.json': 'Etapa 10 — Página de Vendas A/B',
      '11-upsell.json': 'Etapa 11 — Script Upsell',
      '12-orderbump.json': 'Etapa 12 — Copy OrderBump',
      '13-psicologica.json': 'Etapa 13 — Análise Psicológica',
      '14-avancado.json': 'Etapa 14 — Estudo Avançado do Avatar'
    };
    return labels[fileName] || fileName;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)',
      padding: '32px',
      color: '#fff',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900 }}>
          🚀 <span style={{ color: '#F59E0B' }}>LANÇAMENTOS</span> AUTÔNOMOS
        </h1>
        <p style={{ margin: '8px 0 0', opacity: 0.6, fontSize: '14px' }}>
          Crie, gerencie e lance infoprodutos de forma sistemática
        </p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pulse-gold {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes slide {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
      `}} />

      {/* Busca e Ações */}
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{
          position: 'relative',
          flex: 1,
          maxWidth: '400px'
        }}>
          <input
            type="text"
            placeholder="🔍 Pesquisar produtos ou nichos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => e.target.style.border = '1px solid #F59E0B'}
            onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
          />
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '14px 24px',
            background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#000',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          ➕ NOVA IDEIA
        </button>
      </div>

      {/* Layout: Lista + Visualização */}
      <div style={{ display: 'grid', gridTemplateColumns: arquivoSelecionado ? '400px 1fr' : '1fr', gap: '24px' }}>

        {/* Lista de Ofertas */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', opacity: 0.6 }}>
              ⏳ Carregando projetos...
            </div>
          ) : ofertas.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
              <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                Nenhuma oferta criada ainda
              </div>
              <code style={{ color: '#F59E0B' }}>
                node projects/ofertas/scripts/launcher.js --create "Nome"
              </code>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {ofertas.filter(o => o.nome.toLowerCase().includes(searchTerm.toLowerCase())).map((oferta) => {
                const fasesCount = Object.keys(oferta.fases).length;
                const completas = Object.values(oferta.fases).filter(f => f.completo).length;
                const progresso = Math.round((completas / fasesCount) * 100);
                const isSelected = selectedOferta?.safeName === oferta.safeName;

                return (
                  <div
                    key={oferta.safeName}
                    onClick={() => {
                      setSelectedOferta(oferta);
                      setArquivoSelecionado(null);
                      setConteudoVisualizado(null);
                    }}
                    style={{
                      background: isSelected
                        ? 'rgba(251, 191, 36, 0.1)'
                        : 'rgba(255,255,255,0.02)',
                      borderRadius: '16px',
                      padding: '20px',
                      border: isSelected
                        ? '2px solid rgba(251, 191, 36, 0.3)'
                        : '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 700 }}>{oferta.nome}</div>
                        <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '4px' }}>
                          {new Date(oferta.createdAt).toLocaleDateString('pt-BR')}
                          {oferta.status.hipoteseVencedora && (
                            <span style={{ color: '#4EDC88', marginLeft: '8px' }}>
                              ⭐ {oferta.status.hipoteseVencedora}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: `${getProgressColor(String(progresso))}22`,
                        color: getProgressColor(String(progresso))
                      }}>
                        {progresso}%
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      height: '4px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '2px',
                      marginBottom: '16px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${progresso}%`,
                        height: '100%',
                        background: getProgressColor(String(progresso)),
                        transition: 'width 0.3s'
                      }} />
                      {oferta.status.executando && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          animation: 'slide 1.5s infinite'
                        }} />
                      )}
                    </div>

                    {/* Status de Execução IA */}
                    {oferta.status.executando && (
                      <div style={{
                        padding: '8px 12px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#F59E0B',
                          animation: 'blink 1s infinite'
                        }} />
                        <span style={{ fontSize: '10px', color: '#F59E0B', fontWeight: 700 }}>
                          IA PROCESSANDO: {oferta.status.mensagem || 'Analisando nicho...'}
                        </span>
                      </div>
                    )}

                    {!oferta.status.executando && oferta.status.progresso !== '100%' && (
                      <div style={{
                        padding: '8px 12px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '10px', color: '#EF4444', fontWeight: 700 }}>
                          ⚠️ Pipeline parado: {oferta.status.mensagem || 'sem status'}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); retryPipeline(oferta.safeName); }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'rgba(245, 158, 11, 0.25)',
                            color: '#F59E0B',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          REPROCESSAR
                        </button>
                      </div>
                    )}

                    {/* Métricas */}
                    {(oferta.metricas || oferta.status.mindCritics) && (
                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '12px',
                        fontSize: '11px',
                        flexWrap: 'wrap'
                      }}>
                        {oferta.metricas?.doresIdentificadas && (
                          <span style={{ opacity: 0.6 }}>Dores: <strong style={{ color: '#EF4444' }}>{oferta.metricas.doresIdentificadas}</strong></span>
                        )}
                        {oferta.metricas?.headlinesCriadas && (
                          <span style={{ opacity: 0.6 }}>Headlines: <strong style={{ color: '#3B82F6' }}>{oferta.metricas.headlinesCriadas}</strong></span>
                        )}
                        {oferta.status.mindCritics?.score && (
                          <span style={{ opacity: 0.9, color: '#C084FC' }}>🧠 Score Mentes: <strong>{oferta.status.mindCritics.score}/100</strong></span>
                        )}
                      </div>
                    )}

                    {/* Fases */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {Object.entries(oferta.fases).map(([key, fase]) => {
                        const [num] = key.split('-');
                        return (
                          <span
                            key={key}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              background: fase.completo
                                ? 'rgba(78, 220, 136, 0.2)'
                                : 'rgba(255,255,255,0.05)',
                              color: fase.completo ? '#4EDC88' : 'rgba(255,255,255,0.4)'
                            }}
                          >
                            {fase.completo ? '✅' : '⏳'} {getFaseIcon(num)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Visualização de Arquivos */}
        {arquivoSelecionado && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            overflow: 'hidden'
          }}>
            {/* Header do Arquivo */}
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
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'transparent',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  📝 Editar no VS Code
                </button>
                <button
                  onClick={() => {
                    setArquivoSelecionado(null);
                    setConteudoVisualizado(null);
                  }}
                  style={{
                    padding: '8px 16px',
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

            {/* Conteúdo do Arquivo */}
            <div style={{
              padding: '20px',
              maxHeight: 'calc(100vh - 300px)',
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
                  color: arquivoSelecionado.tipo === 'codigo' || arquivoSelecionado.tipo === 'json'
                    ? '#a0a0a0'
                    : '#fff'
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
        )}

        {/* Arquivos da Fase Selecionada */}
        {selectedOferta && !arquivoSelecionado && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '20px'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              📁 Arquivos do Projeto
            </div>

            {/* Inteligência Imperius (CEO Insight) */}
            {selectedOferta.status.imperiusInsight && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  fontSize: '80px',
                  opacity: 0.05,
                  userSelect: 'none'
                }}>🏛️</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '24px' }}>🏛️</span>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#F59E0B', letterSpacing: '2px' }}>
                      IMPERIUS: VISÃO DO CEO
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>
                      Ajuste de <span style={{ color: '#F59E0B' }}>Rota</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '15px', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)', marginBottom: '20px' }}>
                  " {selectedOferta.status.imperiusInsight.insight} "
                </div>

                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '16px',
                  borderRadius: '12px',
                  borderLeft: '4px solid #F59E0B',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.5, marginBottom: '4px' }}>AÇÃO SUGERIDA:</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#4EDC88' }}>
                      🎯 {selectedOferta.status.imperiusInsight.acaoSugerida}
                    </div>
                  </div>
                  <button
                    onClick={() => aplicarAjusteImperius(selectedOferta.safeName)}
                    style={{
                      padding: '10px 16px',
                      background: '#F59E0B',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#000',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    APROVAR ROTA
                  </button>
                </div>
              </div>
            )}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}>
              {(selectedOferta.vantagens || [
                "ROI Acelerado",
                "Escalabilidade",
                "Sem Barreiras de Entrada",
                "Baixo Investimento",
                "Alta Margem"
              ]).map((vantagem, idx) => (
                <div key={idx} style={{
                  background: 'rgba(78, 220, 136, 0.1)',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(78, 220, 136, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '18px' }}>✨</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#4EDC88' }}>{vantagem}</span>
                </div>
              ))}
            </div>

            {selectedOferta.status.mindCritics && (
              <div style={{
                background: 'rgba(168, 85, 247, 0.08)',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#C084FC', fontWeight: 800 }}>🧠 MESA DE MENTES</div>
                  <div style={{ fontSize: '13px', color: '#fff' }}>Score atual: <strong>{selectedOferta.status.mindCritics.score}/100</strong></div>
                </div>
                <button
                  onClick={() => abrirArquivo(selectedOferta.status.mindCritics!.arquivo)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(168, 85, 247, 0.25)',
                    color: '#C084FC',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  VER GAPS
                </button>
              </div>
            )}

            {/* Log de Atividade (Terminal Style) */}
            {selectedOferta.status.logs && (
              <div style={{
                background: '#000',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                border: '1px solid rgba(255,255,255,0.05)',
                fontFamily: 'monospace'
              }}>
                <div style={{ fontSize: '11px', color: '#F59E0B', marginBottom: '12px', fontWeight: 700 }}>
                  📡 LOG DE ATIVIDADE DO WORKER ALEX
                </div>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {selectedOferta.status.logs.map((log, i) => (
                    <div key={i} style={{ fontSize: '10px', display: 'flex', gap: '8px' }}>
                      <span style={{ opacity: 0.3 }}>[{new Date(log.data).toLocaleTimeString()}]</span>
                      <span style={{ color: i === selectedOferta.status.logs!.length - 1 ? '#4EDC88' : '#fff', opacity: i === selectedOferta.status.logs!.length - 1 ? 1 : 0.6 }}>
                        {i === selectedOferta.status.logs!.length - 1 ? '> ' : ''}{log.msg}
                      </span>
                    </div>
                  ))}
                  {selectedOferta.status.executando && (
                    <div style={{ fontSize: '10px', color: '#4EDC88', animation: 'blink 1s infinite' }}>
                      _
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#60A5FA', marginBottom: '8px' }}>
                🧬 HACKERVERSO · 14 ETAPAS {hackerverso.pasta ? `(${hackerverso.pasta})` : ''}
              </div>
              {hackerverso.arquivos.length === 0 ? (
                <div style={{ fontSize: '11px', opacity: 0.6 }}>Nenhum output 14 etapas encontrado para este projeto.</div>
              ) : (
                <div style={{ display: 'grid', gap: '6px' }}>
                  {hackerverso.arquivos.map((a, idx) => (
                    <button
                      key={`${a.nome}-${idx}`}
                      onClick={() => abrirArquivo(a.caminho)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(0,0,0,0.25)',
                        color: '#fff',
                        fontSize: '12px',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      {getIconTipo('json')} {getHackerversoLabel(a.nome)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {Object.entries(selectedOferta.fases).map(([key, fase]) => {
              const [num] = key.split('-');
              const uiKey = faseUiKey(selectedOferta.safeName, key);
              const arquivos = arquivosVisiveis[uiKey] || [];
              const isExpanded = expandedFases[uiKey];

              return (
                <div key={key} style={{ marginBottom: '16px' }}>
                  <div
                    onClick={() => toggleFase(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    <span>{isExpanded ? '📂' : '📁'}</span>
                    <span>{getFaseIcon(num)} {getFaseNome(num)}</span>
                    {fase.completo && <span style={{ color: '#4EDC88', marginLeft: 'auto' }}>✅</span>}
                  </div>

                  {isExpanded && (
                    <div style={{ marginLeft: '24px', marginTop: '8px' }}>
                      {arquivos.length === 0 ? (
                        <div style={{ fontSize: '11px', opacity: 0.4, padding: '8px' }}>
                          Nenhum arquivo
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gap: '4px' }}>
                          {arquivos.map((arquivo, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '6px',
                                fontSize: '12px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{getIconTipo(arquivo.tipo)}</span>
                                <span>{arquivo.nome}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ opacity: 0.4, fontSize: '10px' }}>
                                  {formatTamanho(arquivo.tamanho)}
                                </span>
                                {arquivo.tipo === 'pasta' ? (
                                  <button
                                    onClick={() => abrirPasta(arquivo.caminho)}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      border: '1px solid rgba(255,255,255,0.2)',
                                      background: 'transparent',
                                      color: '#fff',
                                      fontSize: '10px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    ABRIR
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => abrirArquivo(arquivo.caminho)}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      border: 'none',
                                      background: 'rgba(59, 130, 246, 0.2)',
                                      color: '#3B82F6',
                                      fontSize: '10px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    VISUALIZAR
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div style={{
        marginTop: '32px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px'
      }}>
        <a
          href="/projects/ofertas/README.md"
          target="_blank"
          style={{
            padding: '16px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '13px',
            textAlign: 'center'
          }}
        >
          📖 Documentação
        </a>
        <a
          href="file:///C:/Users/vsuga/clawd/projects/ofertas"
          target="_blank"
          style={{
            padding: '16px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '13px',
            textAlign: 'center'
          }}
        >
          📂 Pasta do Projeto
        </a>
        <a
          href="/dashboard?tab=research-hub"
          style={{
            padding: '16px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '13px',
            textAlign: 'center'
          }}
        >
          🔍 Research Hub
        </a>
        <div
          onClick={() => window.open(`vscode://file/${encodeURIComponent('C:/Users/vsuga/clawd/projects/ofertas')}`, '_blank')}
          style={{
            padding: '16px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '13px',
            textAlign: 'center',
            cursor: 'pointer'
          }}
        >
          💻 Abrir no VS Code
        </div>
      </div>

      {/* Modal Nova Ideia */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
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
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
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
                  placeholder="Ex: Um método natural para parar de fumar em 30 dias usando técnicas de respiração e micro-hábitos..."
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
