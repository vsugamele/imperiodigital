/**
 * 🧠 GURU MINDS API - Gurus de Copywriting como Minds
 * 
 * Adiciona os 8 gurus lendários ao Command Center:
 * - Gary Halbert (Curiosidade & Direct Mail)
 * - Clayton Makepeace (Emoção & Urgência)
 * - Joe Sugarman (Fluxo & VSL)
 * - John Carlton (Confronto & Direto)
 * - Dan Kennedy (Autoridade & Controle)
 * - Gary Bencivenga (Prova Lógica)
 * - Paulo Copy (Fascinations)
 * - Yoshitani (Analytics)
 */

const { createMonitor } = require('./worker-brain-monitor');

// ==================== CONFIGURAÇÃO DOS GURUS ====================

const GURUS_CONFIG = {
  'HALBERT': {
    mind_id: 'halbert-001',
    apex_score: 9.7,
    role: 'Curiosidade & Direct Mail',
    top_skill: 'Gaps de Curiosidade',
    about: 'Gary Halbert é a lenda absoluta do copy. Criou o conceito de "curiosity gap" que faz o leitor IMPARAR de parar de ler. Especializou-se em direct mail, mas seus princípios aplicam-se a qualquer formato. Seu "Halbert Push" é referência mundial em vendas por carta.',
    proficiencies: [
      { name: 'Curiosity Gap', level: 10 },
      { name: 'Direct Mail', level: 10 },
      { name: 'Swipe Files', level: 10 },
      { name: 'ROI Focado', level: 9 },
      { name: 'Storytelling', level: 9 }
    ],
    dna: {
      mbti: { type: 'ENTP', stats: { I: 35, E: 65, S: 25, N: 75, F: 30, T: 70, P: 80, J: 20 } },
      enneagram: { type: '7', wing: '8', label: 'The Enthusiast', subtype: 'Epicurean', fear: 'Ser limitados ou privados de experiências', desire: 'Ter experiências ricas e variadas' },
      disc: { D: 70, I: 85, S: 30, C: 35, label: 'ID - Highly Influential' },
      specific_behaviors: [
        'Cria gaps de curiosidade irresistíveis',
        'Foco obsessivo em ROI e resultados',
        'Usa templates testados e aprovados',
        'Escrita direta e pessoal'
      ]
    },
    signature_technique: 'Halbert Push - A técnica definitiva de urgência',
    famous_quote: 'Você não está vendendo um produto, está vendendo RESULTADOS.'
  },
  
  'MAKEPEACE': {
    mind_id: 'makepeace-001',
    apex_score: 9.6,
    role: 'Emoção & Urgência',
    top_skill: 'Copy Emocional',
    about: 'Clayton Makepeace é o mestre da copy emocional. Dominou a arte de criar urgência autêntica e fazer o leitor agir por EMOCÃO antes de justificar por lógica. Criou alguns dos maiores sucessos de copy da história.',
    proficiencies: [
      { name: 'Copy Emocional', level: 10 },
      { name: 'Urgência Autêntica', level: 10 },
      { name: 'Storytelling', level: 10 },
      { name: 'Medo de Perda', level: 9 },
      { name: 'Vendas por Cartas', level: 9 }
    ],
    dna: {
      mbti: { type: 'ENFJ', stats: { I: 20, E: 80, S: 30, N: 70, F: 85, T: 15, P: 50, J: 50 } },
      enneagram: { type: '2', wing: '3', label: 'The Helper', subtype: 'Generous', fear: 'Não ser amado ou valorado', desire: 'Sentir-se importante e amado' },
      disc: { D: 55, I: 90, S: 50, C: 25, label: 'ID - Highly Influential' },
      specific_behaviors: [
        'Emociona antes de informar',
        'Cria urgência real e autêntica',
        'Foco em medo de perda mais que ganho',
        ' storytelling que vende'
      ]
    },
    signature_technique: 'The Makepeace Emotional Push - Urgência baseada em medo real',
    famous_quote: 'As pessoas compram por EMOCÃO e justificam por LÓGICA.'
  },
  
  'SUGARMAN': {
    mind_id: 'sugarman-001',
    apex_score: 9.4,
    role: 'Fluxo & VSL',
    top_skill: 'Stream of Consciousness',
    about: 'Joe Sugarman é o gênio do VSL (Video Sales Letter) e do "Stream of Consciousness". Revolucionou a venda de produtos pelo correio com seu VHS Effect. Seu livro "Triggers" é bíblia do marketing.',
    proficiencies: [
      { name: 'Stream of Consciousness', level: 10 },
      { name: 'VSL', level: 10 },
      { name: 'Blue Ocean', level: 9 },
      { name: 'One Thing', level: 10 },
      { name: 'Triggers', level: 9 }
    ],
    dna: {
      mbti: { type: 'INTJ', stats: { I: 85, E: 15, S: 20, N: 80, F: 25, T: 75, P: 30, J: 70 } },
      enneagram: { type: '5', wing: '6', label: 'The Investigator', subtype: 'Iconic', fear: 'Ser inútil ou incompetente', desire: 'Ser competente e capaz' },
      disc: { D: 45, I: 40, S: 35, C: 80, label: 'C - Highly Conscientious' },
      specific_behaviors: [
        'Flui naturalmente como pensamento humano',
        'Uma Única Coisa (One Thing)',
        'Encontra Blue Oceans (sem competição)',
        'Venda hipnótica através do VHS Effect'
      ]
    },
    signature_technique: 'Stream of Consciousness - Copy que flui como pensamento',
    famous_quote: 'Cada parágrafo deve fazer o leitor dizer "sim" ou "e aí?" na sua mente.'
  },
  
  'CARLTON': {
    mind_id: 'carlton-001',
    apex_score: 9.5,
    role: 'Confronto & Direto',
    top_skill: 'Bullseye Copy',
    about: 'John Carlton é o mestre do confronto direto. Não tem medo de dizer verdades incômodas. Sua técnica "Tell It Like It Is" e "The Rant" despertam o leitor de forma agressiva e eficaz.',
    proficiencies: [
      { name: 'Confronto Direto', level: 10 },
      { name: 'Bullseye Copy', level: 10 },
      { name: 'The Rant', level: 10 },
      { name: 'Honestidade Brutal', level: 10 },
      { name: 'WIIFM', level: 9 }
    ],
    dna: {
      mbti: { type: 'ESTP', stats: { I: 20, E: 80, S: 60, N: 40, F: 30, T: 70, P: 70, J: 30 } },
      enneagram: { type: '8', wing: '7', label: 'The Challenger', subtype: 'Self-Confidence', fear: 'Ser controlado ou shown as weak', desire: 'Proteger a si mesmo e ser independente' },
      disc: { D: 95, I: 60, S: 20, C: 30, label: 'D - Highly Dominant' },
      specific_behaviors: [
        'Diz a verdade, mesmo que doa',
        'Foco obsessivo no WIIFM (What\'s In It For Me)',
        'Discurso apaixonado que desperta',
        'Não usa eufemismos ou meias palavras'
      ]
    },
    signature_technique: 'Bullseye Copy - Foco direto no target',
    famous_quote: 'Não tente ser nice. Seja HONESTO. Isso é o que vende.'
  },
  
  'KENNEDY': {
    mind_id: 'kennedy-001',
    apex_score: 9.8,
    role: 'Autoridade & Controle',
    top_skill: 'Direct Response',
    about: 'Dan Kennedy, o "Godfather do Direct Response Marketing". Criou os 3 Ms (Money, Market, Message) e revolucionou a forma como vendemos info produtos. É referência absoluta em neurológica e copy.',
    proficiencies: [
      { name: 'Direct Response', level: 10 },
      { name: 'Neurológica', level: 10 },
      { name: '3 Ms (Money, Market, Message)', level: 10 },
      { name: 'Autoridade', level: 10 },
      { name: 'Oferta Irresistível', level: 9 }
    ],
    dna: {
      mbti: { type: 'ENTJ', stats: { I: 30, E: 70, S: 15, N: 85, F: 20, T: 80, P: 30, J: 70 } },
      enneagram: { type: '8', wing: '9', label: 'The Challenger', subtype: 'Protector', fear: 'Ser controlado ou shown as weak', desire: 'Proteger a si mesmo e ser independente' },
      disc: { D: 90, I: 55, S: 25, C: 60, label: 'DC - Highly Dominant' },
      specific_behaviors: [
        'Estabelece autoridade imediata',
        'Controla a conversa completamente',
        'Direct Response - pede a venda explicitamente',
        'Oferece mais, exige mais'
      ]
    },
    signature_technique: '3 Ms - Money, Market, Message',
    famous_quote: 'Copy é venda. Selling é vender. Não existe "não-venda" em marketing.'
  },
  
  'BENCIVENGA': {
    mind_id: 'bencivenga-001',
    apex_score: 9.3,
    role: 'Prova Lógica',
    top_skill: 'Logical Proof',
    about: 'Gary Bencivenga é o mestre da prova lógica. Revolucionou o marketing com seu conceito de "mechanism" - o mecanismo central que faz a solução funcionar. SeusSWAN posts são referência.',
    proficiencies: [
      { name: 'Prova Lógica', level: 10 },
      { name: 'Mecanismos', level: 10 },
      { name: 'SWAN Posts', level: 10 },
      { name: 'Raciocínio Lógico', level: 10 },
      { name: 'Dados e Estudos', level: 9 }
    ],
    dna: {
      mbti: { type: 'INTP', stats: { I: 80, E: 20, S: 25, N: 75, F: 30, T: 70, P: 60, J: 40 } },
      enneagram: { type: '5', wing: '4', label: 'The Investigator', subtype: 'Iconic', fear: 'Ser inútil ou incompetente', desire: 'Ser competente e capaz' },
      disc: { D: 40, I: 35, S: 45, C: 85, label: 'C - Highly Conscientious' },
      specific_behaviors: [
        'Usa dados como prova',
        'Deixa o leitor "descobrir" a verdade',
        'Identifica o mecanismo central',
        'Cria nomes memoráveis para conceitos'
      ]
    },
    signature_technique: 'The Mechanism - Identificar o porquê funciona',
    famous_quote: 'Dados não mentem. Use-os para provar sua tese.'
  },
  
  'FASCINATIONS': {
    mind_id: 'fascinations-001',
    apex_score: 9.0,
    role: 'Fascinations & Microcopy',
    top_skill: '21 Fascinations',
    about: 'Mestre das frases curtas e poderosas que ativam curiosidade. Criou as 21 categorias de fascinations que aumentam drasticamente o tempo de leitura e engajamento.',
    proficiencies: [
      { name: 'Fascinations', level: 10 },
      { name: 'Microcopy', level: 10 },
      { name: 'Curiosidade Imediata', level: 10 },
      { name: 'Hooks Curtos', level: 9 },
      { name: 'Engajamento', level: 9 }
    ],
    dna: {
      mbti: { type: 'ENFP', stats: { I: 30, E: 70, S: 40, N: 60, F: 75, T: 25, P: 85, J: 15 } },
      enneagram: { type: '4', wing: '3', label: 'The Individualist', subtype: 'Creative', fear: 'Não ter identidade', desire: 'Expressar individualidade' },
      disc: { D: 35, I: 80, S: 50, C: 35, label: 'I - Highly Influential' },
      specific_behaviors: [
        'Frases ultra-condensadas',
        'Cria mini-gaps de curiosidade',
        'Aumenta tempo de leitura drasticamente',
        'Makes copy irresistível de ler'
      ]
    },
    signature_technique: '21 Fascinations - 21 categorias de frases viciantes',
    famous_quote: 'Uma frase pode mudar tudo. O poder está na concisão.'
  },
  
  'YOSHITANI': {
    mind_id: 'yoshitani-001',
    apex_score: 8.8,
    role: 'Analytics & Creative Telemetry',
    top_skill: 'Métricas & Decisões',
    about: 'Yoshitani é o especialista em Creative Telemetry™. Focado em métricas, analytics e tomada de decisão baseada em dados. Combina análise profunda com insights criativos.',
    proficiencies: [
      { name: 'Analytics', level: 10 },
      { name: 'Creative Telemetry', level: 10 },
      { name: 'Métricas', level: 10 },
      { name: 'Decisões Data-Driven', level: 9 },
      { name: 'Otimização', level: 9 }
    ],
    dna: {
      mbti: { type: 'ISTJ', stats: { I: 75, E: 25, S: 80, N: 20, F: 35, T: 65, P: 25, J: 75 } },
      enneagram: { type: '1', wing: '2', label: 'The Reformer', subtype: 'Rational', fear: 'Ser imoral ou inadequado', desire: 'Ser bom e Integrity' },
      disc: { D: 50, I: 30, S: 70, C: 90, label: 'SC - Highly Conscientious' },
      specific_behaviors: [
        'Tudo é métrica',
        'Identifica padrões de comportamento',
        'Transforma dados em decisões',
        'Otimiza em tempo real'
      ]
    },
    signature_technique: 'Creative Telemetry™ - Métricas que importam',
    famous_quote: 'Se você não pode medir, você não pode melhorar.'
  }
};

