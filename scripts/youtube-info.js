/**
 * 🎬 YOUTUBE INFO (Versão Node.js Puro)
 * Extrai informações do YouTube sem dependências externas
 */

const https = require('https');
const { URL } = require('url');

// ==================== FUNÇÕES ====================

/**
 * Obter ID do vídeo de várias URLs
 */
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/ // ID direto
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Fazer request HTTPS
 */
function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

/**
 * Obter informações do vídeo (usando oEmbed)
 */
async function getVideoInfo(videoUrl) {
  const videoId = extractVideoId(videoUrl);
  
  if (!videoId) {
    return {
      success: false,
      error: 'ID do vídeo não encontrado'
    };
  }
  
  console.log(`\n🔍 OBTENDO INFORMAÇÕES: ${videoId}`);
  
  // Métodos de fallback
  const methods = [
    // 1. oEmbed endpoint do YouTube
    async () => {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
      const response = await httpsRequest(oembedUrl);
      
      if (response.status === 200) {
        try {
          const data = JSON.parse(response.data);
          return {
            source: 'oembed',
            title: data.title,
            author: data.author_name,
            thumbnail: data.thumbnail_url,
            width: data.width,
            height: data.height,
            html: data.html
          };
        } catch (e) {
          return null;
        }
      }
      return null;
    },
    
    // 2. Invidious (alternativa pública)
    async () => {
      const invidiousUrls = [
        'https://yewtu.be/api/v1/videos',
        'https://invidious.snopyta.org/api/v1/videos',
        'https://invidious.kavin.rocks/api/v1/videos'
      ];
      
      for (const baseUrl of invidiousUrls) {
        try {
          const apiUrl = `${baseUrl}/${videoId}`;
          const response = await httpsRequest(apiUrl);
          
          if (response.status === 200) {
            const data = JSON.parse(response.data);
            return {
              source: 'invidious',
              id: videoId,
              title: data.title,
              description: data.description,
              viewCount: data.viewCount,
              likeCount: data.likeCount,
              duration: data.lengthSeconds,
              thumbnail: data.thumbnailUrl,
              author: data.author,
              uploadDate: data.published
            };
          }
        } catch (e) {
          continue;
        }
      }
      return null;
    }
  ];
  
  // Tentar métodos em sequência
  for (const method of methods) {
    try {
      const result = await method();
      if (result) {
        return {
          success: true,
          videoId,
          url: videoUrl,
          ...result
        };
      }
    } catch (e) {
      continue;
    }
  }
  
  // Fallback: informações básicas
  return {
    success: true,
    videoId,
    url: videoUrl,
    title: null,
    author: null,
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    note: 'Informações limitadas (use yt-dlp para dados completos)',
    installYtDlp: 'node scripts/youtube-installer.js'
  };
}

/**
 * Gerar URL de thumbnail
 */
function getThumbnailUrl(videoId, quality = 'maxres') {
  const qualities = {
    maxres: 'maxresdefault.jpg',
    high: 'hqdefault.jpg',
    medium: 'mqdefault.jpg',
    default: 'default.jpg'
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualities[quality] || qualities.high}`;
}

/**
 * Converter duração segundos para formato legível
 */
function formatDuration(seconds) {
  if (!seconds) return 'Desconhecida';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Baixar thumbnail
 */
async function downloadThumbnail(videoId, outputPath) {
  const thumbnailUrl = getThumbnailUrl(videoId);
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(thumbnailUrl, (res) => {
      if (res.statusCode !== 200) {
        return resolve({ success: false, error: `HTTP ${res.statusCode}` });
      }
      
      res.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve({ success: true, path: outputPath });
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      resolve({ success: false, error: err.message });
    });
  });
}

// ==================== CLI ====================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
🎬 YOUTUBE INFO (Node.js Puro)
==============================

EXTRAI INFORMAÇÕES SEM DEPENDÊNCIAS!

USO:
  node youtube-info.js --url "URL"     Info do vídeo
  node youtube-info.js --thumb "URL"   Baixar thumbnail
  node youtube-info.js --id "ID"       Por ID direto

EXEMPLOS:
  node youtube-info.js --url "https://youtube.com/watch?v=dQw4w9WgXcQ"
  node youtube-info.js --url "https://youtu.be/dQw4w9WgXcQ"
  node youtube-info.js --thumb "dQw4w9WgXcQ"

ALTERNATIVAS:
  node youtube-downloader.js --info "URL"  (requer yt-dlp)
  node youtube-installer.js              (instalar yt-dlp)
`);
    return;
  }
  
  const urlIdx = args.indexOf('--url');
  const thumbIdx = args.indexOf('--thumb');
  const idIdx = args.indexOf('--id');
  
  if (urlIdx !== -1) {
    // Obter info
    const url = args[urlIdx + 1];
    const result = await getVideoInfo(url);
    
    if (result.success) {
      console.log('\n📹 INFORMAÇÕES DO VÍDEO:\n');
      console.log(`   ID: ${result.videoId}`);
      console.log(`   Título: ${result.title || 'Não disponível'}`);
      console.log(`   Autor: ${result.author || 'Não disponível'}`);
      
      if (result.duration) {
        console.log(`   Duração: ${formatDuration(result.duration)}`);
      }
      
      if (result.viewCount) {
        console.log(`   Views: ${result.viewCount?.toLocaleString()}`);
      }
      
      if (result.thumbnail) {
        console.log(`   Thumbnail: ${result.thumbnail}`);
      }
      
      if (result.source) {
        console.log(`   📡 Fonte: ${result.source}`);
      }
      
      console.log(`\n🔗 URL do Vídeo: https://youtube.com/watch?v=${result.videoId}`);
      console.log(`🖼️  Thumbnail URL: https://img.youtube.com/vi/${result.videoId}/maxresdefault.jpg`);
    } else {
      console.log('\n❌ ERRO:', result.error);
    }
  } else if (thumbIdx !== -1 || idIdx !== -1) {
    // Baixar thumbnail
    const id = thumbIdx !== -1 ? args[thumbIdx + 1] : args[idIdx + 1];
    const videoId = extractVideoId(id) || id;
    
    const outputPath = path.join(__dirname, '..', 'outputs', 'thumbnails', `${videoId}.jpg`);
    
    console.log(`\n⬇️  BAIXANDO THUMBNAIL: ${videoId}`);
    const result = await downloadThumbnail(videoId, outputPath);
    
    if (result.success) {
      console.log('✅ Thumbnail salva:', result.path);
    } else {
      console.log('❌ ERRO:', result.error);
    }
  }
}

// Export
module.exports = {
  extractVideoId,
  getVideoInfo,
  getThumbnailUrl,
  downloadThumbnail,
  formatDuration
};

// Run
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  main();
}
