"use client";

import { useState, useEffect } from 'react';

interface Oferta {
  nome: string;
  safeName: string;
  status: {
    fase: number;
    progresso: string;
    proximo: string;
    hipoteseVencedora?: string;
  };
  fases: Record<string, { status: string; completo: boolean; arquivo?: string }>;
  createdAt: string;
  metricas?: {
    doresIdentificadas?: number;
    headlinesCriadas?: number;
    bonusEstrategicos?: number;
  };
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

  useEffect(() => {
    loadOfertas();
  }, []);

  const loadOfertas = async () => {
    try {
      const response = await fetch('/api/ofertas');
      if (response.ok) {
        const data = await response.json();
        setOfertas(data.ofertas || []);
        if (data.ofertas?.length > 0) {
          setSelectedOferta(data.ofertas[0]);
        }
      }
    } catch (error) {
      console.error('Error loading ofertas:', error);
    } finally {
      setLoading(false);
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

  const toggleFase = async (key: string) => {
    const isExpanded = expandedFases[key];
    setExpandedFases(prev => ({ ...prev, [key]: !isExpanded }));

    if (!isExpanded && selectedOferta) {
      await loadArquivosFase(selectedOferta.safeName, key);
    }
  };

  const loadArquivosFase = async (safeName: string, faseKey: string) => {
    try {
      const response = await fetch(`/api/ofertas/arquivos?projeto=${safeName}&fase=${faseKey}`);
      if (response.ok) {
        const data = await response.json();
        setArquivosVisiveis(prev => ({ ...prev, [faseKey]: data.arquivos || [] }));
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
              {ofertas.map((oferta) => {
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
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${progresso}%`,
                        height: '100%',
                        background: getProgressColor(String(progresso)),
                        transition: 'width 0.3s'
                      }} />
                    </div>

                    {/* Métricas */}
                    {oferta.metricas && (
                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '12px',
                        fontSize: '11px'
                      }}>
                        {oferta.metricas.doresIdentificadas && (
                          <span style={{ opacity: 0.6 }}>Dores: <strong style={{ color: '#EF4444' }}>{oferta.metricas.doresIdentificadas}</strong></span>
                        )}
                        {oferta.metricas.headlinesCriadas && (
                          <span style={{ opacity: 0.6 }}>Headlines: <strong style={{ color: '#3B82F6' }}>{oferta.metricas.headlinesCriadas}</strong></span>
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

            {Object.entries(selectedOferta.fases).map(([key, fase]) => {
              const [num] = key.split('-');
              const arquivos = arquivosVisiveis[key] || [];
              const isExpanded = expandedFases[key];

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
    </div>
  );
}
