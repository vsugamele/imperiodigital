const { createEngine } = require('./ab-testing-engine');

const engine = createEngine();

// Criar teste de CTA para Religião
const test = engine.createTest('religion_cta_style', [
    { name: 'CTA Amém', config: { copy: "🙏 Gostou? Comenta \"AMÉM\"!", style: 'amem' } },
    { name: 'CTA Compartilhe', config: { copy: "🕊️ Compartilhe esta palavra com alguém!", style: 'share' } }
], { project: 'refugiodivinos' });

console.log('✅ Experimento A/B de CTA (Religião) criado com sucesso!');
console.log('ID do Teste:', test.id);
