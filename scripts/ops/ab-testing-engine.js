/**
 * 🧪 A/B TESTING ENGINE
 * 
 * Sistema automático de testes A/B para conteúdo com:
 * - Criação de variantes automáticas
 * - Distribuição controlada
 * - Coleta de métricas
 * - Determinação de vencedor estatístico
 * 
 * Parte do Phase 3 do Squad Enhancement.
 */

const fs = require('fs');
const path = require('path');

// ==================== CONFIGURAÇÃO ====================

const CONFIG = {
    TEST_TYPES: {
        CONTENT_FORMAT: 'content_format',    // Carrossel vs Single vs Video
        POSTING_TIME: 'posting_time',         // Horários diferentes
        CAPTION_STYLE: 'caption_style',       // Copywriting A vs B
        HASHTAG_SET: 'hashtag_set',           // Conjuntos de hashtags
        CTA_POSITION: 'cta_position'          // CTA no início vs fim
    },

    METRICS: {
        PRIMARY: 'engagement_rate',
        SECONDARY: ['likes', 'comments', 'shares', 'saves', 'reach']
    },

    SIGNIFICANCE_THRESHOLD: 0.95,   // 95% de confiança
    MIN_SAMPLE_SIZE: 100,           // Mínimo de impressões por variante
    MAX_TEST_DURATION_DAYS: 7,      // Máximo de dias de teste

    STATE_FILE: './tmp/ab-testing-state.json',
    LOG_FILE: './logs/ab-testing.json'
};

// ==================== MOTOR DE TESTES ====================

class ABTestingEngine {
    constructor() {
        this.state = this.loadState();
    }

    loadState() {
        const stateFile = path.join(__dirname, CONFIG.STATE_FILE);
        if (fs.existsSync(stateFile)) {
            try {
                return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
            } catch (e) {
                return this.getDefaultState();
            }
        }
        return this.getDefaultState();
    }

    getDefaultState() {
        return {
            activeTests: [],
            completedTests: [],
            learnings: [],
            totalTestsRun: 0,
            winRateByType: {}
        };
    }

