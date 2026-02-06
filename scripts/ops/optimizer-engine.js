/**
 * 📈 OPTIMIZER ENGINE
 * 
 * Feedback loop automático que conecta métricas com ações de melhoria.
 * Lê dados do GARY, analisa padrões, e sugere/executa ajustes automáticos.
 * 
 * Parte do Phase 2 do Squad Enhancement.
 */

const fs = require('fs');
const path = require('path');

// ==================== CONFIGURAÇÃO ====================

const CONFIG = {
    THRESHOLDS: {
        ENGAGEMENT_LOW: 2.0,       // % abaixo disso = problema
        ENGAGEMENT_TARGET: 4.0,    // % meta
        POSTS_PER_DAY_MIN: 2,      // mínimo de posts
        POSTS_PER_DAY_TARGET: 4,   // meta
        GROWTH_RATE_MIN: 0.5,      // % crescimento mínimo
        SUCCESS_RATE_MIN: 0.7      // 70% taxa de sucesso
    },

    ACTIONS: {
        INCREASE_POSTS: 'increase_posts',
        CHANGE_TIMING: 'change_timing',
        BOOST_ENGAGEMENT: 'boost_engagement',
        A_B_TEST: 'ab_test',
        ALERT_HUMAN: 'alert_human'
    },

    LOG_FILE: './logs/optimizer-engine.json',
    STATE_FILE: './tmp/optimizer-state.json'
};

// ==================== OTIMIZADOR ====================

class OptimizerEngine {
    constructor() {
        this.state = this.loadState();
        this.suggestions = [];
        this.autoActions = [];
    }

