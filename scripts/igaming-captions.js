const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function maybeSwapPix(s) {
  // Mild variation to avoid duplicate detection
  if (!s) return s;
  if (Math.random() < 0.5) return s.replace(/PIX/g, 'P!X');
  return s.replace(/P!X/g, 'PIX');
}

function maybeAddEmoji(s) {
  const tails = ['👇', '🔥', '🎁', '💰', '🙏', ''];
  const t = rand(tails);
  if (!t) return s;
  if (s.includes(t)) return s;
  return `${s} ${t}`.trim();
}

function buildCaption({ profile } = {}) {
  const cfgPath = fs.existsSync(path.join(ROOT, 'config', 'igaming-captions.json'))
    ? path.join(ROOT, 'config', 'igaming-captions.json')
    : path.join(ROOT, 'config', 'igaming-captions.example.json');

  const cfg = loadJson(cfgPath);
  const templates = cfg.templates || {};
  const buckets = Object.keys(templates).filter((k) => Array.isArray(templates[k]) && templates[k].length);

  const bucket = rand(buckets);
  let text = rand(templates[bucket]);

  // micro-variations
  text = maybeSwapPix(text);
  if (Math.random() < 0.35) text = maybeAddEmoji(text);

  // Hashtags: 1-2 max, lifestyle segment only
  const tags = Array.isArray(cfg.hashtags) ? cfg.hashtags : [];
  const count = Math.random() < 0.25 ? 2 : 1;
  const chosen = [];
  while (chosen.length < Math.min(count, tags.length)) {
    const t = rand(tags);
    if (!chosen.includes(t)) chosen.push(t);
  }

  const caption = [text, chosen.join(' ')].filter(Boolean).join('\n\n').trim();

  return { caption, bucket, profile: profile || null, hashtags: chosen };
}

module.exports = { buildCaption };
