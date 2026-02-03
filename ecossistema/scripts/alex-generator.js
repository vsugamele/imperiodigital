#!/usr/bin/env node

/**
 * 💰 WORKER ALEX HORMOZI - OFFERS GENERATOR
 * 
 * Gera ofertas irresistíveis baseado em:
 * - Value Stacking
 * - Precificação estratégica
 * - Upsells e bônus
 * 
 * Usage: node alex-generator.js [offer|pricing|upsell|ladder]
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
  console.log(`${GREEN}═══════════════════════════════════════${RESET}\n`);
}

// Value Stacking Calculator
function calculateValueStack(product) {
  const {
    name,
    modules = [],
    bonuses = [],
    guarantee = '30 dias',
    urgency = {}
  } = product;
  
  // Calculate total value
  const modulesValue = modules.reduce((sum, m) => sum + (m.value || 0), 0);
  const bonusesValue = bonuses.reduce((sum, b) => sum + (b.value || 0), 0);
  const totalValue = modulesValue + bonusesValue;
  
  // Generate offer structure
  const offer = {
    name,
    deliverables: modules,
    bonuses: bonuses,
    guarantee,
    urgency,
    totals: {
      modules: modulesValue,
      bonuses: bonusesValue,
      perceived: totalValue,
      offer: 0,
      discount: 0
    }
  };
  
  return offer;
}

function generateOffer(params) {
  const {
    productName,
    corePrice = 997,
    tier = 'medium',
    hasBonuses = true,
    hasGuarantee = true,
    hasUrgency = true
  } = params;
  
  const templates = {
    tripwire: {
      name: `${productName} - Tripwire`,
      price: 27,
      interval: 'único',
      delivery: 'Imediato',
      guarantee: hasGuarantee ? '7 dias' : null,
      urgency: hasUrgency ? 'Oferta por tempo limitado' : null
    },
    frontEnd: {
      name: `${productName}`,
      price: corePrice,
      interval: 'único',
      delivery: 'Imediato',
      guarantee: hasGuarantee ? '30 dias' : null,
      urgency: hasUrgency ? 'Apenas 50 vagas' : null
    },
    premium: {
      name: `${productName} - Premium`,
      price: Math.round(corePrice * 1.5),
      interval: 'único',
      delivery: 'Imediato',
      guarantee: hasGuarantee ? '30 dias + Suporte' : null,
      urgency: hasUrgency ? 'Sobe para R$ 2.000 em 48h' : null
    },
    vip: {
      name: `${productName} - VIP`,
      price: corePrice * 3,
      interval: 'único',
      delivery: 'Imediato + follow-up',
      guarantee: hasGuarantee ? '60 dias + Mentoria' : null,
      urgency: hasUrgency ? 'Apenas 20 vagas' : null
    }
  };
  
  return templates;
}

function generatePricingStrategy(product) {
  const { name, basePrice = 997, cost = 50 } = product;
  
  const anchoring = {
    retail: basePrice * 10,
    current: basePrice,
    offer: Math.round(basePrice * 0.8),
    discount: '92% OFF',
    savings: basePrice * 10 - basePrice
  };
  
  const paymentPlans = [
    { months: 1, price: basePrice, label: 'À vista' },
    { months: 3, price: Math.round(basePrice / 2.5), label: '3x de' },
    { months: 6, price: Math.round(basePrice / 5), label: '6x de' },
    { months: 12, price: Math.round(basePrice / 9), label: '12x de' }
  ];
  
  const scarcity = {
    time: 'Oferta válida até sexta-feira',
    quantity: 'Apenas 47 vagas disponíveis',
    price: 'Sobe para R$ 1.997 na próxima turma',
    bonus: 'Bônus expira com a oferta'
  };
  
  return {
    anchoring,
    paymentPlans,
    scarcity,
    totalPerceivedValue: anchoring.retail,
    offerValue: basePrice,
    savingsAmount: anchoring.savings,
    roi: ((anchoring.retail - basePrice) / basePrice * 100).toFixed(0) + '%'
  };
}

function generateUpsells(sequence = []) {
  const defaults = [
    {
      name: 'Upgrade 1 - Módulo Bônus',
      price: 197,
      description: 'Acesso ao módulo de bônus estratégico',
      convRate: 0.15
    },
    {
      name: 'Upgrade 2 - Mentoria em Grupo',
      price: 497,
      description: '3 meses de mentoria coletiva',
      convRate: 0.08
    },
    {
      name: 'Upgrade 3 - VIP',
      price: 997,
      description: 'Acesso vitalício + suporte优先',
      convRate: 0.03
    }
  ];
  
  const upsells = sequence.length > 0 ? sequence : defaults;
  
  return upsells.map((u, i) => ({
    step: i + 1,
    ...u,
    value: upsells.length - i // Decreasing value perception
  }));
}

function generateValueLadder() {
  return [
    {
      level: 'FREE',
      name: 'Lead Magnet',
      price: 0,
      goal: 'Capturar e-mails',
      format: 'E-book, Checklist, Template',
      avgValue: 50
    },
    {
      level: 'TRIPWIRE',
      name: 'Starter',
      price: 27,
      goal: 'Converter em comprador',
      format: 'Mini-curso, Webinar',
      avgValue: 197,
      position: 'Entrada'
    },
    {
      level: 'FRONT',
      name: 'Core',
      price: 497,
      goal: 'Primeira venda significativa',
      format: 'Curso completo',
      avgValue: 997,
      position: 'Base'
    },
    {
      level: 'UPSELL1',
      name: 'Premium',
      price: 997,
      goal: 'Aumentar ticket médio',
      format: 'Módulo extra, Bônus',
      avgValue: 497,
      position: 'Subida'
    },
    {
      level: 'UPSELL2',
      name: 'VIP',
      price: 1.997,
      goal: 'Venda alta',
      format: 'Mentoria, Coaching',
      avgValue: 2.497,
      position: 'Topo'
    },
    {
      level: 'HIGH_TICKET',
      name: 'Done-For-You',
      price: 4.997,
      goal: 'Valor máximo',
      format: 'Consultoria 1-1, Implementação',
      avgValue: 9.997,
      position: 'Ápice'
    }
  ];
}

function generateGrandSlamOffer(product) {
  const {
    dreamOutcome = 'resultado transformador',
    perceivedLikelihood = 'comprovado',
    timeDelay = '30 dias',
    effortSacrifice = 'seguir as aulas'
  } = product;
  
  return {
    dreamOutcome,
    perceivedLikelihood,
    timeDelay,
    effortSacrifice,
    structure: {
      vehicle: product.name,
      deliverables: product.deliverables || [],
      bonuses: product.bonusList || [],
      guarantee: product.guaranteeText || '30 dias',
      scarcity: product.scarcityText || '50 vagas',
      pricing: product.price || 997
    },
    formula: `Dream (${dreamOutcome}) + Likelihood (${perceivedLikelihood}) + Time (${timeDelay}) + Effort (${effortSacrifice})`
  };
}

function calculateMetrics(upsellSequence, conversionRate = 0.02) {
  const visitors = 1000;
  const buyers = visitors * conversionRate;
  const tripwire = buyers * 0.3;
  const frontEnd = buyers * 0.5;
  const upsell1 = frontEnd * 0.15;
  const upsell2 = upsell1 * 0.08;
  
  const revenue = {
    visitors,
    buyers,
    tripwire: tripwire * 27,
    frontEnd: frontEnd * 497,
    upsell1: upsell1 * 197,
    upsell2: upsell2 * 997,
    total: 0
  };
  
  revenue.total = revenue.tripwire + revenue.frontEnd + revenue.upsell1 + revenue.upsell2;
  
  const metrics = {
    visitors,
    conversionRate,
    buyers,
    revenue,
    averageTicket: revenue.buyers > 0 ? revenue.total / revenue.buyers : 0,
    revenuePerVisitor: revenue.total / visitors,
    stackContribution: {
      tripwire: (revenue.tripwire / revenue.total * 100).toFixed(1) + '%',
      frontEnd: (revenue.frontEnd / revenue.total * 100).toFixed(1) + '%',
      upsells: ((revenue.upsell1 + revenue.upsell2) / revenue.total * 100).toFixed(1) + '%'
    }
  };
  
  return metrics;
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'help';

switch (command) {
  case 'offer':
    logSection('💰 ALEX - GERADOR DE OFERTAS');
    
    const offerParams = {
      productName: args[1] || 'Método Vendas Express',
      corePrice: parseInt(args[2]) || 997
    };
    
    const offers = generateOffer(offerParams);
    
    console.log('📦 OFERTAS GERADAS:\n');
    Object.entries(offers).forEach(([key, o]) => {
      console.log(`${key.toUpperCase()}:`);
      console.log(`   Nome: ${o.name}`);
      console.log(`   Preço: R$ ${o.price}`);
      console.log(`   Garantia: ${o.guarantee || 'N/A'}`);
      console.log(`   Urgência: ${o.urgency || 'N/A'}\n`);
    });
    break;
    
  case 'pricing':
    logSection('💵 ALEX - ESTRATÉGIA DE PREÇOS');
    
    const pricing = generatePricingStrategy({
      name: args[1] || 'Método',
      basePrice: parseInt(args[2]) || 997
    });
    
    console.log('📊 ANCORAGEM DE PREÇO:');
    console.log(`   De R$ ${pricing.anchoring.retail} por R$ ${pricing.anchoring.offer} (${pricing.anchoring.discount})`);
    console.log(`   Economia: R$ ${pricing.anchoring.savings.toLocaleString()}\n`);
    
    console.log('💳 PLANOS DE PAGAMENTO:');
    pricing.paymentPlans.forEach(p => {
      console.log(`   ${p.label} R$ ${p.price.toLocaleString()}`);
    });
    
    console.log('\n⚡ ESCASSEZ:');
    Object.entries(pricing.scarcity).forEach(([k, v]) => {
      console.log(`   ${k}: ${v}`);
    });
    break;
    
  case 'upsell':
    logSection('📈 ALEX - SEQUÊNCIA DE UPSELLS');
    
    const upsells = generateUpsells();
    
    console.log('🔼 SEQUÊNCIA DE UPSELLS:\n');
    upsells.forEach((u, i) => {
      console.log(`${i + 1}. ${u.name} - R$ ${u.price}`);
      console.log(`   Taxa: ${(u.convRate * 100).toFixed(0)}%`);
      console.log(`   Valor percebido: ${u.value}x\n`);
    });
    break;
    
  case 'ladder':
    logSection('📊 ALEX - VALUE LADDER');
    
    const ladder = generateValueLadder();
    
    console.log('🪜 VALUE LADDER:\n');
    ladder.forEach(l => {
      console.log(`${l.level}: ${l.name}`);
      console.log(`   Preço: ${l.price === 0 ? 'GRÁTIS' : 'R$ ' + l.price}`);
      console.log(`   Objetivo: ${l.goal}`);
      console.log(`   Formato: ${l.format}`);
      console.log(`   Valor: R$ ${l.avgValue}\n`);
    });
    break;
    
  case 'grandslam':
    logSection('🏆 ALEX - GRAND SLAM OFFER');
    
    const grandSlam = generateGrandSlamOffer({
      name: args[1] || 'Método Transformador',
      deliverables: [
        'Módulo 1: Fundamentos',
        'Módulo 2: Estratégia',
        'Módulo 3: Táticas',
        'Módulo 4: Execução'
      ],
      bonusList: [
        'Bônus 1: Templates',
        'Bônus 2: Checklist',
        'Bônus 3: Acesso à comunidade'
      ]
    });
    
    console.log(`🎯 DREAM OUTCOME: ${grandSlam.dreamOutcome}`);
    console.log(`📈 PERCEIVED LIKELIHOOD: ${grandSlam.perceivedLikelihood}`);
    console.log(`⏰ TIME DELAY: ${grandSlam.timeDelay}`);
    console.log(`💪 EFFORT: ${grandSlam.effortSacrifice}\n`);
    
    console.log('📦 ESTRUTURA:');
    console.log(`   Veículo: ${grandSlam.structure.vehicle}`);
    console.log(`   Preço: R$ ${grandSlam.structure.pricing}`);
    console.log(`   Garantia: ${grandSlam.structure.guarantee}`);
    console.log(`   Escassez: ${grandSlam.structure.scarcity}`);
    break;
    
  case 'metrics':
    logSection('📊 ALEX - MÉTRICAS DE REVENUE');
    
    const metrics = calculateMetrics([], 0.02);
    
    console.log('👥 VISITANTES: ' + metrics.visitors.toLocaleString());
    console.log('💰 COMPRADORES: ' + metrics.buyers.toLocaleString());
    console.log('📈 TAXA CONVERSÃO: ' + (metrics.conversionRate * 100).toFixed(2) + '%');
    console.log('\n💵 REVENUE:');
    console.log('   Tripwire: R$ ' + metrics.revenue.tripwire.toLocaleString());
    console.log('   Front-end: R$ ' + metrics.revenue.frontEnd.toLocaleString());
    console.log('   Upsells: R$ ' + (metrics.revenue.upsell1 + metrics.revenue.upsell2).toLocaleString());
    console.log('   TOTAL: R$ ' + metrics.revenue.total.toLocaleString() + '\n');
    console.log('📊 TICKET MÉDIO: R$ ' + metrics.averageTicket.toFixed(2));
    console.log('💵 REVENUE/VISITANTE: R$ ' + metrics.revenuePerVisitor.toFixed(2));
    break;
    
  case 'help':
  default:
    logSection('💰 WORKER ALEX HORMOZI');
    console.log(`
用法: node alex-generator.js [comando]

Comandos:
  offer [nome] [preço]  - Gerar estrutura de ofertas
  pricing [nome] [preço]  - Estratégia de precificação
  upsell                - Sequência de upsells
  ladder                 - Value Ladder completa
  grandslam [nome]       - Grand Slam Offer
  metrics                - Calcular métricas de revenue

Exemplos:
  node alex-generator.js offer "Método" 997
  node alex-generator.js pricing "Método" 997
  node alex-generator.js grandslam "Método Transformador"

Estágios:
  Tripwire → Front-end → Upsell 1 → Upsell 2 → VIP
`);
}

module.exports = {
  generateOffer,
  generatePricingStrategy,
  generateUpsells,
  generateValueLadder,
  generateGrandSlamOffer,
  calculateMetrics
};