// ==================== FUNÇÕES ====================

/**
 * Obter todos os gurus
 */
function getAllGurus() {
  const gurus = [];
  const guruNames = {
    'HALBERT': 'Gary Halbert',
    'MAKEPEACE': 'Clayton Makepeace',
    'SUGARMAN': 'Joe Sugarman',
    'CARLTON': 'John Carlton',
    'KENNEDY': 'Dan Kennedy',
    'BENCIVENGA': 'Gary Bencivenga',
    'FASCINATIONS': 'Paulo Copy',
    'YOSHITANI': 'Yoshitani'
  };
  
  for (const [guruId, config] of Object.entries(GURUS_CONFIG)) {
    gurus.push({
      id: guruId,
      name: guruNames[guruId] || guruId,
      ...config,
      status: 'available',
      available: true
    });
  }
  
  return gurus;
}

/**
 * Obter guru específico
 */
function getGuru(guruId) {
  const guruIdUpper = guruId.toUpperCase();
  const guru = GURUS_CONFIG[guruIdUpper];
  
  if (!guru) {
    return { error: 'Guru not found' };
  }
  
  const guruNames = {
    'HALBERT': 'Gary Halbert',
    'MAKEPEACE': 'Clayton Makepeace',
    'SUGARMAN': 'Joe Sugarman',
    'CARLTON': 'John Carlton',
    'KENNEDY': 'Dan Kennedy',
    'BENCIVENGA': 'Gary Bencivenga',
    'FASCINATIONS': 'Paulo Copy',
    'YOSHITANI': 'Yoshitani'
  };
  
  return {
    id: guruIdUpper,
    name: guruNames[guruIdUpper] || guruIdUpper,
    ...guru,
    status: 'available',
    available: true
  };
}

