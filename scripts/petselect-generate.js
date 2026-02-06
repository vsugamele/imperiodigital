/**
 * PetSelectUK generator - Vertex AI OAuth2
 * Service Account Authentication (no external deps)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const fetch = globalThis.fetch;
const crypto = require('crypto');

const { loadOpsEnv } = require('./_load-ops-env');
loadOpsEnv();

// Load Service Account
const SA_PATH = path.join(__dirname, '..', 'ops-dashboard', 'vertex-sa.json');
let SA;
try {
  SA = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
} catch {
  throw new Error('Service account not found: ' + SA_PATH);
}

// Create JWT for OAuth2
function createJwt() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: SA.client_email,
    sub: SA.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform'
  };
  
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = headerB64 + '.' + payloadB64;
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signingInput);
  sign.end();
  const signature = sign.sign(SA.private_key, 'base64url');
  
  return signingInput + '.' + signature;
}

// Get OAuth2 Token
let accessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  const now = Date.now();
  if (accessToken && now < tokenExpiry) return accessToken;

  console.log('🔐 Getting OAuth2 token...');
  const jwt = createJwt();

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error_description || data.error);

    accessToken = data.access_token;
    tokenExpiry = now + (data.expires_in * 1000) - 60000;
    console.log('✅ Token obtained');
    return accessToken;
  } catch (e) {
    console.log('❌ OAuth error:', e.message);
    throw e;
  }
}

const RCLONE_PATH = 'C:\\Users\\vsuga\\clawd\\rclone.exe';
const ROOT_2026_ID = '1rtxKtTlZ6MHR0iv1Kcmh5DDfSN-clyEp';
const BASE_REMOTE = `gdrive,root_folder_id=${ROOT_2026_ID}:PetSelectUK`;

const LOCAL_DIR = 'C:\\Users\\vsuga\\clawd\\petselectuk';
const LOCAL_PRODUCTS = path.join(LOCAL_DIR, 'products');
const LOCAL_STYLE = path.join(LOCAL_DIR, 'style_refs');
const LOCAL_REF = path.join(LOCAL_DIR, 'references');
const LOCAL_OUT = path.join(LOCAL_DIR, 'outputs');
const LOCAL_IMG = path.join(LOCAL_OUT, 'images');
const LOCAL_CAR = path.join(LOCAL_OUT, 'carousels');
const LOCAL_REELS = path.join(LOCAL_OUT, 'reels');

[LOCAL_DIR, LOCAL_PRODUCTS, LOCAL_STYLE, LOCAL_REF, LOCAL_OUT, LOCAL_IMG, LOCAL_CAR, LOCAL_REELS].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

function rclone(args) {
  return execSync(`"${RCLONE_PATH}" ${args}`, { encoding: 'utf8' });
}

function listRemoteFiles(remotePath) {
  try {
    const out = rclone(`lsf "${remotePath}" --files-only`);
    return out.trim().split('\n').filter(Boolean);
  } catch { return []; }
}

function copyRandom(remoteBase, localDestDir) {
  const files = listRemoteFiles(remoteBase).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
  if (!files.length) return null;
  const sel = rand(files);
  const dest = path.join(localDestDir, sel.replace(/[^a-z0-9._-]/gi, '_'));
  try {
    execSync(`"${RCLONE_PATH}" copyto "${remoteBase}/${sel}" "${dest}"`, { stdio: 'pipe' });
    return dest;
  } catch { return null; }
}

// Generate Image
async function vertexGenerateImage({ prompt, label, size }) {
  console.log(`🎨 ${label}...`);
  try {
    const token = await getAccessToken();
    
    // Try the publisher model endpoint (simpler format)
    const url = `https://us-central1-aiplatform.googleapis.com/v1beta1/projects/${SA.project_id}/locations/us-central1/publishers/google/models/imagen-4.0-generate-001:predict`;
    
    console.log(`📡 Trying endpoint...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        instances: [{ prompt: prompt }],
        parameters: {
          imageSize: size,
          outputMimeType: 'image/png'
        }
      })
    });

    const text = await response.text();
    console.log(`📡 Status: ${response.status}`);
    
    if (response.status === 404) {
      // Try another format
      const url2 = `https://${SA.project_id}.googleapis.com/v1/projects/${SA.project_id}/locations/us-central1/publishers/google/models/imagen-4.0-generate-001:predict`;
      console.log(`📡 Trying alternate...`);
      
      const response2 = await fetch(url2, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          instances: [{ prompt: prompt }],
          parameters: {
            imageSize: size,
            outputMimeType: 'image/png'
          }
        })
      });
      
      const text2 = await response2.text();
      console.log(`📡 Status2: ${response2.status}`);
      
      if (response2.status >= 400) {
        console.log(`   → Error:`, text2.substring(0, 300));
        return null;
      }
      
      try {
        const data = JSON.parse(text2);
        if (data.predictions?.[0]?.bytesBase64Encoded) {
          console.log(`✅ ${label} OK`);
          return Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64');
        }
      } catch {}
      return null;
    }
    
    if (response.status >= 400) {
      console.log(`   → Error:`, text.substring(0, 300));
      return null;
    }
    
    try {
      const data = JSON.parse(text);
      if (data.predictions?.[0]?.bytesBase64Encoded) {
        console.log(`✅ ${label} OK`);
        return Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64');
      }
      console.log(`⚠️ Data:`, JSON.stringify(data).substring(0, 200));
    } catch {}
    return null;
  } catch (e) {
    console.log(`❌ ${label}:`, e.message);
    return null;
  }
}

function createReelVideo(imgPath, outMp4) {
  const cmd = `ffmpeg -y -loop 1 -r 25 -i "${imgPath}" -vf "scale=1200:-1,zoompan=z='min(zoom+0.0006,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=250:s=1080x1920" -c:v libx264 -preset veryfast -pix_fmt yuv420p -t 10 "${outMp4}"`;
  try { execSync(cmd, { stdio: 'ignore' }); } catch { console.log('⚠️ FFmpeg unavailable'); }
}

function uploadOutputs(files) {
  const up = (local, remote) => {
    try { execSync(`"${RCLONE_PATH}" copyto "${local}" "${remote}"`, { stdio: 'pipe' }); } 
    catch { console.log(`⚠️ Upload failed: ${path.basename(local)}`); }
  };
  for (const p of files.images || []) up(p, `${BASE_REMOTE}/outputs/images/${path.basename(p)}`);
  for (const p of files.carousels || []) up(p, `${BASE_REMOTE}/outputs/carousels/${path.basename(p)}`);
  for (const p of files.reels || []) up(p, `${BASE_REMOTE}/outputs/reels/${path.basename(p)}`);
}

async function main() {
  const runId = Date.now();
  console.log('📦 Downloading references...');

  const product = copyRandom(`${BASE_REMOTE}/products`, LOCAL_PRODUCTS);
  const style1 = copyRandom(`${BASE_REMOTE}/style_refs`, LOCAL_STYLE);
  const style2 = copyRandom(`${BASE_REMOTE}/style_refs`, LOCAL_STYLE);
  const personRef = copyRandom(`${BASE_REMOTE}/references`, LOCAL_REF);

  // Main Image 4:5
  const imgPrompt = `Create premium UK pet e-commerce Instagram post (4:5). Product from reference. Keep packaging/logo. ${personRef ? 'IMPORTANT: Include the SAME PERSON from reference image in ALL shots with consistent face and appearance. The person must look identical across all images.' : ''} Big headline, 3 bullet points. Footer: "PetSelectUK" + "UK Delivery".`;

  const imgBuf = await vertexGenerateImage({ prompt: imgPrompt, label: '🖼️ Image', size: { width: 1024, height: 1280 } });
  if (!imgBuf) throw new Error('Failed main image');
  const imgPath = path.join(LOCAL_IMG, `petselectuk_image_${runId}.png`);
  fs.writeFileSync(imgPath, imgBuf);

  // Carousel 5 slides
  const topics = ['Bath day mistakes (UK)', 'Rainy day walk essentials', 'Dog-friendly pub etiquette', 'Sensitive skin tips', 'Quick recap + CTA'];
  const carouselPaths = [];
  
  for (let i = 0; i < 5; i++) {
    const buf = await vertexGenerateImage({ 
      prompt: `Slide ${i+1}/5: ${topics[i]}. Instagram carousel 4:5. Product corner. PetSelectUK. ${personRef ? 'IMPORTANT: Include the SAME PERSON from reference with consistent face and appearance across ALL images.' : ''}`, 
      label: `🧩 Carousel ${i+1}/5`, size: { width: 1024, height: 1280 } 
    });
    if (!buf) throw new Error(`Carousel ${i+1} failed`);
    const p = path.join(LOCAL_CAR, `petselectuk_carousel_${runId}_${i+1}.png`);
    fs.writeFileSync(p, buf);
    carouselPaths.push(p);
    if (i < 4) await new Promise(r => setTimeout(r, 3000));
  }

  // Reels 9:16
  const reelsBuf = await vertexGenerateImage({ 
    prompt: `Instagram Reels cover 9:16. Text: "UK Delivery. Properly." + "PetSelectUK". Product shown. ${personRef ? 'IMPORTANT: Show the SAME PERSON from reference with consistent face.' : ''}`, 
    label: '🎞️ Reels', size: { width: 1024, height: 1792 } 
  });
  if (!reelsBuf) throw new Error('Reels failed');
  const reelsImg = path.join(LOCAL_REELS, `petselectuk_reels_${runId}.png`);
  fs.writeFileSync(reelsImg, reelsBuf);

  const reelsMp4 = path.join(LOCAL_REELS, `petselectuk_reels_${runId}.mp4`);
  createReelVideo(reelsImg, reelsMp4);

  uploadOutputs({ images: [imgPath], carousels: carouselPaths, reels: [reelsImg, reelsMp4] });

  console.log('\n✅ DONE!', { runId });
}

main().catch(e => { console.error(e); process.exit(1); });