    /**
     * Carregar estado anterior
     */
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
            lastRun: null,
            testsRunning: [],
            learnings: [],
            adjustments: [],
            metrics_history: []
        };
    }

    /**
     * Salvar estado
     */
    saveState() {
        const stateFile = path.join(__dirname, CONFIG.STATE_FILE);
        const dir = path.dirname(stateFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(stateFile, JSON.stringify(this.state, null, 2));
    }

    /**
     * Analisar métricas e gerar sugestões
     */
    analyze(metrics) {
        this.suggestions = [];

        // Engagement baixo?
        if (metrics.avgEngagement < CONFIG.THRESHOLDS.ENGAGEMENT_LOW) {
            this.suggestions.push({
                priority: 'high',
                action: CONFIG.ACTIONS.BOOST_ENGAGEMENT,
                reason: `Engagement em ${metrics.avgEngagement.toFixed(2)}% (abaixo de ${CONFIG.THRESHOLDS.ENGAGEMENT_LOW}%)`,
                recommendation: 'Adicionar mais CTAs, usar stories interativos, responder comentários',
                autoExecutable: false
            });
        }

        // Posts insuficientes?
        if (metrics.postsToday < CONFIG.THRESHOLDS.POSTS_PER_DAY_MIN) {
            this.suggestions.push({
                priority: 'medium',
                action: CONFIG.ACTIONS.INCREASE_POSTS,
                reason: `Apenas ${metrics.postsToday} posts hoje (meta: ${CONFIG.THRESHOLDS.POSTS_PER_DAY_TARGET})`,
                recommendation: 'Agendar mais posts para horários de pico',
                autoExecutable: true,
                autoAction: () => this.scheduleExtraPosts(metrics)
            });
        }

        // Crescimento estagnado?
        if (metrics.growthRate !== undefined && metrics.growthRate < CONFIG.THRESHOLDS.GROWTH_RATE_MIN) {
            this.suggestions.push({
                priority: 'high',
                action: CONFIG.ACTIONS.A_B_TEST,
                reason: `Crescimento em ${metrics.growthRate.toFixed(2)}% (abaixo de ${CONFIG.THRESHOLDS.GROWTH_RATE_MIN}%)`,
                recommendation: 'Iniciar A/B test com novos formatos de conteúdo',
                autoExecutable: true,
                autoAction: () => this.startABTest(metrics)
            });
        }

        // Horário subótimo?
        if (metrics.bestHours && metrics.postingHours) {
            const mismatch = this.checkTimingMismatch(metrics.bestHours, metrics.postingHours);
            if (mismatch.score < 0.6) {
                this.suggestions.push({
                    priority: 'medium',
                    action: CONFIG.ACTIONS.CHANGE_TIMING,
                    reason: `Posts publicados fora dos melhores horários (score: ${mismatch.score.toFixed(2)})`,
                    recommendation: `Mudar para: ${mismatch.suggestedHours.join(', ')}`,
                    autoExecutable: true,
                    autoAction: () => this.adjustTiming(mismatch.suggestedHours)
                });
            }
        }

        // Registrar análise
        this.state.lastRun = new Date().toISOString();
        this.state.metrics_history.push({
            timestamp: this.state.lastRun,
            metrics: { ...metrics },
            suggestionsCount: this.suggestions.length
        });

        // Manter só últimos 30 dias
        if (this.state.metrics_history.length > 30) {
            this.state.metrics_history.shift();
        }

        this.saveState();

        return {
            analyzedAt: this.state.lastRun,
            metrics,
            suggestions: this.suggestions,
            health: this.calculateHealth(metrics)
        };
    }

    /**
     * Calcular saúde geral do sistema
     */
    calculateHealth(metrics) {
        let score = 100;
        let issues = [];

        if (metrics.avgEngagement < CONFIG.THRESHOLDS.ENGAGEMENT_LOW) {
            score -= 30;
            issues.push('engagement_critical');
        } else if (metrics.avgEngagement < CONFIG.THRESHOLDS.ENGAGEMENT_TARGET) {
            score -= 15;
            issues.push('engagement_low');
        }

        if (metrics.postsToday < CONFIG.THRESHOLDS.POSTS_PER_DAY_MIN) {
            score -= 20;
            issues.push('posts_insufficient');
        }

        if (metrics.growthRate !== undefined && metrics.growthRate < CONFIG.THRESHOLDS.GROWTH_RATE_MIN) {
            score -= 20;
            issues.push('growth_stagnant');
        }

        return {
            score: Math.max(0, score),
            status: score >= 80 ? 'healthy' : score >= 50 ? 'warning' : 'critical',
            issues
        };
    }

    /**
     * Executar sugestões auto-executáveis
     */
    async executeAutoActions() {
        const executed = [];

        for (const suggestion of this.suggestions) {
            if (suggestion.autoExecutable && suggestion.autoAction) {
                try {
                    const result = await suggestion.autoAction();
                    executed.push({
                        action: suggestion.action,
                        success: true,
                        result
                    });

                    this.state.adjustments.push({
                        timestamp: new Date().toISOString(),
                        action: suggestion.action,
                        reason: suggestion.reason,
                        success: true
                    });
                } catch (error) {
                    executed.push({
                        action: suggestion.action,
                        success: false,
                        error: error.message
                    });
                }
            }
        }

        this.saveState();
        return executed;
    }

    /**
     * Verificar desalinhamento de timing
     */
    checkTimingMismatch(bestHours, postingHours) {
        const matches = postingHours.filter(h => bestHours.includes(h)).length;
        const score = matches / Math.max(postingHours.length, 1);

        return {
            score,
            suggestedHours: bestHours.slice(0, 4)
        };
    }

    /**
     * Agendar posts extras (placeholder)
     */
    scheduleExtraPosts(metrics) {
        console.log('[optimizer] Agendando posts extras...');
        // TODO: Integrar com sistema de agendamento real
        return { scheduled: 2, hours: ['18:00', '21:00'] };
    }

    /**
     * Iniciar A/B test (placeholder)
     */
    startABTest(metrics) {
        const testId = `ab_${Date.now()}`;
        console.log(`[optimizer] Iniciando A/B test: ${testId}`);

        this.state.testsRunning.push({
            id: testId,
            startedAt: new Date().toISOString(),
            type: 'content_format',
            variants: ['carousel', 'single_image', 'video']
        });

        return { testId, status: 'running' };
    }

    /**
     * Ajustar timing (placeholder)
     */
    adjustTiming(newHours) {
        console.log(`[optimizer] Ajustando horários para: ${newHours.join(', ')}`);
        // TODO: Integrar com sistema de agendamento real
        return { adjustedTo: newHours };
    }

    /**
     * Gerar relatório para humanos
     */
    generateReport() {
        const history = this.state.metrics_history.slice(-7);

        let report = `
📈 **OPTIMIZER ENGINE REPORT**
📅 ${new Date().toLocaleString('pt-BR')}

---

**📊 ÚLTIMOS 7 DIAS**
`;

        if (history.length > 0) {
            const avgEngagement = history.reduce((acc, h) => acc + (h.metrics.avgEngagement || 0), 0) / history.length;
            const avgPosts = history.reduce((acc, h) => acc + (h.metrics.postsToday || 0), 0) / history.length;

            report += `
- Engagement médio: ${avgEngagement.toFixed(2)}%
- Posts/dia médio: ${avgPosts.toFixed(1)}
- Sugestões geradas: ${history.reduce((acc, h) => acc + h.suggestionsCount, 0)}
`;
        } else {
            report += `\n⚠️ Sem dados históricos ainda.\n`;
        }

        report += `
**🔧 AJUSTES AUTOMÁTICOS**
- Total: ${this.state.adjustments.length}
- Últimos 7 dias: ${this.state.adjustments.filter(a => new Date(a.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}

**🧪 TESTES A/B ATIVOS**
- ${this.state.testsRunning.length} teste(s) em andamento
`;

        if (this.suggestions.length > 0) {
            report += `
**💡 SUGESTÕES PENDENTES**
`;
            for (const s of this.suggestions) {
                const emoji = s.priority === 'high' ? '🔴' : s.priority === 'medium' ? '🟡' : '🟢';
                report += `${emoji} ${s.reason}\n   → ${s.recommendation}\n`;
            }
        }

        report += `
---
*🤖 Generated by Optimizer Engine*
`;

        return report;
    }
}

