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

// ============================================
// SQUAD INTEGRATION (API HUB)
// ============================================
const HUB_URL = process.env.API_HUB_URL || 'http://localhost:3001';
const WORKER_ID = 'WORKER_IGAMING_' + (process.argv[2] || 'GENERIC').toUpperCase();

async function hubRequest(endpoint, method = 'GET', body = null) {
    try {
        const url = `${HUB_URL}${endpoint}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : null,
            signal: controller.signal
        });
        clearTimeout(timeout);
        return response.ok;
    } catch (e) {
        return false;
    }
}

async function registerWithHub(name) {
    console.log(`🔗 [HUB] Registrando worker: ${WORKER_ID}...`);
    return await hubRequest('/api/workers/register', 'POST', {
        workerId: WORKER_ID,
        name: `iGaming Video Creator (${name})`,
        capabilities: ['video_generation', 'no_cost_sync', 'reels_master']
    });
}

async function updateHubStatus(status, task = '') {
    return await hubRequest(`/api/workers/brain/${WORKER_ID}/status`, 'POST', {
        status,
        task
    });
}

// ============================================
// A/B TESTING INTEGRATION
// ============================================
const { createEngine } = require('./ops/ab-testing-engine');
const abEngine = createEngine();
const CTA_TEST_ID = 'ab_1770343811261_e9keec';

function getDynamicCTA() {
    const variant = abEngine.getVariant(CTA_TEST_ID);
    if (variant && variant.config) {
        console.log(`🧪 [AB] Usando variante: ${variant.name}`);
        return {
            copy: variant.config.copy,
            testId: CTA_TEST_ID,
            variantId: variant.id
        };
    }
    return { copy: "🔥 *Manda aqui 🔥👇🏻*", testId: null, variantId: null };
}

// ============================================
// Configurações
// ============================================
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

const COPYS = "🔥 *Manda aqui 🔥👇🏻*";

// Helper: rand element from array
const rand = arr => arr[Math.floor(Math.random() * arr.length)];

// ============================================
// NO-COST IMAGE FETCH ( Drive -> Local)
// ============================================
function fetchNoCostImage(profileName, runId) {
    try {
        const profile = PROFILES[profileName];
        if (!profile) return null;

        const baseRemote = `gdrive,root_folder_id=${profile.folderId}:`;
        const remote = `${baseRemote}/no_cost/images`;

        console.log(`🔍 [${profileName}] Verificando no_cost/images no Drive...`);

        // Listar arquivos com timeout e retry
        let filesRaw = '';
        try {
            filesRaw = execSync(`"${RCLONE_PATH}" lsf "${remote}" --files-only --contimeout 10s --timeout 30s`, {
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe']
            }).trim();
        } catch (lsError) {
            console.log(`⚠️  [${profileName}] Erro ao listar Drive (Timeout ou Rede): ${lsError.message.substring(0, 100)}`);
            return null;
        }

        if (!filesRaw) {
            console.log(`⚠️  [${profileName}] Pasta no_cost/images está vazia ou inacessível`);
            return null;
        }

        const files = filesRaw.split('\n').filter(f => f.match(/\.(png|jpg|jpeg)$/i));

        if (!files.length) {
            console.log(`⚠️  [${profileName}] Nenhuma imagem válida encontrada em no_cost/images`);
            return null;
        }

        const sel = rand(files);
        const ext = path.extname(sel) || '.png';
        const dest = path.join(OUTPUT_DIR, `${profileName}_nocost_${runId}${ext}`);

        console.log(`📥 [${profileName}] Baixando imagem no_cost: ${sel}...`);

        execSync(`"${RCLONE_PATH}" copyto "${remote}/${sel}" "${dest}" --contimeout 10s --timeout 60s`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        });

        console.log(`✅ [${profileName}] no_cost image: ${sel} (ECONOMIA DETECTADA!)`);
        return dest;
    } catch (e) {
        console.log(`❌ [${profileName}] Erro crítico no_cost logic: ${e.message.substring(0, 120)}`);
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
// ============================================
// MAIN EXECUTION
// ============================================

async function runForProfile(profileName) {
    const profile = PROFILES[profileName];
    if (!profile) return;

    const runId = Date.now().toString().slice(-6);
    console.log(`\n📺 ${profileName.toUpperCase()} | ${new Date().toLocaleString('pt-BR')}`);

    await updateHubStatus('active', `Processando perfil: ${profileName}`);

    // 1. Áudio
    await updateHubStatus('active', 'Buscando áudio no Drive...');
    const audioPath = fetchAudio();
    if (!audioPath) {
        await updateHubStatus('error', 'Falha ao obter áudio');
        return;
    }

    // 2. Imagem (No-Cost First)
    await updateHubStatus('active', 'Verificando imagens No-Cost...');
    let imagePath = fetchNoCostImage(profileName, runId);
    let usedGemini = false;

    // Obter CTA dinâmico (A/B Test)
    const activeCTA = getDynamicCTA();

    if (!imagePath) {
        console.log(`💰 [${profileName}] No-Cost não disponível. Usando Gemini...`);
        await updateHubStatus('active', 'Buscando referências e gerando via Gemini...');

        const refs = fetchRefs(profileName, runId);
        const scenario = rand(SCENARIOS);
        const imgResp = await generateImage(refs, profile, activeCTA.copy, scenario);

        if (imgResp && imgResp.buffer) {
            imagePath = path.join(OUTPUT_DIR, `${profileName}_reels_${runId}.png`);
            fs.writeFileSync(imagePath, imgResp.buffer);
            usedGemini = true;
        }
    }

    if (!imagePath) {
        await updateHubStatus('error', 'Falha ao gerar/obter imagem');
        return;
    }

    // 3. Vídeo
    await updateHubStatus('active', 'Renderizando vídeo FFmpeg...');
    const videoName = `${profileName.toUpperCase()}_REEL_${runId}.mp4`;
    const videoPath = createVideo(imagePath, audioPath, videoName);

    if (videoPath) {
        console.log(`✅ Vídeo criado: ${videoName}`);
        await updateHubStatus('active', 'Agendando post via Upload-Post...');

        // Simulação de agendamento (ajuste se tiver script real)
        console.log(`📡 Agendando ${videoName} para ${profileName} com CTA: ${activeCTA.copy}`);

        // Log de uso
        try {
            const { logAiUsage } = require('./ai-usage-enhanced');
            logAiUsage({
                provider: usedGemini ? 'google' : 'ffmpeg',
                model: usedGemini ? 'gemini-3-pro' : 'local',
                project: profileName,
                reason: 'igaming_video',
                metadata: {
                    usedNoCost: !usedGemini,
                    abTestId: activeCTA.testId,
                    abVariantId: activeCTA.variantId
                }
            });
        } catch (e) { }

        await updateHubStatus('idle', `Vídeo concluído para ${profileName}`);
    } else {
        await updateHubStatus('error', 'Erro na renderização do vídeo');
    }
}

async function main() {
    const args = process.argv.slice(2);
    const profileArg = args[0];

    await registerWithHub(profileArg || 'ALL');

    if (profileArg && PROFILES[profileArg]) {
        await runForProfile(profileArg);
    } else {
        console.log("🚀 Rodando para todos os perfis ativos...");
        for (const p of Object.keys(PROFILES)) {
            if (p === 'petselect') continue;
            await runForProfile(p);
        }
    }

    await updateHubStatus('completed', 'Pipeline finalizada');
}

main().catch(err => {
    console.error('❌ Erro na main:', err);
    updateHubStatus('error', err.message);
});
