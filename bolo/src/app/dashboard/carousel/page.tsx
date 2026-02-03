"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from '@supabase/supabase-js';
import { Loader2, Upload, Image, Sparkles, Grid, Link, X, Eye, EyeOff } from "lucide-react";

type ReferenceImage = {
  id: string;
  src: string;
  name: string;
  selected: boolean;
};

export default function CarouselGeneratorPage() {
  const [references, setReferences] = useState<ReferenceImage[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  
  const [platform, setPlatform] = useState("instagram");
  const [niche, setNiche] = useState("ecommerce");
  const [tone, setTone] = useState("profissional");
  const [topic, setTopic] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [referencePerson, setReferencePerson] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Handle file upload
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach((file, i) => {
      if (file.type.startsWith('image/')) {
        const ref: ReferenceImage = {
          id: `ref-${Date.now()}-${i}`,
          src: URL.createObjectURL(file),
          name: file.name,
          selected: true
        };
        setReferences(prev => [...prev, ref]);
      }
    });
    setSelectedCount(prev => prev + Array.from(files).filter(f => f.type.startsWith('image/')).length);
  }, []);

  // Toggle reference selection
  const toggleReference = (id: string) => {
    setReferences(prev => prev.map(r => {
      if (r.id === id) {
        const newSelected = !r.selected;
        setSelectedCount(c => c + (newSelected ? 1 : -1));
        return { ...r, selected: newSelected };
      }
      return r;
    }));
  };

  // Remove reference
  const removeReference = (id: string) => {
    const ref = references.find(r => r.id === id);
    if (ref && ref.selected) {
      setSelectedCount(c => c - 1);
    }
    setReferences(prev => prev.filter(r => r.id !== id));
  };

  // Clear all
  const clearAll = () => {
    setReferences([]);
    setSelectedCount(0);
  };

  // Drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Generate carousel
  const generateCarousel = async () => {
    if (!topic) {
      alert("Digite um tema/produto!");
      return;
    }

    const selectedRefs = references.filter(r => r.selected);
    if (selectedRefs.length === 0 && references.length > 0) {
      alert("Selecione pelo menos uma referência!");
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          niche,
          tone,
          topic,
          projectDescription,
          colorPalette: colorPalette || "modern",
          referencePerson,
          references: selectedRefs.map(r => ({
            name: r.name,
            src: r.src.substring(0, 200)
          })),
          hasReferences: selectedRefs.length > 0
        })
      });

      const data = await response.json();
      
      if (data.error) {
        setResult({ error: data.error });
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setResult({ error: e.message });
    }

    setGenerating(false);
  };

  const presetPalettes = [
    { name: "Moderna", colors: "#000000, #FFFFFF, #3B82F6" },
    { name: "Quente", colors: "#FF6B6B, #FFE66D, #4ECDC4" },
    { name: "Luxo", colors: "#1A1A2E, #16213E, #E94560" },
    { name: "Natureza", colors: "#2D5016, #8BC34A, #FFF59D" },
    { name: "Corporate", colors: "#1E3A5F, #3B82F6, #93C5FD" },
    { name: "Feminino", colors: "#EC4899, #F472B6, #FBBF24" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">🎠 BOLO</h1>
              <p className="text-slate-600 text-sm">Gerador de Carrosséis com IA</p>
            </div>
            <div className="flex items-center gap-4">
              {references.length > 0 && (
                <button 
                  onClick={clearAll}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  🗑️ Limpar tudo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Left Panel - References Gallery */}
        <div className="w-2/3 p-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  🖼️ Suas Referências
                  {references.length > 0 && (
                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {selectedCount} selecionadas
                    </span>
                  )}
                </h2>
                <p className="text-sm text-slate-500">Clique nas imagens para selecionar</p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4" /> Adicionar
              </button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              multiple
              accept="image/*"
              className="hidden"
            />

            {/* Drop Zone */}
            <div 
              ref={dropZoneRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors mb-6"
            >
              <Grid className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <p className="text-slate-600 font-medium">Arraste imagens aqui ou clique para upload</p>
              <p className="text-sm text-slate-400 mt-1">JPG, PNG, WebP • Múltiplas imagens</p>
            </div>

            {/* References Grid */}
            {references.length > 0 && (
              <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {references.map(ref => (
                  <div 
                    key={ref.id}
                    onClick={() => toggleReference(ref.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                      ref.selected 
                        ? 'ring-4 ring-blue-500 shadow-lg scale-105' 
                        : 'ring-1 ring-slate-200 hover:ring-slate-300'
                    }`}
                  >
                    <img 
                      src={ref.src} 
                      alt={ref.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Selected indicator */}
                    {ref.selected && (
                      <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                        <div className="bg-blue-600 text-white rounded-full p-2 shadow-lg">
                          <Eye className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                    
                    {/* Not selected indicator */}
                    {!ref.selected && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <EyeOff className="w-6 h-6 text-white" />
                      </div>
                    )}

                    {/* Remove button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeReference(ref.id); }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {references.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Image className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p>Nenhuma referência ainda</p>
                <p className="text-sm">Adicione imagens para começar</p>
              </div>
            )}
          </div>

          {/* Results */}
          {result && (
            <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
              <h3 className="font-semibold mb-4">✅ Resultado: {result.topic}</h3>
              
              <div className="grid grid-cols-3 gap-4">
                {result.slides?.map((slide: any, i: number) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <div className="aspect-square bg-slate-100 flex items-center justify-center">
                      <Image className="w-10 h-10 text-slate-300" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold">{slide.title}</p>
                      <p className="text-xs text-slate-500">{slide.copy?.substring(0, 50)}...</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Settings */}
        <div className="w-1/3 p-6 border-l bg-white">
          <div className="sticky top-6">
            <h2 className="font-semibold mb-4">⚙️ Configurações</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Plataforma</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                  <option value="instagram">Instagram (4:5)</option>
                  <option value="facebook">Facebook (1.91:1)</option>
                  <option value="tiktok">TikTok (9:16)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Nichos</label>
                <select value={niche} onChange={(e) => setNiche(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                  <option value="ecommerce">E-commerce</option>
                  <option value="igaming">iGaming</option>
                  <option value="saude">Saúde</option>
                  <option value="educacao">Educação</option>
                  <option value="b2b">B2B</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Tom</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                  <option value="profissional">Profissional</option>
                  <option value="descontraido">Descontraído</option>
                  <option value="urgente">Urgente</option>
                  <option value="humoristico">Humorístico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Tema/Produto *</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: Vitaminas para cabelo"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Descrição</label>
                <textarea 
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Detalhes do produto..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Referência (pessoa/marca)</label>
                <input 
                  type="text" 
                  value={referencePerson}
                  onChange={(e) => setReferencePerson(e.target.value)}
                  placeholder="Ex: @nike, Kylie Jenner..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Paleta de Cores</label>
                <select 
                  value={colorPalette} 
                  onChange={(e) => setColorPalette(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Automático</option>
                  {presetPalettes.map(p => (
                    <option key={p.name} value={p.colors}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button 
              onClick={generateCarousel}
              disabled={generating || !topic || (references.length > 0 && selectedCount === 0)}
              className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              {generating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Gerando...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> 🎨 Gerar Carrossel</>
              )}
            </button>

            {references.length > 0 && selectedCount === 0 && (
              <p className="text-xs text-orange-500 mt-2 text-center">
                Selecione pelo menos uma referência acima
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
