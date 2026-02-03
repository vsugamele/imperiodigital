/**
 * Vanessa Equilibre - Simplified Gemini Generator
 * 
 * Faz APENAS 1 requisição por slide:
 * Prompt completo (foto + texto) → Gemini → imagem com texto
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const GEMINI_API_KEY = 'AIzaSyDfdZ8LAFnWavLwwkGBcqozxf8YD1IrTvs';
const PHOTOS_DIR = 'C:/Users/vsuga/clawd/images/references/vanessa';
const OUTPUT_DIR = 'C:/Users/vsuga/clawd/tmp/vanessa/Semana-02-gemini-v2';

const SLIDES_01 = [
  { headline: 'EMAGRECI RÁPIDO…', body: 'Mas será que foi gordura mesmo?', photoIdx: 0 },
  { headline: 'A balança não mede gordura', body: 'Ela mede PESO', photoIdx: 1 },
  { headline: 'Peso = gordura + água + músculo', body: '+ estrutura óssea', photoIdx: 2 },
  { headline: 'Perda rápida geralmente', body: '= água + músculo, não gordura', photoIdx: 3 },
  { headline: 'Perdeu músculo?', body: 'Perdeu um órgão metabólico', photoIdx: 4 },
  { headline: 'Músculo ≠ estética', body: 'Músculo = metabolismo ativo', photoIdx: 5 },
  { headline: 'Déficit agressivo', body: 'Pode até "secar"... mas cobra preço', photoIdx: 6 },
  { headline: '"Um corpo desnutrido"', body: 'não emagrece. Entra em colapso.', photoIdx: 7 },
  { headline: 'REPROGRAMAÇÃO 360', body: 'Nutrição + movimento + suporte metabólico', photoIdx: 8, isCta: true },
];

const SLIDES_02 = [
  { headline: 'CANETA EMAGRECEDORA', body: 'Vilã ou solução?', photoIdx: 0 },
  { headline: 'Ferramenta.', body: 'Mas não é solução isolada', photoIdx: 1 },
  { headline: 'De forma simples:', body: 'Reduz apetite → reduz ingestão', photoIdx: 2 },
  { headline: 'O risco do atalho', body: 'Pode perder músculo + metabolismo', photoIdx: 3 },
  { headline: 'Sem músculo', body: 'Não há emagrecimento sustentável', photoIdx: 4 },
  { headline: 'Se for usar', body: 'Precisa de acompanhamento profissional', photoIdx: 5 },
  { headline: 'Regra EquilibreON', body: 'Reprogramação 360 primeiro', photoIdx: 6 },
  { headline: 'Emagrecer não é "comer menos"', body: 'É reprogramar o corpo', photoIdx: 7 },
  { headline: 'Quer um roteiro?', body: 'Comenta "PLANO"!', photoIdx: 8, isCta: true },
];

function escapeJson(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
    .replace(/\t/g, '\\t')
    .replace(/≠/g, 'nao e')
    .replace(/…/g, '...')
    .replace(/"/g, '');
}

function geminiGenerateImage(prompt, photoPath) {
  return new Promise((resolve, reject) => {
    const parts = [{ text: prompt }];
    
    if (photoPath && fs.existsSync(photoPath)) {
      const buf = fs.readFileSync(photoPath);
      parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: buf.toString('base64')
        }
      });
    }

    const data = JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { imageSize: '1K' }
      }
    });

    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
      timeout: 180000
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const imagePart = parsed.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
          if (imagePart) {
            resolve(Buffer.from(imagePart.inlineData.data, 'base64'));
          } else {
            reject(new Error('No image in response: ' + body.substring(0, 200)));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function generateCarousel(slides, photos, carouselName, delayMs = 5000) {
  console.log(`\n🎨 Generating ${carouselName}...`);
  
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const photoPath = photos[slide.photoIdx % photos.length];
    
    const prompt = `
Create a professional Instagram carousel slide for @dravanessadamasceno luxury health.

CONTENT TO DISPLAY:
Headline: ${escapeJson(slide.headline)}
Body: ${escapeJson(slide.body)}

STYLE:
- Luxury health aesthetic, deep green #2C9C5E
- Cream background, elegant serif fonts
- Text PROMINENT and readable on image
- Reference photo incorporated naturally

4:5 ratio, Instagram ready, professional finish.
`;

    console.log(`  📝 Slide ${i + 1}: "${slide.headline.substring(0, 30)}..."`);
    
    try {
      const imageBuffer = await geminiGenerateImage(prompt, photoPath);
      
      let filename;
      if (i === 0) filename = '01-capa.png';
      else if (slide.isCta) filename = '09-cta.png';
      else filename = `${String(i + 1).padStart(2, '0')}.png`;
      
      const outPath = path.join(OUTPUT_DIR, carouselName, filename);
      fs.writeFileSync(outPath, imageBuffer);
      console.log(`    ✅ Saved: ${filename}`);
      
      // Delay para evitar rate limit
      if (i < slides.length - 1) {
        console.log(`    ⏳ Aguardando ${delayMs/1000}s...`);
        await new Promise(r => setTimeout(r, delayMs));
      }
    } catch (e) {
      console.error(`    ❌ Error: ${e.message}`);
    }
  }
}

async function main() {
  console.log('🎨 VANESSA EQUILIBRE - Gemini Generator (Simplificado)\n');
  
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'Carrossel-01'), { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'Carrossel-02'), { recursive: true });

  const photos = fs.readdirSync(PHOTOS_DIR)
    .filter(f => /\.(jpg|jpeg|png|heic)$/i.test(f))
    .map(f => path.join(PHOTOS_DIR, f));

  console.log(`📸 ${photos.length} fotos de referência disponíveis`);

  // Gerar carrosséis
  await generateCarousel(SLIDES_01, photos, 'Carrossel-01');
  await generateCarousel(SLIDES_02, photos, 'Carrossel-02');

  console.log('\n✅ Done!');
  console.log(`📁 Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
