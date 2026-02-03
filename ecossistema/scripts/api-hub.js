#!/usr/bin/env node

/**
 * 🌐 API HUB - WORKER COMMUNICATION & ORCHESTRATION
 * 
 * Central hub que integra todos os workers,
 * roteia mensagens e orquestra workflows.
 * 
 * Usage: node api-hub.js [send|receive|workflow|status]
 */

const fs = require('fs');
const path = require('path');

// Colors
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

function log(message) {
  console.log(`${BLUE}[${new Date().toISOString()}]${RESET} ${message}`);
}

function logSection(title) {
  console.log(`\n${GREEN}═══════════════════════════════════════${RESET}`);
  console.log(`${GREEN}  ${title}${RESET}`);
  console.log(`${GREEN}═══════════════════════════════════════${RESET}\n`);
}

// Data Lake
const DATA_LAKE = path.join(__dirname, '../data');
const PROJECTS_DIR = path.join(DATA_LAKE, 'projects');
const WORKERS_DIR = path.join(DATA_LAKE, 'workers');
const MESSAGES_FILE = path.join(DATA_LAKE, 'messages.json');

// Workers Registry
const workersRegistry = {
  gary: { status: 'online', lastSeen: new Date().toISOString(), capabilities: ['metrics', 'reflection', 'growth'] },
  eugene: { status: 'online', lastSeen: new Date().toISOString(), capabilities: ['copy', 'headlines', 'landing_pages'] },
  alex: { status: 'online', lastSeen: new Date().toISOString(), capabilities: ['offers', 'pricing', 'value_stacking'] },
  trend: { status: 'online', lastSeen: new Date().toISOString(), capabilities: ['niches', 'trends', 'competitors'] },
  youtube: { status: 'online', lastSeen: new Date().toISOString(), capabilities: ['scripts', 'seo', 'thumbnails'] },
  jeff: { status: 'online', lastSeen: new Date().toISOString(), capabilities: ['launches', 'plf', 'email_sequence'] },
  russell: { status: 'online', lastSeen: new Date().toISOString(), capabilities: ['funnels', 'landing_pages', 'upsells'] },
  erico: { status: 'online', lastSeen: new Date().toISOString(), capabilities: ['membership', 'perpetual', 'retention'] },
  vinicius: { status: 'online', lastSeen: new Date().toISOString(), capabilities: ['dashboard', 'decisions', 'strategy'] },
  browser: { status: 'online', lastSeen: new Date().toISOString(), capabilities: ['instagram', 'youtube', 'tiktok', 'web'] }
};

// Initialize directories
function initDataLake() {
  [PROJECTS_DIR, WORKERS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify({ messages: [] }, null, 2));
  }
}

// Send message to worker
function sendMessage(params) {
  const { from, to, type, action, context } = params;
  
  const message = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    from,
    to,
    type, // REQUEST, RESPONSE, ALERT, SYNC
    action,
    context,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  
  // Save to messages
  const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE));
  messages.messages.push(message);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  
  log(`📨 Mensagem de ${from} → ${to}: ${action}`);
  
  return message;
}

// Receive messages for worker
function receiveMessages(workerName) {
  const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE));
  
  const workerMessages = messages.messages.filter(
    m => m.to === workerName && m.status === 'pending'
  );
  
  return workerMessages;
}

// Acknowledge message
function ackMessage(messageId, result) {
  const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE));
  
  const idx = messages.messages.findIndex(m => m.id === messageId);
  if (idx !== -1) {
    messages.messages[idx].status = 'completed';
    messages.messages[idx].result = result;
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  }
}

// Execute workflow
async function executeWorkflow(workflow) {
  const { name, steps } = workflow;
  
  log(`🚀 Executando workflow: ${name}`);
  
  const results = {};
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    log(`   📍 Step ${i + 1}/${steps.length}: ${step.worker} - ${step.action}`);
    
    // Send message to worker
    const message = sendMessage({
      from: 'API_HUB',
      to: step.worker,
      type: 'REQUEST',
      action: step.action,
      context: step.context || results
    });
    
    // Simulate worker execution
    const result = await simulateWorkerExecution(step);
    results[step.worker] = result;
    
    log(`   ✅ Resultado: ${JSON.stringify(result).substring(0, 100)}...`);
  }
  
  return results;
}

