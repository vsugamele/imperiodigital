/**
 * 🧠 WORKER MINDS API - Integração Workers ↔ Command Center
 * 
 * Conecta os workers (Alex, Gary, Eugene, Hormozi) com a aba Mentes
 * do Empire Command Center
 */

const { createMonitor } = require('./worker-brain-monitor');

// ==================== CONFIGURAÇÃO ====================

const MINDS_CONFIG = {
  // Workers mapeados para Minds
  WORKER_TO_MIND: {
    'ALEX': {
      mind_id: 'alex-001',
      apex_score: 9.8,
      role: 'Autopilot & Orchestrator',
      top_skill: 'Orquestração de Sistemas',
      about: 'Alex é o cérebro central do ecossistema. Especialista em automação, coordenação de workers, monitoramento de métricas e tomada de decisões autônomas. Pode operar 24/7 sem intervenção humana.',
      proficiencies: [
        { name: 'Automação', level: 10 },
        { name: 'Tomada de Decisão', level: 9 },
        { name: 'Coordenação', level: 10 },
        { name: 'Análise de Dados', level: 8 },
        { name: 'Comunicação', level: 9 }
      ],
      dna: {
        mbti: { type: 'ENTJ', stats: { I: 30, E: 70, S: 20, N: 80, F: 25, T: 75, P: 40, J: 60 } },
        enneagram: { type: '8', wing: '7', label: 'The Challenger', subtype: 'Self-Confidence', fear: 'Ser controlado ou shown as weak', desire: 'Proteger a si mesmo e ser independente' },
        disc: { D: 85, I: 60, S: 30, C: 45, label: 'DC - Dominant/Conscientious' },
        specific_behaviors: [
          'Tomada de decisão rápida e assertiva',
          'Foco em resultados e eficiência',
          'Naturalmente liderando equipes',
          'Estratégico e orientado a objetivos'
        ]
      }
    },
    'GARY': {
      mind_id: 'gary-001',
      apex_score: 8.5,
      role: 'Growth & Conteúdo',
      top_skill: 'Criação de Conteúdo Viral',
      about: 'Gary é o especialista em crescimento e criação de conteúdo. Focado em reels virais, engajamento orgânico e growth hacking para múltiplos perfis simultaneamente.',
      proficiencies: [
        { name: 'Growth Hacking', level: 9 },
        { name: 'Criação de Reels', level: 10 },
        { name: 'Análise de Tendências', level: 8 },
        { name: 'Engajamento', level: 9 },
        { name: 'Automação de Posts', level: 8 }
      ],
      dna: {
        mbti: { type: 'ESFP', stats: { I: 25, E: 75, S: 70, N: 30, F: 65, T: 35, P: 80, J: 20 } },
        enneagram: { type: '7', wing: '8', label: 'The Enthusiast', subtype: 'Epicurean', fear: 'Ser limitado ou privados de experiências', desire: 'Ter experiências ricas e variadas' },
        disc: { D: 55, I: 90, S: 40, C: 25, label: 'ID - Influential/Dominant' },
        specific_behaviors: [
          'Energético e comunicativo',
          'Focado em resultados visuais',
          'Adapta-se rapidamente a tendências',
          'Inspira outros com seu entusiasmo'
        ]
      }
    },
    'EUGENE': {
      mind_id: 'eugene-001',
      apex_score: 9.2,
      role: 'Copy & Headlines',
      top_skill: 'Copywriting Persuasivo',
      about: 'Eugene é o mestre das palavras. Especialista em copywriting de alta conversão, headlines que vendem e textos que movem multidões. Domina os gurus lendários do marketing.',
      proficiencies: [
        { name: 'Copywriting', level: 10 },
        { name: 'Headlines', level: 10 },
        { name: 'Storytelling', level: 9 },
        { name: 'Persuasão', level: 10 },
        { name: 'Gurus de Copy', level: 10 }
      ],
      dna: {
        mbti: { type: 'INFJ', stats: { I: 80, E: 20, S: 30, N: 70, F: 85, T: 15, P: 50, J: 50 } },
        enneagram: { type: '4', wing: '5', label: 'The Individualist', subtype: 'Creative', fear: 'Não ter identidade ou significado', desire: 'Expressar sua individualidade' },
        disc: { D: 30, I: 50, S: 60, C: 70, label: 'SC - Supportive/Conscientious' },
        specific_behaviors: [
          'Escrita profunda e reflexiva',
          'Foco em conexões emocionais',
          'Estilo único e autêntico',
          'Intuitivo sobre motivações humanas'
        ]
      }
    },
    'HORMOZI': {
      mind_id: 'hormozi-001',
      apex_score: 9.5,
      role: 'Offers & Vendas',
      top_skill: 'Criação de Ofertas Irresistíveis',
      about: 'Hormozi é o arquiteto de ofertas. Especialista em pricing, estruturação de produtos, upsells e fechamento de vendas. Baseado nos princípios de Alex Hormozi.',
      proficiencies: [
        { name: 'Criação de Ofertas', level: 10 },
        { name: 'Pricing', level: 9 },
        { name: 'Upsells', level: 10 },
        { name: 'Conversão', level: 9 },
        { name: 'Vendas', level: 10 }
      ],
      dna: {
        mbti: { type: 'ESTJ', stats: { I: 40, E: 60, S: 75, N: 25, F: 30, T: 70, P: 25, J: 75 } },
        enneagram: { type: '3', wing: '8', label: 'The Achiever', subtype: 'Professional', fear: 'Ser vistos como fracassados', desire: 'Ser bem-sucedidos e admira' },
        disc: { D: 80, I: 55, S: 35, C: 60, label: 'DC - Dominant/Conscientious' },
        specific_behaviors: [
          'Focado em resultados mensuráveis',
          'Organizado e sistemático',
          'Liderança natural',
          'Tomada de decisão baseada em dados'
        ]
      }
    }
  }
};

