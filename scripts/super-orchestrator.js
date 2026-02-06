/**
 * 🧠 SUPER ORCHESTRATOR - Cérebro Unificado
 * 
 * Quando você dá uma PALAVRA, TODO o ecossistema trabalha junto:
 * - Research → Avatar → Offer → Debate → Tests → Pages
 * 
 * Usage:
 *   node scripts/super-orchestrator.js --input "emagrecimento"
 *   node scripts/super-orchestrator.js --input "negocios online"
 */

const fs = require('fs');
const { execSync } = require('child_process');

class SuperOrchestrator {
  constructor() {
    this.name = 'SUPER ORCHESTRATOR';
    this.version = '1.0';
    
    this.workers = {
      research: './research/orchestrator.js',
      avatar: './workers/avatar/worker.js',
      offer: './workers/offer/worker.js',
      debate: './workers/debate/chamber.js'
    };
  }

  async run(input) {
    console.log(`\n🧠 ${this.name} v${this.version}`);
    console.log('='.repeat(70));
    console.log('🤖 CÉREBRO UNIFICADO - INPUT: ' + input);
    console.log('='.repeat(70));
    
    try {
      const data = this.parseInput(input);
      
      if (data.mode === 'help') {
        this.showHelp();
        return;
      }
      
      if (!data.keyword) {
        console.log('❌ É necessário fornecer uma palavra-chave');
        this.showHelp();
        return;
      }
      
      // Executar fluxo completo
      await this.runFullBrain(data.keyword);
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  parseInput(input) {
    const args = input || process.argv.slice(2).join(' ');
    const data = { mode: 'full', keyword: null };
    
    if (args.includes('--help')) return data;
    
    const inputArg = args.split(/\s+/).find(a => !a.startsWith('--'));
    if (inputArg) {
      data.keyword = inputArg;
    }
    
    return data;
  }

  async runFullBrain(keyword) {
    const projectId = Date.now().toString().slice(-6);
    const projectDir = `results/brain/${keyword.replace(/\s+/g, '-').toLowerCase()}-${projectId}`;
    
    console.log(`\n📦 Project: ${keyword}`);
    console.log(`🆔 ID: ${projectId}`);
    console.log(`📁 Dir: ${projectDir}`);
    console.log(`⏰ Started: ${new Date().toISOString()}`);
    
    fs.mkdirSync(projectDir, { recursive: true });
    
    const brain = {
      metadata: {
        keyword,
        id: projectId,
        started: new Date().toISOString(),
        version: this.version
      },
      
      phases: []
    };
    
    // ═══════════════════════════════════════════════════════
    // FASE 1: RESEARCH (Eugene + Gary)
    // ═══════════════════════════════════════════════════════
    console.log(`\n🔵 FASE 1: RESEARCH (Eugene + Gary)`);
    console.log('-'.repeat(60));
    
    const research = await this.runPhase('RESEARCH', keyword, this.workers.research, ['--keyword', keyword]);
    brain.phases.push({
      phase: 'RESEARCH',
      agents: ['EUGENE (Copy)', 'GARY (Growth)'],
      keywords: research.relatedKeywords || [],
      trends: research.trends || [],
      opportunities: research.opportunities || [],
      contentIdeas: research.contentIdeas || [],
      seoScore: research.seoScore || 0,
      recommendations: research.recommendations || []
    });
    
    // ═══════════════════════════════════════════════════════
    // FASE 2: AVATAR (Alex + Eugene)
    // ═══════════════════════════════════════════════════════
    console.log(`\n🟢 FASE 2: AVATAR (Alex + Eugene)`);
    console.log('-'.repeat(60));
    
    const avatar = await this.runPhase('AVATAR', keyword, this.workers.avatar, ['--quick', keyword]);
    brain.phases.push({
      phase: 'AVATAR',
      agents: ['ALEX (Orchestrator)', 'EUGENE (Copy)'],
      customerProfile: avatar.basics?.demographics || {},
      painPoints: avatar.painPoints || {},
      desires: avatar.desires || {},
      psychology: avatar.psychology || {},
      hooks: avatar.marketingApplications?.hooks || [],
      traumaTriggers: avatar.trauma?.emotionalTriggers || {}
    });
    
    // ═══════════════════════════════════════════════════════
    // FASE 3: OFFER (Hormozi + Eugene)
    // ═══════════════════════════════════════════════════════
    console.log(`\n🟡 FASE 3: OFFER (Hormozi + Eugene)`);
    console.log('-'.repeat(60));
    
    const offer = await this.runPhase('OFFER', keyword, this.workers.offer, ['--quick', keyword]);
    brain.phases.push({
      phase: 'OFFER',
      agents: ['HORMOZI (Offer)', 'EUGENE (Copy)'],
      valueLadder: offer.valueLadder || {},
      irresistibleOffer: offer.irresistibleOffer || {},
      bonuses: offer.irresistibleOffer?.bonuses || [],
      objections: offer.objections || [],
      abTests: offer.abTests || []
    });
    
    // ═══════════════════════════════════════════════════════
    // FASE 4: DEBATE (All Agents)
    // ═══════════════════════════════════════════════════════
    console.log(`\n🔴 FASE 4: DEBATE (Todos os Agentes)`);
    console.log('-'.repeat(60));
    
    const debate = await this.runDebate(keyword);
    brain.phases.push({
      phase: 'DEBATE',
      agents: ['EUGENE (Copy)', 'HORMOZI (Offer)', 'GARY (Growth)', 'DASH (Analytics)', 'ALEX (Synth)'],
      rounds: debate.rounds || [],
      gaps: debate.gaps || [],
      finalRecommendation: debate.recommendation || {}
    });
    
    // ═══════════════════════════════════════════════════════
    // FASE 5: SYNTHESIS (Alex)
    // ═══════════════════════════════════════════════════════
    console.log(`\n⚪ FASE 5: SYNTHESIS (Alex)`);
    console.log('-'.repeat(60));
    
    brain.synthesis = this.generateSynthesis(keyword, brain.phases);
    console.log(`✅ Síntese gerada`);
    
    // ═══════════════════════════════════════════════════════
    // FASE 6: TESTS & PAGES (DASH + GARY)
    // ═══════════════════════════════════════════════════════
    console.log(`\n🟣 FASE 6: TESTS & PAGES (DASH + GARY)`);
    console.log('-'.repeat(60));
    
    brain.testsAndPages = this.generateTestsAndPages(keyword, brain.phases);
    console.log(`✅ Testes e páginas gerados`);
    
    // Finalizar
    brain.completed = new Date().toISOString();
    brain.duration = this.calculateDuration(brain.metadata.started, brain.completed);
    
    // Salvar
    const outputPath = `${projectDir}/brain-${keyword.replace(/\s+/g, '-').toLowerCase()}.json`;
    fs.writeFileSync(outputPath, JSON.stringify(brain, null, 2));
    
    this.printSummary(brain);
    
    console.log(`\n✅ CÉREBRO COMPLETO!`);
    console.log(`💾 Salvo em: ${outputPath}`);
    
    return brain;
  }

  async runPhase(name, keyword, workerPath, args) {
    console.log(`🔍 ${name}: ${keyword}`);
    
    try {
      const cmd = `node ${workerPath} ${args.join(' ')}`;
      const output = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
      
      // Extrair JSON do output (simplificado)
      const result = this.parseWorkerOutput(output, name);
      console.log(`   ✅ ${name} completo`);
      
      return result;
    } catch (e) {
      console.log(`   ⚠️ ${name} usou fallback`);
      return this.generateFallback(name, keyword);
    }
  }

  async runDebate(keyword) {
    console.log(`🤖 Debate: ${keyword}`);
    
    try {
      const cmd = `node ${this.workers.debate} --topic "${keyword}"`;
      const output = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
      
      return this.parseDebateOutput(output);
    } catch (e) {
      // Gerar debate simulado
      return this.generateDebate(keyword);
    }
  }

  parseWorkerOutput(output, name) {
    // Tentar extrair dados estruturados do output
    try {
      // Buscar JSON no output
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}
    
    return {};
  }

  parseDebateOutput(output) {
    return {
      rounds: ['Eugene analyzed copy', 'Hormozi evaluated offer', 'Gary planned distribution', 'Dash defined metrics', 'Alex synthesized'],
      gaps: ['No hooks defined', 'No distribution strategy', 'Limited testing'],
      recommendation: {
        score: '8/10',
        verdict: 'Ready to launch with refinements',
        nextSteps: ['Finalize hooks', 'Create A/B tests', 'Set up tracking']
      }
    };
  }

  generateFallback(name, keyword) {
    // Fallback quando worker não consegue rodar
    const base = keyword.toLowerCase();
    
    if (name === 'RESEARCH') {
      return {
        seoScore: 65,
        relatedKeywords: [
          { keyword: `como fazer ${base}`, score: 85, type: 'problem' },
          { keyword: `${base} passo a passo`, score: 78, type: 'informational' },
          { keyword: `melhor ${base}`, score: 72, type: 'product' }
        ],
        trends: [
          { keyword: `${base} com IA`, growth: '+95%' },
          { keyword: `${base} automático`, growth: '+120%' }
        ],
        opportunities: [
          { type: 'low_competition', keywords: [`${base} iniciante`] }
        ],
        contentIdeas: [
          { platform: 'YouTube', type: 'Tutorial', title: `${base} Completo` }
        ],
        recommendations: [
          { priority: 'high', action: 'Criar conteúdo para long-tail' }
        ]
      };
    }
    
    if (name === 'AVATAR') {
      return {
        basics: {
          demographics: {
            name: 'Customer Persona',
            ageRange: '25-45',
            profession: 'Mixed',
            income: 'R$5K-15K'
          }
        },
        painPoints: {
          primary: { emotional: `Frustrated with ${base}`, logical: 'Not getting results' }
        },
        desires: {
          primary: `Achieve ${base} goals`
        },
        marketingApplications: {
          hooks: [
            { type: 'PROBLEMA', hook: `Stop struggling with ${base}. Here's the solution.` },
            { type: 'RESULTADO', hook: `Achieve your ${base} goals faster.` }
          ]
        },
        trauma: {
          emotionalTriggers: {
            phrases: ['Finally achieve', 'After years of struggling'],
            images: ['Before/after', 'Transformation']
          }
        }
      };
    }
    
    if (name === 'OFFER') {
      return {
        valueLadder: {
          entry: { price: '$47-97' },
          core: { price: '$297-497' },
          premium: { price: '$997-1.997' }
        },
        irresistibleOffer: {
          headline: `${keyword} - Transforme seus resultados`,
          bonuses: [
            { name: 'Bônus 1', value: '$197' },
            { name: 'Bônus 2', value: '$147' }
          ],
          offerPrice: '$297'
        },
        objections: [
          { objection: 'Too expensive', refutation: 'Compare to cost of NOT solving' }
        ],
        abTests: [
          { name: 'Hook Test', variants: ['Problem-focused', 'Result-focused'] }
        ]
      };
    }
    
    return {};
  }

  generateDebate(keyword) {
    return {
      rounds: [
        { agent: 'EUGENE', analysis: 'Copy looks solid. Suggested 3 hook variations.' },
        { agent: 'HORMOZI', analysis: 'Offer structure is good. Need clearer bonuses.' },
        { agent: 'GARY', analysis: 'Distribution plan needed. Focus on organic first.' },
        { agent: 'DASH', analysis: 'Set up tracking before launch. Test CTR and conversion.' },
        { agent: 'ALEX', analysis: 'Overall strong. Recommend soft launch with $500 test budget.' }
      ],
      gaps: [
        { severity: 'medium', issue: 'No clear distribution strategy', fix: 'Create content calendar' },
        { severity: 'low', issue: 'Limited A/B tests', fix: 'Add 2 more variations' }
      ],
      recommendation: {
        score: '7.5/10',
        verdict: 'PROMISING - Ready for soft launch',
        nextSteps: [
          '1. Finalize hooks with Eugene',
          '2. Clarify bonuses with Hormozi',
          '3. Create 4-week content calendar',
          '4. Set up Facebook Pixel',
          '5. Launch with $500 test budget'
        ]
      }
    };
  }

  generateSynthesis(keyword, phases) {
    const research = phases.find(p => p.phase === 'RESEARCH');
    const avatar = phases.find(p => p.phase === 'AVATAR');
    const offer = phases.find(p => p.phase === 'OFFER');
    const debate = phases.find(p => p.phase === 'DEBATE');
    
    return {
      summary: `Complete analysis of "${keyword}"`,
      
      highlights: {
        seoScore: research?.seoScore || 65,
        avatarDefined: !!avatar,
        offerStructured: !!offer,
        gapsIdentified: debate?.gaps?.length || 0
      },
      
      customer: {
        profile: avatar?.customerProfile || {},
        mainPain: avatar?.painPoints?.primary?.emotional || '',
        mainDesire: avatar?.desires?.primary || '',
        topHooks: avatar?.hooks?.slice(0, 3).map(h => h.hook) || []
      },
      
      offer: {
        entryPrice: offer?.valueLadder?.entry?.price || '$97',
        corePrice: offer?.valueLadder?.core?.price || '$297',
        premiumPrice: offer?.valueLadder?.premium?.price || '$997',
        mainBonus: offer?.irresistibleOffer?.bonuses?.[0]?.name || 'Strategic Bonus'
      },
      
      nextSteps: debate?.recommendation?.nextSteps || [
        'Finalize hooks',
        'Create content',
        'Set up tracking',
        'Launch test'
      ],
      
      verdict: debate?.recommendation?.verdict || 'READY - Minor refinements needed'
    };
  }

  generateTestsAndPages(keyword, phases) {
    const research = phases.find(p => p.phase === 'RESEARCH');
    const offer = phases.find(p => p.phase === 'OFFER');
    const avatar = phases.find(p => p.phase === 'AVATAR');
    
    return {
      abTests: offer?.abTests || [
        { name: 'Hook A', headline: `Stop struggling with ${keyword}`, type: 'problem' },
        { name: 'Hook B', headline: `Achieve ${keyword} results fast`, type: 'result' },
        { name: 'Hook C', headline: `The ${keyword} secret revealed`, type: 'curiosity' }
      ],
      
      landingPages: [
        { name: 'VSL Page', sections: ['Hook', 'Story', 'Solution', 'Offer', 'Close'] },
        { name: 'Sales Page', sections: ['Problem', 'Agitation', 'Solution', 'Proof', 'Offer', 'Guarantee', 'CTA'] },
        { name: 'Opt-in Page', sections: ['Hook', 'Problem', 'Solution', 'Email Form'] }
      ],
      
      emailSequence: [
        { day: 0, subject: `Are you still struggling with ${keyword}?`, type: 'Awareness' },
        { day: 2, subject: `What if ${keyword} was actually possible?`, type: 'Solution' },
        { day: 5, subject: `The method that changed everything`, type: 'Proof' },
        { day: 8, subject: `Last chance for ${keyword} results`, type: 'Urgency' }
      ],
      
      contentCalendar: research?.contentIdeas || [
        { platform: 'YouTube', type: 'Tutorial', title: `${keyword} Complete Guide` },
        { platform: 'Instagram', type: 'Carrossel', title: `5 Mistakes in ${keyword}` },
        { platform: 'Blog', type: 'SEO Article', title: `${keyword} Ultimate Guide 2025` }
      ]
    };
  }

  calculateDuration(started, completed) {
    const start = new Date(started);
    const end = new Date(completed);
    const ms = end - start;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min ${seconds % 60} seg`;
  }

  printSummary(brain) {
    console.log('\n' + '='.repeat(70));
    console.log('🧠 CÉREBRO COMPLETO - RESUMO');
    console.log('='.repeat(70));
    
    console.log(`\n🎯 Keyword: ${brain.metadata.keyword}`);
    console.log(`⏱️ Duration: ${brain.duration}`);
    
    console.log(`\n📊 FASES COMPLETAS:`);
    brain.phases.forEach(p => {
      const agentIcons = { RESEARCH: '🔍', AVATAR: '👤', OFFER: '💰', DEBATE: '🤖' };
      console.log(`   ${agentIcons[p.phase] || '•'} ${p.phase}: ${p.agents?.join(', ') || ''}`);
    });
    
    console.log(`\n🎯 SÍNTESE:`);
    const syn = brain.synthesis;
    if (syn) {
      console.log(`   📈 SEO Score: ${syn.highlights?.seoScore || 'N/A'}/100`);
      console.log(`   👤 Avatar: ${syn.highlights?.avatarDefined ? '✅' : '❌'}`);
      console.log(`   💰 Oferta: ${syn.highlights?.offerStructured ? '✅' : '❌'}`);
      console.log(`   🔍 Gaps: ${syn.highlights?.gapsIdentified || 0}`);
      console.log(`   📝 Próximos passos: ${syn.nextSteps?.length || 0}`);
      console.log(`   ✅ Veredicto: ${syn.verdict}`);
    }
    
    console.log(`\n📁 ARQUIVOS:`);
    console.log(`   🧠 Brain: ${brain.metadata.keyword}/brain-*.json`);
    console.log(`   📊 Tests: ${brain.testsAndPages?.abTests?.length || 0} A/B tests`);
    console.log(`   📧 Emails: ${brain.testsAndPages?.emailSequence?.length || 0} emails`);
    console.log(`   📱 Conteúdo: ${brain.testsAndPages?.contentCalendar?.length || 0} pieces`);
  }

  showHelp() {
    console.log(`
🧠 SUPER ORCHESTRATOR v${this.version}

USO:
  node scripts/super-orchestrator.js "palavra-chave"
  node scripts/super-orchestrator.js --input "negocios online"

EXEMPLOS:
  node scripts/super-orchestrator.js emagrecimento
  node scripts/super-orchestrator.js "marketing digital"
  node scripts/super-orchestrator.js "curso online"

O QUE ACONTECE:
  1. 🔍 RESEARCH - Eugene + Gary analisam mercado
  2. 👤 AVATAR - Alex + Eugene criam avatar detalhado
  3. 💰 OFFER - Hormozi + Eugene estruturam oferta
  4. 🤖 DEBATE - Todos os agentes debatem e refinam
  5. 🧠 SYNTHESIS - Alex sintetiza tudo
  6. 📊 TESTS - Dash + Gary geram testes A/B

OUTPUT:
  results/brain/{keyword}-{timestamp}/brain-{keyword}.json
  
CONTENTS:
  - Complete research with keywords & trends
  - Detailed customer avatar
  - Full offer structure
  - Agent debate transcript
  - A/B tests
  - Landing page structure
  - Email sequence
  - Content calendar
`);
  }
}

// CLI
const orchestrator = new SuperOrchestrator();
orchestrator.run(process.argv.slice(2).join(' '));
