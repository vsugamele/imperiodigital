#!/usr/bin/env node
/**
 * Upload Photo para Instagram (Feed)
 * Endpoint: POST /api/upload_photos
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.UPLOAD_POST_API_KEY || 'UP-eb1ff680-33c4-4f69-a4e4-54321cba9876';
const API_BASE = 'api.upload-post.com';

function arg(name, def = undefined) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return def;
  const v = process.argv[idx + 1];
  if (!v || v.startsWith('--')) return def;
  return v;
}

async function uploadPhoto(imagePath, options = {}) {
  const { user, title, caption, scheduled_date, timezone } = options;
  
  if (!fs.existsSync(imagePath)) {
    console.error('❌ Arquivo não encontrado:', imagePath);
    return { success: false, error: 'File not found' };
  }
  
  const boundary = '----UploadPostBoundary' + Date.now();
  const fileName = path.basename(imagePath);
  const fileContent = fs.readFileSync(imagePath);
  
  // Construir multipart form data
  let body = '';
  
  // user
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="user"\r\n\r\n';
  body += `${user}\r\n`;
  
  // title
  if (title) {
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="title"\r\n\r\n';
    body += `${title.replace(/\\n/g, '\r\n')}\r\n`;
  }
  
  // caption
  if (caption) {
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="caption"\r\n\r\n';
    body += `${caption.replace(/\\n/g, '\r\n')}\r\n`;
  }
  
  // platform
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="platform[]"\r\n\r\n';
  body += `instagram\r\n`;
  
  // scheduled_date
  if (scheduled_date) {
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="scheduled_date"\r\n\r\n';
    body += `${scheduled_date}\r\n`;
  }
  
  // timezone
  if (timezone) {
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="timezone"\r\n\r\n';
    body += `${timezone}\r\n`;
  }
  
  // file
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="photos[]"; filename="${fileName}"\r\n`;
  body += `Content-Type: image/jpeg\r\n\r\n`;
  
  const bodyEnd = `\r\n--${boundary}--\r\n`;
  
  const bodyBuffer = Buffer.concat([
    Buffer.from(body, 'utf8'),
    fileContent,
    Buffer.from(bodyEnd, 'utf8')
  ]);
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      port: 443,
      path: '/api/upload_photos',
      method: 'POST',
      headers: {
        'Authorization': `Apikey ${API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuffer.length
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.success) {
            console.log('✅ Upload photo sucesso!');
            console.log(`   Request ID: ${json.request_id}`);
            resolve({ success: true, json });
          } else {
            console.log('❌ Erro:', json.message || data);
            resolve({ success: false, error: json.message });
          }
        } catch (e) {
          console.log('❌ Erro parse:', data);
          resolve({ success: false, error: data });
        }
      });
    });
    
    req.on('error', (e) => {
      console.log('❌ Erro request:', e.message);
      resolve({ success: false, error: e.message });
    });
    
    req.write(bodyBuffer);
    req.end();
  });
}

// ==================== MAIN ====================

async function main() {
  const imagePath = arg('image');
  const user = arg('user');
  const title = arg('title', '');
  let caption = arg('caption', '');
  const captionFile = arg('caption_file');
  const scheduled_date = arg('scheduled_date');
  const timezone = arg('timezone', 'America/Sao_Paulo');
  
  // Ler caption de arquivo se fornecido
  if (captionFile && fs.existsSync(captionFile)) {
    caption = fs.readFileSync(captionFile, 'utf8').trim();
  }
  
  // Se title vazio, usar primeira linha do caption
  let titleText = title;
  if (!titleText && caption) {
    titleText = caption.split('\n')[0].substring(0, 100);
  }
  
  if (!imagePath || !user) {
    console.log('Usage: node scripts/upload-photo.js --image <path.jpg> --user <username> [--title "..."] [--caption "..."] [--caption_file <file>] [--scheduled_date "2026-02-05T19:00:00Z"]');
    process.exit(1);
  }
  
  console.log('\n📷 UPLOAD PHOTO - FEED\n');
  console.log('Caption:', caption.substring(0, 50) + '...');
  
  const result = await uploadPhoto(imagePath, {
    user,
    title: titleText,
    caption,
    scheduled_date,
    timezone
  });
  
  if (result.success) {
    console.log('\n✅ SUCESSO!');
    console.log(`   Request ID: ${result.json.request_id}`);
  } else {
    console.log('\n❌ FALHA!');
    process.exit(1);
  }
}

main();
