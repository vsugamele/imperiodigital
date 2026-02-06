/**
 * 📜 FREE QUOTE GENERATOR - Citações 100% Gratuitas
 * Sem API key necessária! Usa fontes abertas.
 */

const https = require('https');

// ==================== CITAS PRÉ-DEFINIDAS ====================

const QUOTE_DATABASE = {
  wisdom: [
    { quote: "A sabedoria é saber que não sabemos nada.", author: "Sócrates", category: "wisdom" },
    { quote: "O conhecimento é poder.", author: "Francis Bacon", category: "wisdom" },
    { quote: "A mente é tudo; você se torna o que você pensa.", author: "Buda", category: "wisdom" },
    { quote: "Simplicidade é o último grau de sofisticação.", author: "Leonardo da Vinci", category: "wisdom" },
    { quote: "Quem muito abarca, pouco aperta.", author: "Provérbio Popular", category: "wisdom" },
    { quote: "A dúvida é o início da sabedoria.", author: "Aristóteles", category: "wisdom" },
    { quote: "Conhece-te a ti mesmo.", author: "Sócrates", category: "wisdom" },
  ],
  success: [
    { quote: "O sucesso é ir de fracasso em fracasso sem perder o entusiasmo.", author: "Winston Churchill", category: "success" },
    { quote: "A única forma de fazer um excelente trabalho é amar o que você faz.", author: "Steve Jobs", category: "success" },
    { quote: "Não tenha medo de desistir. Os melhores frequentemente têm que falhar para ter sucesso.", author: "Anonymous", category: "success" },
    { quote: "O sucesso não é final, o fracasso não é fatal: o que importa é a coragem de continuar.", author: "Winston Churchill", category: "success" },
    { quote: "Você não terá medo se você não olhar para trás.", author: "Steve Jobs", category: "success" },
    { quote: "O sucesso é ir de fracasso em fracasso sem perder o entusiasmo.", author: "Winston Churchill", category: "success" },
  ],
  love: [
    { quote: "O amor não consiste em olhar um para o outro, mas em olhar juntos na mesma direção.", author: "Antoine de Saint-Exupéry", category: "love" },
    { quote: "Ame e será difficile manter as coisas más.", author: "Bob Marley", category: "love" },
    { quote: "O amor é a única força capaz de transformar um inimigo em amigo.", author: "Martin Luther King", category: "love" },
    { quote: "Onde há amor, há vida.", author: "Mahatma Gandhi", category: "love" },
    { quote: "O amor verdadeiro não conhece barreiras.", author: "Anonymous", category: "love" },
  ],
  life: [
    { quote: "A vida é o que acontece enquanto você está ocupado fazendo outros planos.", author: "John Lennon", category: "life" },
    { quote: "Para ter saúde, você precisa caminhar pelo menos 15 minutos por dia.", author: "Matsuo Bashō", category: "life" },
    { quote: "A vida é realmente simples, mas insistimos em torná-la complicada.", author: "Confúcio", category: "life" },
    { quote: "A vida é uma peça de teatro que não permite ensaios.", author: "Bernard Shaw", category: "life" },
    { quote: "Viva como se fosse morrer amanhã. Aprenda como se fosse viver para sempre.", author: "Mahatma Gandhi", category: "life" },
  ],
  inspiration: [
    { quote: "A única coisa impossível é aquela que você não tenta.", author: "Silvio de Abreu", category: "inspiration" },
    { quote: "A persistência é o caminho do sucesso.", author: "Charlie Chaplin", category: "inspiration" },
    { quote: "O importante não é vencer, mas lutar legitimamente.", author: "Pierre de Coubertin", category: "inspiration" },
    { quote: "Nenhum vento sopra a favor de quem não sabe para onde ir.", author: "Sêneca", category: "inspiration" },
    { quote: "A disciplina é a escolha entre o que você quer agora e o que você quer mais.", author: "Anonymous", category: "inspiration" },
  ],
  happiness: [
    { quote: "A felicidade não é algo pronto. Vem de suas próprias ações.", author: "Dalai Lama", category: "happiness" },
    { quote: "A felicidade é um estado de espírito.", author: "Pearl Buck", category: "happiness" },
    { quote: "Felicidade é quando o que você pensa, o que você diz e o que você faz estão em harmonia.", author: "Mahatma Gandhi", category: "happiness" },
    { quote: "A chave para a felicidade é fazer o bem.", author: "Jerry Smith", category: "happiness" },
  ],
  courage: [
    { quote: "Tenha coragem de seguir o que seu coração e sua intuição estão dizendo.", author: "Steve Jobs", category: "courage" },
    { quote: "O coragem não é a ausência do medo, mas o julgamento de que algo é mais importante que o medo.", author: "Ambrose Redgate", category: "courage" },
    { quote: "Você precisa ter coragem para ser feliz.", author: "Unknown", category: "courage" },
  ],
  motivation: [
    { quote: "A motivação é o que faz você começar. O hábito é o que faz você continuar.", author: "Jim Ryun", category: "motivation" },
    { quote: "Acredite em você e em tudo o que você é.", author: "Brian Tracy", category: "motivation" },
    { quote: "O futuro pertence àqueles que acreditam na beleza de seus sonhos.", author: "Eleanor Roosevelt", category: "motivation" },
  ],
  entrepreneur: [
    { quote: "O segredo de começar um negócio é não ter medo de errar.", author: "Unknown", category: "entrepreneur" },
    { quote: "O maior risco é não correr nenhum risco.", author: "Mark Zuckerberg", category: "entrepreneur" },
    { quote: "O sucesso nos negócios exige truques e inteligência.", author: "Napoleon Hill", category: "entrepreneur" },
  ],
  faith: [
    { quote: "A fé move montanhas.", author: "Provérbio Popular", category: "faith" },
    { quote: "A fé é o bird que canta quando a aurora ainda não amanheceu.", author: "Rabindranath Tagore", category: "faith" },
    { quote: "A fé não elimina perguntas. Ela elimina medos.", author: "Unknown", category: "faith" },
  ]
};

