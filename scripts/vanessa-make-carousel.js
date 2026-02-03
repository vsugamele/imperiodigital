const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BASE_DIR = 'C:/Users/vsuga/clawd';

const PALETTE = {
  green: '#2C9C5E',
  green2: '#4EDC88',
  orange: '#FF6A29',
  black: '#111111',
  gray: '#666666',
  white: '#FFFFFF',
};

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function svgText({
  width,
  height,
  bg = PALETTE.white,
  blocks = [],
}) {
  // blocks: {x,y,w, text, size, weight, color, align, lineHeight}
  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`);
  parts.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="${bg}"/>`);

  for (const b of blocks) {
    const x = b.x ?? 60;
    const y = b.y ?? 80;
    const w = b.w ?? (width - 120);
    const size = b.size ?? 64;
    const weight = b.weight ?? 700;
    const color = b.color ?? PALETTE.black;
    const align = b.align ?? 'start';
    const lineHeight = b.lineHeight ?? Math.round(size * 1.15);

    // very simple wrapping
    const words = String(b.text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = '';
    const maxChars = Math.max(18, Math.floor(w / (size * 0.55)));
    for (const word of words) {
      const next = cur ? cur + ' ' + word : word;
      if (next.length > maxChars) {
        if (cur) lines.push(cur);
        cur = word;
      } else {
        cur = next;
      }
    }
    if (cur) lines.push(cur);

    const anchor = align === 'middle' ? 'middle' : align === 'end' ? 'end' : 'start';
    const tx = align === 'middle' ? x + w / 2 : align === 'end' ? x + w : x;

    parts.push(`<g font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">`);
    lines.forEach((ln, i) => {
      const yy = y + i * lineHeight;
      parts.push(`<text x="${tx}" y="${yy}" text-anchor="${anchor}">${esc(ln)}</text>`);
    });
    parts.push(`</g>`);
  }

  parts.push(`</svg>`);
  return Buffer.from(parts.join(''));
}

async function makeSlide({
  outPath,
  photoPath,
  title,
  subtitle,
  footer,
  accent = PALETTE.green,
  warn = false,
}) {
  const W = 1080;
  const H = 1350;
  const TOP_H = 420;
  const PHOTO_H = 780;
  const FOOT_H = H - TOP_H - PHOTO_H;

  // Background base
  const base = sharp({ create: { width: W, height: H, channels: 4, background: PALETTE.white } });

  // Photo crop
  let photo = sharp(photoPath)
    .resize(W, PHOTO_H, { fit: 'cover', position: 'attention' });

  // Slight dark overlay for readability on photo
  const photoOverlay = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${PHOTO_H}">
      <rect x="0" y="0" width="${W}" height="${PHOTO_H}" fill="rgba(0,0,0,0.12)"/>
    </svg>`
  );

  // Top text layer
  const topBlocks = [];
  if (title) {
    topBlocks.push({
      x: 70,
      y: 120,
      w: W - 140,
      text: title,
      size: 88,
      weight: 800,
      color: warn ? PALETTE.orange : accent,
      align: 'start',
      lineHeight: 96,
    });
  }
  if (subtitle) {
    topBlocks.push({
      x: 70,
      y: 260,
      w: W - 140,
      text: subtitle,
      size: 44,
      weight: 500,
      color: PALETTE.black,
      align: 'start',
      lineHeight: 56,
    });
  }

  const topSvg = svgText({ width: W, height: TOP_H, bg: PALETTE.white, blocks: topBlocks });

  // Footer bar
  const footerSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${FOOT_H}">
      <rect x="0" y="0" width="${W}" height="${FOOT_H}" fill="${PALETTE.white}"/>
      <rect x="0" y="0" width="${W}" height="8" fill="${accent}"/>
      <text x="70" y="78" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="600" fill="${PALETTE.gray}">${esc(footer || 'EquilibreON • Reprogramação 360')}</text>
    </svg>`
  );

  const composed = await base
    .composite([
      { input: topSvg, top: 0, left: 0 },
      { input: await photo.toBuffer(), top: TOP_H, left: 0 },
      { input: photoOverlay, top: TOP_H, left: 0 },
      { input: footerSvg, top: TOP_H + PHOTO_H, left: 0 },
    ])
    .png()
    .toBuffer();

  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, composed);
}

