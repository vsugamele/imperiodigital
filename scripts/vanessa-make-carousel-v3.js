const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BASE_DIR = 'C:/Users/vsuga/clawd';

// Paleta oficial Equilibreon
const PALETTE = {
  greenDark: '#2C9C5E',
  greenLight: '#4EDC88',
  orange: '#FF6A29',
  purple: '#9292FF',
  blue: '#4DA6FF',
  black: '#000000',
  charcoal: '#3A3A3A',
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

function wrapText(text, maxChars) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
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
  return lines;
}

// Layout 1: Título grande no centro-inferior, foto top
function createLayout1({ width, height, headline, body }) {
  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`);
  
  // Semi-transparent overlay para legibilidade
  parts.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="rgba(0,0,0,0.15)"/>`);
  
  // Profile badge (topo centro)
  const badgeY = 60;
  const badgeCenterX = width / 2;
  
  // Profile circle background
  parts.push(`<circle cx="${badgeCenterX - 120}" cy="${badgeY}" r="22" fill="${PALETTE.white}"/>`);
  
  // Profile text
  parts.push(`<g font-family="Arial, Helvetica, sans-serif">`);
  parts.push(`<text x="${badgeCenterX - 85}" y="${badgeY - 10}" font-size="17" font-weight="700" fill="${PALETTE.white}">Dra. Vanessa Damasceno</text>`);
  parts.push(`<text x="${badgeCenterX - 85}" y="${badgeY + 8}" font-size="13" font-weight="400" fill="${PALETTE.greenLight}">@dravanessadamasceno ✓</text>`);
  parts.push(`</g>`);
  
  // Headline (centro-inferior, grande)
  const headlineY = height - 420;
  const headlineLines = wrapText(headline, 20);
  const lineHeight = 110;
  
  parts.push(`<g font-family="Georgia, serif" font-size="100" font-weight="700" fill="${PALETTE.white}">`);
  headlineLines.forEach((line, i) => {
    const yPos = headlineY + (i * lineHeight);
    parts.push(`<text x="60" y="${yPos}">${esc(line)}</text>`);
  });
  parts.push(`</g>`);
  
  // Body (abaixo do título)
  if (body) {
    const bodyY = headlineY + (headlineLines.length * lineHeight) + 40;
    const bodyLines = wrapText(body, 50);
    parts.push(`<g font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="400" fill="${PALETTE.white}">`);
    bodyLines.forEach((line, i) => {
      parts.push(`<text x="60" y="${bodyY + (i * 42)}">${esc(line)}</text>`);
    });
    parts.push(`</g>`);
  }
  
  parts.push(`</svg>`);
  return Buffer.from(parts.join(''));
}

// Layout 2: Título à esquerda vertical center, com barra de destaque
function createLayout2({ width, height, headline, body, accent }) {
  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`);
  
  parts.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="rgba(0,0,0,0.2)"/>`);
  
  // Profile (topo esquerda)
  parts.push(`<circle cx="95" cy="70" r="22" fill="${PALETTE.white}"/>`);
  parts.push(`<g font-family="Arial, Helvetica, sans-serif">`);
  parts.push(`<text x="130" y="62" font-size="17" font-weight="700" fill="${PALETTE.white}">Dra. Vanessa Damasceno</text>`);
  parts.push(`<text x="130" y="80" font-size="13" font-weight="400" fill="${PALETTE.greenLight}">@dravanessadamasceno ✓</text>`);
  parts.push(`</g>`);
  
  // Barra de destaque atrás do título
  const barY = height / 2 - 100;
  const barHeight = 220;
  parts.push(`<rect x="0" y="${barY}" width="${width}" height="${barHeight}" fill="${accent}" opacity="0.9"/>`);
  
  // Headline (centro vertical)
  const headlineY = height / 2;
  const headlineLines = wrapText(headline, 18);
  parts.push(`<g font-family="Georgia, serif" font-size="90" font-weight="700" fill="${PALETTE.white}">`);
  headlineLines.forEach((line, i) => {
    parts.push(`<text x="60" y="${headlineY + (i * 100)}">${esc(line)}</text>`);
  });
  parts.push(`</g>`);
  
  // Body
  if (body) {
    const bodyY = height - 220;
    const bodyLines = wrapText(body, 45);
    parts.push(`<g font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="400" fill="${PALETTE.white}">`);
    bodyLines.forEach((line, i) => {
      parts.push(`<text x="60" y="${bodyY + (i * 38)}">${esc(line)}</text>`);
    });
    parts.push(`</g>`);
  }
  
  parts.push(`</svg>`);
  return Buffer.from(parts.join(''));
}

