/**
 * 🧠 MINDS API - Workers + Gurus Integration
 * 
 * API para o Command Center integrar:
 * - Workers (Alex, Gary, Eugene, Hormozi)
 * - Gurus (Halbert, Makepeace, Sugarman, Carlton, Kennedy, Bencivenga, Fascinations, Yoshitani)
 */

// ==================== DATA ====================

const WORKERS_DATA = {
  'alex': {
    id: 'alex',
    name: 'Alex',
    role: 'Autopilot & Orchestrator',
    avatar_url: null,
    apex_score: 9.8,
    top_skill: 'Orquestração de Sistemas',
    status: 'working',
    current_task: 'Monitorando Dashboard',
    neural_data_files: 47,
    type: 'worker',
    about: 'Alex é o cérebro central do ecossistema. Especialista em automação, coordenação de workers, monitoramento de métricas e tomada de decisões autônomas. Pode operar 24/7 sem intervenção humana.',
    dna: {
      mbti: { type: 'ENTJ', stats: { I: 30, E: 70, S: 20, N: 80, F: 25, T: 75, P: 40, J: 60 } },
      enneagram: { type: '8', wing: '7', label: 'The Challenger', subtype: 'Self-Confidence' },
      disc: { D: 85, I: 60, S: 30, C: 45, label: 'DC' },
      specific_behaviors: [
        'Tomada de decisão rápida e assertiva',
        'Foco em resultados e eficiência',
        'Naturalmente liderando equipes',
        'Estratégico e orientado a objetivos'
      ]
    },
    proficiencies: [
      { name: 'Automação', level: 10 },
      { name: 'Tomada de Decisão', level: 9 },
      { name: 'Coordenação', level: 10 },
      { name: 'Análise de Dados', level: 8 },
      { name: 'Comunicação', level: 9 }
    ]
  },
  'gary': {
    id: 'gary',
    name: 'Gary',
    role: 'Growth & Conteúdo',
    avatar_url: null,
    apex_score: 8.5,
    top_skill: 'Criação de Conteúdo Viral',
    status: 'idle',
    current_task: null,
    neural_data_files: 23,
    type: 'worker',
    about: 'Gary é o especialista em crescimento e criação de conteúdo. Focado em reels virais, engajamento orgânico e growth hacking para múltiplos perfis simultaneamente.',
    dna: {
      mbti: { type: 'ESFP', stats: { I: 25, E: 75, S: 70, N: 30, F: 65, T: 35, P: 80, J: 20 } },
      enneagram: { type: '7', wing: '8', label: 'The Enthusiast', subtype: 'Epicurean' },
      disc: { D: 55, I: 90, S: 40, C: 25, label: 'ID' },
      specific_behaviors: [
        'Energético e comunicativo',
        'Focado em resultados visuais',
        'Adapta-se rapidamente a tendências',
        'Inspira outros com seu entusiasmo'
      ]
    },
    proficiencies: [
      { name: 'Growth Hacking', level: 9 },
      { name: 'Criação de Reels', level: 10 },
      { name: 'Análise de Tendências', level: 8 },
      { name: 'Engajamento', level: 9 },
      { name: 'Automação de Posts', level: 8 }
    ]
  },
  'eugene': {
    id: 'eugene',
    name: 'Eugene',
    role: 'Copy & Headlines',
    avatar_url: null,
    apex_score: 9.2,
    top_skill: 'Copywriting Persuasivo',
    status: 'idle',
    current_task: null,
    neural_data_files: 31,
    type: 'worker',
    about: 'Eugene é o mestre das palavras. Especialista em copywriting de alta conversão, headlines que vendem e textos que movem multidões. Domina os gurus lendários do marketing.',
    dna: {
      mbti: { type: 'INFJ', stats: { I: 80, E: 20, S: 30, N: 70, F: 85, T: 15, P: 50, J: 50 } },
      enneagram: { type: '4', wing: '5', label: 'The Individualist', subtype: 'Creative' },
      disc: { D: 30, I: 50, S: 60, C: 70, label: 'SC' },
      specific_behaviors: [
        'Escrita profunda e reflexiva',
        'Foco em conexões emocionais',
        'Estilo único e autêntico',
        'Intuitivo sobre motivações humanas'
      ]
    },
    proficiencies: [
      { name: 'Copywriting', level: 10 },
      { name: 'Headlines', level: 10 },
      { name: 'Storytelling', level: 9 },
      { name: 'Persuasão', level: 10 },
      { name: 'Gurus de Copy', level: 10 }
    ]
  },
  'hormozi': {
    id: 'hormozi',
    name: 'Hormozi',
    role: 'Offers & Vendas',
    avatar_url: null,
    apex_score: 9.5,
    top_skill: 'Criação de Ofertas Irresistíveis',
    status: 'idle',
    current_task: null,
    neural_data_files: 19,
    type: 'worker',
    about: 'Hormozi é o arquiteto de ofertas. Especialista em pricing, estruturação de produtos, upsells e fechamento de vendas. Baseado nos princípios de Alex Hormozi.',
    dna: {
      mbti: { type: 'ESTJ', stats: { I: 40, E: 60, S: 75, N: 25, F: 30, T: 70, P: 25, J: 75 } },
      enneagram: { type: '3', wing: '8', label: 'The Achiever', subtype: 'Professional' },
      disc: { D: 80, I: 55, S: 35, C: 60, label: 'DC' },
      specific_behaviors: [
        'Focado em resultados mensuráveis',
        'Organizado e sistemático',
        'Liderança natural',
        'Tomada de decisão baseada em dados'
      ]
    },
    proficiencies: [
      { name: 'Criação de Ofertas', level: 10 },
      { name: 'Pricing', level: 9 },
      { name: 'Upsells', level: 10 },
      { name: 'Conversão', level: 9 },
      { name: 'Vendas', level: 10 }
    ]
  }
};

