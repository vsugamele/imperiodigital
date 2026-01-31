/**
 * Sistema iGaming - Video Reels (9:16)
 * 
 * Fluxo:
 * 1. Gera imagem 9:16 com Gemini (Advanced Multi-Ref)
 * 2. Baixa um áudio em alta do Drive
 * 3. Usa FFmpeg para criar vídeo de 15s com zoom (Ken Burns)
 * 4. Faz upload do MP4 final
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações
// NEVER hardcode API keys in repo. Set GEMINI_API_KEY in ops-dashboard/.env.local.
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
if (!GEMINI_API_KEY) {
    console.log('❌ Missing GEMINI_API_KEY (set it in ops-dashboard/.env.local)');
}
const RCLONE_PATH = 'C:\\Users\\vsuga\\clawd\\rclone.exe';
const OUTPUT_DIR = 'C:\\Users\\vsuga\\clawd\\images\\generated';
const VIDEO_DIR = 'C:\\Users\\vsuga\\clawd\\videos';
const REFERENCES_DIR = 'C:\\Users\\vsuga\\clawd\\images\\references';
const STYLE_DIR = 'C:\\Users\\vsuga\\clawd\\images\\style_ref';
const AUDIO_DIR = 'C:\\Users\\vsuga\\clawd\\audio';

// Criar pastas
[OUTPUT_DIR, VIDEO_DIR, REFERENCES_DIR, STYLE_DIR, AUDIO_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Drive IDs
const STYLE_FOLDER_ID = "19w3WefIuH18POsomvRpEhAZZzyrjqj50";
const AUDIO_FOLDER_ID = "1YWvoRgdzDWLyTzbCYAJqsE8paatIc-rH"; // Pasta de áudios em alta

// Perfis
const PROFILES = {
    teo: { folderId: "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP", char: "Homem brasileiro, barba aparada, cabelo preto, olhos claros, carismático" },
    jonathan: { folderId: "1-pRp7UtxfBVBNw1-5WJPCtzF5PnTmNUZ", char: "Homem brasileiro, cabelo curto escuro, barba, pele morena" },
    pedro: { folderId: "16Mhy_ydDXeq2RuvWq3F1FQ9Ehei5tsa7", char: "Homem brasileiro, tatuado (braços/peito), corpo atlético, cabelo escuro curto, aparência jovem, estilo iGaming premium" },
    laise: { folderId: "18vm4Fv1hYM8B89m-qhr-eUeZjxKmm9Zm", char: "Mulher brasileira, cabelo longo, sorriso natural, elegante" }
};

const SCENARIOS = [
    { name: "dirigindo carro de luxo", clothing: "casual chic with a watch", scene: "driving a luxury convertible on a coastal road" },
    { name: "jato privado", clothing: "business casual, expensive jacket", scene: "inside a private luxury jet" },
    { name: "piscina resort", clothing: "shirtless, swimming trunks, luxury wet hair look", scene: "swimming in a 5-star resort infinity pool" },
    { name: "cassino VIP", clothing: "elegant suit, tailored white shirt", scene: "at a VIP poker table in a Las Vegas casino" },
    { name: "rooftop bar", clothing: "stylish outfit, evening wear", scene: "at a luxury rooftop bar with a city view at night" },
    { name: "praia luxo", clothing: "shirtless, wearing sunglasses and shorts", scene: "on a paradise beach, turquoise water" }
];

const COPYS = [
    "QUER GANHAR UM P!X DE PRESENTE? COMENTA 'EU QUERO' 👇🔥",
    "VOU DAR PRÊMIOS PRA QUEM COMENTAR MAIS! 🎁💰",
    "DEIXA SEU P!X NOS COMENTÁRIOS E BOA SORTE! 🚀✨",
    "PRESENTE SURPRESA PARA QUEM COMENTAR 👇💰",
    "QUER GANHAR TAMBÉM? COMENTA 'MEU P!X' 👇🔥",
    "PRÊMIOS EM DINHEIRO AGORA! COMENTA 👇🎁"
];

// Helper: Selecionar item aleatório
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Baixa referências (Personagem e Estilo)
// FIX: referência de pessoa NÃO deve ser aleatória.
// Regra:
// 1) Se existir no Drive: /reference/<profile>_ref.(png|jpg) -> usar isso.
// 2) Caso não exista, cai no fallback antigo (aleatório na raiz) mas com WARNING.
//
// OBS: salva com nomes únicos por execução para evitar reaproveitar arquivo antigo.
function fetchRefs(profileName, runId) {
    const profile = PROFILES[profileName];
    const refs = [];

    // 1. Personagem (fixo)
    try {
        const baseRemote = `gdrive,root_folder_id=${profile.folderId}:`;
        const candidates = [
            `${baseRemote}/reference/${profileName}_ref.png`,
            `${baseRemote}/reference/${profileName}_ref.jpg`,
            `${baseRemote}/reference/${profileName}_ref.jpeg`,
            // compat legacy
            `${baseRemote}/reference/ref.png`,
            `${baseRemote}/reference/ref.jpg`,
        ];

        let copied = false;
        for (const src of candidates) {
            try {
                const dest = path.join(REFERENCES_DIR, `${profileName}_ref_${runId}.png`);
                execSync(`"${RCLONE_PATH}" copyto "${src}" "${dest}"`, { stdio: 'pipe' });
                refs.push(dest);
                copied = true;
                break;
            } catch {
                // keep trying
            }
        }

        if (!copied) {
            console.log(`⚠️  WARNING: referência fixa não encontrada em ${baseRemote}/reference/. Usando fallback aleatório (pode gerar identidade errada).`);
            const files = execSync(`"${RCLONE_PATH}" lsf "${baseRemote}" --files-only`, { encoding: 'utf-8' })
                .trim().split('\n').filter(f => f.match(/\.(png|jpg|jpeg)$/i));
            const sel = rand(files);
            const dest = path.join(REFERENCES_DIR, `${profileName}_ref_${runId}.png`);
            execSync(`"${RCLONE_PATH}" copyto "${baseRemote}/${sel}" "${dest}"`, { stdio: 'pipe' });
            refs.push(dest);
        }
    } catch (e) {
        console.log("❌ Erro perfil:", e.message);
    }

    // 2. Estilo
    try {
        const remote = `gdrive,root_folder_id=${STYLE_FOLDER_ID}:`;
        const files = execSync(`"${RCLONE_PATH}" lsf "${remote}" --files-only`, { encoding: 'utf-8' })
            .trim().split('\n').filter(f => f.match(/\.(png|jpg|jpeg)$/i));
        const sel = rand(files);
        const dest = path.join(STYLE_DIR, `style_ref_${runId}.png`);
        execSync(`"${RCLONE_PATH}" copyto "${remote}/${sel}" "${dest}"`, { stdio: 'pipe' });
        refs.push(dest);
    } catch (e) { console.log("❌ Erro estilo:", e.message); }

    return refs;
}

// Baixa áudio em alta
function fetchAudio() {
    console.log("🎙️  Buscando áudio em alta no Drive...");
    try {
        const remote = `gdrive,root_folder_id=${AUDIO_FOLDER_ID}:`;
        const files = execSync(`"${RCLONE_PATH}" lsf "${remote}" --files-only`, { encoding: 'utf-8' })
            .trim().split('\n').filter(f => f.endsWith('.mp3'));

        if (files.length === 0) throw new Error("Sem mp3");

        const sel = rand(files);
        const dest = path.join(AUDIO_DIR, "trend.mp3");
        execSync(`"${RCLONE_PATH}" copyto "${remote}/${sel}" "${dest}"`, { stdio: 'pipe' });
        console.log(`   ✅ Áudio selecionado: ${sel}`);
        return dest;
    } catch (e) {
        console.log("⚠️ Não achou áudio no Drive, procurando local...");
        const locals = fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3'));
        return locals.length > 0 ? path.join(AUDIO_DIR, locals[0]) : null;
    }
}

// Try to fetch a pre-made no-cost image from Drive.
// Returns local path or null.
function fetchNoCostImage(profileName, runId) {
    try {
        const profile = PROFILES[profileName];
        const baseRemote = `gdrive,root_folder_id=${profile.folderId}:`;
        const remote = `${baseRemote}/no_cost/images`;

        const filesRaw = execSync(`"${RCLONE_PATH}" lsf "${remote}" --files-only`, { encoding: 'utf-8' }).trim();
        const files = filesRaw ? filesRaw.split('\n').filter(f => f.match(/\.(png|jpg|jpeg)$/i)) : [];
        if (!files.length) return null;

        const sel = rand(files);
        const dest = path.join(OUTPUT_DIR, `${profileName}_nocost_${runId}.png`);
        execSync(`"${RCLONE_PATH}" copyto "${remote}/${sel}" "${dest}"`, { stdio: 'pipe' });
        console.log(`✅ no_cost image selected: ${sel}`);
        return dest;
    } catch {
        return null;
    }
}

// Gera Imagem Vertical (9:16)
async function generateImage(refs, profileConfig, copy) {
    const sc = rand(SCENARIOS);
    console.log(`🎨 Gerando imagem 9:16 para cenário: ${sc.name}...`);

    // Instrução específica: style refs são para TEXTO/LAYOUT, clothing é LIFESTYLE RANDOM
    const prompt = `Generate a realistic 9:16 vertical Instagram Reel photograph.

PERSON: Exact match to the human in references: ${profileConfig.char}.

TEXT STYLE & LAYOUT: Follow the typography, text positioning, and general "premium vibe" from the STYLE reference images. The text should be overlaid in a similar aesthetic way.
TEXT TO ADD: "${copy}"

CLOTHING: Random "${sc.clothing}" (Lifestyle/Real life look).
SCENE: ${sc.scene}.

COMPOSITION: Vertical portrait, professional photography, cinematic lighting.

CRITICAL: 
- If the person is in the water (pool/beach), they MUST BE SHIRTLESS (for men) or in appropriate swimwear. 
- The text overlay must be modern, readable and follow the design inspiration from the style references.`;

    const parts = [{ text: prompt }];
    refs.forEach(p => {
        const b64 = fs.readFileSync(p).toString('base64');
        parts.push({ inline_data: { mime_type: "image/png", data: b64 } });
    });

    const payload = {
        contents: [{ parts }],
        generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: { aspectRatio: "9:16", imageSize: "2K" }
        }
    };

    return new Promise(resolve => {
        const req = https.request({
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${GEMINI_API_KEY}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    const resp = JSON.parse(body);
                    const part = resp.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

                    // Telemetry: log usage (tokens/cost) if present
                    try {
                        const { appendAiUsage } = require('./ai-usage');
                        const usage = resp.usageMetadata || {};
                        appendAiUsage({
                            ts: new Date().toISOString(),
                            provider: 'gemini',
                            model: 'gemini-3-pro-image-preview',
                            project: profileConfig?.project || profileConfig?.name || 'igaming',
                            inputTokens: usage.promptTokenCount || usage.promptTokens || 0,
                            outputTokens: usage.candidatesTokenCount || usage.candidatesTokens || 0,
                            meta: { kind: 'image', scenario: sc.name }
                        });
                    } catch {}

                    resolve(part ? { buffer: Buffer.from(part.inlineData.data, 'base64'), scenario: sc } : null);
                } catch (e) { resolve(null); }
            });
        });
        req.write(JSON.stringify(payload));
        req.end();
    });
}

// Cria Vídeo com Ken Burns Effect
function createVideo(imgPath, audioPath, outputName) {
    console.log("🎬  Crinando vídeo de 15s com FFmpeg (Zoom Effect)...");
    const outPath = path.join(VIDEO_DIR, outputName);

    // Ken Burns: Zoom gradual durante 15s
    // d=375 (15s * 25fps)
    // O filtro antigo escalava para 8000px e pode ficar extremamente lento/travar.
    // Aqui escalamos só um pouco acima do target e fazemos um zoom leve.
    const zoomFilter = "scale=1200:-1,zoompan=z='min(zoom+0.0005,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=375:s=1080x1920";

    let cmd = `ffmpeg -y -loop 1 -r 25 -i "${imgPath}" `;
    if (audioPath) {
        cmd += `-i "${audioPath}" `;
    }
    cmd += `-vf "${zoomFilter}" -c:v libx264 -preset veryfast -pix_fmt yuv420p `;
    if (audioPath) {
        cmd += `-c:a aac -b:a 192k -map 0:v:0 -map 1:a:0 -shortest `;
    }
    cmd += `-t 15 "${outPath}"`;

    try {
        console.log(`   EXEC: ${cmd}`);
        execSync(cmd, { stdio: 'inherit' });
        return outPath;
    } catch (e) {
        console.log("❌ Erro FFmpeg:", e.message);
        return null;
    }
}

// Main
async function main() {
    const profileArg = process.argv[2] || 'teo';
    const profile = PROFILES[profileArg];
    if (!profile) return console.log("Perfil inválido");

    console.log(`\n📺 GERADOR DE REELS: ${profileArg.toUpperCase()}`);

    const runId = Date.now();

    const audio = fetchAudio();
    const copy = rand(COPYS);

    // 0) no_cost path (if available)
    const noCostImg = fetchNoCostImage(profileArg, runId);

    let imgPath;
    let refs = [];
    let scenario = null;

    if (noCostImg) {
        imgPath = noCostImg;
        console.log('🟡 Using no_cost image (skipping Gemini image generation).');
    } else {
        // 1) Gemini image generation fallback
        refs = fetchRefs(profileArg, runId);
        const imgResp = await generateImage(refs, profile, copy);
        if (!imgResp) return console.log("❌ Erro geração imagem");

        imgPath = path.join(OUTPUT_DIR, `${profileArg}_reels_${runId}.png`);
        fs.writeFileSync(imgPath, imgResp.buffer);
        scenario = imgResp.scenario;
    }

    const videoName = `${profileArg.toUpperCase()}_REEL_${runId}.mp4`;
    const videoPath = createVideo(imgPath, audio, videoName);

    // Salvar metadados locais (pra controle/monitoramento)
    try {
        const resultsDir = path.join('C:\\Users\\vsuga\\clawd', 'results', 'runs', profileArg);
        if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
        const metaPath = path.join(resultsDir, `${runId}.json`);
        fs.writeFileSync(metaPath, JSON.stringify({
            runId,
            profile: profileArg,
            createdAt: new Date(runId).toISOString(),
            copy,
            scenario,
            refs,
            audioPath: audio,
            imgPath,
            videoPath
        }, null, 2));

        // Também registra no CSV (excel-friendly)
        try {
            const { appendLog } = require('./logging');
            appendLog({
                date_time: new Date(runId).toISOString(),
                profile: profileArg,
                run_id: runId,
                video_file: videoName,
                image_file: path.basename(imgPath),
                drive_video_path: `/videos/${videoName}`,
                drive_image_path: `/images/${path.basename(imgPath)}`,
                uploadpost_user: '',
                platform: 'instagram',
                status: 'queued',
                uploadpost_response: '',
                error: ''
            });
        } catch (e) {
            console.log('⚠️  Falha ao registrar CSV:', e.message);
        }
    } catch (e) {
        console.log('⚠️  Falha ao salvar metadados:', e.message);
    }

    if (videoPath) {
        console.log(`✅ Vídeo criado: ${videoName}`);
        console.log("☁️  Subindo para o Drive...");

        // Organiza dentro da pasta do perfil: /videos e /images
        const baseRemote = `gdrive,root_folder_id=${profile.folderId}:`;
        try { execSync(`"${RCLONE_PATH}" mkdir "${baseRemote}/videos"`, { stdio: 'pipe' }); } catch {}
        try { execSync(`"${RCLONE_PATH}" mkdir "${baseRemote}/images"`, { stdio: 'pipe' }); } catch {}

        const targetVideo = `${baseRemote}/videos/${videoName}`;
        const targetImage = `${baseRemote}/images/${path.basename(imgPath)}`;

        execSync(`"${RCLONE_PATH}" copyto "${videoPath}" "${targetVideo}"`, { stdio: 'pipe' });
        execSync(`"${RCLONE_PATH}" copyto "${imgPath}" "${targetImage}"`, { stdio: 'pipe' });

        console.log('   ✅ Upload concluído (vídeo + imagem)');
    }
}

main().catch(console.error);
