#!/usr/bin/env node

/**
 * 📺 WORKER YOUTUBE - SCRIPT GENERATOR
 * 
 * Gera roteiros de vídeos otimizados para YouTube
 * baseados em templates virais e SEO.
 * 
 * Usage: node youtube-script-generator.js [tipo] [tema]
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
  console.log(`${GREEN}═══════════════════════════════════════${RESET}\n`);
}

// Video templates
const videoTemplates = {
  listicle: {
    name: 'Listicle',
    structure: [
      { time: '0:00', section: 'HOOK', content: 'Abertura impactante' },
      { time: '0:30', section: 'INTRO', content: 'Apresentação do tema' },
      { time: '1:00', section: 'ITEM 1', content: 'Primeiro item com exemplo' },
      { time: '3:00', section: 'ITEM 2', content: 'Segundo item com exemplo' },
      { time: '5:00', section: 'ITEM 3', content: 'Terceiro item com exemplo' },
      { time: '7:00', section: 'ITEM 4', content: 'Quarto item com exemplo' },
      { time: '8:30', section: 'ITEM 5', content: 'Quinto item com exemplo' },
      { time: '9:30', section: 'RESUMO', content: 'Recapitulação rápida' },
      { time: '9:45', section: 'CTA', content: 'Inscreva-se' }
    ],
    duration: '10 minutos',
    style: 'Estruturado'
  },
  tutorial: {
    name: 'Tutorial',
    structure: [
      { time: '0:00', section: 'HOOK', content: 'Resultado final' },
      { time: '0:20', section: 'INTRO', content: 'O que você vai aprender' },
      { time: '1:00', section: 'PASSO 1', content: 'Primeira etapa' },
      { time: '3:00', section: 'PASSO 2', content: 'Segunda etapa' },
      { time: '5:00', section: 'PASSO 3', content: 'Terceira etapa' },
      { time: '7:00', section: 'PASSO 4', content: 'Quarta etapa' },
      { time: '8:30', section: 'RESULTADO', content: 'Demonstração' },
      { time: '9:30', section: 'CTA', content: 'Próximo passo' }
    ],
    duration: '10 minutos',
    style: 'Educativo'
  },
  story: {
    name: 'Storytelling',
    structure: [
      { time: '0:00', section: 'HOOK', content: ' Revelação inicial' },
      { time: '1:00', section: 'CONTEXT', content: 'Situação inicial' },
      { time: '3:00', section: 'PROBLEMA', content: 'Desafio encontrado' },
      { time: '5:00', section: 'JOURNEY', content: 'Caminho até a solução' },
      { time: '7:00', section: 'SOLUTION', content: 'A revelação' },
      { time: '8:30', section: 'LESSON', content: 'O que aprendi' },
      { time: '9:30', section: 'CTA', content: 'Sua vez' }
    ],
    duration: '10 minutos',
    style: 'Emocional'
  },
  review: {
    name: 'Review',
    structure: [
      { time: '0:00', section: 'HOOK', content: 'Opinião controversa' },
      { time: '0:30', section: 'INTRO', content: 'Apresentação do produto' },
      { time: '2:00', section: 'PRÓS', content: 'Pontos positivos' },
      { time: '4:00', section: 'CONTRAS', content: 'Pontos negativos' },
      { time: '6:00', section: 'VERDICT', content: 'Vale a pena?' },
      { time: '8:00', section: 'ALTERNATIVES', content: 'Outras opções' },
      { time: '9:30', section: 'CTA', content: 'Compre aqui' }
    ],
    duration: '10 minutos',
    style: 'Analítico'
  },
  reaction: {
    name: 'Reaction',
    structure: [
      { time: '0:00', section: 'HOOK', content: 'Reação inicial' },
      { time: '0:30', section: 'WATCH', content: 'Assistindo' },
      { time: '3:00', section: 'COMMENT', content: 'Comentário 1' },
      { time: '5:00', section: 'COMMENT', content: 'Comentário 2' },
      { time: '7:00', section: 'FINAL', content: 'Reação final' },
      { time: '9:00', section: 'CTA', content: 'Mais reações' }
    ],
    duration: '10 minutos',
    style: 'Entretenimento'
  }
};

// Hook templates
const hookTemplates = {
  contrarian: [
    'A verdade sobre {topic} que ninguém conta',
    'Por que {topic} está ERRADO',
    'O que {experts} não quer que você saiba',
    'Você está fazendo {topic} errado'
  ],
  number: [
    '{n} erros que você comete com {topic}',
    '{n} formas de {resultado}',
    '{n} coisas sobre {topic} que você não sabia',
    'Os {n} melhores {topic} de {year}'
  ],
  question: [
    'E se você pudesse {resultado}?',
    'Você sabe {verdade} sobre {topic}?',
    'Por que {topic} é tão {adjective}?',
    'O que {celebrity} faz de diferente?'
  ],
  story: [
    'Há {time} eu estava {situation}',
    'A história mais {adjective} sobre {topic}',
    'Quando {person} descobriu {topic}',
    'Como eu {action} em {timeframe}'
  ],
  result: [
    'Como {resultado} em {timeframe}',
    '{resultado} sem {obstacle}',
    'O método {expert} usa para {resultado}',
    'De {from} para {to} em {time}'
  ]
};

// Generate hooks
function generateHooks(topic, result) {
  const hooks = [];
  
  Object.entries(hookTemplates).forEach(([type, templates]) => {
    templates.forEach(template => {
      let hook = template
        .replace('{topic}', topic)
        .replace('{resultado}', result)
        .replace('{n}', Math.floor(Math.random() * 10) + 3)
        .replace('{year}', new Date().getFullYear())
        .replace('{time}', ['1 ano', '6 meses', '30 dias'][Math.floor(Math.random() * 3)])
        .replace('{timeframe}', ['7 dias', '30 dias', '3 meses'][Math.floor(Math.random() * 3)])
        .replace('{experts}', ['dentistas', 'médicos', 'experts'][Math.floor(Math.random() * 3)])
        .replace('{celebrity}', ['Bill Gates', 'Musk', 'Zuckerberg'][Math.floor(Math.random() * 3)])
        .replace('{situation}', ['falido', 'sem方向', 'desesperado'][Math.floor(Math.random() * 3)])
        .replace('{from}', 'zero')
        .replace('{to}', 'R$ 10.000')
        .replace('{action}', 'me tornei rico')
        .replace('{adjective}', ['incrível', 'surpreendente', 'inesperada'][Math.floor(Math.random() * 3)])
        .replace('{person}', ['eu', 'meu amigo', 'um aluno'][Math.floor(Math.random() * 3)])
        .replace('{obstacle}', ['esforço', 'dinheiro', 'tempo'][Math.floor(Math.random() * 3)]);
      
      hooks.push({ type, hook });
    });
  });
  
  return hooks.slice(0, 10); // Top 10 hooks
}

// Generate script
function generateScript(params) {
  const { type = 'listicle', topic, niche, keywords = [] } = params;
  
  const template = videoTemplates[type] || videoTemplates.listicle;
  
  // Generate hooks
  const hooks = generateHooks(topic, `conseguir ${topic}`);
  
  // Generate body sections
  const body = template.structure.filter(s => 
    s.section !== 'HOOK' && s.section !== 'INTRO' && s.section !== 'CTA'
  );
  
  const script = {
    type,
    topic,
    niche,
    keywords,
    duration: template.duration,
    createdAt: new Date().toISOString(),
    hooks: hooks.slice(0, 5),
    structure: template.structure,
    fullScript: buildFullScript(template, topic, niche)
  };
  
  return script;
}

// Build full script text
function buildFullScript(template, topic, niche) {
  const introTemplate = `
BORA! Vamos falar sobre ${topic}.

Se você quer ${generateGoal(topic)}, esse vídeo é pra você.

Ao final desse vídeo, você vai saber:
- ${generatePoint(topic, 1)}
- ${generatePoint(topic, 2)}
- ${generatePoint(topic, 3)}

Bora começar!
`;
  
  const sections = template.structure.map(s => {
    return `[${s.time}] ${s.section}\n${s.content}`;
  }).join('\n\n');
  
  const outroTemplate = `
Então, resumindo o que aprendemos hoje:

1. ${generatePoint(topic, 1)}
2. ${generatePoint(topic, 2)}
3. ${generatePoint(topic, 3)}

Curtiu? INSCREVA-SE e ative o sininho!

Próximo vídeo: Como ${generateGoal(topic)} em menos tempo.

Até lá!
`;
  
  return {
    intro: introTemplate,
    sections,
    outro: outroTemplate
  };
}

function generateGoal(topic) {
  return `dominar ${topic} e ter resultados`;
}

function generatePoint(topic, num) {
  const points = {
    1: ['o básico sobre', 'a verdade sobre', 'como começar com'],
    2: ['os erros mais comuns', 'as técnicas avançadas', 'os segredos que'],
    3: ['transformam resultados', 'aceleram o processo', 'diferenciam os Experts']
  };
  
  return `${points[num][Math.floor(Math.random() * points[num].length)]} ${topic}`;
}

// Generate SEO metadata
function generateSEO(topic, keywords) {
  return {
    title: `${topic}: O Guia Completo em 2026`,
    description: `Aprenda tudo sobre ${topic} neste vídeo completo. 

⏱️ Timestamps:
0:00 - Introdução
1:00 - O que você vai aprender
...

#${topic.replace(/\s/g, '')} #${keywords[0] || 'tutorial'}`,
    tags: [
      topic,
      `como ${topic}`,
      `${topic} para iniciantes`,
      `curso de ${topic}`,
      ...keywords
    ]
  };
}

// Generate thumbnail suggestions
function generateThumbnails(topic) {
  return [
    {
      text: `O QUE NINGUÉM CONTA SOBRE ${topic.toUpperCase()}`,
      colors: ['#FF0000', '#FFFFFF', '#000000'],
      style: 'shocked_face'
    },
    {
      text: `${topic.toUpperCase()} EM 5 MINUTOS`,
      colors: ['#000000', '#FFFF00', '#FFFFFF'],
      style: 'clock'
    },
    {
      text: `R$ 10.000 COM ${topic.toUpperCase()}`,
      colors: ['#00FF00', '#FFFFFF', '#000000'],
      style: 'money'
    }
  ];
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'help';

const params = {
  type: args[0] || 'listicle',
  topic: args[1] || 'Educação Financeira',
  niche: args[2] || 'Finanças',
  keywords: args[3] ? [args[3]] : ['dinheiro', 'investimento']
};

switch (command) {
  case 'script':
  case 'generate':
    logSection(`📺 GERADOR DE ROTEIROS - ${params.type.toUpperCase()}`);
    
    const script = generateScript(params);
    
    console.log('📝 ROTEIRO GERADO:\n');
    console.log(`Tipo: ${script.type}`);
    console.log(`Duração: ${script.duration}`);
    console.log(`Tema: ${script.topic}\n`);
    
    console.log('🎯 TOP 5 HOOKS:\n');
    script.hooks.slice(0, 5).forEach((h, i) => {
      console.log(`${i + 1}. [${h.type}] "${h.hook}"`);
    });
    
    console.log('\n📄 ESTRUTURA:');
    script.structure.forEach(s => {
      console.log(`   ${s.time} - ${s.section}`);
    });
    
    console.log('\n🎨 THUMBNAILS:\n');
    const thumbnails = generateThumbnails(params.topic);
    thumbnails.forEach((t, i) => {
      console.log(`${i + 1}. "${t.text}" (${t.style})`);
    });
    
    // Save
    const outputFile = path.join(__dirname, `../insights/videos/script-${Date.now()}.json`);
    if (!fs.existsSync(path.dirname(outputFile))) {
      fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    }
    fs.writeFileSync(outputFile, JSON.stringify(script, null, 2));
    console.log(`\n💾 Salvo: ${outputFile}`);
    break;
    
  case 'hooks':
    logSection('🎯 GERADOR DE HOOKS');
    
    const hooks = generateHooks(params.topic, 'resultado');
    hooks.forEach((h, i) => {
      console.log(`${i + 1}. [${h.type}] "${h.hook}"`);
    });
    break;
    
  case 'seo':
    logSection('🔍 SEO METADATA');
    
    const seo = generateSEO(params.topic, params.keywords);
    console.log(`\n📝 Título: ${seo.title}`);
    console.log(`\n📄 Descrição:\n${seo.description}`);
    console.log(`\n🏷️ Tags: ${seo.tags.join(', ')}`);
    break;
    
  case 'thumbnails':
    logSection('🎨 THUMBNAIL SUGESTIONS');
    
    const thumbs = generateThumbnails(params.topic);
    thumbs.forEach((t, i) => {
      console.log(`\n${i + 1}. "${t.text}"`);
      console.log(`   Cores: ${t.colors.join(', ')}`);
      console.log(`   Estilo: ${t.style}`);
    });
    break;
    
  case 'templates':
    logSection('📋 TIPOS DE VÍDEO');
    
    Object.entries(videoTemplates).forEach(([key, t]) => {
      console.log(`\n${key.toUpperCase()}: ${t.name}`);
      console.log(`   Duração: ${t.duration}`);
      console.log(`   Estilo: ${t.style}`);
    });
    break;
    
  case 'help':
  default:
    logSection('📺 WORKER YOUTUBE');
    console.log(`
用法: node youtube-script-generator.js [comando] [tipo] [tema] [nichos]

Comandos:
  script [tipo] [tema] [nicho]  - Gerar roteiro completo
  hooks [tema]                 - Gerar apenas hooks
  seo [tema] [keywords]        - Gerar metadata SEO
  thumbnails [tema]           - Sugestões de thumbnails
  templates                    - Listar tipos de vídeo

Tipos de vídeo:
  listicle   - Lista (ex: "5 formas de...")
  tutorial   - Tutorial passo a passo
  story      - Storytelling
  review     - Review de produto
  reaction   - Reação

Exemplos:
  node youtube-script-generator.js script tutorial "Como investir"
  node youtube-script-generator.js hooks "educação financeira"
  node youtube-script-generator.js seo "bitcoin" "crypto"
  node youtube-script-generator.js thumbnails "marketing"

Nichos monitorados:
  educacao-financeira, pets, games, tecnologia, moda
`);
}

module.exports = {
  generateScript,
  generateHooks,
  generateSEO,
  generateThumbnails,
  videoTemplates,
  hookTemplates
};
