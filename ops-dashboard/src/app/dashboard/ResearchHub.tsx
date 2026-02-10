"use client";

import React, { useState, useEffect } from "react";

interface ResearchResult {
  keyword?: string;
  niche?: string;
  timestamp: string;
  seoScore?: number;
  relatedKeywords?: Array<{ keyword: string; score: number; type: string }>;
  opportunities?: Array<{ type: string; title: string; keywords: string[] }>;
  recommendations?: Array<{ priority: string; action: string }>;
  trends?: Array<{ keyword: string; trend: number; growth: string }>;
  contentIdeas?: Array<{ platform: string; type: string; title: string }>;
}

export default function ResearchHub() {
  const [activeTab, setActiveTab] = useState<'keyword' | 'trend' | 'youtube' | 'full'>('keyword');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [youtubeResults, setYoutubeResults] = useState<any>(null);
  const [history, setHistory] = useState<ResearchResult[]>([]);

  const runResearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);

    // Simular execução (em produção, chamaria o script)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Gerar resultado simulado baseado na pesquisa
    const mockResult = generateMockResult(searchTerm, activeTab);
    setResult(mockResult);
    setHistory([mockResult, ...history.slice(0, 9)]);
    setLoading(false);
  };

  // YouTube Research Function
  const runYoutubeResearch = async (project: string) => {
    setLoading(true);
    setYoutubeResults(null);

    try {
      /*
      // Ler arquivo de resultados se existir
      const resultsPath = `outputs/research/${project}_research.json`;
      // const fs = require('fs');
      // const path = require('path');
      
      // Criar diretório se não existir
      // const outputDir = path.join(process.cwd(), 'outputs', 'research');
      // if (!fs.existsSync(outputDir)) {
      //   fs.mkdirSync(outputDir, { recursive: true });
      // }
      */

      // Executar o script via API (simulado aqui)
      // Em produção, chamaria: node scripts/research/youtube-research-simple.js --project=project

      // Gerar resultado simulado para demonstração
      const mockYoutubeResult = {
        project: project,
        name: project.charAt(0).toUpperCase() + project.slice(1),
        analyzedAt: new Date().toISOString(),
        insights: {
          topPainPoints: [
            { keyword: 'ansioso', count: Math.floor(Math.random() * 20) + 5 },
            { keyword: 'sofrendo', count: Math.floor(Math.random() * 15) + 3 },
            { keyword: 'triste', count: Math.floor(Math.random() * 12) + 2 }
          ],
          topOpportunities: [
            { keyword: 'preciso', count: Math.floor(Math.random() * 25) + 10 },
            { keyword: 'gostaria', count: Math.floor(Math.random() * 20) + 8 }
          ],
          contentSuggestions: [
            'Vídeo sobre como lidar com a ansiedade',
            'Post sobre esperança e fé',
            'Conteúdo motivacional para quem está passando por dificuldades'
          ]
        }
      };

      setYoutubeResults(mockYoutubeResult);
    } catch (error) {
      console.error('YouTube Research error:', error);
    }

    setLoading(false);
  };

  const generateMockResult = (term: string, researchMode: string): ResearchResult => {
    if (researchMode === 'keyword') {
      return {
        keyword: term,
        timestamp: new Date().toISOString(),
        seoScore: Math.floor(Math.random() * 40) + 60,
        relatedKeywords: [
          { keyword: `como fazer ${term}`, score: 85, type: 'problem' },
          { keyword: `${term} passo a passo`, score: 78, type: 'informational' },
          { keyword: `melhor ${term} 2025`, score: 72, type: 'product' },
          { keyword: `${term} para iniciantes`, score: 68, type: 'informational' },
          { keyword: `${term} em casa`, score: 65, type: 'general' },
        ],
        opportunities: [
          {
            type: 'low_competition',
            title: 'Palavras-chave de baixa competição',
            keywords: [`${term} iniciante`, `${term} básico`, `${term} sem experiencia`]
          },
          {
            type: 'long_tail',
            title: 'Long tail oportunidades',
            keywords: [`como aprender ${term} em 30 dias`, `${term} do zero completo`] as string[]
          }
        ],
        recommendations: [
          { priority: 'high', action: `Criar conteúdo para long-tail keywords de ${term}` },
          { priority: 'medium', action: 'Focar em problemas do avatar' }
        ]
      };
    }

    if (researchMode === 'trend') {
      return {
        niche: term,
        timestamp: new Date().toISOString(),
        trends: [
          { keyword: `${term} com IA`, trend: 95, growth: '+150%' },
          { keyword: `${term} automatizado`, trend: 88, growth: '+85%' },
          { keyword: `${term} definitivo`, trend: 82, growth: '+62%' },
          { keyword: `${term} passo a passo`, trend: 78, growth: '+45%' },
          { keyword: `${term} online`, trend: 75, growth: '+38%' },
        ]
      };
    }

    return {
      niche: term,
      timestamp: new Date().toISOString(),
      seoScore: 75,
      relatedKeywords: [
        { keyword: `como fazer ${term}`, score: 85, type: 'problem' },
        { keyword: `${term} passo a passo`, score: 78, type: 'informational' },
      ],
      trends: [
        { keyword: `${term} com IA`, trend: 95, growth: '+150%' },
      ],
      contentIdeas: [
        { platform: 'YouTube', type: 'Tutorial', title: `${term} - Tutorial Completo` },
        { platform: 'Instagram', type: 'Carrossel', title: `5 erros em ${term}` },
        { platform: 'Blog', type: 'Artigo SEO', title: `Guia completo de ${term} 2025` },
      ],
      opportunities: [
        { type: 'content_gap', title: 'Falta de conteúdo', keywords: [] },
      ]
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4EDC88';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getYoutubeProjectColor = (project: string) => {
    switch (project) {
      case 'religiao': return '#8B5CF6';
      case 'igaming': return '#EF4444';
      case 'petselectuk': return '#22C55E';
      default: return '#3B82F6';
    }
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
          🔍 RESEARCH <span style={{ color: '#3B82F6' }}>HUB</span>
        </h1>
        <p style={{ margin: '8px 0 0', opacity: 0.6, fontSize: '14px' }}>
          Keywords, Tendências, SEO e Oportunidades
        </p>
      </div>

      {/* Search Box */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.05)',
        marginBottom: '32px'
      }}>
        {/* Mode Selection */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {[
            { id: 'keyword', label: '🔑 Keywords', icon: '🔑' },
            { id: 'trend', label: '📈 Tendências', icon: '📈' },
            { id: 'youtube', label: '🎬 YouTube', icon: '🎬' },
            { id: 'full', label: '🎯 Pesquisa Completa', icon: '🎯' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'keyword' | 'trend' | 'youtube' | 'full')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
                  : 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* YouTube Research Section */}
        {activeTab === 'youtube' && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', marginBottom: '16px', opacity: 0.8 }}>
              Selecione um projeto para analisar comentários do YouTube:
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { id: 'religiao', label: '📿 Religião', icon: '📿' },
                { id: 'igaming', label: '🎰 iGaming', icon: '🎰' },
                { id: 'petselectuk', label: '🐕 PetSelectUK', icon: '🐕' }
              ].map(project => (
                <button
                  key={project.id}
                  onClick={() => runYoutubeResearch(project.id)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: loading
                      ? 'rgba(255,255,255,0.1)'
                      : getYoutubeProjectColor(project.id) + '20',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? '⏳' : project.icon} {project.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Input (only for keyword/trend/full) */}
        {activeTab !== 'youtube' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === 'keyword' ? 'Ex: emagrecimento, marketing digital' :
                  activeTab === 'trend' ? 'Ex: negocios, saúde, tecnologia' :
                    'Ex: curso online, consultoria'
              }
              onKeyPress={(e) => e.key === 'Enter' && runResearch()}
              style={{
                flex: 1,
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.3)',
                color: '#fff',
                fontSize: '16px',
                outline: 'none'
              }}
            />
            <button
              onClick={runResearch}
              disabled={loading || !searchTerm.trim()}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                border: 'none',
                background: loading || !searchTerm.trim()
                  ? 'rgba(255,255,255,0.1)'
                  : 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: loading || !searchTerm.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '⏳ Pesquisando...' : '🔍 Pesquisar'}
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {youtubeResults && (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* YouTube Research Results Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px' }}>🎬</span>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>
                  YouTube Research - {youtubeResults.name}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>
                  Analisado em: {new Date(youtubeResults.analyzedAt).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </div>

          {/* Pain Points */}
          {youtubeResults.insights?.topPainPoints && (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#EF4444' }}>
                😰 Dores Identificadas (comentários do YouTube)
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {youtubeResults.insights.topPainPoints.map((pain: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '10px',
                      borderLeft: '3px solid #EF4444'
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>#{pain.keyword}</span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#EF4444'
                    }}>
                      {pain.count}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities */}
          {youtubeResults.insights?.topOpportunities && (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#22C55E' }}>
                💡 Oportunidades (o que pessoas estão buscando)
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {youtubeResults.insights.topOpportunities.map((opp: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      borderRadius: '10px',
                      borderLeft: '3px solid #22C55E'
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>#{opp.keyword}</span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: '#22C55E'
                    }}>
                      {opp.count}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Suggestions */}
          {youtubeResults.insights?.contentSuggestions && (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#3B82F6' }}>
                📝 Sugestões de Conteúdo Baseadas nos Comentários
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {youtubeResults.insights.contentSuggestions.map((suggestion: string, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: '16px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '10px',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>📌</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLI Command Reference */}
          <div style={{
            marginTop: '16px',
            padding: '16px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '12px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: 700, marginBottom: '8px', color: '#F59E0B' }}>💻 Executar via CLI:</div>
            <code style={{ color: '#4EDC88' }}>
              node scripts/research/youtube-research-simple.js --project=religiao
            </code>
          </div>
        </div>
      )}

      {/* Results for keyword/trend/full */}
      {(activeTab === 'keyword' || activeTab === 'trend' || activeTab === 'full') && result && !youtubeResults && (
        <div style={{ display: 'grid', gap: '24px' }}>

          {/* SEO Score */}
          {result.seoScore && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, #8B5CF6 0.1 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '24px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <span style={{ fontSize: '24px', fontWeight: 900, color: getScoreColor(result.seoScore) }}>
                  {result.seoScore}
                </span>
                <span style={{ fontSize: '10px', opacity: 0.6 }}>/100</span>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>SEO Score</div>
                <div style={{ fontSize: '13px', opacity: 0.6 }}>
                  {result.seoScore >= 80 ? 'Excelente oportunidade!' :
                    result.seoScore >= 60 ? 'Boa oportunidade, com cuidado.' :
                      'Competição alta, foque em long-tail.'}
                </div>
              </div>
            </div>
          )}

          {/* Keywords */}
          {result.relatedKeywords && (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>
                🔗 Palavras-chave Relacionadas
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.relatedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      background: kw.type === 'problem' ? 'rgba(239, 68, 68, 0.2)' :
                        kw.type === 'product' ? 'rgba(34, 197, 94, 0.2)' :
                          kw.type === 'informational' ? 'rgba(59, 130, 246, 0.2)' :
                            'rgba(255,255,255,0.05)',
                      color: kw.type === 'problem' ? '#EF4444' :
                        kw.type === 'product' ? '#22C55E' :
                          kw.type === 'informational' ? '#3B82F6' :
                            '#fff'
                    }}
                  >
                    {kw.keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trends */}
          {result.trends && (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>
                🔥 Tendências em Alta
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {result.trends.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: '10px',
                      borderLeft: `3px solid ${t.trend > 85 ? '#EF4444' : t.trend > 75 ? '#F59E0B' : '#4EDC88'}`
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{t.keyword}</span>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: 'rgba(78, 220, 136, 0.2)',
                      color: '#4EDC88'
                    }}>
                      {t.growth}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities */}
          {result.opportunities && (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>
                💡 Oportunidades
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {result.opportunities.map((opp, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '16px',
                      background: 'rgba(251, 191, 36, 0.05)',
                      borderRadius: '10px',
                      border: '1px solid rgba(251, 191, 36, 0.1)'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
                      {opp.title}
                    </div>
                    {opp.keywords.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {opp.keywords.map((k, j) => (
                          <span key={j} style={{ fontSize: '11px', opacity: 0.7 }}>#{k}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Ideas */}
          {result.contentIdeas && (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>
                📝 Ideias de Conteúdo
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {result.contentIdeas.map((idea, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '16px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '10px',
                      border: '1px solid rgba(139, 92, 246, 0.2)'
                    }}
                  >
                    <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>
                      {idea.platform}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>
                      {idea.title}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '4px' }}>
                      {idea.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, opacity: 0.6 }}>
            📜 Pesquisas Recentes
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {history.slice(1).map((h, i) => (
              <button
                key={i}
                onClick={() => setResult(h)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.02)',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {h.keyword || h.niche}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CLI Reference */}
      <div style={{
        marginTop: '48px',
        padding: '20px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '12px',
        fontSize: '12px',
        opacity: 0.6
      }}>
        <div style={{ fontWeight: 700, marginBottom: '8px' }}>💻 Via CLI:</div>
        <code style={{ color: '#4EDC88' }}>
          node scripts/research/orchestrator.js --keyword "emagrecimento"
        </code>
        <br />
        <code style={{ color: '#3B82F6' }}>
          node scripts/research/orchestrator.js --full "curso online"
        </code>
      </div>
    </div>
  );
}