// Layout 3: Texto no topo, foto embaixo
function createLayout3({ width, height, headline, body }) {
  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`);
  
  parts.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="rgba(0,0,0,0.18)"/>`);
  
  // Profile (centro topo)
  const badgeX = width / 2;
  parts.push(`<circle cx="${badgeX - 120}" cy="70" r="22" fill="${PALETTE.white}"/>`);
  parts.push(`<g font-family="Arial, Helvetica, sans-serif">`);
  parts.push(`<text x="${badgeX - 85}" y="62" font-size="17" font-weight="700" fill="${PALETTE.white}">Dra. Vanessa Damasceno</text>`);
  parts.push(`<text x="${badgeX - 85}" y="80" font-size="13" font-weight="400" fill="${PALETTE.greenLight}">@dravanessadamasceno ✓</text>`);
  parts.push(`</g>`);
  
  // Headline (topo, após profile)
  const headlineY = 200;
  const headlineLines = wrapText(headline, 22);
  parts.push(`<g font-family="Georgia, serif" font-size="85" font-weight="700" fill="${PALETTE.white}">`);
  headlineLines.forEach((line, i) => {
    parts.push(`<text x="60" y="${headlineY + (i * 95)}">${esc(line)}</text>`);
  });
  parts.push(`</g>`);
  
  // Body
  if (body) {
    const bodyY = headlineY + (headlineLines.length * 95) + 50;
    const bodyLines = wrapText(body, 48);
    parts.push(`<g font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="400" fill="${PALETTE.white}">`);
    bodyLines.forEach((line, i) => {
      parts.push(`<text x="60" y="${bodyY + (i * 40)}">${esc(line)}</text>`);
    });
    parts.push(`</g>`);
  }
  
  parts.push(`</svg>`);
  return Buffer.from(parts.join(''));
}

async function makeSlide({ outPath, photoPath, headline, body, layout = 1, accent = PALETTE.greenLight }) {
  const W = 1080;
  const H = 1350;
  
  // Carregar foto
  const photoBuffer = await sharp(photoPath)
    .resize(W, H, { fit: 'cover', position: 'attention' })
    .toBuffer();
  
  // Criar overlay de texto
  let textOverlay;
  if (layout === 1) {
    textOverlay = createLayout1({ width: W, height: H, headline, body });
  } else if (layout === 2) {
    textOverlay = createLayout2({ width: W, height: H, headline, body, accent });
  } else {
    textOverlay = createLayout3({ width: W, height: H, headline, body });
  }
  
  // Composite
  const final = await sharp(photoBuffer)
    .composite([{ input: textOverlay, top: 0, left: 0 }])
    .png()
    .toBuffer();
  
  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, final);
}

