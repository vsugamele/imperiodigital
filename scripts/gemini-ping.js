const https = require('https');

const key = process.env.GEMINI_API_KEY || 'AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90';
const payload = JSON.stringify({
  contents: [{ parts: [{ text: 'ping' }] }],
  generationConfig: {
    responseModalities: ['IMAGE'],
    imageConfig: { imageSize: '2K' },
  },
});

const req = https.request(
  {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${key}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  },
  (res) => {
    let b = '';
    res.on('data', (c) => (b += c));
    res.on('end', () => {
      console.log('status', res.statusCode);
      console.log(b.slice(0, 500));
    });
  }
);

req.on('error', (e) => console.log('err', e.message));
req.write(payload);
req.end();
