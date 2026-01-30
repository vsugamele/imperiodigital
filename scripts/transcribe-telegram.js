#!/usr/bin/env node
/**
 * Transcrever áudio do Telegram com Whisper
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
  const cmd = `python -m whisper "${audioFile}" --model base --language pt --output_format txt --output_dir ${path.dirname(audioFile)}`;
  console.log('Processando...\n');
  
  const output = execSync(cmd, { 
    encoding: 'utf-8',
    stdio: 'inherit'
  });
  
  // Encontra arquivo de transcrição
  const baseName = path.parse(audioFile).name;
  const txtFile = path.join(path.dirname(audioFile), `${baseName}.txt`);
  
  if (fs.existsSync(txtFile)) {
    const text = fs.readFileSync(txtFile, 'utf-8');
    console.log(`\n✅ Transcrição:`);
    console.log(`${'='.repeat(60)}`);
    console.log(text);
    console.log(`${'='.repeat(60)}\n`);
    
    console.log(`📝 Salvo em: ${txtFile}`);
  }
  
} catch (error) {
  console.error(`❌ Erro na transcrição: ${error.message}`);
  process.exit(1);
}