/**
 * Obter gurus por especialidade
 */
function getGurusBySpecialty(specialty) {
  const results = [];
  
  for (const [guruId, config] of Object.entries(GURUS_CONFIG)) {
    if (config.role.toLowerCase().includes(specialty.toLowerCase()) ||
        config.top_skill.toLowerCase().includes(specialty.toLowerCase())) {
      results.push({
        id: guruId,
        ...config,
        status: 'available'
      });
    }
  }
  
  return results;
}

/**
 * Obter técnica de guru
 */
function getGuruTechnique(guruId) {
  const guru = getGuru(guruId);
  
  if (guru.error) {
    return guru;
  }
  
  return {
    id: guruId.toUpperCase(),
    name: guru.name,
    technique: guru.signature_technique,
    famous_quote: guru.famous_quote,
    role: guru.role,
    top_skill: guru.top_skill
  };
}

/**
 * Gerar copy usando guru
 */
function generateWithGuru(guruId, type, inputs) {
  const guru = getGuru(guruId);
  
  if (guru.error) {
    return guru;
  }
  
  // Gerar prompt baseado no guru
  const prompts = {
    HALBERT: `Você é GARY HALBERT. Use curiosity gaps para criar tensão. Foque em ROI e resultados.`,
    MAKEPEACE: `Você é CLAYTON MAKEPEACE. Use emoção primeiro, depois lógica. Crie urgência autêntica.`,
    SUGARMAN: `Você é JOE SUGARMAN. Use Stream of Consciousness. Uma Única Coisa.`,
    CARLTON: `Você é JOHN CARLTON. Seja direto e confrontador. Use WIIFM.`,
    KENNEDY: `Você é DAN KENNEDY. Estabeleça autoridade. Use Direct Response.`,
    BENCIVENGA: `Você é GARY BENCIVENGA. Use prova lógica e mecanismos.`,
    FASCINATIONS: `Você é especialista em FASCINATIONS. Frases curtas e poderosas.`,
    YOSHITANI: `Você é YOSHITANI. Foque em métricas e dados. Decisões baseadas em evidências.`
  };
  
  return {
    success: true,
    guru: guru.name,
    role: guru.role,
    prompt: prompts[guruId.toUpperCase()],
    signature_technique: guru.signature_technique,
    famous_quote: guru.famous_quote
  };
}

