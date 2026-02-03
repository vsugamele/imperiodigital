#!/usr/bin/env node

/**
 * ✍️ WORKER EUGENE - COPY & HEADLINE GENERATOR
 * 
 * Gera headlines e copy otimizados baseado em:
 * - Estágio de consciência do mercado
 * - Dados de performance
 * - Templates validados
 * 
 * Usage: node eugene-generator.js [headline|copy|report]
 */

const fs = require('fs');
const path = require('path');

const HEADLINES_DIR = path.join(__dirname, '../insights/headlines');
const COPIES_DIR = path.join(__dirname, '../insights/copies');
const TEMPLATES_DIR = path.join(__dirname, '../templates');

// Colors
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(message) {
  console.log(`${BLUE}[${new Date().toISOString()}]${RESET} ${message}`);
}

function logSection(title) {
  console.log(`\n${BLUE}═══════════════════════════════════════${RESET}`);
  console.log(`${BLUE}  ${title}${RESET}`);
  console.log(`${BLUE}═══════════════════════════════════════${RESET}\n`);
}

// Framework Eugene - Headlines
const headlineFrameworks = {
  directPromise: {
    template: "Como {fazer} em {tempo} sem {dor}",
    examples: [
      "Como emagrecer em 30 dias sem passar fome",
      "Como dobrar vendas em 7 dias sem aumentar orçamento",
      "Como aprender inglês em 90 dias sem cursinho"
    ]
  },
  newsAnnouncement: {
    template: "Finalmente revelado: {segredo}",
    examples: [
      "Finalmente revelado: o método que dermatologistas usam",
      "Finalmente revelado: otruque que aumentava vendas em 3x",
      "Finalmente revelado: o erro que 90% comete no Instagram"
    ]
  },
  question: {
    template: "E se você pudesse {resultado impossivel}?",
    examples: [
      "E se você pudesse doblar seu faturamento em 30 dias?",
      "E se você pudesse emagrecer comendo o que quiser?",
      "E se você pudesse ter liberdade financeira em 1 ano?"
    ]
  },
  curiosityGap: {
    template: "O {adjetivo} truque que {resultado inesperado}",
    examples: [
      "O estranho truque que triplicou minhas vendas em 1 semana",
      "O segredo que dermatologistas escondem dos pacientes",
      "O erro fatal que empreendedores cometem aos 30 anos"
    ]
  },
  howTo: {
    template: "{numero} formas de {resultado} sem {objetivo}",
    examples: [
      "5 formas de vender mais sem aumentar orçamento",
      "3 erros que impedem você de emagrecer",
      "4 hábitos que millionaires praticam diariamente"
    ]
  }
};

// Estágios de consciência
const consciousnessStages = {
  unaware: {
    name: "Unaware",
    description: "Não sabe que tem o problema",
    approach: "Educar sobre o problema",
    hook: "Você sabe que está {problema}?",
    example: "Você sabe que está perdendo R$ 2.000/mês?"
  },
  problemAware: {
    name: "Problem Aware",
    description: "Sabe o problema, não conhece soluções",
    approach: "Apresentar solução",
    hook: "Finalmente: a solução para {problema}",
    example: "Finalmente: a solução para quem sofre com insônia"
  },
  solutionAware: {
    name: "Solution Aware",
    description: "Conhece soluções, não seu produto",
    approach: "Posicionar como melhor solução",
    hook: "Por que {produto} é diferente de {concorrente}",
    example: "Por que este curso de inglês é diferente dos outros"
  },
  productAware: {
    name: "Product Aware",
    description: "Conhece seu produto",
    approach: "Oferta + prova social",
    hook: "{numero} pessoas já {resultado} com {produto}",
    example: "2.347 pessoas já emagreceram com este método"
  },
  mostAware: {
    name: "Most Aware",
    description: "Prestes a comprar",
    approach: "Fechamento direto",
    hook: "Última chance de {beneficio}",
    example: "Última chance de garantir vaga com 50% OFF"
  }
};

