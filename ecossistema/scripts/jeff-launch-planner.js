#!/usr/bin/env node

/**
 * 🚀 WORKER JEFF - PLF LAUNCH PLANNER
 * 
 * Planeja e executa lançamentos no formato Product Launch Formula
 * Gera sequências de e-mails, scripts de vídeos e calendários.
 * 
 * Usage: node jeff-launch-planner.js [plan|email|video|status]
 */

const fs = require('fs');
const path = require('path');

// Colors
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(message) {
  console.log(`${BLUE}[${new Date().toISOString()}]${RESET} ${message}`);
}

function logSection(title) {
  console.log(`\n${GREEN}═══════════════════════════════════════${RESET}`);
  console.log(`${GREEN}  ${title}${RESET}`);
  console.log(`════════════════════════════════════════${RESET}\n`);
}

// PLF Templates
const plfStructure = {
  preLaunch: { days: [-7, -6, -5, -4], name: 'Pré-lançamento' },
  video1: { day: -3, name: 'VÍDEO 1: O Problema', duration: '10-15 min' },
  video2: { day: -2, name: 'VÍDEO 2: A Jornada', duration: '15-20 min' },
  video3: { day: -1, name: 'VÍDEO 3: A Solução', duration: '20-30 min' },
  opening: { day: 0, name: 'ABERTURA' },
  closing: { days: [1, 2], name: 'FECHAMENTO' }
};

// E-mail templates
const emailTemplates = {
  1: { name: 'O Ganhho', subject: '{hook}?', openRate: 25, clickRate: 5 },
  2: { name: 'A História', subject: 'A história completa', openRate: 22, clickRate: 4 },
  3: { name: 'A Revelação', subject: 'Finalmente...', openRate: 30, clickRate: 8 },
  4: { name: 'A Oferta', subject: 'A oferta está aberta', openRate: 35, clickRate: 12 },
  5: { name: 'Urgência', subject: 'ÚLTIMAS HORAS', openRate: 40, clickRate: 15 }
};

// Video script templates
const videoTemplates = {
  1: { name: 'O Problema', duration: '10-15 min', hook: 'Você está cometendo esse erro?' },
  2: { name: 'A Jornada', duration: '15-20 min', hook: 'O que eu descobri...' },
  3: { name: 'A Solução', duration: '20-30 min', hook: 'Bem-vindo ao...' }
};

// Generate launch plan
function generateLaunchPlan(params) {
  const { productName, launchDate, price } = params;
  
  const openingDate = new Date(launchDate);
  const calendar = [];
  
  for (let i = -7; i <= 2; i++) {
    const date = new Date(openingDate);
    date.setDate(date.getDate() + i);
    
    let type = 'PRE-LAUNCH';
    if (i === -3) type = 'VIDEO_1';
    else if (i === -2) type = 'VIDEO_2';
    else if (i === -1) type = 'VIDEO_3';
    else if (i === 0) type = 'OPENING';
    else if (i > 0) type = 'CLOSING';
    
    calendar.push({
      day: i,
      date: date.toISOString().split('T')[0],
      type,
      activities: getActivities(i)
    });
  }
  
  return { productName, price, openingDate, calendar };
}

function getActivities(day) {
  const activities = {
    '-7': ['Enviar e-mail teaser', 'Post no Stories'],
    '-6': ['Dica gratuita', 'Engajamento'],
    '-5': ['Story de bastidores', 'Countdown'],
    '-4': ['Result teaser', 'Behind the scenes'],
    '-3': ['Publicar VÍDEO 1', 'E-mail 1: O Ganchho'],
    '-2': ['Publicar VÍDEO 2', 'E-mail 2: A História'],
    '-1': ['Publicar VÍDEO 3', 'E-mail 3: A Revelação'],
    '0': ['ABERTURA DA OFERTA', 'E-mail 4: A Oferta'],
    '1': ['FECHAMENTO', 'E-mail 5: Urgência'],
    '2': ['ÚLTIMO DIA', 'Último e-mail']
  };
  return activities[day] || [];
}

// Generate email
function generateEmail(templateId, params) {
  const { productName, avatar, benefit, price, closeTime } = params;
  
  const emails = {
    1: { subject: `Você está cometendo esse erro com ${productName}?`, preview: 'Eu cometi esse erro por...' },
    2: { subject: 'A história completa', preview: 'Na minha última mensagem...' },
    3: { subject: 'Finalmente...', preview: 'A espera acabou.' },
    4: { subject: `A oferta do ${productName} está aberta`, preview: 'A porta está aberta.' },
    5: { subject: 'ÚLTIMAS HORAS ⏰', preview: 'O relógio está passando.' }
  };
  
  return {
    id: templateId,
    name: emailTemplates[templateId].name,
    ...emails[templateId],
    metrics: { openRate: emailTemplates[templateId].openRate, clickRate: emailTemplates[templateId].clickRate }
  };
}

