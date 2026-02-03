const fs = require('fs');
const path = require('path');

const empireDataPath = path.join(__dirname, '../config/empire-data.json');
const resultsDir = path.join(__dirname, '../results');

async function monitorEmpire() {
    console.log("🚀 Iniciando Monitor do Império...");

    if (!fs.existsSync(empireDataPath)) {
        console.error("❌ Configuração do Império não encontrada!");
        return;
    }

    const empireData = JSON.parse(fs.readFileSync(empireDataPath, 'utf8'));
    const report = {
        timestamp: new Date().toISOString(),
        verticals: {},
        gaps: []
    };

    console.log(`📊 Analisando ${Object.keys(empireData.verticals).length} verticais...`);

    // Lógica básica para agregar resultados do diretório results/
    for (const [key, vertical] of Object.entries(empireData.verticals)) {
        report.verticals[key] = {
            status: vertical.status,
            last_activity: null,
            performance: "dados_pendentes"
        };

        // Verifica logs em results/ para vertical específica
        const logFile = path.join(resultsDir, `posting-log-v2.csv`);
        if (fs.existsSync(logFile)) {
            report.verticals[key].last_activity = "Detectado nos logs";
        }
    }

    // Placeholder de Insights por IA
    console.log("🤖 Gerando Insights de IA (Gaps)...");
    report.gaps.push("Integração pendente: Motor de YouTube Automático precisa de implementação para escalar formato longo.");
    report.gaps.push("Gap de Dados: Faltam dados de vendas em tempo real do Dropshipping UK em formato centralizado.");

    const reportPath = path.join(resultsDir, `empire-report-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`✅ Relatório gerado: ${reportPath}`);
    return report;
}

monitorEmpire().catch(console.error);
