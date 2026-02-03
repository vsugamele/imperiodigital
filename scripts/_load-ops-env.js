// Load environment variables from ops-dashboard/.env.local into process.env
// (Many workspace scripts run outside the Next.js app context.)
// - Minimal parser: KEY=VALUE (supports quoted values)
// - Does NOT overwrite existing process.env

const fs = require('node:fs');
const path = require('node:path');

function loadOpsEnv() {
  const envPath = path.join(process.cwd(), 'ops-dashboard', '.env.local');
  let raw;
  try {
    raw = fs.readFileSync(envPath, 'utf8');
  } catch {
    return { ok: false, envPath, loaded: 0 };
  }

  let loaded = 0;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    const key = m[1];
    let value = m[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
      loaded++;
    }
  }

  return { ok: true, envPath, loaded };
}

module.exports = { loadOpsEnv };
