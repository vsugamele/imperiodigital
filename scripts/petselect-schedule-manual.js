// Manual scheduler for PetSelectUK
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { appendLog } = require('./logging');
const { getTomorrowDateParts, localDateTimeString } = require('./time-utils');

const BASE = 'C:\\Users\\vsuga\\clawd';
const imagesDir = path.join(BASE, 'petselectuk/outputs/images');
const carDir = path.join(BASE, 'petselectuk/outputs/carousels');
const reelsDir = path.join(BASE, 'petselectuk/outputs/reels');

const listRecent = (localDir, prefix, count, ext) => {
  const files = fs.readdirSync(localDir)
    .filter(f => f.startsWith(prefix) && f.toLowerCase().endsWith(ext))
    .map(f => ({ f, t: fs.statSync(path.join(localDir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)
    .slice(0, count)
    .reverse();
  return files.map(x => x.f);
};

const img = listRecent(imagesDir, 'petselectuk_image_', 1, '.png')[0];
const slides = listRecent(carDir, 'petselectuk_carousel_', 5, '.png');
const reelsMp4 = listRecent(reelsDir, 'petselectuk_reels_', 1, '.mp4')[0];

console.log('Files found:');
console.log('- IMG:', img);
console.log('- SLIDES:', slides.length, slides);
console.log('- REELS:', reelsMp4);

if (!img || slides.length !== 5 || !reelsMp4) {
  console.error('Missing assets!');
  process.exit(1);
}

const { buildPetCaption } = require('./petselect-captions');

function scheduleOne({ user, kind, title, scheduled_date, timezone, imgPath, slidePaths, reelPath }) {
  const args = [
    kind === 'carousel' ? path.join(BASE, 'scripts/upload-photos.js') : kind === 'image' ? path.join(BASE, 'scripts/upload-photos.js') : path.join(BASE, 'scripts/upload-post.js'),
    '--user', user,
    '--title', title,
    '--platform', 'instagram',
    '--scheduled_date', scheduled_date,
    '--timezone', timezone,
    '--async_upload', 'true'
  ];

  if (kind === 'carousel') {
    for (const p of slidePaths) args.push('--photo', p);
  } else if (kind === 'image') {
    args.push('--photo', imgPath);
  } else {
    args.push('--video', reelPath);
  }

  const cap = buildPetCaption({ product: title });
  args.push('--caption', cap);

  const out = execFileSync('node', args, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] });
  try { return JSON.parse(out); } catch { return { raw: out }; }
}

const user = 'petselectuk';
const tz = 'Europe/London';
const dateParts = getTomorrowDateParts(tz);

const schedule = [
  { kind: 'carousel', hh: 9, mm: 0, title: 'Quick tips for better pet care (UK)' },
  { kind: 'image', hh: 13, mm: 0, title: 'PetSelectUK — UK Delivery' },
  { kind: 'reels', hh: 19, mm: 0, title: 'UK Delivery. Properly. — PetSelectUK' }
];

const imgPath = path.join(imagesDir, img);
const slidePaths = slides.map(s => path.join(carDir, s));
const reelPath = path.join(reelsDir, reelsMp4);

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
    console.log(`✅ ${item.kind} scheduled for ${scheduled_date}`);
  } catch (e) {
    console.error(`❌ ${item.kind} failed:`, e.message);
  }
}

console.log('Done!');
