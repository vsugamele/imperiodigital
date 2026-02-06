/**
 * 🔥 ALEX-AVATAR WORKER
 * 
 * Worker especializado em criar avatars completos usando
 * engenharia reversa do Hackerverso + frameworks de Kennedy/Halbert
 * 
 * Usage:
 *   node scripts/workers/avatar/worker.js --input "produto: curso de emagrecimento, target: mulheres 35-50"
 *   node scripts/workers/avatar/worker.js --interactive
 *   node scripts/workers/avatar/worker.js --template default
 */

const fs = require('fs');
const path = require('path');

class AvatarWorker {
  constructor() {
    this.name = 'ALEX-AVATAR';
    this.role = 'Avatar Intelligence Architect';
    this.version = '1.0';
    
    // Templates baseados no Hackerverso
    this.questionFlow = {
      basics: [
        { key: 'product', label: 'Produto/Serviço', required: true },
        { key: 'targetAudience', label: 'Público Alvo', required: true },
        { key: 'mainBenefit', label: 'Benefício Principal', required: true },
        { key: 'priceRange', label: 'Faixa de Preço', required: false },
        { key: 'mainCompetitor', label: 'Principal Concorrente', required: false }
      ],
      psychographics: [
        { key: 'biggestDesire', label: 'Maior Desejo', required: true },
        { key: 'biggestFrustration', label: 'Maior Frustração', required: true },
        { key: 'whatTried', label: 'O que já tentou', required: true },
        { key: 'emotionalState', label: 'Estado Emocional', required: true },
        { key: 'biggestFear', label: 'Maior Medo', required: true },
        { key: 'onlineHangs', label: 'Onde fica online', required: false },
        { key: 'influencers', label: 'Quem segue', required: false },
        { key: 'pastPurchases', label: 'O que já comprou', required: false },
        { key: 'lifeAfter', label: 'Vida após resolver', required: true },
        { key: 'obstacles', label: 'O que impede', required: true },
        { key: 'ahaMoment', label: 'O que diriam "sim"', required: true },
        { key: 'mainObjection', label: 'Principal objeção', required: true },
        { key: 'trustBuilders', label: 'O que gera confiança', required: true }
      ],
      trauma: [
        { key: 'coreWound', label: 'Ferida Core', required: false },
        { key: 'emotionalTriggers', label: 'Gatilhos Emocionais', required: false },
        { key: 'gutReactions', label: 'Reações Instintivas', required: false }
      ]
    };
  }

