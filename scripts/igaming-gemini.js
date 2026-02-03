/**
 * Sistema iGaming - Gemini 3 Pro Image
 * 
 * Fluxo:
 * 1. Pega foto de referência do perfil (pasta do Drive)
 * 2. Gera nova imagem com Gemini usando a referência + cenário
 * 3. Aplica copy overlay na imagem
 * 4. Salva na pasta do perfil no Drive
 * 
 * Uso: node igaming-gemini.js -p teo -c praia -n 3
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

// Criar pastas
[OUTPUT_DIR, REFERENCES_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Pasta de estilo/copys de referência no Drive
const STYLE_FOLDER_ID = "19w3WefIuH18POsomvRpEhAZZzyrjqj50";

// Perfis iGaming - cada um com sua pasta de fotos no Drive
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
    viagem: [
        "em frente ao Coliseu em Roma, dia ensolarado",
        "na Torre Eiffel à noite, luzes brilhantes de Paris",
        "em Santorini, Grécia, casas brancas e mar azul",
        "em Dubai, Burj Khalifa ao fundo",
        "em Nova York, Times Square",
        "nas Maldivas, águas cristalinas"
    ],
    praia: [
        "em praia paradisíaca, areia branca, água cristalina",
        "em resort de luxo, piscina infinity",
        "em beach club sofisticado",
        "em iate no mar"
    ],
    academia: [
        "em academia moderna de luxo",
        "fazendo crossfit, box moderno",
        "levantando peso, foco total"
    ],
    restaurante: [
        "em restaurante gourmet sofisticado",
        "em rooftop bar com vista para cidade",
        "em wine bar exclusivo"
    ],
    trabalho: [
        "em escritório executivo moderno",
        "em coworking tech",
        "em reunião de negócios"
    ],
    lifestyle: [
        "dirigindo carro de luxo",
        "em jato privado",
        "em festa exclusiva VIP"
    ],
    cassino: [
        "em cassino luxuoso de Las Vegas",
        "em mesa de poker VIP",
        "em sala de roleta sofisticada"
    ]
};

// Copys iGaming (baseadas nas referências)
const COPYS = [
    "QUAL O SEU BOLETO MAIS CARO? DEIXA AQUI NOS COMENTÁRIOS 👇🔥",
    "Manda aqui e concorra 🎁🔥",
    "Participa aqui 🫡💰",
    "Manda que eu to sorteando 🎁😎",
    "Comenta aqui e ganha 🔥🫡",
    "Manda aqui pro prêmio 💰👇",
    "Quer saber como eu faço? Comenta EU QUERO 👇",
    "Quem quer participar? Deixa o 🔥 nos comentários",
    "Isso aqui é real, comenta pra participar 💰",
    "Manda a reação e participa 🎲✨",
    "Próximo ganhador pode ser você 🎁💰",
    "Manda que eu to de olho 👀🫡",
    "Comenta e concorre 😎💰",
    "Tá esperando o que? Comenta aqui! 🔥🫡"
];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Baixa uma foto de referência da pasta do perfil no Drive
function fetchReferenceFromProfileFolder(profileName) {
    const profile = PROFILES[profileName];
    if (!profile || !profile.folderId) return null;

    const localPath = path.join(REFERENCES_DIR, `${profileName}_ref.png`);

    // Usar cache se existir (menos de 1 dia)
    if (fs.existsSync(localPath)) {
        const stats = fs.statSync(localPath);
        const ageMs = Date.now() - stats.mtimeMs;
        if (ageMs < 24 * 60 * 60 * 1000) {
            console.log(`   📁 Usando referência em cache: ${localPath}`);
            return localPath;
        }
    }

    console.log(`   ⬇️ Buscando foto de referência do Drive...`);

    try {
        // Listar arquivos da pasta do perfil
        const files = execSync(
            `"${RCLONE_PATH}" lsf "gdrive:${profile.folderId}" --files-only`,
            { encoding: 'utf-8' }
        ).trim().split('\n').filter(f => f.endsWith('.png') || f.endsWith('.jpg'));

        if (files.length === 0) {
            console.log(`   ❌ Nenhuma imagem na pasta`);
            return null;
        }

        // Escolher uma imagem aleatória como referência
        const refFile = getRandomItem(files);
        console.log(`   📷 Baixando: ${refFile}`);

        const source = `gdrive:${profile.folderId}/${refFile}`;
        execSync(`"${RCLONE_PATH}" copyto "${source}" "${localPath}"`, { stdio: 'pipe' });

        if (fs.existsSync(localPath)) {
            console.log(`   ✅ Referência baixada!`);
            return localPath;
        }
    } catch (e) {
        console.log(`   ❌ Erro: ${e.message}`);
    }

    return null;
}

// Gera imagem com Gemini 3 Pro Image
async function generateWithGemini(refImagePath, prompt, aspectRatio = '1:1', resolution = '2K') {
    console.log('   🎨 Gerando com Gemini 3 Pro Image...');

    return new Promise((resolve) => {
        const imageBuffer = fs.readFileSync(refImagePath);
        const imageBase64 = imageBuffer.toString('base64');
        const mimeType = refImagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

        const payload = {
            contents: [{
                parts: [
                    { text: prompt },
                    { inline_data: { mime_type: mimeType, data: imageBase64 } }
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

        const postData = JSON.stringify(payload);

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${GEMINI_API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
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
                                console.log('   ✅ Imagem gerada!');
                                resolve(Buffer.from(part.inlineData.data, 'base64'));
                                return;
                            }
                        }
                    }

                    console.log('   ❌ Sem imagem na resposta');
                    resolve(null);
                } catch (e) {
                    console.log(`   ❌ Erro: ${e.message}`);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.log(`   ❌ Erro: ${e.message}`);
            resolve(null);
        });

        req.write(postData);
        req.end();
    });
}

// Upload para Drive
function uploadToDrive(localPath, folderId, filename) {
    if (!folderId) return false;

    try {
        const target = `gdrive:${folderId}/${filename}`;
        execSync(`"${RCLONE_PATH}" copyto "${localPath}" "${target}"`, { stdio: 'pipe' });
        console.log('   ☁️ Upload concluído!');
        return true;
    } catch (e) {
        console.log(`   ⚠️ Erro upload: ${e.message}`);
        return false;
    }
}

// Função principal
async function generateForProfile(profileName, category, count, aspectRatio, resolution) {
    const profile = PROFILES[profileName];
    if (!profile) {
        console.log(`❌ Perfil '${profileName}' não encontrado`);
        return [];
    }

    console.log(`\n🎨 Gerando para: ${profile.name}`);
    console.log(`📁 Pasta: ${profile.folderId || 'LOCAL'}`);

    // Buscar foto de referência da pasta do perfil
    const refPath = fetchReferenceFromProfileFolder(profileName);
    if (!refPath) {
        console.log(`❌ Não foi possível obter referência`);
        return [];
    }

    // Escolher cenários
    let scenarios;
    if (category && SCENARIOS[category]) {
        scenarios = [...SCENARIOS[category]];
    } else {
        scenarios = Object.values(SCENARIOS).flat();
    }

    const shuffled = scenarios.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    const generated = [];

    for (let i = 0; i < selected.length; i++) {
        const scenario = selected[i];
        const copy = getRandomItem(COPYS);

        console.log(`\n[${i + 1}/${count}] 🎬 ${scenario.substring(0, 50)}...`);

        // Prompt que inclui instrução para colocar a copy NA imagem
        const prompt = `Generate a realistic photograph of this EXACT person: ${profile.characteristics}.

Scene: ${scenario}

TEXT OVERLAY: Add the following text prominently on the image in a stylish, Instagram-worthy way:
"${copy}"

IMPORTANT:
- Maintain the EXACT same face from the reference
- The text should be readable and well-positioned
- Use modern typography, maybe with a slight shadow or glow
- Professional Instagram photo quality`;

        const imageBuffer = await generateWithGemini(refPath, prompt, aspectRatio, resolution);

        if (imageBuffer) {
            const ts = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
            const catName = category || 'lifestyle';
            const filename = `${profileName.toUpperCase()}_${catName.toUpperCase()}_${ts}.png`;
            const localPath = path.join(OUTPUT_DIR, filename);

            fs.writeFileSync(localPath, imageBuffer);
            console.log(`   💾 Salvo: ${filename}`);

            uploadToDrive(localPath, profile.folderId, filename);

            generated.push({ filename, scenario, copy, path: localPath });
        } else {
            console.log('   ❌ Falha');
        }

        if (i < selected.length - 1) {
            console.log('   ⏳ Aguardando 3s...');
            await new Promise(r => setTimeout(r, 3000));
        }
    }

    // Resumo
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎉 COMPLETO: ${generated.length}/${count}`);
    console.log(`${'='.repeat(50)}`);

    for (const g of generated) {
        console.log(`\n📷 ${g.filename}`);
        console.log(`   📍 ${g.scenario}`);
        console.log(`   📝 ${g.copy}`);
    }

    return generated;
}

// Parse args
function parseArgs() {
    const args = process.argv.slice(2);
    const opts = { profile: null, category: null, count: 1, aspect: '1:1', resolution: '2K' };

    for (let i = 0; i < args.length; i++) {
        if (['-p', '--profile'].includes(args[i])) opts.profile = args[++i];
        if (['-c', '--category'].includes(args[i])) opts.category = args[++i];
        if (['-n', '--count'].includes(args[i])) opts.count = parseInt(args[++i]) || 1;
        if (['-a', '--aspect'].includes(args[i])) opts.aspect = args[++i];
        if (['-r', '--resolution'].includes(args[i])) opts.resolution = args[++i];
        if (['-h', '--help'].includes(args[i])) {
            console.log(`
Sistema iGaming - Gemini 3 Pro Image

Uso: node igaming-gemini.js -p PERFIL [opções]

  -p  Perfil: teo, jonathan, pedro, laise, fernandes
  -c  Categoria: viagem, praia, academia, restaurante, trabalho, lifestyle, cassino
  -n  Quantidade (default: 1)
  -a  Aspecto: 1:1, 16:9, 9:16 (default: 1:1)
  -r  Resolução: 1K, 2K, 4K (default: 2K)

Exemplos:
  node igaming-gemini.js -p teo -c praia -n 3
  node igaming-gemini.js -p jonathan -c viagem -n 5 -a 16:9
`);
            process.exit(0);
        }
    }
    return opts;
}

// Main
async function main() {
    const opts = parseArgs();

    if (!opts.profile) {
        console.log('❌ Perfil obrigatório! Use -p teo');
        process.exit(1);
    }

    console.log('🎮 SISTEMA IGAMING - GEMINI 3 PRO IMAGE');
    console.log('='.repeat(50));

    await generateForProfile(opts.profile, opts.category, opts.count, opts.aspect, opts.resolution);
}

main().catch(console.error);
