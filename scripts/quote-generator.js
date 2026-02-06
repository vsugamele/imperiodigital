/**
 * 📜 QUOTE GENERATOR - Citações Automáticas
 * API: api-ninjas.com (gratuita)
 * Imagem: Vertex AI (no_cost)
 */

const https = require('https');

// ==================== CONFIGURAÇÃO ====================

const CONFIG = {
  // API Ninja - Gratuita (precisa de API key)
  // get yours at https://api-ninjas.com
  NINJA_API_KEY: process.env.NINJA_API_KEY || '',
  
  // Categorias disponíveis
  CATEGORIES: [
    'wisdom', 'philosophy', 'life', 'truth', 'inspirational',
    'relationships', 'love', 'faith', 'humor', 'success',
    'courage', 'happiness', 'art', 'writing', 'fear',
    'nature', 'time', 'freedom', 'death', 'leadership'
  ],
  
  // Configurações de imagem
  IMAGE_SIZE: '1024x1024',
  IMAGE_MODEL: 'imagen-4.0-generate-001'
};

// ==================== FUNÇÕES ====================

/**
 * Buscar citação da API Ninja
 */
function fetchQuote(options = {}) {
  return new Promise((resolve, reject) => {
    const { category, author, limit = 1 } = options;
    
    // Build URL
    let url = 'https://api.api-ninjas.com/v2/quotes?';
    if (category) url += `categories=${category}&`;
    if (author) url += `author=${encodeURIComponent(author)}`;
    
    console.log(`📡 Fetching: ${url}`);
    
    const req = https.get(url, {
      headers: {
        'X-Api-Key': CONFIG.NINJA_API_KEY
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const quotes = JSON.parse(data);
          resolve({
            success: true,
            quotes: Array.isArray(quotes) ? quotes : [quotes]
          });
        } catch (e) {
          resolve({
            success: false,
            error: 'Failed to parse response',
            raw: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout'
      });
    });
  });
}

/**
 * Buscar citação aleatória
 */
function fetchRandomQuote(category = null) {
  return new Promise((resolve, reject) => {
    let url = 'https://api.api-ninjas.com/v2/randomquotes?';
    if (category) url += `categories=${category}&`;
    
    const req = https.get(url, {
      headers: {
        'X-Api-Key': CONFIG.NINJA_API_KEY
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const quotes = JSON.parse(data);
          resolve({
            success: true,
            quotes: Array.isArray(quotes) ? quotes : [quotes]
          });
        } catch (e) {
          resolve({
            success: false,
            error: e.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });
  });
}

/**
 * Buscar citação do dia
 */
function fetchQuoteOfTheDay() {
  return new Promise((resolve, reject) => {
    const req = https.get('https://api.api-ninjas.com/v2/quoteoftheday', {
      headers: {
        'X-Api-Key': CONFIG.NINJA_API_KEY
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const quote = JSON.parse(data);
          resolve({
            success: true,
            quote
          });
        } catch (e) {
          resolve({
            success: false,
            error: e.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });
  });
}

/**
 * Gerar prompt para imagem da citação
 */
function generateQuoteImagePrompt(quote, author) {
  return `A beautiful, minimalist quote poster for Instagram. 

TEXT: "${quote}" - ${author}

STYLE: 
- Clean, modern typography
- Elegant background (gradient or solid color)
- High contrast text
- Professional, inspirational vibe
- Minimalist design
- 1:1 square format

The text should be the focal point, with subtle decorative elements. No people, no watermarks.`;
}

/**
 * Formatar citação para display
 */
function formatQuoteForDisplay(quote, author, options = {}) {
  const { maxLength = 280, prefix = '', suffix = '' } = options;
  
  let text = quote;
  if (text.length > maxLength) {
    text = text.substring(0, maxLength - 3) + '...';
  }
  
  return {
    text: `${prefix}"${text}"${suffix}`,
    author,
    length: text.length
  };
}

/**
 * Obter categoria aleatória
 */
function getRandomCategory() {
  const randomIndex = Math.floor(Math.random() * CONFIG.CATEGORIES.length);
  return CONFIG.CATEGORIES[randomIndex];
}

// ==================== CLI ====================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
📜 QUOTE GENERATOR CLI
======================

USO:
  node quote-generator.js --random           Buscar citação aleatória
  node quote-generator.js --daily           Citação do dia
  node quote-generator.js --category [nome] Citação por categoria
  node quote-generator.js --author [nome]   Citação por autor
  node quote-generator.js --list            Listar categorias

EXEMPLOS:
  node quote-generator.js --random
  node quote-generator.js --category wisdom
  node quote-generator.js --category success,love
  node quote-generator.js --author Einstein

CATEGORIAS DISPONÍVEIS:
${CONFIG.CATEGORIES.join(', ')}

NOTA: Necessário API key no.env: NINJA_API_KEY
`);
    return;
  }
  
  if (args.includes('--list')) {
    console.log('\n📚 Categorias Disponíveis:');
    CONFIG.CATEGORIES.forEach((cat, i) => {
      console.log(`  ${(i + 1).toString().padStart(2)} ${cat}`);
    });
    return;
  }
  
  // Parse options
  let result;
  
  if (args.includes('--daily')) {
    console.log('\n📅 Citação do Dia:');
    result = await fetchQuoteOfTheDay();
  } else if (args.includes('--category')) {
    const idx = args.indexOf('--category');
    const category = args[idx + 1];
    console.log(`\n🔍 Buscando citação em: ${category}`);
    result = await fetchQuote({ category });
  } else if (args.includes('--author')) {
    const idx = args.indexOf('--author');
    const author = args[idx + 1];
    console.log(`\n🔍 Buscando citação de: ${author}`);
    result = await fetchQuote({ author });
  } else {
    console.log('\n🎲 Citação Aleatória:');
    const category = args.includes('--random') ? getRandomCategory() : null;
    result = await fetchRandomQuote(category);
  }
  
  if (result.success && result.quotes) {
    console.log('\n✅ CITAS ENCONTRADAS:\n');
    result.quotes.forEach((q, i) => {
      console.log(`${i + 1}. "${q.quote}"`);
      console.log(`   — ${q.author}`);
      if (q.work) console.log(`   [${q.work}]`);
      if (q.categories) console.log(`   📁 ${q.categories.join(', ')}`);
      console.log('');
    });
    
    // Gerar prompt para imagem
    if (result.quotes[0]) {
      const q = result.quotes[0];
      const prompt = generateQuoteImagePrompt(q.quote, q.author);
      console.log('🎨 PROMPT PARA IMAGEM:');
      console.log('─'.repeat(40));
      console.log(prompt);
    }
  } else {
    console.log('\n❌ ERRO:', result.error || 'Unknown error');
    if (!CONFIG.NINJA_API_KEY) {
      console.log('\n⚠️  Necessário API key! get yours at https://api-ninjas.com');
    }
  }
}

// Export functions
module.exports = {
  fetchQuote,
  fetchRandomQuote,
  fetchQuoteOfTheDay,
  generateQuoteImagePrompt,
  formatQuoteForDisplay,
  getRandomCategory,
  CONFIG
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
