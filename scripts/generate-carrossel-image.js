/**
 * Gerador de Imagens Equilibre ON - Gemini API
 * 
 * Gera imagens para carrosséis usando Gemini Image Generation
 * Baseado nas referências da Vanessa (pasta images/references/vanessa)
 * 
 * Uso: node scripts/generate-carrossel-image.js [slide-num] [tema]
 * 
 * Exemplos:
 *   node scripts/generate-carrossel-image.js 1 "detox digital"
 *   node scripts/generate-carrossel-image.js 2 "rotina matinal"
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const { loadOpsEnv } = require('./_load-ops-env');
loadOpsEnv();

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const OUTPUT_DIR = 'C:\\Users\\vsuga\\clawd\\images\\generated';
const REFERENCES_DIR = 'C:\Users\vsuga\clawd\images\references\vanessa';

// Criar pasta
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ============================================
// PROMPT ENGINEERING - EQUILIBRE ON
// ============================================
const PROMPTS = {
    slide1_gancho: {
        descricao: "Editorial clean com tipografia elegante",
        prompt: "Minimalist editorial photography, solid off-white background, luxurious wellness brand aesthetic, elegant serif typography space, soft natural lighting, high-end magazine style, shallow depth of field, professional product photography setup"
    },
    slide2_problema: {
        descricao: "Mulher elegante em blazer, pose pensativa",
        prompt: "Professional Brazilian woman, 35 years old, wearing elegant cream blazer, thoughtful expression, soft natural studio lighting, luxury wellness brand aesthetic, editorial fashion photography, shallow depth of field, sophisticated and confident"
    },
    slide3_revelacao: {
        descricao: "Close em mãos ou objeto metafórico",
        prompt: "Elegant hands holding smartphone displaying results, soft natural lighting, luxury wellness brand aesthetic, shallow depth of field, professional beauty photography, sophisticated and aspirational"
    },
    slide4_prova: {
        descricao: "Detalhe metafórico (lupa, agenda, caderno)",
        prompt: "Close-up of elegant notebook and magnifying glass on marble surface, luxury wellness brand aesthetic, soft dramatic lighting, editorial still life photography, sophisticated and mysterious"
    },
    slide5_transformacao: {
        descricao: "Mulher em pose confiante/cuidados",
        prompt: "Professional Brazilian woman, 35 years old, elegant self-care moment, soft natural lighting, luxury wellness brand aesthetic, editorial lifestyle photography, confident and radiant"
    },
    slide6_cta: {
        descricao: "Close em celular com resultado",
        prompt: "Smartphone screen showing positive health results, elegant hands holding device, soft natural lighting, luxury wellness brand aesthetic, professional lifestyle photography"
    },
    slide7_mensagem: {
        descricao: "Editorial clean, tipografia centralizada",
        prompt: "Minimalist editorial composition, elegant wellness brand typography space, soft warm lighting, luxurious and sophisticated, high-end magazine style, clean and aspirational"
    }
};

// ============================================
// GEMINI IMAGE GENERATION
// ============================================
function generateWithGemini(prompt, slideNum, tema) {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const filename = `equilibre_slide${slideNum}_${timestamp}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const postData = JSON.stringify({
            contents: [{
                parts: [
                    { text: `Generate a high-quality image for Instagram carousel slide ${slideNum} about "${tema}". 

Style requirements:
- Luxury wellness brand aesthetic
- Editorial magazine style
- Soft natural lighting
- Sophisticated and aspirational
- Clean, professional look

Specific description: ${prompt}

Output: PNG format, 1080x1350 (4:5 ratio), high quality, no text or watermarks.` }
                ]
            }],
            generationConfig: {
                responseModalities: ["IMAGE", "TEXT"]
            }
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => { data += chunk; });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    if (response.error) {
                        // Fallback: return mock response for testing
                        console.log(`⚠️  Gemini API error: ${response.error.message}`);
                        console.log('💡 Continuando sem imagem gerada...');
                        resolve(null);
                        return;
                    }

                    // Parse image from response
                    if (data.includes('base64') || data.includes('inlineData')) {
                        const base64Match = data.match(/"inlineData"\s*:\s*\{[^}]*"data"\s*:\s*"([^"]+)"/);
                        if (base64Match) {
                            const imageData = base64Match[1];
                            fs.writeFileSync(filepath, Buffer.from(imageData, 'base64'));
                            console.log(`✅ Imagem gerada: ${filename}`);
                            resolve(filepath);
                            return;
                        }
                    }

                    console.log('⚠️  Nenhuma imagem na resposta (pode ser normal em alguns casos)');
                    resolve(null);

                } catch (e) {
                    console.log(`⚠️  Erro ao processar resposta: ${e.message}`);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.log(`⚠️  Erro na requisição: ${e.message}`);
            resolve(null);
        });

        req.write(postData);
        req.end();
    });
}

// ============================================
// FALLBACK: USAR REFERÊNCIAS LOCAIS
// ============================================
function useReferenceImage(slideNum) {
    try {
        const files = fs.readdirSync(REFERENCES_DIR)
            .filter(f => f.match(/\.(jpg|jpeg|png)$/i))
            .map(f => ({ f, t: fs.statSync(path.join(REFERENCES_DIR, f)).mtimeMs }))
            .sort((a, b) => b.t - a.t);
        
        if (files.length === 0) {
            console.log('⚠️  Nenhuma referência disponível');
            return null;
        }

        // Selecionar imagem baseada no slide (rotacionar)
        const selectedFile = files[slideNum % files.length].f;
        const srcPath = path.join(REFERENCES_DIR, selectedFile);
        const destFilename = `equilibre_ref_slide${slideNum}_${Date.now()}.jpg`;
        const destPath = path.join(OUTPUT_DIR, destFilename);

        // Copiar para generated
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Referência usada: ${selectedFile} -> ${destFilename}`);
        return destPath;
    } catch (e) {
        console.log(`⚠️  Erro ao usar referência: ${e.message}`);
        return null;
    }
}

// ============================================
// MAIN
// ============================================
function main() {
    const slideNum = parseInt(process.argv[2]) || 1;
    const tema = process.argv.slice(2).join(' ') || "equilíbrio e bem-estar";

    console.log('\n' + '='.repeat(60));
    console.log('🎨 GERADOR DE IMAGENS - EQUILIBRE ON');
    console.log('='.repeat(60));
    console.log(`📋 Slide: ${slideNum}`);
    console.log(`📋 Tema: "${tema}"`);
    console.log('='.repeat(60) + '\n');

    // Verificar API Key
    if (!GEMINI_API_KEY) {
        console.log('⚠️  GEMINI_API_KEY não encontrada');
        console.log('💡 Usando referências locais como fallback\n');
    }

    // Selecionar prompt baseado no slide
    const promptKey = `slide${slideNum}_gancho`;
    const promptConfig = PROMPTS[promptKey] || PROMPTS.slide1_gancho;

    console.log(`🎯 Descrição: ${promptConfig.descricao}`);
    console.log(`📝 Prompt: ${promptConfig.prompt.substring(0, 100)}...\n`);

    // Tentar gerar com Gemini
    if (GEMINI_API_KEY) {
        console.log('🚀 Gerando com Gemini API...\n');
        generateWithGemini(promptConfig.prompt, slideNum, tema).then(result => {
            if (result) {
                console.log(`\n✅ SUCESSO! Imagem salva em: ${result}`);
            } else {
                console.log('\n⚠️  Gemini não retornou imagem, usando referência local...\n');
                const refResult = useReferenceImage(slideNum);
                if (refResult) {
                    console.log(`\n✅ Imagem de referência usada: ${refResult}`);
                } else {
                    console.log('\n❌ Nenhuma imagem disponível');
                }
            }
        });
    } else {
        console.log('🎯 Usando referência local...\n');
        const result = useReferenceImage(slideNum);
        if (result) {
            console.log(`\n✅ Imagem de referência usada: ${result}`);
        }
    }
}

main();
