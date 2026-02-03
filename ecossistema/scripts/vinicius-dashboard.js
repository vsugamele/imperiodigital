#!/usr/bin/env node

/**
 * 🎪 WORKER VINÍCIUS - CEO DASHBOARD
 * 
 * Dashboard executivo e auxiliar de decisões
 * para o Império Autônomo.
 * 
 * Usage: node vinicius-dashboard.js [dashboard|report|decisions|kpis]
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
  console.log(`════════════════════════════════════════${RESET}\n`);
}

// Mock data - pode conectar com APIs reais
const workers = [
  { name: 'GARY', status: 'operational', priority: 'maintain', revenue: 'low' },
  { name: 'EUGENE', status: 'operational', priority: 'maintain', revenue: 'low' },
  { name: 'ALEX H', status: 'operational', priority: 'scale', revenue: 'medium' },
  { name: 'TREND', status: 'operational', priority: 'maintain', revenue: 'low' },
  { name: 'YOUTUBE', status: 'operational', priority: 'invest', revenue: 'low' },
  { name: 'JEFF', status: 'operational', priority: 'invest', revenue: 'medium' },
  { name: 'RUSSELL', status: 'operational', priority: 'invest', revenue: 'medium' },
  { name: 'ÉRICO', status: 'pending', priority: 'invest', revenue: 'high' },
  { name: 'VINÍCIUS', status: 'pending', priority: 'oversee', revenue: 'low' }
];

// Financial projections
const financials = {
  currentMRR: 5000,
  targetMRR: 20000,
  currentRunRate: 60000,
  targetRunRate: 240000,
  burnRate: 10000,
  runway: 6, // months
  grossMargin: 0.65,
  netMargin: 0.25
};

// Strategic priorities
const priorities = {
  quarter: 'Q1 2026',
  focusAreas: [
    { area: 'YouTube', investment: 'high', expectedReturn: 'medium' },
    { area: 'Membership', investment: 'medium', expectedReturn: 'high' },
    { area: 'Lançamentos', investment: 'medium', expectedReturn: 'medium' }
  ],
  keyMetrics: {
    workersActive: 9,
    revenueTarget: 20000,
    mrrTarget: 5000,
    growthTarget: 300
  }
};

// Generate dashboard
function generateDashboard() {
  const activeWorkers = workers.filter(w => w.status === 'operational').length;
  const totalWorkers = workers.length;
  
  console.log(`┌─────────────────────────────────────────────────────────┐`);
  console.log(`│                    🏛️ IMPÉRIO AUTÔNOMO                 │`);
  console.log(`│                   Relatório Executivo                  │`);
  console.log(`├─────────────────────────────────────────────────────────┤`);
  console.log(`│                                                         │`);
  console.log(`│  📈 CRESCIMENTO              📊 RECEITA                 │`);
  console.log(`│  Workers: ${activeWorkers}/${totalWorkers} ativos        │  MRR: R$ ${financials.currentMRR.toLocaleString()}            │`);
  console.log(`│  Revenue: R$ 5.000/mês        Run Rate: R$ ${financials.currentRunRate.toLocaleString()}/ano │`);
  console.log(`│  YTD Growth: +150%           Profit: ${(financials.netMargin * 100).toFixed(0)}%               │`);
  console.log(`│                                                         │`);
  console.log(`│  👥 EQUIPE                    🎯 FOCO                    │`);
  console.log(`│  Workers: ${totalWorkers}                       │  Expandir: YouTube          │`);
  console.log(`│  Scripts: 50+                 │  Consolidar: Social Media  │`);
  console.log(`│  Automations: 100+           │  Testar: Crypto            │`);
  console.log(`│                                                         │`);
  console.log(`└─────────────────────────────────────────────────────────┘`);
}

// Worker status table
function showWorkerStatus() {
  console.log(`┌─────────────────────────────────────────────────────────┐`);
  console.log(`│  WORKER          │ STATUS   │ REVENUE │ PRIORITY         │`);
  console.log(`├──────────────────┼──────────┼─────────┼──────────────────┤`);
  
  workers.forEach(w => {
    const statusIcon = w.status === 'operational' ? '✅' : '⏳';
    const priorityIcon = w.priority === 'invest' ? '🟢' : w.priority === 'scale' ? '🟡' : '🔴';
    console.log(`│  ${w.name.padEnd(15)} │ ${statusIcon} ${w.status.padEnd(8)} │ ${priorityIcon} ${w.revenue.padEnd(8)} │ ${w.priority.toUpperCase().padEnd(15)} │`);
  });
  
  console.log(`├──────────────────┼──────────┼─────────┼──────────────────┤`);
  console.log(`│  LEGENDA: 🟢=Investir 🟡=Escalar 🔴=Manter           │`);
  console.log(`└─────────────────────────────────────────────────────────┘`);
}

// Generate KPI report
function generateKPIReport() {
  const kpis = {
    business: [
      { name: 'Revenue Mensal', current: 5000, target: 20000, status: 'warning' },
      { name: 'MRR', current: 1000, target: 5000, status: 'warning' },
      { name: 'Gross Margin', current: 65, target: 70, status: 'good' },
      { name: 'Net Margin', current: 25, target: 40, status: 'warning' },
      { name: 'Burn Rate', current: 10000, target: 15000, status: 'good' },
      { name: 'Runway', current: 6, target: 12, status: 'warning' }
    ],
    operation: [
      { name: 'Workers Ativos', current: 7, target: 9, status: 'good' },
      { name: 'Automations', current: 50, target: 100, status: 'warning' },
      { name: 'Revenue/Worker', current: 714, target: 2222, status: 'warning' },
      { name: 'Uptime Workers', current: 99, target: 99.5, status: 'good' }
    ],
    growth: [
      { name: 'Revenue Growth', current: 150, target: 300, status: 'warning' },
      { name: 'Customer LTV', current: 200, target: 400, status: 'warning' },
      { name: 'CAC', current: 50, target: 40, status: 'good' },
      { name: 'LTV:CAC Ratio', current: 4, target: 8, status: 'warning' }
    ]
  };
  
  console.log(`📊 RELATÓRIO DE KPIs - ${priorities.quarter}\n`);
  
  Object.entries(kpis).forEach(([category, metrics]) => {
    console.log(`${category.toUpperCase()}:`);
    metrics.forEach(kpi => {
      const statusIcon = kpi.status === 'good' ? '✅' : kpi.status === 'warning' ? '⚠️' : '❌';
      console.log(`   ${statusIcon} ${kpi.name}: ${kpi.current} / Meta: ${kpi.target}`);
    });
    console.log('');
  });
}

// Decision helper
function suggestDecisions() {
  console.log(`🎯 DECISÕES RECOMENDADAS\n`);
  
  const decisions = [
    {
      priority: 'ALTA',
      title: 'Investir em YouTube',
      reason: 'Alta demanda, baixo custo de entrada',
      investment: 'R$ 5.000/mês',
      expectedReturn: '+R$ 10.000/mês em 6 meses',
      risk: 'Médio'
    },
    {
      priority: 'ALTA',
      title: 'Contratar editor de vídeo',
      reason: 'Gargalo na produção de conteúdo',
      investment: 'R$ 3.000/mês',
      expectedReturn: '3x mais vídeos',
      risk: 'Baixo'
    },
    {
      priority: 'MÉDIA',
      title: 'Lançar Membership',
      reason: 'Receita recorrente estável',
      investment: 'R$ 2.000 (setup)',
      expectedReturn: 'MRR R$ 5.000 em 6 meses',
      risk: 'Médio'
    },
    {
      priority: 'MÉDIA',
      title: 'Testar tráfego pago',
      reason: 'Escalonar vendas',
      investment: 'R$ 5.000 (testes)',
      expectedReturn: '+50% em conversões',
      risk: 'Alto'
    }
  ];
  
  decisions.forEach(d => {
    const priorityIcon = d.priority === 'ALTA' ? '🔴' : '🟡';
    console.log(`${priorityIcon} [${d.priority}] ${d.title}`);
    console.log(`   Razão: ${d.reason}`);
    console.log(`   Investimento: ${d.investment}`);
    console.log(`   Retorno esperado: ${d.expectedReturn}`);
    console.log(`   Risco: ${d.risk}\n`);
  });
}

// Financial projection
function showFinancialProjection() {
  console.log(`💰 PROJEÇÃO FINANCEIRA\n`);
  
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  const revenue = [5000, 7000, 10000, 14000, 20000, 28000];
  const costs = [8000, 9000, 10000, 12000, 14000, 16000];
  
  console.log(`┌───────┬───────────┬───────────┬────────────┐`);
  console.log(`│ Mês   │ Revenue   │ Costs     │ Profit     │`);
  console.log(`├───────┼───────────┼───────────┼────────────┤`);
  
  revenue.forEach((r, i) => {
    const profit = r - costs[i];
    const profitColor = profit >= 0 ? GREEN : RED;
    console.log(`│ ${months[i]}    │ R$ ${r.toString().padEnd(8)}│ R$ ${costs[i].toString().padEnd(8)}│ ${profitColor} R$ ${profit.toString().padEnd(8)}│`);
  });
  
  console.log(`└───────┴───────────┴───────────┴────────────┘`);
  console.log(`\n📈 Projeção: MRR R$ 28.000 em 6 meses`);
  console.log(`🎯 Meta: R$ 20.000/mês`);
}

// Resource allocation
function showResourceAllocation() {
  const totalBudget = 30000;
  const allocation = [
    { area: 'Growth (Ads + Tráfego)', percent: 40, amount: 12000 },
    { area: 'Team (Contratação)', percent: 30, amount: 9000 },
    { area: 'Tech (Ferramentas)', percent: 15, amount: 4500 },
    { area: 'Content (Produção)', percent: 10, amount: 3000 },
    { area: 'Reserve (Emergência)', percent: 5, amount: 1500 }
  ];
  
  console.log(`📊 ALOCAÇÃO DE RECURSOS - R$ ${totalBudget.toLocaleString()}/mês\n`);
  
  allocation.forEach(a => {
    const bar = '█'.repeat(a.percent / 5) + '░'.repeat(20 - a.percent / 5);
    console.log(`${a.area.padEnd(25)} [${bar}] ${a.percent}%`);
    console.log(`   R$ ${a.amount.toLocaleString()}/mês\n`);
  });
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'dashboard';

switch (command) {
  case 'dashboard':
    logSection('🎪 CEO DASHBOARD');
    generateDashboard();
    console.log('');
    showWorkerStatus();
    break;
    
  case 'kpis':
    generateKPIReport();
    break;
    
  case 'decisions':
    logSection('🎯 DECISÕES ESTRATÉGICAS');
    suggestDecisions();
    break;
    
  case 'financial':
    logSection('💰 PROJEÇÃO FINANCEIRA');
    showFinancialProjection();
    console.log('');
    showResourceAllocation();
    break;
    
  case 'full':
    logSection('🎪 RELATÓRIO EXECUTIVO COMPLETO');
    generateDashboard();
    console.log('');
    showWorkerStatus();
    console.log('');
    generateKPIReport();
    console.log('');
    suggestDecisions();
    console.log('');
    showFinancialProjection();
    console.log('');
    showResourceAllocation();
    break;
    
  case 'help':
  default:
    logSection('🎪 WORKER VINÍCIUS - CEO');
    console.log(`
用法: node vinicius-dashboard.js [comando]

Comandos:
  dashboard  - Visão geral do império
  kpis       - Relatório de KPIs
  decisions  - Decisões recomendadas
  financial  - Projeções financeiras
  full       - Relatório completo

Exemplos:
  node vinicius-dashboard.js dashboard
  node vinicius-dashboard.js full
  node vinicius-dashboard.js kpis

KPIs Monitorados:
  - Revenue, MRR, Margins
  - Workers ativos, Automations
  - Growth, LTV, CAC

Decisões:
  - Investimentos prioritários
  - Alocação de recursos
  - Expansão de nichos
`);
}

module.exports = {
  generateDashboard,
  generateKPIReport,
  suggestDecisions,
  showFinancialProjection,
  showResourceAllocation,
  workers,
  financials,
  priorities
};