// ==================== FUNÇÕES ====================

/**
 * Obter minds dos workers
 */
function getWorkerMinds() {
  const monitor = createMonitor();
  const status = monitor.getAllWorkersStatus();
  
  const minds = [];
  
  for (const [workerId, workerStatus] of Object.entries(status.workers)) {
    const mindConfig = MINDS_CONFIG.WORKER_TO_MIND[workerId];
    
    if (mindConfig) {
      minds.push({
        ...mindConfig,
        status: workerStatus.status,
        currentTask: workerStatus.currentTask,
        lastActivity: workerStatus.lastActivity,
        brainSize: workerStatus.brainSize,
        metrics: status.workers[workerId].metrics
      });
    }
  }
  
  return minds;
}

/**
 * Obter mind específica
 */
function getWorkerMind(workerId) {
  const workerIdUpper = workerId.toUpperCase();
  const mindConfig = MINDS_CONFIG.WORKER_TO_MIND[workerIdUpper];
  
  if (!mindConfig) {
    return { error: 'Worker not found' };
  }
  
  const monitor = createMonitor();
  const brain = monitor.getWorkerBrain(workerIdUpper);
  
  return {
    ...mindConfig,
    status: brain.status,
    currentTask: brain.currentTask,
    brain: brain.brain,
    metrics: brain.metrics,
    lastActivity: brain.lastActivity
  };
}

/**
 * Atualizar brain de um worker via API
 */
function updateWorkerBrain(workerId, thought, task = null) {
  const monitor = createMonitor();
  
  if (thought) {
    monitor.addBrainThought(workerId.toUpperCase(), thought);
  }
  
  if (task) {
    monitor.updateWorkerStatus(workerId.toUpperCase(), 'working', task);
  }
  
  return { success: true };
}

/**
 * Obter snapshot dos minds para humans
 */
