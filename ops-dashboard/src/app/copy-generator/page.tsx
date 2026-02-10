"use client";

import { useState, useEffect } from 'react';
import { Copy, Play, Download, Eye, Trash2, CheckCircle, AlertCircle, Clock, User, Target, Zap, TrendingUp, DollarSign, FileText, Video, Brain, Gift, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';

interface Project {
  id: string;
  tema: string;
  produto: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  etapa?: number;
  etapas?: number[];
  createdAt: string;
  outputDir?: string;
}

interface EtapaInfo {
  id: number;
  nome: string;
  icon: React.ReactNode;
  cor: string;
  gurus: string[];
  descricao: string;
}

const ETAPAS: EtapaInfo[] = [
  { id: 1, nome: 'Multidão Faminta', icon: <User />, cor: 'bg-green-500', gurus: ['Kennedy'], descricao: 'Identificação do avatar ideal' },
  { id: 2, nome: 'Problemas do Avatar', icon: <AlertCircle />, cor: 'bg-red-500', gurus: ['Halbert', 'Makepeace'], descricao: 'Mapeamento de 14 categorias de problemas' },
  { id: 3, nome: 'O Lago', icon: <TrendingUp />, cor: 'bg-blue-500', gurus: ['Carlton'], descricao: 'Análise de mercado e concorrentes' },
  { id: 4, nome: 'Falhas do Concorrente', icon: <Target />, cor: 'bg-purple-500', gurus: ['Kennedy', 'Sugarman'], descricao: '11 categorias × 6 itens cada' },
  { id: 5, nome: 'Mecanismo Único', icon: <Zap />, cor: 'bg-yellow-500', gurus: ['Sugarman'], descricao: 'Nome, parábola e diferencial' },
  { id: 6, nome: 'Escada de Valor', icon: <DollarSign />, cor: 'bg-emerald-500', gurus: ['Hormozi'], descricao: 'Frontend, Backend e Highend' },
  { id: 7, nome: 'Bônus', icon: <Gift />, cor: 'bg-pink-500', gurus: [], descricao: 'Bônus irresistíveis' },
  { id: 8, nome: 'Oferta Lowticket', icon: <Target />, cor: 'bg-orange-500', gurus: [], descricao: 'Tripwire, Upsells e OrderBumps' },
  { id: 9, nome: 'VSL', icon: <Video />, cor: 'bg-indigo-500', gurus: ['Carlton'], descricao: 'Script de 19 minutos (8 blocos)' },
  { id: 10, nome: 'Página de Vendas', icon: <FileText />, cor: 'bg-cyan-500', gurus: ['Kennedy'], descricao: 'Versão A e B (12 blocos)' },
  { id: 11, nome: 'Script Upsell', icon: <Copy />, cor: 'bg-teal-500', gurus: ['Makepeace'], descricao: '13 seções pós-compra' },
  { id: 12, nome: 'OrderBump', icon: <Target />, cor: 'bg-amber-500', gurus: [], descricao: '12 variações de copy' },
  { id: 13, nome: 'Análise Psicológica', icon: <Brain />, cor: 'bg-rose-500', gurus: ['Fascinations'], descricao: 'Traumas e gatilhos emocionais' },
  { id: 14, nome: 'Estudo Avançado', icon: <Eye />, cor: 'bg-slate-500', gurus: ['Yoshitani'], descricao: 'Pesquisa etnográfica e jornadas' },
];

export default function CopyGenerator() {
  const [tema, setTema] = useState('');
  const [produto, setProduto] = useState('curso online');
  const [etapasSelecionadas, setEtapasSelecionadas] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  const [projetos, setProjetos] = useState<Project[]>([]);
  const [projetoAtual, setProjetoAtual] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [outputExpandido, setOutputExpandido] = useState(false);

  useEffect(() => {
    // Carregar projetos do localStorage
    const salvos = localStorage.getItem('copy-generator-projects');
    if (salvos) {
      setProjetos(JSON.parse(salvos));
    }
  }, []);

  const toggleEtapa = (id: number) => {
    if (etapasSelecionadas.includes(id)) {
      setEtapasSelecionadas(etapasSelecionadas.filter(e => e !== id));
    } else {
      setEtapasSelecionadas([...etapasSelecionadas, id].sort((a, b) => a - b));
    }
  };

  const selectAll = () => {
    setEtapasSelecionadas(ETAPAS.map(e => e.id));
  };

  const selectNone = () => {
    setEtapasSelecionadas([]);
  };

  const gerarCopy = async () => {
    if (!tema.trim()) {
      alert('Por favor, digite um tema!');
      return;
    }

    setLoading(true);
    const novoProjeto: Project = {
      id: Date.now().toString(),
      tema,
      produto,
      status: 'running',
      etapa: 1,
      etapas: etapasSelecionadas,
      createdAt: new Date().toISOString(),
    };

    setProjetos([novoProjeto, ...projetos]);
    setProjetoAtual(novoProjeto);
    localStorage.setItem('copy-generator-projects', JSON.stringify([novoProjeto, ...projetos]));

    try {
      const response = await fetch('/api/copy-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tema,
          produto,
          etapas: etapasSelecionadas,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const atualizado = {
          ...novoProjeto,
          status: 'completed' as const,
          etapa: undefined,
          outputDir: data.outputDir,
        };
        setProjetos(p => p.map(proj => proj.id === novoProjeto.id ? atualizado : proj));
        setProjetoAtual(atualizado);
        localStorage.setItem('copy-generator-projects', JSON.stringify(
          projetos.map(proj => proj.id === novoProjeto.id ? atualizado : proj)
        ));
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error) {
      const atualizado = { ...novoProjeto, status: 'error' as const };
      setProjetos(p => p.map(proj => proj.id === novoProjeto.id ? atualizado : proj));
      setProjetoAtual(atualizado);
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const excluirProjeto = (id: string) => {
    const filtrados = projetos.filter(p => p.id !== id);
    setProjetos(filtrados);
    localStorage.setItem('copy-generator-projects', JSON.stringify(filtrados));
    if (projetoAtual?.id === id) {
      setProjetoAtual(null);
    }
  };

  const gurusUsados = [...new Set(ETAPAS.filter(e => etapasSelecionadas.includes(e.id)).flatMap(e => e.gurus))].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#111] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Copy className="w-10 h-10 text-amber-400" />
            Copy Generator Engine
          </h1>
          <p className="text-amber-300">Sistema de 14 etapas • padrão HackerVerso • crítica por mentes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Input */}
          <div className="lg:col-span-1 space-y-6">
            {/* Formulário */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Novo Projeto
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tema / Nicho</label>
                  <input
                    type="text"
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    placeholder="ex: emagrecimento para mulheres 40+"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Produto</label>
                  <select
                    value={produto}
                    onChange={(e) => setProduto(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 transition"
                  >
                    <option value="curso online">Curso Online</option>
                    <option value="mentoria">Mentoria</option>
                    <option value="ebook">E-book</option>
                    <option value="assinatura">Assinatura</option>
                    <option value="software">Software</option>
                  </select>
                </div>

                <button
                  onClick={gerarCopy}
                  disabled={loading || !tema.trim()}
                  className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${loading
                      ? 'bg-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400'
                    }`}
                >
                  {loading ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Gerar Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Seleção de Etapas */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-400" />
                  Etapas
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs text-amber-400 hover:text-amber-300"
                  >
                    Todas
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={selectNone}
                    className="text-xs text-slate-400 hover:text-slate-300"
                  >
                    Nenhuma
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-3">
                {etapasSelecionadas.length} etapa(s) selecionada(s)
              </p>

              <div className="space-y-1 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {ETAPAS.map((etapa) => (
                  <button
                    key={etapa.id}
                    onClick={() => toggleEtapa(etapa.id)}
                    className={`w-full px-3 py-2 rounded-lg flex items-center gap-3 transition ${etapasSelecionadas.includes(etapa.id)
                        ? 'bg-amber-500/20 border border-amber-400/40'
                        : 'bg-slate-900/30 border border-transparent hover:bg-slate-700/30'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${etapasSelecionadas.includes(etapa.id) ? 'bg-amber-500 text-black' : 'bg-slate-600 text-slate-400'
                      }`}>
                      {etapa.id}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm ${etapasSelecionadas.includes(etapa.id) ? 'text-white' : 'text-slate-400'}`}>
                        {etapa.nome}
                      </p>
                    </div>
                    {etapasSelecionadas.includes(etapa.id) && (
                      <CheckCircle className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Gurus */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" />
                Gurus Envolvidos
              </h2>
              <div className="flex flex-wrap gap-2">
                {gurusUsados.map((guru) => (
                  <span key={guru} className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 rounded-full text-sm text-amber-300">
                    {guru}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna Direita - Projetos e Resultados */}
          <div className="lg:col-span-2 space-y-6">
            {/* Projeto Atual */}
            {projetoAtual && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Projeto Atual
                  </h2>
                  <button
                    onClick={() => setOutputExpandido(!outputExpandido)}
                    className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300"
                  >
                    {outputExpandido ? 'Ocultar' : 'Ver'} Output
                    {outputExpandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-900/50 rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1">Tema</p>
                    <p className="text-white font-medium">{projetoAtual.tema}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1">Produto</p>
                    <p className="text-white font-medium capitalize">{projetoAtual.produto}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {projetoAtual.status === 'running' ? (
                    <>
                      <Clock className="w-5 h-5 text-yellow-400 animate-spin" />
                      <span className="text-yellow-400">
                        Gerando... (Etapa {projetoAtual.etapa}/{projetoAtual.etapas?.length})
                      </span>
                    </>
                  ) : projetoAtual.status === 'completed' ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400">Concluído!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400">Erro</span>
                    </>
                  )}
                </div>

                {outputExpandido && projetoAtual.outputDir && (
                  <div className="bg-slate-900/50 rounded-xl p-4 font-mono text-sm text-green-400 overflow-x-auto">
                    <p>📁 {projetoAtual.outputDir}</p>
                    <p>✅ 14 arquivos gerados</p>
                  </div>
                )}
              </div>
            )}

            {/* Lista de Projetos */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Projetos Recentes
              </h2>

              {projetos.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  Nenhum projeto ainda. Crie o primeiro!
                </p>
              ) : (
                <div className="space-y-3">
                  {projetos.map((projeto) => (
                    <div
                      key={projeto.id}
                      className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 hover:border-amber-400/40 transition cursor-pointer"
                      onClick={() => setProjetoAtual(projeto)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-white font-medium">{projeto.tema}</h3>
                          <p className="text-sm text-slate-400 capitalize">{projeto.produto} • {projeto.etapas?.length || 0} etapas</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {projeto.status === 'completed' && (
                            <button className="p-2 hover:bg-slate-700 rounded-lg transition" title="Baixar">
                              <Download className="w-4 h-4 text-amber-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); excluirProjeto(projeto.id); }}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${projeto.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            projeto.status === 'running' ? 'bg-yellow-500/20 text-yellow-400' :
                              projeto.status === 'error' ? 'bg-red-500/20 text-red-400' :
                                'bg-slate-500/20 text-slate-400'
                          }`}>
                          {projeto.status === 'completed' ? 'Concluído' :
                            projeto.status === 'running' ? 'Em andamento' :
                              projeto.status === 'error' ? 'Erro' : 'Pendente'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(projeto.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
