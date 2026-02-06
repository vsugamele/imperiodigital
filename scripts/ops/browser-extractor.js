/**
 * 🌐 BROWSER AUTOMATION - Extração de Métricas
 * Analisa perfis públicos no Instagram, TikTok, YouTube
 * Suporta: browser relay (DOM real) + web_fetch (fallback público)
 * 
 * Uso: node browser-extractor.js [urls...]
 * Ex: node browser-extractor.js https://instagram.com/conta https://tiktok.com/@conta
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuração
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'ops-dashboard', 'data');

// Padrões de extração por plataforma
const PATTERNS = {
  instagram: {
    followers: /([\d,.]+[KM]?)\s*(?:followers|seguidores)/i,
    following: /([\d,.]+[KM]?)\s*(?:following|seguindo)/i,
    posts: /([\d,.]+[KM]?)\s*(?:posts|publicações)/i,
    username: /instagram\.com\/([^\/?\s]+)/,
    bio: /<meta[^>]*name="description"[^>]*content="([^"]*)"/i
  },
  tiktok: {
    followers: /([\d,.]+[MK]?)\s*(?:followers|seguidores)/i,
    likes: /([\d,.]+[MK]?)\s*(?:likes|curtidas)/i,
    following: /([\d,.]+[MK]?)\s*(?:following|seguindo)/i,
    username: /tiktok\.com\/@?([^\/?\s]+)/,
    bio: /<meta[^>]*name="description"[^>]*content="([^"]*)"/i
  },
  youtube: {
    subscribers: /([\d,.]+[KM]?)\s*(?:subscribers|inscritos)/i,
    views: /([\d,.]+[BM]?)\s*(?:views|visualizações)/i,
    username: /youtube\.com\/@?([^\/?\s]+)/,
    channelName: /<link rel="canonical"[^>]*href="https:\/\/www\.youtube\.com\/channel\/([^"]+)"/i
  }
};

// Extrair usando web_fetch (fallback público)
async function extractWithWebFetch(url) {
  const platform = detectPlatform(url);
  const username = extractUsername(url, platform);
  
  console.log(`   🌐 Usando web_fetch para: ${url}`);
  
  try {
    // Tentar usar web_fetch via curl/PowerShell
    const result = await fetchPublicPage(url);
    
    if (result && result.content) {
      const metrics = parseMetricsFromHTML(result.content, platform);
      return {
        platform,
        username,
        url,
        ...metrics,
        source: 'web_fetch',
        extractedAt: new Date().toISOString(),
        status: metrics.followers || metrics.subscribers ? 'success' : 'partial'
      };
    }
  } catch (e) {
    console.log(`   ⚠️ web_fetch falhou: ${e.message}`);
  }
  
  // Fallback: retorna estrutura vazia mas ready para browser
  return {
    platform,
    username,
    url,
    followers: null,
    following: null,
    posts: null,
    source: null,
    extractedAt: new Date().toISOString(),
    status: 'pending_browser',
    message: 'Aguardando browser relay para extração completa'
  };
}

// Fetch público via curl
async function fetchPublicPage(url) {
  return new Promise((resolve) => {
    try {
      const html = execSync(`curl -sL "${url}"`, { 
        encoding: 'utf8',
        timeout: 10000,
        maxBuffer: 1024 * 1024
      });
      resolve({ content: html });
    } catch (e) {
      resolve(null);
    }
  });
}

// Parse métricas do HTML
function parseMetricsFromHTML(html, platform) {
  const patterns = PATTERNS[platform] || {};
  const metrics = {};
  
  for (const [key, regex] of Object.entries(patterns)) {
    const match = html.match(regex);
    if (match && match[1]) {
      metrics[key] = cleanNumber(match[1]);
    }
  }
  
  return metrics;
}

// Limpar número (1.5K → 1500)
function cleanNumber(str) {
  if (!str) return null;
  str = str.replace(/,/g, '');
  if (str.includes('K') || str.includes('k')) {
    return parseFloat(str) * 1000;
  }
  if (str.includes('M') || str.includes('M')) {
    return parseFloat(str) * 1000000;
  }
  if (str.includes('B') || str.includes('B')) {
    return parseFloat(str) * 1000000000;
  }
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

// Extrair username da URL
function extractUsername(url, platform) {
  if (platform === 'instagram') {
    return url.match(/instagram\.com\/([^\/?\s]+)/)?.[1] || 'unknown';
  }
  if (platform === 'tiktok') {
    return url.match(/tiktok\.com\/@?([^\/?\s]+)/)?.[1] || 'unknown';
  }
  if (platform === 'youtube') {
    return url.match(/youtube\.com\/@?([^\/?\s]+)/)?.[1] || 
           url.match(/youtube\.com\/channel\/([^\/?\s]+)/)?.[1] || 'unknown';
  }
  return 'unknown';
}

// Detectar plataforma
function detectPlatform(url) {
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('youtube.com')) return 'youtube';
  return 'unknown';
}

// Extrair métricas de uma URL
async function extractMetrics(url) {
  const platform = detectPlatform(url);
  
  console.log(`🔍 Extraindo: ${url} (${platform})`);
  
  // Tentar web_fetch primeiro (funciona sem browser relay)
  const result = await extractWithWebFetch(url);
  
  return result;
}

// Salvar resultados
function saveResults(results, filename = 'extracted-metrics.json') {
  const outputPath = path.join(OUTPUT_DIR, filename);
  const existing = fs.existsSync(outputPath) 
    ? JSON.parse(fs.readFileSync(outputPath, 'utf8'))
    : { extractedAt: [], data: {} };
  
  results.forEach(r => {
    existing.data[r.url] = r;
    existing.extractedAt.push(new Date().toISOString());
  });
  
  fs.writeFileSync(outputPath, JSON.stringify(existing, null, 2));
  console.log(`💾 Salvo: ${outputPath}`);
  return outputPath;
}

// CLI
async function runCLI() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
🌐 BROWSER EXTRACTOR - CLI
========================

USO:
  node browser-extractor.js [urls...]

EXEMPLOS:
  node browser-extractor.js https://instagram.com/conta1
  node browser-extractor.js https://instagram.com/conta1 https://tiktok.com/@conta2
  node browser-extractor.js --batch urls.txt

PLATAFORMAS SUPORTADAS:
  - instagram.com
  - tiktok.com  
  - youtube.com

OUTPUT:
  Salva em ops-dashboard/data/extracted-metrics.json

STATUS:
  pending_browser = precisa de browser relay configurado
  ready = extração pública disponível
`);
    return;
  }
  
  // Modo batch
  if (args[0] === '--batch') {
    const filePath = args[1];
    if (fs.existsSync(filePath)) {
      const urls = fs.readFileSync(filePath, 'utf8')
        .split('\n')
        .filter(l => l.trim());
      console.log(`📦 Processando ${urls.length} URLs...`);
      
      const results = [];
      for (const url of urls) {
        const result = await extractMetrics(url.trim());
        results.push(result);
      }
      
      saveResults(results);
    }
    return;
  }
  
  // Modo normal
  const results = [];
  for (const url of args) {
    const result = await extractMetrics(url);
    results.push(result);
  }
  
  saveResults(results);
  
  // Mostrar resultados
  console.log('\n📊 RESULTADOS:\n');
  results.forEach(r => {
    console.log(`${r.platform}: ${r.username || r.url}`);
    console.log(`   Status: ${r.status}`);
    if (r.error) console.log(`   Error: ${r.error}`);
    console.log('');
  });
}

module.exports = { extractMetrics, detectPlatform, PATTERNS, saveResults };

if (require.main === module) {
  runCLI();
}
