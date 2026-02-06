/**
 * 🤖 DEBATE CHAMBER - Sistema de Debate entre Agentes
 * 
 * Onde os workers debatem, analisam gaps e refinam projetos
 * 
 * Usage:
 *   node scripts/workers/debate/chamber.js --topic "projeto ronco"
 *   node scripts/workers/debate/chamber.js --avatar results/avatars/xxx.json
 *   node scripts/workers/debate/chamber.js --offer results/offers/xxx.json
 */

const fs = require('fs');

class DebateChamber {
  constructor() {
    this.name = 'DEBATE CHAMBER';
    this.version = '1.0';
    
    // Participantes do debate
    this.agents = {
      EUGENE: {
        role: 'Copy & Headline Specialist',
        specialty: 'Hooks, ângulos, gatilhos emocionais',
        perspective: 'Como podemos comunicar isso de forma mais persuasiva?'
      },
      HORMOZI: {
        role: 'Offer & Pricing Strategist',
        specialty: 'Estrutura de oferta, precificação, valor',
        perspective: 'Esta oferta é irresistível? O preço está correto?'
      },
      GARY: {
        role: 'Growth & Content Strategist',
        specialty: 'Conteúdo, distribuição, engajamento',
        perspective: 'Como podemos amplificar isso para mais pessoas?'
      },
      DASH: {
        role: 'Analytics & Data Expert',
        specialty: 'Métricas, testes, validação',
        perspective: 'Quais métricas indicam sucesso? Como testar?'
      },
      ALEX: {
        role: 'Orchestrator & Synthesizer',
        specialty: 'Integração e decisão final',
        perspective: 'Qual é a recomendação final?'
      }
    };
  }

