#!/usr/bin/env node
/**
 * Sync Drive datasets to local files.
 *
 * Reads config/drive-datasets.json (or config/drive-datasets.example.json).
 * Uses rclone to copy individual files.
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const RCLONE_PATH = 'C:/Users/vsuga/clawd/rclone.exe';

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

function main() {
  const cfgPath = fs.existsSync(path.join(ROOT, 'config', 'drive-datasets.json'))
    ? path.join(ROOT, 'config', 'drive-datasets.json')
    : path.join(ROOT, 'config', 'drive-datasets.example.json');

  const cfg = readJson(cfgPath);
  if (!cfg?.datasets?.length) {
    console.error('No datasets configured. Create config/drive-datasets.json');
    process.exit(1);
  }

  const results = [];

  for (const ds of cfg.datasets) {
    if (ds.type !== 'file') continue;
    const remote = `${ds.rcloneRemote}${ds.remotePath}`;
    const local = path.join(ROOT, ds.localPath);
    ensureDir(local);

    try {
      execSync(`"${RCLONE_PATH}" copyto "${remote}" "${local}"`, { stdio: 'pipe' });
      const st = fs.statSync(local);
      results.push({ name: ds.name, ok: true, localPath: ds.localPath, bytes: st.size, mtimeMs: st.mtimeMs });
      console.log(`✅ ${ds.name}: synced -> ${ds.localPath}`);
    } catch (e) {
      results.push({ name: ds.name, ok: false, error: String(e?.message || e) });
      console.log(`❌ ${ds.name}: failed`);
    }
  }

  const outPath = path.join(ROOT, 'results', 'datasets-sync.json');
  ensureDir(outPath);
  fs.writeFileSync(outPath, JSON.stringify({
    at: new Date().toISOString(),
    configPath: path.relative(ROOT, cfgPath),
    results,
  }, null, 2));

  const okCount = results.filter((r) => r.ok).length;
  console.log(`Done. ok=${okCount}/${results.length}`);
}

main();
