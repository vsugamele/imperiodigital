const fs = require('fs');
const path = require('path');
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

console.log('Assets found:', img, slides.length, reelsMp4);

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
  console.log(`Scheduling ${item.kind} for ${scheduled_date}`);
}

console.log('Done!');
