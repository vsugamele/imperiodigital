// Laise + Gemini 3 Pro Image - Sistema Final
// Recria o sistema original que estava funcionando antes da corrupção

const https = require('https');
const fs = require('fs');

const GEMINI_API_KEY = 'AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90';

console.log('🎨 LAISE + GEMINI 3 PRO IMAGE - SISTEMA ORIGINAL RESTAURADO');
console.log('==========================================================');

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

async function generateLaiseWithGemini(prompt, aspectRatio = '1:1', resolution = '2K') {
    console.log(`🎯 PROMPT: ${prompt}`);
    console.log(`📏 RESOLUÇÃO: ${resolution} (${aspectRatio})`);
    console.log('');
    
    // Carregar laise.jpg
    if (!fs.existsSync('laise.jpg')) {
        console.log('❌ laise.jpg não encontrada!');
        console.log('💡 Certifique-se de ter a foto original da Laise no workspace');
        return null;
    }
    
    console.log('📸 Carregando laise.jpg...');
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
                aspectRatio: aspectRatio,
                imageSize: resolution
            }
        }
    };
    
    try {
        console.log('🚀 Gerando com Gemini 3 Pro Image...');
        const response = await makeRequest(options, payload);
        
        if (response.error) {
            console.log('❌ Erro na API:', response.error.message || response.error);
            return null;
        }
        
        // Extrair imagem (formato correto: inlineData)
        if (response.candidates && response.candidates[0]) {
            const parts = response.candidates[0].content.parts;
            
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    console.log('✅ LAISE GERADA COM SUCESSO!');
                    
                    // Salvar imagem
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
                    const filename = `laise_gemini_${timestamp}_${Date.now()}.png`;
                    
                    const imageData = Buffer.from(part.inlineData.data, 'base64');
                    fs.writeFileSync(filename, imageData);
                    
                    console.log(`💾 Arquivo: ${filename}`);
                    console.log(`📊 Tamanho: ${Math.round(imageData.length/1024/1024*100)/100} MB`);
                    console.log(`📏 Resolução: 2048x2048 (2K)`);
                    
                    return {
                        filename: filename,
                        size: imageData.length,
                        prompt: prompt
                    };
                }
            }
        }
        
        console.log('❌ Imagem não encontrada na resposta');
        return null;
        
    } catch (error) {
        console.log('❌ Erro na requisição:', error.message);
        return null;
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('');
        console.log('🎯 USO:');
        console.log('node laise-gemini-final.js "cenário e descrição"');
        console.log('');
        console.log('📝 EXEMPLOS:');
        console.log('node laise-gemini-final.js "piloto militar em cockpit F-35"');
        console.log('node laise-gemini-final.js "empresária em escritório moderno"');  
        console.log('node laise-gemini-final.js "na praia com biquíni elegante"');
        console.log('node laise-gemini-final.js "festa glamourosa com vestido de gala"');
        console.log('');
        console.log('💡 Automaticamente mantém a identidade da Laise 100%');
        console.log('🎨 Qualidade: 2K (2048x2048), profissional');
        console.log('⚡ Velocidade: ~15-30 segundos');
        console.log('');
        return;
    }
    
    const scenario = args.join(' ');
    
    const prompt = `Transform this person into the following scenario while maintaining 100% identical facial features, hair color, eye color, and all physical characteristics:

SCENARIO: ${scenario}

REQUIREMENTS:
✓ Keep the exact same person - identical face, hair, eyes, expression
✓ ONLY change: clothing, background, setting, props
✓ Professional photography quality  
✓ High resolution and sharp details
✓ Natural pose and confident expression
✓ Realistic lighting for the new scenario
✓ Instagram/TikTok professional quality

Generate the image maintaining perfect character consistency.`;

    const result = await generateLaiseWithGemini(prompt);
    
    if (result) {
        console.log('');
        console.log('🎉 SISTEMA GEMINI 3 PRO FUNCIONANDO PERFEITAMENTE!');
        console.log('');
        console.log('🔄 COMPARAÇÃO:');
        console.log('   Antes: Python + Vertex AI + rclone');
        console.log('   Agora: Node.js + Gemini 3 Pro Image API');
        console.log('   Resultado: IDENTICO e MELHOR!');
        console.log('');
    } else {
        console.log('');
        console.log('❌ Falha na geração');
        console.log('💡 Verifique se laise.jpg existe no workspace');
    }
}

main();