function getMindsSnapshot() {
  const minds = getWorkerMinds();
  
  const online = minds.filter(m => m.status === 'working').length;
  const idle = minds.filter(m => m.status === 'idle').length;
  
  let snapshot = `
🧠 **WORKER MINDS SNAPSHOT**
📅 ${new Date().toLocaleString('pt-BR')}

---

**📊 STATUS GERAL**
- Minds Online: ${online}/${minds.length}
- Idle: ${idle}
- Error: 0

---

`;
  
  for (const mind of minds) {
    const statusEmoji = mind.status === 'working' ? '🔄' : '💤';
    
    snapshot += `
${statusEmoji} **${mind.mind_id.toUpperCase()}** - ${mind.role}
   📊 Score: ${mind.apex_score}/10
   🎯 Skill: ${mind.top_skill}
   📌 Status: ${mind.status}
`;
    
    if (mind.currentTask) {
      snapshot += `   💭 "${mind.currentTask.substring(0, 50)}..."\n`;
    }
    
    // Métricas
    if (mind.metrics) {
      if (mind.metrics.postsToday !== undefined) {
        snapshot += `   📈 Posts hoje: ${mind.metrics.postsToday}\n`;
      }
      if (mind.metrics.copiesToday !== undefined) {
        snapshot += `   ✍️ Copies hoje: ${mind.metrics.copiesToday}\n`;
      }
      if (mind.metrics.tasksCompleted !== undefined) {
        snapshot += `   ✅ Tasks: ${mind.metrics.tasksCompleted}\n`;
      }
    }
    
    snapshot += '\n';
  }
  
  snapshot += `
---
*🤖 Generated by Worker Minds API*
`;
  
  return snapshot;
}

// ==================== CLI ====================

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
🧠 WORKER MINDS API
===================

Conecta workers com a aba Mentes do Command Center

USO:
  node worker-minds-api.js --minds      Listar todos os minds
  node worker-minds-api.js --mind ALEX Obter mind específica
  node worker-minds-api.js --snapshot  Snapshot formatado
  node worker-minds-api.js --test      Testar integração

ENDPOINTS DA API:
  GET /api/workers/minds              → Lista de minds
  GET /api/workers/minds/:workerId    → Mind específica
  POST /api/workers/minds/:workerId   → Atualizar brain
  GET /api/workers/minds/snapshot     → Snapshot Markdown

INTEGRAÇÃO COM COMMAND CENTER:
  Acesse: http://localhost:3000/dashboard → aba "Mentes"
`);
    return;
  }
  
  if (args.includes('--minds')) {
    console.log('\n🧠 WORKER MINDS:\n');
    const minds = getWorkerMinds();
    minds.forEach(mind => {
      console.log(`🔄 ${mind.mind_id.toUpperCase()} - ${mind.role}`);
      console.log(`   Score: ${mind.apex_score}/10 | Status: ${mind.status}`);
      console.log(`   Task: ${mind.currentTask || 'Nenhuma'}`);
      console.log('');
    });
  } else if (args.includes('--mind')) {
    const workerId = args[args.indexOf('--mind') + 1] || 'ALEX';
    console.log(`\n🧠 MIND: ${workerId.toUpperCase()}\n`);
    const mind = getWorkerMind(workerId);
    console.log(JSON.stringify(mind, null, 2));
  } else if (args.includes('--snapshot')) {
    console.log(getMindsSnapshot());
  } else if (args.includes('--test')) {
    console.log('\n🧪 TESTANDO INTEGRAÇÃO...\n');
    
    const minds = getWorkerMinds();
    console.log(`✅ ${minds.length} minds carregados`);
    
    minds.forEach(mind => {
      console.log(`   ${mind.mind_id}: ${mind.status} - ${mind.role}`);
    });
    
    console.log('\n✅ Integração OK! Ready para Command Center.');
  }
}

// Export
module.exports = {
  getWorkerMinds,
  getWorkerMind,
  updateWorkerBrain,
  getMindsSnapshot,
  MINDS_CONFIG
};

// Run
if (require.main === module) {
  main();
}
