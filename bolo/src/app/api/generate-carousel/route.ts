import { NextRequest, NextResponse } from 'next/server';

const CAROUSEL_SYSTEM_PROMPT = `Você é um especialista em marketing digital e criação de carrosséis para redes sociais.

Gere um carrossél profissional baseado nos parâmetros e referências fornecidas.

Nichos e seus estilos:
- ecommerce: vendas, promoções, benefícios do produto
- igaming: descontraído, linguagem jovem, confiante
- saude: acolhedor, motivacional, científico
- educacao: didático, claro, inspirador
- b2b: profissional, dados, ROI

Tons disponíveis:
- profissional: sério, confiável
- descontraído: amigável, casual
- urgente: FOMO, escassez
- humoristico: engraçado, viral

DIRETRIZES DE CRIAÇÃO:
1. O primeiro slide deve ser um HOOK forte para prender atenção
2. O último slide deve ter um CTA claro para o usuário agir
3. Slides do meio devem Educar/Entreter/Persuadir
4. Use a paleta de cores informada
5. Mantenha consistência visual com as referências
6. Cada slide deve ter no máximo 8 palavras no título e 80 caracteres no copy

Formato de resposta (JSON):
{
  "slides": [
    {
      "slide_number": 1,
      "title": "Título chamativo (até 8 palavras)",
      "copy": "Texto completo do slide (até 80 caracteres)",
      "cta": "Call to action se aplicável"
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const { 
      platform, 
      niche, 
      tone, 
      topic, 
      projectDescription,
      colorPalette,
      referencePerson,
      slidesCount,
      canvasElements,
      references,
      hasReferences 
    } = await request.json();

    if (!topic || !niche || !tone) {
      return NextResponse.json({ error: 'Parâmetros incompletos' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY não configurado' }, { status: 500 });
    }

    // Build context from references
    let referencesContext = '';
    
    if (references && references.length > 0) {
      referencesContext = `\n\nREFERÊNCIAS VISUAIS FORNECIDAS:\n`;
      references.forEach((ref: any, i: number) => {
        referencesContext += `[Referência ${i + 1}]: ${ref.name}\n`;
      });
      referencesContext += `\nDIRETRIZES DAS REFERÊNCIAS:\n`;
      referencesContext += `- Analise o estilo, cores e composição de cada referência\n`;
      referencesContext += `- Inspire-se nos elementos visuais que funcionam bem\n`;
      referencesContext += `- Mantenha consistência com a paleta e tom das referências\n`;
    }
    
    // Build context from canvas/slides
    let canvasContext = '';
    
    if (canvasElements && Array.isArray(canvasElements) && canvasElements.length > 0) {
      canvasContext = `\n\nLAYOUT DO CANVAS:\n`;
      
      canvasElements.forEach((slide: any, i: number) => {
        canvasContext += `\n--- ${slide.name || `Slide ${i + 1}`} ---\n`;
        
        if (slide.elements && slide.elements.length > 0) {
          slide.elements.forEach((el: any) => {
            if (el.type === 'image') {
              canvasContext += `- Imagem posicionada (${Math.round(el.x)}, ${Math.round(el.y)})\n`;
            } else if (el.type === 'text') {
              canvasContext += `- Texto: "${el.content}"\n`;
            } else if (el.type === 'rect') {
              canvasContext += `- Forma/colorida com cor ${el.color}\n`;
            }
          });
        }
      });
    }
    
    if (projectDescription) {
      canvasContext += `\n\nDESCRIÇÃO DO PRODUTO:\n${projectDescription}`;
    }
    
    if (colorPalette) {
      canvasContext += `\n\nPALETA DE CORES:\n${colorPalette}\nUse estas cores no design!`;
    }
    
    if (referencePerson) {
      canvasContext += `\n\nREFERÊNCIA DE ESTILO:\n${referencePerson}`;
    }

    const userPrompt = `Gere um carrossel de ${slidesCount || 6} slides para ${platform}.

Nichos: ${niche}
Tom: ${tone}
Tema/Produto: ${topic}
${referencesContext}
${canvasContext}

OBJETIVO: Criar um carrossel que combine as referências visuais com os elementos do layout, seguindo as diretrizes de marketing.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: CAROUSEL_SYSTEM_PROMPT },
            { text: userPrompt }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `Gemini API: ${error}` }, { status: 500 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch) : { slides: [] };

    const slidesWithMetadata = parsed.slides.map((slide: any, i: number) => ({
      ...slide,
      image_url: null,
      layout: i === 0 ? 'hook' : i === parsed.slides.length - 1 ? 'cta' : 'content',
      color_palette: colorPalette || null,
      reference_style: referencePerson || null,
      references_used: references?.length || 0
    }));

    return NextResponse.json({
      topic,
      platform,
      niche,
      tone,
      projectDescription,
      colorPalette,
      referencePerson,
      referencesCount: references?.length || 0,
      slides: slidesWithMetadata,
      created_at: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Carousel generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
