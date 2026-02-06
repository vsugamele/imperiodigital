const fs = require('node:fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function buildCaption({ profile, imageCopy } = {}) {
  // Copy fixa para iGaming
  const copy = "🔥 *Manda aqui 🔥👇🏻*";
  
  // Hashtags (opcional - pode ser removido se necessário)
  const cfgPath = fs.existsSync(path.join(ROOT, 'config', 'igaming-captions.json'))
    ? path.join(ROOT, 'config', 'igaming-captions.json')
    : path.join(ROOT, 'config', 'igaming-captions.example.json');

  const cfg = loadJson(cfgPath);
  const tags = cfg.hashtags || [];

  // Seleciona 1 hashtag aleatória
  const count = Math.random() < 0.25 ? 2 : 1;
  const chosen = [];
  while (chosen.length < Math.min(count, tags.length)) {
    const t = tags[Math.floor(Math.random() * tags.length)];
    if (!chosen.includes(t)) chosen.push(t);
  }

  // Caption final
  const caption = [copy, chosen.join(' ')].filter(Boolean).join('\n\n').trim();

  return { caption, bucket: 'manda_aqui', profile: profile || null, hashtags: chosen };
}

module.exports = { buildCaption };
