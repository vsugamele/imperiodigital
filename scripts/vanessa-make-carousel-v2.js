const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BASE_DIR = 'C:/Users/vsuga/clawd';

// Paleta oficial Equilibreon
const PALETTE = {
  greenDark: '#2C9C5E',   // Verde Escuro (principal)
  greenLight: '#4EDC88',  // Verde Claro/Mint (principal)
  orange: '#FF6A29',      // Laranja (apoio)
  purple: '#9292FF',      // Roxo Claro (apoio)
  blue: '#4DA6FF',        // Azul (apoio)
  black: '#000000',       // Preto
  charcoal: '#3A3A3A',    // Cinza escuro para overlays
  gray: '#666666',        // Cinza para texto secundário
  white: '#FFFFFF',       // Branco
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

function createTextOverlay({
  width,
  height,
  headline,
  body,
  accentColor = PALETTE.greenLight,
  isFirst = false,
  isLast = false,
}) {
  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`);

  // Semi-transparent dark overlay for better text contrast
  parts.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="rgba(0,0,0,0.25)"/>`);

  // Position text in lower third
  const textY = height - 480; // Start text ~480px from bottom
  let currentY = textY;

  if (headline) {
    // Headline with colored accent bar background
    const headlineLines = wrapText(headline, 28);
    const lineHeight = 90;
    const headlineHeight = headlineLines.length * lineHeight + 40;
    
    // Accent bar behind headline
    parts.push(`<rect x="60" y="${currentY - 20}" width="${width - 120}" height="${headlineHeight}" fill="${accentColor}" rx="8"/>`);
    
    // Headline text (serif-style, bold)
    parts.push(`<g font-family="Georgia, serif" font-size="72" font-weight="700" fill="${PALETTE.black}">`);
    headlineLines.forEach((line, i) => {
      const yPos = currentY + 70 + (i * lineHeight);
      parts.push(`<text x="80" y="${yPos}">${esc(line)}</text>`);
    });
    parts.push(`</g>`);
    
    currentY += headlineHeight + 30;
  }

  if (body) {
    // Body text with dark semi-transparent background
    const bodyLines = wrapText(body, 45);
    const lineHeight = 48;
    const bodyHeight = bodyLines.length * lineHeight + 40;
    
    // Dark background box
    parts.push(`<rect x="60" y="${currentY - 10}" width="${width - 120}" height="${bodyHeight}" fill="rgba(58,58,58,0.85)" rx="8"/>`);
    
    // Body text (sans-serif, medium weight)
    parts.push(`<g font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="500" fill="${PALETTE.white}">`);
    bodyLines.forEach((line, i) => {
      const yPos = currentY + 38 + (i * lineHeight);
      parts.push(`<text x="80" y="${yPos}">${esc(line)}</text>`);
    });
    parts.push(`</g>`);
    
    currentY += bodyHeight + 20;
  }

  // Branding footer
  const footerY = height - 100;
  parts.push(`<g font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="600" fill="${PALETTE.white}">`);
  parts.push(`<text x="80" y="${footerY}" opacity="0.9">EquilibreON • Reprogramação 360</text>`);
  parts.push(`</g>`);

  parts.push(`</svg>`);
  return Buffer.from(parts.join(''));
}

async function makeSlide({
  outPath,
  photoPath,
  headline,
  body,
  accent = PALETTE.greenLight,
  isFirst = false,
  isLast = false,
}) {
  const W = 1080;
  const H = 1350; // 4:5 ratio for Instagram

  // Load and crop photo to fill canvas
  const photoBuffer = await sharp(photoPath)
    .resize(W, H, { fit: 'cover', position: 'attention' })
    .toBuffer();

  // Create text overlay
  const textOverlay = createTextOverlay({
    width: W,
    height: H,
    headline,
    body,
    accentColor: accent,
    isFirst,
    isLast,
  });

  // Composite photo + text overlay
  const final = await sharp(photoBuffer)
    .composite([{ input: textOverlay, top: 0, left: 0 }])
    .png()
    .toBuffer();

  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, final);
}