async function simulateWorkerExecution(step) {
  // Simulate different workers
  const workerOutputs = {
    trend: { niche: 'pets', opportunity: 85, gaps: ['conteúdo em pt', 'vídeos curtos'] },
    gary: { profile: 'PetSelectUK', followers: 4200, engagement: 4.8 },
    eugene: { headlines: ['5 formas de X', 'O segredo de Y'], copy: 'pronto' },
    alex: { offer: 'Pacote Pet', price: 197, bonuses: ['R$ 500 em valor'] },
    russell: { funnel: 'Lead Magnet → Tripwire → Upsell', pages: 4 },
    browser: { profilesAnalyzed: 5, gapsFound: 3, recommendations: 7 }
  };
  
  return workerOutputs[step.worker] || { status: 'completed' };
}

// Worker status
function getWorkerStatus() {
  return Object.entries(workersRegistry).map(([name, data]) => ({
    name,
    ...data,
    status: data.status === 'online' ? '🟢' : '🔴'
  }));
}

// Create project
function createProject(params) {
  const { name, niche, workers, owner } = params;
  
  const project = {
    id: `proj-${Date.now()}`,
    name,
    niche,
    workers,
    owner,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metrics: {},
    insights: [],
    tasks: [],
    reports: []
  };
  
  const projectDir = path.join(PROJECTS_DIR, project.id);
  fs.mkdirSync(projectDir, { recursive: true });
  fs.writeFileSync(path.join(projectDir, 'metadata.json'), JSON.stringify(project, null, 2));
  
  return project;
}

// Get project data
function getProject(projectId) {
  const metadataFile = path.join(PROJECTS_DIR, projectId, 'metadata.json');
  if (fs.existsSync(metadataFile)) {
    return JSON.parse(fs.readFileSync(metadataFile));
  }
  return null;
}

// Save project insight
function saveInsight(projectId, insight) {
  const project = getProject(projectId);
  if (project) {
    project.insights.push({
      id: `insight-${Date.now()}`,
      ...insight,
      timestamp: new Date().toISOString()
    });
    project.updatedAt = new Date().toISOString();
    
    const metadataFile = path.join(PROJECTS_DIR, projectId, 'metadata.json');
    fs.writeFileSync(metadataFile, JSON.stringify(project, null, 2));
  }
}

