#!/usr/bin/env node

/**
 * 🌅 WORKER GARY - REFLECTION JOURNAL GENERATOR
 * 
 * Gera o journal de reflexão diário automaticamente
 * - Coleta métricas do dia
 * - Analisa via Workers
 * - Gera insights
 * - Define ações para amanhã
 * 
 * Roda: Todo dia 20:00
 */

const fs = require('fs');
const path = require('path');
const { collectMetrics } = require('./worker-gary-metrics');

const REFLECTIONS_DIR = path.join(__dirname, '../reflections');
const METRICS_DIR = path.join(__dirname, '../metrics/daily');

async function generateReflectionJournal() {
  const today = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toLocaleString('pt-BR');
  
  console.log(`\n🌅 [${timestamp}] GARY: Gerando Reflection Journal...\n`);
  
  // Coleta métricas do dia
  const metrics = await collectMetrics();
  
  // Gera análise dos workers
  const workerAnalysis = await analyzeWorkers(metrics);
  
  // Gera insights
  const insights = generateInsights(metrics, workerAnalysis);
  
  // Define ações
  const actions = generateActions(metrics, workerAnalysis, insights);
  
  // Monta journal
  const journal = buildJournal(today, timestamp, metrics, workerAnalysis, insights, actions);
  
  // Salva
  const outputPath = path.join(REFLECTIONS_DIR, `diario-${today}.md`);
  fs.writeFileSync(outputPath, journal);
  console.log(`💾 Journal salvo: ${outputPath}\n`);
  
  return journal;
}

async function analyzeWorkers(metrics) {
  // Simula análise de cada worker
  // TODO: Integrar com Workers reais via Claude API
  
  const analysis = {
    gary: {
      question: "Qual conteúdo performou melhor hoje?",
      analysis: analyzeGaryContent(metrics),
      insight: garyInsight(metrics),
      recommendation: garyRecommendation(metrics)
    },
    eugene: {
      question: "O mercado está em qual estágio de consciência?",
      analysis: "Mercado em Solution Aware - conhecem soluções, buscam a melhor",
      insight: "Headlines de comparação funcionam melhor",
      recommendation: "Focar em conteúdo comparativo (nós vs concorrência)"
    },
    alexHormozi: {
      question: "A oferta está otimizada?",
      analysis: "Taxa de conversão de 2.1% - abaixo da meta de 3%",
      insight: "Falta value stacking nas ofertas",
      recommendation: "Adicionar 2-3 bônus por oferta"
    },
    jeff: {
      question: "Os lançamentos estão aquecendo?",
      analysis: "Nenhum lançamento ativo no momento",
      insight: "Pipeline vazio - preparar próximo lançamento",
      recommendation: "Iniciar fase de aquecimento em 7 dias"
    },
    russell: {
      question: "Os funis estão fluindo?",
      analysis: "Funil de lead magnet operando em 2.3%",
      insight: "Tripwire não está sendo mostrado no momento certo",
      recommendation: "Ajustar timing do tripwire para após download"
    },
    erico: {
      question: "O perpétuo está escalando?",
      analysis: "Receita estável em R$ 2.400/semana",
      insight: "Possível expandir para novos nichos",
      recommendation: "Testar mesmo funil em PetSelectUK"
    }
  };
  
  return analysis;
}

function analyzeGaryContent(metrics) {
  const profiles = metrics.profiles.filter(p => !p.error);
  const topProfile = profiles.sort((a, b) => b.engagementRate - a.engagementRate)[0];
  
  return `Posts realizados hoje: ${metrics.summary.totalPostsToday}
Engagement médio: ${metrics.summary.avgEngagement.toFixed(2)}%
Top performer: ${topProfile?.name || 'N/A'} com ${topProfile?.engagementRate}%`;
}

function garyInsight(metrics) {
  const avgGrowth = profiles => profiles.reduce((sum, p) => sum + (p.growth || 0), 0) / profiles.length;
  const profiles = metrics.profiles.filter(p => !p.error);
  const avg = avgGrowth(profiles);
  
  return avg > 2 
    ? "Crescimento acima da média - manter estratégia atual"
    : avg > 1 
    ? "Crescimento moderado - testar novos formatos"
    : "Crescimento baixo - revisar conteúdo";
}

function garyRecommendation(metrics) {
  const topProfile = metrics.profiles.find(p => p.name === metrics.summary.topPerformer);
  
  if (topProfile) {
    return `Replicar formato do ${topProfile.name} nos outros perfis`;
  }
  
  return "Aumentar frequência de Stories para 15/dia";
}

function generateInsights(metrics, workerAnalysis) {
  const insights = {
    worked: [],
    failed: [],
    patterns: []
  };
  
  // Analisar padrões das métricas
  if (metrics.summary.avgEngagement > 4) {
    insights.worked.push("Engagement alto - conteúdo ressoando com a audiência");
  }
  
  if (metrics.summary.totalPostsToday < 4) {
    insights.failed.push("Posts abaixo da meta diária (mín: 4)");
  }
  
  const profiles = metrics.profiles.filter(p => !p.error);
  const highGrowth = profiles.filter(p => p.growth > 2);
  if (highGrowth.length > 0) {
    insights.patterns.push(`Perfis ${highGrowth.map(p => p.name).join(', ')} crescendo mais rápido`);
  }
  
  return insights;
}

function generateActions(metrics, workerAnalysis, insights) {
  const actions = {
    high: [],
    medium: [],
    low: []
  };
  
  // Ações baseadas em insights
  if (insights.failed.includes("Posts abaixo da meta diária")) {
    actions.high.push("Aumentar frequência para 3 posts/dia");
  }
  
  // Ações dos workers
  actions.medium.push(workerAnalysis.gary.recommendation);
  actions.medium.push(workerAnalysis.alexHormozi.recommendation);
  
  // Ações de crescimento
  actions.low.push("Testar 1 novo formato de Reels");
  actions.low.push("Aumentar engajamento nos Stories");
  
  return actions;
}

