/**
 * 🎬 YOUTUBE DOWNLOADER - Downloads Gratuitos
 * Usa yt-dlp (open source, 100% gratuito)
 * Integração opcional com MoviAPI
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

// ==================== CONFIGURAÇÃO ====================

const CONFIG = {
  // yt-dlp path (baixe de: https://github.com/yt-dlp/yt-dlp/releases)
  YT_DLP_PATH: path.join(__dirname, '..', 'yt-dlp.exe'),
  
  // Diretório de downloads
  DOWNLOAD_DIR: path.join(__dirname, '..', 'outputs', 'youtube'),
  
  // MoviAPI (opcional)
  MOVIAPI_KEY: process.env.MOVIAPI_KEY || '',
  MOVIAPI_BASE: 'https://app.moviapi.com/v1',
  
  // Configurações de download
  FORMAT: 'best[height<=1080]',
  OUTPUT_TEMPLATE: '%(title)s_%(id)s.%(ext)s'
};

// ==================== FUNÇÕES PRINCIPAIS ====================

/**
 * Baixar vídeo do YouTube (yt-dlp - gratuito)
 */
function downloadVideo(videoUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      format = CONFIG.FORMAT,
      outputDir = CONFIG.DOWNLOAD_DIR,
      filename = null
    } = options;
    
    // Garantir diretório
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Build command
    const args = [
      videoUrl,
      '--format', format,
      '--output', path.join(outputDir, filename || CONFIG.OUTPUT_TEMPLATE),
      '--no-playlist',
      '--quiet',
      '--no-warnings'
    ];
    
    console.log(`\n⬇️  BAIXANDO VÍDEO: ${videoUrl}`);
    console.log(`   📁 Destino: ${outputDir}`);
    
    // Executar yt-dlp
    const process = spawn(CONFIG.YT_DLP_PATH, args, {
      cwd: path.dirname(CONFIG.YT_DLP_PATH)
    });
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.on('data', (d) => process.stdout.write(d));
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        // Extrair informações do vídeo
        const info = extractVideoInfo(stdout);
        
        resolve({
          success: true,
          url: videoUrl,
          ...info,
          savedTo: outputDir
        });
      } else {
        resolve({
          success: false,
          error: stderr || 'Download failed',
          code
        });
      }
    });
  });
}

/**
 * Extrair informações do vídeo do stdout
 */
function extractVideoInfo(output) {
  // Parse título e info do yt-dlp
  const titleMatch = output.match(/\[info\] Title: (.+)/);
  const idMatch = output.match(/\[download\] Destination: (.+)/);
  const sizeMatch = output.match(/\[download\] (.+?) of ~(.+? at .+?)/);
  
  return {
    title: titleMatch ? titleMatch[1] : null,
    savedFile: idMatch ? path.basename(idMatch[1]) : null,
    downloadInfo: sizeMatch ? sizeMatch[0] : null
  };
}

/**
 * Obter informações do vídeo (sem baixar)
 */
function getVideoInfo(videoUrl) {
  return new Promise((resolve, reject) => {
    const args = [
      videoUrl,
      '--dump-json',
      '--no-download',
      '--quiet'
    ];
    
    const process = spawn(CONFIG.YT_DLP_PATH, args, {
      cwd: path.dirname(CONFIG.YT_DLP_PATH)
    });
    
    let stdout = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        try {
          const info = JSON.parse(stdout);
          resolve({
            success: true,
            id: info.id,
            title: info.title,
            description: info.description?.substring(0, 500),
            duration: info.duration_string,
            viewCount: info.view_count,
            uploader: info.uploader,
            uploadDate: info.upload_date,
            thumbnail: info.thumbnail,
            formats: info.formats?.map(f => ({
              format: f.format,
              ext: f.ext,
              resolution: f.resolution,
              filesize: f.filesize
            }))
          });
        } catch (e) {
          resolve({
            success: false,
            error: 'Failed to parse video info'
          });
        }
      } else {
        resolve({
          success: false,
          error: 'Failed to get video info'
        });
      }
    });
  });
}

/**
 * Baixar apenas áudio (MP3)
 */
function downloadAudio(videoUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      outputDir = path.join(CONFIG.DOWNLOAD_DIR, 'audio'),
      bitrate = '192'
    } = options;
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const args = [
      videoUrl,
      '--format', 'bestaudio[ext=m4a]/bestaudio',
      '--output', path.join(outputDir, '%(title)s.%(ext)s'),
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', bitrate,
      '--no-playlist',
      '--quiet'
    ];
    
    console.log(`\n🎵 BAIXANDO ÁUDIO: ${videoUrl}`);
    
    const process = spawn(CONFIG.YT_DLP_PATH, args, {
      cwd: path.dirname(CONFIG.YT_DLP_PATH)
    });
    
    process.on('close', (code) => {
      resolve({
        success: code === 0,
        savedTo: outputDir,
        format: 'mp3',
        bitrate: `${bitrate}k`
      });
    });
  });
}

/**
 * Listar formatos disponíveis
 */
function listFormats(videoUrl) {
  return new Promise((resolve, reject) => {
    const args = [
      videoUrl,
      '--list-formats',
      '--quiet'
    ];
    
    const process = spawn(CONFIG.YT_DLP_PATH, args, {
      cwd: path.dirname(CONFIG.YT_DLP_PATH)
    });
    
    let formats = '';
    
    process.stdout.on('data', (data) => {
      formats += data.toString();
    });
    
    process.on('close', () => {
      resolve({
        success: true,
        formats
      });
    });
  });
}

/**
 * Baixar playlist inteira
 */
