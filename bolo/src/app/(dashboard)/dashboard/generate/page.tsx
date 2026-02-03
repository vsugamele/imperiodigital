"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Instagram, Facebook, Video, Loader2, Check } from "lucide-react";

const platforms = [
  { id: "instagram", name: "Instagram", icon: Instagram },
  { id: "facebook", name: "Facebook", icon: Facebook },
  { id: "tiktok", name: "TikTok", icon: Video },
];

const niches = [
  { id: "ecommerce", name: "E-commerce" },
  { id: "igaming", name: "iGaming / Apostas" },
  { id: "saude", name: "Saúde e Bem-estar" },
  { id: "educacao", name: "Educação" },
  { id: "b2b", name: "B2B / Serviços" },
];

export default function GeneratePage() {
  const [platform, setPlatform] = useState("instagram");
  const [niche, setNiche] = useState("ecommerce");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setGenerating(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, niche, prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar conteúdo");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Erro ao gerar conteúdo");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Gerar Conteúdo</h1>
        <p className="text-slate-600 mt-1">Crie posts automaticamente com IA</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {/* Plataforma */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">Plataforma</label>
            <div className="flex gap-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                    platform === p.id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <p.icon className="w-4 h-4" /> {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Nicho */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Nicho</label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {niches.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>

          {/* Prompt */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              O que você quer promover?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Vender curso de trader com 30% de desconto, lançando essa semana..."
              className="w-full h-40 px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Botão */}
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Gerar Conteúdo
              </>
            )}
          </button>
        </div>

        {/* Result Preview */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Preview</h3>
          
          {result ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-2">Legenda gerada:</p>
                <p className="text-slate-900 whitespace-pre-wrap">{result.copy}</p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="w-4 h-4" /> Conteúdo gerado com sucesso!
              </div>
              
              <div className="text-sm text-slate-500">
                Créditos usados: {result.creditsUsed}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Sparkles className="w-12 h-12 mb-4 opacity-50" />
              <p>Preencha o formulário e clique em gerar</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-2">💡 Dicas</h3>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• Seja específico sobre seu produto ou serviço</li>
          <li>• Inclua detalhes como preço, desconto ou benefícios</li>
          <li>• A IA vai adaptar o tom para a plataforma escolhida</li>
        </ul>
      </div>
    </div>
  );
}
