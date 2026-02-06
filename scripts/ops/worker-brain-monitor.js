/**
 * 🧠 WORKER BRAIN MONITOR
 * 
 * Monitora status, atividade e "pensamentos" de cada worker
 * Permite humanos (users) monitorarem o ecossistema
 */

const fs = require('fs');
const path = require('path');

// ==================== CONFIGURAÇÃO ====================

const CONFIG = {
  // Workers do ecossistema
  WORKERS: {
    GARY: {
      name: 'Gary',
      role: 'Growth & Conteúdo',
      status: 'idle', // idle, working, error
      currentTask: null,
      lastActivity: null,
      metrics: {
        postsToday: 0,
        successRate: 0,
        avgProcessingTime: 0
      },
      brain: [], // Últimos pensamentos
      owner: 'Alex'
    },
    EUGENE: {
      name: 'Eugene',
      role: 'Copy & Headlines',
      status: 'idle',
      currentTask: null,
      lastActivity: null,
      metrics: {
        copiesToday: 0,
        approvalRate: 0,
        avgProcessingTime: 0
      },
      brain: [],
      owner: 'Alex'
    },
    HORMOZI: {
      name: 'Hormozi',
      role: 'Offers & Vendas',
      status: 'idle',
      currentTask: null,
      lastActivity: null,
      metrics: {
        offersToday: 0,
        conversionRate: 0,
        avgProcessingTime: 0
      },
      brain: [],
      owner: 'Alex'
    },
    ALEX: {
      name: 'Alex',
      role: 'Autopilot & Orchestrator',
      status: 'working',
      currentTask: 'Monitorando Dashboard',
      lastActivity: new Date().toISOString(),
      metrics: {
        tasksCompleted: 20,
        uptime: 0,
        alertsSent: 0
      },
      brain: ['Avaliando segurança', 'Processando mensagens', 'Gerando relatórios'],
      owner: 'Alex'
    }
  },
  
  // Usuários humanos autorizados
  USERS: {
    'vinicius': {
      name: 'Vinicius',
      role: 'CEO & Estrategista',
      permissions: ['read', 'alert', 'control'],
      lastSeen: null,
      monitors: ['all'] // Quais workers acompanha
    },
    'admin': {
      name: 'Admin Team',
      role: 'Operations',
      permissions: ['read', 'alert'],
      lastSeen: null,
      monitors: ['all']
    }
  },
  
  // Configurações
  MAX_BRAIN_ITEMS: 10,
  BRAIN_LOG_FILE: 'tmp/worker-brain-log.json'
};

// ==================== CLASSE PRINCIPAL ====================

class WorkerBrainMonitor {
  constructor() {
    this.workers = CONFIG.WORKERS;
    this.users = CONFIG.USERS;
    this.logs = this.loadLogs();
  }
  
  /**
   * Carregar logs salvos
   */
  loadLogs() {
    const logFile = path.join(__dirname, '..', CONFIG.BRAIN_LOG_FILE);
    if (fs.existsSync(logFile)) {
      try {
        return JSON.parse(fs.readFileSync(logFile, 'utf8'));
      } catch (e) {
        return {};
      }
    }
    return {};
  }
  
  /**
   * Salvar logs
   */
  saveLogs() {
    const logFile = path.join(__dirname, '..', CONFIG.BRAIN_LOG_FILE);
    fs.writeFileSync(logFile, JSON.stringify(this.logs, null, 2));
  }
  
  /**
   * Atualizar status de um worker
   */
  updateWorkerStatus(workerId, status, task = null) {
    if (!this.workers[workerId]) {
      return { error: 'Worker not found' };
    }
    
    this.workers[workerId].status = status;
    this.workers[workerId].currentTask = task;
    this.workers[workerId].lastActivity = new Date().toISOString();
    
    // Log
    this.logActivity(workerId, 'status_change', { status, task });
    
    return { success: true, worker: this.workers[workerId] };
  }
  
  /**
   * Adicionar "pensamento" ao brain do worker
   */
  addBrainThought(workerId, thought) {
    if (!this.workers[workerId]) {
      return { error: 'Worker not found' };
    }
    
    const brain = this.workers[workerId].brain;
    brain.unshift({
      thought,
      timestamp: new Date().toISOString()
    });
    
    // Manter só os últimos N pensamentos
    if (brain.length > CONFIG.MAX_BRAIN_ITEMS) {
      brain.pop();
    }
    
    // Log
    this.logActivity(workerId, 'brain_thought', { thought });
    
    return { success: true, brain };
  }
  
