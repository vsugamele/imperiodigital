const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { appendLog } = require('../scripts/logging');
const { getTomorrowDateParts, localDateTimeString } = require('../scripts/time-utils');

const tz = 'Europe/London';
const dateParts = getTomorrowDateParts(tz);
const user = 'petselectuk';

const localBase = path.join('C:\\Users\\vsuga\\clawd', 'petselectuk', 'outputs');
const imagesDir = path.join(localBase, 'images');
const carDir = path.join(localBase, 'carousels');
const reelsDir = path.join(localBase, 'reels');

function listRecent(localDir, prefix, count, ext) {
  const files = fs.readdirSync(localDir)
    .filter(f => f.startsWith(prefix) && f.toLowerCase().endsWith(ext))
    .map(f => ({ f, t: fs.statSync(path.join(localDir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)
    .slice(0, count)
    .reverse();
  return files.map(x => x.f);
}

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

// Upload scripts
function run(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] });
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

const { buildPetCaption } = require('../scripts/petselect-captions');

const schedule = [
  { kind: 'carousel', hh: 9, mm: 0, title: 'Quick tips for better pet care (UK)' },
  { kind: 'image', hh: 13, mm: 0, title: 'PetSelectUK — UK Delivery' },
  { kind: 'reels', hh: 19, mm: 0, title: 'UK Delivery. Properly. — PetSelectUK' }
];

for (const item of schedule) {
  const scheduled_date = localDateTimeString(dateParts, item.hh, item.mm);
  const cap = buildPetCaption({ product: item.title });
  
  let resp;
  if (item.kind === 'reels') {
    resp = scheduleVideo({ user, videoPath: reelPath, title: item.title, scheduled_date, timezone: tz, caption: cap.caption });
  } else if (item.kind === 'image') {
    resp = schedulePhotos({ user, title: item.title, photoPaths: [imgPath], scheduled_date, timezone: tz, caption: cap.caption });
  } else {
    resp = schedulePhotos({ user, title: item.title, photoPaths: slidePaths, scheduled_date, timezone: tz, caption: cap.caption });
  }
  
  console.log('Scheduled:', item.kind, item.title, '->', scheduled_date, 'Response:', JSON.stringify(resp));
  
  appendLog({
    date_time: new Date().toISOString(),
    profile: 'petselectuk',
    run_id: '',
    video_file: item.kind === 'reels' ? path.basename(reelPath) : '',
    image_file: item.kind === 'image' ? path.basename(imgPath) : (item.kind === 'carousel' ? slides.join('|') : ''),
    drive_video_path: item.kind === 'reels' ? '/2026/PetSelectUK/outputs/reels/' + path.basename(reelPath) : '',
    drive_image_path: item.kind === 'image' ? '/2026/PetSelectUK/outputs/images/' + path.basename(imgPath) : (item.kind === 'carousel' ? '/2026/PetSelectUK/outputs/carousels/' + slides.join('|') : ''),
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
}

console.log('PetSelectUK scheduling done.');
