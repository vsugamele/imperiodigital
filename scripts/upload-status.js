const fs = require('fs');

function arg(name, def = undefined) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return def;
  const v = process.argv[idx + 1];
  if (!v || v.startsWith('--')) return def;
  return v;
}

async function main() {
  const { getUploadPostApiKey } = require('./uploadpost-key');
  const apiKey = getUploadPostApiKey();
  if (!apiKey) {
    console.error('Missing Upload-Post API key. Set env UPLOAD_POST_API_KEY or create config/upload-post.local.json with {"apiKey":"..."}.');
    process.exit(2);
  }

  const requestId = arg('request_id', '');
  const jobId = arg('job_id', '');
  if (!requestId && !jobId) {
    console.error('Usage: node scripts/upload-status.js --request_id <id> OR --job_id <id>');
    process.exit(2);
  }

  const qs = new URLSearchParams();
  if (requestId) qs.set('request_id', requestId);
  if (jobId) qs.set('job_id', jobId);

  const url = `https://api.upload-post.com/api/uploadposts/status?${qs.toString()}`;
  const res = await fetch(url, { headers: { Authorization: `ApiKey ${apiKey}` } });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }

  if (!res.ok) {
    console.error('Upload-Post status error:', res.status, res.statusText);
    console.error(json);
    process.exit(1);
  }

  process.stdout.write(JSON.stringify(json, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
