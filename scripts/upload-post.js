const fs = require('fs');
const path = require('path');

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
  const { getUploadPostApiKey } = require('./uploadpost-key');
  const apiKey = getUploadPostApiKey();
  if (!apiKey) {
    console.error('Missing Upload-Post API key. Set env UPLOAD_POST_API_KEY or create config/upload-post.local.json with {"apiKey":"..."}.');
    process.exit(2);
  }

  const videoPath = arg('video');
  const title = arg('title', '');
  const user = arg('user');
  const endpoint = arg('endpoint', 'https://api.upload-post.com/api/upload');
  const platforms = argList('platform'); // repeat --platform instagram --platform tiktok
  const scheduledDate = arg('scheduled_date');
  const timezone = arg('timezone');
  const asyncUpload = arg('async_upload');
  const firstComment = arg('first_comment');
  const caption = arg('caption');

  if (!videoPath || !user) {
    console.error('Usage: node scripts/upload-post.js --video <path.mp4> --user <managed_user> [--title "..."] [--platform instagram]...');
    process.exit(2);
  }

  const absVideo = path.resolve(videoPath);
  if (!fs.existsSync(absVideo)) {
    console.error('Video not found:', absVideo);
    process.exit(2);
  }

  // Use native (undici) FormData so fetch builds multipart correctly.
  const form = new FormData();
  const buf = fs.readFileSync(absVideo);
  const blob = new Blob([buf], { type: 'video/mp4' });
  form.append('video', blob, path.basename(absVideo));
  if (title) form.append('title', title);

  // Upload-Post: docs show `user`, errors mention `username`. Send both.
  form.append('user', user);
  form.append('username', user);

  if (platforms.length) {
    for (const p of platforms) form.append('platform[]', p);
  } else {
    form.append('platform[]', 'instagram');
  }

  if (scheduledDate) form.append('scheduled_date', scheduledDate);
  if (timezone) form.append('timezone', timezone);
  if (asyncUpload !== undefined) form.append('async_upload', String(asyncUpload));
  if (firstComment) form.append('first_comment', firstComment);
  if (caption) form.append('caption', caption);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `ApiKey ${apiKey}`,
    },
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
