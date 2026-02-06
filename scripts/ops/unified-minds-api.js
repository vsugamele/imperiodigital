/**
 * 🌐 UNIFIED MINDS API - Workers + Gurus + Minds
 * 
 * API unificada para o Command Center com todos os agents:
 * - Workers (Alex, Gary, Eugene, Hormozi)
 * - Gurus (Halbert, Makepeace, Sugarman, Carlton, Kennedy, Bencivenga, Fascinations, Yoshitani)
 */

const { createMonitor: createWorkerMonitor } = require('./worker-brain-monitor');
const { getAllGurus, getGuru, generateWithGuru, getGurusSnapshot } = require('./guru-minds-api');

// ==================== CONFIGURAÇÃO ====================

const UNIFIED_CONFIG = {
  sections: {
    workers: {
      name: '🤖 Workers',
      description: 'Agentes de automação do ecossistema',
      icon: '🤖'
    },
    gurus: {
      name: '🎓 Gurus',
      description: 'Mestres de copywriting lendários',
      icon: '🎓'
    },
    team: {
      name: '👥 Team',
      description: 'Membros humanos do time',
      icon: '👥'
    }
  }
};

// ==================== FUNÇÕES ====================

/**
 * Obter todos os minds (workers + gurus)
 */
function getAllMinds() {
  const monitor = createWorkerMonitor();
  const workerStatus = monitor.getAllWorkersStatus();
  
  const minds = {
    workers: [],
    gurus: [],
    team: []
  };
  
  // Workers
  for (const [workerId, workerData] of Object.entries(workerStatus.workers)) {
    minds.workers.push({
      id: workerId.toLowerCase(),
      name: workerData.name,
      role: workerData.role,
      type: 'worker',
      status: workerData.status,
      currentTask: workerData.currentTask,
      lastActivity: workerData.lastActivity,
      brainSize: workerData.brainSize,
      metrics: workerData.metrics
    });
  }
  
  // Gurus
  const gurus = getAllGurus();
  for (const guru of gurus) {
    minds.gurus.push({
      id: guru.id.toLowerCase(),
      name: guru.name,
      role: guru.role,
      type: 'guru',
      status: guru.status,
      apexScore: guru.apex_score,
      topSkill: guru.top_skill,
      signatureTechnique: guru.signature_technique,
      famousQuote: guru.famous_quote
    });
  }
  
  return minds;
}

/**
 * Obter mind específica (worker ou guru)
 */
function getMind(id) {
  const idUpper = id.toUpperCase();
  
  // Verificar workers
  const workers = {
    'ALEX': { name: 'Alex', role: 'Autopilot & Orchestrator' },
    'GARY': { name: 'Gary', role: 'Growth & Conteúdo' },
    'EUGENE': { name: 'Eugene', role: 'Copy & Headlines' },
    'HORMOZI': { name: 'Hormozi', role: 'Offers & Vendas' }
  };
  
  if (workers[idUpper]) {
    const monitor = createWorkerMonitor();
    const brain = monitor.getWorkerBrain(idUpper);
    return {
      id: idUpper,
      type: 'worker',
      ...workers[idUpper],
      status: brain.status,
      currentTask: brain.currentTask,
      brain: brain.brain,
      metrics: brain.metrics,
      lastActivity: brain.lastActivity
    };
  }
  
  // Verificar gurus
  const guru = getGuru(idUpper);
  if (!guru.error) {
    return {
      id: idUpper,
      type: 'guru',
      ...guru
    };
  }
  
  return { error: 'Mind not found' };
}

/**
 * Gerar copy usando guru
 */
