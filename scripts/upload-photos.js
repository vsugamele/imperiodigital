const fs = require('fs');
const path = require('path');
const { getUploadPostApiKey } = require('./uploadpost-key');

function arg(name, def = undefined) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return def;
  const v = process.argv[idx + 1];
  if (!v || v.startsWith('--')) return def;
  return v;
}

function argList(name) {
  const vals = [];
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === `--${name}`) {
      const v = process.argv[i + 1];
      if (v && !v.startsWith('--')) vals.push(v);
    }
  }
  return vals;
}

async function main() {
  const apiKey = getUploadPostApiKey();
  if (!apiKey) {
    console.error('Missing Upload-Post API key. Set env UPLOAD_POST_API_KEY or create config/upload-post.local.json with {"apiKey":"..."}.');
    process.exit(2);
  }

  const user = arg('user');
  const title = arg('title', '');
  const endpoint = arg('endpoint', 'https://api.upload-post.com/api/upload_photos');
  const platforms = argList('platform');
  const photos = argList('photo'); // repeat --photo a.png --photo b.png
  const scheduledDate = arg('scheduled_date');
  const timezone = arg('timezone');
  const asyncUpload = arg('async_upload');
  const firstComment = arg('first_comment');

  if (!user || !title || photos.length === 0) {
    console.error('Usage: node scripts/upload-photos.js --user <profile_username> --title "..." --photo <path> [--photo <path> ...] [--platform instagram] [--scheduled_date ...] [--timezone ...]');
    process.exit(2);
  }

  const form = new FormData();
  form.append('user', user);
  form.append('username', user);
  form.append('title', title);

  const plats = platforms.length ? platforms : ['instagram'];
  for (const p of plats) form.append('platform[]', p);

  for (const p of photos) {
    const abs = path.resolve(p);
    if (!fs.existsSync(abs)) {
      console.error('Photo not found:', abs);
      process.exit(2);
    }
    const buf = fs.readFileSync(abs);
    // best-effort mime
    const ext = path.extname(abs).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    form.append('photos[]', new Blob([buf], { type: mime }), path.basename(abs));
  }

  if (scheduledDate) form.append('scheduled_date', scheduledDate);
  if (timezone) form.append('timezone', timezone);
  if (asyncUpload !== undefined) form.append('async_upload', String(asyncUpload));
  if (firstComment) form.append('first_comment', firstComment);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `ApiKey ${apiKey}` },
    body: form,
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { /* ignore */ }

  if (!res.ok) {
    console.error('Upload-Post error:', res.status, res.statusText);
    console.error(json ?? text);
    process.exit(1);
  }

  console.log(JSON.stringify(json ?? { ok: true, raw: text }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
