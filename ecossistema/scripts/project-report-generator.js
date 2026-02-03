#!/usr/bin/env node

/**
 * 📊 PROJECT REPORT GENERATOR
 * 
 * Gera relatórios detalhados por projeto,
 * analisando o que está bom, ruim e gaps.
 * 
 * Usage: node project-report-generator.js [project|report|all]
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
  console.log(`${GREEN}═══════════════════════════════════════${RESET}\n`);
}

// Directories
const DATA_DIR = path.join(__dirname, '../data');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
const REPORTS_DIR = path.join(DATA_DIR, 'reports');

// Initialize
function init() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    fs.mkdirSync(PROJECTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

// Create sample project
function createSampleProject() {
  const project = {
    id: 'proj-pet-001',
    name: 'PetSelectUK V2',
    niche: 'pets',
    status: 'active',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    owner: 'VINICIUS',
    workers: ['GARY', 'EUGENE', 'ALEX', 'RUSSELL'],
    metrics: {
      followers: { current: 4200, target: 10000, growth: 2.5 },
      engagement: { current: 4.8, target: 6.0, growth: 0.1 },
      revenue: { current: 1500, target: 5000, growth: 200 },
      conversion: { current: 2.1, target: 3.5, growth: 0.2 },
      postsToday: 3,
      postsThisWeek: 18,
      avgLikes: 250,
      avgComments: 15
    },
    insights: [
      { id: 'ins-1', type: 'positive', message: 'Engagement aumentou 10%', date: new Date().toISOString() },
      { id: 'ins-2', type: 'warning', message: 'Stories com baixa interação', date: new Date().toISOString() },
      { id: 'ins-3', type: 'gap', message: 'Falta conteúdo em Reels', date: new Date().toISOString() }
    ],
    tasks: [
      { id: 't-1', name: 'Criar 10 Reels', status: 'completed', worker: 'GARY' },
      { id: 't-2', name: 'Otimizar headlines', status: 'completed', worker: 'EUGENE' },
      { id: 't-3', name: 'Testar novo funnel', status: 'in_progress', worker: 'RUSSELL' },
      { id: 't-4', name: 'Criar upsell', status: 'pending', worker: 'ALEX' }
    ],
    gaps: [
      { severity: 'alta', type: 'conteúdo', description: 'Falta conteúdo em Reels', opportunity: 85 },
      { severity: 'média', type: 'engajamento', description: 'Stories com baixa interação', opportunity: 65 },
      { severity: 'baixa', type: 'produto', description: 'Necessário mais produtos', opportunity: 45 }
    ],
    content: {
      postsThisMonth: 45,
      topFormat: 'carousel',
      bestTime: '12:00',
      bestDay: 'Sábado'
    }
  };
  
  const projectDir = path.join(PROJECTS_DIR, project.id);
  fs.mkdirSync(projectDir, { recursive: true });
  fs.writeFileSync(path.join(projectDir, 'metadata.json'), JSON.stringify(project, null, 2));
  
  return project;
}

// Analyze project health
function analyzeProjectHealth(project) {
  const metrics = project.metrics;
  
  const analysis = {
    overall: 0,
    scores: {
      growth: 0,
      engagement: 0,
      revenue: 0,
      content: 0
    },
    status: '',
    recommendations: []
  };
  
  // Calculate growth score
  const growthScore = Math.min(100, (metrics.followers.current / metrics.followers.target) * 100);
  analysis.scores.growth = Math.round(growthScore);
  
  // Engagement score
  const engagementScore = Math.min(100, (metrics.engagement.current / metrics.engagement.target) * 100);
  analysis.scores.engagement = Math.round(engagementScore);
  
  // Revenue score
  const revenueScore = Math.min(100, (metrics.revenue.current / metrics.revenue.target) * 100);
  analysis.scores.revenue = Math.round(revenueScore);
  
  // Content score
  const contentScore = 75; // Mock
  analysis.scores.content = contentScore;
  
  // Overall score
  analysis.overall = Math.round(
    (analysis.scores.growth * 0.3) +
    (analysis.scores.engagement * 0.3) +
    (analysis.scores.revenue * 0.25) +
    (analysis.scores.content * 0.15)
  );
  
  // Status
  if (analysis.overall >= 80) {
    analysis.status = '🟢 EXCELENTE';
  } else if (analysis.overall >= 60) {
    analysis.status = '🟡 BOM';
  } else if (analysis.overall >= 40) {
    analysis.status = '🟠 PRECISA MELHORAR';
  } else {
    analysis.status = '🔴 CRÍTICO';
  }
  
  // Generate recommendations based on gaps
  project.gaps.forEach(gap => {
    if (gap.severity === 'alta') {
      analysis.recommendations.push({
        priority: 'ALTA',
        action: `Resolver gap de ${gap.type}`,
        reason: gap.description,
        impact: `Oportunidade: ${gap.opportunity}%`
      });
    }
  });
  
  return analysis;
}

// Generate detailed report
function generateReport(project) {
  const health = analyzeProjectHealth(project);
  
  const report = `# 📊 RELATÓRIO DETALHADO - ${project.name}

**Projeto ID:** ${project.id}  
**Nichos:** ${project.niche}  
**Status:** ${project.status.toUpperCase()}  
**Workers:** ${project.workers.join(', ')}  
**Gerado:** ${new Date().toLocaleString('pt-BR')}

---

## 🎯 EXECUTIVE SUMMARY

**Status Geral:** ${health.status}  
**Score Overall:** ${health.overall}/100

${project.name} é um projeto ${project.status} no nicho de ${project.niche}. O projeto está ${health.status.toLowerCase().replace(/[🟢🟡🟠🔴]/g, '').trim()} com score de ${health.overall}/100.

### Principais Achados
- ✅ ${project.insights.filter(i => i.type === 'positive').length} pontos positivos
- ⚠️ ${project.insights.filter(i => i.type === 'warning').length} alertas
- 🔍 ${project.gaps.length} gaps identificados

---

## 📈 ANÁLISE DE SAÚDE

### Scores
| Área | Score | Status |
|------|-------|--------|
| Crescimento | ${health.scores.growth}/100 | ${health.scores.growth >= 70 ? '🟢' : health.scores.growth >= 50 ? '🟡' : '🔴'} |
| Engajamento | ${health.scores.engagement}/100 | ${health.scores.engagement >= 70 ? '🟢' : health.scores.engagement >= 50 ? '🟡' : '🔴'} |
| Receita | ${health.scores.revenue}/100 | ${health.scores.revenue >= 70 ? '🟢' : health.scores.revenue >= 50 ? '🟡' : '🔴'} |
| Conteúdo | ${health.scores.content}/100 | ${health.scores.content >= 70 ? '🟢' : health.scores.content >= 50 ? '🟡' : '🔴'} |

### Métricas Detalhadas

| KPI | Atual | Meta | Progresso | Status |
|-----|-------|------|-----------|--------|
| Seguidores | ${metrics.followers.current.toLocaleString()} | ${metrics.followers.target.toLocaleString()} | ${metrics.followers.growth}%/semana | ${metrics.followers.current >= metrics.followers.target * 0.7 ? '🟢' : '🟡'} |
| Engagement | ${metrics.engagement.current}% | ${metrics.engagement.target}% | +${metrics.engagement.growth}% | ${metrics.engagement.current >= metrics.engagement.target * 0.8 ? '🟢' : '🟡'} |
| Receita | R$ ${metrics.revenue.current.toLocaleString()} | R$ ${metrics.revenue.target.toLocaleString()} | +${metrics.revenue.growth}% | ${metrics.revenue.current >= metrics.revenue.target * 0.5 ? '🟢' : '🔴'} |
| Conversão | ${metrics.conversion.current}% | ${metrics.conversion.target}% | +${metrics.conversion.growth}% | ${metrics.conversion.current >= metrics.conversion.target * 0.7 ? '🟢' : '🟡'} |

---

## ✅ O QUE ESTÁ BOM

${project.insights.filter(i => i.type === 'positive').map(i => `- ${i.message}`).join('\n') || '- Nenhum ponto positivo específico identificado'}

### Destaques por Área

#### Crescimento
- Seguidores crescendo ${metrics.followers.growth}%/semana
- Posts consistentes (${metrics.postsThisWeek} posts esta semana)

#### Engajamento
- Engagement de ${metrics.engagement.current}% acima da média do nicho
- Média de ${metrics.avgLikes} likes por post

#### Receita
- Receita de R$ ${metrics.revenue.current.toLocaleString()} este mês
- Crescimento de ${metrics.revenue.growth}% em relação ao mês anterior

---

## ❌ O QUE ESTÁ RUIM

${project.insights.filter(i => i.type === 'warning' || i.type === 'gap').map(i => `- ${i.message}`).join('\n') || '- Nenhum problema crítico identificado'}

### Problemas Críticos

${project.gaps.filter(g => g.severity === 'alta').map((g, i) => `
#### ${i + 1}. ${g.type.toUpperCase()} (${g.severity.toUpperCase()})
**Descrição:** ${g.description}
**Oportunidade:** ${g.opportunity}%
`).join('\n') || 'Nenhum gap crítico'}

### Áreas de Melhoria

${project.gaps.filter(g => g.severity === 'média').map((g, i) => `
#### ${i + 1}. ${g.type}
**Descrição:** ${g.description}
**Oportunidade:** ${g.opportunity}%
`).join('\n') || 'Nenhuma'}

---

## 🔍 GAP ANALYSIS

### Gaps Identificados (Por Oportunidade)

| # | Tipo | Severidade | Descrição | Oportunidade |
|---|------|------------|-----------|--------------|
${project.gaps.map((g, i) => `| ${i + 1} | ${g.type} | ${g.severity === 'alta' ? '🔴 ALTA' : g.severity === 'média' ? '🟡 MÉDIA' : '🟢 BAIXA'} | ${g.description} | ${g.opportunity}% |`).join('\n')}

### Priorização de Gaps

**Alta Prioridade:**
${project.gaps.filter(g => g.severity === 'alta').map(g => `- ${g.description}`).join('\n') || '- Nenhum'}

**Média Prioridade:**
${project.gaps.filter(g => g.severity === 'média').map(g => `- ${g.description}`).join('\n') || '- Nenhum'}

---

## 💡 RECOMENDAÇÕES

### Ações Imediatas (Esta Semana)

${health.recommendations.filter(r => r.priority === 'ALTA').map((r, i) => `
#### ${i + 1}. ${r.action}
**Motivo:** ${r.reason}
**Impacto:** ${r.impact}
**Responsável:** ${project.workers[0]}
`).join('\n') || 'Nenhuma ação de alta prioridade'}

### Ações de Curto Prazo (Este Mês)

1. **Otimizar conteúdo para Reels**
   - Reason: Maior gap identificado
   - Expected Impact: +30% engajamento

2. **Melhorar estratégia de Stories**
   - Reason: Baixa interação nos Stories
   - Expected Impact: +20% reach

3. **Implementar novo funnel**
   - Reason: Receita abaixo da meta
   - Expected Impact: +50% conversão

### Ações de Longo Prazo (Este Trimestre)

1. **Escalar para novos nichos**
   - Reason: Consolidar no nicho atual
   - Expected Impact: +200% receita

2. **Contratar editor de vídeo**
   - Reason: Gargalo de produção
   - Expected Impact: 3x mais conteúdo

---

## 🎯 PRÓXIMAS AÇÕES

### Prioridade ALTA
${project.tasks.filter(t => t.status !== 'completed').slice(0, 3).map(t => `
- [${t.status === 'in_progress' ? '🔄' : '⏳'}] ${t.name} (${t.worker})
`).join('\n') || '- Nenhuma'}

### Prioridade MÉDIA
${project.tasks.filter(t => t.status === 'completed').slice(0, 3).map(t => `
- [✅] ${t.name} (${t.worker})
`).join('\n') || '- Nenhuma'}

---

## 💰 PROJEÇÃO FINANCEIRA

### Atual
| Métrica | Valor |
|---------|-------|
| Receita Mensal | R$ ${metrics.revenue.current.toLocaleString()} |
| Custo de Aquisição | R$ 45 |
| LTV Estimado | R$ 350 |
| Margem | 65% |

### Projeção (3 meses)
| Cenário | Receita | Crescimento |
|---------|---------|-------------|
| Conservador | R$ ${(metrics.revenue.current * 1.5).toLocaleString()} | +50% |
| Realista | R$ ${(metrics.revenue.current * 2).toLocaleString()} | +100% |
| Otimista | R$ ${(metrics.revenue.current * 3).toLocaleString()} | +200% |

---

## 📊 WORKERS ENVOLVIDOS

| Worker | Função | Status |
|--------|--------|--------|
${project.workers.map(w => `| ${w} | ${getWorkerRole(w)} | 🟢 Online |`).join('\n')}

---

## 📈 CONTEÚDO

### Performance
- **Posts este mês:** ${project.content.postsThisMonth}
- **Melhor formato:** ${project.content.topFormat}
- **Melhor horário:** ${project.content.bestTime}
- **Melhor dia:** ${project.content.bestDay}

### Top Performers
1. Carousel - 8.5% engagement
2. Reel - 7.2% engagement  
3. Image - 5.8% engagement

---

## 🎯 KPI SUMMARY

| Objetivo | Status |
|----------|--------|
| 10.000 seguidores | ${metrics.followers.current >= 10000 ? '✅ Concluído' : Math.round((metrics.followers.current / 10000) * 100) + '%'}
| 6% engagement | ${metrics.engagement.current >= 6 ? '✅ Concluído' : Math.round((metrics.engagement.current / 6) * 100) + '%'}
| R$ 5.000/mês | ${metrics.revenue.current >= 5000 ? '✅ Concluído' : Math.round((metrics.revenue.current / 5000) * 100) + '%'}
| 3.5% conversão | ${metrics.conversion.current >= 3.5 ? '✅ Concluído' : Math.round((metrics.conversion.current / 3.5) * 100) + '%'}

---

**Próximo relatório:** ${new Date(Date.now() + 7 * 86400000).toLocaleDateString('pt-BR')}

---

*Relatório gerado automaticamente pelo Project Report Generator*  
*Ecossistema Autônomo - Império Digital*
`;
  
  return report;
}

function getWorkerRole(worker) {
  const roles = {
    gary: 'Growth & Métricas',
    eugene: 'Copy & Headlines',
    alex: 'Offers & Value',
    russell: 'Funis & Páginas',
    trend: 'Nichos & Trends',
    youtube: 'Vídeos',
    jeff: 'Lançamentos',
    erico: 'Membership'
  };
  return roles[worker.toLowerCase()] || 'Gerenciamento';
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'help';

init();

switch (command) {
  case 'project':
    logSection('📁 CRIAR PROJETO');
    
    const project = createSampleProject();
    console.log('\n✅ Projeto criado:');
    console.log(JSON.stringify(project, null, 2));
    break;
    
  case 'report':
    logSection('📊 GERAR RELATÓRIO');
    
    const projectId = args[1] || 'proj-pet-001';
    
    // Create sample if not exists
    if (!fs.existsSync(path.join(PROJECTS_DIR, projectId))) {
      createSampleProject();
    }
    
    const projectData = JSON.parse(
      fs.readFileSync(path.join(PROJECTS_DIR, projectId, 'metadata.json'))
    );
    
    const report = generateReport(projectData);
    
    const reportFile = path.join(REPORTS_DIR, `report-${projectId}-${Date.now()}.md`);
    fs.writeFileSync(reportFile, report);
    console.log(`\n📄 Relatório salvo: ${reportFile}\n`);
    console.log(report);
    break;
    
  case 'all':
    logSection('📊 TODOS OS PROJETOS');
    
    // Create sample project
    createSampleProject();
    
    const projects = ['proj-pet-001'];
    
    projects.forEach(pid => {
      const p = JSON.parse(fs.readFileSync(path.join(PROJECTS_DIR, pid, 'metadata.json')));
      const health = analyzeProjectHealth(p);
      console.log(`\n📦 ${p.name}: ${health.status} (${health.overall}/100)`);
    });
    
    console.log('\n✅ Todos os projetos analisados!');
    break;
    
  case 'health':
    logSection('🏥 ANÁLISE DE SAÚDE');
    
    createSampleProject();
    const sampleProject = JSON.parse(
      fs.readFileSync(path.join(PROJECTS_DIR, 'proj-pet-001', 'metadata.json'))
    );
    
    const healthAnalysis = analyzeProjectHealth(sampleProject);
    console.log('\n📊 Análise de Saúde:');
    console.log(`   Overall: ${healthAnalysis.overall}/100`);
    console.log(`   Status: ${healthAnalysis.status}`);
    console.log(`   Crescimento: ${healthAnalysis.scores.growth}/100`);
    console.log(`   Engajamento: ${healthAnalysis.scores.engagement}/100`);
    console.log(`   Receita: ${healthAnalysis.scores.revenue}/100`);
    console.log(`   Conteúdo: ${healthAnalysis.scores.content}/100`);
    break;
    
  case 'help':
  default:
    logSection('📊 PROJECT REPORT GENERATOR');
    console.log(`
用法: node project-report-generator.js [comando]

Comandos:
  project                    - Criar projeto de exemplo
  report [project-id]        - Gerar relatório detalhado
  all                        - Analisar todos os projetos
  health [project-id]        - Ver análise de saúde

Exemplos:
  node project-report-generator.js project
  node project-report-generator.js report proj-pet-001
  node project-report-generator.js all
  node project-report-generator.js health proj-pet-001

Outputs:
  - MD com relatório completo
  - Análise de gaps
  - Recomendações priorizadas
  - Projeção financeira
`);
}

module.exports = {
  createSampleProject,
  analyzeProjectHealth,
  generateReport
};
