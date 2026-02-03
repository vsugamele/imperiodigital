#!/usr/bin/env node

/**
 * 🔄 WORKER ÉRICO - MEMBERSHIP & PERPÉTUO
 * 
 * Cria e otimiza modelos de receita recorrente
 * e produtos perpétuos.
 * 
 * Usage: node erico-membership-builder.js [build|metrics|retention]
 */

const fs = require('fs');
const path = require('path');

// Colors
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function log(message) {
  console.log(`${BLUE}[${new Date().toISOString()}]${RESET} ${message}`);
}

function logSection(title) {
  console.log(`\n${GREEN}═══════════════════════════════════════${RESET}`);
  console.log(`${GREEN}  ${title}${RESET}`);
  console.log(`════════════════════════════════════════${RESET}\n`);
}

// Membership Tiers
const tierStructure = {
  1: { name: 'GRÁTIS', price: 0, objective: 'Capturar leads' },
  2: { name: 'COMUNIDADE', price: 47, objective: 'Primeiras vendas' },
  3: { name: 'MENTORIA', price: 297, objective: 'Vendas recorrentes' },
  4: { name: 'VIP', price: 997, objective: 'Alta receita' }
};

// Generate Membership
function generateMembership(params) {
  const { name, type, content, cadence } = params;
  
  const tiers = Object.entries(tierStructure).map(([id, t]) => ({
    id: parseInt(id),
    ...t,
    features: getTierFeatures(parseInt(id)),
    cta: getTierCTA(parseInt(id))
  }));
  
  const calendar = generateCalendar(cadence || 'weekly');
  
  return {
    name,
    type,
    tiers,
    calendar,
    metrics: calculateMRR(tiers),
    contentStrategy: content || 'Newsletter + Calls + Desafios'
  };
}

function getTierFeatures(tier) {
  const features = {
    1: ['Newsletter diária', 'Posts básicos', 'Acesso ao blog'],
    2: ['Grupo fechado', 'Calls mensais', 'Conteúdo exclusivo', 'Suporte via Telegram'],
    3: ['Mentoria em grupo', 'Todas as calls', 'Playbooks', 'Feedback nos trabalhos'],
    4: ['1-1 calls', 'Implementação VIP', 'Acesso vitalício', 'Suporte優先']
  };
  return features[tier];
}

function getTierCTA(tier) {
  const ctas = {
    1: 'Assinar newsletter GRÁTIS',
    2: 'Entrar na Comunidade',
    3: 'Ser meu aluno',
    4: 'Ser meu cliente VIP'
  };
  return ctas[tier];
}

function generateCalendar(cadence) {
  const calendars = {
    weekly: [
      { day: 'Segunda', type: 'post', content: 'Post de valor' },
      { day: 'Quarta', type: 'video', content: 'Vídeo/aula' },
      { day: 'Sexta', type: 'challenge', content: 'Desafio/checklist' },
      { day: 'Sábado', type: 'community', content: 'Interação no grupo' }
    ],
    monthly: [
      { week: 1, focus: 'Conteúdo Principal' },
      { week: 2, focus: 'Bônus e Comunidade' },
      { week: 3, focus: 'Implementação' },
      { week: 4, focus: 'Consolidação' }
    ]
  };
  return calendars[cadence] || calendars.weekly;
}

function calculateMRR(tiers) {
  const targets = {
    1: { members: 1000, revenue: 0 },
    2: { members: 100, revenue: 4700 },
    3: { members: 30, revenue: 8910 },
    4: { members: 10, revenue: 9970 }
  };
  
  // Calculate based on targets (simulated)
  const totalMRR = tiers.reduce((sum, t) => {
    const tierNum = t.id || tiers.indexOf(t) + 1;
    const tierData = targets[tierNum];
    if (tierData) {
      return sum + (tierData.revenue);
    }
    return sum;
  }, 0);
  
  const totalMembers = Object.values(targets).reduce((sum, t) => sum + t.members, 0);
  
  return {
    monthlyRecurringRevenue: totalMRR,
    totalMembers,
    tierBreakdown: targets,
    annualProjection: totalMRR * 12,
    churnTargets: { target: 5, warning: 8, critical: 12 },
    ltvTarget: 12 // months
  };
}

