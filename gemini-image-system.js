// Sistema de Geração de Imagens - Gemini 3 Pro + Drive
// Recria o sistema que estava funcionando antes da corrupção

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configurações
const GOOGLE_API_KEY = 'AQ.Ab8RN6ItMZiaE0b5Q_r78lyg-8r2pboURSl86_z7X0-8yiyWLw'; // Gemini
const DRIVE_FOLDER_ID = '1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP';

console.log('🎨 SISTEMA GEMINI 3 PRO + DRIVE');
console.log('==============================');
console.log('');

async function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function analyzePersonWithGemini(imageBase64) {
    console.log('🔍 Analisando pessoa com Gemini 3 Pro...');
    
    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-pro-vision:generateContent?key=${GOOGLE_API_KEY}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };
    
    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: `ANALISE EXTREMAMENTE DETALHADA da pessoa:

Faça uma descrição ultra-precisa que vou usar pra REGENERAR A MESMA PESSOA:

- Formato exato do rosto (oval, quadrado, redondo, etc)  
- Olhos: cor, formato, tamanho, espaçamento
- Nariz: tamanho, forma, largura
- Boca: tamanho, formato dos lábios
- Cabelo: cor exata, textura, comprimento, estilo
- Pele: tom exato, textura
- Idade aparente
- Qualquer marca distintiva
- Forma das sobrancelhas

Seja EXTREMAMENTE específico para manter identidade 100%.`
                    },
                    {
                        inline_data: {
                            mime_type: "image/png",
                            data: imageBase64
                        }
                    }
                ]
            }
        ]
    };
    
    try {
        const response = await makeRequest(options, payload);
        if (response.candidates && response.candidates[0]) {
            const analysis = response.candidates[0].content.parts[0].text;
            console.log('✅ Análise completa!');
            return analysis;
        } else {
            console.log('❌ Erro na análise:', response);
            return null;
        }
    } catch (error) {
        console.log('❌ Erro na requisição:', error.message);
        return null;
    }
}

async function generateImageWithImagenAPI(personAnalysis, newScenario, newClothes) {
    console.log('🎨 Gerando nova imagem com Imagen API...');
    
    // Esta parte usaria Vertex AI Imagen API
    // Por ora, vou simular o processo
    
    const prompt = `TAREFA CRÍTICA: Regenere a MESMA PESSOA em novo cenário.

CARACTERÍSTICAS DA PESSOA (MANTER 100% IDÊNTICAS):
${personAnalysis}

MUDANÇAS APENAS:
- Roupa: ${newClothes}  
- Cenário/Background: ${newScenario}

REQUISITOS:
✓ MESMA PESSOA - rosto e características faciais IDÊNTICAS
✓ Qualidade profissional Instagram/TikTok
✓ Pose e ângulo similar
✓ Iluminação profissional
✓ Nítida, vibrante, alta qualidade
✓ Vertical ou quadrado
✓ NÃO altere NADA do rosto da pessoa

GERE A IMAGEM AGORA.`;

    console.log('📝 Prompt preparado para Imagen API');
    console.log('⚠️  Vertex AI Imagen API não disponível via HTTPS direto');
    console.log('💡 Sistema original usava Service Account + Python SDK');
    
    return {
        status: 'needs_python_sdk',
        prompt: prompt,
        analysis: personAnalysis
    };
}

async function testGeminiAnalysis() {
    console.log('🧪 TESTANDO ANÁLISE COM GEMINI...');
    console.log('');
    
    // Carregar imagem da Laise
    const laisePath = 'laise.jpg';
    if (!fs.existsSync(laisePath)) {
        console.log('❌ laise.jpg não encontrada');
        console.log('💡 Copie uma foto da Laise para testar');
        return false;
    }
    
    console.log('📸 Carregando laise.jpg...');
    const imageBuffer = fs.readFileSync(laisePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    const analysis = await analyzePersonWithGemini(imageBase64);
    
    if (analysis) {
        console.log('');
        console.log('✅ ANÁLISE GEMINI FUNCIONANDO!');
        console.log('');
        console.log('📋 RESULTADO:');
        console.log(analysis.substring(0, 300) + '...');
        
        // Salvar análise
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        fs.writeFileSync(`laise_analysis_${timestamp}.txt`, analysis);
        console.log('');
        console.log(`💾 Análise salva: laise_analysis_${timestamp}.txt`);
        
        return true;
    } else {
        console.log('❌ FALHA NA ANÁLISE');
        return false;
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('🎯 COMANDOS DISPONÍVEIS:');
        console.log('');
        console.log('node gemini-image-system.js test');
        console.log('  → Testa análise Gemini com laise.jpg');
        console.log('');
        console.log('node gemini-image-system.js analyze "cenario" "roupas"');
        console.log('  → Analisa + prepara prompt para geração');
        console.log('');
        console.log('💡 Sistema original Python + Vertex AI:');
        console.log('   python scripts/image-transform-vertex.py "praia" "biquini"');
        console.log('');
        return;
    }
    
    if (args[0] === 'test') {
        await testGeminiAnalysis();
    } else if (args[0] === 'analyze' && args.length >= 3) {
        const scenario = args[1];
        const clothes = args[2];
        
        console.log(`🎯 Cenário: ${scenario}`);
        console.log(`👔 Roupas: ${clothes}`);
        console.log('');
        
        const success = await testGeminiAnalysis();
        if (success) {
            console.log('');
            console.log('🔄 PRÓXIMO PASSO:');
            console.log('   Instalar Python + executar:');
            console.log(`   python scripts/image-transform-vertex.py "${scenario}" "${clothes}"`);
            console.log('');
        }
    } else {
        console.log('❌ Comando inválido. Use: node gemini-image-system.js test');
    }
}

main();