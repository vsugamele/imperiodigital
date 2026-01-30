#!/usr/bin/env node
/*
  Incremental importer: results/posting-log-v2.csv -> Supabase table public.posting_log

  Env vars (workspace):
    NEXT_PUBLIC_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY

  Usage:
    node scripts/import-posting-log-to-supabase.js [--limit 5000]
*/

const fs = require('node:fs');
const path = require('node:path');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { limit: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit') out.limit = Number(args[i + 1]);
  }
  return out;
}

function loadEnvFromOpsDashboard() {
  // We keep supabase env in ops-dashboard/.env.local
  const envPath = path.join(__dirname, '..', 'ops-dashboard', '.env.local');
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

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function csvSplit(line) {
  // Minimal CSV splitter handling quoted fields.
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

function parsePostingLogV2(csvPath) {
  const raw = fs.readFileSync(csvPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  // file has no header; fixed column positions
  // ts,product,?,video,?,driveFolder,drivePaths,profile,platform,status,scheduledAt,tz,jobId,requestId,json
  const rows = [];
  for (const line of lines) {
    const cols = csvSplit(line);
    if (cols.length < 10) continue;
    rows.push(cols);
  }
  return rows;
}

async function main() {
  const args = parseArgs();
  loadEnvFromOpsDashboard();

  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  // Use ops-dashboard's dependency tree (workspace root may not have supabase-js installed)
  const supabaseLib = require(path.join(__dirname, '..', 'ops-dashboard', 'node_modules', '@supabase', 'supabase-js'));
  const { createClient } = supabaseLib;
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const csvPath = path.join(__dirname, '..', 'results', 'posting-log-v2.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found:', csvPath);
    process.exit(1);
  }

  const all = parsePostingLogV2(csvPath);
  const slice = args.limit ? all.slice(-args.limit) : all;

  const toInsert = slice.map((c) => {
    const [
      at,
      product,
      request_id,
      filename,
      job_id,
      drive_folder,
      drive_paths,
      profile,
      platform,
      status,
      scheduled_at,
      tz,
      provider_job_id,
      provider_request_id,
      raw_json,
    ] = c;

    let raw = null;
    try {
      raw = raw_json ? JSON.parse(raw_json) : null;
    } catch {
      raw = { _raw: raw_json };
    }

    const safeIso = (s) => {
      if (!s) return null;
      const d = new Date(s);
      return isFinite(d.getTime()) ? d.toISOString() : null;
    };

    return {
      at: safeIso(at) || new Date().toISOString(),
      product: product || profile || 'unknown',
      request_id: request_id || null,
      job_id: job_id || null,
      filename: filename || null,
      drive_folder: drive_folder || null,
      drive_paths: drive_paths || null,
      profile: profile || null,
      platform: platform || null,
      status: status || null,
      scheduled_at: safeIso(scheduled_at),
      tz: tz || null,
      provider_job_id: provider_job_id || null,
      provider_request_id: provider_request_id || null,
      raw_json: raw,
      source: 'posting-log-v2.csv',
    };
  });

  // Upsert using dedupe unique index
  const { error } = await supabase
    .from('posting_log')
    .upsert(toInsert, { onConflict: 'provider_job_id,status,scheduled_at', ignoreDuplicates: true });

  if (error) {
    console.error('Upsert failed:', error);
    process.exit(1);
  }

  console.log(`OK: upserted ~${toInsert.length} rows (dedupe on provider_job_id,status,scheduled_at)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