// Retention Strategies
function getRetentionStrategies() {
  return [
    {
      phase: 'Onboarding (Dias 1-7)',
      strategies: [
        'E-mail de boas-vindas automático',
        'Primeiro contato com valor (dentro de 24h)',
        'Checklist de início',
        'Introdução na comunidade'
      ]
    },
    {
      phase: 'Engajamento (Dias 8-30)',
      strategies: [
        'Convite para primeira call',
        'Reconhecimento de novos membros',
        'Conteúdo de alto valor',
        'Dica bônus exclusiva'
      ]
    },
    {
      phase: 'Valor Contínuo (Mês 2+)',
      strategies: [
        'Novo conteúdo toda semana',
        'Updates e melhorias',
        'Bônus de aniversário',
        'Acesso antecipado'
      ]
    },
    {
      phase: 'Renovação',
      strategies: [
        'Alerta 7 dias antes',
        'Resumo de valor recebido',
        'Oferta de upgrade',
        'Bônus de renovação'
      ]
    }
  ];
}

// Churn Risk Indicators
function getChurnIndicators() {
  return [
    { indicator: 'Não loga há 14 dias', weight: 30, action: 'E-mail de check-in' },
    { indicator: 'Não participa de calls', weight: 25, action: 'Convite pessoal' },
    { indicator: 'Baixa interação no grupo', weight: 20, action: 'DM de engajamento' },
    { indicator: 'Cancelamento ameaçado', weight: 40, action: 'Call de retenção' },
    { indicator: 'Payment failed', weight: 50, action: 'Recuperação imediata' }
  ];
}

// Perpetual Product Generator
function generatePerpetualProduct(params) {
  const { name, price, type, delivery } = params;
  
  const products = {
    ebook: {
      price: 47,
      delivery: 'Imediato',
      upsell: 'Curso completo (R$ 497)',
      evergreen: true
    },
    curso: {
      price: 497,
      delivery: ' gradual (30 dias)',
      upsell: 'Mentoria (R$ 2.997)',
      evergreen: true
    },
    template: {
      price: 97,
      delivery: 'Imediato',
      upsell: 'Pack completo (R$ 297)',
      evergreen: true
    },
    checklist: {
      price: 27,
      delivery: 'Imediato',
      upsell: 'Kit completo (R$ 147)',
      evergreen: true
    }
  };
  
  const product = products[type] || products.ebook;
  
  return {
    name,
    ...product,
    funnel: generatePerpetualFunnel(name, product),
    metrics: calculatePerpetualMetrics(product)
  };
}

function generatePerpetualFunnel(name, product) {
  return {
    step1: {
      name: 'Landing Page',
      goal: 'Capture leads',
      conversion: '25%'
    },
    step2: {
      name: 'VSL/Video',
      goal: 'Eduque e convença',
      conversion: '40%'
    },
    step3: {
      name: 'Checkout',
      goal: 'Converter em venda',
      conversion: '2%'
    },
    step4: {
      name: 'Thank You + Upsell',
      goal: 'Aumentar ticket',
      conversion: '15%'
    }
  };
}