// ==================== EXPORTS ====================

module.exports = {
    OptimizerEngine,
    CONFIG,
    createOptimizer: () => new OptimizerEngine()
};

// ==================== CLI ====================

if (require.main === module) {
    const optimizer = new OptimizerEngine();
    const args = process.argv.slice(2);

    if (args[0] === '--analyze') {
        // Simular métricas para teste
        const mockMetrics = {
            avgEngagement: parseFloat(args[1]) || 3.5,
            postsToday: parseInt(args[2]) || 3,
            growthRate: 0.8,
            totalFollowers: 15000
        };

        const result = optimizer.analyze(mockMetrics);
        console.log(JSON.stringify(result, null, 2));
    } else if (args[0] === '--report') {
        console.log(optimizer.generateReport());
    } else if (args[0] === '--execute') {
        const mockMetrics = { avgEngagement: 1.5, postsToday: 1 };
        optimizer.analyze(mockMetrics);
        optimizer.executeAutoActions().then(results => {
            console.log('Ações executadas:', results);
        });
    } else {
        console.log(`
📈 OPTIMIZER ENGINE CLI
=======================

USO:
  node optimizer-engine.js --analyze [engagement] [posts]   Analisar métricas
  node optimizer-engine.js --report                         Gerar relatório
  node optimizer-engine.js --execute                        Executar ações auto

EXEMPLOS:
  node optimizer-engine.js --analyze 2.5 2    # Engagement 2.5%, 2 posts
  node optimizer-engine.js --report           # Ver relatório

INTEGRAÇÃO:
  const { createOptimizer } = require('./optimizer-engine');
  
  const optimizer = createOptimizer();
  const result = optimizer.analyze(garyMetrics);
  
  if (result.health.status === 'critical') {
    await optimizer.executeAutoActions();
  }
`);
    }
}
