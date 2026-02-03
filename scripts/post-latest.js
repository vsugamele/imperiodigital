const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function arg(name, def = undefined) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return def;
  const v = process.argv[idx + 1];
  if (!v || v.startsWith('--')) return def;
  return v;
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function newestMatching(dir, re) {
  const files = fs.readdirSync(dir)
    .filter(f => re.test(f))
    .map(f => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  return files[0]?.f;
}

function shellQuote(s) {
  // minimal for Windows execFileSync we avoid shell; keep for logs
  return JSON.stringify(s);
}

function main() {
  const profile = (process.argv[2] || '').toLowerCase();
  if (!profile) {
    console.error('Usage: node scripts/post-latest.js <profile> [--title "..."]');
    process.exit(2);
  }

  const map = loadJson(path.join(__dirname, '..', 'config', 'posting-map.json'));
  const cfg = map.profiles?.[profile];
  if (!cfg?.uploadPostUser) {
    console.error('Missing profile mapping in config/posting-map.json for:', profile);
    process.exit(2);
  }

  const videosDir = path.join(__dirname, '..', 'videos');
  const prefix = profile.toUpperCase() + '_REEL_';
  const latest = newestMatching(videosDir, new RegExp('^' + prefix.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') + '.*\\.mp4$', 'i'));
  if (!latest) {
    console.error('No matching mp4 found for profile in videos/:', profile);
    process.exit(2);
  }

  const videoPath = path.join(videosDir, latest);
  const title = arg('title', latest);

  const platforms = cfg.platforms?.length ? cfg.platforms : ['instagram'];

  const args = [
    path.join(__dirname, 'upload-post.js'),
    '--video', videoPath,
    '--user', cfg.uploadPostUser,
    '--title', title,
  ];
  for (const p of platforms) args.push('--platform', p);

  console.log('Posting via Upload-Post:', { profile, user: cfg.uploadPostUser, video: latest, platforms });

  try {
    // Run upload-post and capture JSON response for logging
    const out = execFileSync('node', args, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] });

    try {
      const { appendLog } = require('./logging');
      appendLog({
        date_time: new Date().toISOString(),
        profile,
        run_id: latest.match(/_(\d+)\.mp4$/)?.[1] || '',
        video_file: latest,
        image_file: '',
        drive_video_path: `/videos/${latest}`,
        drive_image_path: '',
        uploadpost_user: cfg.uploadPostUser,
        platform: (platforms[0] || 'instagram'),
        status: 'posted',
        uploadpost_response: out.trim(),
        error: ''
      });
    } catch {}

    process.stdout.write(out);
  } catch (e) {
    try {
      const { appendLog } = require('./logging');
      appendLog({
        date_time: new Date().toISOString(),
        profile,
        run_id: latest.match(/_(\d+)\.mp4$/)?.[1] || '',
        video_file: latest,
        image_file: '',
        drive_video_path: `/videos/${latest}`,
        drive_image_path: '',
        uploadpost_user: cfg.uploadPostUser,
        platform: (platforms[0] || 'instagram'),
        status: 'failed',
        uploadpost_response: '',
        error: (e?.stderr?.toString?.() || e?.message || String(e))
      });
    } catch {}
    throw e;
  }

}

main();
