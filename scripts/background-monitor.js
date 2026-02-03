#!/usr/bin/env node
/**
 * Background Monitor - Roda 24/7 e executa tarefas em horários específicos
 * Não precisa de admin
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = 'C:\\Users\\vsuga\\clawd';
const STATE_FILE = path.join(WORKSPACE, 'memory', 'monitor-state.json');

// Tarefas agendadas
const TASKS = [
  {
    name: 'Daily Intelligence Report',
    time: '07:00', // 7 AM
    script: path.join(WORKSPACE, 'scripts', 'run-intelligence-report.js'),
    description: 'Coleta trends de crypto, política e trending topics'
  },
  {
    name: 'Utmify Daily Monitor',
    time: '08:00', // 8 AM
    script: path.join(WORKSPACE, 'scripts', 'monitor-utmify.js'),
    description: 'Monitora performance de campanhas'
  }
];

function log(msg) {
  const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  console.log(`[${timestamp}] ${msg}`);
}

function getState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function setState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function shouldRunTask(taskName, taskTime) {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const today = now.toISOString().split('T')[0];
  
  const state = getState();
  const lastRun = state[taskName];
  
  // Se rodou hoje, não roda novamente
  if (lastRun === today) {
    return false;
  }
  
  // Se tá no intervalo correto (±5 minutos de folga)
  const [hour, min] = taskTime.split(':').map(Number);
  const taskDate = new Date();
  taskDate.setHours(hour, min, 0, 0);
  
  const diff = Math.abs(now - taskDate) / 60000; // diferença em minutos
  
  return diff <= 5; // Executa se estiver entre -5 e +5 minutos
}

function runTask(task) {
  log(`🚀 Iniciando: ${task.name}`);
  try {
    execSync(`node "${task.script}"`, { 
      stdio: 'inherit',
      shell: true 
    });
    
    // Marca como executado hoje
    const state = getState();
    const today = new Date().toISOString().split('T')[0];
    state[task.name] = today;
    setState(state);
    
    log(`✅ Concluído: ${task.name}`);
  } catch (error) {
    log(`❌ Erro em ${task.name}: ${error.message}`);
  }
}

function checkAndExecute() {
  TASKS.forEach(task => {
    if (shouldRunTask(task.name, task.time)) {
      runTask(task);
    }
  });
}

// Inicia monitor
log('📊 Background Monitor iniciado');
log(`⏰ Tarefas agendadas: ${TASKS.length}`);
TASKS.forEach(t => log(`  - ${t.time}: ${t.name}`));

// Verifica a cada minuto
setInterval(checkAndExecute, 60000);

// Primeira verificação imediata
checkAndExecute();

log('✨ Aguardando próxima execução...\n');
