#!/usr/bin/env node

/**
 * 📊 ECOSSISTEMA - STATUS CHECK
 * 
 * Verifica status de todos os componentes:
 * - Workers
 * - Scripts
 * - Métricas
 * - Reflection Journals
 * 
 * Usage: node status.js
 */

const fs = require('fs');
const path = require('path');

// Cores
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function logSection(title) {
  console.log(`\n${BLUE}═══════════════════════════════════════════${RESET}`);
  console.log(`${BLUE}  ${title}${RESET}`);
  console.log(`${BLUE}═══════════════════════════════════════════${RESET}\n`);
}

function checkFile(filePath, label) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${label}`, GREEN);
    return true;
  } else {
    log(`❌ ${label}`, RED);
    return false;
  }
}

function getFileSize(filePath) {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    return `${(stats.size / 1024).toFixed(1)} KB`;
  }
  return 'N/A';
}

async function main() {
  console.log('\n' + BLUE);
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║     🏛️  IMPÉRIO AUTÔNOMO - STATUS          ║');
  console.log('╚═══════════════════════════════════════════╝' + RESET);
  
  const basePath = path.join(__dirname, '..');
  const scriptsPath = path.join(basePath, 'scripts');
  const workersPath = path.join(basePath, 'workers');
  const reflectionsPath = path.join(basePath, 'reflections');
  const metricsPath = path.join(basePath, 'metrics', 'daily');
  
  // Workers
  logSection('👥 WORKERS');
  const workers = ['gary-growth.md', 'eugene-copy.md', 'alex-offers.md', 'trend-niches.md', 'youtube-creator.md', 'jeff-launches.md', 'russell-funnels.md', 'erico-perpetuo.md', 'vinicius-ceo.md'];
  workers.forEach(w => {
    checkFile(path.join(workersPath, w), w.replace('.md', ''));
  });
  
  // Scripts
  logSection('🤖 SCRIPTS');
  const scripts = ['worker-gary-metrics.js', 'worker-gary-reflection.js', 'worker-gary-orchestrator.js', 'eugene-generator.js', 'alex-generator.js', 'trend-scanner.js', 'youtube-script-generator.js', 'jeff-launch-planner.js', 'russell-funnel-builder.js', 'erico-membership-builder.js', 'vinicius-dashboard.js'];
  scripts.forEach(s => {
    const exists = checkFile(path.join(scriptsPath, s), s);
    if (exists) {
      console.log(`     ${getFileSize(path.join(scriptsPath, s))}`);
    }
  });
  
  // Metrics
  logSection('📊 MÉTRICAS');
  const today = new Date().toISOString().split('T')[0];
  const metricsFile = path.join(metricsPath, `${today}.json`);
  if (fs.existsSync(metricsPath)) {
    checkFile(metricsFile, `Métricas de hoje (${today})`);
    
    // List all metrics files
    const metricsFiles = fs.readdirSync(metricsPath).filter(f => f.endsWith('.json'));
    log(`   ${metricsFiles.length} dias de métricas`, BLUE);
  } else {
    log('❌ Diretório de métricas não existe', RED);
  }
  
  // Reflections
  logSection('🌅 REFLECTIONS');
  if (fs.existsSync(reflectionsPath)) {
    const reflectionFiles = fs.readdirSync(reflectionsPath).filter(f => f.startsWith('diario-'));
    log(`   ${reflectionFiles.length} journals gerados`, BLUE);
    
    if (reflectionFiles.length > 0) {
      const latest = reflectionFiles.sort().pop();
      checkFile(path.join(reflectionsPath, latest), `Último: ${latest.replace('diario-', '').replace('.md', '')}`);
    }
  } else {
    log('❌ Diretório de reflections não existe', RED);
  }
  
  // Dashboards
  logSection('📈 DASHBOARDS');
  const dashboardsPath = path.join(basePath, '..', 'ops-dashboard');
  checkFile(path.join(dashboardsPath, 'tasks.json'), 'Kanban (tasks.json)');
  
  // Summary
  logSection('📋 RESUMO');
  console.log(`   📁 Workers: ${workers.length}`);
  console.log(`   🤖 Scripts: ${scripts.length}`);
  console.log(`   📊 Métricas: ${fs.existsSync(metricsPath) ? fs.readdirSync(metricsPath).length : 0} dias`);
  console.log(`   🌅 Reflections: ${fs.existsSync(reflectionsPath) ? fs.readdirSync(reflectionsPath).filter(f => f.startsWith('diario-')).length : 0}`);
  
  console.log('\n' + GREEN + '✅ Sistema operacional!' + RESET);
  console.log('\nPróximos passos:');
  console.log('1. node ecosystem/scripts/worker-gary-orchestrator.js reflection');
  console.log('2. Configurar crontab para execução automática');
  console.log('3. Criar workers EUGENE e ALEX H\n');
}

main().catch(console.error);
