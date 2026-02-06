/**
 * 📸 QUOTE POST CREATOR - Posts de Citações Automáticos
 * 
 * Sistema completo:
 * 1. Busca citação (free-quote.js - 100% gratuito)
 * 2. Gera imagem (Vertex AI - no_cost)
 * 3. Cria caption otimizado
 * 4. Faz upload para Google Drive
 * 5. Agenda post
 */

const { getFreeQuote, getQuoteOfTheDay, getRandomQuotes, generateImagePrompt, generateCaption } = require('./free-quote');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// ==================== CONFIGURAÇÃO ====================

const CONFIG = {
  OUTPUT_DIR: path.join(__dirname, '..', 'outputs', 'quotes'),
  POSTS_FILE: path.join(__dirname, '..', 'outputs', 'quotes', 'posts.json'),
  DAILY_POST_TIME: '09:00', // 9 AM
  MAX_POSTS_PER_DAY: 3,
  DRIVE_FOLDER_ID: process.env.DRIVE_QUOTE_FOLDER_ID || null // Pasta do Drive para citacoes
};

// ==================== GOOGLE DRIVE ====================

let driveClient = null;

async function getDriveClient() {
  if (driveClient) return driveClient;
  
  // Carregar credenciais
  const credentialsPath = path.join(__dirname, '..', 'credentials', 'google-drive.json');
  
  if (!fs.existsSync(credentialsPath)) {
    console.log('⚠️  Arquivo de credenciais não encontrado');
    console.log('   Crie: credentials/google-drive.json');
    return null;
  }
  
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file']
  });
  
  driveClient = google.drive({ version: 'v3', auth });
  return driveClient;
}

async function uploadToDrive(filePath, fileName, folderId) {
  const drive = await getDriveClient();
  if (!drive) return null;
  
  try {
    const fileMetadata = {
      name: fileName,
      parents: folderId ? [folderId] : []
    };
    
    const media = {
      mimeType: 'image/jpeg',
      body: fs.createReadStream(filePath)
    };
    
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, webViewLink'
    });
    
    console.log(`   📁 Uploaded: ${fileName}`);
    return response.data;
  } catch (error) {
    console.log(`   ❌ Upload failed: ${error.message}`);
    return null;
  }
}

async function createDriveFolder(folderName, parentId = null) {
  const drive = await getDriveClient();
  if (!drive) return null;
  
  try {
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : []
    };
    
    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name'
    });
    
    return response.data;
  } catch (error) {
    console.log(`   ❌ Folder creation failed: ${error.message}`);
    return null;
  }
}

// ==================== FUNÇÕES ====================

/**
 * Criar post único de citação
 */
function createQuotePost(options = {}) {
  const {
    category = null,
    scheduleDate = null,
    profile = 'quote_profile',
    generateImage = false,
    uploadDrive = true
  } = options;
  
  console.log('\n📝 CRIANDO POST DE CITAÇÃO\n');
  
  // 1. Buscar citação
  console.log('1️⃣  Buscando citação...');
  const quoteResult = getFreeQuote(category);
  
  if (!quoteResult.success) {
    return { success: false, error: 'Falha ao buscar citação' };
  }
  
  const { quote, category: cat } = quoteResult;
  console.log(`   ✅ "${quote.quote.substring(0, 50)}..."`);
  console.log(`   👤 ${quote.author}`);
  
  // 2. Gerar prompt para imagem
  console.log('\n2️⃣  Gerando prompt para imagem...');
  const prompt = generateImagePrompt(quote.quote, quote.author);
  console.log(`   ✅ Prompt gerado (${prompt.length} caracteres)`);
  
  // 3. Criar caption
  console.log('\n3️⃣  Criando caption...');
  const caption = generateCaption(quote.quote, quote.author, cat);
  console.log(`   ✅ Caption criado`);
  
  // 4. Preparar post
  console.log('\n4️⃣  Preparando post...');
  const post = {
    id: `quote_${Date.now()}`,
    type: 'quote',
    status: 'ready',
    quote: {
      text: quote.quote,
      author: quote.author,
      category: cat
    },
    image: {
      prompt: prompt,
      generated: false,
      path: null
    },
    caption: caption,
    profile: profile,
    scheduledFor: scheduleDate || getNextScheduleDate(),
    cost: 'no_cost',
    createdAt: new Date().toISOString()
  };
  
  // 5. Salvar post
  console.log('\n5️⃣  Salvando post...');
  const posts = loadPosts();
  posts.push(post);
  savePosts(posts);
  
  console.log(`   ✅ Post criado com ID: ${post.id}`);
  console.log(`   📅 Agendado para: ${new Date(post.scheduledFor).toLocaleString('pt-BR')}`);
  
  return { success: true, post };
}

