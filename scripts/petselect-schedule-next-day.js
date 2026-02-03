const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { appendLog } = require('./logging');
const { getTomorrowDateParts, localDateTimeString } = require('./time-utils');

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'], ...opts });
}

function listRecent(localDir, prefix, count, ext) {
  const files = fs.readdirSync(localDir)
    .filter(f => f.startsWith(prefix) && f.toLowerCase().endsWith(ext))
    .map(f => ({ f, t: fs.statSync(path.join(localDir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)
    .slice(0, count)
    .reverse();
  return files.map(x => x.f);
}

function scheduleVideo({ user, videoPath, title, scheduled_date, timezone, caption }) {
  const args = [
    path.join(__dirname, 'upload-post.js'),
    '--video', videoPath,
    '--user', user,
    '--title', title,
    '--platform', 'instagram',
    '--scheduled_date', scheduled_date,
    '--timezone', timezone,
    '--async_upload', 'true'
  ];
  if (caption) args.push('--caption', caption);
  const out = run('node', args);
  try { return JSON.parse(out); } catch { return { raw: out }; }
}

function schedulePhotos({ user, title, photoPaths, scheduled_date, timezone, caption }) {
  const args = [
    path.join(__dirname, 'upload-photos.js'),
    '--user', user,
    '--title', title,
    '--platform', 'instagram',
    '--scheduled_date', scheduled_date,
    '--timezone', timezone,
    '--async_upload', 'true'
  ];
  if (caption) args.push('--caption', caption);
  for (const p of photoPaths) args.push('--photo', p);
  const out = run('node', args);
  try { return JSON.parse(out); } catch { return { raw: out }; }
}

function main() {
  const tz = 'Europe/London';
  const dateParts = getTomorrowDateParts(tz);

  const user = 'petselectuk';

  // Generate once (creates 1 image, 5 slides, 1 reels mp4)
  execFileSync('node', [path.join(__dirname, 'petselect-generate.js')], { stdio: 'inherit' });

  const localBase = path.join('C:\\Users\\vsuga\\clawd', 'petselectuk', 'outputs');
  const imagesDir = path.join(localBase, 'images');
  const carDir = path.join(localBase, 'carousels');
  const reelsDir = path.join(localBase, 'reels');

  // pick latest assets
  const img = listRecent(imagesDir, 'petselectuk_image_', 1, '.png')[0];
  const slides = listRecent(carDir, 'petselectuk_carousel_', 5, '.png');
  const reelsMp4 = listRecent(reelsDir, 'petselectuk_reels_', 1, '.mp4')[0];

  if (!img || slides.length !== 5 || !reelsMp4) {
    console.error('Missing generated assets.');
    process.exit(1);
  }

  const imgPath = path.join(imagesDir, img);
  const slidePaths = slides.map(s => path.join(carDir, s));
  const reelPath = path.join(reelsDir, reelsMp4);

  const schedule = [
    { kind: 'carousel', hh: 9, mm: 0, title: 'Quick tips for better pet care (UK)' },
    { kind: 'image', hh: 13, mm: 0, title: 'PetSelectUK — UK Delivery' },
    { kind: 'reels', hh: 19, mm: 0, title: 'UK Delivery. Properly. — PetSelectUK' }
  ];

  for (const item of schedule) {
    const scheduled_date = localDateTimeString(dateParts, item.hh, item.mm);

    try {
      const resp = scheduleOne({
        user,
        kind: item.kind,
        title: item.title,
        scheduled_date,
        timezone: tz,
        imgPath,
        slidePaths,
        reelPath
      });

      appendLog({
        date_time: new Date().toISOString(),
        profile: 'petselectuk',
        run_id: '',
        video_file: item.kind === 'reels' ? path.basename(reelPath) : '',
        image_file: item.kind === 'image' ? path.basename(imgPath) : (item.kind === 'carousel' ? slides.join('|') : ''),
        drive_video_path: item.kind === 'reels' ? `/2026/PetSelectUK/outputs/reels/${path.basename(reelPath)}` : '',
        drive_image_path: item.kind === 'image' ? `/2026/PetSelectUK/outputs/images/${path.basename(imgPath)}` : (item.kind === 'carousel' ? `/2026/PetSelectUK/outputs/carousels/${slides.join('|')}` : ''),
        uploadpost_user: user,
        platform: 'instagram',
        status: 'scheduled',
        scheduled_date,
        timezone: tz,
        job_id: resp.job_id || '',
        request_id: resp.request_id || '',
        uploadpost_response: JSON.stringify(resp),
        error: ''
      });
    } catch (e) {
      appendLog({
        date_time: new Date().toISOString(),
        profile: 'petselectuk',
        run_id: '',
        video_file: '',
        image_file: '',
        drive_video_path: '',
        drive_image_path: '',
        uploadpost_user: user,
        platform: 'instagram',
        status: 'failed',
        scheduled_date,
        timezone: tz,
        job_id: '',
        request_id: '',
        uploadpost_response: '',
        error: e?.message || String(e)
      });
      throw e;
    }
  }

  console.log('PetSelectUK D+1 scheduling done. Check results/posting-log-v2.csv');
}

function scheduleOne({ user, kind, title, scheduled_date, timezone, imgPath, slidePaths, reelPath }) {
  const { buildPetCaption } = require('./petselect-captions');
  const cap = buildPetCaption({ product: title });

  let resp;
  if (kind === 'reels') {
    resp = scheduleVideo({ user, videoPath: reelPath, title, scheduled_date, timezone, caption: cap.caption });
  } else if (kind === 'image') {
    resp = schedulePhotos({ user, title, photoPaths: [imgPath], scheduled_date, timezone, caption: cap.caption });
  } else {
    resp = schedulePhotos({ user, title, photoPaths: slidePaths, scheduled_date, timezone, caption: cap.caption });
  }
  return resp;
}
