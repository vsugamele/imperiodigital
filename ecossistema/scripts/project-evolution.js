#!/usr/bin/env node

/**
 * 🔄 PROJECT EVOLUTION WORKFLOW
 * 
 * Workflow colaborativo onde workers analisam,
 * discutem e criam planos de ação para projetos.
 * 
 * Usage: node project-evolution.js [analyze|evolve|report|full]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

function log(message) {
  console.log(`${BLUE}[${new Date().toISOString()}]${RESET} ${message}`);
}

function logSection(title) {
  console.log(`\n${CYAN}══════════════════════════════════════════════════════${RESET}`);
  console.log(`${CYAN}  ${title}${RESET}`);
  console.log(`${CYAN}══════════════════════════════════════════════════════${RESET}\n`);
}

function logWorker(worker, message) {
  console.log(`${GREEN}[${worker}]${RESET} ${message}`);
}

function logAction(worker, action) {
  console.log(`  ${GREEN}→${RESET} ${worker}: ${action}`);
}

const WORKFLOW_DIR = path.join(__dirname, '../data/workflow');
const PROJECTS_DIR = path.join(__dirname, '../data/projects');
const REPORTS_DIR = path.join(__dirname, '../data/reports');

// Initialize
function init() {
  [WORKFLOW_DIR, PROJECTS_DIR, REPORTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Step 1: Gap Analyzer evaluates project
function step1_gapAnalysis(projectId) {
  logWorker('GAP_ANALYZER', `Analisando gaps do projeto ${projectId}...`);
  
  const projectFile = path.join(PROJECTS_DIR, `${projectId}.json`);
  if (!fs.existsSync(projectFile)) {
    return { error: 'Projeto não encontrado' };
  }
  
  const project = JSON.parse(fs.readFileSync(projectFile));
  
  // Mock gap analysis (would use real analyzer)
  const analysis = {
    projectId,
    projectName: project.name,
    niche: project.niche,
    analyzedAt: new Date().toISOString(),
    overallScore: Math.floor(Math.random() * 40) + 30, // 30-70 for projects needing work
    platforms: {
      connected: Object.keys(project.platforms).filter(k => project.platforms[k]?.connected),
      missing: getMissingPlatforms(project.niche)
    },
    content: {
      current: project.content?.types || [],
      gaps: getContentGaps(project.niche)
    },
    features: {
      connected: Object.keys(project.features).filter(k => project.features[k]),
      missing: getFeatureGaps()
    },
    priorities: getPriorities(project.niche)
  };
  
  // Save analysis
  const analysisFile = path.join(WORKFLOW_DIR, `${projectId}-analysis.json`);
  fs.writeFileSync(analysisFile, JSON.stringify(analysis, null, 2));
  
  logAction('GAP_ANALYZER', `Score: ${analysis.overallScore}%`);
  analysis.platforms.missing.forEach(p => {
    logAction('GAP_ANALYZER', `   - ${p.platform} (${p.severity})`);
  });
  
  return analysis;
}

function getMissingPlatforms(niche) {
  const templates = {
    pets: [
      { platform: 'tiktok', severity: 'ALTA', reason: 'Viralidade e alcance jovem' },
      { platform: 'pinterest', severity: 'MÉDIA', reason: 'Tráfego orgânico de produtos' },
      { platform: 'youtube', severity: 'MÉDIA', reason: 'Reviews e tutoriais' }
    ],
    health: [
      { platform: 'instagram', severity: 'ALTA', reason: 'Engajamento principal' },
      { platform: 'youtube', severity: 'ALTA', reason: 'Tutoriais e autoridade' },
      { platform: 'facebook', severity: 'MÉDIA', reason: 'Comunidade e ads' }
    ],
    igaming: [
      { platform: 'tiktok', severity: 'ALTA', reason: 'Público jovem' },
      { platform: 'youtube', severity: 'MÉDIA', reason: 'Highlights e monetização' },
      { platform: 'discord', severity: 'MÉDIA', reason: 'Comunidade ativa' }
    ],
    general: [
      { platform: 'instagram', severity: 'ALTA', reason: 'Base de engajamento' },
      { platform: 'facebook', severity: 'MÉDIA', reason: 'Ads e comunidade' }
    ]
  };
  return templates[niche] || templates.general;
}

function getContentGaps(niche) {
  const templates = {
    pets: ['reels', 'ugc', 'carousels'],
    health: ['reels', 'tutorials', 'transformations'],
    igaming: ['reels', 'streams', 'ugc'],
    general: ['reels', 'carousels', 'stories']
  };
  return (templates[niche] || templates.general).map(type => ({
    type,
    reason: getContentReason(type),
    opportunity: getContentOpportunity(type)
  }));
}

function getContentReason(type) {
  const reasons = {
    reels: 'Formato com maior engajamento',
    ugc: 'Alta conversão e confiança',
    carousels: 'Educação e CTAs',
    tutorials: 'Autoridade no nicho',
    streams: 'Engajamento ao vivo',
    transformations: 'Prova social poderosa'
  };
  return reasons[type] || 'Expande alcance';
}

function getContentOpportunity(type) {
  const ops = { reels: 80, ugc: 75, carousels: 70, tutorials: 78, streams: 72, transformations: 85 };
  return ops[type] || 65;
}

function getFeatureGaps() {
  return [
    { feature: 'lead_magnet', label: 'Lead Magnet', severity: 'MÉDIA', opportunity: 75 },
    { feature: 'funnel', label: 'Funil de Vendas', severity: 'ALTA', opportunity: 85 },
    { feature: 'email_sequence', label: 'Sequência de E-mails', severity: 'MÉDIA', opportunity: 70 }
  ];
}

function getPriorities(niche) {
  return [
    { action: `Conectar TikTok para ${niche}`, priority: 'ALTA', impact: '+30% alcance' },
    { action: 'Criar Funil de Vendas', priority: 'ALTA', impact: '+50% conversão' },
    { action: 'Implementar Lead Magnet', priority: 'MÉDIA', impact: '+40% leads' }
  ];
}

// Step 2: Eugene reviews copy requirements
function step2_copyReview(analysis) {
  logWorker('EUGENE', 'Avaliando necessidades de copy...');
  
  const copyNeeds = {
    projectId: analysis.projectId,
    needs: []
  };
  
  // Analyze what copy is needed based on gaps
  if (analysis.platforms.missing.some(p => p.platform === 'instagram')) {
    copyNeeds.needs.push({
      type: 'instagram_posts',
      count: 10,
      topics: ['dicas', 'produtos', 'transformacoes'],
      cta: 'Link na bio'
    });
  }
  
  if (analysis.platforms.missing.some(p => p.platform === 'facebook')) {
    copyNeeds.needs.push({
      type: 'facebook_ads',
      count: 5,
      objectives: ['engagement', 'traffic', 'conversion'],
      targetAudience: analysis.niche === 'pets' ? 'Donos de pets no UK' : 'Público do nicho'
    });
  }
  
  copyNeeds.needs.push({
    type: 'landing_page',
    count: 1,
    sections: ['hero', 'benefits', 'testimonials', 'cta']
  });
  
  const copyFile = path.join(WORKFLOW_DIR, `${analysis.projectId}-copy-needs.json`);
  fs.writeFileSync(copyFile, JSON.stringify(copyNeeds, null, 2));
  
  logAction('EUGENE', `${copyNeeds.needs.length} tipos de copy necessários`);
  copyNeeds.needs.forEach(n => {
    logAction('EUGENE', `   - ${n.type}: ${n.count} peças`);
  });
  
  return copyNeeds;
}

// Step 3: Alex Hormozi structures offers
function step3_offerStructure(analysis) {
  logWorker('ALEX_HORMOZI', 'Estruturando ofertas e Value Ladder...');
  
  const offerStructure = {
    projectId: analysis.projectId,
    niche: analysis.niche,
    valueLadder: [
      {
        tier: 'free',
        name: 'Lead Magnet',
        price: 0,
        deliverables: ['E-book', 'Checklist', 'Template'],
        goal: 'Capturar leads'
      },
      {
        tier: 'tripwire',
        name: 'Starter',
        price: 47,
        deliverables: ['Mini-curso', 'Acesso 30 dias'],
        goal: 'Primeira venda'
      },
      {
        tier: 'front',
        name: 'Principal',
        price: 197,
        deliverables: ['Curso completo', 'Bônus 1', 'Bônus 2'],
        goal: 'Conversão principal'
      },
      {
        tier: 'upsell',
        name: 'Premium',
        price: 497,
        deliverables: ['Mentoria', 'Acesso vitalício', 'Comunidade'],
        goal: 'Alta-ticket'
      }
    ],
    bonuses: [
      { name: 'Bônus 1', value: 197, type: 'related' },
      { name: 'Bônus 2', value: 297, type: 'aspirational' },
      { name: 'Bônus 3', value: 497, type: 'urgent' }
    ],
    guarantees: [
      '7 dias para pedir dinheiro de volta',
      'Suporte por 30 dias',
      'Atualizações futuras grátis'
    ]
  };
  
  const offerFile = path.join(WORKFLOW_DIR, `${analysis.projectId}-offers.json`);
  fs.writeFileSync(offerFile, JSON.stringify(offerStructure, null, 2));
  
  logAction('ALEX_HORMOZI', 'Value Ladder estruturada');
  offerStructure.valueLadder.forEach(t => {
    logAction('ALEX_HORMOZI', `   - ${t.tier}: ${t.name} (R$ ${t.price})`);
  });
  
  return offerStructure;
}

// Step 4: Russell builds funnel
function step4_funnelBuild(analysis, offers) {
  logWorker('RUSSELL', 'Construindo funil de vendas...');
  
  const funnel = {
    projectId: analysis.projectId,
    type: 'landing_to_membership',
    pages: [
      {
        name: 'Landing Page Principal',
        type: 'squeeze',
        elements: ['Headline', 'Video', 'Form', 'CTA'],
        copy: 'baseado em análise EUGENE'
      },
      {
        name: 'Thank You + Tripwire',
        type: 'upsell_1',
        offer: offers.valueLadder[1],
        offerPrice: 47
      },
      {
        name: 'Upsell 2',
        type: 'upsell_2',
        offer: offers.valueLadder[2],
        offerPrice: 197
      },
      {
        name: 'Membership Area',
        type: 'delivery',
        access: offers.valueLadder[2].deliverables
      }
    ],
    automations: [
      { trigger: 'Lead capture', action: 'Send lead magnet', delay: 0 },
      { trigger: 'Tripwire decline', action: 'Send follow-up', delay: 24 },
      { trigger: 'Purchase', action: 'Give access', delay: 0 },
      { trigger: '7 days no login', action: 'Send engagement email', delay: 7 }
    ]
  };
  
  const funnelFile = path.join(WORKFLOW_DIR, `${analysis.projectId}-funnel.json`);
  fs.writeFileSync(funnelFile, JSON.stringify(funnel, null, 2));
  
  logAction('RUSSELL', `${funnel.pages.length} páginas definidas`);
  funnel.pages.forEach(p => {
    logAction('RUSSELL', `   - ${p.name} (${p.type})`);
  });
  
  return funnel;
}

// Step 5: Gary creates content calendar
function step5_contentCalendar(analysis, funnel) {
  logWorker('GARY', 'Criando calendário de conteúdo...');
  
  const calendar = {
    projectId: analysis.projectId,
    duration: '30 dias',
    schedule: [
      { week: 1, phase: 'Awareness', types: ['reels', 'stories'], posts: 14 },
      { week: 2, phase: 'Consideration', types: ['carousels', 'ugc'], posts: 14 },
      { week: 3, phase: 'Conversion', types: ['ads', 'landing_pages'], posts: 10 },
      { week: 4, phase: 'Retention', types: ['email', 'community'], posts: 7 }
    ],
    postingSchedule: {
      instagram: { times: ['09:00', '12:00', '18:00'], frequency: '2x/dia' },
      tiktok: { times: ['10:00', '15:00', '20:00'], frequency: '3x/dia' },
      facebook: { times: ['08:00', '13:00', '17:00'], frequency: '1x/dia' }
    },
    contentThemes: [
      'Educação sobre o nicho',
      'Prova social (cases)',
      'CTA para ofertas',
      'Community building'
    ]
  };
  
  const calendarFile = path.join(WORKFLOW_DIR, `${analysis.projectId}-calendar.json`);
  fs.writeFileSync(calendarFile, JSON.stringify(calendar, null, 2));
  
  logAction('GARY', `${calendar.schedule.length} semanas planejadas`);
  calendar.schedule.forEach(w => {
    logAction('GARY', `   - Semana ${w.week}: ${w.phase} (${w.posts} posts)`);
  });
  
  return calendar;
}

// Step 6: Generate comprehensive report
function step6_generateReport(analysis, copy, offers, funnel, calendar) {
  logSection('📊 RELATÓRIO COMPLETO DE EVOLUÇÃO');
  
  const report = {
    projectId: analysis.projectId,
    projectName: analysis.projectName,
    generatedAt: new Date().toISOString(),
    summary: {
      currentScore: analysis.overallScore,
      projectedScore: 85,
      gapReduction: 85 - analysis.overallScore,
      estimatedTime: '30 dias'
    },
    gapAnalysis: analysis,
    copyRequirements: copy,
    offerStructure: offers,
    funnelDesign: funnel,
    contentPlan: calendar,
    actionItems: generateActionItems(analysis, offers, funnel, calendar),
    timeline: generateTimeline(calendar)
  };
  
  // Save report
  const reportFile = path.join(REPORTS_DIR, `evolution-${analysis.projectId}-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  // Generate markdown version
  const mdReport = generateMarkdownReport(report);
  const mdFile = path.join(REPORTS_DIR, `evolution-${analysis.projectId}-${Date.now()}.md`);
  fs.writeFileSync(mdFile, mdReport);
  
  logWorker('REPORT_GENERATOR', `Relatório salvo: ${mdFile}`);
  
  return report;
}

function generateActionItems(analysis, offers, funnel, calendar) {
  const items = [];
  
  // Week 1: Content
  calendar.schedule.filter(w => w.week === 1).forEach(w => {
    items.push({
      week: 1,
      action: `Criar ${w.posts} posts de ${w.types.join(', ')}`,
      owner: 'GARY',
      deadline: 'Dia 7',
      status: 'pending'
    });
  });
  
  // Week 2: Copy & Landing
  items.push({
    week: 2,
    action: 'Desenvolver landing page principal',
    owner: 'RUSSELL',
    deadline: 'Dia 10',
    status: 'pending'
  });
  items.push({
    week: 2,
    action: 'Criar copy para posts e ads',
    owner: 'EUGENE',
    deadline: 'Dia 10',
    status: 'pending'
  });
  
  // Week 3: Offers & Funnel
  items.push({
    week: 3,
    action: 'Estruturar Value Ladder',
    owner: 'ALEX_HORMOZI',
    deadline: 'Dia 18',
    status: 'pending'
  });
  items.push({
    week: 3,
    action: 'Implementar automações do funil',
    owner: 'RUSSELL',
    deadline: 'Dia 21',
    status: 'pending'
  });
  
  // Week 4: Launch
  items.push({
    week: 4,
    action: 'Lançar funil e campanhas',
    owner: 'GARY',
    deadline: 'Dia 28',
    status: 'pending'
  });
  
  return items;
}

function generateTimeline(calendar) {
  return calendar.schedule.map(w => ({
    week: w.week,
    phase: w.phase,
    focus: w.types.join(', '),
    posts: w.posts,
    milestones: [
      w.week === 1 ? 'Primeiros posts no ar' : null,
      w.week === 2 ? 'Landing page no ar' : null,
      w.week === 3 ? 'Funil operacional' : null,
      w.week === 4 ? 'Primeiras conversões' : null
    ].filter(Boolean)
  }));
}

function generateMarkdownReport(report) {
  return `# 🚀 PLANO DE EVOLUÇÃO - ${report.projectName}

**Gerado:** ${new Date().toLocaleString('pt-BR')}  
**Projeto ID:** ${report.projectId}

---

## 📊 RESUMO EXECUTIVO

| Métrica | Valor |
|---------|-------|
| Score Atual | ${report.summary.currentScore}% |
| Score Projetado | ${report.summary.projectedScore}% |
| Redução de Gap | +${report.summary.gapReduction}% |
| Tempo Estimado | ${report.summary.estimatedTime} |

---

## 🎯 ANÁLISE DE GAPS

### Plataformas Conectadas
${report.gapAnalysis.platforms.connected.map(p => `- ${p}`).join('\n') || '- Nenhuma'}

### Plataformas Faltando
${report.gapAnalysis.platforms.missing.map(p => `
- **${p.platform.toUpperCase()}** (${p.severity})
  - ${p.reason}
`).join('\n')}

---

## 💰 ESTRUTURA DE OFERTAS

### Value Ladder
${report.offerStructure.valueLadder.map(t => `
#### ${t.tier.toUpperCase()}: ${t.name}
- **Preço:** R$ ${t.price}
- **Deliverables:** ${t.deliverables.join(', ')}
- **Objetivo:** ${t.goal}
`).join('\n')}

### Bônus
${report.offerStructure.bonuses.map(b => `- ${b.name}: R$ ${b.value} (${b.type})`).join('\n')}

### Garantias
${report.offerStructure.guarantees.map(g => `- ${g}`).join('\n')}

---

## 🎯 FUNIL DE VENDAS

${report.funnelDesign.pages.map(p => `
### ${p.name}
- **Tipo:** ${p.type}
- **Elementos:** ${p.elements?.join(', ') || 'N/A'}
`).join('\n')}

### Automações
${report.funnelDesign.automations.map(a => `- ${a.trigger}: ${a.action} (+${a.delay}h)`).join('\n')}

---

## 📅 CALENDÁRIO DE CONTEÚDO

${report.contentPlan.schedule.map(w => `
### Semana ${w.week}: ${w.phase}
- **Tipos:** ${w.types.join(', ')}
- **Posts:** ${w.posts}
- **Frequência:** ${w.posts/7}/dia
`).join('\n')}

### Horários de Postagem
| Plataforma | Horários | Frequência |
|------------|----------|------------|
${Object.entries(report.contentPlan.postingSchedule).map(([p, s]) => `| ${p} | ${s.times.join(', ')} | ${s.frequency} |`).join('\n')}

---

## ✅ ITENS DE AÇÃO

${report.actionItems.map(item => `
### Semana ${item.week}
- [ ] **${item.action}**
  - Responsável: ${item.owner}
  - Deadline: ${item.deadline}
`).join('\n')}

---

## 📈 TIMELINE

${report.timeline.map(w => `
### Semana ${w.week}: ${w.phase}
${w.milestones.map(m => `- ${m}`).join('\n')}
`).join('\n')}

---

**Relatório gerado automaticamente pelo Project Evolution Workflow**  
*Ecossistema Autônomo - Império Digital*
`;
}

// Main evolution workflow
async function runEvolution(projectId) {
  logSection(`🚀 EVOLUÇÃO DO PROJETO: ${projectId}`);
  
  // Step 1: Gap Analysis
  logSection('PASSO 1: ANÁLISE DE GAPS');
  const analysis = step1_gapAnalysis(projectId);
  if (analysis.error) {
    console.log(`❌ ${analysis.error}`);
    return;
  }
  
  // Step 2: Copy Review
  logSection('PASSO 2: REQUISITOS DE COPY');
  const copy = step2_copyReview(analysis);
  
  // Step 3: Offer Structure
  logSection('PASSO 3: ESTRUTURA DE OFERTAS');
  const offers = step3_offerStructure(analysis);
  
  // Step 4: Funnel Build
  logSection('PASSO 4: CONSTRUÇÃO DO FUNIL');
  const funnel = step4_funnelBuild(analysis, offers);
  
  // Step 5: Content Calendar
  logSection('PASSO 5: CALENDÁRIO DE CONTEÚDO');
  const calendar = step5_contentCalendar(analysis, funnel);
  
  // Step 6: Generate Report
  logSection('PASSO 6: RELATÓRIO FINAL');
  const report = step6_generateReport(analysis, copy, offers, funnel, calendar);
  
  logSection('✅ EVOLUÇÃO COMPLETA');
  console.log(`\n📄 Relatório salvo em: data/reports/`);
  console.log(`📊 Score projetado: ${report.summary.projectedScore}% (+${report.summary.gapReduction}%)\n`);
  
  return report;
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'help';

init();

switch (command) {
  case 'analyze':
    step1_gapAnalysis(args[1] || 'proj-petselectuk');
    break;
    
  case 'evolve':
    runEvolution(args[1] || 'proj-petselectuk');
    break;
    
  case 'full':
    // Run evolution for all projects
    const files = fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.json'));
    files.forEach(async f => {
      const projectId = f.replace('.json', '');
      await runEvolution(projectId);
    });
    break;
    
  case 'help':
  default:
    logSection('🔄 PROJECT EVOLUTION WORKFLOW');
    console.log(`
用法: node project-evolution.js [comando] [project-id]

Comandos:
  analyze [id]   - Apenas análise de gaps
  evolve [id]    - Evolução completa do projeto
  full           - Evoluir todos os projetos

Exemplos:
  node project-evolution.js analyze proj-petselectuk
  node project-evolution.js evolve proj-petselectuk
  node project-evolution.js full

Workflow:
  1. GAP_ANALYZER → Identifica gaps
  2. EUGENE → Requisitos de copy
  3. ALEX_HORMOZI → Estrutura ofertas
  4. RUSSELL → Constrói funil
  5. GARY → Calendário de conteúdo
  6. REPORT → Relatório completo

Outputs:
  - data/workflow/[project]-analysis.json
  - data/workflow/[project]-copy-needs.json
  - data/workflow/[project]-offers.json
  - data/workflow/[project]-funnel.json
  - data/workflow/[project]-calendar.json
  - data/reports/evolution-[project].md
`);
}

module.exports = { runEvolution, step1_gapAnalysis, step2_copyReview, step3_offerStructure, step4_funnelBuild, step5_contentCalendar, step6_generateReport };