async function main() {
  const photosDir = path.join(BASE_DIR, 'tmp', 'vanessa', 'profile');
  const photoFiles = fs.readdirSync(photosDir)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .map(f => path.join(photosDir, f));
  
  if (photoFiles.length === 0) {
    console.error('No photos found in tmp/vanessa/profile');
    process.exit(2);
  }
  
  console.log(`Found ${photoFiles.length} photos`);
  
  const outRoot = path.join(BASE_DIR, 'tmp', 'vanessa', 'Semana-01-v3');
  const c1 = path.join(outRoot, 'Carrossel-01');
  const c2 = path.join(outRoot, 'Carrossel-02');
  
  // Carrossel 01
  const slides1 = [
    { headline: 'EMAGRECI RÁPIDO…', body: 'Mas será que foi gordura mesmo?', layout: 1 },
    { headline: 'A balança não mede gordura.', body: 'Ela mede PESO.', layout: 2, accent: PALETTE.greenDark },
    { headline: 'Peso não é só gordura.', body: 'Peso = gordura + água + músculo + estrutura óssea.', layout: 3 },
    { headline: 'Perda rápida', body: 'Muitas vezes é água + massa muscular (não gordura).', layout: 1 },
    { headline: 'Perdeu músculo?', body: 'Perdeu um órgão metabólico.', layout: 2, accent: PALETTE.greenLight },
    { headline: 'Músculo ≠ estética', body: 'Músculo = metabolismo ativo + proteção contra rebote.', layout: 3 },
    { headline: 'Déficit agressivo', body: 'Pode "secar"… mas costuma cobrar caro.', layout: 2, accent: PALETTE.orange },
    { headline: 'Frase pra guardar:', body: '"Um corpo desnutrido não emagrece. Ele entra em colapso."', layout: 3 },
    { headline: 'Reprogramação 360', body: 'Nutrição + movimento + suporte metabólico. É ensinar o corpo a funcionar de novo.', layout: 1 },
  ];
  
  console.log('Generating Carrossel 01...');
  for (let i = 0; i < slides1.length; i++) {
    const photoIdx = i % photoFiles.length;
    const photoPath = photoFiles[photoIdx];
    
    let filename;
    if (i === 0) filename = '01-capa.png';
    else if (i === slides1.length - 1) filename = `${String(i + 1).padStart(2, '0')}-cta.png`;
    else filename = `${String(i + 1).padStart(2, '0')}.png`;
    
    await makeSlide({
      outPath: path.join(c1, filename),
      photoPath,
      headline: slides1[i].headline,
      body: slides1[i].body,
      layout: slides1[i].layout || 1,
      accent: slides1[i].accent || PALETTE.greenLight,
    });
    
    console.log(`  ✓ ${filename} (layout ${slides1[i].layout || 1})`);
  }
  
  // Carrossel 02
  const slides2 = [
    { headline: 'CANETA EMAGRECEDORA', body: 'Vilã ou solução?', layout: 1 },
    { headline: 'Ferramenta.', body: 'Mas não é solução isolada.', layout: 2, accent: PALETTE.greenDark },
    { headline: 'De forma simples:', body: 'Geralmente reduz apetite → reduz ingestão calórica.', layout: 3 },
    { headline: 'O risco do atalho', body: 'Sem plano: pouco nutriente + pouco treino + pouco suporte.', layout: 1 },
    { headline: 'Sem estratégia', body: 'Pode perder músculo + água + metabolismo.', layout: 2, accent: PALETTE.greenLight },
    { headline: 'Sem músculo', body: 'Não há emagrecimento sustentável. Há rebote.', layout: 2, accent: PALETTE.orange },
    { headline: 'Se for usar', body: 'Acompanhamento + nutrição + estímulo muscular + suporte metabólico.', layout: 3 },
    { headline: 'Regra EquilibreON', body: 'Reprogramação 360 primeiro. A ferramenta entra quando faz sentido.', layout: 1 },
    { headline: 'Emagrecer não é "comer menos".', body: 'É reprogramar o corpo.', layout: 2, accent: PALETTE.greenLight },
  ];
  
  console.log('Generating Carrossel 02...');
  for (let i = 0; i < slides2.length; i++) {
    const photoIdx = i % photoFiles.length;
    const photoPath = photoFiles[photoIdx];
    
    let filename;
    if (i === 0) filename = '01-capa.png';
    else if (i === slides2.length - 1) filename = `${String(i + 1).padStart(2, '0')}-cta.png`;
    else filename = `${String(i + 1).padStart(2, '0')}.png`;
    
    await makeSlide({
      outPath: path.join(c2, filename),
      photoPath,
      headline: slides2[i].headline,
      body: slides2[i].body,
      layout: slides2[i].layout || 1,
      accent: slides2[i].accent || PALETTE.greenLight,
    });
    
    console.log(`  ✓ ${filename} (layout ${slides2[i].layout || 1})`);
  }
  
  console.log(`\n✅ Done! Output: ${outRoot}`);
  console.log(`   Carrossel 01: ${slides1.length} slides`);
  console.log(`   Carrossel 02: ${slides2.length} slides`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
