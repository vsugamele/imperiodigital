#!/usr/bin/env node
/**
 * Upload Photo Wrapper - lê caption de arquivo para evitar escape de shell
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ler caption de variável de ambiente ou arquivo
const captionEnv = process.env.CAPTION;
const captionFile = process.env.CAPTION_FILE;

let caption = captionEnv || '';

if (captionFile && fs.existsSync(captionFile)) {
  caption = fs.readFileSync(captionFile, 'utf8').trim();
}

// Construir comando com caption seguro
const imagePath = process.env.IMAGE_PATH;
const user = process.env.USER;

if (!imagePath || !user) {
  console.log('Usage: set IMAGE_PATH=<path> & set USER=<user> & node upload-photo-wrapper.js');
  process.exit(1);
}

// Criar caption temporário se necessário
let captionArg = caption;
if (caption) {
  // Salvar caption em arquivo temporário
  const tempFile = path.join(__dirname, '..', 'tmp', `caption_${Date.now()}.txt`);
  fs.writeFileSync(tempFile, caption);
  captionArg = `@${path.basename(tempFile)}`;
}

// Executar upload-photo.js
const scriptPath = path.join(__dirname, 'upload-photo.js');
const cmd = `node "${scriptPath}" --image "${imagePath}" --user "${user}" --title "Refugio Divinos"`;

try {
  const result = execSync(cmd, { encoding: 'utf8', stdio: 'inherit' });
} catch (e) {
  console.log('Erro:', e.message);
}
