/**
 * Sistema iGaming - Gemini 3 Pro Image (Advanced)
 * 
 * Fluxo:
 * 1. Pega fotos de referência do personagem (pasta do perfil)
 * 2. Pega fotos de referência de estilo (estilo igaming)
 * 3. Usa Gemini para criar uma copy criativa baseada no cenário
 * 4. Gera imagem final com o personagem + estilo + copy overlay
 * 5. Salva e faz upload
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações
const GEMINI_API_KEY = 'AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90';
const RCLONE_PATH = 'C:\\Users\\vsuga\\clawd\\rclone.exe';
const OUTPUT_DIR = 'C:\\Users\\vsuga\\clawd\\images\\generated';
const REFERENCES_DIR = 'C:\\Users\\vsuga\\clawd\\images\\references';
const STYLE_DIR = 'C:\\Users\\vsuga\\clawd\\images\\style_ref';

// Criar pastas
[OUTPUT_DIR, REFERENCES_DIR, STYLE_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Pasta de estilo/copys de referência no Drive (Vinicius Style)
const STYLE_FOLDER_ID = "19w3WefIuH18POsomvRpEhAZZzyrjqj50"; // Corrigido ID (vini_ig fotos)

// Perfis iGaming
const PROFILES = {
    teo: {
        name: "Teo Martins",
        folderId: "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP",
        characteristics: "Homem brasileiro, barba escura aparada, cabelo preto, olhos claros, pele morena, carismático, expressão confiante"
    },
    jonathan: {
        name: "Jhonatan Vieira",
        folderId: "1-pRp7UtxfBVBNw1-5WJPCtzF5PnTmNUZ",
        characteristics: "Homem brasileiro, cabelo curto escuro, barba, pele morena, expressão confiante"
    },
    pedro: {
        name: "Pedro vlEIRA",
        folderId: "16Mhy_ydDXeq2RuvWq3F1FQ9Ehei5tsa7",
        characteristics: "Homem brasileiro, careca, barba, expressão confiante e determinada"
    },
    laise: {
        name: "Laise",
        folderId: "18vm4Fv1hYM8B89m-qhr-eUeZjxKmm9Zm",
        characteristics: "Mulher brasileira, cabelo longo, sorriso natural, elegante"
    },
    fernandes: {
        name: "Fernandes Vieira",
        folderId: null,
        characteristics: "Homem brasileiro, cabelo curto, expressão profissional"
    }
};

// Cenários Lifestyle
const SCENARIOS = {
    viagem: ["em frente ao Coliseu em Roma", "na Torre Eiffel à noite", "em Santorini", "em Dubai", "nas Maldivas"],
    praia: ["em praia paradisíaca", "em resort de luxo piscina infinity", "em iate no mar"],
    academia: ["em academia moderna de luxo", "fazendo crossfit foco total"],
    restaurante: ["em restaurante gourmet sofisticado", "em rooftop bar com vista para cidade"],
    lifestyle: ["dirigindo carro de luxo", "em jato privado", "em festa exclusiva VIP"],
    cassino: ["em cassino luxuoso de Las Vegas", "em mesa de poker VIP", "em sala de roleta"]
};

// Copy iGaming Base
const BASE_COPY = "🔥 *Manda aqui 🔥👇🏻*";

function getRandomItem(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

// Baixa referências do personagem (até 2)
function fetchCharacterRefs(profileName) {
    const profile = PROFILES[profileName];
    if (!profile || !profile.folderId) return [];

    console.log(`   ⬇️  Buscando referências do personagem (${profileName})...`);
    try {
        const remote = `gdrive,root_folder_id=${profile.folderId}:`;
        const files = execSync(`"${RCLONE_PATH}" lsf "${remote}" --files-only`, { encoding: 'utf-8' })
            .trim().split('\n').filter(f => f.endsWith('.png') || f.endsWith('.jpg'));

        if (files.length === 0) return [];

        // Selecionar 2 arquivos aleatórios
        const selected = [];
        const shuffled = files.sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(2, shuffled.length); i++) {
            const fileName = shuffled[i];
            const localPath = path.join(REFERENCES_DIR, `${profileName}_${i}.png`);
            console.log(`      📷 ${fileName}`);
            execSync(`"${RCLONE_PATH}" copyto "${remote}/${fileName}" "${localPath}"`, { stdio: 'pipe' });
            selected.push(localPath);
        }
        return selected;
    } catch (e) {
        console.log(`   ❌ Erro personagem: ${e.message}`);
        return [];
    }
}

// Baixa referências de estilo (até 2)
function fetchStyleRefs() {
    console.log(`   ⬇️  Buscando referências de estilo (Vinicius Style)...`);
    try {
        const remote = `gdrive,root_folder_id=${STYLE_FOLDER_ID}:`;
        const files = execSync(`"${RCLONE_PATH}" lsf "${remote}" --files-only`, { encoding: 'utf-8' })
            .trim().split('\n').filter(f => f.endsWith('.png') || f.endsWith('.jpg'));

        if (files.length === 0) return [];

        const selected = [];
        const shuffled = files.sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(2, shuffled.length); i++) {
            const fileName = shuffled[i];
            const localPath = path.join(STYLE_DIR, `style_${i}.png`);
            console.log(`      ✨ ${fileName}`);
            execSync(`"${RCLONE_PATH}" copyto "${remote}/${fileName}" "${localPath}"`, { stdio: 'pipe' });
            selected.push(localPath);
        }
        return selected;
    } catch (e) {
        console.log(`   ❌ Erro estilo: ${e.message}`);
        return [];
    }
}

// Gera imagem com Gemini com referências múltiplas
async function generateGeminiImage(refPaths, prompt, aspectRatio = '1:1', resolution = '2K') {
    console.log(`   🎨 Gerando com Gemini 3 Pro Image (Usando ${refPaths.length} fotos de ref)...`);

    return new Promise((resolve) => {
        const parts = [{ text: prompt }];

        // Adicionar todas as imagens como refs
        refPaths.forEach(p => {
            const buffer = fs.readFileSync(p);
            const base64 = buffer.toString('base64');
            const mimeType = p.endsWith('.png') ? 'image/png' : 'image/jpeg';
            parts.push({ inline_data: { mime_type: mimeType, data: base64 } });
        });

        const payload = {
            contents: [{ parts }],
            generationConfig: {
                responseModalities: ["TEXT", "IMAGE"],
                imageConfig: { aspectRatio, imageSize: resolution }
            }
        };

        const postData = JSON.stringify(payload);
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${GEMINI_API_KEY}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (response.error) {
                        console.log(`   ❌ Erro API: ${response.error.message}`);
                        resolve(null);
                        return;
                    }
                    if (response.candidates?.[0]?.content?.parts) {
                        for (const part of response.candidates[0].content.parts) {
                            if (part.inlineData?.data) {
                                console.log('   ✅ Geração concluída!');
                                resolve(Buffer.from(part.inlineData.data, 'base64'));
                                return;
                            }
                        }
                    }
                    console.log('   ❌ Resposta vazia');
                    resolve(null);
                } catch (e) { resolve(null); }
            });
        });
        req.on('error', (e) => resolve(null));
        req.write(postData);
        req.end();
    });
}

// Upload
function uploadToProfile(localPath, folderId, filename) {
    if (!folderId) return;
    try {
        const target = `gdrive,root_folder_id=${folderId}:${filename}`;
        execSync(`"${RCLONE_PATH}" copyto "${localPath}" "${target}"`, { stdio: 'pipe' });
        console.log('   ☁️  Upload arquivado com sucesso!');
    } catch (e) { console.log(`   ⚠️ Erro upload: ${e.message}`); }
}

// Fluxo
async function runProfile(profileName, category, count, aspect, resolution) {
    const profile = PROFILES[profileName];
    if (!profile) return console.log(`❌ Perfil não encontrado: ${profileName}`);

    console.log(`\n🚀 INICIANDO FLUXO: ${profile.name.toUpperCase()}`);
    console.log(`📂 ID Pasta: ${profile.folderId}`);

    const charRefs = fetchCharacterRefs(profileName);
    if (charRefs.length === 0) return console.log(`❌ Sem fotos de referência para ${profileName}`);

    const styleRefs = fetchStyleRefs();
    const allRefs = [...charRefs, ...styleRefs];

    const scenarios = category ? SCENARIOS[category] : Object.values(SCENARIOS).flat();
    const selected = scenarios.sort(() => Math.random() - 0.5).slice(0, count);

    for (let i = 0; i < selected.length; i++) {
        const scenario = selected[i];
        const copy = BASE_COPY;

        console.log(`\n[${i + 1}/${count}] 🎬 ${category || 'LIFESTYLE'} -> ${scenario}`);

        const prompt = `Generate a realistic high-quality professional Instagram photograph.

CHARACTER: This person MUST look EXACTLY like the human character in the provided reference images: ${profile.characteristics}.

STYLE: Follow the aesthetic, lighting, and "premium iGaming vibe" from the provided style reference images.

SCENE: ${scenario}

TEXT OVERLAY: Add the following text prominently but stylishly on the image: 
"${copy}"

TECHNICAL: 
- 100% character consistency. 
- Readable text with modern typography.
- Professional lighting and composition.`;

        const imgBuffer = await generateGeminiImage(allRefs, prompt, aspect, resolution);

        if (imgBuffer) {
            const ts = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
            const filename = `${profileName.toUpperCase()}_${ts}.png`;
            const localPath = path.join(OUTPUT_DIR, filename);
            fs.writeFileSync(localPath, imgBuffer);
            console.log(`   💾 Salvo: ${filename}`);
            uploadToProfile(localPath, profile.folderId, filename);
        } else {
            console.log('   ❌ Falha na geração do quadro');
        }

        if (i < selected.length - 1) await new Promise(r => setTimeout(r, 4000));
    }
}

// CLI
const args = process.argv.slice(2);
const opts = { profile: null, cat: null, n: 1, a: '1:1', r: '2K' };
for (let i = 0; i < args.length; i++) {
    if (['-p'].includes(args[i])) opts.profile = args[++i];
    if (['-c'].includes(args[i])) opts.cat = args[++i];
    if (['-n'].includes(args[i])) opts.n = parseInt(args[++i]) || 1;
    if (['-a'].includes(args[i])) opts.a = args[++i];
    if (['-r'].includes(args[i])) opts.r = args[++i];
}

if (!opts.profile) {
    console.log("Uso: node igaming-gemini.js -p [teo|jonathan|laise|pedro] -c [viagem|praia|...] -n 1");
    process.exit(1);
}

runProfile(opts.profile, opts.cat, opts.n, opts.a, opts.r).catch(console.error);