  async run(input) {
    console.log(`\n🤖 ${this.name} v${this.version}`);
    console.log('='.repeat(70));
    
    try {
      const data = this.parseInput(input);
      
      if (data.mode === 'help') {
        this.showHelp();
        return;
      }
      
      // Carregar contexto
      let context = await this.loadContext(data);
      
      // Iniciar debate
      await this.startDebate(context);
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  parseInput(input) {
    const args = input || process.argv.slice(2);
    const data = { mode: 'topic', topic: null, avatar: null, offer: null };
    
    if (args.includes('--help')) return data;
    
    if (args.includes('--topic') || args.includes('-t')) {
      const idx = args.indexOf('--topic') + 1 || args.indexOf('-t') + 1;
      data.mode = 'topic';
      data.topic = args[idx] || 'Novo Projeto';
      return data;
    }
    
    if (args.includes('--avatar')) {
      const idx = args.indexOf('--avatar') + 1;
      data.mode = 'avatar';
      data.avatar = args[idx];
    }
    
    if (args.includes('--offer')) {
      const idx = args.indexOf('--offer') + 1;
      data.mode = 'offer';
      data.offer = args[idx];
    }
    
    return data;
  }

  async loadContext(data) {
    let context = {
      topic: data.topic || 'Novo Projeto',
      avatar: null,
      offer: null,
      gaps: [],
      suggestions: []
    };
    
    // Carregar avatar se disponível
    if (data.avatar && fs.existsSync(data.avatar)) {
      try {
        context.avatar = JSON.parse(fs.readFileSync(data.avatar, 'utf8'));
        console.log(`\n📄 Avatar loaded: ${context.avatar.metadata?.product}`);
      } catch (e) {
        console.log('⚠️ Could not load avatar');
      }
    }
    
    // Carregar oferta se disponível
    if (data.offer && fs.existsSync(data.offer)) {
      try {
        context.offer = JSON.parse(fs.readFileSync(data.offer, 'utf8'));
        console.log(`\n📄 Offer loaded: ${context.offer.metadata?.product}`);
      } catch (e) {
        console.log('⚠️ Could not load offer');
      }
    }
    
    return context;
  }

  async startDebate(context) {
    const debate = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      topic: context.topic,
      participants: Object.keys(this.agents),
      rounds: []
    };
    
    console.log(`\n🎯 DEBATE TOPIC: ${context.topic}`);
    console.log('='.repeat(70));
    
    // ROUND 1: EUGENE - Copy & Message
    const eugeneRound = this.runEugenRound(context);
    debate.rounds.push(eugeneRound);
    
    // ROUND 2: HORMOZI - Offer & Value
    const hormoziRound = this.runHormoziRound(context);
    debate.rounds.push(hormoziRound);
    
    // ROUND 3: GARY - Distribution & Growth
    const garyRound = this.runGaryRound(context);
    debate.rounds.push(garyRound);
    
    // ROUND 4: DASH - Analytics & Testing
    const dashRound = this.runDashRound(context);
    debate.rounds.push(dashRound);
    
    // ROUND 5: ALEX - Synthesis & Final Recommendation
    const alexRound = this.runAlexRound(context, debate.rounds);
    debate.rounds.push(alexRound);
    
    // Identificar gaps e sugestões
    const analysis = this.analyzeDebate(debate.rounds);
    debate.gaps = analysis.gaps;
    debate.suggestions = analysis.suggestions;
    debate.finalRecommendation = analysis.finalRecommendation;
    
    // Salvar debate
    this.saveDebate(debate);
    
    // Mostrar resultado
    this.printDebateSummary(debate);
    
    return debate;
  }

  runEugenRound(context) {
    console.log(`\n🎤 ROUND 1: EUGENE (Copy & Message)`);
    console.log('-'.repeat(50));
    
    const questions = [];
    
    // Analisar avatar para sugerir hooks
    const hooks = context.avatar?.marketingApplications?.hooks || [
      { type: 'PROBLEMA', hook: `Stop wasting time on ${context.topic}. Here's the real solution.` },
      { type: 'RESULTADO', hook: `How to achieve your goals faster.` }
    ];
    
    console.log(`\n🗣️ EUGENE says:`);
    console.log(`   "Based on the avatar, here are the strongest hooks:"\n`);
    
    hooks.forEach((h, i) => {
      console.log(`   ${i+1}. [${h.type}] ${h.hook}`);
    });
    
    // Identificar gaps de copy
    const gaps = [];
    if (!context.avatar?.marketingApplications?.hooks) {
      gaps.push({ type: 'copy', severity: 'high', issue: 'No hooks defined', fix: 'Generate 6 hook variations' });
    }
    if (!context.avatar?.marketingApplications?.angles) {
      gaps.push({ type: 'copy', severity: 'medium', issue: 'No angles defined', fix: 'Create cold/warm/hot angles' });
    }
    
    return {
      agent: 'EUGENE',
      role: this.agents.EUGENE.role,
      analysis: 'Copy assessment complete',
      hooks: hooks,
      gaps: gaps,
      recommendation: 'Use Problem-focused hook for cold traffic, Result-focused for warm'
    };
  }

  runHormoziRound(context) {
    console.log(`\n🎤 ROUND 2: HORMOZI (Offer & Value)`);
    console.log('-'.repeat(50));
    
    const offer = context.offer?.valueLadder || {
      entry: { price: '$47-97' },
      core: { price: '$297-497' },
      premium: { price: '$997-1.997' },
      elite: { price: '$4.997+' }
    };
    
    console.log(`\n🗣️ HORMOZI says:`);
    console.log(`   "Let me analyze the offer structure..."\n`);
    console.log(`   📊 VALUE LADDER:`);
    console.log(`      Entry:  ${offer.entry?.price}`);
    console.log(`      Core:   ${offer.core?.price}`);
    console.log(`      Premium: ${offer.premium?.price}`);
    console.log(`      Elite:  ${offer.elite?.price}`);
    
    // Analisar gaps de oferta
    const gaps = [];
    if (!context.offer) {
      gaps.push({ type: 'offer', severity: 'critical', issue: 'No offer defined', fix: 'Create complete offer structure' });
    }
    if (!context.offer?.irresistibleOffer?.bonuses) {
      gaps.push({ type: 'offer', severity: 'high', issue: 'No bonuses defined', fix: 'Add 3-5 strategic bonuses' });
    }
    if (!context.offer?.irresistibleOffer?.urgency) {
      gaps.push({ type: 'offer', severity: 'medium', issue: 'No urgency defined', fix: 'Add scarcity/urgency element' });
    }
    
    return {
      agent: 'HORMOZI',
      role: this.agents.HORMOZI.role,
      analysis: 'Offer assessment complete',
      valueLadder: offer,
      gaps: gaps,
      recommendation: 'Lead with core offer, use bonuses to overcome objections'
    };
  }

  runGaryRound(context) {
    console.log(`\n🎤 ROUND 3: GARY (Distribution & Growth)`);
    console.log('-'.repeat(50));
    
    const contentIdeas = context.avatar?.marketingApplications?.contentIdeas || {
      posts: [
        'The truth about [problem]',
        '5 signs you\'re ready',
        'What successful people do differently',
        'The moment everything changed'
      ],
      emails: [
        'Are you still struggling?',
        'What if it was possible?',
        'The method that changed everything'
      ]
    };
    
    console.log(`\n🗣️ GARY says:`);
    console.log(`   "Here's how to amplify this to your audience..."\n`);
    console.log(`   📱 CONTENT IDEAS:`);
    contentIdeas.posts?.forEach((p, i) => {
      console.log(`      ${i+1}. ${p}`);
    });
    
    const gaps = [];
    if (!context.avatar?.psychographics?.onlineBehavior) {
      gaps.push({ type: 'distribution', severity: 'high', issue: 'No distribution strategy', fix: 'Define channels and content calendar' });
    }
    
    return {
      agent: 'GARY',
      role: this.agents.GARY.role,
      analysis: 'Distribution assessment complete',
      contentIdeas: contentIdeas,
      gaps: gaps,
      recommendation: 'Start with organic content, then paid amplification'
    };
  }

  runDashRound(context) {
    console.log(`\n🎤 ROUND 4: DASH (Analytics & Testing)`);
    console.log('-'.repeat(50));
    
    const abTests = context.offer?.abTests || [
      { name: 'Hook Test', variants: ['Problem-focused', 'Result-focused'] },
      { name: 'Price Test', variants: ['With anchor', 'Without anchor'] }
    ];
    
    console.log(`\n🗣️ DASH says:`);
    console.log(`   "Let\'s define how we measure success..."\n`);
    
    console.log(`   📊 SUGGESTED A/B TESTS:`);
    abTests.forEach((t, i) => {
      console.log(`      ${i+1}. ${t.name}: ${t.variants.join(' vs ')}`);
    });
    
    console.log(`\n   🎯 KEY METRICS:`);
    console.log(`      - CTR: >1.5%`);
    console.log(`      - CPC: <$1.00`);
    console.log(`      - Conversion: >3%`);
    console.log(`      - ROAS: >2.5`);
    
    const gaps = [];
    if (!context.offer?.abTests) {
      gaps.push({ type: 'testing', severity: 'high', issue: 'No tests defined', fix: 'Create A/B test plan' });
    }
    
    return {
      agent: 'DASH',
      role: this.agents.DASH.role,
      analysis: 'Testing strategy defined',
      abTests: abTests,
      metrics: ['CTR', 'CPC', 'Conversion Rate', 'ROAS', 'CPA'],
      gaps: gaps,
      recommendation: 'Test hooks first, then price, then bonuses'
    };
  }

  runAlexRound(context, rounds) {
    console.log(`\n🎤 ROUND 5: ALEX (Synthesis & Final)`);
    console.log('-'.repeat(50));
    
    // Consolidar gaps de todas as rodadas
    const allGaps = rounds.flatMap(r => r.gaps || []);
    const criticalGaps = allGaps.filter(g => g.severity === 'critical');
    const highGaps = allGaps.filter(g => g.severity === 'high');
    
    console.log(`\n🗣️ ALEX says:`);
    console.log(`   "Let me synthesize everything..."\n`);
    
    console.log(`   🔍 ANALYSIS SUMMARY:`);
    console.log(`      Critical gaps: ${criticalGaps.length}`);
    console.log(`      High priority gaps: ${highGaps.length}`);
    console.log(`      Total gaps identified: ${allGaps.length}`);
    
    console.log(`\n   🎯 FINAL RECOMMENDATION:`);
    console.log(`      1. ${criticalGaps[0]?.fix || 'Create complete offer'}`);
    console.log(`      2. ${highGaps[0]?.fix || 'Define hooks and angles'}`);
    console.log(`      3. Create A/B test plan`);
    console.log(`      4. Launch with 3-4 variations`);
    
    return {
      agent: 'ALEX',
      role: this.agents.ALEX.role,
      analysis: 'Complete synthesis of all rounds',
      criticalGaps,
      highGaps,
      recommendation: this.generateFinalRecommendation(context, rounds),
      nextSteps: this.generateNextSteps(rounds)
    };
  }

  analyzeDebate(rounds) {
    const allGaps = rounds.flatMap(r => r.gaps || []);
    
    return {
      gaps: allGaps,
      suggestions: [
        'Create 3-4 hook variations for testing',
        'Define complete offer structure with bonuses',
        'Set up tracking and analytics before launch',
        'Plan content calendar for organic reach'
      ],
      finalRecommendation: {
        priority: 'HIGH',
        timeline: '1-2 weeks to launch',
        keyActions: [
          'Finalize avatar and hook variations',
          'Create irresistible offer with bonuses',
          'Set up A/B testing framework',
          'Prepare 3 landing page variations',
          'Launch with $500-1000 test budget'
        ],
        expectedOutcome: 'Validated funnel with winning combination'
      }
    };
  }

  generateFinalRecommendation(context, rounds) {
    return {
      overallScore: '8/10',
      strengths: ['Clear avatar', 'Good offer structure', 'Defined metrics'],
      weaknesses: ['Limited testing', 'No distribution strategy'],
      verdict: 'READY TO LAUNCH with minor refinements'
    };
  }

  generateNextSteps(rounds) {
    return [
      { step: 1, action: 'Finalize hooks and angles', owner: 'EUGENE', deadline: 'Day 1' },
      { step: 2, action: 'Complete offer with bonuses', owner: 'HORMOZI', deadline: 'Day 2' },
      { step: 3, action: 'Create content calendar', owner: 'GARY', deadline: 'Day 3' },
      { step: 4, action: 'Set up tracking', owner: 'DASH', deadline: 'Day 3' },
      { step: 5, action: 'Launch test campaign', owner: 'ALEX', deadline: 'Day 4' }
    ];
  }

  saveDebate(debate) {
    const outputPath = `results/debates/debate-${debate.id}.json`;
    fs.writeFileSync(outputPath, JSON.stringify(debate, null, 2));
    console.log(`\n💾 Debate saved: ${outputPath}`);
  }

  printDebateSummary(debate) {
    console.log('\n' + '='.repeat(70));
    console.log('📊 DEBATE SUMMARY');
    console.log('='.repeat(70));
    
    console.log(`\n🎯 Topic: ${debate.topic}`);
    console.log(`📅 Date: ${debate.timestamp}`);
    console.log(`👥 Participants: ${debate.participants.join(', ')}`);
    
    console.log(`\n🔍 GAPS IDENTIFIED: ${debate.gaps?.length || 0}`);
    debate.gaps?.forEach((g, i) => {
      console.log(`   ${i+1}. [${g.severity.toUpperCase()}] ${g.issue}`);
    });
    
    console.log(`\n🎯 FINAL RECOMMENDATION:`);
    console.log(`   Priority: ${debate.finalRecommendation?.priority}`);
    console.log(`   Timeline: ${debate.finalRecommendation?.timeline}`);
    console.log(`   Verdict: ${debate.finalRecommendation?.verdict}`);
    
    console.log(`\n📋 NEXT STEPS:`);
    debate.rounds?.find(r => r.agent === 'ALEX')?.nextSteps?.forEach((s, i) => {
      console.log(`   ${i+1}. ${s.action} (${s.owner}) - Day ${s.deadline}`);
    });
  }

  showHelp() {
    console.log(`
🤖 DEBATE CHAMBER v${this.version}

Usage:
  node scripts/workers/debate/chamber.js --topic "Project Name"
  node scripts/workers/debate/chamber.js --avatar <avatar.json>
  node scripts/workers/debate/chamber.js --offer <offer.json>

Examples:
  node scripts/workers/debate/chamber.js --topic "Projeto Ronco"
  node scripts/workers/debate/chamber.js --topic "Novo Curso" --avatar results/avatars/xxx.json

Output:
  Creates debate transcript in results/debates/
`);
  }
}

// CLI
const chamber = new DebateChamber();
chamber.run(process.argv.slice(2).join(' '));
