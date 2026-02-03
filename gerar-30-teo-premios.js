// Gerador de 30 Imagens do Teo com Cenários e Copy's
const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

const GEMINI_API_KEY = 'AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90';
const DRIVE_FOLDER_ID = '1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP'; // Teo

// 30 Cenários realistas
const scenarios = [
    "cassino luxuoso em Las Vegas, luzes neon, slots machines ao fundo",
    "escritório executivo moderno, terno elegante, vista panorâmica",
    "praia tropical paradisíaca, pôr do sol dourado, areia branca",
    "restaurante gourmet sofisticado, mesa elegante, ambiente intimista",
    "academia de luxo, equipamentos high-tech, iluminação profissional",
    "cobertura penthouse, vista noturna da cidade, decoração moderna",
    "iate de luxo no mar, deck espaçoso, céu azul",
    "sala de poker VIP, fichas empilhadas, ambiente exclusivo",
    "bar sofisticado, whisky premium, iluminação ambiente",
    "estúdio de música profissional, equipamentos premium, acústica perfeita",
    "loja de carros de luxo, superesportivo ao fundo, showroom premium",
    "campo de golfe exclusivo, green impecável, céu limpo",
    "spa de luxo, ambiente zen, decoração minimalista",
    "biblioteca clássica, livros antigos, ambiente acolhedor",
    "terraço urbano, sunset views, plantas tropicais",
    "sala de cinema privada, poltronas de couro, tela gigante",
    "cozinha gourmet, bancada de mármore, utensílios profissionais",
    "salão de festas elegante, lustres de cristal, piso espelhado",
    "lounge de aeroporto VIP, ambiente sofisticado, conforto premium",
    "quadra de tênis profissional, grama impecável, arquibancada",
    "sala de troféus, prêmios exibidos, iluminação dramática",
    "estúdio fotográfico profissional, luzes softbox, fundo infinito",
    "rooftop bar, city lights, ambiente descontraído",
    "sala de jogos vintage, fliperama clássico, neon retrô",
    "piscina infinity, borda infinita, vista oceânica",
    "wine cellar premium, garrafas raras, madeira nobre",
    "sala de conferência executiva, mesa oval, tecnologia integrada",
    "boutique de luxo, roupas exclusivas, ambiente sofisticado",
    "estacionamento VIP, carros premium, iluminação LED",
    "salão de beleza premium, cadeiras de couro, espelhos iluminados"
];

// 30 Copy's geradas
const copys = [
    "Manda aqui e concorra 🎁🔥",
    "Participa aqui 🫡💰",
    "Manda que eu to sorteando 🎁😎",
    "Comenta aqui e ganha 🔥🫡",
    "Manda aqui pro prêmio 💰👇🏻",
    "Participa que eu to de 👀🎁",
    "Manda aqui e boa sorte 🫡🔥",
    "Comenta e concorre 😎💰",
    "Manda aqui pro sorteio 🎁🔥",
    "Participa aqui 🫡😎👇🏻",
    "Manda que tem prêmio 💰🔥",
    "Comenta e ganha 🎁🫡",
    "Manda aqui e torce 😎💰",
    "Participa do sorteio 🔥🎁",
    "Manda que eu to vendo 👀🫡",
    "Comenta aqui pro prêmio 💰😎",
    "Manda e boa sorte 🎁🔥",
    "Participa aqui 🫡💰👇🏻",
    "Manda que tem ganhador 🔥😎",
    "Comenta e concorre aqui 🎁🫡",
    "Manda pro sorteio 💰🔥",
    "Participa que eu to sorteando 😎🎁",
    "Manda aqui e participa 🫡💰",
    "Comenta e ganha hoje 🔥🎁",
    "Manda que eu to de olho 👀💰",
    "Participa do prêmio 🫡😎",
    "Manda aqui e torce 🎁🔥",
    "Comenta pro sorteio 💰🫡",
    "Manda que vai ter ganhador 😎🎁",
    "Participa aqui agora 🔥💰🫡"
];

let generatedCount = 0;
const TOTAL = 30;

async function generateImage(index) {
    const scenario = scenarios[index];
    const copy = copys[index];
    
    console.log(`\n[${index + 1}/${TOTAL}] Gerando: ${scenario.substring(0, 50)}...`);
    console.log(`Copy: ${copy}`);
    
    const imageBuffer = fs.readFileSync('teo.jpg');
    const imageBase64 = imageBuffer.toString('base64');
    
    const prompt = `Transform this MAN into: ${scenario}

CRITICAL REQUIREMENTS:
✓ MAINTAIN exact same person - identical face, hair, eyes, beard
✓ Professional photography quality 2K
✓ Realistic lighting and environment
✓ Instagram-worthy composition
✓ Natural pose and confident expression

Context: This is for a premium social media post about prizes/giveaways.

Generate maintaining perfect character consistency.`;

    try {
        const response = await new Promise((resolve, reject) => {
            const req = https.request({
                hostname: 'generativelanguage.googleapis.com',
                path: '/v1beta/models/gemini-3-pro-image-preview:generateContent',
                method: 'POST',
                headers: {
                    'x-goog-api-key': GEMINI_API_KEY,
                    'Content-Type': 'application/json'
                }
            }, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        reject(new Error('Parse error'));
                    }
                });
            });
            req.on('error', reject);
            req.write(JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: 'image/jpeg', data: imageBase64 }}
                    ]
                }],
                generationConfig: {
                    responseModalities: ["TEXT", "IMAGE"],
                    imageConfig: { aspectRatio: "1:1", imageSize: "2K" }
                }
            }));
            req.end();
        });
        
        if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    const newImageBuffer = Buffer.from(part.inlineData.data, 'base64');
                    
                    // Salvar localmente
                    const filename = `TEO_PREMIO_${(index + 1).toString().padStart(2, '0')}_${scenario.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30).toUpperCase()}.png`;
                    fs.writeFileSync(filename, newImageBuffer);
                    
                    console.log(`✅ Gerada: ${filename}`);
                    
                    // Upload via rclone
                    const targetPath = `gdrive:${DRIVE_FOLDER_ID}/${filename}`;
                    await execAsync(`.\\rclone.exe copyto "${filename}" "${targetPath}"`);
                    
                    console.log(`☁️  Upload concluído`);
                    
                    generatedCount++;
                    return true;
                }
            }
        }
        
        console.log(`❌ Falha na geração #${index + 1}`);
        return false;
        
    } catch (error) {
        console.log(`❌ Erro #${index + 1}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('🎨 GERADOR DE 30 IMAGENS DO TEO');
    console.log('================================');
    console.log(`📁 Destino: Drive Teo (${DRIVE_FOLDER_ID})`);
    console.log('');
    
    const startTime = Date.now();
    
    // Gerar sequencialmente para não sobrecarregar
    for (let i = 0; i < TOTAL; i++) {
        await generateImage(i);
        
        // Pequena pausa entre gerações
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000 / 60);
    
    console.log('');
    console.log('🎉 GERAÇÃO COMPLETA!');
    console.log('===================');
    console.log(`✅ Geradas: ${generatedCount}/${TOTAL}`);
    console.log(`⏱️  Tempo: ${duration} minutos`);
    console.log('☁️  Todas no Drive da pasta Teo');
}

main();