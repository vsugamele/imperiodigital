/**
 * PetSelectUK generator
 * - Downloads a random product image from Drive (2026/PetSelectUK/products)
 * - Uses style refs from Drive (2026/PetSelectUK/style_refs)
 * - Generates:
 *   - 1 image 4:5
 *   - 5 carousel slides (4:5)
 *   - 1 reels base image 9:16 (derived prompt) + MP4 9:16 10s zoom
 * - Uploads outputs to Drive (2026/PetSelectUK/outputs/...)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { loadOpsEnv } = require('./_load-ops-env');
loadOpsEnv();

// Gemini key must be provided via env (ops-dashboard/.env.local)
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
if (!GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY (set it in ops-dashboard/.env.local)');
}
const RCLONE_PATH = 'C:\\Users\\vsuga\\clawd\\rclone.exe';

const ROOT_2026_ID = '1rtxKtTlZ6MHR0iv1Kcmh5DDfSN-clyEp';
const BASE_REMOTE = `gdrive,root_folder_id=${ROOT_2026_ID}:PetSelectUK`;

const LOCAL_DIR = 'C:\\Users\\vsuga\\clawd\\petselectuk';
const LOCAL_PRODUCTS = path.join(LOCAL_DIR, 'products');
const LOCAL_STYLE = path.join(LOCAL_DIR, 'style_refs');
const LOCAL_OUT = path.join(LOCAL_DIR, 'outputs');
const LOCAL_IMG = path.join(LOCAL_OUT, 'images');
const LOCAL_CAR = path.join(LOCAL_OUT, 'carousels');
const LOCAL_REELS = path.join(LOCAL_OUT, 'reels');

[LOCAL_DIR, LOCAL_PRODUCTS, LOCAL_STYLE, LOCAL_OUT, LOCAL_IMG, LOCAL_CAR, LOCAL_REELS].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

function rclone(args) {
  return execSync(`"${RCLONE_PATH}" ${args}`, { encoding: 'utf8' });
}

function listRemoteFiles(remotePath) {
  const out = rclone(`lsf "${remotePath}" --files-only`);
  return out.trim().split('\n').filter(Boolean);
}

function copyRandom(remoteBase, localDestDir) {
  const files = listRemoteFiles(remoteBase).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
  if (!files.length) throw new Error('No images in remote: ' + remoteBase);
  const sel = rand(files);
  const dest = path.join(localDestDir, sel.replace(/[^a-z0-9._-]/gi, '_'));
  execSync(`"${RCLONE_PATH}" copyto "${remoteBase}/${sel}" "${dest}"`, { stdio: 'pipe' });
  return dest;
}

async function geminiGenerateImage({ prompt, refs, label }) {
  const parts = [{ text: prompt }];
  for (const p of refs) {
    const buf = fs.readFileSync(p);
    const b64 = buf.toString('base64');
    const ext = path.extname(p).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    parts.push({ inline_data: { mime_type: mime, data: b64 } });
  }

  const payload = {
    contents: [{ parts }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { imageSize: '2K' }
    }
  };

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 180000
    }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
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
              project: 'petselectuk',
              inputTokens: usage.promptTokenCount || usage.promptTokens || 0,
              outputTokens: usage.candidatesTokenCount || usage.candidatesTokens || 0,
              meta: { kind: 'image', label }
            });
          } catch {}

          resolve(part ? Buffer.from(part.inlineData.data, 'base64') : null);
        } catch (e) {
          console.log('❌ Gemini parse error', label || '', e.message);
          resolve(null);
        }
      });
    });

    req.on('timeout', () => {
      console.log('❌ Gemini timeout', label || '');
      req.destroy(new Error('timeout'));
      resolve(null);
    });

    req.on('error', (e) => {
      console.log('❌ Gemini request error', label || '', e.message);
      resolve(null);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

function createReelVideo(imgPath, outMp4) {
  const zoomFilter = "scale=1200:-1,zoompan=z='min(zoom+0.0006,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=250:s=1080x1920"; // ~10s @25fps
  const cmd = `ffmpeg -y -loop 1 -r 25 -i "${imgPath}" -vf "${zoomFilter}" -c:v libx264 -preset veryfast -pix_fmt yuv420p -t 10 "${outMp4}"`;
  execSync(cmd, { stdio: 'ignore' });
}

function uploadOutputsToDrive({ runId, files }) {
  // files: { images:[], carousels:[], reels:[] }
  const up = (local, remote) => execSync(`"${RCLONE_PATH}" copyto "${local}" "${remote}"`, { stdio: 'pipe' });

  for (const p of files.images || []) {
    const remote = `${BASE_REMOTE}/outputs/images/${path.basename(p)}`;
    up(p, remote);
  }
  for (const p of files.carousels || []) {
    const remote = `${BASE_REMOTE}/outputs/carousels/${path.basename(p)}`;
    up(p, remote);
  }
  for (const p of files.reels || []) {
    const remote = `${BASE_REMOTE}/outputs/reels/${path.basename(p)}`;
    up(p, remote);
  }
}

async function main() {
  const runId = Date.now();

  // download one product + 2 style refs
  const product = copyRandom(`${BASE_REMOTE}/products`, LOCAL_PRODUCTS);
  const style1 = copyRandom(`${BASE_REMOTE}/style_refs`, LOCAL_STYLE);
  const style2 = copyRandom(`${BASE_REMOTE}/style_refs`, LOCAL_STYLE);

  const baseRefs = [product, style1, style2];

  // IMAGE 4:5
  const imgPrompt = `Create a premium UK pet e-commerce Instagram post (4:5 portrait).

Use the real PRODUCT from reference image. Keep the exact product packaging/logo unchanged.
Style inspiration: use the STYLE references for typography/layout vibe (clean, playful doodles, UK premium).

Content theme: PetSelectUK (UK-based, ethical, friendly). British humour is welcome but keep it subtle.

Design rules:
- 4:5 aspect ratio
- Clean background, product + pet context (dog/cat) but do NOT change the product branding
- Big readable headline (max 6 words)
- 3 short bullet points
- Small footer: "PetSelectUK" + "UK Delivery"

No medical claims. If mentioning health, use generic language only.
`; 

  console.log('🖼️  Generating image 4:5...');
  const imgBuf = await geminiGenerateImage({ prompt: imgPrompt, refs: baseRefs, label: 'image_4x5' });
  if (!imgBuf) throw new Error('Failed to generate image');
  const imgPath = path.join(LOCAL_IMG, `petselectuk_image_${runId}.png`);
  fs.writeFileSync(imgPath, imgBuf);

  // CAROUSEL 5 slides 4:5
  const carouselTopics = [
    'Bath day mistakes (UK edition)',
    'Rainy day walk essentials',
    'Dog-friendly pub etiquette',
    'Sensitive skin: what to look for (ask your vet)',
    'Quick recap + CTA'
  ];

  const carouselPaths = [];
  for (let i = 0; i < 5; i++) {
    const slidePrompt = `Create slide ${i + 1}/5 of a UK pet Instagram carousel (4:5 portrait).

Keep style consistent across slides. Use PetSelectUK brand vibe.
Use the PRODUCT reference but you may show it smaller as a corner element.

Slide topic: ${carouselTopics[i]}

Rules:
- 4:5 aspect
- Very large headline + 2-3 short lines max
- Clean layout, doodles ok
- Footer: "@petselectuk".
No medical claims.
`;
    console.log(`🧩 Generating carousel slide ${i + 1}/5...`);
    // Delay para evitar rate limit da Gemini API
    if (i > 0) {
      console.log('⏳ Waiting 5s to avoid rate limit...');
      await new Promise(r => setTimeout(r, 5000));
    }
    const buf = await geminiGenerateImage({ prompt: slidePrompt, refs: baseRefs, label: `carousel_${i + 1}` });
    if (!buf) throw new Error('Failed to generate carousel slide ' + (i + 1));
    const p = path.join(LOCAL_CAR, `petselectuk_carousel_${runId}_${i + 1}.png`);
    fs.writeFileSync(p, buf);
    carouselPaths.push(p);
  }

  // REELS 9:16 base image + mp4
  const reelsPrompt = `Create a 9:16 Instagram Reels cover image for UK pet e-commerce.

Use the real PRODUCT from reference image and keep branding unchanged.
Style inspiration: the STYLE references (clean, UK premium, subtle humour).

Text overlay (big, readable): "UK Delivery. Properly."\nSmaller line: "PetSelectUK"

Rules:
- 9:16 aspect ratio
- Modern typography, high contrast
- Clean background, product hero
`;

  console.log('🎞️  Generating reels 9:16 cover...');
  const reelsBuf = await geminiGenerateImage({ prompt: reelsPrompt, refs: baseRefs, label: 'reels_9x16' });
  if (!reelsBuf) throw new Error('Failed to generate reels image');
  const reelsImg = path.join(LOCAL_REELS, `petselectuk_reels_${runId}.png`);
  fs.writeFileSync(reelsImg, reelsBuf);

  const reelsMp4 = path.join(LOCAL_REELS, `petselectuk_reels_${runId}.mp4`);
  createReelVideo(reelsImg, reelsMp4);

  // upload outputs to Drive
  uploadOutputsToDrive({ runId, files: { images: [imgPath], carousels: carouselPaths, reels: [reelsImg, reelsMp4] } });

  // write local meta
  const metaDir = path.join('C:\\Users\\vsuga\\clawd', 'results', 'runs', 'petselectuk');
  if (!fs.existsSync(metaDir)) fs.mkdirSync(metaDir, { recursive: true });
  fs.writeFileSync(path.join(metaDir, `${runId}.json`), JSON.stringify({
    runId,
    createdAt: new Date(runId).toISOString(),
    product: path.basename(product),
    refs: baseRefs.map(p => path.basename(p)),
    outputs: {
      image: path.basename(imgPath),
      carousel: carouselPaths.map(p => path.basename(p)),
      reels: [path.basename(reelsImg), path.basename(reelsMp4)]
    }
  }, null, 2));

  console.log(JSON.stringify({ ok: true, runId, imgPath, carouselPaths, reelsMp4 }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