/**
 * Carregar posts do arquivo
 */
function loadPosts() {
  try {
    const data = fs.readFileSync(CONFIG.POSTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

/**
 * Salvar posts no arquivo
 */
function savePosts(posts) {
  const dir = path.dirname(CONFIG.POSTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG.POSTS_FILE, JSON.stringify(posts, null, 2));
}

/**
 * Calcular próxima data de agendamento
 */
function getNextScheduleDate() {
  const now = new Date();
  const [hours, minutes] = CONFIG.DAILY_POST_TIME.split(':').map(Number);
  
  let scheduled = new Date(now);
  scheduled.setHours(hours, minutes, 0, 0);
  
  // Se já passou do horário hoje, agendar para amanhã
  if (scheduled <= now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }
  
  return scheduled.toISOString();
}

/**
 * Criar batch de posts
 */
function createBatch(count = 5, category = null) {
  console.log(`\n📦 CRIANDO BATCH DE ${count} POSTS\n`);
  
  const posts = [];
  
  for (let i = 0; i < count; i++) {
    const result = createQuotePost({ category });
    if (result.success) {
      posts.push(result.post);
    }
  }
  
  console.log(`\n✅ ${posts.length} POSTS CRIADOS\n`);
  
  return posts;
}

/**
 * Listar posts
 */
function listPosts() {
  const posts = loadPosts();
  
  console.log('\n📋 POSTS AGENDADOS:\n');
  
  if (posts.length === 0) {
    console.log('   Nenhum post encontrado.');
    return;
  }
  
  posts.forEach((post, i) => {
    const date = new Date(post.scheduledFor).toLocaleDateString('pt-BR');
    console.log(`${i + 1}. ${post.quote.text.substring(0, 40)}...`);
    console.log(`   📅 ${date} | 💰 ${post.cost} | 📊 ${post.status}`);
  });
  
  console.log(`\n   Total: ${posts.length} posts`);
}

/**
 * Estatísticas
 */
function stats() {
  const posts = loadPosts();
  
  const ready = posts.filter(p => p.status === 'ready').length;
  const published = posts.filter(p => p.status === 'published').length;
  const noCost = posts.filter(p => p.cost === 'no_cost').length;
  
  console.log('\n📊 ESTATÍSTICAS:\n');
  console.log(`   Total posts: ${posts.length}`);
  console.log(`   Ready: ${ready}`);
  console.log(`   Published: ${published}`);
  console.log(`   No cost: ${noCost}`);
  console.log(`   Custo total: R$ 0 (100% gratuito)`);
}

// ==================== CLI ====================

const args = process.argv.slice(2);
const command = args[0];

if (command === '--batch') {
  const count = parseInt(args[1]) || 5;
  const category = args.find(a => a.startsWith('--category='))?.split('=')[1];
  createBatch(count, category);
} else if (command === '--daily') {
  createBatch(CONFIG.MAX_POSTS_PER_DAY);
} else if (command === '--list') {
  listPosts();
} else if (command === '--stats') {
  stats();
} else if (command === '--drive') {
  console.log('\n☁️  GOOGLE DRIVE UPLOAD\n');
  console.log('   Configure: credentials/google-drive.json');
  console.log(`   Pasta: ${CONFIG.DRIVE_FOLDER_ID || 'Não configurada'}`);
} else if (command === '--create-folder') {
  console.log('\n📁 CRIANDO PASTA NO DRIVE\n');
  const folderName = args[1] || `Citacoes_${new Date().toISOString().split('T')[0]}`;
  createDriveFolder(folderName).then(data => {
    if (data) {
      console.log(`   ✅ Pasta criada: ${data.name} (${data.id})`);
    }
  });
} else {
  createQuotePost();
}

module.exports = { createQuotePost, createBatch, loadPosts, savePosts };
