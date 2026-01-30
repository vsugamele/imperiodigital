#!/usr/bin/env node
/**
 * Utmify Daily Monitor
 * Coleta dados de performance, UTMs e gera relatório
 * Roda diariamente às 8 AM (horário de São Paulo)
 */

const fs = require('fs');
const path = require('path');

async function monitorUtmify() {
  const WORKSPACE = 'C:\\Users\\vsuga\\clawd';
  const REPORT_DIR = path.join(WORKSPACE, 'memory');
  const date = new Date().toISOString().split('T')[0];
  
  console.log(`\n📊 Starting Utmify Daily Monitor - ${date}`);
  console.log('========================================\n');
  
  // Template de relatório
  const report = `# 📊 Utmify Daily Report - ${date}

## 🎯 Resumo Executivo

Relatório diário de performance de campanhas e UTMs.

### Métricas Principais
- Faturamento Líquido: R$ [EXTRACT]
- Gastos com Anúncios: R$ [EXTRACT]
- ROAS: [EXTRACT]
- Lucro: R$ [EXTRACT]
- Margem: [EXTRACT]%

### 🔗 Top UTMs por Performance

[Será extraído via browser]

### 📈 Funil de Conversão (Meta Ads)

[Será extraído via browser]

### ⚠️ Alertas

[Será gerado automaticamente]

---

## 📋 Ações Recomendadas

1. Verificar UTMs com prejuízo
2. Otimizar funil de conversão
3. Revisar custos por produto

---

**Gerado em:** ${new Date().toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'})}
`;
  
  // Salva relatório
  const reportPath = path.join(REPORT_DIR, `${date}-utmify-report.md`);
  fs.writeFileSync(reportPath, report);
  
  console.log(`✅ Report template created: ${reportPath}`);
  console.log('\n📤 Next: Extract data via browser relay and send Telegram');
  console.log('🚀 Ready for automation!\n');
  
  return {
    status: 'ready',
    reportPath,
    date,
    timestamp: new Date().toISOString()
  };
}

if (require.main === module) {
  monitorUtmify().then(result => {
    console.log('✨ Monitor setup complete');
    console.log(JSON.stringify(result, null, 2));
  });
}

module.exports = { monitorUtmify };
