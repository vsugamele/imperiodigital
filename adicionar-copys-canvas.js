// Adicionar Copy's nas Imagens usando Canvas (Node.js)
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const glob = util.promisify(require('glob'));

const execAsync = util.promisify(exec);

const COPYS = [
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

async function addTextToImage(inputPath, text, outputPath) {
    try {
        const image = await loadImage(inputPath);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        
        // Desenhar imagem original
        ctx.drawImage(image, 0, 0);
        
        // Configurar texto
        const fontSize = 70;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        // Medir texto
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize;
        
        // Adicionar fundo semi-transparente
        const padding = 60;
        const bgY = image.height - textHeight - padding * 2;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, bgY, image.width, textHeight + padding * 2);
        
        // Adicionar texto branco
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(text, image.width / 2, image.height - padding);
        
        // Salvar
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
        
        return true;
    } catch (error) {
        console.error(`Erro ao processar ${inputPath}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('🎨 ADICIONANDO COPYS NAS IMAGENS DO TEO');
    console.log('=======================================');
    console.log('');
    
    // Verificar se canvas está disponível
    try {
        require('canvas');
    } catch (e) {
        console.log('❌ Módulo canvas não encontrado. Instalando...');
        await execAsync('npm install canvas');
        console.log('✅ Canvas instalado');
    }
    
    let count = 0;
    const total = 30;
    
    for (let i = 1; i <= total; i++) {
        const num = String(i).padStart(2, '0');
        const pattern = `TEO_PREMIO_${num}_*.png`;
        const files = await glob(pattern);
        
        // Filtrar arquivos que já têm _COM_COPY
        const inputFiles = files.filter(f => !f.includes('_COM_COPY'));
        
        if (inputFiles.length === 0) {
            console.log(`⚠️  Imagem ${num} não encontrada`);
            continue;
        }
        
        const inputFile = inputFiles[0];
        const copyText = COPYS[i - 1];
        const outputFile = inputFile.replace('.png', '_COM_COPY.png');
        
        console.log(`[${i}/${total}] ${copyText}`);
        
        if (await addTextToImage(inputFile, copyText, outputFile)) {
            console.log(`  ✅ Criado: ${outputFile}`);
            
            // Upload para Drive
            const targetPath = `gdrive:1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP/${outputFile}`;
            try {
                await execAsync(`.\\rclone.exe copyto "${outputFile}" "${targetPath}"`);
                console.log(`  ☁️  Upload concluído`);
                count++;
            } catch (e) {
                console.log(`  ⚠️  Erro no upload`);
            }
        }
    }
    
    console.log('');
    console.log('🎉 CONCLUÍDO!');
    console.log('=============');
    console.log(`✅ Processadas: ${count}/${total} imagens`);
    console.log(`📁 Drive: Pasta do Teo`);
    console.log(`📝 Arquivos: *_COM_COPY.png`);
}

main();