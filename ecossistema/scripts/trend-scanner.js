#!/usr/bin/env node

/**
 * 🔮 WORKER TREND - SCANNER DE TENDÊNCIAS & NICHOS
 * 
 * Identifica nichos lucrativos e tendências emergentes
 * usando múltiplas fontes de dados.
 * 
 * Usage: node trend-scanner.js [scan|validate|report|alerts]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

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

// Directories
const TRENDS_DIR = path.join(__dirname, '../insights/trends');
const NICHOS_DIR = path.join(__dirname, '../insights/niches');
const ALERTS_FILE = path.join(__dirname, '../insights/alerts.json');

// Niches to monitor (configurável)
const NICHOS_MONITOR = [
  { name: 'educacao-financeira', keywords: ['investir, economia, renda extra'] },
  { name: 'saude-bem-estar', keywords: ['emagrecimento, fitness, suplementos'] },
  { name: 'pets', keywords: ['racao, animais, pet shop'] },
  { name: 'tecnologia', keywords: ['celular, gadget, software'] },
  { name: 'casa-decoracao', keywords: ['moveis, decoracao, reforma'] },
  { name: 'moda-estilo', keywords: ['roupas, acessorios, estilo'] },
  { name: 'games', keywords: ['jogos, gaming, e-sports'] },
  { name: 'crypto', keywords: ['bitcoin, ethereum, crypto'] },
  { name: 'entrepreneurship', keywords: ['negocios, franquias, marketing'] },
  { name: 'beauty', keywords: ['beleza, maquiagem, skincare'] }
];

// Simulated trend data (mock for development)
function getMockTrends() {
  return [
    {
      name: 'Café especial',
      growth: 340,
      category: 'Alimentos',
      opportunity: 85,
      sources: ['Google Trends', 'TikTok', 'Instagram'],
      monetizacao: 'Alta',
      competitors: 5
    },
    {
      name: 'Pets',
      growth: 210,
      category: 'Animais',
      opportunity: 78,
      sources: ['Amazon', 'Shopify'],
      monetizacao: 'Alta',
      competitors: 12
    },
    {
      name: 'Educação Financeira',
      growth: 180,
      category: 'Finanças',
      opportunity: 72,
      sources: ['YouTube', 'Instagram'],
      monetizacao: 'Alta',
      competitors: 25
    },
    {
      name: 'Suplementos Naturais',
      growth: 156,
      category: 'Saúde',
      opportunity: 68,
      sources: ['Google Trends'],
      monetizacao: 'Média',
      competitors: 18
    },
    {
      name: 'Gadgets para Home Office',
      growth: 145,
      category: 'Tecnologia',
      opportunity: 65,
      sources: ['Amazon'],
      monetizacao: 'Média',
      competitors: 30
    },
    {
      name: 'Skincare Masculino',
      growth: 120,
      category: 'Beleza',
      opportunity: 62,
      sources: ['TikTok'],
      monetizacao: 'Alta',
      competitors: 8
    },
    {
      name: 'Pet Insurance',
      growth: 98,
      category: 'Pets',
      opportunity: 58,
      sources: ['Google Trends'],
      monetizacao: 'Alta',
      competitors: 3
    },
    {
      name: 'Móveis Sustentáveis',
      growth: 87,
      category: 'Casa',
      opportunity: 55,
      sources: ['Pinterest'],
      monetizacao: 'Média',
      competitors: 6
    }
  ];
}

// Score calculator
function calculateOpportunityScore(data) {
  const { growth, competitors, monetizacao, volume } = data;
  
  let score = 0;
  
  // Growth (30%)
  if (growth > 200) score += 30;
  else if (growth > 100) score += 20;
  else if (growth > 50) score += 10;
  
  // Competition (20%)
  if (competitors < 5) score += 20;
  else if (competitors < 15) score += 15;
  else if (competitors < 30) score += 10;
  
  // Monetization (25%)
  const monoMap = { 'Alta': 25, 'Média': 15, 'Baixa': 5 };
  score += monoMap[monetizacao] || 10;
  
  // Volume (15%)
  const volMap = { 'Alto': 15, 'Médio': 10, 'Baixo': 5 };
  score += volMap[volume] || 5;
  
  // Timing (10%)
  score += 10; // Assume oportunidade identificada
  
  return Math.min(100, score);
}

// Validate a niche
function validateNicho(nicho) {
  const mockData = {
    growth: Math.floor(Math.random() * 300) + 50,
    competitors: Math.floor(Math.random() * 40) + 1,
    monetizacao: ['Alta', 'Média', 'Baixa'][Math.floor(Math.random() * 3)],
    volume: ['Alto', 'Médio', 'Baixo'][Math.floor(Math.random() * 3)]
  };
  
  const score = calculateOpportunityScore(mockData);
  
  return {
    nicho,
    score,
    ...mockData,
    recommendation: score > 70 ? 'ENTRAR JÁ' : score > 50 ? 'TESTAR' : 'AGUARDAR',
    gap: findGap(nicho, mockData)
  };
}

// Find market gap
function findGap(nicho, data) {
  const gaps = [
    'Falta conteúdo em português de qualidade',
    'Preços muito altos no mercado',
    'Produtos importados não disponíveis',
    'Falta personalização',
    'Atendimento ruim dos concorrentes',
    'Não existe solução completa'
  ];
  
  return gaps[Math.floor(Math.random() * gaps.length)];
}

// Scan all trends
async function scanTrends() {
  log('🔮 SCANNANDO TENDÊNCIAS...');
  
  const trends = getMockTrends();
  const scored = trends.map(t => ({
    ...t,
    score: calculateOpportunityScore(t)
  })).sort((a, b) => b.score - a.score);
  
  // Save to file
  const today = new Date().toISOString().split('T')[0];
  const outputFile = path.join(TRENDS_DIR, `trends-${today}.json`);
  
  if (!fs.existsSync(TRENDS_DIR)) {
    fs.mkdirSync(TRENDS_DIR, { recursive: true });
  }
  
  fs.writeFileSync(outputFile, JSON.stringify({
    date: today,
    trends: scored,
    generatedAt: new Date().toISOString()
  }, null, 2));
  
  return scored;
}

// Validate all niches
function validateAllNiches() {
  log('📊 VALIDANDO NICHOS...');
  
  const validations = NICHOS_MONITOR.map(n => validateNicho(n.name));
  const scored = validations.sort((a, b) => b.score - a.score);
  
  return scored;
}

// Generate report
async function generateReport() {
  logSection('📊 RELATÓRIO DE TENDÊNCIAS');
  
  const trends = await scanTrends();
  const niches = validateAllNiches();
  
  console.log('🔥 TOP 5 TENDÊNCIAS:\n');
  trends.slice(0, 5).forEach((t, i) => {
    const emoji = t.score > 70 ? '🟢' : t.score > 50 ? '🟡' : '🔴';
    console.log(`${emoji} ${i + 1}. ${t.name}`);
    console.log(`   Crescimento: +${t.growth}%`);
    console.log(`   Score: ${t.score}/100`);
    console.log(`   Monetização: ${t.monetizacao}`);
    console.log(`   Concorrentes: ${t.competitors}\n`);
  });
  
  console.log('📈 TOP 5 NICHOS:\n');
  niches.slice(0, 5).forEach((n, i) => {
    const emoji = n.recommendation === 'ENTRAR JÁ' ? '🚀' : n.recommendation === 'TESTAR' ? '⚡' : '⏳';
    console.log(`${emoji} ${i + 1}. ${n.nicho}`);
    console.log(`   Score: ${n.score}/100`);
    console.log(`   Recomendação: ${n.recommendation}`);
    console.log(`   Gap: ${n.gap}\n`);
  });
  
  console.log('🎯 RECOMENDAÇÕES:\n');
  
  const topTrend = trends[0];
  const topNicho = niches[0];
  
  console.log(`🚀 ENTRAR JÁ:`);
  console.log(`   Tendência: ${topTrend.name} (Score: ${topTrend.score})`);
  console.log(`   Nicho: ${topNicho.nicho} (Score: ${topNicho.score})\n`);
  
  console.log(`⚡ TESTAR:`);
  trends.slice(1, 3).forEach(t => console.log(`   - ${t.name}`));
  niches.slice(1, 3).forEach(n => console.log(`   - ${n.nicho}`));
  
  console.log(`\n⏳ AGUARDAR:`);
  trends.filter(t => t.score < 50).forEach(t => console.log(`   - ${t.name}`));
}

// Check alerts
function checkAlerts() {
  logSection('🚨 ALERTAS DE OPORTUNIDADE');
  
  const trends = getMockTrends().filter(t => t.score > 70);
  
  if (trends.length > 0) {
    console.log(`⚠️ ${trends.length} oportunidades quentes identificadas!\n`);
    
    trends.forEach(t => {
      console.log(`🚨 ${t.name}`);
      console.log(`   Crescimento: +${t.growth}%`);
      console.log(`   Score: ${t.score}/100`);
      console.log(`   Ação: ENTRAR JÁ\n`);
    });
  } else {
    console.log('✅ Nenhum alerta crítico no momento.\n');
  }
}

// Save alert
function saveAlert(trend) {
  const alerts = fs.existsSync(ALERTS_FILE) 
    ? JSON.parse(fs.readFileSync(ALERTS_FILE)) 
    : [];
  
  alerts.push({
    ...trend,
    timestamp: new Date().toISOString()
  });
  
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2));
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'help';

switch (command) {
  case 'scan':
    scanTrends().then(trends => {
      console.log(`\n✅ ${trends.length} tendências scaneadas`);
      console.log(`📁 Salvo em: insights/trends/trends-${new Date().toISOString().split('T')[0]}.json`);
    });
    break;
    
  case 'validate':
    logSection('📊 VALIDAÇÃO DE NICHOS');
    const niches = validateAllNiches();
    niches.forEach((n, i) => {
      const emoji = n.score > 70 ? '🚀' : n.score > 50 ? '⚡' : '⏳';
      console.log(`${emoji} ${i + 1}. ${n.nicho} - Score: ${n.score}/100 - ${n.recommendation}`);
    });
    break;
    
  case 'report':
    generateReport();
    break;
    
  case 'alerts':
    checkAlerts();
    break;
    
  case 'full':
    logSection('🔮 SCAN COMPLETO DE TENDÊNCIAS');
    scanTrends();
    validateAllNiches();
    checkAlerts();
    generateReport();
    break;
    
  case 'help':
  default:
    logSection('🔮 WORKER TREND');
    console.log(`
用法: node trend-scanner.js [comando]

Comandos:
  scan      - Scannar tendências do dia
  validate  - Validar nichos monitorados
  report    - Gerar relatório completo
  alerts    - Ver alertas de oportunidade
  full      - Executar tudo

Exemplos:
  node trend-scanner.js scan
  node trend-scanner.js full

Nichos monitorados: ${NICHOS_MONITOR.length}
${NICHOS_MONITOR.map(n => `  - ${n.name}`).join('\n  ')}
`);
}

module.exports = {
  scanTrends,
  validateNicho,
  validateAllNiches,
  calculateOpportunityScore,
  getMockTrends
};
