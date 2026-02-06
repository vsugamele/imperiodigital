const { createEngine } = require('./ab-testing-engine');

const engine = createEngine();

// Criar teste de CTA para iGaming
const test = engine.createTest('cta_style', [
    { name: 'CTA Botão (Visual)', config: { copy: "🔥 *Manda aqui 🔥👇🏻*", style: 'button' } },
    { name: 'CTA Texto (Direto)', config: { copy: "👉🏻 LINK NA BIO 👈🏻", style: 'text' } }
], { project: 'igaming' });

console.log('✅ Experimento A/B de CTA criado com sucesso!');
console.log('ID do Teste:', test.id);
console.log('Variantes:', test.variants.map(v => v.name).join(', '));