  /**
   * Atualizar métrica de worker
   */
  updateWorkerMetric(workerId, metric, value) {
    if (!this.workers[workerId]) {
      return { error: 'Worker not found' };
    }
    
    this.workers[workerId].metrics[metric] = value;
    return { success: true };
  }
  
  /**
   * Log de atividade
   */
  logActivity(workerId, type, data) {
    const date = new Date().toISOString().split('T')[0];
    
    if (!this.logs[date]) {
      this.logs[date] = [];
    }
    
    this.logs[date].push({
      timestamp: new Date().toISOString(),
      workerId,
      type,
      data
    });
    
    // Manter só 7 dias de logs
    this.cleanOldLogs(7);
    this.saveLogs();
  }
  
  /**
   * Limpar logs antigos
   */
  cleanOldLogs(daysToKeep) {
    const dates = Object.keys(this.logs);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    
    for (const date of dates) {
      if (new Date(date) < cutoff) {
        delete this.logs[date];
      }
    }
  }
  
  /**
   * Obter status completo de todos os workers
   */
  getAllWorkersStatus() {
    const status = {};
    
    for (const [id, worker] of Object.entries(this.workers)) {
      status[id] = {
        id,
        name: worker.name,
        role: worker.role,
        status: worker.status,
        currentTask: worker.currentTask,
        lastActivity: worker.lastActivity,
        metrics: worker.metrics,
        brainSize: worker.brain.length
      };
    }
    
    return {
      timestamp: new Date().toISOString(),
      workers: status,
      summary: {
        total: Object.keys(this.workers).length,
        working: Object.values(this.workers).filter(w => w.status === 'working').length,
        idle: Object.values(this.workers).filter(w => w.status === 'idle').length,
        error: Object.values(this.workers).filter(w => w.status === 'error').length
      }
    };
  }
  
  /**
   * Obter brain completo de um worker
   */
  getWorkerBrain(workerId) {
    if (!this.workers[workerId]) {
      return { error: 'Worker not found' };
    }
    
    return {
      workerId,
      name: this.workers[workerId].name,
      role: this.workers[workerId].role,
      status: this.workers[workerId].status,
      currentTask: this.workers[workerId].currentTask,
      brain: this.workers[workerId].brain,
      metrics: this.workers[workerId].metrics,
      lastActivity: this.workers[workerId].lastActivity
    };
  }
  
  /**
   * Adicionar novo usuário humano
   */
  addUser(userId, userData) {
    this.users[userId] = {
      ...userData,
      lastSeen: new Date().toISOString(),
      permissions: userData.permissions || ['read']
    };
    
    return { success: true, user: this.users[userId] };
  }
  
  /**
   * Obter usuários
   */
  getUsers() {
    return {
      timestamp: new Date().toISOString(),
      users: this.users
    };
  }
  
  /**
   * Atualizar lastSeen de usuário
   */
  updateUserSeen(userId) {
    if (this.users[userId]) {
      this.users[userId].lastSeen = new Date().toISOString();
    }
  }
  
  /**
   * Gerar snapshot para humanos
   */
  generateHumanSnapshot() {
    const status = this.getAllWorkersStatus();
    
    let snapshot = `
🧠 **ECOSSYSTEM BRAIN SNAPSHOT**
📅 ${new Date().toLocaleString('pt-BR')}

---

**📊 STATUS GERAL**
- Workers Online: ${status.summary.working}/${status.summary.total}
- Idle: ${status.summary.idle}
- Error: ${status.summary.error}

---

`;
    
    for (const [id, worker] of Object.entries(status.workers)) {
      const statusEmoji = worker.status === 'working' ? '🔄' : worker.status === 'error' ? '❌' : '💤';
      
      snapshot += `
${statusEmoji} **${worker.name}** (${worker.role})
   📍 Status: ${worker.status}
   📌 Tarefa: ${worker.currentTask || 'Nenhuma'}
   🧠 Brain: ${worker.brainSize} pensamentos
`;
      
      // Mostrar último pensamento se houver
      const workerData = this.workers[id];
      if (workerData && workerData.brain && workerData.brain.length > 0 && workerData.brain[0]?.thought) {
        snapshot += `   💭 "${workerData.brain[0].thought.substring(0, 60)}..."\n`;
      }
      
      // Mostrar métricas principais
      if (worker.metrics.postsToday !== undefined) {
        snapshot += `   📈 Posts hoje: ${worker.metrics.postsToday}\n`;
      }
      if (worker.metrics.copiesToday !== undefined) {
        snapshot += `   ✍️ Copies hoje: ${worker.metrics.copiesToday}\n`;
      }
      if (worker.metrics.tasksCompleted !== undefined) {
        snapshot += `   ✅ Tasks concluídas: ${worker.metrics.tasksCompleted}\n`;
      }
      
      snapshot += '\n';
    }
    
    snapshot += `
---
*🤖 Generated by Worker Brain Monitor*
`;

    return snapshot;
  }
  