function calculatePerpetualMetrics(product) {
  const traffic = 1000;
  const optInRate = 0.25;
  const conversionRate = 0.02;
  
  const leads = traffic * optInRate;
  const buyers = leads * conversionRate;
  const revenue = buyers * product.price;
  
  return {
    traffic,
    leads,
    buyers,
    revenuePerMonth: revenue,
    revenuePerYear: revenue * 12,
    conversionBreakdown: {
      optIn: `${(optInRate * 100).toFixed(0)}%`,
      purchase: `${(conversionRate * 100).toFixed(1)}%`,
      overall: `${(optInRate * conversionRate * 100).toFixed(2)}%`
    }
  };
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'help';

const params = {
  name: args[1] || 'Clube dos Milionários',
  type: 'membership',
  content: 'Newsletter + Calls + Desafios',
  cadence: 'weekly',
  price: 47,
  productType: 'ebook'
};

switch (command) {
  case 'build':
    logSection('🔄 MEMBERSHIP BUILDER');
    
    const membership = generateMembership(params);
    
    console.log(`📦 MEMBERSHIP: ${membership.name}`);
    console.log(`📊 PROJEÇÃO DE MRR: R$ ${membership.metrics.monthlyRecurringRevenue.toLocaleString()}/mês\n`);
    
    console.log('🎯 TIERS:\n');
    membership.tiers.forEach(t => {
      console.log(`  ${t.id === 1 ? '🥉' : t.id === 2 ? '🥈' : t.id === 3 ? '🥇' : '🏆'} ${t.name}: R$ ${t.price}/mês`);
      console.log(`     Objetivo: ${t.objective}`);
      console.log(`     CTA: ${t.cta}`);
      t.features.forEach(f => console.log(`     ✅ ${f}`));
      console.log('');
    });
    
    console.log('📅 CALENDÁRIO DE ENTREGA:\n');
    membership.calendar.forEach(c => {
      console.log(`   ${c.day || 'Semana ' + c.week}: ${c.type || c.focus} - ${c.content}`);
    });
    break;
    
  case 'metrics':
    logSection('📊 MÉTRICAS DE MEMBERSHIP');
    
    const metrics = calculateMRR(Object.values(tierStructure));
    
    console.log(`💰 MRR: R$ ${metrics.monthlyRecurringRevenue.toLocaleString()}`);
    console.log(`👥 Total Members: ${metrics.totalMembers.toLocaleString()}`);
    console.log(`📈 Projeção Anual: R$ ${metrics.annualProjection.toLocaleString()}\n`);
    
    console.log('📊 TIER BREAKDOWN:\n');
    Object.entries(metrics.tierBreakdown).forEach(([tier, data]) => {
      const tierName = tierStructure[tier].name;
      console.log(`   ${tierName}: ${data.members} members → R$ ${data.revenue.toLocaleString()}`);
    });
    
    console.log(`\n🎯 CHURN TARGET: <${metrics.churnTargets.target}%/mês`);
    console.log(`💎 LTV TARGET: ${metrics.ltvTarget}x`);
    break;
    
  case 'retention':
    logSection('🎯 ESTRATÉGIAS DE RETENÇÃO');
    
    const strategies = getRetentionStrategies();
    strategies.forEach(s => {
      console.log(`\n${s.phase}:`);
      s.strategies.forEach(strat => console.log(`   → ${strat}`));
    });
    
    console.log('\n⚠️ CHURN INDICATORS:\n');
    const indicators = getChurnIndicators();
    indicators.forEach(i => {
      console.log(`   ${i.weight}pts: ${i.indicator}`);
      console.log(`      Ação: ${i.action}`);
    });
    break;
    
  case 'perpetual':
    logSection('📦 PRODUTO PERPÉTUO');
    
    const product = generatePerpetualProduct({ 
      name: args[1] || 'E-book Transformação',
      type: args[2] || 'ebook',
      price: parseInt(args[3]) || 47
    });
    
    console.log(`📦 PRODUTO: ${product.name}`);
    console.log(`💰 PREÇO: R$ ${product.price}`);
    console.log(`📬 ENTREGA: ${product.delivery}`);
    console.log(`🚀 UPSELL: ${product.upsell}\n`);
    
    console.log('📈 FUNIL:\n');
    Object.entries(product.funnel).forEach(([step, data]) => {
      console.log(`   ${step}: ${data.name}`);
      console.log(`      Meta: ${data.goal} | Conversão: ${data.conversion}`);
    });
    
    console.log('\n💵 MÉTRICAS:\n');
    console.log(`   Tráfego: ${product.metrics.traffic}/mês`);
    console.log(`   Leads: ${product.metrics.leads}/mês`);
    console.log(`   Compradores: ${product.metrics.buyers}/mês`);
    console.log(`   Receita: R$ ${product.metrics.revenuePerMonth.toLocaleString()}/mês`);
    console.log(`   Anual: R$ ${product.metrics.revenuePerYear.toLocaleString()}/ano`);
    break;
    
  case 'help':
  default:
    logSection('🔄 WORKER ÉRICO');
    console.log(`
用法: node erico-membership-builder.js [comando]

Comandos:
  build [nome]          - Criar estrutura de membership
  metrics               - Ver métricas de MRR
  retention             - Estratégias de retenção
  perpetual [nome] [tipo] [preço]  - Criar produto perpétuo

Tipos de produto perpétuo:
  ebook, curso, template, checklist

Exemplos:
  node erico-membership-builder.js build "Clube"
  node erico-membership-builder.js metrics
  node erico-membership-builder.js retention
  node erico-membership-builder.js perpetual "E-book" ebook 47

Métricas:
  MRR Target: R$ 5.000
  Members Target: 100
  Churn Target: <5%
`);
}

module.exports = {
  generateMembership,
  generatePerpetualProduct,
  getRetentionStrategies,
  getChurnIndicators,
  tierStructure,
  calculateMRR
};
