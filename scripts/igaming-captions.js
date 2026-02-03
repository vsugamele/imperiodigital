const fs = require('node:fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function buildCaption({ profile, imageCopy } = {}) {
  // Carrega configuração de hashtags
  const cfgPath = fs.existsSync(path.join(ROOT, 'config', 'igaming-captions.json'))
    ? path.join(ROOT, 'config', 'igaming-captions.json')
    : path.join(ROOT, 'config', 'igaming-captions.example.json');

  const cfg = loadJson(cfgPath);
  const tags = cfg.hashtags || [];

  // Seleciona 1-2 hashtags aleatórias
  const count = Math.random() < 0.25 ? 2 : 1;
  const chosen = [];
  while (chosen.length < Math.min(count, tags.length)) {
    const t = tags[Math.floor(Math.random() * tags.length)];
    if (!chosen.includes(t)) chosen.push(t);
  }

  // Sempre usa "Manda aqui! 🔥" como base
  let text = "Manda aqui! 🔥";

  // Se tiver o copy da imagem, adiciona variação
  if (imageCopy) {
    const variations = [
      `Manda aqui! 🔥\n\n${imageCopy}`,
      `${imageCopy}\n\nManda aqui! 🔥`,
      `Viu isso? ${imageCopy}\n\nManda aqui! 🔥`,
    ];
    text = variations[Math.floor(Math.random() * variations.length)];
  }

  // Hashtags no final
  const caption = [text, chosen.join(' ')].filter(Boolean).join('\n\n').trim();

  return { caption, bucket: 'manda_aqui', profile: profile || null, hashtags: chosen };
}

module.exports = { buildCaption };
