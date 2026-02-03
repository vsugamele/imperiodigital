// Gemini 3 Pro Image - Versão que funciona
const https = require('https');
const fs = require('fs');

const GEMINI_API_KEY = 'AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90';

console.log('🎨 GEMINI 3 PRO IMAGE - VERSÃO FUNCIONANDO');
console.log('=========================================');

async function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve({ error: 'Parse error', raw: body });
                }
            });
        });
        req.on('error', reject);
        req.write(JSON.stringify(data));
        req.end();
    });
}

async function generateLaiseImage(prompt) {
    console.log(`🔄 Gerando: ${prompt}`);
    
    // Carregar imagem
    const imageBuffer = fs.readFileSync('laise.jpg');
    const imageBase64 = imageBuffer.toString('base64');
    
    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: '/v1beta/models/gemini-3-pro-image-preview:generateContent',
        method: 'POST',
        headers: {
            'x-goog-api-key': GEMINI_API_KEY,
            'Content-Type': 'application/json'
        }
    };
    
    const payload = {
        contents: [{
            parts: [
                { text: prompt },
                {
                    inline_data: {
                        mime_type: 'image/jpeg',
                        data: imageBase64
                    }
                }
            ]
        }],
        generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: {
                aspectRatio: "1:1",
                imageSize: "2K"
            }
        }
    };
    
    try {
        console.log('📡 Enviando para Gemini...');
        const response = await makeRequest(options, payload);
        
        if (response.error) {
            console.log('❌ Erro:', response.error.message);
            return null;
        }
        
        console.log('📊 Resposta recebida!');
        
        // Debug da estrutura
        if (response.candidates && response.candidates[0]) {
            const parts = response.candidates[0].content.parts;
            console.log(`📝 ${parts.length} part(s) na resposta`);
            
            parts.forEach((part, i) => {
                console.log(`Part ${i}:`);
                Object.keys(part).forEach(key => {
                    console.log(`  ${key}: ${typeof part[key]}`);
                });
                
                // Procurar dados de imagem em qualquer formato
                if (part.inline_data && part.inline_data.data) {
                    console.log('🎉 IMAGEM ENCONTRADA! (inline_data)');
                    return saveImage(part.inline_data.data, 'gemini_inline');
                }
                
                if (part.inlineData && part.inlineData.data) {
                    console.log('🎉 IMAGEM ENCONTRADA! (inlineData)');
                    return saveImage(part.inlineData.data, 'gemini_camelCase');
                }
                
                // Verificar outras propriedades
                Object.keys(part).forEach(propKey => {
                    if (typeof part[propKey] === 'object' && part[propKey] !== null) {
                        Object.keys(part[propKey]).forEach(subKey => {
                            if (subKey.toLowerCase().includes('data') && typeof part[propKey][subKey] === 'string') {
                                console.log(`🎉 POSSÍVEL IMAGEM: ${propKey}.${subKey}`);
                                return saveImage(part[propKey][subKey], `gemini_${propKey}_${subKey}`);
                            }
                        });
                    }
                });
            });
        }
        
        console.log('🔍 Resposta completa salva em debug.json');
        fs.writeFileSync('debug.json', JSON.stringify(response, null, 2));
        
        return false;
        
    } catch (error) {
        console.log('❌ Erro na requisição:', error.message);
        return null;
    }
}

function saveImage(base64Data, prefix) {
    try {
        const timestamp = Date.now();
        const filename = `${prefix}_${timestamp}.png`;
        const imageData = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filename, imageData);
        
        console.log(`💾 Imagem salva: ${filename} (${Math.round(imageData.length/1024)} KB)`);
        return filename;
    } catch (error) {
        console.log(`❌ Erro ao salvar: ${error.message}`);
        return null;
    }
}

async function main() {
    const prompt = process.argv[2] || "Transform this person into a professional businesswoman in a modern office setting, maintaining identical facial features";
    
    await generateLaiseImage(prompt);
}

main();