/**
 * Snapshot dos gurus
 */
function getGurusSnapshot() {
  const gurus = getAllGurus();
  
  let snapshot = `
🎓 **GURUS MINDS SNAPSHOT**
📅 ${new Date().toLocaleString('pt-BR')}

---

**📊 TOTAL DE GURUS: ${gurus.length}**

---
`;
  
  for (const guru of gurus) {
    snapshot += `
👤 **${guru.name}** - ${guru.role}
   🏆 Score: ${guru.apex_score}/10
   🎯 Skill: ${guru.top_skill}
   ✨ Técnica: ${guru.signature_technique.split(' - ')[0]}
`;
    
    snapshot += `   💬 "${guru.famous_quote.substring(0, 50)}..."\n`;
    
    snapshot += `   📁 DNA: ${guru.dna.mbti.type} | ${guru.dna.enneagram.type}w${guru.dna.enneagram.wing}\n`;
  }
  
  snapshot += `
---
*🤖 Generated by Guru Minds API*
`;
  
  return snapshot;
}

// ==================== CLI ====================

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
🎓 GURU MINDS API
=================

Gurus de Copywriting como Minds para o Command Center

USO:
  node guru-minds-api.js --list           Listar todos os gurus
  node guru-minds-api.js --guru [NOME]   Ver guru específico
  node guru-minds-api.js --specialty [X] Buscar por especialidade
  node guru-minds-api.js --technique [NOME] Ver técnica assinatura
  node guru-minds-api.js --generate [GURU] Gerar prompt
  node guru-minds-api.js --snapshot     Snapshot formatado

