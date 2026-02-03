/**
 * Vanessa Equilibre - Gemini AI Content Generator
 * 
 * Este script usa Gemini para:
 * 1. Entender o público alvo e contexto
 * 2. Adaptar o conteúdo de forma profissional
 * 3. Gerar imagens reais (não só texto sobre foto)
 * 4. Criar copy otimizado para Instagram
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Config
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDfdZ8LAFnWavLwwkGBcqozxf8YD1IrTvs';
const PHOTOS_DIR = 'C:/Users/vsuga/clawd/images/references/vanessa';
const OUTPUT_DIR = 'C:/Users/vsuga/clawd/tmp/vanessa/Semana-02-gemini';

const PALETTE = {
  greenDark: '#2C9C5E',
  greenLight: '#4EDC88',
  orange: '#FF6A29',
  purple: '#9292FF',
  blue: '#4DA6FF',
  black: '#000000',
  charcoal: '#3A3A3A',
  gray: '#666666',
  white: '#FFFFFF',
  background: '#F8F6F3'
};

const VANESSA_CONTEXT = {
  name: 'Dra. Vanessa Damasceno',
  instagram: '@dravanessadamasceno',
  niche: 'Medical Wellness / High-Ticket Health',
  audience: 'Mulheres 30-50, alto ticket, preocupadas com saúde e bem-estar',
  tone: 'Irmã mais velha rica com autoridade clínica',
  colors: PALETTE
};

// ============================================
// GEMINI API HELPER
// ============================================

function geminiRequest(prompt, label = 'general') {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
        imageConfig: { imageSize: '2K' }
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
          const textPart = parsed.candidates?.[0]?.content?.parts?.find(p => p.text);
          
          resolve({
            image: imagePart ? Buffer.from(imagePart.inlineData.data, 'base64') : null,
            text: textPart?.text || '',
            usage: parsed.usageMetadata || {}
          });
        } catch (e) {
          reject(new Error(`Parse error: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ============================================
// CONTENT ADAPTATION
// ============================================

async function adaptContentForAudience(originalContent, slideNum, totalSlides) {
  const prompt = `
Analise e adapte este conteúdo para carrossel de Instagram profissional.

**Contexto:**
- Produto: Vanessa Equilibre ON (luxury health/wellness)
- Público: Mulheres 30-50, alto ticket, preocupadas com saúde
- Tom: Autoridade clínica, irmã mais velha rica
- Problema: Muita gente cai em promessas falsas de emagrecimento

**Slide ${slideNum} de ${totalSlides}:**
"${originalContent}"

**Sua tarefa:**
Responda APENAS com JSON (sem markdown):
{
  "headline": "Título impactante em português (máx 6 palavras)",
  "body": "Corpo do slide em português (máx 15 palavras, tom profissional)",
  "cta": "Call-to-action se for o último slide (opcional)",
  "style_notes": "Notas sobre visual (cores, mood, vibe)"
}
`;

  try {
    const response = await geminiRequest(prompt, 'adapt-content');
    return JSON.parse(response.text);
  } catch (e) {
    console.error('Error adapting content:', e.message);
    return null;
  }
}

// ============================================
// IMAGE GENERATION
// ============================================

async function generateSlideImage(adaptedContent, photoPath, layout = 'center') {
  const photoRef = photoPath ? fs.readFileSync(photoPath) : null;
  
  const prompt = `
Create a professional Instagram carousel slide for @dravanessadamasceno.

**Content:**
Headline: "${adaptedContent.headline}"
Body: "${adaptedContent.body}"

**Style:**
- Luxury health/wellness aesthetic
- Colors: Deep green (#2C9C5E), Soft green (#4EDC88), Cream (#F8F6F3)
- Clean, editorial look
- Professional, trustworthy vibe
- Typography: Elegant serif for headlines

**Rules:**
- 4:5 aspect ratio (1080x1350)
- Text must be readable and prominent
- If using reference photo, incorporate naturally
- High-end, professional finish
- No medical claims, educational tone

Reference photo available: ${photoPath ? 'YES - use as background' : 'NO - create from scratch'}
`;

  const parts = [{ text: prompt }];
  if (photoRef) {
    parts.push({
      inline_data: {
        mime_type: 'image/jpeg',
        data: photoRef.toString('base64')
      }
    });
  }

  const data = JSON.stringify({
    contents: [{ parts }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { imageSize: '2K' }
    }
  });

  return new Promise((resolve, reject) => {
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
            reject(new Error('No image in response'));
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

// ============================================
// INSTAGRAM CAPTION GENERATION
// ============================================

async function generateInstagramCaption(carouselTopic, slides) {
  const prompt = `
Create an Instagram caption for a carousel post.

**Topic:** ${carouselTopic}
**Slides:** ${slides.length}

**Style:**
- Professional but approachable
- Educational, not salesy
- Call-to-action at the end
- Relevant hashtags

Respond with JSON:
{
  "caption": "Full caption text in Portuguese",
  "hashtags": ["tag1", "tag2", "tag3"]
}
`;

  const response = await geminiRequest(prompt, 'caption');
  return JSON.parse(response.text);
}

// ============================================
// MAIN GENERATION
// ============================================

const CAROUSEL_01_TOPIC = 'Emagrecer rápido nem sempre é gordura';
const CAROUSEL_02_TOPIC = 'Caneta emagrecedora: ferramenta, não solução';

const ORIGINAL_CONTENT_01 = [
  'EMAGRECI RÁPIDO… Mas será que foi gordura mesmo?',
  'A balança não mede gordura. Ela mede PESO.',
  'Peso = gordura + água + músculo + estrutura óssea.',
  'Perda rápida geralmente = água + músculo, não gordura.',
  'Perdeu músculo? Perdeu um órgão metabólico importante.',
  'Músculo ≠ estética. Músculo = metabolismo ativo.',
  'Déficit agressivo pode até "secar"... mas cobra preço alto.',
  '"Um corpo desnutrido não emagrece. Ele entra em colapso."',
  'Quer um checklist simples? Comenta "360"!'
];

const ORIGINAL_CONTENT_02 = [
  'CANETA EMAGRECEDORA: vilã ou solução?',
  'Nem uma coisa, nem outra. É ferramenta, não solução isolada.',
  'De forma simples: reduz apetite → reduz ingestão calórica.',
  'O risco: sem plano, pode perder músculo + água + metabolismo.',
  'Sem músculo = sem emagrecimento sustentável. Só rebote.',
  'Se for usar, precisa de: acompanhamento + nutrição + treino + suporte.',
  'Regra EquilibreON: Reprogramação 360 primeiro. A ferramenta entra depois.',
  'Emagrecer não é "comer menos". É reprogramar o corpo.',
  'Quer um roteiro educativo? Comenta "PLANO"!'
];

async function main() {
  console.log('🎨 VANESSA EQUILIBRE - Gemini AI Content Generator\n');
  
  // Ensure output dir
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'Carrossel-01'), { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'Carrossel-02'), { recursive: true });

  // Load photos
  const photoFiles = fs.readdirSync(PHOTOS_DIR)
    .filter(f => /\.(jpg|jpeg|png|heic)$/i.test(f))
    .map(f => path.join(PHOTOS_DIR, f));
  
  console.log(`📸 Found ${photoFiles.length} reference photos\n`);

  // Generate Carrossel 01
  console.log('🎯 Generating Carrossel 01: "Emagrecer rápido nem sempre é gordura"');
  console.log('─'.repeat(50));
  
  const c1Captions = [];
  for (let i = 0; i < ORIGINAL_CONTENT_01.length; i++) {
    const original = ORIGINAL_CONTENT_01[i];
    console.log(`\n📝 Slide ${i + 1}: "${original.substring(0, 40)}..."`);
    
    // Adapt content
    const adapted = await adaptContentForAudience(original, i + 1, ORIGINAL_CONTENT_01.length);
    if (adapted) {
      console.log(`   → Headline: "${adapted.headline}"`);
      console.log(`   → Body: "${adapted.body}"`);
      
      // Generate image
      const photoIdx = i % photoFiles.length;
      try {
        const imageBuffer = await generateSlideImage(adapted, photoFiles[photoIdx]);
        const filename = i === 0 ? '01-capa.png' : 
                         i === ORIGINAL_CONTENT_01.length - 1 ? '09-cta.png' : 
                         `${String(i + 1).padStart(2, '0')}.png`;
        const outPath = path.join(OUTPUT_DIR, 'Carrossel-01', filename);
        fs.writeFileSync(outPath, imageBuffer);
        console.log(`   ✅ Saved: ${filename}`);
      } catch (e) {
        console.error(`   ❌ Error generating image: ${e.message}`);
      }
    }
  }

  // Generate Carrossel 02
  console.log('\n\n🎯 Generating Carrossel 02: "Caneta emagrecedora"');
  console.log('─'.repeat(50));
  
  for (let i = 0; i < ORIGINAL_CONTENT_02.length; i++) {
    const original = ORIGINAL_CONTENT_02[i];
    console.log(`\n📝 Slide ${i + 1}: "${original.substring(0, 40)}..."`);
    
    const adapted = await adaptContentForAudience(original, i + 1, ORIGINAL_CONTENT_02.length);
    if (adapted) {
      console.log(`   → Headline: "${adapted.headline}"`);
      console.log(`   → Body: "${adapted.body}"`);
      
      const photoIdx = i % photoFiles.length;
      try {
        const imageBuffer = await generateSlideImage(adapted, photoFiles[photoIdx]);
        const filename = i === 0 ? '01-capa.png' : 
                         i === ORIGINAL_CONTENT_02.length - 1 ? '09-cta.png' : 
                         `${String(i + 1).padStart(2, '0')}.png`;
        const outPath = path.join(OUTPUT_DIR, 'Carrossel-02', filename);
        fs.writeFileSync(outPath, imageBuffer);
        console.log(`   ✅ Saved: ${filename}`);
      } catch (e) {
        console.error(`   ❌ Error generating image: ${e.message}`);
      }
    }
  }

  console.log('\n\n✅ Done!');
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`   Carrossel 01: 9 slides`);
  console.log(`   Carrossel 02: 9 slides`);
}

main().catch(console.error);
