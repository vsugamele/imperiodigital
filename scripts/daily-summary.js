const fs = require('fs');
const path = require('path');
const { getTomorrowDateParts } = require('./time-utils');

const LOG_PATH = path.join(__dirname, '..', 'results', 'posting-log-v2.csv');

function parseCsvLine(line) {
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
  const tz = 'America/Sao_Paulo';
  const dateParts = getTomorrowDateParts(tz);
  const ymd = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;

  if (!fs.existsSync(LOG_PATH)) {
    console.log(`No CSV log found: ${LOG_PATH}`);
    process.exit(0);
  }

  const lines = fs.readFileSync(LOG_PATH, 'utf8').trim().split(/\r?\n/);
  if (lines.length < 2) {
    console.log(`CSV is empty: ${LOG_PATH}`);
    process.exit(0);
  }

  const header = parseCsvLine(lines[0]);
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));

  const byProfile = {};
  const want = ['teo', 'jonathan', 'laise', 'pedro'];

  for (const p of want) {
    byProfile[p] = { scheduled: 0, failed: 0, in_progress: 0, confirmed: 0, other: 0 };
  }

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const profile = (row[idx.profile] || '').toLowerCase();
    if (!byProfile[profile]) continue;

    const scheduled_date = row[idx.scheduled_date] || '';
    if (!scheduled_date.startsWith(ymd)) continue;

    const status = row[idx.status] || 'other';
    if (status in byProfile[profile]) byProfile[profile][status]++;
    else if (status === 'scheduled') byProfile[profile].scheduled++;
    else if (status === 'failed') byProfile[profile].failed++;
    else byProfile[profile].other++;
  }

  let out = '';
  out += `IGAMING D+1 — resumo (${ymd} / ${tz})\n`;
  out += `CSV: ${LOG_PATH}\n\n`;
  for (const [p, s] of Object.entries(byProfile)) {
    out += `${p}: scheduled=${s.scheduled} in_progress=${s.in_progress} confirmed=${s.confirmed} failed=${s.failed} other=${s.other}\n`;
  }

  console.log(out.trim());
}

main();
