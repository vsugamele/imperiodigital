#!/usr/bin/env node

/**
 * 🎯 PROJECT INVENTORY & GAP ANALYZER
 * 
 * Inventaria projetos existentes, analisa gaps específicos
 * e recomenda integrações/estratégias personalizadas.
 * 
 * Usage: node project-gap-analyzer.js [analyze|recommend|add|list]
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

// Data directories
const INVENTORY_DIR = path.join(__dirname, '../data/projects');
const REPORTS_DIR = path.join(__dirname, '../data/reports');

// Initialize directories
function init() {
  if (!fs.existsSync(INVENTORY_DIR)) {
    fs.mkdirSync(INVENTORY_DIR, { recursive: true });
  }
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

// Project inventory template
const projectTemplate = {
  id: '',
  name: '',
  niche: '',
  status: 'active',
  platforms: {
    instagram: null,
    youtube: null,
    tiktok: null,
    facebook: null,
    pinterest: null,
    twitter: null,
    linkedin: null,
    blog: null,
    ecommerce: null,
    email: null
  },
  metrics: {
    followers: 0,
    engagement: 0,
    revenue: 0,
    postsToday: 0,
    postsThisWeek: 0
  },
  content: {
    types: [],
    frequency: 'daily',
    lastPost: null,
    storiesFrequency: 0
  },
  features: {
    hasLeadMagnet: false,
    hasFunnel: false,
    hasMembership: false,
    hasEmailSequence: false,
    hasPaidAds: false,
    hasAutomation: false,
    hasChatbot: false,
    hasCRM: false
  },
  gaps: [],
  strategies: [],
  notes: '',
  createdAt: null,
  updatedAt: null
};

// Platform gap templates
const platformGaps = {
  instagram: {
    missing: {
      pinterest: 'Pinterest não conectado - importante para tráfego orgânico',
      facebook: 'Facebook não conectado - essential para ads e cross-posting',
      linkedin: 'LinkedIn não conectado - B2B e networking',
      blog: 'Blog não conectado - SEO e conteúdo longo'
    },
    recommendations: {
      pets: ['Conectar Pinterest para ideias de produtos', 'Facebook Ads para retargeting', 'TikTok para viralidade'],
      educacao_financeira: ['LinkedIn para autoridade', 'Facebook Groups para comunidade', 'YouTube para tutoriais'],
      health: ['Pinterest para receitas saudáveis', 'Facebook para suporte', 'YouTube para exercícios'],
      general: ['Pinterest para tráfego', 'Facebook para comunidade', 'TikTok para viralidade']
    }
  },
  youtube: {
    missing: {
      blog: 'Blog não conectado - SEO e monetização',
      podcast: 'Podcast não conectado - repurposing de conteúdo',
      course: 'Curso não conectado - monetização',
      merchandise: 'Merchandise não conectado - Revenue extra'
    },
    recommendations: {
      pets: ['Curso de cuidados', 'Merchandise pet', 'Podcast sobre Pets'],
      educacao_financeira: ['Curso de finanças', 'E-book de investimentos', 'Mentoria em vídeo'],
      health: ['Programa de exercícios', 'Receitas em vídeo', 'Meditação guiada'],
      general: ['E-book complementar', 'Curso avançado', 'Consultoria 1-1']
    }
  }
};

// Social media recommendations by niche
const nicheRecommendations = {
  pets: {
    platforms: ['instagram', 'tiktok', 'pinterest', 'facebook', 'youtube'],
    priority: ['instagram', 'tiktok'],
    integrations: ['pinterest', 'facebook'],
    contentTypes: ['reels', 'carousels', 'stories', 'ugc'],
    strategies: ['ugc_partnerships', 'influencer_collab', 'user_generated', 'product_reviews']
  },
  educacao_financeira: {
    platforms: ['youtube', 'instagram', 'linkedin', 'facebook', 'tiktok'],
    priority: ['youtube', 'linkedin'],
    integrations: ['blog', 'email', 'course'],
    contentTypes: ['tutorials', 'carousels', 'lives', 'podcasts'],
    strategies: ['lead_magnet', 'webinar', 'case_studies', 'testimonials']
  },
  health: {
    platforms: ['instagram', 'youtube', 'tiktok', 'pinterest', 'facebook'],
    priority: ['instagram', 'youtube'],
    integrations: ['pinterest', 'blog'],
    contentTypes: ['reels', 'tutorials', 'transformations', 'recipes'],
    strategies: ['before_after', 'challenges', 'community_support', 'expert_interviews']
  },
  ecommerce: {
    platforms: ['instagram', 'tiktok', 'pinterest', 'facebook', 'youtube'],
    priority: ['instagram', 'tiktok'],
    integrations: ['shopify', 'pinterest', 'facebook'],
    contentTypes: ['product_shots', 'ugc', 'reels', 'stories'],
    strategies: ['ugc_campaigns', 'influencer_ads', 'retargeting', 'email_marketing']
  },
  general: {
    platforms: ['instagram', 'facebook', 'youtube', 'tiktok', 'linkedin'],
    priority: ['instagram', 'facebook'],
    integrations: ['blog', 'email'],
    contentTypes: ['mixed', 'reels', 'carousels', 'stories'],
    strategies: ['content_calendar', 'cross_posting', 'community_building']
  }
};

// Add project
function addProject(params) {
  const { name, niche, instagram, youtube, tiktok, facebook, pinterest } = params;
  
  const project = JSON.parse(JSON.stringify(projectTemplate));
  
  project.id = `proj-${Date.now()}`;
  project.name = name;
  project.niche = niche || 'general';
  project.createdAt = new Date().toISOString();
  project.updatedAt = new Date().toISOString();
  
  // Set platforms
  if (instagram) project.platforms.instagram = { handle: instagram, connected: true };
  if (youtube) project.platforms.youtube = { channel: youtube, connected: true };
  if (tiktok) project.platforms.tiktok = { handle: tiktok, connected: true };
  if (facebook) project.platforms.facebook = { page: facebook, connected: true };
  if (pinterest) project.platforms.pinterest = { account: pinterest, connected: true };
  
  // Save
  const file = path.join(INVENTORY_DIR, `${project.id}.json`);
  fs.writeFileSync(file, JSON.stringify(project, null, 2));
  
  return project;
}

// List projects
function listProjects() {
  const projects = fs.readdirSync(INVENTORY_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(INVENTORY_DIR, f)));
      return {
        id: data.id,
        name: data.name,
        niche: data.niche,
        status: data.status,
        platforms: Object.entries(data.platforms).filter(([k, v]) => v && v.connected).map(([k]) => k)
      };
    });
  
  return projects;
}

// Analyze gaps for a project
function analyzeGaps(projectId) {
  const file = path.join(INVENTORY_DIR, `${projectId}.json`);
  if (!fs.existsSync(file)) {
    return null;
  }
  
  const project = JSON.parse(fs.readFileSync(file));
  const nicheRecs = nicheRecommendations[project.niche] || nicheRecommendations.general;
  
  const gaps = [];
  const missingPlatforms = [];
  const missingFeatures = [];
  const recommendations = [];
  
  // Check missing platforms
  nicheRecs.platforms.forEach(platform => {
    if (!project.platforms[platform] || !project.platforms[platform].connected) {
      const severity = nicheRecs.priority.includes(platform) ? 'ALTA' : 'MÉDIA';
      missingPlatforms.push({
        platform,
        severity,
        reason: platformGaps[platform]?.missing[platform] || `${platform} não conectado`,
        opportunity: nicheRecs.priority.includes(platform) ? 85 : 65
      });
    }
  });
  
  // Check missing features
  const featureMap = {
    hasEmailSequence: 'Sequência de e-mails',
    hasFunnel: 'Funil de vendas',
    hasMembership: 'Programa de membership',
    hasLeadMagnet: 'Lead magnet',
    hasPaidAds: 'Tráfego pago',
    hasAutomation: 'Automação',
    hasCRM: 'CRM',
    hasChatbot: 'Chatbot'
  };
  
  Object.entries(featureMap).forEach(([feature, label]) => {
    if (!project.features[feature]) {
      missingFeatures.push({
        feature,
        label,
        severity: 'MÉDIA',
        opportunity: 70
      });
    }
  });
  
  // Generate recommendations
  nicheRecs.integrations.forEach(integration => {
    if (!project.platforms[integration] || !project.platforms[integration].connected) {
      const nicheSpecificRecs = nicheRecs.recommendations[project.niche] || nicheRecs.recommendations.general;
      
      const specificRec = nicheSpecificRecs.find(r => r.toLowerCase().includes(integration)) || 
        `Conectar ${integration}`;
      
      recommendations.push({
        integration,
        recommendation: specificRec,
        priority: nicheRecs.priority.includes(integration) ? 'ALTA' : 'MÉDIA',
        expectedImpact: '+' + (nicheRecs.priority.includes(integration) ? '40' : '25') + '%'
      });
    }
  });
  
  // Content gaps
  const contentGaps = [];
  if (!project.content.types.includes('reels') && nicheRecs.contentTypes.includes('reels')) {
    contentGaps.push({
      type: 'reels',
      reason: 'Formato com maior engajamento',
      opportunity: 80
    });
  }
  if (!project.content.types.includes('carousels') && nicheRecs.contentTypes.includes('carousels')) {
    contentGaps.push({
      type: 'carousels',
      reason: 'Bom para educação e CTAs',
      opportunity: 70
    });
  }
  if (!project.content.types.includes('ugc') && nicheRecs.strategies.includes('ugc_campaigns')) {
    contentGaps.push({
      type: 'ugc',
      reason: 'Alta conversão e confiança',
      opportunity: 75
    });
  }
  
  // Strategy gaps
  const strategyGaps = [];
  nicheRecs.strategies.forEach(strategy => {
    if (!project.strategies.includes(strategy)) {
      const strategyLabels = {
        ugc_campaigns: 'Campanhas UGC',
        influencer_collab: 'Colabs com influenciadores',
        lead_magnet: 'Lead magnets',
        webinar: 'Webinars',
        case_studies: 'Cases de sucesso',
        retargeting: 'Retargeting ads',
        community_building: 'Construção de comunidade',
        cross_posting: 'Cross-posting'
      };
      
      strategyGaps.push({
        strategy,
        label: strategyLabels[strategy] || strategy,
        priority: nicheRecs.priority.includes(strategy) ? 'ALTA' : 'MÉDIA',
        opportunity: 65
      });
    }
  });
  
  const analysis = {
    projectId: project.id,
    projectName: project.name,
    niche: project.niche,
    analyzedAt: new Date().toISOString(),
    platforms: {
      connected: Object.entries(project.platforms).filter(([k, v]) => v && v.connected).map(([k]) => k),
      missing: missingPlatforms
    },
    features: {
      connected: Object.entries(project.features).filter(([k, v]) => v).map(([k]) => k),
      missing: missingFeatures
    },
    content: {
      current: project.content.types,
      gaps: contentGaps
    },
    strategies: {
      current: project.strategies,
      recommendations: strategyGaps
    },
    integrations: recommendations,
    scores: {
      platformScore: Math.round((Object.entries(project.platforms).filter(([k, v]) => v && v.connected).length / nicheRecs.platforms.length) * 100),
      featureScore: Math.round((Object.entries(project.features).filter(([k, v]) => v).length / Object.keys(project.features).length * 100),
      contentScore: Math.round((project.content.types.length / nicheRecs.contentTypes.length) * 100),
      overall: 0
    },
    summary: generateSummary(missingPlatforms, missingFeatures, contentGaps, strategyGaps)
  };
  
  // Calculate overall score
  analysis.scores.overall = Math.round(
    (analysis.scores.platformScore * 0.3) +
    (analysis.scores.featureScore * 0.3) +
    (analysis.scores.contentScore * 0.4)
  );
  
  return analysis;
}

function generateSummary(platforms, features, content, strategies) {
  const gaps = [];
  
  if (platforms.length > 0) {
    const highPriority = platforms.filter(p => p.severity === 'ALTA').length;
    gaps.push(`${platforms.length} plataformas faltando (${highPriority} alta prioridade)`);
  }
  
  if (features.length > 0) {
    gaps.push(`${features.length} funcionalidades faltando`);
  }
  
  if (content.length > 0) {
    gaps.push(`${content.length} tipos de conteúdo para adicionar`);
  }
  
  return gaps.length > 0 ? gaps.join(', ') : 'Projeto bem completo!';
}

// Generate detailed report
function generateReport(analysis) {
  const recommendations = [];
  
  // Priority actions
  recommendations.push(...analysis.platforms.missing.filter(p => p.severity === 'ALTA').map(p => ({
    priority: 'ALTA',
    category: 'PLATAFORMA',
    action: `Conectar ${p.platform}`,
    reason: p.reason,
    impact: `+${p.opportunity}%`
  })));
  
  recommendations.push(...analysis.integrations.filter(i => i.priority === 'ALTA').map(i => ({
    priority: 'ALTA',
    category: 'INTEGRAÇÃO',
    action: i.recommendation,
    reason: `Para nicho ${analysis.niche}`,
    impact: i.expectedImpact
  })));
  
  recommendations.push(...analysis.content.gaps.map(c => ({
    priority: 'ALTA',
    category: 'CONTEÚDO',
    action: `Criar ${c.type}`,
    reason: c.reason,
    impact: `+${c.opportunity}%`
  })));
  
  recommendations.push(...analysis.strategies.recommendations.filter(s => s.priority === 'MÉDIA').map(s => ({
    priority: 'MÉDIA',
    category: 'ESTRATÉGIA',
    action: `Implementar ${s.label}`,
    reason: 'Para crescimento sustentável',
    impact: '+25%'
  })));
  
  const report = `
# 🎯 RELATÓRIO DE GAPS - ${analysis.projectName}

**Projeto ID:** ${analysis.projectId}  
**Nichos:** ${analysis.niche}  
**Analisado:** ${new Date().toLocaleString('pt-BR')}

---

## 📊 SCORES

| Área | Score | Status |
|------|-------|--------|
| Plataformas | ${analysis.scores.platformScore}% | ${analysis.scores.platformScore >= 70 ? '🟢' : analysis.scores.platformScore >= 40 ? '🟡' : '🔴'} |
| Funcionalidades | ${analysis.scores.featureScore}% | ${analysis.scores.featureScore >= 70 ? '🟢' : analysis.scores.featureScore >= 40 ? '🟡' : '🔴'} |
| Conteúdo | ${analysis.scores.contentScore}% | ${analysis.scores.contentScore >= 70 ? '🟢' : analysis.scores.contentScore >= 40 ? '🟡' : '🔴'} |
| **Geral** | **${analysis.scores.overall}%** | **${analysis.scores.overall >= 70 ? '🟢 BOM' : analysis.scores.overall >= 40 ? '🟡 PRECISA MELHORAR' : '🔴 CRÍTICO'}** |

---

## ✅ PLATAFORMAS CONECTADAS

${analysis.platforms.connected.length > 0 
  ? analysis.platforms.connected.map(p => `- ${p}`).join('\n')
  : '- Nenhuma plataforma conectada'}

---

## ❌ PLATAFORMAS FALTANDO

${analysis.platforms.missing.length > 0 
  ? analysis.platforms.missing.map(p => {
      const severity = p.severity === 'ALTA' ? '🔴 ALTA' : '🟡 MÉDIA';
      return `### ${severity} - ${p.platform}
**Motivo:** ${p.reason}
**Oportunidade:** ${p.opportunity}%`;
    }).join('\n\n')
  : '- Nenhuma plataforma faltando'}

---

## 🎯 RECOMENDAÇÕES POR PRIORIDADE

### 🔴 ALTA PRIORIDADE

${recommendations.filter(r => r.priority === 'ALTA').map((r, i) => `
#### ${i + 1}. ${r.category}: ${r.action}
**Motivo:** ${r.reason}
**Impacto esperado:** ${r.impact}
`).join('\n') || '- Nenhuma recomendação de alta prioridade'}

### 🟡 MÉDIA PRIORIDADE

${recommendations.filter(r => r.priority === 'MÉDIA').map((r, i) => `
#### ${i + 1}. ${r.category}: ${r.action}
**Motivo:** ${r.reason}
**Impacto esperado:** ${r.impact}
`).join('\n') || '- Nenhuma recomendação de média prioridade'}

---

## 📱 ANÁLISE POR PLATAFORMA

${analysis.platforms.missing.filter(p => p.platform === 'pinterest').length > 0 ? `
### 📌 PINTEREST (FALTANDO)

**Por que conectar:**
- Tráfego orgânico de longo prazo
- Busca por produtos/soluções
- Ideal para ${analysis.niche === 'pets' ? 'produtos para pets, inspiração' : 
           analysis.niche === 'educacao_financeira' ? 'infográficos, dicas' :
           analysis.niche === 'health' ? 'receitas, exercícios' : 'conteúdo visual'}

**Como implementar:**
1. Criar conta business
2. Criar boards por categoria
3. Pino de produtos/conteúdo
4. Rich pins para artigos
5. Ads para scaling
` : ''}

${analysis.platforms.missing.filter(p => p.platform === 'facebook').length > 0 ? `
### 📘 FACEBOOK (FALTANDO)

**Por que conectar:**
- Ads para retargeting
- Cross-posting de conteúdo
- Facebook Groups para comunidade
- Messenger para customer service

**Como implementar:**
1. Criar/connectar Page
2. Configurar Meta Pixel
3. Criar Grupo para comunidade
4. Ads de retargeting
` : ''}

${analysis.platforms.missing.filter(p => p.platform === 'youtube').length > 0 ? `
### 🎬 YOUTUBE (FALTANDO)

**Por que conectar:**
- Segundo maior motor de busca
- Formato longo para autoridade
- Repurposing de conteúdo
- Monetização direta

**Como implementar:**
1. Criar canal
2. Reutilizar posts como vídeos
3. Tutoriais de 10-15 min
4. SEO otimizado
` : ''}

${analysis.platforms.missing.filter(p => p.platform === 'linkedin').length > 0 ? `
### 💼 LINKEDIN (FALTANDO)

**Por que conectar:**
- Autoridade profissional
- Networking B2B
- Conteúdo de Thought Leadership
- Parcerias estratégicas

**Como implementar:**
1. Criar perfil/Page Company
2. Postar artigos longos
3. Engajar com líderes do nicho
4. LinkedIn Ads B2B
` : ''}

---

## 📝 TIPOS DE CONTEÚDO FALTANDO

${analysis.content.gaps.length > 0 
  ? analysis.content.gaps.map(c => `
### ${c.type.toUpperCase()}
**Motivo:** ${c.reason}
**Oportunidade:** ${c.opportunity}%
`).join('\n')
  : '- Todos os tipos de conteúdo estão presentes'}

---

## 🎯 ESTRATÉGIAS RECOMENDADAS

${analysis.strategies.recommendations.length > 0 
  ? analysis.strategies.recommendations.map(s => `
### ${s.label}
**Prioridade:** ${s.priority}
**Oportunidade:** ${s.opportunity}%
`).join('\n')
  : '- Todas as estratégias implementadas'}

---

## 🎯 PRÓXIMOS PASSOS

### Esta Semana
${recommendations.filter(r => r.priority === 'ALTA').slice(0, 3).map(r => `- [ ] ${r.action}`).join('\n') || '- Nenhuma ação definida'}

### Este Mês
${recommendations.filter(r => r.priority === 'MÉDIA').slice(0, 3).map(r => `- [ ] ${r.action}`).join('\n') || '- Nenhuma ação definida'}

---

## 📈 PROJEÇÃO DE IMPACTO

| Ação | Impacto | Esforço |
|------|---------|---------|
${recommendations.slice(0, 5).map(r => `| ${r.action} | ${r.impact} | ${r.priority === 'ALTA' ? 'Alto' : 'Médio'} |`).join('\n')}

---

**Análise gerada automaticamente pelo Project Gap Analyzer**

*Ecossistema Autônomo - Império Digital*
`;
  
  return { report, recommendations };
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'help';

init();

switch (command) {
  case 'add':
    logSection('➕ ADICIONAR PROJETO');
    
    const project = addProject({
      name: args[1] || 'Novo Projeto',
      niche: args[2] || 'general',
      instagram: args[3],
      youtube: args[4],
      tiktok: args[5],
      facebook: args[6],
      pinterest: args[7]
    });
    
    console.log('\n✅ Projeto criado:');
    console.log(JSON.stringify(project, null, 2));
    break;
    
  case 'list':
    logSection('📋 PROJETOS CADASTRADOS');
    
    const projects = listProjects();
    console.log(`\n📊 Total: ${projects.length} projetos\n`);
    
    projects.forEach(p => {
      console.log(`📦 ${p.name}`);
      console.log(`   Nicho: ${p.niche}`);
      console.log(`   Plataformas: ${p.platforms.join(', ') || 'Nenhuma'}`);
      console.log('');
    });
    break;
    
  case 'analyze':
    logSection('🔍 ANALISAR GAPS');
    
    const projectId = args[1];
    
    if (!projectId) {
      // List projects and ask to choose
      const allProjects = listProjects();
      if (allProjects.length === 0) {
        console.log('\n❌ Nenhum projeto cadastrado.');
        console.log('Use: node project-gap-analyzer.js add "Nome" nicho instagram\n');
      } else {
        console.log('\n📋 Projetos disponíveis:\n');
        allProjects.forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.name} (${p.niche})`);
        });
        console.log('\nUse: node project-gap-analyzer.js analyze [project-id]\n');
      }
      break;
    }
    
    const analysis = analyzeGaps(projectId);
    
    if (!analysis) {
      console.log('\n❌ Projeto não encontrado.');
      break;
    }
    
    console.log(`\n📊 Análise: ${analysis.projectName}`);
    console.log(`   Score Geral: ${analysis.scores.overall}%\n`);
    
    // Show summary
    console.log('📋 RESUMO:');
    console.log(`   ${analysis.summary}`);
    console.log(`\n🔴 Plataformas faltando: ${analysis.platforms.missing.length}`);
    console.log(`   Funcionalidades faltando: ${analysis.features.missing.length}`);
    console.log(`   Tipos de conteúdo faltando: ${analysis.content.gaps.length}`);
    console.log(`   Estratégias faltando: ${analysis.strategies.recommendations.length}`);
    
    // Save report
    const { report } = generateReport(analysis);
    const reportFile = path.join(REPORTS_DIR, `gap-report-${projectId}-${Date.now()}.md`);
    fs.writeFileSync(reportFile, report);
    console.log(`\n📄 Relatório salvo: ${reportFile}`);
    break;
    
  case 'recommend':
    logSection('💡 RECOMENDAÇÕES ESPECÍFICAS');
    
    const niche = args[1] || 'general';
    const recs = nicheRecommendations[niche] || nicheRecommendations.general;
    
    console.log(`\n📌 Plataformas para ${niche}:`);
    console.log(`   Prioritárias: ${recs.priority.join(', ')}`);
    console.log(`   Secundárias: ${recs.platforms.filter(p => !recs.priority.includes(p)).join(', ')}`);
    
    console.log(`\n🎯 Integrações recomendadas:`);
    recs.integrations.forEach(i => console.log(`   - ${i}`));
    
    console.log(`\n📝 Tipos de conteúdo:`);
    recs.contentTypes.forEach(c => console.log(`   - ${c}`));
    
    console.log(`\n🚀 Estratégias:`);
    const strategyLabels = {
      ugc_campaigns: 'Campanhas UGC',
      influencer_collab: 'Colabs com influenciadores',
      lead_magnet: 'Lead magnets',
      webinar: 'Webinars',
      case_studies: 'Cases de sucesso',
      retargeting: 'Retargeting ads',
      community_building: 'Construção de comunidade'
    };
    recs.strategies.forEach(s => console.log(`   - ${strategyLabels[s] || s}`));
    break;
    
  case 'help':
  default:
    logSection('🎯 PROJECT GAP ANALYZER');
    console.log(`
用法: node project-gap-analyzer.js [comando]

Comandos:
  add [nome] [nicho] [ig] [yt] [tt] [fb] [pin]  - Adicionar projeto
  list                                           - Listar projetos
  analyze [project-id]                           - Analisar gaps
  recommend [nicho]                             - Recomendações por nicho

Nichos suportados:
  pets, educacao_financeira, health, ecommerce, general

Exemplos:
  node project-gap-analyzer.js add "PetSelectUK" pets pets_brasil "" "" "" ""
  node project-gap-analyzer.js list
  node project-gap-analyzer.js analyze proj-123456789
  node project-gap-analyzer.js recommend pets

Outputs:
  - Inventory em data/projects/
  - Relatórios em data/reports/
`);
}

module.exports = {
  addProject,
  listProjects,
  analyzeGaps,
  generateReport,
  nicheRecommendations
};
