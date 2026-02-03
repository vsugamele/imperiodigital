/**
 * Sistema iGaming - Video Reels (9:16)
 * 
 * Fluxo:
 * 1. Tenta imagem no_cost (Drive) - SEM CUSTO
 * 2. Se não encontrar, gera imagem com Gemini - CUSTO $$
 * 3. Baixa um áudio em alta do Drive
 * 4. Usa FFmpeg para criar vídeo de 15s com zoom (Ken Burns)
 * 5. Faz upload do MP4 final
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { loadOpsEnv } = require('./_load-ops-env');
loadOpsEnv();

// Configurações
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
if (!GEMINI_API_KEY) {
    console.log('❌ Missing GEMINI_API_KEY');
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
const AUDIO_FOLDER_ID = "1YWvoRgdzDWLyTzbCYAJqsE8paatIc-rH";

// Perfis
const PROFILES = {
    teo: { folderId: "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP", char: "Homem brasileiro, barba aparada, cabelo preto, olhos claros, carismático" },
    jonathan: { folderId: "1-pRp7UtxfBVBNw1-5WJPCtzF5PnTmNUZ", char: "Homem brasileiro, cabelo curto escuro, barba, pele morena" },
    pedro: { folderId: "16Mhy_ydDXeq2RuvWq3F1FQ9Ehei5tsa7", char: "Homem brasileiro, tatuado (braços/peito), corpo atlético, cabelo escuro curto, aparência jovem, estilo iGaming premium" },
    laise: { folderId: "18vm4Fv1hYM8B89m-qhr-eUeZjxKmm9Zm", char: "Mulher brasileira, cabelo longo, sorriso natural, elegante" },
    petselect: { folderId: null, char: "Pet product showcase, happy dog and cat with premium products, clean white background" }
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
    "QUER GANHAR UM P!X DE PRESENTE? COMENTA 'EU QUERO' 👇🔥\n\n*Manda aqui 🔥👇🏻*",
    "VOU DAR PRÊMIOS PRA QUEM COMENTAR MAIS! 🎁💰\n\n*Manda aqui 🔥👇🏻*",
    "SE CAISSE R$ 200 AGORA O QUE VOCÊ FARIA? 👇😎\n\n*Manda aqui 🔥👇🏻*",
    "QUEM COMENTAR EU ESCOLHO! 🎯🔥\n\n*Manda aqui 🔥👇🏻*",
    "VAMO ACONTECER! 🔥👇\n\n*Manda aqui 🔥👇🏻*",
    "QUEM QUER LEVAR? 🚀💰\n\n*Manda aqui 🔥👇🏻*",
    "OPORTUNIDADE ÚNICA! 🔥👇\n\n*Manda aqui 🔥👇🏻*",
    "COMENTA QUE EU TE ESCOLHO! 🎯\n\n*Manda aqui 🔥👇🏻*",
    "SE LIGA! 🚀💸\n\n*Manda aqui 🔥👇🏻*",
    "QUEM MANDA? 👇🔥\n\n*Manda aqui 🔥👇🏻*"
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ============================================
// NO-COST IMAGE FETCH ( Drive -> Local)
// ============================================
function fetchNoCostImage(profileName, runId) {
    try {
        const profile = PROFILES[profileName];
        if (!profile) return null;
        
        const baseRemote = `gdrive,root_folder_id=${profile.folderId}:`;
        const remote = `${baseRemote}/no_cost/images`;
        
        // Listar arquivos
        const filesRaw = execSync(`"${RCLONE_PATH}" lsf "${remote}" --files-only`, { 
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        }).trim();
        
        if (!filesRaw) {
            console.log(`⚠️  [${profileName}] Pasta no_cost/images está vazia`);
            return null;
        }
        
        const files = filesRaw.split('\n').filter(f => f.match(/\.(png|jpg|jpeg)$/i));
        
        if (!files.length) {
            console.log(`⚠️  [${profileName}] Nenhuma imagem em no_cost/images`);
            return null;
        }
        
        const sel = rand(files);
        const dest = path.join(OUTPUT_DIR, `${profileName}_nocost_${runId}.png`);
        
        execSync(`"${RCLONE_PATH}" copyto "${remote}/${sel}" "${dest}"`, { 
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        console.log(`✅ [${profileName}] no_cost image: ${sel} (GRÁTIS!)`);
        return dest;
    } catch (e) {
        console.log(`❌ [${profileName}] Erro no_cost: ${e.message.substring(0, 80)}`);
        return null;
    }
}

// ============================================
// GEMINI IMAGE GENERATION (API -> Custo$$)
// ============================================
async function generateImage(refs, profileConfig, copy, scenario) {
    const prompt = `PERSON: Exact match to the human in references: ${profileConfig.char}. Focus ONLY on the face provided in the profile reference image.
TEXT STYLE & LAYOUT: Follow the typography, text positioning, and general "premium vibe" from the STYLE reference images. 
!!! CRITICAL !!!: DO NOT USE THE FACE OR PERSON FROM THE STYLE REFERENCE IMAGES.
TEXT TO ADD: "${copy}"
CLOTHING: Random "${scenario.clothing}" (Lifestyle/Real life look).
SCENE: ${scenario.scene}.
COMPOSITION: Vertical portrait, professional photography, cinematic lighting.
- If the person is in the water (pool/beach), they MUST BE SHIRTLESS (for men) or in appropriate swimwear.`;

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
                    
                    // LOG COST (novo logger)
                    try {
                        const { logGemini } = require('./ai-usage-enhanced');
                        const usage = resp.usageMetadata || {};
                        logGemini({
                            model: 'gemini-3-pro-image-preview',
                            prompt_tokens: usage.promptTokenCount || 0,
                            completion_tokens: usage.candidatesTokenCount || 0,
                            project: profileConfig.name || 'igaming',
                            reason: 'igaming_image',  // Por que usou
                            scenario: scenario.name,
                            usedNoCost: false  // Indica que foi gerado (não no_cost)
                        });
                    } catch (e) { console.log('⚠️  Log error:', e.message); }

                    resolve(part ? { buffer: Buffer.from(part.inlineData.data, 'base64') } : null);
                } catch (e) { resolve(null); }
            });
        });
        req.write(JSON.stringify(payload));
        req.end();
    });
}

// ============================================
// REFERENCES FETCH
// ============================================
function fetchRefs(profileName, runId) {
    const profile = PROFILES[profileName];
    const refs = [];

    // Personagem (fixo)
    try {
        const baseRemote = `gdrive,root_folder_id=${profile.folderId}:`;
        const candidates = [
            `${baseRemote}/reference/${profileName}_ref.png`,
            `${baseRemote}/reference/${profileName}_ref.jpg`,
            `${baseRemote}/reference/ref.png`,
        ];

        for (const src of candidates) {
            try {
                const dest = path.join(REFERENCES_DIR, `${profileName}_ref_${runId}.png`);
                execSync(`"${RCLONE_PATH}" copyto "${src}" "${dest}"`, { stdio: 'pipe' });
                refs.push(dest);
                break;
            } catch { /* continue */ }
        }
    } catch (e) { console.log('❌ Ref error:', e.message); }

    // Estilo
    try {
        const remote = `gdrive,root_folder_id=${STYLE_FOLDER_ID}:`;
        const files = execSync(`"${RCLONE_PATH}" lsf "${remote}" --files-only`, { encoding: 'utf-8' })
            .trim().split('\n').filter(f => f.match(/\.(png|jpg|jpeg)$/i));
        const sel = rand(files);
        const dest = path.join(STYLE_DIR, `style_ref_${runId}.png`);
        execSync(`"${RCLONE_PATH}" copyto "${remote}/${sel}" "${dest}"`, { stdio: 'pipe' });
        refs.push(dest);
    } catch (e) { console.log('❌ Style error:', e.message); }

    return refs;
}

