#!/usr/bin/env node
/**
 * Transcrever áudio com Google Gemini API (REST)
 * Uso: node transcribe-gemini-rest.js <audio_file>
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Carregar .env.local
function loadEnvFile(envPath) {
  const envVars = {};
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        envVars[key] = valueParts.join('=');
      }
    }
  }
  return envVars;
}

const envPath = path.join(__dirname, '..', 'ops-dashboard', '.env.local');
const envVars = loadEnvFile(envPath);
const GEMINI_API_KEY = envVars.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY não configurada!');
  console.error('📝 Adicione GEMINI_API_KEY no arquivo ops-dashboard/.env.local');
  process.exit(1);
}

const audioFile = process.argv[2];

if (!audioFile) {
  console.log('Uso: node transcribe-gemini-rest.js <audio_file>');
  process.exit(1);
}

if (!fs.existsSync(audioFile)) {
  console.error(`❌ Arquivo não encontrado: ${audioFile}`);
  process.exit(1);
}

console.log(`🎙️ Transcrevendo: ${audioFile}`);

// Ler arquivo de áudio e converter para base64
const audioData = fs.readFileSync(audioFile);
const audioBase64 = audioData.toString('base64');

// Detectar MIME type
const ext = path.extname(audioFile).toLowerCase();
const mimeTypes = {
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
};
const mimeType = mimeTypes[ext] || 'audio/ogg';

console.log('📤 Enviando para Gemini API...');

const payload = JSON.stringify({
  contents: [{
    parts: [
      {
        inline_data: {
          mime_type: mimeType,
          data: audioBase64
        }
      },
      {
        text: 'Transcreva este áudio em português. Retorne apenas a transcrição do texto falado, sem comentários adicionais.'
      }
    ]
  }]
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.error) {
        console.error('❌ Erro da API:', response.error.message);
        process.exit(1);
      }

      if (!response.candidates || !response.candidates[0]?.content?.parts[0]?.text) {
        console.error('❌ Resposta inesperada da API:', JSON.stringify(response, null, 2));
        process.exit(1);
      }

      const text = response.candidates[0].content.parts[0].text.trim();

      console.log('\n✅ Transcrição completa:');
      console.log('='.repeat(60));
      console.log(text);
      console.log('='.repeat(60));

      // Salvar em arquivo
      const baseName = path.parse(audioFile).name;
      const txtFile = path.join(path.dirname(audioFile), `${baseName}_transcript.txt`);
      fs.writeFileSync(txtFile, text, 'utf-8');

      console.log(`\n📝 Salvo em: ${txtFile}`);
    } catch (error) {
      console.error('❌ Erro ao processar resposta:', error.message);
      console.error('Resposta bruta:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na requisição:', error.message);
  process.exit(1);
});

req.write(payload);
req.end();