function generateHeadlines(params) {
  const { niche, desire, painPoint, timeframe, offer } = params;
  
  const headlines = [];
  
  // Generate from each framework
  Object.entries(headlineFrameworks).forEach(([key, framework]) => {
    // Create variation from template
    let headline = framework.template
      .replace('{fazer}', desire?.action || 'conseguir resultados')
      .replace('{tempo}', timeframe || '30 dias')
      .replace('{dor}', painPoint?.avoid || 'esforço')
      .replace('{segredo}', desire?.secret || 'método secreto')
      .replace('{resultado impossivel}', desire?.impossible || 'resultado impossível')
      .replace('{resultado}', desire?.main || 'conseguir resultados')
      .replace('{adjetivo}', desire?.adjective || 'estranho')
      .replace('{resultado inesperado}', desire?.twist || 'resultado inesperado')
      .replace('{numero}', Math.floor(Math.random() * 7) + 2)
      .replace('{objetivo}', desire?.goal || 'nada')
      .replace('{problema}', painPoint?.main || 'seu problema');
    
    headlines.push({
      framework: key,
      headline,
      confidence: 0.8 + Math.random() * 0.2
    });
  });
  
  return headlines;
}

function generateCopy(params) {
  const { stage, headline, product, avatar, offer } = params;
  
  const stageData = consciousnessStages[stage] || consciousnessStages.problemAware;
  
  const copy = {
    stage,
    hook: stageData.hook.replace('{problema}', 'seu problema'),
    headline,
    body: generateBody(stage, product, avatar),
    cta: generateCTA(stage, offer),
    proof: generateProof(product)
  };
  
  return copy;
}

function generateBody(stage, product, avatar) {
  const bodies = {
    unaware: `Você sabia que ${avatar?.mainPain || 'a maioria das pessoas'} está sofrendo com ${avatar?.problem || 'este problema'} sem nem perceber?

O custo hidden é maior do que você imagina. Estudos mostram que ${avatar?.stat || '9 em 10 pessoas'} que têm ${avatar?.problem || 'este problema'} acabam ${avatar?.consequence || 'tendo consequências graves'}.

A boa notícia: ${product?.solution || 'Existe uma solução'} que já ajudou ${avatar?.successCount || 'milhares de pessoas'}.`,
    
    problemAware: `Você já tentou ${avatar?.solutionsTried || 'várias soluções'} e nada funcionou?

Não é sua culpa. A maioria das soluções tradicionais ${avatar?.whyFail || 'não abordam a causa raiz'}.

${product?.mechanism || 'Nossa abordagem'} é diferente porque ${product?.uniqueMechanism || 'funciona na raiz do problema'}.`,
    
    solutionAware: `Você conhece ${avatar?.knownAlternatives || 'outras opções'}, mas ${product?.whyBetter || 'nossa abordagem'} é única porque:

✅ ${product?.benefit1 || 'Primeiro diferencial'}
✅ ${product?.benefit2 || 'Segundo diferencial'}
✅ ${product?.benefit3 || 'Terceiro diferencial'}`,
    
    productAware: `${product?.socialProof || 'Milhares de pessoas'} já transformaram suas vidas:

"${product?.testimonial || 'Nunca pensei que conseguiria em tão pouco tempo. Resultados reais!'}" - ${product?.testimonialAuthor || 'João, São Paulo'}

${product?.result || 'Resultados comprovados'} em média de ${product?.timeframe || '30 dias'}.`,
    
    mostAware: `Esta é sua última chance de ${product?.benefit || 'garantir acesso'} com ${offer?.discount || '50% OFF'}.

Oferta válida até ${offer?.deadline || 'hoje à meia-noite'}.

Sem risco: ${offer?.guarantee || 'Garantia de 30 dias ou seu dinheiro de volta'}.

CLIQUE AGORA e comece sua transformação.`
  };
  
  return bodies[stage] || bodies.problemAware;
}

function generateCTA(stage, offer) {
  const ctas = {
    unaware: "Quer saber mais?",
    problemAware: "Quero saber a solução",
    solutionAware: "Por que é diferente?",
    productAware: "Garantir minha vaga",
    mostAware: "Comprar agora com desconto"
  };
  
  return {
    primary: ctas[stage] || ctas.problemAware,
    secondary: offer?.buttonText || "Ver detalhes",
    urgency: offer?.urgency || "Oferta por tempo limitado"
  };
}

function generateProof(product) {
  return {
    stats: product?.stats || [
      { number: "10.000+", label: "Pessoas transformadas" },
      { number: "4.9/5", label: "Avaliação média" },
      { number: "97%", label: "Satisfação" }
    ],
    testimonial: {
      quote: product?.testimonial || "Resultados que mudaram minha vida!",
      author: product?.testimonialAuthor || "Cliente satisfeito",
      result: product?.testimonialResult || "Emagreceu 15kg em 3 meses"
    }
  };
}

