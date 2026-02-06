const { createConnector } = require('./funnel-phase-connector');

const connector = createConnector();

// Registrar projetos ativos
console.log('🚀 Registrando fases do funil para o squad...');

// iGaming - Fase de Lançamento (Foco em Russell Brunson / Eugene Schwartz)
connector.registerProject('igaming', 'Projeto iGaming', 'launch');

// Religiao - Fase de Escala (Foco em Russell Brunson / Alex Hormozi)
connector.registerProject('refugiodivinos', 'Refúgio Divinos', 'scaling');

// PetSelectUK - Fase de Validação (Foco em Jeff Walker)
connector.registerProject('petselectuk', 'PetSelect UK', 'validation');

console.log('✅ Projetos registrados com sucesso!');
console.log(connector.generateReport());