function buildJournal(date, timestamp, metrics, workerAnalysis, insights, actions) {
  return `# 🌅 REFLECTION JOURNAL - ${date}

**Gerado:** ${timestamp}

---

## 📊 COLETA DE DADOS

### Métricas do Dia

| Perfil | Seguidores | Posts Hoje | Engagement | Crescimento |
|--------|------------|------------|-----------|------------|
${metrics.profiles.map(p => {
  const followers = p.followers?.toLocaleString() || 'N/A';
  const posts = p.postsToday || 0;
  const engagement = p.engagementRate?.toFixed(2) || 'N/A';
  const growth = p.growth?.toFixed(1) || 'N/A';
  return `| ${p.name} | ${followers} | ${posts} | ${engagement}% | ${growth}% |`;
}).join('\n')}

### Resumo
- **Total Seguidores:** ${metrics.summary.totalFollowers.toLocaleString()}
- **Posts Hoje:** ${metrics.summary.totalPostsToday}
- **Engagement Médio:** ${metrics.summary.avgEngagement.toFixed(2)}%
- **Top Performer:** ${metrics.summary.topPerformer || 'N/A'}

---

## 🧠 ANÁLISE DOS WORKERS

### 👑 GARY (Growth)
**Pergunta:** "${workerAnalysis.gary.question}"

**Análise:**
${workerAnalysis.gary.analysis}

**Insight:**
${workerAnalysis.gary.insight}

**Recomendação:**
${workerAnalysis.gary.recommendation}

---

### ✍️ EUGENE (Copy)
**Pergunta:** "${workerAnalysis.eugene.question}"

**Análise:**
${workerAnalysis.eugene.analysis}

**Insight:**
${workerAnalysis.eugene.insight}

**Recomendação:**
${workerAnalysis.eugene.recommendation}

---

### 💰 ALEX HORMOZI (Offers)
**Pergunta:** "${workerAnalysis.alexHormozi.question}"

**Análise:**
${workerAnalysis.alexHormozi.analysis}

**Insight:**
${workerAnalysis.alexHormozi.insight}

**Recomendação:**
${workerAnalysis.alexHormozi.recommendation}

---

### 🚀 JEFF WALKER (Lançamentos)
**Pergunta:** "${workerAnalysis.jeff.question}"

**Análise:**
${workerAnalysis.jeff.analysis}

**Insight:**
${workerAnalysis.jeff.insight}

**Recomendação:**
${workerAnalysis.jeff.recommendation}

---

## 💡 INSIGHTS PRINCIPAIS

### ✅ O Que Funcionou
${insights.worked.length > 0 ? insights.worked.map(i => `- ${i}`).join('\n') : '- Nenhum insight positivo identificado'}

### ❌ O Que Não Funcionou
${insights.failed.length > 0 ? insights.failed.map(i => `- ${i}`).join('\n') : '- Nenhum problema identificado'}

### 🔮 Padrões Identificados
${insights.patterns.length > 0 ? insights.patterns.map(p => `- ${p}`).join('\n') : '- Nenhum padrão identificado'}

---

## 📋 AÇÕES PARA AMANHÃ

### Prioridade Alta
${actions.high.length > 0 ? actions.high.map(a => `- [ ] ${a}`).join('\n') : '- Nenhuma ação de alta prioridade'}

### Prioridade Média
${actions.medium.length > 0 ? actions.medium.map(a => `- [ ] ${a}`).join('\n') : '- Nenhuma ação de média prioridade'}

### Prioridade Baixa
${actions.low.length > 0 ? actions.low.map(a => `- [ ] ${a}`).join('\n') : '- Nenhuma ação de baixa prioridade'}

---

## 🎯 METAS DO DIA

| KPI | Meta | Real | Status |
|-----|------|------|--------|
| Posts | ${metrics.summary.totalPostsToday + 4} | ${metrics.summary.totalPostsToday} | ${metrics.summary.totalPostsToday >= 4 ? '✅' : '⚠️'} |
| Novos Seguidores | +100 | +${metrics.profiles.reduce((sum, p) => sum + (p.growth || 0), 0).toFixed(0)} | ${metrics.profiles.reduce((sum, p) => sum + (p.growth || 0), 0) >= 100 ? '✅' : '⚠️'} |
| Engagement | 3% | ${metrics.summary.avgEngagement.toFixed(2)}% | ${metrics.summary.avgEngagement >= 3 ? '✅' : '⚠️'} |

---

## 💭 REFLEXÃO FINAL

**O que aprendi hoje:**
1. ${workerAnalysis.gary.insight}

**O que vou fazer diferente amanhã:**
1. ${actions.high[0] || 'Revisar estratégia de conteúdo'}

**Grato por:**
1. ${metrics.summary.topPerformer ? `O crescimento do ${metrics.summary.topPerformer}` : 'Os dados que temos'}

---

**Próximo Reflection Journal:** ${new Date(Date.now() + 86400000).toISOString().split('T')[0]}

---

*Gerado automaticamente pelo Worker GARY*
*Sistema: Império Autônomo*
`;
}

// Run if called directly
if (require.main === module) {
  generateReflectionJournal()
    .then(journal => {
      console.log('\n✅ Reflection Journal gerado com sucesso!\n');
    })
    .catch(error => {
      console.error('❌ Erro:', error);
      process.exit(1);
    });
}

module.exports = { generateReflectionJournal, buildJournal };