GURUS DISPONÍVEIS:
  HALBERT      - Curiosidade & Direct Mail
  MAKEPEACE    - Emoção & Urgência
  SUGARMAN    - Fluxo & VSL
  CARLTON     - Confronto & Direto
  KENNEDY     - Autoridade & Controle
  BENCIVENGA  - Prova Lógica
  FASCINATIONS - Fascinations & Microcopy
  YOSHITANI   - Analytics & Métricas

EXEMPLOS:
  node guru-minds-api.js --list
  node guru-minds-api.js --guru kennedy
  node guru-minds-api.js --technique carlton
  node guru-minds-api.js --generate halbert
`);
    return;
  }
  
  if (args.includes('--list')) {
    console.log('\n🎓 GURUS DISPONÍVEIS:\n');
    const gurus = getAllGurus();
    gurus.forEach(guru => {
      console.log(`👤 ${guru.name.padEnd(15)} | ${guru.role}`);
      console.log(`   🏆 ${guru.apex_score}/10 | 🎯 ${guru.top_skill}`);
      console.log(`   ✨ ${guru.signature_technique.split(' - ')[0]}`);
      console.log('');
    });
  } else if (args.includes('--guru')) {
    const guruId = args[args.indexOf('--guru') + 1] || 'kennedy';
    console.log(`\n👤 GURU: ${guruId.toUpperCase()}\n`);
    const guru = getGuru(guruId);
    if (guru.error) {
      console.log('❌ Guru não encontrado');
    } else {
      console.log(JSON.stringify(guru, null, 2));
    }
  } else if (args.includes('--technique')) {
    const guruId = args[args.indexOf('--technique') + 1] || 'kennedy';
    console.log(`\n🎯 TÉCNICA: ${guruId.toUpperCase()}\n`);
    const tech = getGuruTechnique(guruId);
    if (tech.error) {
      console.log('❌ Guru não encontrado');
    } else {
      console.log(`📌 Técnica: ${tech.technique}`);
      console.log(`💬 "${tech.famous_quote}"`);
    }
  } else if (args.includes('--generate')) {
    const guruId = args[args.indexOf('--generate') + 1] || 'kennedy';
    console.log(`\n🎨 PROMPT: ${guruId.toUpperCase()}\n`);
    const result = generateWithGuru(guruId, 'headline', {});
    console.log(result.prompt);
    console.log(`\n📌 ${result.signature_technique}`);
  } else if (args.includes('--snapshot')) {
    console.log(getGurusSnapshot());
  }
}

// Export
module.exports = {
  getAllGurus,
  getGuru,
  getGurusBySpecialty,
  getGuruTechnique,
  generateWithGuru,
  getGurusSnapshot,
  GURUS_CONFIG
};

// Run
if (require.main === module) {
  main();
}
