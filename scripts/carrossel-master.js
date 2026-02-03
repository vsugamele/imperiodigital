/**
 * MASTER: Gera Carrossel Completo Equilibre ON
 * 
 * 1. Gera 7 textos (estrutura do carrossel)
 * 2. Gera 7 imagens com Gemini API
 * 3. Cria HTML visual com as imagens reais
 * 
 * Uso: node scripts/carrossel-master.js [tema]
 * 
 * Exemplo: node scripts/carrossel-master.js "detox digital e clareza mental"
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const { loadOpsEnv } = require('./_load-ops-env');
loadOpsEnv();

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const OUTPUT_DIR = 'C:\\Users\\vsuga\\clawd\\images\\generated';
const CARROSSEL_OUTPUT = 'C:\\Users\\vsuga\\clawd\\results\\carrossel-equilibre-visual.html';

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ============================================
// PROMPTS POR SLIDE
// ============================================
const SLIDE_PROMPTS = {
    1: {
        tipo: "D",
        descricao: "Editorial clean com tipografia elegante",
        prompt: "Minimalist editorial photography, solid off-white background (#F8F6F3), luxurious wellness brand aesthetic, elegant typography space, soft natural lighting, high-end magazine style, shallow depth of field, sophisticated and clean"
    },
    2: {
        tipo: "A", 
        descricao: "Mulher elegante em blazer, pose pensativa",
        prompt: "Professional Brazilian woman, 35 years old, wearing elegant cream blazer, thoughtful confident expression, soft natural studio lighting, luxury wellness brand aesthetic, editorial fashion photography, shallow depth of field, sophisticated and empowering"
    },
    3: {
        tipo: "B",
        descricao: "Close em mãos segurando celular com resultado",
        prompt: "Elegant hands holding smartphone displaying health results, soft natural lighting, luxury wellness brand aesthetic, shallow depth of field, professional beauty photography, sophisticated and aspirational, clean background"
    },
    4: {
        tipo: "C",
        descricao: "Detalhe metafórico (lupa, agenda, caderno)",
        prompt: "Close-up of elegant notebook with pen on marble surface, luxury wellness brand aesthetic, soft dramatic lighting, editorial still life photography, sophisticated and mysterious, warm tones"
    },
    5: {
        tipo: "A",
        descricao: "Mulher em pose confiante/cuidados",
        prompt: "Professional Brazilian woman, 35 years old, elegant self-care moment looking in mirror, soft natural lighting, luxury wellness brand aesthetic, editorial lifestyle photography, confident and radiant, warm and sophisticated"
    },
    6: {
        tipo: "B",
        descricao: "Close em celular com resultado",
        prompt: "Smartphone screen showing positive wellness results with clean app interface, elegant hands holding device, soft natural lighting, luxury wellness brand aesthetic, professional lifestyle photography, clean and modern"
    },
    7: {
        tipo: "D",
        descricao: "Editorial clean, tipografia centralizada",
        prompt: "Minimalist editorial composition, solid off-white background (#F8F6F3), elegant wellness brand typography space, soft warm lighting, luxurious and sophisticated, high-end magazine style, clean and aspirational"
    }
};

// ============================================
// COPY TEMPLATES
// ============================================
const COPY_TEMPLATES = [
    { slide: 1, gancho: ["A verdade que *ninguém te conta* sobre {tema}...", "Se você está {tema}, provavelmente está fazendo errado.", "{tema} é a resposta. Mas não a que você imagina."] },
    { slide: 2, problema: ["A maioria das pessoas falha em {tema} porque *foca no sintoma*, não na causa.", "Você já tentou de tudo para {tema} e nada funcionou? Eu sei por quê.", "{tema} não é sobre fazer mais. É sobre *fazer diferente*."] },
    { slide: 3, revelacao: ["O segredo? Não está no que você *adiciona*. Está no que você *remove*.", "A resposta está na sua *rotina matinal*, não em suplementos caros.", "Médicos não te contam isso porque não lucram com a verdade."] },
    { slide: 4, prova: ["Mulheres que aplicaram isso têm *resultados em 21 dias*.", "A ciência confirma: {tema} funciona quando você *acerta a base*.", "Não é mito. É *bioquímica básica* que todo mundo ignora."] },
    { slide: 5, transformacao: ["Quando você acerta {tema}, sua vida *muda em camadas*.", "Mais energia, clareira mental, sono profundo. É tudo conectado.", "Não é sobre viver mais. É sobre *viver melhor* em cada dia."] },
    { slide: 6, cta: ["Quer saber exatamente como aplicar isso na sua rotina?", "Comenta aqui que eu te mando o *passo a passo*.", "Salva esse carrossel e *revisita* quando precisar."] },
    { slide: 7, mensagem: ["{tema} é um *ato de autocuidado radical*.", "Você merece a versão mais saudável e rica de você mesma.", "Começa hoje. O resto é consequência."] }
];

// ============================================
// HELPER FUNCTIONS
// ============================================
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function generateText(tema, slideNum) {
    const template = COPY_TEMPLATES.find(t => t.slide === slideNum);
    if (!template) return { principal: "", secundario: "" };
    
    const principals = Object.values(template)[1];
    const principal = capitalize(rand(principals).replace(/{tema}/g, tema.toLowerCase()));
    
    const secundarios = {
        1: "Swipe para descobrir a verdade",
        2: "Spoiler: Não é sobre força de vontade",
        3: "A ciência por trás da transformação",
        4: "Resultados que falam por si",
        5: "O efeito cascata do bem-estar",
        6: "Salva e compartilha com quem precisa ouvir",
        7: "Sua transformação começa agora"
    };
    
    return { principal, secundario: secundarios[slideNum] };
}

async function generateImage(slideNum, tema) {
    return new Promise((resolve) => {
        const promptConfig = SLIDE_PROMPTS[slideNum];
        const filename = `equilibre_slide${slideNum}_${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        if (!GEMINI_API_KEY) {
            console.log(`⚠️  Slide ${slideNum}: Sem API Key, pulando geração`);
            resolve(null);
            return;
        }

        const postData = JSON.stringify({
            contents: [{
                parts: [{ text: `Generate a high-quality image for Instagram carousel slide ${slideNum} about "${tema}". 

Style: Luxury wellness brand aesthetic, editorial magazine style, soft natural lighting.
Description: ${promptConfig.prompt}

Output: PNG format, 1080x1350 (4:5 ratio), high quality, no text, no watermarks.` }]
            }],
            generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const base64Match = data.match(/"inlineData"\s*:\s*\{[^}]*"data"\s*:\s*"([^"]+)"/);
                    if (base64Match) {
                        fs.writeFileSync(filepath, Buffer.from(base64Match[1], 'base64'));
                        console.log(`✅ Slide ${slideNum}: Imagem gerada`);
                        resolve(filepath);
                    } else {
                        console.log(`⚠️  Slide ${slideNum}: Nenhuma imagem na resposta`);
                        resolve(null);
                    }
                } catch (e) {
                    console.log(`⚠️  Slide ${slide}: Erro - ${e.message}`);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => { console.log(`⚠️  Slide ${slideNum}: Erro - ${e.message}`); resolve(null); });
        req.write(postData);
        req.end();
    });
}

function generateHTML(tema, slidesData) {
    const colors = {
        primary: "#FFFFFF",
        accent: "#3D6B58",
        secondary: "#C8B2A7",
        text: "#1A1A1A",
        background: "#F8F6F3"
    };

    const slidesHTML = slidesData.map(slide => {
        const imgPath = slide.imagem ? 
            `file:///C:/Users/vsuga/clawd/images/generated/${path.basename(slide.imagem)}` : 
            null;
        
        let layoutHTML = '';
        
        if (slide.tipo === 'A') {
            layoutHTML = imgPath ? `
                <div class="slide-bg" style="background-image: url('${imgPath}');"></div>
                <div class="anchor-block" style="background: ${colors.accent}">
                    <div class="texto-principal">"${slide.texto.principal}"</div>
                    <div class="texto-secundario">${slide.texto.secundario}</div>
                </div>
            ` : `<div class="anchor-block" style="background: ${colors.accent}">
                <div class="texto-principal">"${slide.texto.principal}"</div>
                <div class="texto-secundario">${slide.texto.secundario}</div>
            </div>`;
        } else if (slide.tipo === 'B') {
            layoutHTML = `<div class="bloco-topo" style="background: ${colors.primary}">
                <div class="texto-principal">"${slide.texto.principal}"</div>
            </div>
            <div class="bloco-rodape" style="background: ${colors.secondary}">
                <div class="texto-secundario">${slide.texto.secundario}</div>
            </div>`;
        } else if (slide.tipo === 'C') {
            layoutHTML = `<div class="floating-box" style="background: ${colors.primary}">
                <div class="texto-box">${slide.texto.secundario}</div>
                <div class="texto-principal">"${slide.texto.principal}"</div>
            </div>`;
        } else {
            layoutHTML = `<div class="bloco-clean" style="border-color: ${colors.secondary}">
                <div class="texto-principal">"${slide.texto.principal}"</div>
                <div class="texto-secundario" style="color: ${colors.accent}">${slide.texto.secundario}</div>
            </div>`;
        }
        
        return `<div class="slide tipo-${slide.tipo.toLowerCase()}">
            <span class="slide-num">${slide.num}/7</span>
            ${layoutHTML}
        </div>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carrossel Equilibre ON - ${tema}</title>
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
        
        .header h1 { font-family: 'Playfair Display', serif; font-size: 2.5rem; margin-bottom: 10px; }
        
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
            display: flex;
            flex-direction: column;
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

        .slide-bg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-size: cover;
            background-position: center;
        }

        /* TIPO A */
        .tipo-a {
            background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%);
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
            padding: 25px;
        }
        .tipo-a .texto-principal {
            font-family: 'Playfair Display', serif;
            font-size: 16px;
            font-weight: 600;
            color: white;
            line-height: 1.4;
            margin-bottom: 10px;
        }
        .tipo-a .texto-secundario {
            font-size: 11px;
            color: rgba(255,255,255,0.9);
            font-weight: 500;
        }

        /* TIPO B */
        .tipo-b { background: #F8F6F3; }
        .tipo-b .bloco-topo {
            height: 50%;
            background: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 25px;
            text-align: center;
        }
        .tipo-b .bloco-rodape {
            height: 50%;
            background: #C8B2A7;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 25px;
            text-align: center;
        }
        .tipo-b .texto-principal {
            font-family: 'Playfair Display', serif;
            font-size: 15px;
            color: #1A1A1A;
            line-height: 1.4;
            font-style: italic;
        }
        .tipo-b .texto-secundario {
            font-size: 12px;
            color: white;
            font-weight: 500;
        }

        /* TIPO C */
        .tipo-c { background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%); }
        .tipo-c .floating-box {
            position: absolute;
            bottom: 15%;
            left: 10%;
            width: 80%;
            background: #FFFFFF;
            border-radius: 12px;
            padding: 18px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        }
        .tipo-c .floating-box::before {
            content: "";
            position: absolute;
            top: -10px;
            left: 25px;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 10px solid #FFFFFF;
        }
        .tipo-c .texto-box {
            position: absolute;
            top: -40px;
            left: 20px;
            background: #C8B2A7;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 10px;
            color: white;
            font-weight: 500;
        }
        .tipo-c .texto-principal {
            font-family: 'Playfair Display', serif;
            font-size: 14px;
            color: #3D6B58;
            line-height: 1.4;
            font-weight: 600;
        }

        /* TIPO D */
        .tipo-d { background: #F8F6F3; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px; }
        .tipo-d .bloco-clean {
            border: 2px solid #C8B2A7;
            padding: 35px 25px;
            max-width: 90%;
            text-align: center;
        }
        .tipo-d .texto-principal {
            font-family: 'Playfair Display', serif;
            font-size: 19px;
            color: #1A1A1A;
            line-height: 1.5;
            font-weight: 400;
            margin-bottom: 15px;
        }
        .tipo-d .texto-secundario {
            font-size: 11px;
            color: #3D6B58;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-weight: 500;
        }

        .controls {
            text-align: center;
            margin-top: 40px;
            color: white;
        }
        .controls button {
            background: #3D6B58;
            border: none;
            padding: 12px 30px;
            border-radius: 30px;
            color: white;
            font-family: 'Montserrat', sans-serif;
            font-size: 14px;
            cursor: pointer;
            margin: 0 10px;
        }
        .controls button:hover { opacity: 0.9; transform: scale(1.05); }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎠 Equilibre ON</h1>
        <p>Carrossel Editorial - "${tema}"</p>
        <span style="background: #3D6B58; padding: 5px 15px; border-radius: 20px; font-size: 12px;">Block System v5 + Gemini AI</span>
    </div>

    <div class="carrossel-container">
        ${slidesHTML}
    </div>

    <div class="controls">
        <button onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
        <button onclick="location.reload()">🎲 Novo Carrossel</button>
    </div>
</body>
</html>`;
}

// ============================================
// MAIN
// ============================================
async function main() {
    const tema = process.argv.slice(2).join(' ') || "equilíbrio e bem-estar";

    console.log('\n' + '='.repeat(60));
    console.log('🎠 CARROSSEL MASTER - EQUILIBRE ON + GEMINI AI');
    console.log('='.repeat(60));
    console.log(`📋 Tema: "${tema}"`);
    console.log(`🖼️  Imagens: Gemini API`);
    console.log('='.repeat(60) + '\n');

    const slidesData = [];

    // Gerar slides
    for (let i = 1; i <= 7; i++) {
        console.log(`📝 Slide ${i}/7...`);
        const texto = generateText(tema, i);
        slidesData.push({ num: i, tipo: SLIDE_PROMPTS[i].tipo, texto });
    }

    // Gerar imagens
    console.log('\n🎨 Gerando imagens com Gemini API...\n');
    for (let i = 1; i <= 7; i++) {
        console.log(`🖼️  Imagem ${i}/7...`);
        const imagem = await generateImage(i, tema);
        slidesData[i-1].imagem = imagem;
        await sleep(2000); // Rate limiting
    }

    // Gerar HTML
    console.log('\n📄 Gerando HTML visual...\n');
    const html = generateHTML(tema, slidesData);
    fs.writeFileSync(CARROSSEL_OUTPUT, html);
    console.log(`✅ HTML salvo: ${CARROSSEL_OUTPUT}`);

    // Resumo
    console.log('\n' + '='.repeat(60));
    console.log('✅ CARROSSEL COMPLETO!');
    console.log('='.repeat(60));
    console.log(`📋 Tema: ${tema}`);
    console.log(`🖼️  Imagens geradas: ${slidesData.filter(s => s.imagem).length}/7`);
    console.log(`📄 Visual: ${CARROSSEL_OUTPUT}`);
    console.log('\n💡 Abra o HTML no navegador para ver o resultado!');
}

main().catch(console.error);