    saveState() {
        const stateFile = path.join(__dirname, CONFIG.STATE_FILE);
        const dir = path.dirname(stateFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(stateFile, JSON.stringify(this.state, null, 2));
    }

    /**
     * Criar um novo teste A/B
     */
    createTest(testType, variants, context = {}) {
        const testId = `ab_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        const test = {
            id: testId,
            type: testType,
            status: 'running',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + CONFIG.MAX_TEST_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
            variants: variants.map((v, idx) => ({
                id: `${testId}_v${idx}`,
                name: v.name,
                config: v.config || {},
                metrics: {
                    impressions: 0,
                    engagements: 0,
                    engagement_rate: 0,
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    saves: 0
                }
            })),
            context,
            winner: null,
            confidence: 0
        };

        this.state.activeTests.push(test);
        this.state.totalTestsRun++;
        this.saveState();

        console.log(`[AB] Created test ${testId}: ${testType} with ${variants.length} variants`);

        return test;
    }

    /**
     * Obter qual variante usar (distribuição aleatória)
     */
    getVariant(testId) {
        const test = this.state.activeTests.find(t => t.id === testId);
        if (!test) return null;

        // Distribuição uniforme
        const idx = Math.floor(Math.random() * test.variants.length);
        return test.variants[idx];
    }

    /**
     * Registrar métricas para uma variante
     */
    recordMetrics(testId, variantId, metrics) {
        const test = this.state.activeTests.find(t => t.id === testId);
        if (!test) return { error: 'Test not found' };

        const variant = test.variants.find(v => v.id === variantId);
        if (!variant) return { error: 'Variant not found' };

        // Atualizar métricas
        variant.metrics.impressions += metrics.impressions || 0;
        variant.metrics.likes += metrics.likes || 0;
        variant.metrics.comments += metrics.comments || 0;
        variant.metrics.shares += metrics.shares || 0;
        variant.metrics.saves += metrics.saves || 0;

        // Calcular engajamento
        const engagements = variant.metrics.likes + variant.metrics.comments +
            variant.metrics.shares + variant.metrics.saves;
        variant.metrics.engagements = engagements;

        if (variant.metrics.impressions > 0) {
            variant.metrics.engagement_rate = (engagements / variant.metrics.impressions) * 100;
        }

        this.saveState();

        // Verificar se podemos determinar vencedor
        this.checkForWinner(testId);

        return { success: true, variant };
    }

    /**
     * Verificar se há um vencedor estatisticamente significativo
     */
    checkForWinner(testId) {
        const test = this.state.activeTests.find(t => t.id === testId);
        if (!test || test.status !== 'running') return null;

        // Verificar se todos têm amostra mínima
        const allHaveMinSample = test.variants.every(
            v => v.metrics.impressions >= CONFIG.MIN_SAMPLE_SIZE
        );

        if (!allHaveMinSample) {
            return null; // Ainda não há dados suficientes
        }

        // Calcular Z-score para teste de proporções (simplificado)
        const rates = test.variants.map(v => ({
            variant: v,
            rate: v.metrics.engagement_rate,
            n: v.metrics.impressions
        }));

        // Ordenar por taxa de engajamento
        rates.sort((a, b) => b.rate - a.rate);

        const best = rates[0];
        const second = rates[1];

        if (!second) {
            // Só uma variante
            return null;
        }

        // Teste Z simplificado
        const p1 = best.rate / 100;
        const p2 = second.rate / 100;
        const n1 = best.n;
        const n2 = second.n;

        const pooledP = (p1 * n1 + p2 * n2) / (n1 + n2);
        const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));

        const zScore = se > 0 ? (p1 - p2) / se : 0;

        // Converter Z-score para confiança (aproximação)
        const confidence = this.zToConfidence(zScore);

        test.confidence = confidence;

        if (confidence >= CONFIG.SIGNIFICANCE_THRESHOLD) {
            test.status = 'completed';
            test.winner = best.variant.id;
            test.completedAt = new Date().toISOString();

            // Mover para completados
            this.state.activeTests = this.state.activeTests.filter(t => t.id !== testId);
            this.state.completedTests.push(test);

            // Registrar aprendizado
            this.state.learnings.push({
                timestamp: new Date().toISOString(),
                testType: test.type,
                winningVariant: best.variant.name,
                losingVariant: second.variant.name,
                improvement: ((best.rate - second.rate) / second.rate * 100).toFixed(1) + '%',
                sampleSize: n1 + n2
            });

            // Atualizar win rate por tipo
            if (!this.state.winRateByType[test.type]) {
                this.state.winRateByType[test.type] = { wins: 0, tests: 0 };
            }
            this.state.winRateByType[test.type].tests++;

            this.saveState();

            console.log(`[AB] Test ${testId} completed! Winner: ${best.variant.name} with ${confidence.toFixed(1)}% confidence`);

            return {
                winner: best.variant,
                confidence,
                improvement: ((best.rate - second.rate) / second.rate * 100).toFixed(1) + '%'
            };
        }

        return null;
    }

    /**
     * Converter Z-score para nível de confiança
     */
    zToConfidence(z) {
        // Aproximação da função de distribuição normal
        if (z < 0) return 0.5 - this.zToConfidence(-z) + 0.5;

        const a1 = 0.254829592;
        const a2 = -0.284496736;
        const a3 = 1.421413741;
        const a4 = -1.453152027;
        const a5 = 1.061405429;
        const p = 0.3275911;

        const t = 1.0 / (1.0 + p * z);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

        return y;
    }

    /**
     * Verificar testes expirados
     */
    checkExpiredTests() {
        const now = new Date();
        const expired = [];

        for (const test of this.state.activeTests) {
            if (new Date(test.expiresAt) < now) {
                test.status = 'expired';
                test.completedAt = new Date().toISOString();

                // Determinar vencedor mesmo sem significância
                const rates = test.variants.map(v => ({
                    variant: v,
                    rate: v.metrics.engagement_rate
                }));
                rates.sort((a, b) => b.rate - a.rate);
                test.winner = rates[0]?.variant.id || null;

                this.state.completedTests.push(test);
                expired.push(test.id);
            }
        }

        this.state.activeTests = this.state.activeTests.filter(
            t => !expired.includes(t.id)
        );

        this.saveState();
        return expired;
    }

    /**
     * Obter sugestões de testes baseado em learnings
     */
    getSuggestions() {
        const suggestions = [];

        // Sugerir testes para tipos não testados
        for (const type of Object.values(CONFIG.TEST_TYPES)) {
            if (!this.state.winRateByType[type]) {
                suggestions.push({
                    type,
                    reason: `Nunca testado - oportunidade de descobrir o que funciona melhor`,
                    priority: 'high'
                });
            }
        }

        // Sugerir re-testes para tipos com pouca amostra
        for (const [type, stats] of Object.entries(this.state.winRateByType)) {
            if (stats.tests < 3) {
                suggestions.push({
                    type,
                    reason: `Apenas ${stats.tests} teste(s) - precisa de mais dados`,
                    priority: 'medium'
                });
            }
        }

        return suggestions;
    }

    /**
     * Gerar relatório
     */
    generateReport() {
        let report = `
🧪 **A/B TESTING ENGINE REPORT**
📅 ${new Date().toLocaleString('pt-BR')}

---

**📊 ESTATÍSTICAS GERAIS**
- Testes realizados: ${this.state.totalTestsRun}
- Testes ativos: ${this.state.activeTests.length}
- Testes concluídos: ${this.state.completedTests.length}
- Aprendizados registrados: ${this.state.learnings.length}

---

**🔬 TESTES ATIVOS**
`;

        if (this.state.activeTests.length === 0) {
            report += '\n_Nenhum teste ativo no momento._\n';
        } else {
            for (const test of this.state.activeTests) {
                report += `
📍 **${test.type}** (${test.id})
   Variantes: ${test.variants.length}
   Impressões: ${test.variants.reduce((sum, v) => sum + v.metrics.impressions, 0)}
   Expira em: ${new Date(test.expiresAt).toLocaleDateString('pt-BR')}
`;
                for (const v of test.variants) {
                    report += `   • ${v.name}: ${v.metrics.engagement_rate.toFixed(2)}% (n=${v.metrics.impressions})\n`;
                }
            }
        }

        report += `
---

**🏆 ÚLTIMOS APRENDIZADOS**
`;

        const recentLearnings = this.state.learnings.slice(-5);
        if (recentLearnings.length === 0) {
            report += '\n_Nenhum aprendizado registrado ainda._\n';
        } else {
            for (const learning of recentLearnings.reverse()) {
                report += `
✅ **${learning.testType}**
   Vencedor: ${learning.winningVariant}
   Melhoria: ${learning.improvement}
   Amostra: ${learning.sampleSize}
`;
            }
        }

        // Sugestões
        const suggestions = this.getSuggestions();
        if (suggestions.length > 0) {
            report += `
---

**💡 SUGESTÕES DE TESTES**
`;
            for (const s of suggestions.slice(0, 3)) {
                const emoji = s.priority === 'high' ? '🔴' : '🟡';
                report += `${emoji} ${s.type}: ${s.reason}\n`;
            }
        }

        report += `
---
*🤖 Generated by A/B Testing Engine*
`;

        return report;
    }
}

// ==================== EXPORTS ====================

module.exports = {
    ABTestingEngine,
    CONFIG,
    createEngine: () => new ABTestingEngine()
};

// ==================== CLI ====================

if (require.main === module) {
    const engine = new ABTestingEngine();
    const args = process.argv.slice(2);

    if (args[0] === '--create') {
        const test = engine.createTest('content_format', [
            { name: 'Carrossel', config: { format: 'carousel', slides: 5 } },
            { name: 'Imagem Única', config: { format: 'single' } },
            { name: 'Vídeo Curto', config: { format: 'video', duration: 15 } }
        ]);
        console.log('Teste criado:', test.id);
    } else if (args[0] === '--simulate') {
        // Simular métricas para teste
        const testId = args[1] || engine.state.activeTests[0]?.id;
        if (testId) {
            const test = engine.state.activeTests.find(t => t.id === testId);
            if (test) {
                for (const variant of test.variants) {
                    const impressions = 100 + Math.floor(Math.random() * 200);
                    const engagementRate = 2 + Math.random() * 6; // 2-8%
                    engine.recordMetrics(testId, variant.id, {
                        impressions,
                        likes: Math.floor(impressions * engagementRate / 100 * 0.7),
                        comments: Math.floor(impressions * engagementRate / 100 * 0.2),
                        shares: Math.floor(impressions * engagementRate / 100 * 0.05),
                        saves: Math.floor(impressions * engagementRate / 100 * 0.05)
                    });
                }
                console.log('Métricas simuladas para:', testId);
            }
        }
    } else if (args[0] === '--report') {
        console.log(engine.generateReport());
    } else {
        console.log(`
🧪 A/B TESTING ENGINE CLI
=========================

USO:
  node ab-testing-engine.js --create       Criar teste de exemplo
  node ab-testing-engine.js --simulate [id] Simular métricas
  node ab-testing-engine.js --report       Gerar relatório

INTEGRAÇÃO:
  const { createEngine } = require('./ab-testing-engine');
  
  const engine = createEngine();
  
  // Criar teste
  const test = engine.createTest('caption_style', [
    { name: 'Emocional', config: { style: 'emotional' } },
    { name: 'Direto', config: { style: 'direct' } }
  ]);
  
  // Obter variante para usar
  const variant = engine.getVariant(test.id);
  
  // Registrar métricas
  engine.recordMetrics(test.id, variant.id, { impressions: 100, likes: 8 });
`);
    }
}