function useGuruForCopy(guruId, copyType, inputs) {
  const guru = getGuru(guruId);
  
  if (guru.error) {
    return guru;
  }
  
  const prompts = {
    HALBERT: {
      style: 'Curiosity Gap',
      focus: 'ROI e resultados',
      technique: 'Halbert Push'
    },
    MAKEPEACE: {
      style: 'Emoção → Lógica',
      focus: 'Urgência e medo de perda',
      technique: 'Emotional Push'
    },
    SUGARMAN: {
      style: 'Stream of Consciousness',
      focus: 'One Thing, Blue Ocean',
      technique: 'VHS Effect'
    },
    CARLTON: {
      style: 'Confronto Direto',
      focus: 'WIIFM, Honestidade',
      technique: 'Bullseye Copy'
    },
    KENNEDY: {
      style: 'Direct Response',
      focus: 'Autoridade, 3 Ms',
      technique: 'Neurológica'
    },
    BENCIVENGA: {
      style: 'Prova Lógica',
      focus: 'Mecanismos, Dados',
      technique: 'Logical Proof'
    },
    FASCINATIONS: {
      style: 'Microcopy',
      focus: 'Fascinations, Hooks',
      technique: '21 Fascinations'
    },
    YOSHITANI: {
      style: 'Data-Driven',
      focus: 'Métricas, Analytics',
      technique: 'Creative Telemetry'
    }
  };
  
  const promptConfig = prompts[guruId.toUpperCase()] || prompts.KENNEDY;
  
  return {
    success: true,
    guru: {
      id: guruId.toUpperCase(),
      name: guru.name,
      role: guru.role
    },
    copyType,
    style: promptConfig.style,
    focus: promptConfig.focus,
    technique: promptConfig.technique,
    famousQuote: guru.famous_quote,
    signatureTechnique: guru.signature_technique,
    prompt: generateWithGuru(guruId, copyType, inputs)
  };
}

/**
 * Obter minds por status
 */
function getMindsByStatus(status = 'all') {
  const minds = getAllMinds();
  const result = {
    workers: {
      online: minds.workers.filter(w => w.status === 'working'),
      idle: minds.workers.filter(w => w.status === 'idle'),
      error: minds.workers.filter(w => w.status === 'error')
    },
    gurus: {
      available: minds.gurus,
      total: minds.gurus.length
    }
  };
  
  return result;
}

/**
 * Snapshot unificado
 */
function getUnifiedSnapshot() {
  const minds = getAllMinds();
  
  const onlineWorkers = minds.workers.filter(w => w.status === 'working').length;
  const totalWorkers = minds.workers.length;
  const totalGurus = minds.gurus.length;
  
  let snapshot = `
🧠 **ECOSSYSTEM MINDS - UNIFIED SNAPSHOT**
📅 ${new Date().toLocaleString('pt-BR')}

---

**📊 STATUS GERAL**
- Workers Online: ${onlineWorkers}/${totalWorkers}
- Workers Idle: ${totalWorkers - onlineWorkers}
- Gurus Available: ${totalGurus}
- Total Minds: ${totalWorkers + totalGurus}

---

🤖 **WORKERS** (${totalWorkers})
`;
  
  for (const worker of minds.workers) {
    const statusEmoji = worker.status === 'working' ? '🔄' : worker.status === 'error' ? '❌' : '💤';
    
    snapshot += `
${statusEmoji} **${worker.name}** - ${worker.role}
   📌 Status: ${worker.status}
   🎯 Task: ${worker.currentTask || 'Nenhuma'}
`;
    
    if (worker.metrics) {
      if (worker.metrics.postsToday !== undefined) {
        snapshot += `   📈 Posts: ${worker.metrics.postsToday}\n`;
      }
      if (worker.metrics.copiesToday !== undefined) {
        snapshot += `   ✍️ Copies: ${worker.metrics.copiesToday}\n`;
      }
      if (worker.metrics.tasksCompleted !== undefined) {
        snapshot += `   ✅ Tasks: ${worker.metrics.tasksCompleted}\n`;
      }
    }
  }
  
  snapshot += `
---

🎓 **GURUS** (${totalGurus})
`;
  
  for (const guru of minds.gurus) {
    snapshot += `
👤 **${guru.name}** - ${guru.role}
   🏆 Score: ${guru.apexScore}/10
   🎯 Skill: ${guru.topSkill}
   ✨ ${guru.signatureTechnique.split(' - ')[0]}
`;
  }
  
  snapshot += `
---

*🤖 Generated by Unified Minds API*
`;
  
  return snapshot;
}

/**
 * Obter suggestions para tipo de copy
 */
