// Sistema Universal com rclone (SEM problemas de API)
const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

const GEMINI_API_KEY = 'AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90';
const CONFIG_FILE = 'config/drive-folders.json';

console.log('🎨 SISTEMA UNIVERSAL COM RCLONE');
console.log('==============================');

// Carregar configuração
let DRIVE_CONFIG = {};
try {
    DRIVE_CONFIG = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
} catch (e) {
    console.error('❌ Erro ao ler config/drive-folders.json');
    process.exit(1);
}

async function checkRclone() {
    try {
        await execAsync('.\\rclone.exe version');
        console.log('✅ rclone encontrado');
        
        // Verificar se está configurado para Google Drive
        const { stdout } = await execAsync('.\\rclone.exe listremotes');
        if (!stdout.includes('gdrive:')) {
            console.log('⚠️  rclone não configurado para Google Drive');
            console.log('Execute: .\\rclone.exe config');
            console.log('Escolha: Google Drive, nome: "gdrive"');
            return false;
        }
        return true;
    } catch (e) {
        console.log('❌ rclone.exe não encontrado');
        console.log('Execute o download automático ou baixe: https://rclone.org/downloads/');
        return false;
    }
}

async function generateImage(person, scenario) {
    const imagePath = `${person.toLowerCase()}.jpg`;
    console.log(`📸 Buscando imagem base: ${imagePath}`);
    
    if (!fs.existsSync(imagePath)) {
        console.log(`❌ Imagem ${imagePath} não encontrada!`);
        return null;
    }
    
    console.log(`🎯 Cenário: ${scenario}`);
    
    const gender = person.toLowerCase() === 'laise' ? 'WOMAN' : 'MAN';
    
    const prompt = `Transform this ${gender} into: ${scenario}

CRITICAL REQUIREMENTS:
✓ MAINTAIN exact same person - identical face, hair, eyes
✓ Preserve all facial features perfectly
✓ ONLY change: clothes, background, environment
✓ Professional 2K photography quality`;

    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    console.log('🚀 Gerando com Gemini 3 Pro Image...');
    
    try {
        const response = await new Promise((resolve, reject) => {
            const req = https.request({
                hostname: 'generativelanguage.googleapis.com',
                path: '/v1beta/models/gemini-3-pro-image-preview:generateContent',
                method: 'POST',
                headers: { 'x-goog-api-key': GEMINI_API_KEY, 'Content-Type': 'application/json' }
            }, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => resolve(JSON.parse(body)));
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
                    console.log('✅ Imagem gerada com sucesso!');
                    return { buffer: Buffer.from(part.inlineData.data, 'base64'), scenario: scenario };
                }
            }
        }
        return null;
    } catch (error) {
        console.log('❌ Erro Gemini:', error.message);
        return null;
    }
}

async function uploadWithRclone(imageBuffer, person, scenario) {
    const folderId = DRIVE_CONFIG.folders[person.toLowerCase()];
    if (!folderId) {
        console.log(`❌ ID da pasta para '${person}' não encontrado!`);
        return null;
    }

    console.log(`📤 Upload com rclone para pasta de ${person}...`);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `${person.toUpperCase()}_${scenario.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_${timestamp}.png`;
    
    // Salvar localmente
    fs.writeFileSync(filename, imageBuffer);
    console.log(`💾 Salvo localmente: ${filename}`);
    
    // Upload via rclone - MUITO mais simples!
    const targetPath = `gdrive:${folderId}/${filename}`;
    
    try {
        console.log('⬆️  Fazendo upload via rclone...');
        const { stdout, stderr } = await execAsync(`.\\rclone.exe copyto "${filename}" "${targetPath}" --progress`);
        
        if (stderr && stderr.includes('ERROR')) {
            console.log('❌ Erro rclone:', stderr);
            return null;
        }
        
        console.log('✅ Upload concluído com rclone!');
        console.log(`🔗 Localização: ${targetPath}`);
        
        return { filename: filename, targetPath: targetPath };
        
    } catch (error) {
        console.log('❌ Erro no upload rclone:', error.message);
        return null;
    }
}

async function main() {
    const person = process.argv[2];
    const scenario = process.argv[3];
    
    if (!person || !scenario) {
        console.log('Uso: node sistema-rclone.js <nome> <cenario>');
        console.log('Ex: node sistema-rclone.js teo "piloto de avião"');
        return;
    }
    
    try {
        // Verificar rclone
        const rcloneOk = await checkRclone();
        if (!rcloneOk) {
            console.log('❌ Configure rclone primeiro');
            return;
        }
        
        // Gerar imagem
        const result = await generateImage(person, scenario);
        if (!result) {
            console.log('❌ Falha na geração');
            return;
        }
        
        // Upload via rclone
        const uploadResult = await uploadWithRclone(result.buffer, person, result.scenario);
        if (uploadResult) {
            console.log('🎉 SISTEMA RCLONE EXECUTADO COM SUCESSO!');
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

main();