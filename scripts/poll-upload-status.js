const fs = require('fs');
const path = require('path');
const { appendLog, LOG_PATH } = require('./logging');

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

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchStatus({ request_id, job_id }) {
  const { getUploadPostApiKey } = require('./uploadpost-key');
  const apiKey = getUploadPostApiKey();
  if (!apiKey) throw new Error('Missing Upload-Post API key (env UPLOAD_POST_API_KEY or config/upload-post.local.json)');

  const qs = new URLSearchParams();
  if (request_id) qs.set('request_id', request_id);
  if (job_id) qs.set('job_id', job_id);

  const url = `https://api.upload-post.com/api/uploadposts/status?${qs.toString()}`;
  const res = await fetch(url, { headers: { Authorization: `ApiKey ${apiKey}` } });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) {
    const msg = json?.message || JSON.stringify(json);
    throw new Error(`status ${res.status}: ${msg}`);
  }
  return json;
}

function summarizeStatus(json) {
  const status = json.status || 'unknown';
  const results = Array.isArray(json.results) ? json.results : [];
  const okCount = results.filter(r => r.success === true).length;
  const failCount = results.filter(r => r.success === false).length;
  const msg = results.map(r => `${r.platform}:${r.success ? 'ok' : 'fail'}(${r.message || ''})`).join(' | ');
  return { status, okCount, failCount, msg };
}

async function main() {
  const max = Number(process.argv[2] || 25);

  if (!fs.existsSync(LOG_PATH)) {
    console.log('No log:', LOG_PATH);
    return;
  }

  const lines = fs.readFileSync(LOG_PATH, 'utf8').trim().split(/\r?\n/);
  if (lines.length < 2) return;

  const header = parseCsvLine(lines[0]);
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));

  // keep latest row per (request_id/job_id)
  const latestByKey = new Map();
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const request_id = row[idx.request_id] || '';
    const job_id = row[idx.job_id] || '';
    const key = request_id ? `r:${request_id}` : (job_id ? `j:${job_id}` : '');
    if (!key) continue;
    latestByKey.set(key, row);
  }

  const candidates = [];
  for (const [key, row] of latestByKey.entries()) {
    const status = row[idx.status] || '';
    if (!['scheduled', 'posted', 'in_progress'].includes(status)) continue;
    candidates.push({ key, row });
  }

  // limit
  const slice = candidates.slice(0, max);

  for (const c of slice) {
    const row = c.row;
    const request_id = row[idx.request_id] || '';
    const job_id = row[idx.job_id] || '';
    const profile = row[idx.profile] || '';
    const video_file = row[idx.video_file] || '';
    const uploadpost_user = row[idx.uploadpost_user] || '';
    const scheduled_date = row[idx.scheduled_date] || '';
    const timezone = row[idx.timezone] || '';

    try {
      const json = await fetchStatus({ request_id, job_id });
      const sum = summarizeStatus(json);

      let newStatus = sum.status;
      // normalize
      if (newStatus === 'completed') newStatus = 'confirmed';
      if (newStatus === 'in_progress') newStatus = 'in_progress';

      appendLog({
        date_time: new Date().toISOString(),
        profile,
        run_id: row[idx.run_id] || '',
        video_file,
        image_file: row[idx.image_file] || '',
        drive_video_path: row[idx.drive_video_path] || '',
        drive_image_path: row[idx.drive_image_path] || '',
        uploadpost_user,
        platform: row[idx.platform] || 'instagram',
        status: newStatus,
        scheduled_date,
        timezone,
        job_id,
        request_id,
        uploadpost_response: JSON.stringify({ status: json.status, results: json.results, last_update: json.last_update }, null, 0),
        error: sum.failCount ? sum.msg : ''
      });
    } catch (e) {
      appendLog({
        date_time: new Date().toISOString(),
        profile,
        run_id: row[idx.run_id] || '',
        video_file,
        image_file: row[idx.image_file] || '',
        drive_video_path: row[idx.drive_video_path] || '',
        drive_image_path: row[idx.drive_image_path] || '',
        uploadpost_user,
        platform: row[idx.platform] || 'instagram',
        status: 'status_check_failed',
        scheduled_date,
        timezone,
        job_id,
        request_id,
        uploadpost_response: '',
        error: e?.message || String(e)
      });
    }

    // be gentle with API
    await sleep(300);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
