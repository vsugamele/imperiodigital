#!/usr/bin/env node

/**
 * 🎯 WORKER RUSSELL - FUNNEL BUILDER
 * 
 * Constrói e otimiza funis de vendas automatizados
 * desde lead magnet até alta-ticket.
 * 
 * Usage: node russell-funnel-builder.js [build|analyze|optimize]
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

// Funnel Types
const funnelTypes = {
  leadMagnet: {
    name: 'Lead Magnet (Topo)',
    price: 'GRÁTIS',
    objective: 'Capturar leads',
    pages: ['Landing Page', 'Thank You + Upsell'],
    emails: 'Sequência 3 e-mails',
    conversion: { good: '20 opt-ins/dia', great: '50 opt-ins/dia' },
    revenue: { good: '$0.50/lead', great: '$2/lead' }
  },
  tripwire: {
    name: 'Tripwire (Meio)',
    price: 'R$ 27-97',
    objective: 'Primeira venda',
    pages: ['Sales Page', 'Checkout', 'Thank You + Upsell'],
    emails: 'Sequência 5 e-mails',
    conversion: { good: '1% conversion', great: '3% conversion' },
    revenue: { good: '$5/buyer', great: '$15/buyer' }
  },
  upsell: {
    name: 'Upsell (Meio)',
    price: 'R$ 197-497',
    objective: 'Aumentar ticket',
    pages: ['Upsell Page 1', 'Upsell Page 2', 'Thank You'],
    emails: 'Sequência 3 e-mails',
    conversion: { good: '15% take rate', great: '30% take rate' },
    revenue: { good: '$20/buyer', great: '$50/buyer' }
  },
  altaTicket: {
    name: 'Alta-Ticket (Fundo)',
    price: 'R$ 1.000-5.000',
    objective: 'Vendas premium',
    pages: ['Webinar/Application', 'Follow-up', 'Sales Call'],
    emails: 'Sequência 7+ e-mails',
    conversion: { good: '1% conversion', great: '3% conversion' },
    revenue: { good: '$500/sale', great: '$2.000/sale' }
  }
};

// Landing Page Template
const landingPageTemplate = {
  header: {
    headline: '',
    subheadline: ''
  },
  bullets: [],
  cta: {
    text: '',
    button: ''
  },
  socialProof: {
    stats: [],
    testimonials: []
  }
};

// Generate Funnel
function generateFunnel(params) {
  const { type, productName, price, niche } = params;
  
  const funnel = funnelTypes[type] || funnelTypes.leadMagnet;
  
  const pages = generatePages(type, params);
  const emails = generateEmailSequence(type, params);
  const automations = generateAutomations(type);
  
  return {
    type,
    name: funnel.name,
    objective: funnel.objective,
    price: funnel.price,
    pages,
    emails,
    automations,
    metrics: funnel
  };
}

function generatePages(type, params) {
  const pages = {
    leadMagnet: [
      {
        name: 'Landing Page - Opt-in',
        elements: {
          headline: `Como ${params.goal || 'conseguir resultados'} em ${params.timeframe || '30 dias'}`,
          subheadline: 'Sem ' + (params.pain || 'esforço'),
          bullets: [
            '✅ ' + (params.benefit1 || 'Benefício 1'),
            '✅ ' + (params.benefit2 || 'Benefício 2'),
            '✅ ' + (params.benefit3 || 'Benefício 3')
          ],
          cta: 'Quero meu ' + (params.productName || 'E-book GRÁTIS'),
          socialProof: params.socialProof || '1.000+ pessoas já baixaram'
        }
      },
      {
        name: 'Thank You + Upsell',
        headline: 'Obrigado pelo download!',
        upsell: {
          name: params.productName || 'Upgrade',
          price: params.upsellPrice || 47,
          offer: params.upsellOffer || '50% OFF no upgrade'
        }
      }
    ],
    tripwire: [
      {
        name: 'Sales Page - Tripwire',
        elements: {
          headline: params.headline || 'A solução para ' + params.pain,
          subheadline: params.subhead || 'Resultados em ' + params.timeframe,
          bullets: [
            '✅ ' + params.benefit1,
            '✅ ' + params.benefit2,
            '✅ ' + params.benefit3,
            '✅ ' + params.benefit4,
            '✅ ' + params.benefit5
          ],
          price: params.price || 47,
          guarantee: params.guarantee || '7 dias',
          cta: 'Comprar Agora'
        }
      },
      {
        name: 'Checkout',
        type: 'payment'
      },
      {
        name: 'Thank You + Upsell',
        headline: 'Parabéns pela sua compra!',
        upsell: params.upsellProduct || 'Bônus Especial'
      }
    ],
    upsell: [
      {
        name: 'Upsell 1 - Upgrade',
        headline: 'Você também pode gostar de...',
        price: params.upsell1Price || 97,
        offer: 'Por apenas +R$ ' + (params.upsell1Price || 97)
      },
      {
        name: 'Upsell 2 - Pacote',
        headline: 'Leve o pacote completo',
        price: params.upsell2Price || 197,
        offer: 'De R$ ' + (params.upsell2Price * 2 || 394) + ' por R$ ' + params.upsell2Price
      },
      {
        name: 'Thank You',
        headline: 'Parabéns!',
        access: params.access || 'Acesso imediato'
      }
    ],
    altaTicket: [
      {
        name: 'Webinar/Application',
        headline: params.webinarTitle || 'Evento especial',
        vsl: 'Vídeo de 60 segundos',
        cta: 'Aplicar Agora'
      },
      {
        name: 'Follow-up Sequence',
        type: 'email',
        sequence: '7 e-mails de follow-up'
      },
      {
        name: 'Sales Call',
        type: 'call',
        duration: params.callDuration || '30 minutos'
      }
    ]
  };
  
  return pages[type] || pages.leadMagnet;
}

function generateEmailSequence(type, params) {
  const sequences = {
    leadMagnet: [
      { day: 0, name: 'Receipt + Download', subject: 'Seu ' + params.productName + ' está aqui!' },
      { day: 2, name: 'Feedback', subject: 'O que você achou?' },
      { day: 5, name: 'Transformation', subject: 'Transformação completa' }
    ],
    tripwire: [
      { day: 0, name: 'Receipt + Upsell', subject: 'Obrigado! Um presente para você...' },
      { day: 1, name: 'How to use', subject: 'Como usar seu ' + params.productName },
      { day: 3, name: 'Results', subject: 'Primeiros resultados' },
      { day: 7, name: 'Hidden gems', subject: 'Você está sentado em ouro' },
      { day: 14, name: 'Last chance', subject: 'Última chance' }
    ],
    upsell: [
      { day: 0, name: 'Receipt', subject: 'Parabéns pela sua compra!' },
      { day: 1, name: 'How to maximize', subject: 'Como maximizar seus resultados' },
      { day: 5, name: 'Bonus reminder', subject: 'Seu bônus está esperando' }
    ],
    altaTicket: [
      { day: 0, name: 'Receipt', subject: 'Recebemos sua aplicação' },
      { day: 1, name: 'Next steps', subject: 'Próximos passos' },
      { day: 3, name: 'Case study', subject: 'Caso de sucesso' },
      { day: 5, name: 'Testimonials', subject: 'O que dizem nossos alunos' },
      { day: 7, name: 'Call reminder', subject: 'Sua chamada está confirmada' },
      { day: 9, name: 'Urgency', subject: 'Últimas vagas' },
      { day: 12, name: 'Final', subject: 'Esta é sua última chance' }
    ]
  };
  
  return sequences[type] || sequences.leadMagnet;
}

function generateAutomations(type) {
  const automations = {
    leadMagnet: [
      '✓ Tag: Lead Magnet Downloaded',
      '✓ Segments: New Lead',
      '✓ Sequence: 3 e-mails',
      '✓ Trigger: 48h → Check interest'
    ],
    tripwire: [
      '✓ Tag: Tripwire Purchaser',
      '✓ Segments: Buyer',
      '✓ Sequence: 5 e-mails',
      '✓ Trigger: 24h → First follow-up'
    ],
    upsell: [
      '✓ Tag: Upsell 1 Accepted',
      '✓ Segments: Upsell Buyer',
      '✓ Trigger: Post-purchase → Next offer'
    ],
    altaTicket: [
      '✓ Tag: Applicant',
      '✓ Segments: Hot Lead',
      '✓ Sequence: 7 e-mails',
      '✓ Trigger: Pre-call → Preparation email'
    ]
  };
  
  return automations[type] || automations.leadMagnet;
}

// Calculate Revenue
function calculateFunnelMetrics(visitors, type) {
  const metrics = funnelTypes[type];
  
  const baseConversion = {
    leadMagnet: { optIn: 0.25, tripwire: 0.02 },
    tripwire: { conversion: 0.02, upsell: 0.15 },
    upsell: { conversion: 0.20, upsell2: 0.10 },
    altaTicket: { conversion: 0.015, call: 0.30, close: 0.40 }
  };
  
  const conv = baseConversion[type] || baseConversion.leadMagnet;
  
  const funnel = {
    visitors,
    leads: Math.floor(visitors * conv.optIn || visitors * 0.25),
    buyers: 0,
    revenue: 0,
    breakdown: []
  };
  
  // Calculate based on type
  if (type === 'leadMagnet') {
    const optIns = Math.floor(visitors * 0.25);
    const buyers = Math.floor(optIns * 0.02);
    funnel.leads = optIns;
    funnel.buyers = buyers;
    funnel.revenue = buyers * 47;
    funnel.breakdown = [
      { step: 'Visitantes', count: visitors, rate: '100%' },
      { step: 'Opt-ins', count: optIns, rate: '25%' },
      { step: 'Compradores', count: buyers, rate: '2%' },
      { step: 'Receita', count: `R$ ${funnel.revenue}`, rate: `R$ ${47}/compra` }
    ];
  } else if (type === 'tripwire') {
    const buyers = Math.floor(visitors * 0.02);
    const upsellBuyers = Math.floor(buyers * 0.15);
    funnel.buyers = buyers;
    funnel.revenue = buyers * 47 + upsellBuyers * 97;
    funnel.breakdown = [
      { step: 'Visitantes', count: visitors, rate: '100%' },
      { step: 'Compradores', count: buyers, rate: '2%' },
      { step: 'Upsell 1', count: upsellBuyers, rate: '15%' },
      { step: 'Receita Total', count: `R$ ${funnel.revenue}`, rate: `R$ ${(funnel.revenue / buyers).toFixed(0)}/buyer` }
    ];
  }
  
  return funnel;
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'help';

const params = {
  type: args[0] || 'leadMagnet',
  productName: args[1] || 'E-book Transformação',
  price: parseInt(args[2]) || 47,
  niche: args[3] || 'Educação Financeira',
  pain: 'perder dinheiro',
  benefit1: 'Aprender a investir',
  benefit2: 'Dobrar rendimentos',
  benefit3: 'Ter liberdade financeira',
  timeframe: '30 dias',
  goal: 'conseguir liberdade financeira'
};

switch (command) {
  case 'build':
    logSection('🎯 CONSTRUTOR DE FUNIS');
    
    const funnel = generateFunnel(params);
    
    console.log(`📦 FUNIL: ${funnel.name}`);
    console.log(`💰 PREÇO: ${funnel.price}`);
    console.log(`\n📄 PÁGINAS:\n`);
    
    funnel.pages.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      if (p.elements) {
        console.log(`   Headline: "${p.elements.headline}"`);
        console.log(`   CTA: "${p.elements.cta}"`);
      }
    });
    
    console.log(`\n📧 E-SEQUÊNCIA:\n`);
    funnel.emails.forEach(e => {
      console.log(`   Dia ${e.day}: ${e.name}`);
      console.log(`   Assunto: "${e.subject}"`);
    });
    
    console.log(`\n⚡ AUTOMAÇÕES:\n`);
    funnel.automations.forEach(a => console.log(`   ${a}`));
    
    // Save
    const outputFile = path.join(__dirname, `../insights/funnels/funnel-${Date.now()}.json`);
    if (!fs.existsSync(path.dirname(outputFile))) {
      fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    }
    fs.writeFileSync(outputFile, JSON.stringify(funnel, null, 2));
    console.log(`\n💾 Salvo: ${outputFile}`);
    break;
    
  case 'analyze':
    logSection('📊 ANÁLISE DE FUNIL');
    
    const visitors = parseInt(args[1]) || 1000;
    const type = args[2] || 'leadMagnet';
    
    const metrics = calculateFunnelMetrics(visitors, type);
    
    console.log(`📈 ANÁLISE: ${funnelTypes[type].name}`);
    console.log(`👥 VISITANTES: ${visitors.toLocaleString()}\n`);
    
    console.log('📊 FUNIL:\n');
    metrics.breakdown.forEach(b => {
      console.log(`   ${b.step}: ${typeof b.count === 'number' ? b.count.toLocaleString() : b.count} (${b.rate})`);
    });
    
    console.log(`\n💰 RECEITA TOTAL: R$ ${metrics.revenue.toLocaleString()}`);
    console.log(`📈 TICKET MÉDIO: R$ ${(metrics.revenue / metrics.buyers || 0).toFixed(2)}`);
    break;
    
  case 'optimize':
    logSection('🎯 OTIMIZAÇÕES RECOMENDADAS');
    
    const typeKey = args[1] || 'leadMagnet';
    const optimizations = {
      leadMagnet: [
        { area: 'Headline', action: 'Testar promessa mais específica', impact: 'Alto' },
        { area: 'Bullet Points', action: 'Adicionar resultados específicos', impact: 'Médio' },
        { area: 'CTA', action: 'Usar ação + resultado', impact: 'Alto' },
        { area: 'Social Proof', action: 'Adicionar número específico', impact: 'Médio' }
      ],
      tripwire: [
        { area: 'Price', action: 'Testar R$ 27 vs R$ 47', impact: 'Alto' },
        { area: 'Guarantee', action: 'Fazer mais visível', impact: 'Médio' },
        { area: 'Upsell', action: 'Oferecer no thank you page', impact: 'Alto' }
      ],
      upsell: [
        { area: 'Offer', action: 'Bundle mais produtos', impact: 'Alto' },
        { area: 'Price', action: 'Mostrar preço original', impact: 'Médio' },
        { area: 'Scarcity', action: 'Adicionar limite', impact: 'Médio' }
      ]
    };
    
    console.log(`🎯 OTIMIZAÇÕES PARA ${funnelTypes[typeKey].name}:\n`);
    (optimizations[typeKey] || optimizations.leadMagnet).forEach(o => {
      const emoji = o.impact === 'Alto' ? '🔴' : '🟡';
      console.log(`${emoji} ${o.area}: ${o.action}`);
    });
    break;
    
  case 'types':
    logSection('📋 TIPOS DE FUNIS');
    
    Object.entries(funnelTypes).forEach(([key, f]) => {
      console.log(`\n${key.toUpperCase()}: ${f.name}`);
      console.log(`   Preço: ${f.price}`);
      console.log(`   Objetivo: ${f.objective}`);
      console.log(`   Páginas: ${f.pages.length}`);
    });
    break;
    
  case 'help':
  default:
    logSection('🎯 WORKER RUSSELL');
    console.log(`
用法: node russell-funnel-builder.js [comando]

Comandos:
  build [tipo] [nome] [preço]  - Construir funil
  analyze [visitas] [tipo]     - Analisar métricas
  optimize [tipo]              - Recomendar otimizações
  types                        - Listar tipos de funis

Tipos de funis:
  leadMagnet  - Captura de leads (GRÁTIS)
  tripwire     - Primeira venda (R$ 27-97)
  upsell       - Aumentar ticket (R$ 197-497)
  altaTicket   - Vendas premium (R$ 1.000+)

Exemplos:
  node russell-funnel-builder.js build leadMagnet "E-book" 0
  node russell-funnel-builder.js analyze 1000 tripwire
  node russell-funnel-builder.js optimize leadMagnet

Métricas:
  Lead Magnet: 25% opt-in rate
  Tripwire: 2% conversion rate
  Upsell: 15% take rate
`);
}

module.exports = {
  generateFunnel,
  calculateFunnelMetrics,
  funnelTypes,
  landingPageTemplate
};
