const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const CTAS = [
  'Quer que eu avalie seu cabelo? Comenta “EU” 👇',
  'Quer uma dica pro seu tipo de cacho? Comenta 👇',
  'Qual seu tipo de cabelo? (2A–4C) 👇',
  'Você finaliza com creme, gel ou mousse? 👇',
  'Se isso te ajudou, manda pra uma amiga cacheada 🤝',
];

const HASHTAGS = [
  '#cachos',
  '#cacheadas',
  '#cabelocacheado',
  '#finalizacao',
  '#haircare',
];

function isSimpleTitle(t) {
  const s = String(t || '').trim().toLowerCase();
  if (!s) return true;
  if (s.length < 12) return true;
  if (/^(video|vídeo|reels|editado|final|capcut|jp)\b/.test(s)) return true;
  return false;
}

function buildJpCaption(filenameCaption) {
  const base = String(filenameCaption || '').trim();

  // Always use the filename as context (as requested)
  // but we can enrich it lightly.
  const cta = rand(CTAS);
  const tagCount = Math.random() < 0.25 ? 2 : 1;
  const tags = [];
  while (tags.length < tagCount) {
    const t = rand(HASHTAGS);
    if (!tags.includes(t)) tags.push(t);
  }

  // If the filename is too simple, we still keep it but add more structure.
  if (isSimpleTitle(base)) {
    return [
      base || 'Transformação no cabelo cacheado ✨',
      cta,
      tags.join(' '),
    ].filter(Boolean).join('\n\n').trim();
  }

  return [base, cta, tags.join(' ')].filter(Boolean).join('\n\n').trim();
}

module.exports = { buildJpCaption };
