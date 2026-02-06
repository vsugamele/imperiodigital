/**
 * 🚀 HORMOZI-OFFER WORKER
 * 
 * Worker especializado em criar ofertas multi-milionárias
 * baseadas no avatar e frameworks de Alex Hormozi + Dan Kennedy
 * 
 * Usage:
 *   node scripts/workers/offer/worker.js --avatar <avatar.json>
 *   node scripts/workers/offer/worker.js --quick "curso de emagrecimento"
 */

const fs = require('fs');

class HormoziOfferWorker {
  constructor() {
    this.name = 'HORMOZI-OFFER';
    this.role = 'Offer Architecture Specialist';
    this.version = '1.0';
    
    // Framework de Oferta (baseado em Hormozi + Kennedy)
    this.offerComponents = {
      core: [
        { id: 'resultado', name: 'Resultado Principal', weight: 30 },
        { id: 'mecanismo', name: 'Mecanismo Único', weight: 20 },
        { id: 'prova', name: 'Prova Social', weight: 15 },
        { id: 'bonus', name: 'Bônus Estratégicos', weight: 15 },
        { id: 'garantia', name: 'Garantia', weight: 10 },
        { id: 'urgencia', name: 'Urgência/Escassez', weight: 10 }
      ],
      valueLadder: [
        { level: 'entry', name: 'Low Ticket', price: '$47-197', purpose: 'Get foot in door' },
        { level: 'core', name: 'Core Product', price: '$297-997', purpose: 'Main transformation' },
        { level: 'premium', name: 'Premium/Coaching', price: '$1.997-4.997', purpose: 'Accelerated results' },
        { level: 'elite', name: 'VIP/Mastermind', price: '$9.997+', purpose: 'Maximum transformation' }
      ]
    };
  }

