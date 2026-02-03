/**
 * Vanessa Equilibre - Gemini Generator (Simplified)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const GEMINI_API_KEY = 'AIzaSyDfdZ8LAFnWavLwwkGBcqozxf8YD1IrTvs';
const PHOTOS_DIR = 'C:/Users/vsuga/clawd/images/references/vanessa';
const OUTPUT_DIR = 'C:/Users/vsuga/clawd/tmp/vanessa/Semana-02-gemini-v2';

const SLIDES_01 = [
  { headline: 'EMAGRECI RAPIDO', body: 'Mas sera que foi gordura mesmo?', photoIdx: 0 },
  { headline: 'A balanca nao mede gordura', body: 'Ela mede PESO', photoIdx: 1 },
  { headline: 'Peso = gordura + agua + musculo', body: '+ estrutura ossea', photoIdx: 2 },
  { headline: 'Perda rapida geralmente', body: '= agua + musculo, nao gordura', photoIdx: 3 },
  { headline: 'Perdeu musculo?', body: 'Perdeu um orgao metabolico', photoIdx: 4 },
  { headline: 'Musculo nao e', body: 'Musculo = metabolismo ativo', photoIdx: 5 },
  { headline: 'Deficit agressivo', body: 'Pode ate secar... mas cobra preco', photoIdx: 6 },
  { headline: 'Um corpo desnutrido', body: 'nao emagrece. Entra em colapso.', photoIdx: 7 },
  { headline: 'REPROGRAMACAO 360', body: 'Nutricao + movimento + suporte metabolico', photoIdx: 8, isCta: true },
];

const SLIDES_02 = [
  { headline: 'CANETA EMAGRECEDORA', body: 'Vila ou solucao?', photoIdx: 0 },
  { headline: 'Ferramenta.', body: 'Mas nao e solucao isolada', photoIdx: 1 },
  { headline: 'De forma simples:', body: 'Reduz apetite - reduz ingestao', photoIdx: 2 },
  { headline: 'O risco do atalho', body: 'Pode perder musculo + metabolismo', photoIdx: 3 },
  { headline: 'Sem musculo', body: 'Nao ha emagrecimento sustentavel', photoIdx: 4 },
  { headline: 'Se for usar', body: 'Precisa de acompanhamento profissional', photoIdx: 5 },
  { headline: 'Regra EquilibreON', body: 'Programacao 360 primeiro', photoIdx: 6 },
  { headline: 'Emagrecer nao e comer menos', body: 'E reprogramar o corpo', photoIdx: 7 },
  { headline: 'Quer um roteiro?', body: 'Comenta PLANO!', photoIdx: 8, isCta: true },
];

function geminiGenerateImage(prompt, photoPath) {
  return new Promise((resolve, reject) => {
    const parts = [{ text: prompt }];
    
    if (photoPath && fs.existsSync(photoPath)) {
      const buf = fs.readFileSync(photoPath);
      parts.push({ inline_data: { mime_type: 'image/jpeg', data: buf.toString('base64') } });
    }

    const data = JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ['IMAGE'], imageConfig: { imageSize: '1K' } }
    });

    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: '/v1beta/models/gemini-3-pro-image-preview:generateContent?key=' + GEMINI_API_KEY,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
      timeout: 180000
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const img = parsed.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
          if (img) resolve(Buffer.from(img.inlineData.data, 'base64'));
          else reject(new Error('No image: ' + body.substring(0, 200)));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function generateCarousel(slides, photos, name, delay) {
  console.log('\n' + name + '...');
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const photo = photos[s.photoIdx % photos.length];
    
    const prompt = 'Create luxury Instagram slide for @dravanessadamasceno health. HEADLINE: ' + s.headline + '. BODY: ' + s.body + '. Style: Deep green #2C9C5E, cream background, elegant serif fonts, text prominent. 4:5 ratio.';
    
    console.log('  Slide ' + (i+1) + ': ' + s.headline.substring(0,25));
    
    try {
      const img = await geminiGenerateImage(prompt, photo);
      const file = i===0 ? '01-capa.png' : (s.isCta ? '09-cta.png' : String(i+1).padStart(2,'0')+'.png');
      fs.writeFileSync(path.join(OUTPUT_DIR, name, file), img);
      console.log('    OK: ' + file);
      if (i < slides.length-1) { await new Promise(r=>setTimeout(r, delay)); }
    } catch (e) {
      console.error('    ERRO: ' + e.message.substring(0,80));
    }
  }
}

async function main() {
  console.log('VANESSA GEMINI - Simplified');
  fs.mkdirSync(OUTPUT_DIR, {recursive:true});
  fs.mkdirSync(path.join(OUTPUT_DIR,'Carrossel-01'), {recursive:true});
  fs.mkdirSync(path.join(OUTPUT_DIR,'Carrossel-02'), {recursive:true});

  const photos = fs.readdirSync(PHOTOS_DIR).filter(f=>/\.(jpg|jpeg|png|heic)$/i.test(f)).map(f=>path.join(PHOTOS_DIR,f));
  console.log(photos.length + ' photos');

  await generateCarousel(SLIDES_01, photos, 'Carrossel-01', 5000);
  await generateCarousel(SLIDES_02, photos, 'Carrossel-02', 5000);
  console.log('\nDONE: ' + OUTPUT_DIR);
}

main().catch(console.error);
