#!/usr/bin/env node
/**
 * BAIXAR ÁUDIOS PARA PROJETO RELIGIÃO
 * 
 * Fontes:
 * - YouTube (áudios copyright-free)
 * - Exportar de vídeos específicos
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const AUDIO_DIR = path.join(__dirname, '..', 'projeto-religiao', 'audio');

// ==================== ÁUDIOS DISPONÍVEIS ====================
// Estes são vídeos do YouTube com música worship copyright-free
// Você pode adicionar mais URLs aqui

const AUDIO_SOURCES = [
  {
    name: "worship_calm_01",
    title: "Worship Calm - Piano Instrumental",
    url: "https://www.youtube.com/watch?v=5qap5aO4i9A", // Lofi worship
    duration: "3:00:00"
  },
  {
    name: "worship_piano_02", 
    title: "Peaceful Worship Piano",
    url: "https://www.youtube.com/watch?v=mPFFD3m2bQU",
    duration: "3:00:00"
  },
  {
    name: "adoration_harp_03",
    title: "Harp Worship Music",
    url: "https://www.youtube.com/watch?v=1k8crdY8Kbw",
    duration: "3:00:00"
  },
  {
    name: "bible_ambient_04",
    title: "Bible Study Ambient",
    url: "https://www.youtube.com/watch?v=WiB2jOW7w9g",
    duration: "3:00:00"
  },
  {
    name: "faith_worship_05",
    title: "Faith Worship Music",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Placeholder
    duration: "3:00:00"
  }
];

// ==================== DOWNLOAD FUNCTIONS ====================

function downloadWithYtDlp(url, outputPath) {
  try {
    console.log(`📥 Baixando: ${path.basename(outputPath)}`);
    
    // Baixar apenas áudio (mp3)
    const cmd = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}" --no-playlist`;
    execSync(cmd, { encoding: 'utf8', stdio: 'inherit' });
    
    return true;
  } catch (error) {
    console.log(`❌ Erro ao baixar: ${error.message}`);
    return false;
  }
}

function downloadManual(url, outputPath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Baixando: ${path.basename(outputPath)}`);
    
    // Método alternativo: download direto
    // Nota: Muitos sites bloqueiam download direto
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadManual(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

// ==================== MAIN ====================

async function main() {
  console.log('\n🎵 BAIXAR ÁUDIOS - PROJETO RELIGIÃO\n');
  
  // Criar diretório
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
    console.log(`📁 Pasta criada: ${AUDIO_DIR}\n`);
  }
  
  // Verificar yt-dlp
  let hasYtDlp = false;
  try {
    execSync('where yt-dlp.exe', { encoding: 'utf8', stdio: 'pipe' });
    hasYtDlp = true;
    console.log('✅ yt-dlp encontrado\n');
  } catch {
    console.log('⚠️  yt-dlp não encontrado\n');
    console.log('📦 Instalando yt-dlp...\n');
    
    try {
      execSync('npm install -g yt-dlp', { encoding: 'utf8', stdio: 'inherit' });
      hasYtDlp = true;
      console.log('\n✅ yt-dlp instalado!\n');
    } catch {
      console.log('❌ Falha ao instalar yt-dlp');
      console.log('   Você pode instalar manualmente: npm install -g yt-dlp');
      process.exit(1);
    }
  }
  
  // Baixar cada áudio
  console.log('📋 ÁUDIOS PARA BAIXAR:\n');
  
  for (const audio of AUDIO_SOURCES) {
    const outputPath = path.join(AUDIO_DIR, `${audio.name}.mp3`);
    
    // Verificar se já existe
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  ${audio.name}.mp3 - Já existe`);
      continue;
    }
    
    console.log(`\n🎵 ${audio.title}`);
    console.log(`   URL: ${audio.url}`);
    
    if (hasYtDlp) {
      const success = downloadWithYtDlp(audio.url, outputPath);
      if (success) {
        console.log(`✅ ${audio.name}.mp3 - Baixado com sucesso!`);
      } else {
        console.log(`❌ ${audio.name}.mp3 - Falha no download`);
      }
    }
  }
  
  // Listar áudios disponíveis
  console.log('\n\n📁 ÁUDIOS DISPONÍVEIS:\n');
  
  const files = fs.readdirSync(AUDIO_DIR)
    .filter(f => f.endsWith('.mp3'))
    .map(f => ({
      name: f,
      size: (fs.statSync(path.join(AUDIO_DIR, f)).size / 1024 / 1024).toFixed(2) + ' MB'
    }));
  
  if (files.length === 0) {
    console.log('   Nenhum áudio encontrado.');
    console.log('\n💡 Dica: Adicione arquivos MP3 manualmente na pasta:');
    console.log(`   ${AUDIO_DIR}`);
  } else {
    files.forEach(f => {
      console.log(`   🎵 ${f.name} (${f.size})`);
    });
  }
  
  console.log(`\n✅ Total: ${files.length} áudios disponíveis`);
  console.log('\n📝 O scheduler usará áudios aleatórios da pasta!');
}

main();