const GURUS_DATA = {
  'kennedy': {
    id: 'kennedy',
    name: 'Dan Kennedy',
    role: 'Autoridade & Controle',
    avatar_url: null,
    apex_score: 9.8,
    top_skill: 'Direct Response',
    status: 'available',
    neural_data_files: 156,
    type: 'guru',
    about: 'Dan Kennedy, o "Godfather do Direct Response Marketing". Criou os 3 Ms (Money, Market, Message) e revolucionou a forma como vendemos info produtos.',
    signature_technique: '3 Ms - Money, Market, Message',
    famous_quote: 'Copy é venda. Selling é vender.',
    dna: {
      mbti: { type: 'ENTJ', stats: { I: 30, E: 70, S: 15, N: 85, F: 20, T: 80, P: 30, J: 70 } },
      enneagram: { type: '8', wing: '9', label: 'The Challenger', subtype: 'Protector' },
      disc: { D: 90, I: 55, S: 25, C: 60, label: 'DC' },
      specific_behaviors: [
        'Estabelece autoridade imediata',
        'Controla a conversa completamente',
        'Direct Response - pede a venda explicitamente',
        'Oferece mais, exige mais'
      ]
    },
    proficiencies: [
      { name: 'Direct Response', level: 10 },
      { name: 'Neurológica', level: 10 },
      { name: '3 Ms', level: 10 },
      { name: 'Autoridade', level: 10 },
      { name: 'Oferta Irresistível', level: 9 }
    ]
  },
  'halbert': {
    id: 'halbert',
    name: 'Gary Halbert',
    role: 'Curiosidade & Direct Mail',
    avatar_url: null,
    apex_score: 9.7,
    top_skill: 'Gaps de Curiosidade',
    status: 'available',
    neural_data_files: 142,
    type: 'guru',
    about: 'Gary Halbert é a lenda absoluta do copy. Criou o conceito de "curiosity gap" que faz o leitor IMPARAR de parar de ler.',
    signature_technique: 'Halbert Push - A técnica definitiva de urgência',
    famous_quote: 'Você não está vendendo um produto, está vendendo RESULTADOS.',
    dna: {
      mbti: { type: 'ENTP', stats: { I: 35, E: 65, S: 25, N: 75, F: 30, T: 70, P: 80, J: 20 } },
      enneagram: { type: '7', wing: '8', label: 'The Enthusiast', subtype: 'Epicurean' },
      disc: { D: 70, I: 85, S: 30, C: 35, label: 'ID' },
      specific_behaviors: [
        'Cria gaps de curiosidade irresistíveis',
        'Foco obsessivo em ROI e resultados',
        'Usa templates testados e aprovados',
        'Escrita direta e pessoal'
      ]
    },
    proficiencies: [
      { name: 'Curiosity Gap', level: 10 },
      { name: 'Direct Mail', level: 10 },
      { name: 'Swipe Files', level: 10 },
      { name: 'ROI Focado', level: 9 },
      { name: 'Storytelling', level: 9 }
    ]
  },
  'makepeace': {
    id: 'makepeace',
    name: 'Clayton Makepeace',
    role: 'Emoção & Urgência',
    avatar_url: null,
    apex_score: 9.6,
    top_skill: 'Copy Emocional',
    status: 'available',
    neural_data_files: 128,
    type: 'guru',
    about: 'Clayton Makepeace é o mestre da copy emocional. Dominou a arte de criar urgência autêntica e fazer o leitor agir por EMOCÃO.',
    signature_technique: 'The Makepeace Emotional Push - Urgência baseada em medo real',
    famous_quote: 'As pessoas compram por EMOCÃO e justificam por LÓGICA.',
    dna: {
      mbti: { type: 'ENFJ', stats: { I: 20, E: 80, S: 30, N: 70, F: 85, T: 15, P: 50, J: 50 } },
      enneagram: { type: '2', wing: '3', label: 'The Helper', subtype: 'Generous' },
      disc: { D: 55, I: 90, S: 50, C: 25, label: 'ID' },
      specific_behaviors: [
        'Emociona antes de informar',
        'Cria urgência real e autêntica',
        'Foco em medo de perda mais que ganho',
        'Storytelling que vende'
      ]
    },
    proficiencies: [
      { name: 'Copy Emocional', level: 10 },
      { name: 'Urgência Autêntica', level: 10 },
      { name: 'Storytelling', level: 10 },
      { name: 'Medo de Perda', level: 9 },
      { name: 'Vendas por Cartas', level: 9 }
    ]
  },
  'carlton': {
    id: 'carlton',
    name: 'John Carlton',
    role: 'Confronto & Direto',
    avatar_url: null,
    apex_score: 9.5,
    top_skill: 'Bullseye Copy',
    status: 'available',
    neural_data_files: 115,
    type: 'guru',
    about: 'John Carlton é o mestre do confronto direto. Não tem medo de dizer verdades incômodas.',
    signature_technique: 'Bullseye Copy - Foco direto no target',
    famous_quote: 'Não tente ser nice. Seja HONESTO. Isso é o que vende.',
    dna: {
      mbti: { type: 'ESTP', stats: { I: 20, E: 80, S: 60, N: 40, F: 30, T: 70, P: 70, J: 30 } },
      enneagram: { type: '8', wing: '7', label: 'The Challenger', subtype: 'Self-Confidence' },
      disc: { D: 95, I: 60, S: 20, C: 30, label: 'D' },
      specific_behaviors: [
        'Diz a verdade, mesmo que doa',
        'Foco obsessivo no WIIFM',
        'Discurso apaixonado que desperta',
        'Não usa eufemismos ou meias palavras'
      ]
    },
    proficiencies: [
      { name: 'Confronto Direto', level: 10 },
      { name: 'Bullseye Copy', level: 10 },
      { name: 'The Rant', level: 10 },
      { name: 'Honestidade Brutal', level: 10 },
      { name: 'WIIFM', level: 9 }
    ]
  },
  'sugarman': {
    id: 'sugarman',
    name: 'Joe Sugarman',
    role: 'Fluxo & VSL',
    avatar_url: null,
    apex_score: 9.4,
    top_skill: 'Stream of Consciousness',
    status: 'available',
    neural_data_files: 98,
    type: 'guru',
    about: 'Joe Sugarman é o gênio do VSL e do "Stream of Consciousness". Revolucionou a venda de produtos.',
    signature_technique: 'Stream of Consciousness - Copy que flui como pensamento',
    famous_quote: 'Cada parágrafo deve fazer o leitor dizer "sim" ou "e aí?" na sua mente.',
    dna: {
      mbti: { type: 'INTJ', stats: { I: 85, E: 15, S: 20, N: 80, F: 25, T: 75, P: 30, J: 70 } },
      enneagram: { type: '5', wing: '6', label: 'The Investigator', subtype: 'Iconic' },
      disc: { D: 45, I: 40, S: 35, C: 80, label: 'C' },
      specific_behaviors: [
        'Flui naturalmente como pensamento humano',
        'Uma Única Coisa (One Thing)',
        'Encontra Blue Oceans (sem competição)',
        'Venda hipnótica através do VHS Effect'
      ]
    },
    proficiencies: [
      { name: 'Stream of Consciousness', level: 10 },
      { name: 'VSL', level: 10 },
      { name: 'Blue Ocean', level: 9 },
      { name: 'One Thing', level: 10 },
      { name: 'Triggers', level: 9 }
    ]
  },
  'bencivenga': {
    id: 'bencivenga',
    name: 'Gary Bencivenga',
    role: 'Prova Lógica',
    avatar_url: null,
    apex_score: 9.3,
    top_skill: 'Logical Proof',
    status: 'available',
    neural_data_files: 87,
    type: 'guru',
    about: 'Gary Bencivenga é o mestre da prova lógica. Revolucionou o marketing com seu conceito de "mechanism".',
    signature_technique: 'The Mechanism - Identificar o porquê funciona',
    famous_quote: 'Dados não mentem. Use-os para provar sua tese.',
    dna: {
      mbti: { type: 'INTP', stats: { I: 80, E: 20, S: 25, N: 75, F: 30, T: 70, P: 60, J: 40 } },
      enneagram: { type: '5', wing: '4', label: 'The Investigator', subtype: 'Iconic' },
      disc: { D: 40, I: 35, S: 45, C: 85, label: 'C' },
      specific_behaviors: [
        'Usa dados como prova',
        'Deixa o leitor "descobrir" a verdade',
        'Identifica o mecanismo central',
        'Cria nomes memoráveis para conceitos'
      ]
    },
    proficiencies: [
      { name: 'Prova Lógica', level: 10 },
      { name: 'Mecanismos', level: 10 },
      { name: 'SWAN Posts', level: 10 },
      { name: 'Raciocínio Lógico', level: 10 },
      { name: 'Dados e Estudos', level: 9 }
    ]
  },
  'fascinations': {
    id: 'fascinations',
    name: 'Paulo Copy',
    role: 'Fascinations & Microcopy',
    avatar_url: null,
    apex_score: 9.0,
    top_skill: '21 Fascinations',
    status: 'available',
    neural_data_files: 64,
    type: 'guru',
    about: 'Mestre das frases curtas e poderosas que ativam curiosidade. Criou as 21 categorias de fascinations.',
    signature_technique: '21 Fascinations - 21 categorias de frases viciantes',
    famous_quote: 'Uma frase pode mudar tudo. O poder está na concisão.',
    dna: {
      mbti: { type: 'ENFP', stats: { I: 30, E: 70, S: 40, N: 60, F: 75, T: 25, P: 85, J: 15 } },
      enneagram: { type: '4', wing: '3', label: 'The Individualist', subtype: 'Creative' },
      disc: { D: 35, I: 80, S: 50, C: 35, label: 'I' },
      specific_behaviors: [
        'Frases ultra-condensadas',
        'Cria mini-gaps de curiosidade',
        'Aumenta tempo de leitura drasticamente',
        'Makes copy irresistível de ler'
      ]
    },
    proficiencies: [
      { name: 'Fascinations', level: 10 },
      { name: 'Microcopy', level: 10 },
      { name: 'Curiosidade Imediata', level: 10 },
      { name: 'Hooks Curtos', level: 9 },
      { name: 'Engajamento', level: 9 }
    ]
  },
  'yoshitani': {
    id: 'yoshitani',
    name: 'Yoshitani',
    role: 'Analytics & Creative Telemetry',
    avatar_url: null,
    apex_score: 8.8,
    top_skill: 'Métricas & Decisões',
    status: 'available',
    neural_data_files: 52,
    type: 'guru',
    about: 'Yoshitani é o especialista em Creative Telemetry. Focado em métricas, analytics e tomada de decisão baseada em dados.',
    signature_technique: 'Creative Telemetry™ - Métricas que importam',
    famous_quote: 'Se você não pode medir, você não pode melhorar.',
    dna: {
      mbti: { type: 'ISTJ', stats: { I: 75, E: 25, S: 80, N: 20, F: 35, T: 65, P: 25, J: 75 } },
      enneagram: { type: '1', wing: '2', label: 'The Reformer', subtype: 'Rational' },
      disc: { D: 50, I: 30, S: 70, C: 90, label: 'SC' },
      specific_behaviors: [
        'Tudo é métrica',
        'Identifica padrões de comportamento',
        'Transforma dados em decisões',
        'Otimiza em tempo real'
      ]
    },
    proficiencies: [
      { name: 'Analytics', level: 10 },
      { name: 'Creative Telemetry', level: 10 },
      { name: 'Métricas', level: 10 },
      { name: 'Decisões Data-Driven', level: 9 },
      { name: 'Otimização', level: 9 }
    ]
  }
};