  async run(input) {
    console.log(`\n🔥 ${this.name} WORKER v${this.version}`);
    console.log('='.repeat(60));
    
    try {
      // Parse input
      const data = this.parseInput(input);
      
      // Mostrar perguntas baseado no input
      if (data.mode === 'interactive') {
        return this.runInteractive();
      }
      
      // Se tem dados, criar avatar
      if (data.product && data.target) {
        return this.createAvatar(data);
      }
      
      // Mostrar help
      this.showHelp();
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  parseInput(input) {
    const args = input || process.argv.slice(2);
    const data = { mode: 'help', product: null, target: null, details: {} };
    
    if (args.includes('--help') || args.includes('-h')) {
      data.mode = 'help';
      return data;
    }
    
    if (args.includes('--interactive') || args.includes('-i')) {
      data.mode = 'interactive';
      return data;
    }
    
    if (args.includes('--template')) {
      const templateIndex = args.indexOf('--template') + 1;
      data.template = args[templateIndex] || 'default';
      return data;
    }
    
    // Parse --input "product: X, target: Y"
    const inputArg = args.find(a => a.startsWith('--input')) || args[0];
    if (inputArg && inputArg.includes(':')) {
      const pairs = inputArg.replace('--input=', '').split(',');
      pairs.forEach(pair => {
        const [key, value] = pair.split(':').map(s => s.trim());
        if (key === 'product') data.product = value;
        else if (key === 'target') data.target = value;
        else data.details[key] = value;
      });
      data.mode = 'create';
    }
    
    return data;
  }

  async createAvatar(data) {
    const avatar = {
      metadata: {
        createdAt: new Date().toISOString(),
        worker: this.name,
        version: this.version,
        product: data.product,
        targetAudience: data.target
      },
      
      // SEÇÃO 1: DADOS BÁSICOS
      basics: {
        product: data.product,
        targetAudience: data.target,
        idealCustomer: this.generateCustomerPersona(data.product, data.target),
        
        demographics: {
          name: this.generateName(data.target),
          ageRange: this.extractAgeRange(data.target),
          location: this.extractLocation(data.target),
          profession: this.extractProfession(data.target),
          income: this.estimateIncome(data.target),
          education: 'Medium to High',
          maritalStatus: 'Mixed',
          kids: 'Often has children'
        }
      },
      
      // SEÇÃO 2: PSICOGRÁFICO
      psychographics: {
        biggestDesire: data.details.biggestDesire || this.inferDesire(data.product, data.target),
        
        biggestFrustration: data.details.biggestFrustration || 
          `Cannot achieve ${this.inferDesire(data.product, data.target)} despite trying hard`,
          
        emotionalState: {
          primary: this.inferEmotionalState(data.product, data.target),
          secondary: ['Frustrated', 'Anxious', 'Overwhelmed', 'Doubtful'],
          cycle: 'Hope → Try → Fail → Frustration → Repeat'
        },
        
        fears: this.inferFears(data.product, data.target),
        
        whatTheyTried: (data.details.whatTried || 'Generic solutions that didn\'t work').split(','),
        
        onlineBehavior: {
          where: data.details.onlineHangs || this.inferOnlineHangs(data.target),
          influencers: data.details.influencers || [],
          contentType: ['Educational', 'Transformational', 'How-to']
        },
        
        pastPurchases: (data.details.pastPurchases || 'Competitor courses, generic solutions').split(',')
      },
      
      // SEÇÃO 3: DORES
      painPoints: {
        primary: {
          emotional: `Deep emotional pain of not being able to ${this.inferDesire(data.product, data.target)}`,
          logical: `Wasting time and money on solutions that don't work`,
          frequency: 'Daily - affects every decision'
        },
        
        secondary: [
          'Feeling stuck and hopeless',
          'Doubt that any solution will work',
          'Fear of wasting more money',
          'Overwhelmed by too many options',
          'Guilt about past failures'
        ],
        
        failedSolutions: this.generateFailedSolutions(data.product)
      },
      
      // SEÇÃO 4: DESEJOS
      desires: {
        primary: data.details.biggestDesire || this.inferDesire(data.product, data.target),
        
        visionOfFuture: data.details.lifeAfter || `A transformed life where ${data.target} finally achieves their goal and feels ${this.inferPositiveEmotion(data.product)}`,
        
        obstacles: (data.details.obstacles || 'Time, money, not knowing what works').split(','),
        
        ahaMoment: data.details.ahaMoment || `When they realize THIS solution is different and actually works`
      },
      
      // SEÇÃO 5: PSICOLOGIA
      psychology: {
        fears: this.inferFears(data.product, data.target),
        
        values: [
          'Results over promises',
          'Trust and credibility',
          'Simplicity over complexity',
          'Safety and guarantees',
          'Community and belonging'
        ],
        
        motivations: [
          `Desire to finally succeed where they failed before`,
          `Fear of continuing to suffer`,
          `Want to prove they can do it`,
          `Desire to inspire others`
        ],
        
        objections: this.generateObjections(data.product, data.priceRange || '$100-500'),
        
        trustBuilders: (data.details.trustBuilders || 'Results, guarantees, social proof, expert authority').split(', ')
      },
      
      // SEÇÃO 6: TRAUMA (Gatilhos Profundos)
      trauma: {
        coreWound: data.details.coreWound || 
          `Multiple failures trying to solve this problem, leading to deep skepticism and emotional exhaustion`,
        
        emotionalTriggers: {
          phrases: [
            'Finally achieve',
            'After years of struggling',
            'Proven system that works',
            `Transform your ${this.extractKeyFeature(data.target)}`
          ],
          images: [
            'Before/after transformations',
            'Happy, confident people',
            'Simple step-by-step process',
            'Results proof'
          ],
          stories: [
            'Someone just like them who succeeded',
            'Overcoming multiple failures',
            'The moment of breakthrough'
          ]
        },
        
        gutReactions: {
          resonates: [
            'Simple, clear process',
            'Guarantee of results',
            'Someone who understands their pain',
            'Proven track record'
          ],
          repels: [
            'Complex jargon',
            'Too good to be true claims',
            'No social proof',
            'High pressure tactics'
          ]
        }
      },
      
      // SEÇÃO 7: APLICAÇÕES DE MARKETING
      marketingApplications: {
        hooks: this.generateHooks(data.product, data.target),
        
        angles: {
          cold: `Finally, a ${data.product} that actually works for ${data.target}`,
          warm: `The secret method that ${this.extractKeyFeature(data.target)} don't want you to know`,
          hot: `Ready to finally achieve ${this.inferDesire(data.product, data.target)}?`
        },
        
        contentIdeas: {
          posts: [
            'The truth about why most solutions fail',
            '5 signs you\'re ready for transformation',
            'What successful people do differently',
            'The moment everything changed'
          ],
          emails: [
            `Are you still struggling with ${this.extractKeyPain(data.target)}?`,
            `What if ${this.inferDesire(data.product, data.target)} was actually possible?`,
            'The method that changed everything'
          ],
          webinar: `How to ${this.inferDesire(data.product, data.target)} without the frustration`
        },
        
        offerStructure: {
          entryPoint: data.priceRange || '$97-197',
          coreProduct: data.priceRange || '$297-497',
          premium: data.priceRange || '$997-1997',
          keyBenefitToLead: this.inferDesire(data.product, data.target),
          mainObjection: data.details.mainObjection || 'Will this actually work for me?'
        }
      }
    };
    
    // Salvar avatar
    const outputPath = `results/avatars/avatar-${Date.now()}.json`;
    fs.writeFileSync(outputPath, JSON.stringify(avatar, null, 2));
    
    // Mostrar output
    this.printAvatarSummary(avatar);
    
    console.log(`\n✅ Avatar saved: ${outputPath}`);
    return avatar;
  }

  generateCustomerPersona(product, target) {
    return `Someone struggling with ${product} who wants results but has been disappointed before`;
  }

  generateName(target) {
    const names = ['Marina', 'Carla', 'Patricia', 'Juliana', 'Renata', 'Fernanda', 'Ana', 'Sandra'];
    return names[Math.floor(Math.random() * names.length)];
  }

  extractAgeRange(target) {
    const match = target.match(/(\d+)[\s-]*(\d+)/);
    if (match) return `${match[1]}-${match[2]}`;
    return '35-55';
  }

  extractLocation(target) {
    if (target.toLowerCase().includes('brasil') || target.toLowerCase().includes('brazil')) return 'Brazil - Major Cities';
    if (target.toLowerCase().includes('sp')) return 'São Paulo, Brazil';
    return 'Urban Brazil';
  }

  extractProfession(target) {
    if (target.toLowerCase().includes('empreendedor')) return 'Entrepreneur';
    if (target.toLowerCase().includes('mãe') || target.toLowerCase().includes('mamae')) return 'Homemaker/Mother';
    if (target.toLowerCase().includes('trabalhador')) return 'Professional/Employee';
    return 'Mixed - Various Professions';
  }

  estimateIncome(target) {
    return 'R$5.000 - R$15.000/month';
  }

  inferDesire(product, target) {
    const desires = {
      'emagrecer': 'lose weight and feel confident',
      'dinheiro': 'make more money',
      'cabelo': 'have beautiful, healthy hair',
      'negocio': 'build a successful business',
      'relacionamento': 'find or improve relationships',
      'saude': 'improve health and energy'
    };
    
    const lowerProduct = (product || '').toLowerCase();
    for (const [key, value] of Object.entries(desires)) {
      if (lowerProduct.includes(key)) return value;
    }
    
    return 'achieve their goals and transform their life';
  }

  inferEmotionalState(product, target) {
    const states = {
      'emagrecer': ['Frustrated with their body', 'Ashamed in social situations', 'Tired of trying'],
      'dinheiro': ['Anxious about finances', 'Frustrated with income', 'Motivated but stuck'],
      'cabelo': ['Embarrassed about appearance', 'Frustrated with failed treatments', 'Hopeful for solutions'],
      'negocio': ['Excited but overwhelmed', 'Frustrated with slow results', 'Determined to succeed']
    };
    
    const lowerProduct = (product || '').toLowerCase();
    for (const [key, value] of Object.entries(states)) {
      if (lowerProduct.includes(key)) return value[0];
    }
    
    return 'Frustrated with lack of results';
  }

  inferFears(product, target) {
    return [
      `Fear of wasting more money on another solution that doesn't work`,
      `Fear of never achieving their goals`,
      `Fear of being judged for failing again`,
      `Fear of being scammed`,
      `Fear of not having enough time`
    ];
  }

  inferOnlineHangs(target) {
    return ['Instagram', 'YouTube', 'WhatsApp', 'Facebook Groups', 'Google Searches'];
  }

  generateFailedSolutions(product) {
    return [
      { solution: 'Generic courses', whyFailed: 'Not personalized enough' },
      { solution: 'fad diets/products', whyFailed: 'No sustainable results' },
      { solution: 'Trying alone', whyFailed: 'No accountability or guidance' },
      { solution: 'Expensive treatments', whyFailed: 'Too expensive or painful' }
    ];
  }

  inferPositiveEmotion(product) {
    return 'confident and accomplished';
  }

  extractKeyFeature(target) {
    return 'situation';
  }

  extractKeyPain(target) {
    return 'problem';
  }

  generateObjections(product, priceRange) {
    return [
      { objection: 'Will this actually work for me?', response: 'Guaranteed results or money back' },
      { objection: `Is ${priceRange} too expensive?`, response: 'Compare to cost of NOT solving the problem' },
      { objection: 'I tried before and failed', response: 'This method is different - addresses root cause' },
      { objection: 'I don\'t have time', response: 'Designed for busy people - just 15 min/day' }
    ];
  }

  generateHooks(product, target) {
    return [
      {
        type: 'PROBLEMA',
        hook: `Stop wasting money on ${product} that doesn't work. Here's the real solution.`
      },
      {
        type: 'RESULTADO',
        hook: `How to ${this.inferDesire(product, target)} without the frustration`
      },
      {
        type: 'CURIOSIDADE',
        hook: `The ${product} secret that experts don't want you to know`
      },
      {
        type: 'CONTROVERSIA',
        hook: `Why everything you've tried about ${product} is wrong`
      },
      {
        type: 'PROVA SOCIAL',
        hook: `How 10,000+ ${target} transformed their results`
      },
      {
        type: 'TUTORIAL',
        hook: `3 simple steps to ${this.inferDesire(product, target)} starting today`
      }
    ];
  }

  printAvatarSummary(avatar) {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 AVATAR SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n📌 Customer: ${avatar.basics.demographics.name}`);
    console.log(`📌 Age: ${avatar.basics.demographics.ageRange}`);
    console.log(`📌 Location: ${avatar.basics.demographics.location}`);
    
    console.log(`\n🔥 PRIMARY DESIRE:`);
    console.log(`   "${avatar.desires.primary}"`);
    
    console.log(`\n😖 PRIMARY PAIN:`);
    console.log(`   "${avatar.painPoints.primary.emotional}"`);
    
    console.log(`\n💰 OFFER STRUCTURE:`);
    console.log(`   Entry: ${avatar.marketingApplications.offerStructure.entryPoint}`);
    console.log(`   Core: ${avatar.marketingApplications.offerStructure.coreProduct}`);
    console.log(`   Premium: ${avatar.marketingApplications.offerStructure.premium}`);
    
    console.log(`\n🎯 TOP HOOK:`);
    console.log(`   "${avatar.marketingApplications.hooks[0].hook}"`);
  }

  showHelp() {
    console.log(`
🔥 ALEX-AVATAR WORKER v${this.version}

Usage:
  node scripts/workers/avatar/worker.js --input "product: X, target: Y"
  node scripts/workers/avatar/worker.js --interactive
  node scripts/workers/avatar/worker.js --template default

Examples:
  node scripts/workers/avatar/worker.js --input "product: curso de emagrecimento, target: mulheres 35-50"
  node scripts/workers/avatar/worker.js --input "product: treinamento empresarial, target: empreendedores"

Output:
  Creates detailed avatar JSON in results/avatars/
`);
  }

  async runInteractive() {
    console.log('\n🎯 ALEX-AVATAR - Interactive Mode');
    console.log('='.repeat(60));
    console.log('Answer questions to build your avatar. Press Enter to skip.\n');
    
    // Este modo seria implementado com prompts interativos
    console.log('📝 Interactive mode would prompt for:');
    console.log('   1. Product/Service');
    console.log('   2. Target Audience');  
    console.log('   3. Main Benefit');
    console.log('   4. Deep desires');
    console.log('   5. Pain points');
    console.log('   6. Past failures');
    console.log('   7. Fears and objections');
    console.log('   8. Trust builders');
    
    console.log('\n💡 Tip: Use --input for faster avatar creation');
  }
}

// CLI
const worker = new AvatarWorker();
worker.run(process.argv.slice(2).join(' '));
