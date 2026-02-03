/**
 * Agente de Carrossel Editorial - Equilibre ON
 * 
 * Gera estrutura de carrossel 7 slides usando o Prompt Master
 * 
 * Uso: node scripts/carrossel-equilibre.js [tema]
 * 
 * Exemplos:
 *   node scripts/carrossel-equilibre.js " detox digital "
 *   node scripts/carrossel-equilibre.js "rotina matinal luxury"
 *   node scripts/carrossel-equilibre.js "microbiota e clareira mental"
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ============================================
// PROMPT MASTER (O MANIFESTO)
// ============================================
const PROMPT_MASTER = `
🎯 OBJETIVO
Gerar estrutura para carrossel de Instagram com estética "High-Ticket Medical/Wellness".
Visual: Fusão de autoridade clínica com editorial de revista de luxo (Vogue Wellness).
Prioridade: Sofisticação visual através de BLOCOS SÓLIDOS de cor e tipografia elegante.

🧠 FILOSOFIA CRIATIVA
• A imagem vende o desejo, o texto em bloco vende a verdade.
• NUNCA parecer um post "dica de saúde" caseiro.
• SEMPRE parecer uma campanha de marca de luxo ou uma "verdade secreta" revelada.

🎨 SISTEMA VISUAL (RIGOROSO - "THE BLOCK SYSTEM")
1. PALETA DE CORES:
   - Branco Puro (#FFFFFF) - Para limpeza.
   - Rosa Antigo/Salmão (#E68C98) - Para destaque feminino/suave.
   - Beige/Camel Nude (#C8B2A7) - Para sofisticação/neutro quente.
   - Texto: Preto Profundo ou Chumbo.

2. TIPOGRAFIA:
   - Headlines: Serifada Moderna Elegante (Playfair Display, Cormorant).
   - Corpo: Sans-serif minimalista (Montserrat, Helvetica Neue).
   - *Itálico* para ênfase em palavras-chave.

3. ESTRUTURA DE LAYOUT:
   - TIPO A (Anchor Block): Bloco sólido GIGANTE (40-50% da imagem).
   - TIPO B (Stacked Blocks): Dois blocos empilhados (Branco + Beige).
   - TIPO C (Floating Box): Caixa menor flutuante com borda sutil.
   - TIPO D (Clean/Manifesto): Fundo 100% sólido, tipografia centralizada.

4. DIREÇÃO FOTOGRÁFICA:
   - Alta resolução, luz natural ou estúdio dramático.
   - Temas: Autoridade (blazer), Lifestyle/Self-care, Metáforas, Detalhes.

✍️ SISTEMA DE COPY
• Texto curto, direto e impactante.
• Focar na dor oculta ou quebra de objeção.
• Tom: A "irmã mais velha rica e médica" que te conta a verdade dura.

🚀 FORMATO DE SAÍDA (JSON)
Para cada slide (1-7), gerar:
{
  "slide": 1,
  "tipo": "A|B|C|D",
  "visual": "Descrição da foto e posição dos blocos",
  "textoPrincipal": "Frase manchete (indicar cor do bloco)",
  "textoSecundario": "Complemento (indicar em qual caixa)"
}
`;

// ============================================
// CONTEXTO DO PROJETO
// ============================================
function loadProjectContext() {
    const ctxPath = path.join(__dirname, '..', 'config', 'vanessa-equilibre.json');
    if (fs.existsSync(ctxPath)) {
        return JSON.parse(fs.readFileSync(ctxPath, 'utf8'));
    }
    return {
        name: "Vanessa Equilibre ON",
        style: "luxury-health-editorial",
        colors: {
            primary: "#FFFFFF",
            accent: "#E68C98", 
            secondary: "#C8B2A7",
            text: "#1A1A1A"
        },
        copyThemes: [
            "Autoridade clínica",
            "Quebra de objeções",
            "Transformação lifestyle"
        ]
    };
}

// ============================================
// GERADOR DE CARROSSEL (Mock - usa regras)
// ============================================
function generateCarouselStructure(tema, projectContext) {
    // Templates baseados no sistema de 7 slides clássico
    const slideTemplates = [
        {
            slide: 1,
            tipo: "D",
            titulo: "O GANCHO",
            copyTemplates: [
                "A verdade que *ninguém te conta* sobre {tema}...",
                "Se você está {tema}, provavelmente está fazendo errado.",
                "{tema} é a resposta. Mas não a que você imagina."
            ]
        },
        {
            slide: 2,
            tipo: "A",
            titulo: "O PROBLEMA",
            copyTemplates: [
                "A maioria das pessoas falha em {tema} porque *foca no sintoma*, não na causa.",
                "Você já tentou de tudo para {tema} e nada funcionou? Eu sei por quê.",
                "{tema} não é sobre fazer mais. É sobre *fazer diferente*."
            ]
        },
        {
            slide: 3,
            tipo: "B",
            titulo: "A REVELAÇÃO",
            copyTemplates: [
                "O segredo? Não está no que você *adiciona*. Está no que você *remove*.",
                "Médicos não te contam isso porque não lucram com a verdade.",
                "A resposta está na sua *rotina matinal*, não em suplementos caros."
            ]
        },
        {
            slide: 4,
            tipo: "C",
            titulo: "A PROVA",
            copyTemplates: [
                "Mulheres que aplicaram isso têm *resultados em 21 dias*.",
                "A ciência confirma: {tema} funciona quando você *acerta a base*.",
                "Não é mito. É *bioquímica básica* que todo mundo ignora."
            ]
        },
        {
            slide: 5,
            tipo: "A",
            titulo: "A TRANSFORMAÇÃO",
            copyTemplates: [
                "Quando você acerta {tema}, sua vida *muda em camadas*.",
                "Mais energia, clareira mental, sono profundo. É tudo conectado.",
                "Não é sobre viver mais. É sobre *viver melhor* em cada dia."
            ]
        },
        {
            slide: 6,
            tipo: "B",
            titulo: "O CALL TO ACTION",
            copyTemplates: [
                "Quer saber exatamente como aplicar isso na sua rotina?",
                "Comenta aqui que eu te mando o *passo a passo*.",
                "Salva esse carrossel e *revisita* quando precisar."
            ]
        },
        {
            slide: 7,
            tipo: "D",
            titulo: "A MENSAGEM FINAL",
            copyTemplates: [
                "{tema} é um *ato de autocuidado radical*.",
                "Você merece a versão mais saudável e rica de você mesma.",
                "Começa hoje. O resto é consequência."
            ]
        }
    ];

    function rand(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function generateVisual(tipo, slideNum) {
        const visuals = {
            A: "Mulher elegante (blazer) em fundo desfocado, bloco rosa cobrindo 50% inferior da imagem",
            B: "Close em mãos segurando celular com resultado, bloco branco topo + beige rodapé",
            C: "Detalhe de objeto metafórico (lupa, agenda), caixa flutuante branca apontando para ele",
            D: "Editorial clean, fundo off-white sólido, tipografia centralizada Playfair Display"
        };
        return visuals[tipo] || visuals.A;
    }

    function generateTextPrincipal(tema, slide) {
        const copy = rand(slide.copyTemplates);
        return capitalize(copy.replace(/{tema}/g, tema.toLowerCase()));
    }

    function generateTextSecundario(slide) {
        const secundarios = {
            1: "Swipe para descobrir a verdade",
            2: "Spoiler: Não é sobre força de vontade",
            3: "A ciência por trás da transformação",
            4: "Resultados que falam por si",
            5: "O efeito cascata do bem-estar",
            6: "Salva e compartilha com quem precisa ouvir",
            7: "Sua transformação começa agora"
        };
        return secundarios[slide.slide] || "";
    }

    // Usar cores do projeto
    const accentColor = projectContext.colors?.accent || "#3D6B58";
    const primaryColor = projectContext.colors?.primary || "#FFFFFF";
    const secondaryColor = projectContext.colors?.secondary || "#C8B2A7";

    // Gerar estrutura completa
    const slides = slideTemplates.map(template => ({
        slide: template.slide,
        tipo: template.tipo,
        tituloInterno: template.titulo,
        visual: generateVisual(template.tipo, template.slide),
        textoPrincipal: {
            conteudo: generateTextPrincipal(tema, template),
            corBloco: template.slide % 2 === 0 ? accentColor : primaryColor
        },
        textoSecundario: {
            conteudo: generateTextSecundario(template),
            corBloco: secondaryColor
        }
    }));

    return {
        tema,
        projeto: projectContext.name,
        estilo: projectContext.style,
        dataGeracao: new Date().toISOString(),
        slides,
        meta: {
            coresUsadas: ["#FFFFFF", "#E68C98", "#C8B2A7", "#1A1A1A"],
            tipografia: "Playfair Display + Montserrat",
            totalSlides: 7
        }
    };
}

// ============================================
// DOWNLOAD DE REFERÊNCIAS (Placeholder)
// ============================================
function downloadReferences(folderId, outputDir) {
    console.log(`📁 Pasta Drive: ${folderId}`);
    console.log(`💡 Para integrar: adicionar rclone sync ou API Drive`);
    return [];
}

// ============================================
// GERADOR DE VISUAL HTML
// ============================================
function generateVisualHTML(estrutura) {
    const projectContext = loadProjectContext();
    const colors = projectContext.colors;
    
    const slidesHTML = estrutura.slides.map(slide => {
        const principalBg = slide.textoPrincipal.corBloco;
        const secundarioBg = slide.textoSecundario.corBloco;
        
        let layoutHTML = '';
        
        if (slide.tipo === 'A') {
            layoutHTML = `
                <div class="anchor-block" style="background: ${principalBg}">
                    <div class="texto-principal">"${slide.textoPrincipal.conteudo}"</div>
                    <div class="texto-secundario">${slide.textoSecundario.conteudo}</div>
                </div>
            `;
        } else if (slide.tipo === 'B') {
            layoutHTML = `
                <div class="bloco-topo" style="background: ${principalBg}">
                    <div class="texto-principal">"${slide.textoPrincipal.conteudo}"</div>
                </div>
                <div class="bloco-rodape" style="background: ${secundarioBg}">
                    <div class="texto-secundario">${slide.textoSecundario.conteudo}</div>
                </div>
            `;
        } else if (slide.tipo === 'C') {
            layoutHTML = `
                <div class="floating-box" style="background: ${principalBg}">
                    <div class="texto-box">${slide.textoSecundario.conteudo}</div>
                    <div class="texto-principal">"${slide.textoPrincipal.conteudo}"</div>
                </div>
            `;
        } else { // D
            layoutHTML = `
                <div class="bloco-clean" style="border-color: ${secundarioBg}">
                    <div class="texto-principal">"${slide.textoPrincipal.conteudo}"</div>
                    <div class="texto-secundario" style="color: ${colors.accent}">${slide.textoSecundario.conteudo}</div>
                </div>
            `;
        }
        
        return `
        <div class="slide tipo-${slide.tipo.toLowerCase()}">
            <span class="slide-num">${slide.slide}/7</span>
            ${layoutHTML}
        </div>`;
    }).join('\n');
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carrossel Equilibre ON - ${estrutura.tema}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@300;400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Montserrat', sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }

        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }
        
        .header h1 {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }

        .carrossel-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 30px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .slide {
            width: 320px;
            height: 400px;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            transition: transform 0.3s ease;
            position: relative;
        }

        .slide:hover { transform: translateY(-10px); }

        .slide-num {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.6);
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 100;
        }

        /* TIPO A - Anchor Block */
        .tipo-a {
            background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%);
        }
        
        .tipo-a .anchor-block {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 55%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 30px 25px;
        }

        .tipo-a .texto-principal {
            font-family: 'Playfair Display', serif;
            font-size: 17px;
            font-weight: 600;
            color: white;
            line-height: 1.4;
            margin-bottom: 12px;
        }

        .tipo-a .texto-secundario {
            font-family: 'Montserrat', sans-serif;
            font-size: 11px;
            color: rgba(255,255,255,0.9);
            font-weight: 500;
        }

        /* TIPO B - Stacked Blocks */
        .tipo-b {
            background: ${colors.background};
        }

        .tipo-b .bloco-topo {
            height: 50%;
            background: ${colors.primary};
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 25px;
        }

        .tipo-b .bloco-rodape {
            height: 50%;
            background: ${colors.secondary};
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 25px;
        }

        .tipo-b .texto-principal {
            font-family: 'Playfair Display', serif;
            font-size: 16px;
            color: ${colors.text};
            line-height: 1.4;
            font-style: italic;
            text-align: center;
        }

        .tipo-b .texto-secundario,
        .tipo-d .texto-secundario {
            font-family: 'Montserrat', sans-serif;
            font-size: 12px;
            color: white;
            font-weight: 500;
            text-align: center;
        }

        /* TIPO C - Floating Box */
        .tipo-c {
            background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
        }

        .tipo-c .floating-box {
            position: absolute;
            bottom: 15%;
            left: 10%;
            width: 80%;
            background: ${colors.primary};
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        }

        .tipo-c .floating-box::before {
            content: "";
            position: absolute;
            top: -10px;
            left: 25px;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 10px solid ${colors.primary};
        }

        .tipo-c .texto-box {
            position: absolute;
            top: -40px;
            left: 20px;
            background: ${colors.secondary};
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 10px;
            color: white;
            font-weight: 500;
        }

        .tipo-c .texto-principal {
            font-family: 'Playfair Display', serif;
            font-size: 15px;
            color: ${colors.accent};
            line-height: 1.4;
            font-weight: 600;
        }

        /* TIPO D - Clean Manifesto */
        .tipo-d {
            background: ${colors.background};
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px;
        }

        .tipo-d .bloco-clean {
            border: 2px solid ${colors.secondary};
            padding: 35px 25px;
            max-width: 90%;
            text-align: center;
        }

        .tipo-d .texto-principal {
            font-family: 'Playfair Display', serif;
            font-size: 20px;
            color: ${colors.text};
            line-height: 1.5;
            font-weight: 400;
            margin-bottom: 18px;
        }

        .controls {
            text-align: center;
            margin-top: 40px;
            color: white;
        }

        .controls button {
            background: ${colors.accent};
            border: none;
            padding: 12px 30px;
            border-radius: 30px;
            color: white;
            font-family: 'Montserrat', sans-serif;
            font-size: 14px;
            cursor: pointer;
            margin: 0 10px;
        }

        .controls button:hover {
            opacity: 0.9;
            transform: scale(1.05);
        }

        .legend {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 12px;
            margin-top: 40px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            color: white;
        }

        .legend h3 {
            font-family: 'Playfair Display', serif;
            margin-bottom: 15px;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 12px;
            margin-bottom: 8px;
            opacity: 0.8;
        }

        .color-dot {
            width: 20px;
            height: 20px;
            border-radius: 50%;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎠 Equilibre ON</h1>
        <p>Carrossel Editorial - "${estrutura.tema}"</p>
        <span style="background: ${colors.accent}; padding: 5px 15px; border-radius: 20px; font-size: 12px;">Block System v5 - Luxury Health</span>
    </div>

    <div class="carrossel-container">
        ${slidesHTML}
    </div>

    <div class="legend">
        <h3>🎨 Paleta Equilibre ON</h3>
        <div class="legend-item"><div class="color-dot" style="background: ${colors.primary}; border: 1px solid #ddd;"></div><span>Branco Puro</span></div>
        <div class="legend-item"><div class="color-dot" style="background: ${colors.accent};"></div><span>Verde Luxury (${colors.accent})</span></div>
        <div class="legend-item"><div class="color-dot" style="background: ${colors.secondary};"></div><span>Beige Nude</span></div>
        <div class="legend-item"><div class="color-dot" style="background: ${colors.text};"></div><span>Preto Profundo</span></div>
    </div>

    <div class="controls">
        <button onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
        <button onclick="location.reload()">🎲 Novo Tema</button>
    </div>
</body>
</html>`;
}

// ============================================
// MAIN
// ============================================
function main() {
    const tema = process.argv[2] || "equilíbrio e bem-estar";
    const projectContext = loadProjectContext();

    console.log('\n' + '='.repeat(60));
    console.log('🎠 AGENTE DE CARROSSEL - EQUILIBRE ON');
    console.log('='.repeat(60));
    console.log(`📋 Tema: "${tema}"`);
    console.log(`🏷️  Projeto: ${projectContext.name}`);
    console.log(`🎨 Estilo: ${projectContext.style}`);
    console.log('='.repeat(60) + '\n');

    console.log('📖 Prompt Master carregado!\n');

    // Gerar estrutura
    const estrutura = generateCarouselStructure(tema, projectContext);

    // Salvar output
    const outputPath = path.join(__dirname, '..', 'results', 'carrossel-equilibre.json');
    fs.writeFileSync(outputPath, JSON.stringify(estrutura, null, 2));
    console.log(`💾 Salvo em: ${outputPath}`);

    // Gerar visual HTML
    const visualPath = path.join(__dirname, '..', 'results', 'carrossel-equilibre-visual.html');
    const visualHtml = generateVisualHTML(estrutura);
    fs.writeFileSync(visualPath, visualHtml);
    console.log(`🎨 Visual salvo em: ${visualPath}`);

    // Exibir estrutura
    console.log('\n📋 ESTRUTURA DO CARROSSEL:\n');
    estrutura.slides.forEach(slide => {
        console.log(`┌─ SLIDE ${slide.slide} (Tipo ${slide.tipo})`);
        console.log(`│  📍 Visual: ${slide.visual}`);
        console.log(`│  📝 Principal [${slide.textoPrincipal.corBloco}]: ${slide.textoPrincipal.conteudo}`);
        console.log(`│  📝 Secundário [${slide.textoSecundario.corBloco}]: ${slide.textoSecundario.conteudo}`);
        console.log(`└─────────────────────────────────────────────\n`);
    });

    console.log('✅ Carrossel gerado com sucesso!');
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('   1. Revisar e ajustar textos');
    console.log('   2. Criar visuals no Canva/Figma usando o Block System');
    console.log('   3. Postar no Instagram');
}

main();
