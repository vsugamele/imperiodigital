/**
 * 🌅 REFLECTION GENERATOR
 * Gera reflexão diária automática baseada em métricas e eventos
 */

const fs = require('fs');
const path = require('path');
const { collectMetrics } = require('./metrics-collector');

const MEMORY_DIR = path.join(__dirname, '..', 'memory');
const TODAY = new Date().toISOString().split('T')[0];
const REFLECTION_FILE = path.join(MEMORY_DIR, `reflection-${TODAY}.md`);

const MOODS = ['🚀 Produtivo', '⚡ Foco', '🎯 Estratégico', '💡 Criativo', '📈 Crescendo'];

function generateReflection(metrics) {
  const date = new Date();
  const greeting = getGreeting(date.getHours());
  
  // Análise baseada em métricas
  const insights = [];
  
  if (metrics.posts.today > 0) {
    insights.push(`✅ ${metrics.posts.today} posts publicados/hoje`);
  }
  
  if (metrics.posts.failed > 0) {
    insights.push(`⚠️ ${metrics.posts.failed} posts com falha`);
  }
  
  if (metrics.tasks.blocked > 3) {
    insights.push(`🚫 ${metrics.tasks.blocked} tarefas bloqueadas - precisa de decisão`);
  }
  
  if (metrics.tasks.doing === 0) {
    insights.push(`🎯 Nenhuma tarefa em progresso - escolha uma do backlog`);
  }
  
  // Sugestões
  const suggestions = [];
  
  if (metrics.tasks.blocked > 3) {
    suggestions.push('Revisar tarefas bloqueadas e solicitar input do Vinicius');
  }
  
  if (metrics.posts.today === 0) {
    suggestions.push('Gerar conteúdo para os perfis');
  }
  
  // Template de reflexão
  const reflection = `---

## 🌅 Reflexão Diária - ${TODAY}

### ${greeting}

**Status:** ${MOODS[Math.floor(Math.random() * MOODS.length)]}

---

### 📊 Métricas do Dia

| Métrica | Valor |
|---------|-------|
| Posts Hoje | ${metrics.posts.today} |
| Posts Agendados | ${metrics.posts.scheduled} |
| Falhas | ${metrics.posts.failed} |
| Tarefas Backlog | ${metrics.tasks.backlog} |
| Tarefas Doing | ${metrics.tasks.doing} |
| Tarefas Blocked | ${metrics.tasks.blocked} |
| Tarefas Done | ${metrics.tasks.done} |

---

### 💡 Insights

${insights.length > 0 ? insights.map(i => `- ${i}`).join('\n') : '- Nenhuma métrica crítica'}

---

### 🎯 Próximos Passos

${suggestions.length > 0 ? suggestions.map(s => `- [ ] ${s}`).join('\n') : '- [ ] Manter ritmo atual'}

---

### 📝 Notas

_(Gerado automaticamente pelo Autopilot)_

---
`;

  return reflection;
}

function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return '🌅 Bom Dia';
  if (hour >= 12 && hour < 18) return '☀️ Boa Tarde';
  if (hour >= 18 && hour < 22) return '🌆 Boa Noite';
  return '🌙 Boa Madrugada';
}

async function runReflection() {
  console.log('🌅 Running reflection generator...');
  
  const metrics = await collectMetrics();
  const reflection = generateReflection(metrics);
  
  fs.writeFileSync(REFLECTION_FILE, reflection);
  console.log('✅ Reflection saved:', REFLECTION_FILE);
  
  return reflection;
}

// CLI
if (require.main === module) {
  runReflection().catch(console.error);
}

module.exports = { runReflection, generateReflection };