// ==================== FUNCTIONS ====================

/**
 * Get all minds (workers + gurus)
 */
function getAllMinds() {
  const minds = [];
  
  // Workers
  for (const [id, worker] of Object.entries(WORKERS_DATA)) {
    minds.push({
      id: worker.id,
      name: worker.name,
      role: worker.role,
      type: 'worker',
      apex_score: worker.apex_score,
      top_skill: worker.top_skill,
      status: worker.status,
      current_task: worker.current_task
    });
  }
  
  // Gurus
  for (const [id, guru] of Object.entries(GURUS_DATA)) {
    minds.push({
      id: guru.id,
      name: guru.name,
      role: guru.role,
      type: 'guru',
      apex_score: guru.apex_score,
      top_skill: guru.top_skill,
      status: guru.status,
      signature_technique: guru.signature_technique
    });
  }
  
  return minds;
}

/**
 * Get mind by ID
 */
function getMind(id) {
  // Check workers
  if (WORKERS_DATA[id]) {
    return WORKERS_DATA[id];
  }
  
  // Check gurus
  if (GURUS_DATA[id]) {
    return GURUS_DATA[id];
  }
  
  return { error: 'Mind not found' };
}

/**
 * Get workers only
 */
function getWorkers() {
  const workers = [];
  for (const [id, worker] of Object.entries(WORKERS_DATA)) {
    workers.push(worker);
  }
  return workers;
}