function downloadPlaylist(playlistUrl, options = {}) {
  const {
    limit = 10,
    format = CONFIG.FORMAT,
    outputDir = path.join(CONFIG.DOWNLOAD_DIR, 'playlist')
  } = options;
  
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const args = [
      playlistUrl,
      '--format', format,
      '--output', path.join(outputDir, '%(playlist_index)s_%(title)s.%(ext)s'),
      '--playlist-limit', limit.toString(),
      '--yes-playlist',
      '--quiet'
    ];
    
    console.log(`\n📋 BAIXANDO PLAYLIST: ${playlistUrl}`);
    console.log(`   🎯 Limite: ${limit} vídeos`);
    
    const process = spawn(CONFIG.YT_DLP_PATH, args, {
      cwd: path.dirname(CONFIG.YT_DLP_PATH)
    });
    
    process.on('close', (code) => {
      resolve({
        success: code === 0,
        savedTo: outputDir,
        limit
      });
    });
  });
}

// ==================== MOVIAPI (OPCIONAL) ====================

/**
 * Usar MoviAPI para download (se configurada)
 */
async function downloadWithMoviAPI(videoUrl, options = {}) {
  if (!CONFIG.MOVIAPI_KEY) {
    return {
      success: false,
      error: 'MoviAPI key não configurada. Use yt-dlp (gratuito) ou configure MOVIAPI_KEY.',
      suggestion: 'Configure a variável de ambiente MOVIAPI_KEY ou use downloadVideo() com yt-dlp.'
    };
  }
  
  // Chamar API da MoviAPI
  const postData = JSON.stringify({
    url: videoUrl,
    ...options
  });
  
  const url = new URL(`${CONFIG.MOVIAPI_BASE}/youtube/download`);
  
  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.MOVIAPI_KEY}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            success: true,
            source: 'moviapi',
            ...result
          });
        } catch (e) {
          resolve({
            success: false,
            error: 'Failed to parse MoviAPI response'
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
    
    req.write(postData);
    req.end();
  });
}

// ==================== CLI ====================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
🎬 YOUTUBE DOWNLOADER CLI
=========================

SISTEMA: yt-dlp (100% gratuito)

USO:
  node youtube-downloader.js --url [URL]        Baixar vídeo
  node youtube-downloader.js --info [URL]       Info do vídeo
  node youtube-downloader.js --audio [URL]      Baixar MP3
  node youtube-downloader.js --formats [URL]    Listar formatos
  node youtube-downloader.js --playlist [URL]    Baixar playlist

EXEMPLOS:
  node youtube-downloader.js --info "https://youtu.be/abc123"
  node youtube-downloader.js --url "https://youtube.com/watch?v=..."
  node youtube-downloader.js --audio "https://youtube.com/watch?v=..."
  node youtube-downloader.js --playlist "https://youtube.com/playlist?list=..."

NOTA: yt-dlp.exe é necessário em:
  ${CONFIG.YT_DLP_PATH}

BAIXE EM: https://github.com/yt-dlp/yt-dlp/releases
`);
    return;
  }
  
  const urlIdx = args.indexOf('--url');
  const infoIdx = args.indexOf('--info');
  const audioIdx = args.indexOf('--audio');
  const formatsIdx = args.indexOf('--formats');
  const playlistIdx = args.indexOf('--playlist');
  
  let url = null;
  let action = null;
  
  if (urlIdx !== -1) {
    url = args[urlIdx + 1];
    action = 'download';
  } else if (infoIdx !== -1) {
    url = args[infoIdx + 1];
    action = 'info';
  } else if (audioIdx !== -1) {
    url = args[audioIdx + 1];
    action = 'audio';
  } else if (formatsIdx !== -1) {
    url = args[formatsIdx + 1];
    action = 'formats';
  } else if (playlistIdx !== -1) {
    url = args[playlistIdx + 1];
    action = 'playlist';
  }
  
  if (!url) {
    console.log('❌ URL é obrigatória!');
    return;
  }
  
  try {
    switch (action) {
      case 'info': {
        const result = await getVideoInfo(url);
        if (result.success) {
          console.log('\n📹 INFORMAÇÕES DO VÍDEO:\n');
          console.log(`   Título: ${result.title}`);
          console.log(`   ID: ${result.id}`);
          console.log(`   Duração: ${result.duration}`);
          console.log(`   Views: ${result.viewCount?.toLocaleString()}`);
          console.log(`   Autor: ${result.uploader}`);
          console.log(`   Upload: ${result.uploadDate}`);
          console.log(`   Thumb: ${result.thumbnail}`);
        } else {
          console.log('❌ Erro:', result.error);
        }
        break;
      }
      
      case 'formats': {
        const result = await listFormats(url);
        console.log('\n📋 FORMATOS DISPONÍVEIS:\n');
        console.log(result.formats);
        break;
      }
      
      case 'audio': {
        const result = await downloadAudio(url);
        console.log(result.success ? '\n✅ Áudio baixado!' : '\n❌ Erro:', result.error);
        break;
      }
      
      case 'playlist': {
        const result = await downloadPlaylist(url);
        console.log(result.success ? '\n✅ Playlist baixada!' : '\n❌ Erro:', result.error);
        break;
      }
      
      default: {
        const result = await downloadVideo(url);
        console.log(result.success ? '\n✅ Vídeo baixado!' : '\n❌ Erro:', result.error);
      }
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

// Export
module.exports = {
  downloadVideo,
  getVideoInfo,
  downloadAudio,
  listFormats,
  downloadPlaylist,
  downloadWithMoviAPI,
  CONFIG
};

// Run
if (require.main === module) {
  main();
}