// ==================== FUNÇÕES ====================

/**
 * Obter citação gratuita
 */
function getFreeQuote(category = null) {
  const categories = Object.keys(QUOTE_DATABASE);
  
  let targetCategory;
  
  if (category) {
    const catLower = category.toLowerCase();
    targetCategory = categories.find(c => c.includes(catLower) || catLower.includes(c)) || null;
  }
  
  // Se não encontrou categoria específica, pega aleatória
  if (!targetCategory) {
    targetCategory = categories[Math.floor(Math.random() * categories.length)];
  }
  
  const quotes = QUOTE_DATABASE[targetCategory];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  return {
    success: true,
    quote: randomQuote,
    category: targetCategory,
    source: 'free_database'
  };
}

/**
 * Obter citação do dia
 */
function getQuoteOfTheDay() {
  const dayOfYear = getDayOfYear();
  const totalQuotes = Object.values(QUOTE_DATABASE).flat();
  const index = dayOfYear % totalQuotes.length;
  const quote = totalQuotes[index];
  
  return {
    success: true,
    quote,
    category: 'quote_of_the_day',
    source: 'rotating_database',
    dayOfYear
  };
}

/**
 * Obter N citações aleatórias
 */
function getRandomQuotes(count = 5) {
  const quotes = [];
  const categories = Object.keys(QUOTE_DATABASE);
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const result = getFreeQuote(category);
    if (result.success) {
      quotes.push(result.quote);
    }
  }
  
  return {
    success: true,
    quotes,
    count: quotes.length
  };
}

/**
 * Gerar prompt para imagem
 */
