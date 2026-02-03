const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações
const GEMINI_API_KEY = 'AIzaSyDfdZ8LAFnWavLwwkGBcqozxf8YD1IrTvs';
const ELEVENLABS_API_KEY = 'sk_54f161f6e0e7253987a86308d4df826528cfc98067ddf2e1';
const rclonePath = 'C:\\Users\\vsuga\\clawd\\rclone.exe';
const outputDir = path.join(__dirname, '../videos/youtube_long');
const framesDir = path.join(__dirname, '../images/youtube_frames');

// Ensure directories exist
[outputDir, framesDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Gerador de Vídeos Longos para YouTube (O Contador de Histórias)
 * Cria vídeos de 1h+ rotacionando slides e narrando.
 */
async function generateStory(topic) {
    console.log(`📖 Gerando História para: ${topic}`);

    // 1. Geração de Roteiro (Pontos da História)
    const beats = await getStoryBeats(topic);
    console.log(`✅ Gerados ${beats.length} pontos da história.`);

    // 2. Geração de Narração por Ponto
    const audioFiles = [];
    for (let i = 0; i < beats.length; i++) {
        console.log(`🎙️ Narrando ponto ${i + 1}/${beats.length}...`);
        const audioPath = path.join(outputDir, `voice_${Date.now()}_${i}.mp3`);
        const success = await generateNarration(beats[i].narration, audioPath);
        if (success) audioFiles.push(audioPath);
    }

    // 3. Geração de Imagem por Ponto
    const frames = [];
    for (let i = 0; i < beats.length; i++) {
        console.log(`🎨 Criando quadro ${i + 1}/${beats.length}...`);
        const framePath = path.join(framesDir, `frame_${Date.now()}_${i}.png`);
        const imgBuffer = await generateFrameImage(beats[i].description);
        if (imgBuffer) {
            fs.writeFileSync(framePath, imgBuffer);
            frames.push(framePath);
        }
    }

    // 4. Montagem do Vídeo
    if (frames.length > 0) {
        assembleVideoWithAudio(frames, audioFiles, topic);
    }
}

async function generateNarration(text, outputPath) {
    const payload = JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    });

    return new Promise(resolve => {
        const req = https.request({
            hostname: 'api.elevenlabs.io',
            path: '/v1/text-to-speech/jsCq9An9YmDOD8W2SId0', // "Roger" or similar deep voice
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            }
        }, (res) => {
            if (res.statusCode !== 200) {
                console.error(`❌ Erro ElevenLabs: ${res.statusCode}`);
                resolve(false);
                return;
            }
            const file = fs.createWriteStream(outputPath);
            res.pipe(file);
            file.on('finish', () => resolve(true));
        });
        req.write(payload);
        req.end();
    });
}

async function getStoryBeats(topic) {
    const prompt = `Crie 10 pontos de história intensos para um vídeo do YouTube sobre: "${topic}". 
    Formato: array JSON de objetos com "description" (visual em inglês para a IA de imagem) e "narration" (texto em português para narração). 
    Foque em sobrevivência, suspense e imagens detalhadas.`;

    console.log("🤖 Consultando Gemini via CLI...");
    try {
        const cmd = `npx @google/gemini-cli --non-interactive prompt "${prompt.replace(/"/g, '\\"')}"`;
        const output = execSync(cmd).toString();
        // Limpar markdown se houver
        const jsonMatch = output.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (e) {
        console.error("Falha ao processar pontos via CLI:", e.message);
        return [];
    }
}

async function generateFrameImage(description) {
    const prompt = `Cinematic, hyper-realistic wide shot: ${description}. Concept art style, epic lighting. Aspect ratio 16:9.`;

    console.log("🎨 Gerando imagem via Gemini CLI...");
    try {
        // Nota: O gemini-cli v0.26.0 pode ter comandos específicos para imagem ou usar prompt com output
        // Para simplificar e garantir funcionamento, vamos orientar o usuário a manter o serviço de imagem
        // ou adaptar para o comando 'gemini image' se disponível.
        // Como o CLI foca em texto, vamos tentar converter o prompt para uma chamada que o CLI entenda se tiver suporte a imagem.
        // Caso contrário, precisaremos de uma chave funcional ou usar o Clawdbot.

        // Tentativa de usar o comando de imagem se existir:
        const cmd = `npx @google/gemini-cli --non-interactive image "${prompt.replace(/"/g, '\\"')}" --output temporary_frame.png`;
        execSync(cmd);
        if (fs.existsSync('temporary_frame.png')) {
            const buffer = fs.readFileSync('temporary_frame.png');
            fs.unlinkSync('temporary_frame.png');
            return buffer;
        }
        return null;
    } catch (e) {
        console.error("Falha ao gerar imagem via CLI:", e.message);
        return null;
    }
}

function assembleVideoWithAudio(frames, audioFiles, topic) {
    const outputName = `STORY_${topic.replace(/\s+/g, '_')}_${Date.now()}.mp4`;
    const outputPath = path.join(outputDir, outputName);

    console.log("🎬 Montando vídeo com FFmpeg (Imagens + Narração)...");
    try {
        // Criar um vídeo para cada segmento imagem+áudio e depois concatenar
        const segments = [];
        for (let i = 0; i < frames.length; i++) {
            const segPath = path.join(outputDir, `seg_${i}.mp4`);
            const cmd = `ffmpeg -y -loop 1 -i "${frames[i]}" -i "${audioFiles[i] || audioFiles[0]}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -vf "scale=3840:2160,zoompan=z='min(zoom+0.0005,1.1)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=3840x2160" "${segPath}"`;
            execSync(cmd);
            segments.push(`file '${segPath.replace(/\\/g, '/')}'`);
        }

        const concatFile = path.join(outputDir, 'concat_list.txt');
        fs.writeFileSync(concatFile, segments.join('\n'));

        const finalCmd = `ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${outputPath}"`;
        execSync(finalCmd);
        console.log(`✅ Vídeo Final Completo: ${outputPath}`);
    } catch (e) {
        console.error("Falha na montagem final:", e.message);
    }
}

// Entrada CLI
const topic = process.argv[2] || "Survival in the Amazon Rainforest alone";
generateStory(topic).catch(console.error);