function getSuggestionsForCopyType(copyType) {
  const suggestions = {
    headline: {
      gurus: ['CARLTON', 'KENNEDY', 'FASCINATIONS'],
      reason: 'Headlines diretas, authority e hooks curtos'
    },
    email: {
      gurus: ['HALBERT', 'MAKEPEACE', 'SUGARMAN'],
      reason: 'Curiosity, emoção e fluxo natural'
    },
    salesletter: {
      gurus: ['KENNEDY', 'BENCIVENGA', 'CARLTON'],
      reason: 'Prova lógica, autoridade e confronto'
    },
    vsl: {
      gurus: ['SUGARMAN', 'MAKEPEACE', 'KENNEDY'],
      reason: 'Stream of consciousness, emoção e neurológica'
    },
    social: {
      gurus: ['FASCINATIONS', 'CARLTON', 'MAKEPEACE'],
      reason: 'Fascinations, direto e urgência'
    },
    offer: {
      gurus: ['KENNEDY', 'HORMOZI', 'BENCIVENGA'],
      reason: 'Authority, pricing e prova lógica'
    }
  };
  
  return suggestions[copyType.toLowerCase()] || suggestions.headline;
}

// ==================== CLI ====================

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
🧠 UNIFIED MINDS API
====================

Workers + Gurus + Team no Command Center

USO:
  node unified-minds-api.js --all        Todos os minds
  node unified-minds-api.js --mind [ID] Mind específica
  node unified-minds-api.js --workers   Só workers
  node unified-minds-api.js --gurus     Só gurus
  node unified-minds-api.js --suggest [TIPO] Sugestões por tipo
  node unified-minds-api.js --generate [GURU] Gerar copy
  node unified-minds-api.js --snapshot  Snapshot completo

TIPOS DE COPY:
  headline, email, salesletter, vsl, social, offer

EXEMPLOS:
  node unified-minds-api.js --all
  node unified-minds-api.js --mind kennedy
  node unified-minds-api.js --suggest headline
  node unified-minds-api.js --generate carlton
  node unified-minds-api.js --snapshot
`);
    return;
  }
  
  if (args.includes('--all')) {
    console.log('\n🧠 TODOS OS MINDS:\n');
    const minds = getAllMinds();
    console.log('🤖 WORKERS:', minds.workers.length);
    console.log('🎓 GURUS:', minds.gurus.length);
    console.log('\nWorkers:', JSON.stringify(minds.workers.map(w => ({ id: w.id, name: w.name, status: w.status })), null, 2));
    console.log('\nGurus:', JSON.stringify(minds.gurus.map(g => ({ id: g.id, name: g.name, role: g.role })), null, 2));
  } else if (args.includes('--workers')) {
    console.log('\n🤖 WORKERS:\n');
    const minds = getAllMinds();
    minds.workers.forEach(w => {
      console.log(`🔄 ${w.name} - ${w.role} [${w.status}]`);
    });
  } else if (args.includes('--gurus')) {
    console.log('\n🎓 GURUS:\n');
    const minds = getAllMinds();
    minds.gurus.forEach(g => {
      console.log(`👤 ${g.name} - ${g.role} [${g.apexScore}/10]`);
    });
  } else if (args.includes('--mind')) {
    const id = args[args.indexOf('--mind') + 1] || 'kennedy';
    console.log(`\n🧠 MIND: ${id.toUpperCase()}\n`);
    const mind = getMind(id);
    console.log(JSON.stringify(mind, null, 2));
  } else if (args.includes('--suggest')) {
    const type = args[args.indexOf('--suggest') + 1] || 'headline';
    console.log(`\n💡 SUGESTÕES PARA: ${type.toUpperCase()}\n`);
    const suggestion = getSuggestionsForCopyType(type);
    console.log('Gurus recomendados:', suggestion.gurus.join(', '));
    console.log('Motivo:', suggestion.reason);
  } else if (args.includes('--generate')) {
    const guru = args[args.indexOf('--generate') + 1] || 'kennedy';
    console.log(`\n🎨 USANDO GURU: ${guru.toUpperCase()}\n`);
    const result = useGuruForCopy(guru, 'headline', {});
    console.log('Style:', result.style);
    console.log('Focus:', result.focus);
    console.log('Technique:', result.technique);
  } else if (args.includes('--snapshot')) {
    console.log(getUnifiedSnapshot());
  }
}

// Export
module.exports = {
  getAllMinds,
  getMind,
  useGuruForCopy,
  getMindsByStatus,
  getUnifiedSnapshot,
  getSuggestionsForCopyType
};

// Run
if (require.main === module) {
  main();
}
