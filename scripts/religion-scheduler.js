#!/usr/bin/env node
/**
 * PROJETO RELIGIÃO - Scheduler Separado
 * 
 * PROCESSOS:
 * 1. FEED = imagem estática → postar direto
 * 2. REELS = imagem + áudio → criar vídeo → postar
 *    (se não tiver áudio, vídeo sem áudio mesmo)
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { execSync } = require('child_process');
const { appendLog } = require('./logging');

// ============================================
// SQUAD INTEGRATION (API HUB)
// ============================================
const HUB_URL = process.env.API_HUB_URL || 'http://localhost:3001';
const WORKER_ID = 'WORKER_RELIGION_SCHEDULER';

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

async function registerWithHub() {
  console.log(`🔗 [HUB] Registrando worker: ${WORKER_ID}...`);
  return await hubRequest('/api/workers/register', 'POST', {
    workerId: WORKER_ID,
    name: 'Religion Content Scheduler',
    capabilities: ['content_scheduling', 'canvas_rendering', 'instagram_automation']
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
const { ABTestingEngine } = require('./ops/ab-testing-engine');
const abEngine = new ABTestingEngine();
const RELIGION_CTA_TEST_ID = 'ab_1770343862689_1vy2l2';

function getDynamicCTA() {
  const variant = abEngine.getVariant(RELIGION_CTA_TEST_ID);
  if (variant && variant.config) {
    console.log(`🧪 [AB] Usando variante: ${variant.name}`);
    return {
      copy: variant.config.copy,
      testId: RELIGION_CTA_TEST_ID,
      variantId: variant.id
    };
  }
  return { copy: "🙏 Gostou? Comenta \"AMÉM\"!", testId: null, variantId: null };
}

// ==================== CONFIG ====================

const CONFIG = {
  PROFILE: 'refugiodivinos',

  // Drive folder para templates
  DRIVE_TEMPLATE_FOLDER: 'gdrive:/2026/Projeto Religiao/imagens/referencia',
  LOCAL_CACHE_DIR: path.join(__dirname, '..', 'projeto-religiao', 'images', 'referencia', 'cache'),

  OUTPUT_DIR: path.join(__dirname, '..', 'projeto-religiao', 'outputs'),
  AUDIO_DIR: path.join(__dirname, '..', 'projeto-religiao', 'audio'),

  // Configurações
  TEXT_COLOR: '#F5F5F0',
  ACCENT_COLOR: '#D4AF37',
  FONT_PRIMARY: 'Georgia, serif',
  LINE_HEIGHT: 2.0,

  FFMPEG_PATH: 'ffmpeg.exe',

  CATEGORIES: ['faith', 'god', 'biblical', 'wisdom']
};

// ==================== QUOTES ====================

const SALMOS_QUOTES = [
  { text: "O Senhor é o meu pastor; nada me faltará.", author: "Salmo 23:1" },
  { text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.", author: "João 3:16" },
  { text: "Tudo posso naquele que me fortalece.", author: "Filipenses 4:13" },
  { text: "O choro pode durar uma noite, mas a alegria vem pela manhã.", author: "Salmo 30:5" },
  { text: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.", author: "Salmo 37:5" },
  { text: "O Senhor é bom, um refúgio em tempos de tribulação.", author: "Nahum 1:7" },
  { text: "Por que estás abatida, ó minha alma, e por que te perturbas dentro de mim?", author: "Salmo 42:5" },
  { text: "Tu és a minha pedra firme, a minha libertação.", author: "Salmo 62:6" },
  { text: "Sê forte e corajoso; não temas, nem te espantes, porque o Senhor teu Deus é contigo.", author: "Josué 1:9" },
  { text: "Clama por mim no dia da angústia; eu te livrarei, e tu me glorificarás.", author: "Salmo 50:15" },
  { text: "Bem-aventurados os que choram, porque eles serão consolados.", author: "Mateus 5:4" },
  { text: "O amor é paciente, o amor é bondoso.", author: "1 Coríntios 13:4" },
  { text: "Se Deus é por nós, quem será contra nós?", author: "Romanos 8:31" },
  { text: "Não estejais ansiosos por coisa alguma...", author: "Filipenses 4:6" },
  { text: "O Senhor é a minha luz e a minha salvação; a quem temerei?", author: "Salmo 27:1" },
  { text: "Lança sobre Ele toda a tua ansiedade, porque Ele tem cuidado de ti.", author: "1 Pedro 5:7" },
  { text: "Grande é o nosso Senhor, e mui poderoso; e grande é o seu poder.", author: "Salmo 147:5" },
  { text: "Os céus proclamam a glória de Deus...", author: "Salmo 19:1" },
  { text: "O amor de Cristo nos constrange.", author: "2 Coríntios 5:14" }
];

// ==================== UTILS ====================

const RCLONE = 'C:/Users/vsuga/clawd/rclone.exe';

function getRandomQuote() {
  return SALMOS_QUOTES[Math.floor(Math.random() * SALMOS_QUOTES.length)];
}

function syncTemplatesFromDrive() {
  try {
    console.log('📥 Sincronizando templates do Drive...');

    if (!fs.existsSync(CONFIG.LOCAL_CACHE_DIR)) {
      fs.mkdirSync(CONFIG.LOCAL_CACHE_DIR, { recursive: true });
    }

    const cmd = `"${RCLONE}" copy "${CONFIG.DRIVE_TEMPLATE_FOLDER}" "${CONFIG.LOCAL_CACHE_DIR}" --verbose`;
    execSync(cmd, { encoding: 'utf8', stdio: 'inherit' });

    console.log('✅ Templates sincronizados!');
    return true;
  } catch (error) {
    console.log('⚠️  Erro ao sincronizar:', error.message);
    return false;
  }
}

function getRandomTemplate() {
  syncTemplatesFromDrive();

  if (!fs.existsSync(CONFIG.LOCAL_CACHE_DIR)) return null;

  const files = fs.readdirSync(CONFIG.LOCAL_CACHE_DIR)
    .filter(f => f.match(/\.(jpg|jpeg|png)$/i));

  if (files.length === 0) return null;

  return path.join(CONFIG.LOCAL_CACHE_DIR, files[Math.floor(Math.random() * files.length)]);
}

function getRandomAudio() {
  if (!fs.existsSync(CONFIG.AUDIO_DIR)) return null;

  const files = fs.readdirSync(CONFIG.AUDIO_DIR)
    .filter(f => f.match(/\.(mp3|wav|m4a)$/i));

  if (files.length === 0) return null;

  return path.join(CONFIG.AUDIO_DIR, files[Math.floor(Math.random() * files.length)]);
}

function getNextHour(hour) {
  return (hour + 1) % 24;
}

// ==================== GENERATE IMAGE ====================

async function generateImage(templatePath, quote, author, outputPath) {
  const image = await loadImage(templatePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);

  // Gradiente
  const gradient = ctx.createLinearGradient(0, 0, image.width * 0.35, 0);
  gradient.addColorStop(0, 'rgba(20, 15, 10, 0.92)');
  gradient.addColorStop(0.5, 'rgba(40, 30, 20, 0.6)');
  gradient.addColorStop(1, 'rgba(60, 50, 40, 0.2)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, image.width, image.height);

  // Texto
  const contentX = image.width * 0.08;
  const maxWidth = image.width * 0.42;
  const centerY = image.height / 2;

  ctx.font = `bold 48px ${CONFIG.FONT_PRIMARY}`;
  ctx.fillStyle = CONFIG.TEXT_COLOR;
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0, 0, 0, 1)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  // Wrap texto
  const words = quote.split(' ');
  const lines = [];
  let line = '';

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);

  const lineHeight = 48 * 1.6;
  const startY = centerY - (lines.length * lineHeight / 2);

  lines.forEach((l, i) => {
    ctx.fillText(l, contentX, startY + (i * lineHeight) + 48);
  });

  // Autor
  ctx.font = `bold 28px ${CONFIG.FONT_PRIMARY}`;
  ctx.fillStyle = CONFIG.ACCENT_COLOR;
  ctx.fillText(author, contentX, startY + (lines.length * lineHeight) + 50);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const buffer = canvas.toBuffer('image/jpeg', 0.92);
  fs.writeFileSync(outputPath, buffer);

  return outputPath;
}

// ==================== CREATE VIDEO (REELS) ====================

function createVideo(imagePath, audioPath, outputPath) {
  try {
    console.log('🎬 Criando vídeo para Reels...');

    let cmd;

    if (audioPath && fs.existsSync(audioPath)) {
      // Com áudio
      console.log('🎵 Com áudio:', path.basename(audioPath));
      cmd = `"${CONFIG.FFMPEG_PATH}" -loop 1 -i "${imagePath}" -i "${audioPath}" `
        + `-c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest `
        + `30 "${outputPath}" -y`;
    } else {
      // Sem áudio (loop da imagem) - formato Reels 9:16
      console.log('⚠️  Sem áudio - vídeo será mudo');
      cmd = `"${CONFIG.FFMPEG_PATH}" -loop 1 -i "${imagePath}" `
        + `-c:v libx264 -tune stillimage -pix_fmt yuv420p `
        + `-vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" `
        + `-t 30 "${outputPath}" -y`;
    }

    execSync(cmd, { encoding: 'utf8', stdio: 'inherit' });

    console.log('✅ Vídeo criado!');
    return true;
  } catch (error) {
    console.log('❌ Erro ao criar vídeo:', error.message);
    return false;
  }
}

// ==================== SCHEDULE FUNCTIONS ====================

function scheduleFeed({ profile, imagePath, caption, captionFile, scheduledDate }) {
  // Ler caption de arquivo se fornecido
  let captionText = caption || '';
  if (captionFile && fs.existsSync(captionFile)) {
    captionText = fs.readFileSync(captionFile, 'utf8').trim();
  }

  try {
    const args = [
      path.join(__dirname, 'upload-post.js'),
      '--video', imagePath,
      '--user', profile,
      '--title', 'Religion Feed',
      '--caption', captionText,
      '--platform', 'instagram',
      '--scheduled_date', scheduledDate,
      '--timezone', 'America/Sao_Paulo',
      '--async_upload', 'true'
    ];

    const out = execSync(`node "${args[0]}" ${args.slice(1).map(a => JSON.stringify(a)).join(' ')}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let json = null;
    try { json = JSON.parse(out); } catch { }

    appendLog({
      date_time: new Date().toISOString(),
      profile,
      run_id: Date.now().toString(),
      video_file: path.basename(imagePath),
      drive_image_path: imagePath,
      uploadpost_user: profile,
      platform: 'instagram',
      status: 'scheduled',
      caption,
      scheduled_date: scheduledDate,
      timezone: 'America/Sao_Paulo',
      job_id: json?.job_id || '',
      error: ''
    });

    return { ok: true, json };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function scheduleReels({ profile, videoPath, caption, scheduledDate }) {
  try {
    const args = [
      path.join(__dirname, 'upload-post.js'),
      '--video', videoPath,
      '--user', profile,
      '--title', 'Religion Reels',
      '--caption', caption,
      '--platform', 'instagram',
      '--scheduled_date', scheduledDate,
      '--timezone', 'America/Sao_Paulo',
      '--async_upload', 'true'
    ];

    const out = execSync(`node "${args[0]}" ${args.slice(1).map(a => JSON.stringify(a)).join(' ')}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let json = null;
    try { json = JSON.parse(out); } catch { }

    appendLog({
      date_time: new Date().toISOString(),
      profile,
      run_id: Date.now().toString(),
      video_file: path.basename(videoPath),
      drive_video_path: videoPath,
      uploadpost_user: profile,
      platform: 'instagram_reels',
      status: 'scheduled',
      caption,
      scheduled_date: scheduledDate,
      timezone: 'America/Sao_Paulo',
      job_id: json?.job_id || '',
      error: ''
    });

    return { ok: true, json };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ==================== MAIN ====================

async function main() {
  console.log('\n🙏 PROJETO RELIGIÃO - SCHEDULER\n');

  await registerWithHub();
  await updateHubStatus('active', 'Iniciando pipeline de conteúdo religioso');

  // Verificar template
  await updateHubStatus('active', 'Buscando template aleatório...');
  const templatePath = getRandomTemplate();
  if (!templatePath) {
    console.log('❌ Nenhum template encontrado!');
    await updateHubStatus('error', 'Nenhum template encontrado no Drive');
    process.exit(1);
  }

  console.log(`📷 Template: ${path.basename(templatePath)}`);

  // Citação
  const quoteData = getRandomQuote();
  console.log(`📝 "${quoteData.text.substring(0, 50)}..."`);
  console.log(`   — ${quoteData.author}\n`);

  // Gerar imagem
  await updateHubStatus('active', 'Renderizando imagem (Canvas)...');
  const timestamp = Date.now();
  const outputDir = path.join(CONFIG.OUTPUT_DIR, 'generated', `${CONFIG.PROFILE}_${timestamp}`);
  const imagePath = path.join(outputDir, `${CONFIG.PROFILE}_feed.jpg`);
  const videoPath = path.join(outputDir, `${CONFIG.PROFILE}_reels.mp4`);

  await generateImage(templatePath, quoteData.text, quoteData.author, imagePath);
  console.log('✅ Imagem gerada');

  // Determinar tipo (Feed = ímpar, Reels = par)
  const hour = new Date().getHours();
  const isReels = hour % 2 === 0;

  // Próximo horário
  const nextHour = getNextHour(hour);
  const scheduledDate = new Date();
  scheduledDate.setHours(nextHour, 0, 0, 0);
  const scheduledISO = scheduledDate.toISOString();

  // Obter CTA dinâmico (A/B Test)
  const activeCTA = getDynamicCTA();

  const caption = `"${quoteData.text}"
  
— ${quoteData.author}

${activeCTA.copy}

#refugiodivinos #fe #salmos #esperanca #deus #amor #motivacao`;

  if (isReels) {
    // === REELS ===
    await updateHubStatus('active', 'Processando vídeo para Reels...');
    const audioPath = getRandomAudio();
    const videoCreated = createVideo(imagePath, audioPath, videoPath);

    if (videoCreated) {
      await updateHubStatus('active', 'Agendando Reels via Upload-Post...');
      const result = scheduleReels({
        profile: CONFIG.PROFILE,
        videoPath,
        caption,
        scheduledDate: scheduledISO
      });

      if (result.ok) {
        console.log(`\n✅ REELS AGENDADO (${scheduledDate.toLocaleTimeString('pt-BR')})`);
        console.log(`   Job: ${result.json?.job_id || 'N/A'}`);
        await updateHubStatus('idle', `Reels agendado para ${nextHour}:00`);
      } else {
        await updateHubStatus('error', 'Falha no agendamento do Reels');
      }
    } else {
      await updateHubStatus('error', 'Falha na renderização do vídeo');
    }
  } else {
    // === FEED ===
    await updateHubStatus('active', 'Processando post para Feed...');
    // Salvar caption em arquivo para evitar escape de shell
    const captionFile = path.join(CONFIG.OUTPUT_DIR, 'tmp', `caption_${timestamp}.txt`);
    const captionDir = path.dirname(captionFile);
    if (!fs.existsSync(captionDir)) fs.mkdirSync(captionDir, { recursive: true });
    fs.writeFileSync(captionFile, caption);

    await updateHubStatus('active', 'Agendando Feed via Upload-Post...');
    const result = scheduleFeed({
      profile: CONFIG.PROFILE,
      imagePath,
      captionFile,
      scheduledDate: scheduledISO
    });

    if (result.ok) {
      console.log(`\n✅ FEED AGENDADO (${scheduledDate.toLocaleTimeString('pt-BR')})`);
      console.log(`   Job: ${result.json?.job_id || 'N/A'}`);
      await updateHubStatus('idle', `Feed agendado para ${nextHour}:00`);
    } else {
      await updateHubStatus('error', 'Falha no agendamento do Feed');
    }
  }

  await updateHubStatus('completed', 'Pipeline concluída com sucesso');
}

main().catch(async (err) => {
  console.error('❌ Erro fatal:', err);
  await updateHubStatus('error', err.message);
});
