#!/usr/bin/env node

/**
 * 🎛️ WORKER GARY - ORCHESTRATOR
 * 
 * Orquestra o ciclo diário completo:
 * - Coleta métricas (08:00)
 * - Checkpoint (14:00)
 * - Reflection Journal (20:00)
 * 
 * Usage: node gary-orchestrator.js [morning|afternoon|evening]
 */

const { collectMetrics } = require('./worker-gary-metrics');
const { generateReflectionJournal } = require('./worker-gary-reflection');
const { execSync } = require('child_process');

// Config
const LOG_FILE = './logs/gary-orchestrator.log';

// Simple logger
function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);
  
  // Ensure logs directory exists
  const fs = require('fs');
  const path = require('path');
  const logsDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  fs.appendFileSync(LOG_FILE, line + '\n');
}

async function runMorningRoutine() {
  log('🌅 === ROTINA MANHÃ (08:00) ===');
  
  try {
    // 1. Coleta métricas da noite
    const metrics = await collectMetrics();
    
    // 2. Verifica anomalias
    checkAnomalies(metrics);
    
    // 3. Reporta para orquestrador
    await reportToOrchestrator('morning', metrics);
    
    log('✅ Rotina manhã concluída');
  } catch (error) {
    log(`❌ Erro na rotina manhã: ${error.message}`);
  }
}

async function runAfternoonRoutine() {
  log('📊 === ROTINA TARDE (14:00) ===');
  
  try {
    // 1. Coleta métricas atualizadas
    const metrics = await collectMetrics();
    
    // 2. Verifica progresso
    checkProgress(metrics);
    
    // 3. Ajustes necessários?
    const adjustments = needAdjustments(metrics);
    if (adjustments.length > 0) {
      log('⚠️ Ajustes necessários:');
      adjustments.forEach(a => log(`   - ${a}`));
    }
    
    // 4. Reporta
    await reportToOrchestrator('afternoon', metrics);
    
    log('✅ Rotina tarde concluída');
  } catch (error) {
    log(`❌ Erro na rotina tarde: ${error.message}`);
  }
}

async function runEveningRoutine() {
  log('🌙 === ROTINA NOITE (20:00) ===');
  
  try {
    // 1. Coleta métricas finais
    const metrics = await collectMetrics();
    
    // 2. Gera Reflection Journal
    const journal = await generateReflectionJournal();
    
    // 3. Salva aprendizados
    saveLearnings(metrics);
    
    // 4. Reporta para CEO
    await reportToCEO(metrics);
    
    // 5. Agenda próxima execução
    scheduleNext();
    
    log('✅ Rotina noite concluída');
  } catch (error) {
    log(`❌ Erro na rotina noite: ${error.message}`);
  }
}

function checkAnomalies(metrics) {
  const anomalies = [];
  
  // Engagement muito baixo
  if (metrics.summary.avgEngagement < 2) {
    anomalies.push('Engagement crítico (<2%)');
  }
  
  // Posts abaixo da meta
  if (metrics.summary.totalPostsToday < 2) {
    anomalies.push('Posts insuficientes (<2)');
  }
  
  // Perfil sem crescimento
  const stalledProfiles = metrics.profiles.filter(p => 
    !p.error && (p.growth || 0) < 0.5
  );
  if (stalledProfiles.length > metrics.profiles.length / 2) {
    anomalies.push('Maioria dos perfis estagnados');
  }
  
  if (anomalies.length > 0) {
    log('⚠️ ANOMALIAS DETECTADAS:');
    anomalies.forEach(a => log(`   - ${a}`));
    sendAlerts(anomalies);
  }
}

function checkProgress(metrics) {
  const postsPerHour = metrics.summary.totalPostsToday / 14; // 14h desde manhã
  const projectedPosts = postsPerHour * 24;
  
  if (projectedPosts < 4) {
    log(`⚠️ Projeção: ${projectedPosts.toFixed(1)} posts hoje (meta: 4+)`);
  }
}

function needAdjustments(metrics) {
  const adjustments = [];
  
  if (metrics.summary.avgEngagement < 3) {
    adjustments.push('Aumentar interação nos Stories');
  }
  
  if (metrics.summary.totalPostsToday < 3) {
    adjustments.push('Agendar mais posts para noite');
  }
  
  return adjustments;
}

async function reportToOrchestrator(time, metrics) {
  // TODO: Implementar integração real com OpenClaw
  const report = {
    worker: 'GARY',
    time,
    timestamp: new Date().toISOString(),
    metrics: {
      totalFollowers: metrics.summary.totalFollowers,
      postsToday: metrics.summary.totalPostsToday,
      engagement: metrics.summary.avgEngagement,
      topPerformer: metrics.summary.topPerformer
    }
  };
  
  log(`📡 Reportado: ${JSON.stringify(report.metrics)}`);
  
  // Simulate sending to main orchestrator
  console.log('   📤 Enviando para orquestrador central...\n');
}

async function reportToCEO(metrics) {
  // Gera summary para o CEO
  const summary = `
🎯 **DAILY REPORT - GARY**

📊 **Métricas do Dia**
- Seguidores: ${metrics.summary.totalFollowers.toLocaleString()}
- Posts: ${metrics.summary.totalPostsToday}
- Engagement: ${metrics.summary.avgEngagement.toFixed(2)}%
- Top: ${metrics.summary.topPerformer || 'N/A'}

${metrics.summary.avgEngagement >= 3 ? '✅ Engagement bom' : '⚠️ Engagement precisa melhorar'}

📅 Amanhã focar em: ${metrics.summary.topPerformer || 'conteúdo de qualidade'}
`;
  
  log('📤 Reporte para CEO gerado');
  console.log(summary);
  
  // TODO: Enviar para Telegram do Vinícius
}

function saveLearnings(metrics) {
  // TODO: Salvar aprendizados no insights/
  log('💾 Aprendizados salvos');
}

function scheduleNext() {
  const nextRun = new Date();
  nextRun.setDate(nextRun.getDate() + 1);
  nextRun.setHours(8, 0, 0, 0);
  
  log(`📅 Próxima execução: ${nextRun.toISOString()}`);
  log(`   crontab: 0 8 * * * node gary-orchestrator.js morning`);
}

async function runFullCycle() {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 10) {
    await runMorningRoutine();
  } else if (hour >= 12 && hour < 16) {
    await runAfternoonRoutine();
  } else if (hour >= 18 && hour < 22) {
    await runEveningRoutine();
  } else {
    log('⏰ Fora do horário de execução programada');
  }
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'cycle';

switch (command) {
  case 'morning':
    runMorningRoutine();
    break;
  case 'afternoon':
    runAfternoonRoutine();
    break;
  case 'evening':
    runEveningRoutine();
    break;
  case 'cycle':
  default:
    runFullCycle();
    break;
  case 'metrics':
    collectMetrics().then(m => {
      console.log('\n📊 Métricas:', JSON.stringify(m.summary, null, 2));
    });
    break;
  case 'reflection':
    generateReflectionJournal();
    break;
  case 'test':
    // Teste rápido
    collectMetrics().then(m => {
      console.log('\n✅ Coleta funcionando!');
      console.log(`   ${m.summary.totalFollowers.toLocaleString()} seguidores`);
      console.log(`   ${m.summary.avgEngagement.toFixed(2)}% engagement`);
    });
    break;
}

module.exports = { 
  runMorningRoutine, 
  runAfternoonRoutine, 
  runEveningRoutine,
  runFullCycle,
  collectMetrics,
  generateReflectionJournal
};