  /**
   * Simular atividade de worker (para teste)
   */
  simulateWorkerActivity(workerId) {
    const activities = {
      GARY: [
        'Gerando reel sobre saúde mental',
        'Analisando tendências do nicho',
        'Criando hook para novo post',
        'Otimizando conteúdo para engajamento',
        'Estudando perfil do público'
      ],
      EUGENE: [
        'Escrevendo headline para oferta',
        'Criando fascinations',
        'Desenvolvendo copy para email',
        'Refinando proposta de valor',
        'Testando diferentes abordagens'
      ],
      HORMOZI: [
        'Estruturando oferta irresistível',
        'Calculando CAC e LTV',
        'Criando bônus para conversão',
        'Definindo preço e posicionamento',
        'Mapeando objections'
      ],
      ALEX: [
        'Avaliando segurança do sistema',
        'Processando mensagens',
        'Gerando relatórios automáticos',
        'Monitorando métricas',
        'Coordenando workers'
      ]
    };
    
    const thoughts = activities[workerId] || ['Trabalhando...'];
    const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
    
    this.addBrainThought(workerId, randomThought);
    this.updateWorkerStatus(workerId, 'working', randomThought);
    
    return { workerId, thought: randomThought };
  }
}

// ==================== EXPORTS ====================

module.exports = {
  WorkerBrainMonitor,
  CONFIG,
  createMonitor: () => new WorkerBrainMonitor()
};

// ==================== CLI ====================

if (require.main === module) {
  const monitor = new WorkerBrainMonitor();
  const args = process.argv.slice(2);
  
  if (args[0] === '--status') {
    console.log(JSON.stringify(monitor.getAllWorkersStatus(), null, 2));
  } else if (args[0] === '--brain') {
    const workerId = args[1] || 'ALEX';
    console.log(JSON.stringify(monitor.getWorkerBrain(workerId), null, 2));
  } else if (args[0] === '--snapshot') {
    console.log(monitor.generateHumanSnapshot());
  } else if (args[0] === '--simulate') {
    const workerId = args[1] || 'ALEX';
    console.log(monitor.simulateWorkerActivity(workerId));
  } else if (args[0] === '--users') {
    console.log(JSON.stringify(monitor.getUsers(), null, 2));
  } else {
    console.log(`
🧠 WORKER BRAIN MONITOR CLI
===========================

USO:
  node worker-brain-monitor.js --status      Ver status de todos
  node worker-brain-monitor.js --brain [ID] Ver brain de um worker
  node worker-brain-monitor.js --snapshot    Snapshot para humanos
  node worker-brain-monitor.js --simulate [ID] Simular atividade
  node worker-brain-monitor.js --users       Ver usuários

WORKERS DISPONÍVEIS:
  - GARY (Growth & Conteúdo)
  - EUGENE (Copy & Headlines)
  - HORMOZI (Offers & Vendas)
  - ALEX (Autopilot)

INTEGRAÇÃO:
  const { createMonitor } = require('./worker-brain-monitor');
  
  const monitor = createMonitor();
  
  // Ver status
  const status = monitor.getAllWorkersStatus();
  
  // Adicionar pensamento
  monitor.addBrainThought('GARY', 'Novo post criado!');
  
  // Snapshot para Telegram
  const snapshot = monitor.generateHumanSnapshot();
`);
  }
}
