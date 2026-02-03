#!/usr/bin/env node
/**
 * Transcrever áudio do Telegram com Google Gemini
 * Uso: node transcribe-telegram.js <audio_file>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const audioFile = process.argv[2];

if (!audioFile) {
  console.log('Uso: node transcribe-telegram.js <audio_file>');
  process.exit(1);
}

if (!fs.existsSync(audioFile)) {
  console.log(`❌ Arquivo não encontrado: ${audioFile}`);
  process.exit(1);
}

console.log(`🎙️ Transcrevendo: ${audioFile}`);

try {
  const scriptPath = path.join(__dirname, 'transcribe-gemini-rest.js');
  
  const cmd = `node "${scriptPath}" "${audioFile}"`;
  console.log('Processando...\n');
  
  execSync(cmd, { 
    encoding: 'utf-8',
    stdio: 'inherit'
  });
  
  // Encontra arquivo de transcrição
  const baseName = path.parse(audioFile).name;
  const txtFile = path.join(path.dirname(audioFile), `${baseName}_transcript.txt`);
  
  if (fs.existsSync(txtFile)) {
    const text = fs.readFileSync(txtFile, 'utf-8');
    console.log(`\n✅ Transcrição salva em: ${txtFile}`);
    return text;
  }
  
} catch (error) {
  console.error(`❌ Erro na transcrição: ${error.message}`);
  process.exit(1);
}
