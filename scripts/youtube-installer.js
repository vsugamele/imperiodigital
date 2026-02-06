/**
 * 📦 YOUTUBE DOWNLOADER INSTALLER
 * Baixa e configura o yt-dlp automaticamente
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ==================== CONFIGURAÇÃO ====================

const CONFIG = {
  // URLs de download
  YT_DLP_URL: 'https://github.com/yt-dlp/yt-dlp/releases/download/2024.10.22/yt-dlp.exe',
  FFMPEG_URL: 'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl-shared.zip',
  
  // Destino
  INSTALL_DIR: path.join(__dirname, '..'),
  YT_DLP_PATH: path.join(__dirname, '..', 'yt-dlp.exe'),
  FFMPEG_DIR: path.join(__dirname, '..', 'ffmpeg'),
  FFMPEG_PATH: path.join(__dirname, '..', 'ffmpeg', 'bin', 'ffmpeg.exe')
};

// ==================== FUNÇÕES ====================

/**
 * Baixar arquivo via HTTPS
 */
function downloadFile(url, destPath, progress = true) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    
    console.log(`\n⬇️  BAIXANDO: ${path.basename(destPath)}`);
    console.log(`   De: ${url}`);
    console.log(`   Para: ${destPath}`);
    
    const req = https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      
      const total = parseInt(res.headers['content-length'], 10);
      let downloaded = 0;
      
      res.on('data', (chunk) => {
        file.write(chunk);
        downloaded += chunk.length;
        
        if (progress && total) {
          const percent = ((downloaded / total) * 100).toFixed(1);
          process.stdout.write(`\r   📥 ${percent}% (${(downloaded/1024/1024).toFixed(1)} MB / ${(total/1024/1024).toFixed(1)} MB)`);
        }
      });
      
      res.on('end', () => {
        file.end();
        console.log('\n');
        resolve(destPath);
      });
    });
    
    req.on('error', (error) => {
      file.destroy();
      reject(error);
    });
    
    req.setTimeout(300000, () => {
      req.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

/**
 * Instalar yt-dlp
 */
async function installYtDlp() {
  console.log('\n📦 INSTALANDO YT-DLP...\n');
  
  try {
    // Verificar se já existe
    if (fs.existsSync(CONFIG.YT_DLP_PATH)) {
      console.log('✅ yt-dlp já está instalado!');
      return { success: true, installed: false };
    }
    
    // Baixar
    await downloadFile(CONFIG.YT_DLP_URL, CONFIG.YT_DLP_PATH);
    
    // Verificar
    if (fs.existsSync(CONFIG.YT_DLP_PATH)) {
      console.log('✅ yt-dlp instalado com sucesso!');
      return { success: true, installed: true };
    } else {
      throw new Error('Arquivo não encontrado após download');
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Instalar ffmpeg (necessário para conversão de áudio)
 */
async function installFfmpeg() {
  console.log('\n🎬 INSTALANDO FFMPEG...\n');
  
  try {
    // Verificar se já existe
    if (fs.existsSync(CONFIG.FFMPEG_PATH)) {
      console.log('✅ ffmpeg já está instalado!');
      return { success: true, installed: false };
    }
    
    // Criar diretório
    if (!fs.existsSync(CONFIG.FFMPEG_DIR)) {
      fs.mkdirSync(CONFIG.FFMPEG_DIR, { recursive: true });
    }
    
    // Baixar zip
    const zipPath = path.join(CONFIG.FFMPEG_DIR, 'ffmpeg.zip');
    await downloadFile(CONFIG.FFMPEG_URL, zipPath);
    
    // Extrair (usando PowerShell)
    console.log('\n📦 Extraindo arquivos...');
    
    await new Promise((resolve, reject) => {
      const pwsh = spawn('powershell', [
        '-Command',
        `Expand-Archive -Path '${zipPath}' -DestinationPath '${CONFIG.FFMPEG_DIR}' -Force`
      ], { stdio: 'pipe' });
      
      pwsh.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          // Tentar com tar se PowerShell falhar
          const tar = spawn('tar', ['-xf', zipPath, '-C', CONFIG.FFMPEG_DIR]);
          tar.on('close', (c) => {
            if (c === 0) resolve();
            else reject(new Error('Falha ao extrair'));
          });
        }
      });
    });
    
    // Limpar zip
    fs.unlinkSync(zipPath);
    
    // Verificar
    if (fs.existsSync(CONFIG.FFMPEG_PATH)) {
      console.log('✅ ffmpeg instalado com sucesso!');
      return { success: true, installed: true };
    } else {
      // Procurar em subpastas
      const files = fs.readdirSync(CONFIG.FFMPEG_DIR);
      const subdir = files.find(f => fs.statSync(path.join(CONFIG.FFMPEG_DIR, f)).isDirectory());
      if (subdir) {
        const foundPath = path.join(CONFIG.FFMPEG_DIR, subdir, 'bin', 'ffmpeg.exe');
        if (fs.existsSync(foundPath)) {
          // Copiar para caminho esperado
          fs.copyFileSync(foundPath, CONFIG.FFMPEG_PATH);
          console.log('✅ ffmpeg instalado (movido)!');
          return { success: true, installed: true };
        }
      }
      throw new Error('Executável não encontrado após extração');
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Verificar instalação
 */
function checkInstallation() {
  console.log('\n🔍 VERIFICAÇÃO DE INSTALAÇÃO\n');
  
  const checks = [
    {
      name: 'yt-dlp',
      path: CONFIG.YT_DLP_PATH,
      version: true
    },
    {
      name: 'ffmpeg',
      path: CONFIG.FFMPEG_PATH,
      version: false
    }
  ];
  
  const results = [];
  
  checks.forEach(check => {
    const exists = fs.existsSync(check.path);
    
    console.log(`${exists ? '✅' : '❌'} ${check.name}: ${exists ? 'Instalado' : 'Não encontrado'}`);
    
    if (exists && check.version) {
      // Tentar obter versão
      try {
        const { spawnSync } = require('child_process');
        const result = spawnSync(check.path, ['--version'], { encoding: 'utf8' });
        console.log(`   📝 Versão: ${result.stdout?.trim() || 'desconhecida'}`);
      } catch (e) {
        console.log(`   ⚠️  Não foi possível obter versão`);
      }
    }
    
    results.push({
      name: check.name,
      installed: exists,
      path: check.path
    });
  });
  
  return results;
}

/**
 * Testar download
 */
async function testDownload() {
  console.log('\n🧪 TESTANDO DOWNLOAD...\n');
  
  // Verificar se yt-dlp existe
  if (!fs.existsSync(CONFIG.YT_DLP_PATH)) {
    console.log('❌ yt-dlp não está instalado!');
    console.log('💡 Rode: node youtube-installer.js');
    return;
  }
  
  // Teste simples - info de vídeo
  const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  
  console.log(`📹 URL de teste: ${testUrl}`);
  console.log('⏳ Obtendo informações...\n');
  
  const { getVideoInfo } = require('./youtube-downloader');
  const result = await getVideoInfo(testUrl);
  
  if (result.success) {
    console.log('✅ SUCESSO! Vídeo encontrado:');
    console.log(`   📝 Título: ${result.title}`);
    console.log(`   ⏱️  Duração: ${result.duration}`);
    console.log(`   👀 Views: ${result.viewCount?.toLocaleString()}`);
    console.log(`   👤 Autor: ${result.uploader}`);
  } else {
    console.log('❌ ERRO:', result.error);
  }
}

// ==================== CLI ====================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
📦 YOUTUBE DOWNLOADER INSTALLER
================================

YT-DLP: https://github.com/yt-dlp/yt-dlp
FFMPEG: https://ffmpeg.org

USO:
  node youtube-installer.js           Instalar tudo
  node youtube-installer.js --yt-dlp  Instalar só yt-dlp
  node youtube-installer.js --ffmpeg  Instalar só ffmpeg
  node youtube-installer.js --check   Verificar instalação
  node youtube-installer.js --test   Testar download

NOTA: yt-dlp é obrigatório, ffmpeg é opcional (necessário para MP3)
`);
    return;
  }
  
  if (args.includes('--check')) {
    checkInstallation();
  } else if (args.includes('--test')) {
    await testDownload();
  } else if (args.includes('--yt-dlp')) {
    await installYtDlp();
  } else if (args.includes('--ffmpeg')) {
    await installFfmpeg();
  } else {
    // Instalar tudo
    console.log('🎬 YOUTUBE DOWNLOADER - INSTALAÇÃO\n');
    console.log('─'.repeat(40));
    
    const ytResult = await installYtDlp();
    
    if (ytResult.success) {
      const ffResult = await installFfmpeg();
    }
    
    console.log('\n📋 RESUMO:\n');
    checkInstallation();
    
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('   node scripts/youtube-downloader.js --info "URL"');
  }
}

// Export
module.exports = {
  installYtDlp,
  installFfmpeg,
  checkInstallation,
  testDownload,
  CONFIG
};

// Run
if (require.main === module) {
  main().catch(console.error);
}
