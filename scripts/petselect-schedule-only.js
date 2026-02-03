const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { appendLog } = require('./logging');
const { getTomorrowDateParts, localDateTimeString } = require('./time-utils');
const { buildPetCaption } = require('./petselect-captions');

const tz = 'Europe/London';
const dateParts = getTomorrowDateParts(tz);
const user = 'petselectuk';

const localBase = path.join('C:\\Users\\vsuga\\clawd', 'petselectuk', 'outputs');
const imagesDir = path.join(localBase, 'images');
const carDir = path.join(localBase, 'carousels');
const reelsDir = path.join(localBase, 'reels');

// pick latest assets
const files = fs.readdirSync(imagesDir).filter(f => f.startsWith('petselectuk_image_') && f.endsWith('.png'));
const img = files.sort((a, b) => fs.statSync(path.join(imagesDir, b)).mtimeMs - fs.statSync(path.join(imagesDir, a)).mtimeMs)[0];

const slideFiles = fs.readdirSync(carDir).filter(f => f.startsWith('petselectuk_carousel_') && f.endsWith('.png'));
const slides = slideFiles.sort((a, b) => fs.statSync(path.join(carDir, b)).mtimeMs - fs.statSync(path.join(carDir, a)).mtimeMs).slice(0, 5);

const reelFiles = fs.readdirSync(reelsDir).filter(f => f.startsWith('petselectuk_reels_') && f.endsWith('.mp4'));
const reelsMp4 = reelFiles.sort((a, b) => fs.statSync(path.join(reelsDir, b)).mtimeMs - fs.statSync(path.join(reelsDir, a)).mtimeMs)[0];

const imgPath = path.join(imagesDir, img);
const slidePaths = slides.map(s => path.join(carDir, s));
const reelPath = path.join(reelsDir, reelsMp4);

function run(cmd, args) {
  const out = execFileSync('node', args, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] });
  try { return JSON.parse(out); } catch { return { raw: out }; }
}

function scheduleVideo({ user, videoPath, title, scheduled_date, timezone, caption }) {
  return run('node', [path.join(__dirname, 'upload-post.js'), '--video', videoPath, '--user', user, '--title', title, '--platform', 'instagram', '--scheduled_date', scheduled_date, '--timezone', timezone, '--async_upload', 'true', '--caption', caption]);
}

function schedulePhotos({ user, title, photoPaths, scheduled_date, timezone, caption }) {
  const args = [path.join(__dirname, 'upload-photos.js'), '--user', user, '--title', title, '--platform', 'instagram', '--scheduled_date', scheduled_date, '--timezone', timezone, '--async_upload', 'true', '--caption', caption];
  for (const p of photoPaths) args.push('--photo', p);
  return run('node', args);
}

const schedule = [
  { kind: 'carousel', hh: 9, mm: 0, title: 'Quick tips for better pet care (UK)' },
  { kind: 'image', hh: 13, mm: 0, title: 'PetSelectUK — UK Delivery' },
  { kind: 'reels', hh: 19, mm: 0, title: 'UK Delivery. Properly. — PetSelectUK' }
];

let successCount = 0;
let failCount = 0;

for (const item of schedule) {
  const scheduled_date = localDateTimeString(dateParts, item.hh, item.mm);
  const cap = buildPetCaption({ product: item.title });
  
  console.log(`\n📅 Scheduling ${item.kind} for ${scheduled_date}...`);
  
  try {
    let resp;
    if (item.kind === 'reels') {
      resp = scheduleVideo({ user, videoPath: reelPath, title: item.title, scheduled_date, timezone: tz, caption: cap.caption });
    } else if (item.kind === 'image') {
      resp = schedulePhotos({ user, title: item.title, photoPaths: [imgPath], scheduled_date, timezone: tz, caption: cap.caption });
    } else {
      resp = schedulePhotos({ user, title: item.title, photoPaths: slidePaths, scheduled_date, timezone: tz, caption: cap.caption });
    }
    
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
    
    console.log(`✅ ${item.kind} scheduled: ${resp.job_id || 'ok'}`);
    successCount++;
  } catch (e) {
    console.log(`❌ ${item.kind} failed: ${e.message}`);
    failCount++;
  }
}

console.log(`\n🎉 PetSelectUK scheduling done: ${successCount} success, ${failCount} failed`);