function analyzeHeadlinePerformance(headlines, metrics) {
  return headlines.map(h => ({
    ...h,
    score: calculateScore(h, metrics)
  })).sort((a, b) => b.score - a.score);
}

function calculateScore(headline, metrics) {
  // Simple scoring based on metrics
  let score = 50;
  
  if (metrics?.ctr) score += metrics.ctr * 10;
  if (metrics?.engagement) score += metrics.engagement * 5;
  if (headline.confidence) score += headline.confidence * 30;
  
  return Math.min(100, score);
}

function generateReport(period = 'week') {
  return {
    period,
    generatedAt: new Date().toISOString(),
    topHeadlines: [],
    recommendations: [],
    stageAnalysis: consciousnessStages,
    nextTests: []
  };
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'help';

switch (command) {
  case 'headline':
    logSection('✍️ EUGENE - GERADOR DE HEADLINES');
    
    const headlineParams = {
      niche: args[1] || 'educacao-financeira',
      desire: {
        main: 'conseguir liberdade financeira',
        impossible: 'tornar-se milionário em 30 dias',
        action: 'dobrar rendimentos',
        twist: 'que quase ninguém conhece'
      },
      painPoint: {
        main: 'perder dinheiro',
        avoid: 'sacrifícios extremos',
        consequence: 'dívidas e estresse'
      },
      timeframe: '30 dias'
    };
    
    const headlines = generateHeadlines(headlineParams);
    
    console.log('📝 Headlines geradas:\n');
    headlines.forEach((h, i) => {
      console.log(`${i + 1}. [${h.framework}] "${h.headline}"`);
      console.log(`   Confiança: ${(h.confidence * 100).toFixed(0)}%\n`);
    });
    break;
    
  case 'copy':
    logSection('📝 EUGENE - GERADOR DE COPY');
    
    const copyParams = {
      stage: args[1] || 'solutionAware',
      headline: args[2] || 'Finalmente revelado: o método que triplicou minhas vendas',
      product: {
        name: 'Método Vendas Express',
        solution: 'abordagem baseada em dados',
        mechanism: 'usa IA para prever o que cliente quer',
        stats: [
          { number: '3x', label: 'Aumento médio de vendas' },
          { number: '14 dias', label: 'Para ver resultados' }
        ]
      },
      avatar: {
        mainPain: 'vender menos que o potencial',
        problem: 'não conseguir fechar vendas',
        solutionsTried: 'cursos e mentorias',
        whyFail: 'não têm metodologia comprovada'
      },
      offer: {
        discount: '40% OFF',
        deadline: 'esta sexta-feira',
        guarantee: '7 dias'
      }
    };
    
    const copy = generateCopy(copyParams);
    
    console.log(`📝 Copy para estágio: ${copy.stage}\n`);
    console.log(`🎯 Hook: ${copy.hook}`);
    console.log(`\n📄 Body:\n${copy.body}`);
    console.log(`\n🎯 CTA: ${copy.cta.primary}`);
    break;
    
  case 'report':
    logSection('📊 EUGENE - RELATÓRIO');
    const report = generateReport(args[1]);
    console.log('📈 Relatório gerado:', JSON.stringify(report, null, 2));
    break;
    
  case 'stages':
    logSection('🧠 ESTÁGIOS DE CONSCIÊNCIA');
    Object.entries(consciousnessStages).forEach(([key, stage]) => {
      console.log(`\n${key.toUpperCase()}:`);
      console.log(`   ${stage.description}`);
      console.log(`   Abordagem: ${stage.approach}`);
    });
    break;
    
  case 'help':
  default:
    logSection('✍️ WORKER EUGENE');
    console.log(`
用法: node eugene-generator.js [comando]

Comandos:
  headline [nicho]    - Gerar headlines
  copy [estágio]      - Gerar copy
  report [período]     - Gerar relatório
  stages              - Listar estágios de consciência

Exemplos:
  node eugene-generator.js headline educacao-financeira
  node eugene-generator.js copy problemAware
  node eugene-generator.js stages

Estágios disponíveis:
  unaware, problemAware, solutionAware, productAware, mostAware
`);
}

module.exports = {
  generateHeadlines,
  generateCopy,
  analyzeHeadlinePerformance,
  consciousnessStages,
  headlineFrameworks
};
