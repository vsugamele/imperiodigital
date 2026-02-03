// Gemini 3 Pro Image Preview - Sistema Exato que Funcionava
// Baseado no exemplo que você enviou

const https = require('https');
const fs = require('fs');

const GEMINI_API_KEY = 'AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90';
const MODEL = 'gemini-3-pro-image-preview';

console.log('🎨 GEMINI 3 PRO IMAGE PREVIEW - SISTEMA EXATO');
console.log('============================================');
console.log('🤖 Modelo:', MODEL);
console.log('🔑 API Key configurada');
console.log('');

async function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    resolve(result);
                } catch (e) {
                    console.log('Raw response:', body.substring(0, 1000));
                    resolve({ error: 'Parse error', raw: body });
                }
            });
        });
        req.on('error', reject);
        req.write(JSON.stringify(data));
        req.end();
    });
}

async function generateImageWithGemini(referenceImagePath, prompt, aspectRatio = '1:1', resolution = '2K') {
    console.log(`🔄 Gerando imagem...`);
    console.log(`📸 Referência: ${referenceImagePath}`);
    console.log(`📝 Prompt: ${prompt}`);
    console.log(`📏 Resolução: ${resolution} (${aspectRatio})`);
    console.log('');
    
    // Carregar e converter imagem de referência para base64
    if (!fs.existsSync(referenceImagePath)) {
        console.log(`❌ Imagem não encontrada: ${referenceImagePath}`);
        return null;
    }
    
    const imageBuffer = fs.readFileSync(referenceImagePath);
    const imageBase64 = imageBuffer.toString('base64');
    const mimeType = referenceImagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    
    // Configurar requisição
    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${MODEL}:generateContent`,
        method: 'POST',
        headers: {
            'x-goog-api-key': GEMINI_API_KEY,
            'Content-Type': 'application/json'
        }
    };
    
    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: prompt
                    },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: imageBase64
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: {
                aspectRatio: aspectRatio,
                imageSize: resolution
            }
        }
    };
    
    try {
        console.log('📡 Enviando para Gemini 3 Pro Image...');
        const response = await makeRequest(options, payload);
        
        if (response.error) {
            console.log('❌ Erro na API:', response.error);
            if (response.raw) {
                console.log('📄 Resposta raw:', response.raw.substring(0, 500));
            }
            return null;
        }
        
        if (response.candidates && response.candidates[0]) {
            const candidate = response.candidates[0];
            
            // Procurar por partes de imagem
            if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                    if (part.text) {
                        console.log('📝 Texto gerado:', part.text);
                    }
                    
                    if (part.inline_data && part.inline_data.data) {
                        console.log('🎉 IMAGEM GERADA COM SUCESSO!');
                        
                        // Salvar imagem
                        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
                        const filename = `laise_gemini_${timestamp}.png`;
                        
                        const imageData = Buffer.from(part.inline_data.data, 'base64');
                        fs.writeFileSync(filename, imageData);
                        
                        console.log(`💾 Imagem salva: ${filename}`);
                        console.log(`📊 Tamanho: ${Math.round(imageData.length/1024)} KB`);
                        
                        return {
                            filename: filename,
                            size: imageData.length,
                            text: candidate.content.parts.find(p => p.text)?.text || null
                        };
                    }
                }
            }
        }
        
        console.log('⚠️ Resposta sem imagem:', JSON.stringify(response, null, 2));
        return null;
        
    } catch (error) {
        console.log('❌ Erro na requisição:', error.message);
        return null;
    }
}

async function generateLaiseScenario(scenario, description) {
    const referenceImage = 'laise.jpg';
    
    const prompt = `Generate a new image of this same person in a different scenario.

SCENARIO: ${scenario}
DESCRIPTION: ${description}

REQUIREMENTS:
✓ MAINTAIN THE EXACT SAME PERSON - identical facial features, hair, eyes, expression
✓ ONLY change the clothing, background, and setting
✓ Professional quality photography
✓ High resolution and sharp details
✓ Maintain the person's natural pose and confident expression
✓ Ensure lighting complements the new scenario

Generate the image maintaining 100% character consistency.`;

    console.log(`🎯 CENÁRIO: ${scenario}`);
    console.log(`📝 DESCRIÇÃO: ${description}`);
    console.log('');
    
    const result = await generateImageWithGemini(referenceImage, prompt, '1:1', '2K');
    
    if (result) {
        console.log('');
        console.log('✅ LAISE GERADA COM SUCESSO!');
        console.log(`📸 Arquivo: ${result.filename}`);
        console.log(`📊 Tamanho: ${Math.round(result.size/1024)} KB`);
        if (result.text) {
            console.log(`📝 Descrição: ${result.text.substring(0, 200)}...`);
        }
        return result;
    } else {
        console.log('❌ FALHA NA GERAÇÃO');
        return null;
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('🎯 USO:');
        console.log('node gemini-image-exact.js "cenário" "descrição"');
        console.log('');
        console.log('📝 EXEMPLOS:');
        console.log('node gemini-image-exact.js "piloto militar" "cockpit de jato F-35, uniforme militar, céu dramático"');
        console.log('node gemini-image-exact.js "empresária" "escritório moderno, terno executivo, vista da cidade"');
        console.log('node gemini-image-exact.js "praia tropical" "biquíni elegante, praia paradisíaca, pôr do sol"');
        console.log('');
        console.log('📸 REQUISITO: laise.jpg deve estar no workspace');
        console.log('');
        return;
    }
    
    const scenario = args[0];
    const description = args[1] || 'cenário detalhado e realista';
    
    await generateLaiseScenario(scenario, description);
}

main();