// Generate video script
function generateVideoScript(videoId, params) {
  const { productName } = params;
  const template = videoTemplates[videoId];
  
  const structures = {
    1: [
      { time: '00:00', section: 'HOOK', content: 'Pergunta impactante' },
      { time: '00:30', section: 'STORY', content: 'Minha história' },
      { time: '03:30', section: 'PROBLEMA', content: 'Por que X é difícil' },
      { time: '08:30', section: 'PROMESSA', content: 'O que vai aprender' },
      { time: '10:30', section: 'TEASE', content: 'Amanhã...' },
      { time: '11:30', section: 'CTA', content: 'Inscreva-se' }
    ],
    2: [
      { time: '00:00', section: 'HOOK', content: 'Descoberta' },
      { time: '00:30', section: 'RELEVÂNCIA', content: 'Se aplica a você' },
      { time: '02:30', section: 'CONTEÚDO', content: 'Metodologia' },
      { time: '12:30', section: 'DEMO', content: 'Exemplo prático' },
      { time: '17:30', section: 'TEASE', content: 'Amanhã...' },
      { time: '18:30', section: 'CTA', content: 'Na lista?' }
    ],
    3: [
      { time: '00:00', section: 'HOOK', content: 'Apresentação' },
      { time: '00:30', section: 'APRESENTAÇÃO', content: 'O que é' },
      { time: '05:30', section: 'BENEFÍCIOS', content: 'Por que funciona' },
      { time: '15:30', section: 'OFERTA', content: 'O que leva' },
      { time: '25:30', section: 'GARANTIA', content: 'Zero risco' },
      { time: '27:30', section: 'URGÊNCIA', content: 'Fecha em X' },
      { time: '28:30', section: 'CTA', content: 'Clique' }
    ]
  };
  
  return {
    id: videoId,
    name: template.name,
    duration: template.duration,
    hook: template.hook,
    structure: structures[videoId]
  };
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'help';

const params = {
  productName: args[1] || 'Método Transformador',
  launchDate: args[2] || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  price: parseInt(args[3]) || 997,
  avatar: { name: 'amigo', problem: 'perder dinheiro', desire: 'liberdade financeira' },
  benefit: 'um método comprovado',
  closeTime: '48 horas'
};

switch (command) {
  case 'plan':
    logSection('🚀 PLANEJADOR DE LANÇAMENTO');
    const plan = generateLaunchPlan(params);
    console.log(`📦 PRODUTO: ${plan.productName}`);
    console.log(`📅 ABERTURA: ${plan.openingDate.toISOString().split('T')[0]}`);
    console.log(`💰 PREÇO: R$ ${params.price}\n`);
    plan.calendar.forEach(d => {
      const emoji = d.day < 0 ? '📅' : d.day === 0 ? '🔥' : '⚡';
      console.log(`${emoji} Dia ${d.day > 0 ? '+' : ''}${d.day} (${d.date}): ${d.type}`);
      d.activities.forEach(a => console.log(`   → ${a}`));
    });
    break;
    
  case 'email':
    logSection('📧 E-SEQUÊNCIA');
    const emailIds = args[1] ? [parseInt(args[1])] : [1, 2, 3, 4, 5];
    emailIds.forEach(id => {
      const email = generateEmail(id, params);
      console.log(`\n📧 E-MAIL ${id}: ${email.name}`);
      console.log(`   Assunto: ${email.subject}`);
      console.log(`   Open Rate: ${email.metrics.openRate}% | Click: ${email.metrics.clickRate}%`);
    });
    break;
    
  case 'video':
    logSection('🎬 SCRIPTS DE VÍDEO');
    const videoIds = args[1] ? [parseInt(args[1])] : [1, 2, 3];
    videoIds.forEach(id => {
      const script = generateVideoScript(id, params);
      console.log(`\n🎬 ${script.name} (${script.duration})`);
      console.log(`   Hook: "${script.hook}"`);
      script.structure.forEach(s => {
        console.log(`   ${s.time} ${s.section}: ${s.content}`);
      });
    });
    break;
    
  case 'status':
    logSection('📊 STATUS DO LANÇAMENTO');
    console.log(`📦 PRODUTO: ${params.productName}`);
    console.log(`📅 LANÇAMENTO: +14 dias`);
    console.log(`💰 PREÇO: R$ ${params.price}`);
    console.log(`\n📧 E-SEQUÊNCIA: 5 e-mails`);
    console.log(`🎬 VÍDEOS: 3 vídeos (PLF)`);
    break;
    
  case 'help':
  default:
    logSection('🚀 WORKER JEFF');
    console.log(`
用法: node jeff-launch-planner.js [comando]

Comandos:
  plan [produto] [data] [preço]  - Gerar calendário
  email [id]                      - Gerar e-sequência
  video [id]                      - Gerar script de vídeo
  status                          - Ver status

Exemplos:
  node jeff-launch-planner.js plan "Método" 2026-02-20 997
  node jeff-launch-planner.js email 1
  node jeff-launch-planner.js video 1
`);
}

module.exports = { generateLaunchPlan, generateEmail, generateVideoScript, plfStructure, emailTemplates, videoTemplates };