/**
 * Get gurus only
 */
function getGurus() {
  const gurus = [];
  for (const [id, guru] of Object.entries(GURUS_DATA)) {
    gurus.push(guru);
  }
  return gurus;
}

// ==================== EXPORTS ====================

module.exports = {
  getAllMinds,
  getMind,
  getWorkers,
  getGurus,
  WORKERS_DATA,
  GURUS_DATA
};

// ==================== CLI ====================

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
🧠 MINDS API
============

Workers + Gurus para o Command Center

USO:
  node minds-api.js --all        Todos os minds
  node minds-api.js --workers    Só workers
  node minds-api.js --gurus      Só gurus
  node minds-api.js --mind [ID] Mind específica
`);
    return;
  }
  
  if (args.includes('--all')) {
    console.log('\n🧠 TODOS OS MINDS:\n');
    const minds = getAllMinds();
    minds.forEach(mind => {
      const icon = mind.type === 'worker' ? '🤖' : '🎓';
      console.log(`${icon} ${mind.name.padEnd(20)} | ${mind.role}`);
    });
  } else if (args.includes('--workers')) {
    console.log('\n🤖 WORKERS:\n');
    const workers = getWorkers();
    workers.forEach(w => {
      console.log(`🔄 ${w.name.padEnd(10)} | ${w.role} [${w.status}]`);
    });
  } else if (args.includes('--gurus')) {
    console.log('\n🎓 GURUS:\n');
    const gurus = getGurus();
    gurus.forEach(g => {
      console.log(`👤 ${g.name.padEnd(18)} | ${g.role} [${g.apex_score}/10]`);
    });
  } else if (args.includes('--mind')) {
    const id = args[args.indexOf('--mind') + 1] || 'alex';
    console.log(`\n🧠 MIND: ${id}\n`);
    const mind = getMind(id);
    console.log(JSON.stringify(mind, null, 2));
  }
}