async function main() {
  const photosDir = path.join(BASE_DIR, 'tmp', 'vanessa', 'photos');
  const photoFiles = fs.readdirSync(photosDir)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .map(f => path.join(photosDir, f));

  if (photoFiles.length === 0) {
    console.error('No photos found in tmp/vanessa/photos');
    process.exit(2);
  }

  console.log(`Found ${photoFiles.length} reference photos`);

  const outRoot = path.join(BASE_DIR, 'tmp', 'vanessa', 'Semana-01-v2');
  const c1 = path.join(outRoot, 'Carrossel-01');
  const c2 = path.join(outRoot, 'Carrossel-02');

  // Carrossel 01 slides
  const slides1 = [
    { headline: 'EMAGRECI RÁPIDO…', body: 'Mas será que foi gordura mesmo?' },
    { headline: 'A balança não mede "gordura".', body: 'Ela mede PESO.' },
    { headline: 'Peso não é só gordura.', body: 'Peso = gordura + água + músculo + estrutura óssea.' },
    { headline: 'Perda rápida', body: 'Muitas vezes é água + massa muscular (não gordura).' },
    { headline: 'Perdeu músculo?', body: 'Perdeu um órgão metabólico.' },
    { headline: 'Músculo ≠ estética', body: 'Músculo = metabolismo ativo + proteção contra rebote.' },
    { headline: 'Déficit agressivo', body: 'Pode "secar"… mas costuma cobrar caro.', accent: PALETTE.orange },
    { headline: 'Frase pra guardar:', body: '"Um corpo desnutrido não emagrece. Ele entra em colapso."' },
    { headline: 'Reprogramação 360', body: 'Nutrição + movimento + suporte metabólico. É ensinar o corpo a funcionar de novo.' },
  ];

  console.log('Generating Carrossel 01...');
  for (let i = 0; i < slides1.length; i++) {
    const photoIdx = i % photoFiles.length; // Cycle through photos
    const photoPath = photoFiles[photoIdx];
    
    // Naming: 01-capa.png, 02.png, ..., 09-cta.png
    let filename;
    if (i === 0) {
      filename = '01-capa.png';
    } else if (i === slides1.length - 1) {
      filename = `${String(i + 1).padStart(2, '0')}-cta.png`;
    } else {
      filename = `${String(i + 1).padStart(2, '0')}.png`;
    }

    await makeSlide({
      outPath: path.join(c1, filename),
      photoPath,
      headline: slides1[i].headline,
      body: slides1[i].body,
      accent: slides1[i].accent || PALETTE.greenLight,
      isFirst: i === 0,
      isLast: i === slides1.length - 1,
    });
    
    console.log(`  ✓ ${filename} (photo: ${path.basename(photoPath)})`);
  }

  // Carrossel 02 slides
  const slides2 = [
    { headline: 'CANETA EMAGRECEDORA', body: 'Vilã ou solução?' },
    { headline: 'Ferramenta.', body: 'Mas não é solução isolada.' },
    { headline: 'De forma simples:', body: 'Geralmente reduz apetite → reduz ingestão calórica.' },
    { headline: 'O risco do atalho', body: 'Sem plano: pouco nutriente + pouco treino + pouco suporte.' },
    { headline: 'Sem estratégia', body: 'Pode perder músculo + água + metabolismo.' },
    { headline: 'Sem músculo', body: 'Não há emagrecimento sustentável. Há rebote.', accent: PALETTE.orange },
    { headline: 'Se for usar', body: 'Acompanhamento + nutrição + estímulo muscular + suporte metabólico.' },
    { headline: 'Regra EquilibreON', body: 'Reprogramação 360 primeiro. A ferramenta entra quando faz sentido.' },
    { headline: 'Emagrecer não é "comer menos".', body: 'É reprogramar o corpo.' },
  ];

  console.log('Generating Carrossel 02...');
  for (let i = 0; i < slides2.length; i++) {
    const photoIdx = i % photoFiles.length;
    const photoPath = photoFiles[photoIdx];
    
    let filename;
    if (i === 0) {
      filename = '01-capa.png';
    } else if (i === slides2.length - 1) {
      filename = `${String(i + 1).padStart(2, '0')}-cta.png`;
    } else {
      filename = `${String(i + 1).padStart(2, '0')}.png`;
    }

    await makeSlide({
      outPath: path.join(c2, filename),
      photoPath,
      headline: slides2[i].headline,
      body: slides2[i].body,
      accent: slides2[i].accent || PALETTE.greenLight,
      isFirst: i === 0,
      isLast: i === slides2.length - 1,
    });
    
    console.log(`  ✓ ${filename} (photo: ${path.basename(photoPath)})`);
  }

  console.log(`\n✅ Done! Output: ${outRoot}`);
  console.log(`   Carrossel 01: ${slides1.length} slides`);
  console.log(`   Carrossel 02: ${slides2.length} slides`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
