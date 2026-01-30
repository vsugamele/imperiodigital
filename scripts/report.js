const fs = require('fs');
const path = require('path');
const { LOG_PATH } = require('./logging');

function parseCsvLine(line) {
  // Simple CSV parser for our own output.
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; continue; }
      if (ch === '"') { inQ = false; continue; }
      cur += ch;
    } else {
      if (ch === '"') { inQ = true; continue; }
      if (ch === ',') { out.push(cur); cur = ''; continue; }
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function main() {
  if (!fs.existsSync(LOG_PATH)) {
    console.log('No log yet:', LOG_PATH);
    process.exit(0);
  }

  const lines = fs.readFileSync(LOG_PATH, 'utf8').trim().split(/\r?\n/);
  if (lines.length <= 1) {
    console.log('Log empty:', LOG_PATH);
    process.exit(0);
  }

  const header = parseCsvLine(lines[0]);
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));

  const stats = {};
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const profile = row[idx.profile] || 'unknown';
    const status = row[idx.status] || 'unknown';
    stats[profile] ??= { posted: 0, failed: 0, queued: 0, other: 0 };
    if (status === 'posted') stats[profile].posted++;
    else if (status === 'failed') stats[profile].failed++;
    else if (status === 'queued') stats[profile].queued++;
    else stats[profile].other++;
  }

  console.log('CSV:', LOG_PATH);
  for (const [p, s] of Object.entries(stats)) {
    console.log(`${p}: posted=${s.posted} queued=${s.queued} failed=${s.failed} other=${s.other}`);
  }
}

main();