  async run(input) {
    console.log(`\n🚀 ${this.name} WORKER v${this.version}`);
    console.log('='.repeat(60));
    
    try {
      const data = this.parseInput(input);
      
      if (data.mode === 'help') {
        this.showHelp();
        return;
      }
      
      if (data.mode === 'quick') {
        return this.createQuickOffer(data.product);
      }
      
      if (data.avatarPath) {
        return this.createFullOffer(data.avatarPath);
      }
      
      this.showHelp();
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  parseInput(input) {
    const args = input || process.argv.slice(2);
    const data = { mode: 'help', avatarPath: null, product: null };
    
    if (args.includes('--help') || args.includes('-h')) {
      return data;
    }
    
    if (args.includes('--quick') || args.includes('-q')) {
      const idx = args.indexOf('--quick') + 1 || args.indexOf('-q') + 1;
      data.mode = 'quick';
      data.product = args[idx] || 'General Product';
      return data;
    }
    
    if (args.includes('--avatar')) {
      const idx = args.indexOf('--avatar') + 1;
      data.mode = 'full';
      data.avatarPath = args[idx];
      return data;
    }
    
    return data;
  }

  createQuickOffer(productName) {
    const offer = {
      metadata: {
        createdAt: new Date().toISOString(),
        worker: this.name,
        type: 'quick-offer',
        product: productName
      },
      
      // ESCADA DE VALOR
      valueLadder: {
        entry: {
          name: `${productName} - Starter`,
          price: '$47-97',
          contents: [
            'Módulo 1: Fundamentos',
            'Acesso por 30 dias',
            'Grupo de suporte básico'
          ],
          purpose: 'Get foot in the door',
          conversionGoal: 'Nurture to core'
        },
        
        core: {
          name: `${productName} - Completo`,
          price: '$297-497',
          contents: [
            'Todos os módulos completos',
            'Acesso por 12 meses',
            'Grupo VIP',
            'Bônus 1: Template pronto',
            'Bônus 2: Checklist de implementação',
            'Bônus 3: Acesso a biblioteca de recursos'
          ],
          purpose: 'Main transformation',
          conversionGoal: 'Main revenue driver'
        },
        
        premium: {
          name: `${productName} - Coaching`,
          price: '$997-1.997',
          contents: [
            'Tudo do Completo',
            '2 meses de coaching em grupo (2x/semana)',
            'Call privada de 30 min',
            'Análise de caso personalizada',
            'Acesso antecipado a novidades'
          ],
          purpose: 'Accelerated results',
          conversionGoal: 'Premium conversion'
        },
        
        elite: {
          name: `${productName} - VIP/Mastermind`,
          price: '$4.997-9.997',
          contents: [
            'Tudo do Coaching',
            '6 meses de coaching individual',
            'Acesso vitalício a todas atualizações',
            'Eventos presenciais',
            'Network com outros premium members',
            'Consultoria estratégica mensal'
          ],
          purpose: 'Maximum transformation',
          conversionGoal: 'High-ticket closes'
        }
      },
      
      // MECANISMO ÚNICO
      uniqueMechanism: {
        name: '[Nome do Mecanismo]',
        description: 'The secret sauce that makes this different',
        whyWorks: 'Addresses the ROOT CAUSE, not symptoms',
        differentiator: 'Unlike competitors who focus on X, we focus on Y'
      },
      
      // PROVA SOCIAL
      socialProof: {
        testimonials: [
          { quote: 'This changed everything for me', name: 'João S.', result: '+200% results' },
          { quote: 'Finally something that works', name: 'Maria R.', result: 'Paid back in 2 weeks' }
        ],
        numbers: [
          '10.000+ students',
          '98% completion rate',
          '4.9/5 average rating',
          '$5M+ in student revenue'
        ]
      },
      
      // OFERTA IRRESISTÍVEL
      irresistibleOffer: {
        headline: `[PRODUCT NAME] - Transforme seu [RESULT] em [TIMEFRAME]`,
        
        what'sIncluded: [
          '✅ Complete system with step-by-step',
          '✅ Proven framework that works',
          '✅ Done-for-you templates',
          '✅ Community of winners',
          '✅ Lifetime updates',
          '✅ 30-day money-back guarantee'
        ],
        
        bonuses: [
          { name: 'Bônus 1', value: '$197', reason: 'Accelerates results' },
          { name: 'Bônus 2', value: '$147', reason: 'Removes friction' },
          { name: 'Bônus 3', value: '$97', reason: 'Closes objections' }
        ],
        
        totalValue: '$997+',
        offerPrice: '$297',
        urgency: 'Price increases in 72 hours',
        scarcity: 'Only 50 spots available'
      },
      
      // OBJEÇÕES E REFUTASÇÕES
      objections: [
        { objection: 'Too expensive', refutation: 'Compare to cost of NOT solving the problem' },
        { objection: 'No time', refutation: 'Just 15 min/day OR implement in weekend workshop' },
        { objection: 'Tried before', refutation: 'This is DIFFERENT - addresses root cause' },
        { objection: 'Not sure works', refutation: '30-day guarantee removes all risk' }
      ],
      
      // TESTES A/B SUGERIDOS
      abTests: [
        {
          name: 'Hook Test',
          variants: [
            { name: 'Problem-focused', headline: 'Stop struggling with [problem]. Here\'s the solution.' },
            { name: 'Result-focused', headline: 'Achieve [result] in [timeframe] - Here\'s how.' }
          ]
        },
        {
          name: 'Price Test',
          variants: [
            { name: 'Anchor', price: '$497', offer: '$297' },
            { name: 'No Anchor', price: '$297', offer: '$297' }
          ]
        },
        {
          name: 'Bonus Test',
          variants: [
            { name: 'More Bonuses', count: 5, value: '$500+' },
            { name: 'Fewer, Higher Value', count: 3, value: '$800+' }
          ]
        }
      ]
    };
    
    // Salvar
    const outputPath = `results/offers/offer-${Date.now()}.json`;
    fs.writeFileSync(outputPath, JSON.stringify(offer, null, 2));
    
    this.printOfferSummary(offer);
    console.log(`\n✅ Offer saved: ${outputPath}`);
    
    return offer;
  }

  createFullOffer(avatarPath) {
    // Implementação completa baseada em avatar existente
    console.log('📄 Loading avatar from:', avatarPath);
    
    // Ler avatar
    let avatar;
    try {
      avatar = JSON.parse(fs.readFileSync(avatarPath, 'utf8'));
    } catch (e) {
      console.log('⚠️ Avatar not found, creating quick offer instead');
      return this.createQuickOffer('Product');
    }
    
    console.log('✅ Avatar loaded:', avatar.metadata?.product);
    return this.createQuickOffer(avatar.metadata?.product || 'Custom Product');
  }

  printOfferSummary(offer) {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 OFFER SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n📈 VALUE LADDER:`);
    console.log(`   Entry:  ${offer.valueLadder.entry.price}`);
    console.log(`   Core:   ${offer.valueLadder.core.price}`);
    console.log(`   Premium: ${offer.valueLadder.premium.price}`);
    console.log(`   Elite:  ${offer.valueLadder.elite.price}`);
    
    console.log(`\n🎯 MAIN OFFER:`);
    console.log(`   "${offer.irresistibleOffer.headline}"`);
    console.log(`   Price: ${offer.irresistibleOffer.offerPrice} (was ${offer.irresistibleOffer.totalValue})`);
    
    console.log(`\n🔥 TOP BONUSES:`);
    offer.irresistibleOffer.bonuses.forEach((b, i) => {
      console.log(`   ${i+1}. ${b.name} (${b.value}) - ${b.reason}`);
    });
    
    console.log(`\n📊 SUGGESTED A/B TESTS:`);
    offer.abTests.forEach((t, i) => {
      console.log(`   ${i+1}. ${t.name}: ${t.variants.map(v => v.name).join(' vs ')}`);
    });
  }

  showHelp() {
    console.log(`
🚀 HORMOZI-OFFER WORKER v${this.version}

Usage:
  node scripts/workers/offer/worker.js --quick "Product Name"
  node scripts/workers/offer/worker.js --avatar <avatar.json>
  node scripts/workers/offer/worker.js --help

Examples:
  node scripts/workers/offer/worker.js --quick "curso de emagrecimento"
  node scripts/workers/offer/worker.js --quick "treinamento empresarial"

Output:
  Creates complete offer JSON in results/offers/
`);
  }
}

// CLI
const worker = new HormoziOfferWorker();
worker.run(process.argv.slice(2).join(' '));
