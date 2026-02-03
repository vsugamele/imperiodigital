#!/usr/bin/env node
/**
 * Upload carrosséis Vanessa para Drive com estrutura organizada
 * Estrutura: 2026/Projeto Vanessa - Equilibe on/carrosseis/YYYY-MM-DD/Carrossel-01/...
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RCLONE_PATH = 'C:\\Users\\vsuga\\clawd\\rclone.exe';
const BASE_REMOTE = 'gdrive:2026/Projeto Vanessa - Equilibe on/carrosseis';

// Data de hoje no formato YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];

const carouselsDir = process.argv[2] || 'C:\\Users\\vsuga\\clawd\\tmp\\vanessa\\Semana-01-v2';

if (!fs.existsSync(carouselsDir)) {
  console.error(`❌ Pasta não encontrada: ${carouselsDir}`);
  process.exit(1);
}

console.log(`📤 Upload de carrosséis: ${carouselsDir}`);
console.log(`📁 Destino: ${BASE_REMOTE}/${today}/`);

// Lista as pastas de carrosséis (Carrossel-01, Carrossel-02, etc)
const carouselFolders = fs.readdirSync(carouselsDir)
  .filter(name => {
    const fullPath = path.join(carouselsDir, name);
    return fs.statSync(fullPath).isDirectory() && name.startsWith('Carrossel-');
  });

if (carouselFolders.length === 0) {
  console.error('❌ Nenhuma pasta de carrossel encontrada');
  process.exit(1);
}

console.log(`\nEncontradas ${carouselFolders.length} pastas de carrosséis:`);
carouselFolders.forEach(name => console.log(`  - ${name}`));

// Upload cada pasta
for (const folderName of carouselFolders) {
  const localPath = path.join(carouselsDir, folderName);
  const remotePath = `${BASE_REMOTE}/${today}/${folderName}`;
  
  console.log(`\n📤 Uploading ${folderName}...`);
  
  try {
    const cmd = `"${RCLONE_PATH}" sync "${localPath}" "${remotePath}" -v --create-empty-src-dirs`;
    execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(`✅ ${folderName} uploaded`);
  } catch (error) {
    console.error(`❌ Erro ao fazer upload de ${folderName}:`, error.message);
    process.exit(1);
  }
}

console.log(`\n✅ Upload completo!`);
console.log(`📁 Disponível em: ${BASE_REMOTE}/${today}/`);
console.log(`\nPastas criadas:`);
carouselFolders.forEach(name => console.log(`  - ${BASE_REMOTE}/${today}/${name}/`));