// ============================================
// AUDIO FETCH
// ============================================
function fetchAudio() {
    try {
        const remote = `gdrive,root_folder_id=${AUDIO_FOLDER_ID}:`;
        const files = execSync(`"${RCLONE_PATH}" lsf "${remote}" --files-only`, { encoding: 'utf-8' })
            .trim().split('\n').filter(f => f.endsWith('.mp3'));
        if (!files.length) return null;
        const sel = rand(files);
        const dest = path.join(AUDIO_DIR, "trend.mp3");
        execSync(`"${RCLONE_PATH}" copyto "${remote}/${sel}" "${dest}"`, { stdio: 'pipe' });
        console.log(`🎙️  Áudio: ${sel}`);
        return dest;
    } catch (e) { return null; }
}

// ============================================
// VIDEO CREATE (SIMPLES - SEM ZOOM)
// ============================================
function createVideo(imgPath, audioPath, outputName) {
    const outPath = path.join(VIDEO_DIR, outputName);
    
    // Vídeo simples: imagem estática + áudio (sem zoom/movimento)
    let cmd = `ffmpeg -y -loop 1 -r 1 -i "${imgPath}" `;
    if (audioPath) cmd += `-i "${audioPath}" `;
    // scale para 1080x1920 sem zoom
    cmd += `-vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -preset veryfast -pix_fmt yuv420p `;
    if (audioPath) cmd += `-c:a aac -b:a 192k -map 0:v:0 -map 1:a:0 -shortest `;
    cmd += `-t 15 "${outPath}"`;

    try {
        execSync(cmd, { stdio: 'inherit' });
        return outPath;
    } catch (e) {
        console.log('❌ FFmpeg:', e.message);
        return null;
    }
}

