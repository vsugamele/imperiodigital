// Gemini 3 Pro Debug - Vamos ver o que a API retorna exatamente

const https = require('https');
const fs = require('fs');

const GEMINI_API_KEY = 'AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90';
const MODEL = 'gemini-3-pro-image-preview';

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
                    console.log('❌ Parse error:', e.message);
                    console.log('📄 Raw response (first 2000 chars):');
                    console.log(body.substring(0, 2000));
                    resolve({ error: 'Parse error', raw: body });
                }
            });
        });
        req.on('error', reject);
        req.write(JSON.stringify(data));
        req.end();
    });
}

async function debugGeminiResponse() {
    console.log('🔍 GEMINI 3 PRO DEBUG - Vendo resposta completa');
    console.log('==============================================');
    
    const imageBuffer = fs.readFileSync('laise.jpg');
    const imageBase64 = imageBuffer.toString('base64');
    
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
                        text: "Generate a new image of this same person as a professional businesswoman in a modern office setting."
                    },
                    {
                        inline_data: {
                            mime_type: 'image/jpeg',
                            data: imageBase64.substring(0, 1000) + '...' // Reduzir para debug
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: {
                aspectRatio: "1:1",
                imageSize: "1K"
            }
        }
    };
    
    try {
        console.log('📡 Enviando request...');
        const response = await makeRequest(options, payload);
        
        console.log('📊 RESPOSTA COMPLETA:');
        console.log('===================');
        console.log(JSON.stringify(response, null, 2));
        
        // Analisar estrutura
        console.log('\n🔍 ANÁLISE DA ESTRUTURA:');
        console.log('========================');
        
        if (response.candidates) {
            console.log(`✅ candidates: ${response.candidates.length} candidato(s)`);
            
            response.candidates.forEach((candidate, i) => {
                console.log(`\n📝 Candidato ${i}:`);
                
                if (candidate.content && candidate.content.parts) {
                    console.log(`   parts: ${candidate.content.parts.length}`);
                    
                    candidate.content.parts.forEach((part, j) => {
                        console.log(`   Part ${j}:`);
                        if (part.text) {
                            console.log(`     ✓ text: ${part.text.length} chars`);
                        }
                        if (part.inline_data) {
                            console.log(`     ✓ inline_data: ${part.inline_data.data ? part.inline_data.data.length : 'null'} chars`);
                            console.log(`     ✓ mime_type: ${part.inline_data.mime_type || 'null'}`);
                        }
                        if (part.inlineData) {
                            console.log(`     ✓ inlineData: ${part.inlineData.data ? part.inlineData.data.length : 'null'} chars`);
                            console.log(`     ✓ mimeType: ${part.inlineData.mimeType || 'null'}`);
                        }
                        
                        // Verificar outras propriedades
                        Object.keys(part).forEach(key => {
                            if (key !== 'text' && key !== 'inline_data' && key !== 'inlineData') {
                                console.log(`     ? ${key}: ${typeof part[key]}`);
                            }
                        });
                    });
                }
            });
        }
        
        if (response.usageMetadata) {
            console.log('\n📊 Usage:');
            console.log(`   Total tokens: ${response.usageMetadata.totalTokenCount}`);
            if (response.usageMetadata.candidatesTokensDetails) {
                response.usageMetadata.candidatesTokensDetails.forEach(detail => {
                    console.log(`   ${detail.modality}: ${detail.tokenCount} tokens`);
                });
            }
        }
        
    } catch (error) {
        console.log('❌ Erro:', error.message);
    }
}

debugGeminiResponse();