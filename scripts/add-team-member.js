/**
 * 👥 TEAM MEMBER MANAGER
 * Adicionar membros do time ao Worker Brain Monitor
 * 
 * USO:
 *   node add-team-member.js --name "Nome" --role "Cargo" --permissions "read,alert"
 */

const fs = require('fs');
const path = require('path');

// Configuração
const USERS_FILE = path.join(__dirname, '..', 'scripts', 'tmp', 'team-members.json');

// ==================== FUNÇÕES ====================

function loadUsers() {
  if (fs.existsSync(USERS_FILE)) {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  }
  return {};
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function addMember(name, role, permissions = ['read']) {
  const users = loadUsers();
  
  // Gerar ID do usuário
  const userId = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_');
  
  // Adicionar timestamp
  users[userId] = {
    id: userId,
    name,
    role,
    permissions,
    addedAt: new Date().toISOString(),
    lastSeen: null
  };
  
  saveUsers(users);
  
  console.log(`✅ Membro adicionado:`);
  console.log(`   ID: ${userId}`);
  console.log(`   Nome: ${name}`);
  console.log(`   Role: ${role}`);
  console.log(`   Permissions: ${permissions.join(', ')}`);
  
  return users[userId];
}

function listMembers() {
  const users = loadUsers();
  
  console.log(`\n👥 Membros do Time (${Object.keys(users).length}):`);
  console.log('─'.repeat(50));
  
  for (const [id, user] of Object.entries(users)) {
    console.log(`\n📛 ${user.name}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Permissões: ${user.permissions.join(', ')}`);
    console.log(`   Adicionado: ${user.addedAt.split('T')[0]}`);
  }
  
  return users;
}

function removeMember(userId) {
  const users = loadUsers();
  
  if (!users[userId]) {
    console.log(`❌ Membro não encontrado: ${userId}`);
    return false;
  }
  
  const removed = users[userId];
  delete users[userId];
  saveUsers(users);
  
  console.log(`✅ Removido: ${removed.name}`);
  return true;
}

// ==================== CLI ====================

const args = process.argv.slice(2);

if (args.includes('--help') || args.length === 0) {
  console.log(`
👥 TEAM MEMBER MANAGER
=====================

ADICIONAR MEMBRO:
  node add-team-member.js --name "João Silva" --role "Designer" --permissions "read"

  Permissions disponíveis:
  - read      → Ver dashboards e métricas
  - alert     → Receber alertas
  - control   → Controlar workers

LISTAR MEMBROS:
  node add-team-member.js --list

REMOVER MEMBRO:
  node add-team-member.js --remove "joao_silva"

EXEMPLOS:
  node add-team-member.js --name "Maria" --role "Copywriter" --permissions "read,alert"
  node add-team-member.js --name "Pedro" --role "Analyst" --permissions "read"
  node add-team-member.js --name "Admin" --role "Admin" --permissions "read,alert,control"

NOTA: Membros são salvos em: scripts/tmp/team-members.json
`);
  
} else if (args.includes('--list')) {
  listMembers();
  
} else if (args.includes('--remove')) {
  const removeIdx = args.indexOf('--remove');
  const userId = args[removeIdx + 1];
  if (userId) {
    removeMember(userId);
  } else {
    console.log('❌ Especifique o ID do membro');
  }
  
} else {
  // Parse args
  const nameIdx = args.indexOf('--name');
  const roleIdx = args.indexOf('--role');
  const permIdx = args.indexOf('--permissions');
  
  if (nameIdx === -1 || roleIdx === -1) {
    console.log('❌ Nome e Role são obrigatórios');
    console.log('   USO: node add-team-member.js --name "Nome" --role "Cargo"');
  } else {
    const name = args[nameIdx + 1];
    const role = args[roleIdx + 1];
    
    let permissions = ['read'];
    if (permIdx !== -1 && args[permIdx + 1]) {
      permissions = args[permIdx + 1].split(',');
    }
    
    addMember(name, role, permissions);
  }
}
