/**
 * Vision Analyzer - Google AI Studio API
 * Usa API key direta com modelos Gemini 2.0
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Carregar API key
const API_KEY = 'AIzaSyAFNao4NetweEVgz8DtnUruUWDgBTe8u9Y';

async function analyzeImage(imagePath, prompt) {
  try {
    if (!fs.existsSync(imagePath)) {
      console.log('Arquivo nao encontrado: ' + imagePath);
      return null;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(imagePath);

    console.log(path.basename(imagePath) + ' (' + (imageBuffer.length/1024).toFixed(1) + ' KB)');

    // Usar gemini-2.0-flash que suporta visão
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + API_KEY;

    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: base64Image } }
        ]
      }],
      generation_config: { temperature: 0.4, maxOutputTokens: 2048 }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.log('Erro: ' + JSON.stringify(data, null, 2).substring(0, 500));
      return null;
    }
  } catch (error) {
    console.log('Erro: ' + error.message);
    return null;
  }
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
  return types[ext] || 'image/jpeg';
}

// CLI
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help') {
  console.log('Vision Analyzer - Gemini 2.0');
  console.log('Uso: node scripts/vision-analyzer.js <imagem> [prompt]');
  process.exit(0);
}

const images = args.filter(a => fs.existsSync(a));
if (images.length === 0) {
  console.log('Nenhuma imagem encontrada');
  process.exit(1);
}

const prompt = args.length > images.length ? args.filter(a => !images.includes(a)).join(' ') : 'Descreva esta imagem em detalhe, listando todo texto visivel, boxes, estruturas, fluxos e conexoes.';

// Executar
(async () => {
  for (const img of images) {
    console.log('\n' + '='.repeat(60));
    const result = await analyzeImage(img, prompt);
    if (result) {
      console.log('\nResultado:\n' + result);
    }
  }
})();