async function main() {
  const refsDir = path.join(BASE_DIR, 'tmp', 'vanessa', 'refs');
  const model = path.join(refsDir, 'modelocarro01.png');
  if (!fs.existsSync(model)) {
    console.error('Missing modelocarro01.png in tmp/vanessa/refs');
    process.exit(2);
  }

  const outRoot = path.join(BASE_DIR, 'tmp', 'vanessa', 'Semana-01');
  const c1 = path.join(outRoot, 'Carrossel-01');
  const c2 = path.join(outRoot, 'Carrossel-02');

  // Carrossel 01 slides
  const slides1 = [
    { title: 'EMAGRECI RÁPIDO…', subtitle: 'Mas será que foi gordura mesmo?' },
    { title: 'A balança não mede “gordura”.', subtitle: 'Ela mede PESO.' },
    { title: 'Peso não é só gordura.', subtitle: 'Peso = gordura + água + músculo + estrutura óssea.' },
    { title: 'Perda rápida', subtitle: 'Muitas vezes é água + massa muscular (não gordura).' },
    { title: 'Perdeu músculo?', subtitle: 'Perdeu um órgão metabólico.' },
    { title: 'Músculo ≠ estética', subtitle: 'Músculo = metabolismo ativo + proteção contra rebote.' },
    { title: 'Déficit agressivo', subtitle: 'Pode “secar”… mas costuma cobrar caro.', warn: true },
    { title: 'Frase pra guardar:', subtitle: '“Um corpo desnutrido não emagrece. Ele entra em colapso.”' },
    { title: 'Reprogramação 360', subtitle: 'Nutrição + movimento + suporte metabólico. É ensinar o corpo a funcionar de novo.' },
  ];

  for (let i = 0; i < slides1.length; i++) {
    const idx = String(i + 1).padStart(2, '0');
    await makeSlide({
      outPath: path.join(c1, `C01_S${idx}.png`),
      photoPath: model,
      title: slides1[i].title,
      subtitle: slides1[i].subtitle,
      footer: 'EquilibreON • Reprogramação 360',
      accent: PALETTE.green,
      warn: !!slides1[i].warn,
    });
  }

  // Carrossel 02 slides
  const slides2 = [
    { title: 'CANETA EMAGRECEDORA', subtitle: 'Vilã ou solução?' },
    { title: 'Ferramenta.', subtitle: 'Mas não é solução isolada.' },
    { title: 'De forma simples:', subtitle: 'Geralmente reduz apetite → reduz ingestão calórica.' },
    { title: 'O risco do atalho', subtitle: 'Sem plano: pouco nutriente + pouco treino + pouco suporte.' },
    { title: 'Sem estratégia', subtitle: 'Pode perder músculo + água + metabolismo.' },
    { title: 'Sem músculo', subtitle: 'Não há emagrecimento sustentável. Há rebote.' , warn: true},
    { title: 'Se for usar', subtitle: 'Acompanhamento + nutrição + estímulo muscular + suporte metabólico.' },
    { title: 'Regra EquilibreON', subtitle: 'Reprogramação 360 primeiro. A ferramenta entra quando faz sentido.' },
    { title: 'Emagrecer não é “comer menos”.', subtitle: 'É reprogramar o corpo.' },
  ];

  for (let i = 0; i < slides2.length; i++) {
    const idx = String(i + 1).padStart(2, '0');
    await makeSlide({
      outPath: path.join(c2, `C02_S${idx}.png`),
      photoPath: model,
      title: slides2[i].title,
      subtitle: slides2[i].subtitle,
      footer: 'EquilibreON • Reprogramação 360',
      accent: PALETTE.green,
      warn: !!slides2[i].warn,
    });
  }

  console.log('OK: generated', { outRoot });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
