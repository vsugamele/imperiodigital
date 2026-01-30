// Scan repository for AI provider call sites (Gemini/Vertex/etc).
// Usage: node scripts/scan-ai-calls.js

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const exts = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.py', '.ps1']);
const skipDirs = new Set([
  'node_modules',
  '.git',
  '.next',
  'backups',
  'models',
  'videos',
  'images',
  'audio',
  'tmp',
  'logs',
]);

const patterns = [
  { name: 'gemini-rest', re: /generativelanguage\.googleapis\.com|\/v1beta\/models\/gemini/i },
  { name: 'google-generative-ai-sdk', re: /@google\/generative-ai|GoogleGenerativeAI/i },
  { name: 'vertex-ai', re: /vertexai|aiplatform|google\.cloud\.aiplatform/i },
  { name: 'replicate', re: /replicate\.com|Replicate\b/i },
];

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(ROOT, full);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (skipDirs.has(name)) continue;
      walk(full, out);
    } else {
      if (!exts.has(path.extname(name))) continue;
      out.push({ full, rel });
    }
  }
}

function main() {
  const files = [];
  walk(ROOT, files);

  const hits = [];
  for (const f of files) {
    let txt;
    try {
      txt = fs.readFileSync(f.full, 'utf8');
    } catch {
      continue;
    }

    const matched = patterns.filter((p) => p.re.test(txt)).map((p) => p.name);
    if (matched.length) hits.push({ file: f.rel, matched });
  }

  hits.sort((a, b) => a.file.localeCompare(b.file));

  console.log('AI call sites (scan):');
  for (const h of hits) {
    console.log(`- ${h.file} :: ${h.matched.join(', ')}`);
  }

  console.log(`\nTotal files scanned: ${files.length}`);
  console.log(`Matches: ${hits.length}`);
}

main();