function generateImagePrompt(quote, author) {
  return `A beautiful, minimalist quote poster for Instagram. 

TEXT: "${quote}" - ${author}

STYLE: 
- Clean, modern typography
- Elegant gradient background (warm colors)
- White text with subtle shadow
- Professional, inspirational vibe
- Minimalist design
- 1:1 square format

The text should be the focal point, centered. No people, no watermarks.`;
}

/**
 * Gerar caption
 */
function generateCaption(quote, author, category = '') {
  const hashtags = [
    '#citação', '#frases', '#motivação',
    '#inspiração', '#vida', '#sucesso'
  ];
  
  if (category) {
    hashtags.unshift(`#${category}`);
  }
  
  return `💭 "${quote}"

— ${author}

${hashtags.join(' ')}`;
}

/**
 * Utilitário: dia do ano
 */
function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Listar categorias disponíveis
 */
function listCategories() {
  return Object.keys(QUOTE_DATABASE);
}

// ==================== CLI ====================

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
📜 FREE QUOTE GENERATOR (100% Gratuito)
=========================================

SEM API KEY NECESSÁRIA! ✓

USO:
  node free-quote.js                 Citação aleatória
  node free-quote.js --daily         Citação do dia
  node free-quote.js --category [cat] Categoria específica
  node free-quote.js --batch 5       5 citações aleatórias
  node free-quote.js --list          Listar categorias

CATEGORIAS DISPONÍVEIS:
${Object.keys(QUOTE_DATABASE).join(', ')}

EXEMPLOS:
  node free-quote.js
  node free-quote.js --category love
  node free-quote.js --daily
  node free-quote.js --batch 5 --category wisdom

💡 DICA: Use junto com quote-post.js para gerar imagens!
`);
    return;
  }
  
  if (args.includes('--list')) {
    console.log('\n📚 Categorias Disponíveis:');
    Object.keys(QUOTE_DATABASE).forEach((cat, i) => {
      const count = QUOTE_DATABASE[cat].length;
      console.log(`  ${(i + 1).toString().padStart(2)} ${cat.padEnd(15)} (${count} citas)`);
    });
    return;
  }
  
  if (args.includes('--daily')) {
    console.log('\n📅 CITACAO DO DIA:\n');
    const result = getQuoteOfTheDay();
    if (result.success) {
      printQuote(result.quote);
    }
    return;
  }
  
  if (args.includes('--batch')) {
    const count = parseInt(args[args.indexOf('--batch') + 1]) || 5;
    console.log(`\n🎲 ${count} CITACOES ALEATORIAS:\n`);
    
    let category = null;
    if (args.includes('--category')) {
      const idx = args.indexOf('--category');
      category = args[idx + 1];
    }
    
    const result = getRandomQuotes(count);
    if (result.success) {
      result.quotes.forEach((q, i) => {
        console.log(`${i + 1}.`);
        printQuote(q);
        console.log('');
      });
    }
    return;
  }
  
  // Categoria específica
  let category = null;
  if (args.includes('--category')) {
    const idx = args.indexOf('--category');
    category = args[idx + 1];
  }
  
  console.log('\n📜 CITAÇÃO:\n');
  const result = getFreeQuote(category);
  
  if (result.success) {
    printQuote(result.quote);
    
    console.log('\n🎨 PROMPT PARA IMAGEM:');
    console.log('─'.repeat(40));
    console.log(generateImagePrompt(result.quote.quote, result.quote.author));
    
    console.log('\n📝 CAPTION:');
    console.log('─'.repeat(40));
    console.log(generateCaption(result.quote.quote, result.quote.author, result.category));
  }
}

function printQuote(quote) {
  console.log(`"${quote.quote}"`);
  console.log(`   — ${quote.author}`);
  console.log(`   📁 ${quote.category}`);
}

// Export
module.exports = {
  getFreeQuote,
  getQuoteOfTheDay,
  getRandomQuotes,
  generateImagePrompt,
  generateCaption,
  listCategories,
  QUOTE_DATABASE
};

// Run
if (require.main === module) {
  main();
}
