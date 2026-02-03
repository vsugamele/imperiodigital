#!/usr/bin/env node
/**
 * Healthcheck D+1
 * - Prefer Supabase posting_log
 * - Fallback: results/posting-log-v2.csv
 *
 * Checks:
 * - iGaming: teo/jonathan/laise/pedro => 6 scheduled for tomorrow (America/Sao_Paulo)
 * - PetSelectUK: 3 scheduled for tomorrow (Europe/London)
 * - JP: if there is at least 1 video available in Drive folderId 1QfbkZUZMn6SICYQwovnyuQITlj95wYPw, then 1 scheduled for tomorrow (America/Sao_Paulo)
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');

function loadEnvFromOpsDashboard() {
  const envPath = path.join(ROOT, 'ops-dashboard', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2] || '';
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function csvSplit(line) {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        q = !q;
      }
    } else if (ch === ',' && !q) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function isoLocalDate(d, tz) {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = fmt.formatToParts(d);
  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return `${y}-${m}-${day}`;
}

function tomorrowDateStr(tz) {
  const now = new Date();
  const today = isoLocalDate(now, tz);
  const [y, m, d] = today.split('-').map(Number);
  const anchor = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const t = new Date(anchor.getTime() + 24 * 60 * 60 * 1000);
  return isoLocalDate(t, tz);
}

async function fetchPostingLogRowsSupabase(limit = 5000) {
  loadEnvFromOpsDashboard();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const supabaseLib = require(path.join(ROOT, 'ops-dashboard', 'node_modules', '@supabase', 'supabase-js'));
  const { createClient } = supabaseLib;
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from('posting_log')
    .select('product,profile,status,scheduled_at,tz,provider_job_id')
    .order('at', { ascending: false })
    .limit(limit);

  if (error) return null;
  return data || [];
}

function readPostingLogRowsCsv() {
  const csvPath = path.join(ROOT, 'results', 'posting-log-v2.csv');
  if (!fs.existsSync(csvPath)) return [];
  const raw = fs.readFileSync(csvPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  // header exists; skip it if present
  const start = lines[0].startsWith('date_time,') ? 1 : 0;

  const rows = [];
  for (let i = start; i < lines.length; i++) {
    const c = csvSplit(lines[i]);
    const [date_time, profile, run_id, video_file, image_file, drive_video_path, drive_image_path, uploadpost_user, platform, status, scheduled_date, timezone, job_id, request_id] = c;
    rows.push({
      product: profile,
      profile,
      status,
      scheduled_at: scheduled_date ? new Date(scheduled_date).toISOString() : null,
      tz: timezone || null,
      provider_job_id: job_id || null,
    });
  }
  return rows;
}

function countForDay(rows, tz, dayStr, predicate) {
  let n = 0;
  for (const r of rows) {
    if (!r.scheduled_at) continue;
    const d = new Date(r.scheduled_at);
    const local = isoLocalDate(d, tz);
    if (local !== dayStr) continue;
    if (predicate(r)) n++;
  }
  return n;
}

function jpHasVideo() {
  try {
    const RCLONE = 'C:/Users/vsuga/clawd/rclone.exe';
    const remote = 'gdrive,root_folder_id=1QfbkZUZMn6SICYQwovnyuQITlj95wYPw:';
    const out = execSync(`"${RCLONE}" lsf "${remote}" --files-only`, { encoding: 'utf8' }).trim();
    if (!out) return false;
    return out.split('\n').some((f) => f.match(/\.(mp4|mov)$/i));
  } catch {
    return false;
  }
}

async function main() {
  const tzBR = 'America/Sao_Paulo';
  const tzUK = 'Europe/London';

  const tomorrowBR = tomorrowDateStr(tzBR);
  const tomorrowUK = tomorrowDateStr(tzUK);

  let rows = await fetchPostingLogRowsSupabase(8000);
  let source = 'supabase';
  if (!rows) {
    rows = readPostingLogRowsCsv();
    source = 'csv';
  }

  const expected = [];
  // iGaming
  for (const p of ['teo', 'jonathan', 'laise', 'pedro']) {
    expected.push({
      key: `igaming:${p}`,
      tz: tzBR,
      day: tomorrowBR,
      expected: 6,
      actual: countForDay(rows, tzBR, tomorrowBR, (r) => String(r.product || r.profile || '').toLowerCase() === p && String(r.status || '').includes('scheduled')),
      hint: `node scripts\\schedule-next-day.js ${p}`,
    });
  }

  // PetSelectUK
  expected.push({
    key: 'petselectuk',
    tz: tzUK,
    day: tomorrowUK,
    expected: 3,
    actual: countForDay(rows, tzUK, tomorrowUK, (r) => String(r.product || r.profile || '').toLowerCase().includes('petselect') && String(r.status || '').includes('scheduled')),
    hint: 'node scripts\\petselect-schedule-next-day.js',
  });

  // JP
  const jpNeed = jpHasVideo();
  expected.push({
    key: 'jp',
    tz: tzBR,
    day: tomorrowBR,
    expected: jpNeed ? 1 : 0,
    actual: countForDay(rows, tzBR, tomorrowBR, (r) => String(r.profile || r.product || '').toLowerCase().includes('jp_') && String(r.status || '').includes('scheduled')),
    hint: 'node scripts\\jp-schedule-next-day.js',
  });

  const missing = expected.filter((x) => x.actual < x.expected);

  const report = {
    ok: missing.length === 0,
    source,
    tomorrowBR,
    tomorrowUK,
    checks: expected,
    missing,
  };

  console.log(JSON.stringify(report, null, 2));

  if (missing.length) process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
