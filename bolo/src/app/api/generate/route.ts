import { NextRequest, NextResponse } from 'next/server';

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const nichePrompts: Record<string, string> = {
  ecommerce: "Crie uma legenda persuasiva para Instagram sobre {{prompt}}. Formato: Hook de atenção, benefícios, call-to-action para comprar. Tom: profissional mas conversacional.",
  igaming: "Crie uma legenda para post de iGaming sobre {{prompt}}. Formato: Hook Chamativo, contexto do jogo/oferta, CTA paraコメント (comentar). Tom: descontraído, excitante, direto.",
  saude: "Crie uma legenda para Instagram sobre {{prompt}}. Formato: Hook de empatia, solução, call-to-action para DM ou compra. Tom: acolhedor, profissional, motivacional.",
  educacao: "Crie uma legenda para post sobre {{prompt}}. Formato: Hook de curiosidade, valor oferecido, call-to-action para詳く (ver mais). Tom: inspirador, educacional.",
  b2b: "Crie uma legenda profissional para LinkedIn sobre {{prompt}}. Formato: Problema, solução, call-to-action para contato. Tom: corporativo, Authority."
};

const platformStyles: Record<string, string> = {
  instagram: "Inclua hashtags relevantes no final. Max 2200 caracteres.",
  facebook: "Texto mais longo permitido. Inclua call-to-action claro.",
  tiktok: "Hook nos primeiros 3 segundos. Texto curto e impactante."
};

async function generateWithGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Erro na API do Gemini');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function POST(request: NextRequest) {
  try {
    const { platform, niche, prompt: userPrompt } = await request.json();

    if (!platform || !niche || !userPrompt) {
      return NextResponse.json({ error: 'platform, niche e prompt são obrigatórios' }, { status: 400 });
    }

    // Build the prompt for Gemini
    const basePrompt = nichePrompts[niche] || nichePrompts.ecommerce;
    const styleNote = platformStyles[platform] || '';
    const fullPrompt = basePrompt.replace('{{prompt}}', userPrompt) + '\n\n' + styleNote;

    // Generate content
    const copy = await generateWithGemini(fullPrompt);

    const result = {
      id: crypto.randomUUID(),
      copy: copy.trim(),
      platform,
      niche,
      creditsUsed: 1,
      createdAt: new Date().toISOString()
    };

    // TODO: Salvar no Supabase quando o banco estiver configurado
    // const { error } = await supabase.from('generated_content').insert({...});

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao gerar conteúdo' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Listar conteúdo gerado (mock por enquanto)
  return NextResponse.json([]);
}