// Generate project report
function generateProjectReport(projectId) {
  const project = getProject(projectId);
  if (!project) {
    return null;
  }
  
  const report = {
    project: project.name,
    generatedAt: new Date().toISOString(),
    summary: `Projeto ${project.status} no nicho ${project.niche}`,
    workers: project.workers,
    metrics: project.metrics,
    insightsCount: project.insights.length,
    tasksCompleted: project.tasks.filter(t => t.status === 'completed').length,
    tasksTotal: project.tasks.length,
    recentInsights: project.insights.slice(-5)
  };
  
  return report;
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'help';

initDataLake();

switch (command) {
  case 'send':
    logSection('📨 ENVIAR MENSAGEM');
    
    const sendParams = {
      from: args[1] || 'VINICIUS',
      to: args[2] || 'GARY',
      type: 'REQUEST',
      action: args[3] || 'collect_metrics',
      context: { profile: 'PetSelectUK' }
    };
    
    const sentMessage = sendMessage(sendParams);
    console.log('\n📨 Mensagem enviada:');
    console.log(JSON.stringify(sentMessage, null, 2));
    break;
    
  case 'receive':
    logSection('📥 RECEBER MENSAGENS');
    
    const worker = args[1] || 'GARY';
    const messages = receiveMessages(worker);
    console.log(`\n📥 Mensagens para ${worker}: ${messages.length}`);
    messages.forEach(m => {
      console.log(`   - ${m.action}: ${JSON.stringify(m.context)}`);
    });
    break;
    
  case 'workflow':
    logSection('🚀 EXECUTAR WORKFLOW');
    
    const workflow = {
      name: args[1] || 'Novo Nicho Analysis',
      steps: [
        { worker: 'trend', action: 'scan_niche', context: { niche: 'pets' } },
        { worker: 'browser', action: 'analyze_profiles', context: { niche: 'pets' } },
        { worker: 'eugene', action: 'generate_headlines', context: { niche: 'pets' } },
        { worker: 'alex', action: 'create_offer', context: { niche: 'pets' } }
      ]
    };
    
    executeWorkflow(workflow).then(results => {
      console.log('\n✅ Workflow completo!');
      console.log(JSON.stringify(results, null, 2));
    });
    break;
    
  case 'status':
    logSection('📊 STATUS DO ECOSSISTEMA');
    
    const workers = getWorkerStatus();
    console.log('\n👥 Workers Online:\n');
    workers.forEach(w => {
      console.log(`   ${w.status} ${w.name.toUpperCase()}`);
      console.log(`      Capacidades: ${w.capabilities.join(', ')}`);
    });
    
    console.log('\n📊 Métricas:');
    console.log(`   Workers online: ${workers.filter(w => w.status === 'online').length}/${workers.length}`);
    console.log(`   Total workers: ${workers.length}`);
    break;
    
  case 'project':
    logSection('📁 GERENCIAR PROJETO');
    
    const projectAction = args[1];
    
    if (projectAction === 'create') {
      const project = createProject({
        name: args[2] || 'Projeto PetSelectUK',
        niche: 'pets',
        workers: ['GARY', 'EUGENE', 'ALEX', 'RUSSELL'],
        owner: 'VINICIUS'
      });
      console.log('\n✅ Projeto criado:');
      console.log(JSON.stringify(project, null, 2));
    } else if (projectAction === 'status') {
      const projectId = args[2];
      const project = getProject(projectId);
      console.log('\n📊 Projeto:', project);
    } else if (projectAction === 'report') {
      const projectId = args[2];
      const report = generateProjectReport(projectId);
      console.log('\n📋 Relatório:', report);
    }
    break;
    
  case 'sync':
    logSection('🔄 SINCRONIZAÇÃO');
    
    // Update last seen
    Object.keys(workersRegistry).forEach(w => {
      workersRegistry[w].lastSeen = new Date().toISOString();
    });
    
    console.log('\n✅ Workers sincronizados');
    console.log(`📊 ${Object.keys(workersRegistry).length} workers ativos`);
    break;
    
  case 'help':
  default:
    logSection('🌐 API HUB');
    console.log(`
用法: node api-hub.js [comando]

Comandos:
  send [from] [to] [action]  - Enviar mensagem para worker
  receive [worker]           - Ver mensagens pendentes
  workflow [nome]           - Executar workflow
  status                     - Ver status dos workers
  project create [nome]      - Criar projeto
  project status [id]        - Ver projeto
  project report [id]        - Gerar relatório
  sync                      - Sincronizar workers

Workers disponíveis:
  gary, eugene, alex, trend, youtube, jeff, russell, erico, vinicius, browser

Exemplos:
  node api-hub.js send VINICIUS GARY collect_metrics
  node api-hub.js workflow "Análise de Nicho"
  node api-hub.js project create "PetSelectUK V2"
  node api-hub.js status

Workflows disponíveis:
  - "Análise de Nicho": Trend → Browser → Eugene → Alex
  - "Novo Funil": Russell → Jeff → Gary
  - "Lançamento": Jeff → Russell → Gary → Eric
`);
}

module.exports = {
  sendMessage,
  receiveMessages,
  ackMessage,
  executeWorkflow,
  getWorkerStatus,
  createProject,
  getProject,
  saveInsight,
  generateProjectReport,
  workersRegistry
};