// ============================================
// MAIN
// ============================================
async function main() {
    const profileArg = process.argv[2] || 'teo';
    const profile = PROFILES[profileArg];
    if (!profile) return console.log("Perfil inválido");

    console.log(`\n📺 ${profileArg.toUpperCase()} | ${new Date().toLocaleString('pt-BR')}`);
    const runId = Date.now();

    const audio = fetchAudio();
    const copy = rand(COPYS);
    const scenario = rand(SCENARIOS);

    // 1. Tentar no_cost PRIMEIRO
    const noCostImg = fetchNoCostImage(profileArg, runId);
    
    let imgPath;
    let usedNoCost = false;

    if (noCostImg) {
        imgPath = noCostImg;
        usedNoCost = true;
        console.log(`🟢 CUSTO: R$ 0 (usou no_cost)`);
    } else {
        // 2. Se não tiver no_cost, gera com Gemini
        console.log(`🟡 CUSTO: Gemini API (~$0.02-0.05)`);
        const refs = fetchRefs(profileArg, runId);
        const imgResp = await generateImage(refs, profile, copy, scenario);
        if (!imgResp) return console.log("❌ Erro geração");
        imgPath = path.join(OUTPUT_DIR, `${profileArg}_reels_${runId}.png`);
        fs.writeFileSync(imgPath, imgResp.buffer);
    }

    // 3. Criar vídeo
    const videoName = `${profileArg.toUpperCase()}_REEL_${runId}.mp4`;
    const videoPath = createVideo(imgPath, audio, videoName);
    
    if (videoPath) {
        console.log(`✅ ${videoName}`);
        
        // Log do pipeline
        try {
            const { logAiUsage } = require('./ai-usage-enhanced');
            logAiUsage({
                provider: 'ffmpeg',
                model: 'local',
                project: profileArg,
                reason: 'igaming_video',
                metadata: { usedNoCost, scenario: scenario.name }
            });
        } catch {}
    }

    // Salvar metadados
    const metaPath = path.join('C:\\Users\\vsuga\\clawd', 'results', 'runs', profileArg, `${runId}.json`);
    fs.writeFileSync(metaPath, JSON.stringify({
        runId,
        profile: profileArg,
        createdAt: new Date(runId).toISOString(),
        copy,
        scenario: scenario.name,
        usedNoCost
    }));
}

main();
