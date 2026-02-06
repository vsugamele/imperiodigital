/**
 * 🚀 FUNNEL PHASE CONNECTOR
 * 
 * Conecta os funnel strategists (Russell, Jeff, Erico) com as fases
 * dos projetos, ativando automaticamente o guru certo no momento certo.
 * 
 * Parte do Phase 3 do Squad Enhancement.
 */

const fs = require('fs');
const path = require('path');

// ==================== CONFIGURAÇÃO ====================

const CONFIG = {
    PROJECT_PHASES: {
        IDEATION: 'ideation',         // Ideia inicial
        VALIDATION: 'validation',      // Validação de mercado
        DEVELOPMENT: 'development',    // Desenvolvimento do produto
        PRE_LAUNCH: 'pre_launch',      // Preparação para lançamento
        LAUNCH: 'launch',              // Lançamento
        SCALING: 'scaling',            // Escala/crescimento
        OPTIMIZATION: 'optimization',  // Otimização contínua
        MATURITY: 'maturity'           // Maturidade
    },

    STRATEGISTS: {
        RUSSELL: {
            name: 'Russell Brunson',
            role: 'Funnel Architect',
            specialty: 'Funnel building, webinars, VSL',
            activePhases: ['pre_launch', 'launch', 'scaling'],
            triggers: [
                { phase: 'pre_launch', action: 'design_funnel_architecture' },
                { phase: 'launch', action: 'optimize_conversion_flow' },
                { phase: 'scaling', action: 'add_upsells_downsells' }
            ]
        },
        JEFF: {
            name: 'Jeff Walker',
            role: 'Launch Planner',
            specialty: 'Product launches, PLF methodology',
            activePhases: ['validation', 'pre_launch', 'launch'],
            triggers: [
                { phase: 'validation', action: 'create_seed_launch' },
                { phase: 'pre_launch', action: 'craft_launch_sequence' },
                { phase: 'launch', action: 'execute_open_cart' }
            ]
        },
        ERICO: {
            name: 'Erico Rocha',
            role: 'Membership Builder',
            specialty: 'Memberships, recurring revenue, 6em7',
            activePhases: ['development', 'launch', 'maturity'],
            triggers: [
                { phase: 'development', action: 'structure_membership' },
                { phase: 'launch', action: 'launch_membership' },
                { phase: 'maturity', action: 'optimize_retention' }
            ]
        },
        EUGENE: {
            name: 'Eugene Schwartz',
            role: 'Copy Master',
            specialty: 'Headlines, copy awareness levels',
            activePhases: ['pre_launch', 'launch', 'optimization'],
            triggers: [
                { phase: 'pre_launch', action: 'craft_headlines' },
                { phase: 'launch', action: 'write_sales_page' },
                { phase: 'optimization', action: 'test_new_angles' }
            ]
        },
        HORMOZI: {
            name: 'Alex Hormozi',
            role: 'Offer Architect',
            specialty: 'Irresistible offers, pricing, value stacking',
            activePhases: ['ideation', 'development', 'optimization'],
            triggers: [
                { phase: 'ideation', action: 'design_grand_slam_offer' },
                { phase: 'development', action: 'stack_value' },
                { phase: 'optimization', action: 'increase_ltv' }
            ]
        }
    },

    STATE_FILE: './tmp/funnel-connector-state.json',
    LOG_FILE: './logs/funnel-connector.json'
};

// ==================== CONECTOR ====================

class FunnelPhaseConnector {
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
            projects: {},
            activations: [],
            recommendations: []
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
     * Registrar um projeto
     */
    registerProject(projectId, projectName, initialPhase = 'ideation') {
        this.state.projects[projectId] = {
            id: projectId,
            name: projectName,
            currentPhase: initialPhase,
            phaseHistory: [{
                phase: initialPhase,
                enteredAt: new Date().toISOString()
            }],
            activeStrategists: [],
            completedActions: []
        };

        this.saveState();

        // Ativar strategists para fase inicial
        return this.activateStrategistsForPhase(projectId, initialPhase);
    }

    /**
     * Mudar fase de um projeto
     */
    changePhase(projectId, newPhase) {
        const project = this.state.projects[projectId];
        if (!project) {
            return { error: 'Project not found' };
        }

        const oldPhase = project.currentPhase;
        project.currentPhase = newPhase;
        project.phaseHistory.push({
            phase: newPhase,
            enteredAt: new Date().toISOString(),
            previousPhase: oldPhase
        });

        this.saveState();

        console.log(`[Funnel] Project ${projectId} moved from ${oldPhase} to ${newPhase}`);

        // Ativar strategists para nova fase
        return this.activateStrategistsForPhase(projectId, newPhase);
    }

    /**
     * Ativar strategists relevantes para uma fase
     */
    activateStrategistsForPhase(projectId, phase) {
        const project = this.state.projects[projectId];
        if (!project) return { error: 'Project not found' };

        const activeStrategists = [];
        const actions = [];

        for (const [strategistId, strategist] of Object.entries(CONFIG.STRATEGISTS)) {
            if (strategist.activePhases.includes(phase)) {
                activeStrategists.push({
                    id: strategistId,
                    name: strategist.name,
                    role: strategist.role,
                    specialty: strategist.specialty
                });

                // Encontrar action trigger
                const trigger = strategist.triggers.find(t => t.phase === phase);
                if (trigger) {
                    actions.push({
                        strategist: strategistId,
                        strategistName: strategist.name,
                        action: trigger.action,
                        phase,
                        status: 'pending'
                    });
                }
            }
        }

        project.activeStrategists = activeStrategists;

        // Registrar ativação
        this.state.activations.push({
            timestamp: new Date().toISOString(),
            projectId,
            phase,
            strategists: activeStrategists.map(s => s.name),
            actions: actions.length
        });

        this.saveState();

        return {
            projectId,
            phase,
            activeStrategists,
            suggestedActions: actions,
            message: `${activeStrategists.length} strategist(s) activated for ${phase} phase`
        };
    }

    /**
     * Marcar ação como concluída
     */
    completeAction(projectId, strategistId, action) {
        const project = this.state.projects[projectId];
        if (!project) return { error: 'Project not found' };

        project.completedActions.push({
            strategist: strategistId,
            action,
            completedAt: new Date().toISOString(),
            phase: project.currentPhase
        });

        this.saveState();

        return { success: true, action, strategist: strategistId };
    }

    /**
     * Obter próxima fase recomendada
     */
    getNextPhaseRecommendation(projectId) {
        const project = this.state.projects[projectId];
        if (!project) return { error: 'Project not found' };

        const phases = Object.values(CONFIG.PROJECT_PHASES);
        const currentIdx = phases.indexOf(project.currentPhase);

        if (currentIdx === -1 || currentIdx === phases.length - 1) {
            return {
                currentPhase: project.currentPhase,
                recommendation: null,
                message: 'Project is at final phase or phase not found'
            };
        }

        const nextPhase = phases[currentIdx + 1];

        // Verificar ações pendentes
        const strategistsForCurrentPhase = Object.entries(CONFIG.STRATEGISTS)
            .filter(([_, s]) => s.activePhases.includes(project.currentPhase))
            .map(([id, s]) => ({
                id,
                ...s,
                trigger: s.triggers.find(t => t.phase === project.currentPhase)
            }));

        const completedActions = project.completedActions
            .filter(a => a.phase === project.currentPhase)
            .map(a => a.action);

        const pendingActions = strategistsForCurrentPhase
            .filter(s => s.trigger && !completedActions.includes(s.trigger.action))
            .map(s => ({
                strategist: s.name,
                action: s.trigger.action
            }));

        return {
            currentPhase: project.currentPhase,
            nextPhase,
            readyToAdvance: pendingActions.length === 0,
            pendingActions,
            message: pendingActions.length === 0
                ? `Ready to advance to ${nextPhase}`
                : `${pendingActions.length} action(s) pending before advancing`
        };
    }

    /**
     * Obter playbook para uma fase
     */
    getPhasePlaybook(phase) {
        const strategists = Object.entries(CONFIG.STRATEGISTS)
            .filter(([_, s]) => s.activePhases.includes(phase))
            .map(([id, s]) => ({
                id,
                name: s.name,
                role: s.role,
                specialty: s.specialty,
                action: s.triggers.find(t => t.phase === phase)?.action || 'advise'
            }));

        const playbook = {
            phase,
            description: this.getPhaseDescription(phase),
            strategists,
            keyActivities: this.getPhaseActivities(phase),
            successCriteria: this.getPhaseSuccessCriteria(phase)
        };

        return playbook;
    }

    getPhaseDescription(phase) {
        const descriptions = {
            ideation: 'Fase de concepção da ideia e definição da oferta.',
            validation: 'Validação de mercado e primeiros testes.',
            development: 'Desenvolvimento do produto/serviço.',
            pre_launch: 'Preparação para o lançamento.',
            launch: 'Execução do lançamento.',
            scaling: 'Escala e crescimento.',
            optimization: 'Otimização e refinamento.',
            maturity: 'Fase de maturidade e manutenção.'
        };
        return descriptions[phase] || 'Fase do projeto.';
    }

    getPhaseActivities(phase) {
        const activities = {
            ideation: ['Definir Grand Slam Offer', 'Identificar avatar', 'Mapear concorrência'],
            validation: ['Seed launch', 'Pesquisa com potenciais clientes', 'MVP'],
            development: ['Criar produto', 'Estruturar membership', 'Definir bônus'],
            pre_launch: ['Montar funil', 'Escrever copy', 'Criar sequência de launch'],
            launch: ['Open cart', 'Email marketing', 'Ads', 'Webinar/VSL'],
            scaling: ['Upsells/Downsells', 'Novos canais', 'Afiliados'],
            optimization: ['A/B tests', 'Refinar copy', 'Melhorar conversões'],
            maturity: ['Retenção', 'LTV', 'Novos produtos']
        };
        return activities[phase] || [];
    }

    getPhaseSuccessCriteria(phase) {
        const criteria = {
            ideation: ['Oferta definida', 'Avatar claro', 'Preço definido'],
            validation: ['10+ interessados', 'Feedback positivo', 'Prova de conceito'],
            development: ['Produto pronto', 'Entrega estruturada', 'Acesso configurado'],
            pre_launch: ['Funil montado', 'Copy aprovada', 'Lista aquecida'],
            launch: ['Vendas realizadas', 'ROI positivo', 'Feedback de clientes'],
            scaling: ['CAC < LTV', 'Crescimento consistente', 'Novos canais ativos'],
            optimization: ['Conversões melhoradas', 'Testes concluídos', 'Métricas otimizadas'],
            maturity: ['Churn controlado', 'Expansão de produto', 'Receita recorrente estável']
        };
        return criteria[phase] || [];
    }

    /**
     * Gerar relatório
     */
    generateReport() {
        let report = `
🚀 **FUNNEL PHASE CONNECTOR REPORT**
📅 ${new Date().toLocaleString('pt-BR')}

---

**📊 ESTATÍSTICAS**
- Projetos registrados: ${Object.keys(this.state.projects).length}
- Ativações de strategists: ${this.state.activations.length}

---

**📁 PROJETOS ATIVOS**
`;

        const projects = Object.values(this.state.projects);
        if (projects.length === 0) {
            report += '\n_Nenhum projeto registrado._\n';
        } else {
            for (const project of projects) {
                const phaseEmoji = {
                    ideation: '💡', validation: '🔍', development: '🛠️',
                    pre_launch: '🎯', launch: '🚀', scaling: '📈',
                    optimization: '⚙️', maturity: '🏆'
                };

                report += `
${phaseEmoji[project.currentPhase] || '📌'} **${project.name}** (${project.id})
   Fase: ${project.currentPhase}
   Strategists ativos: ${project.activeStrategists.map(s => s.name).join(', ') || 'Nenhum'}
   Ações concluídas: ${project.completedActions.length}
`;
            }
        }

        report += `
---

**🎭 STRATEGISTS**
`;

        for (const [id, strategist] of Object.entries(CONFIG.STRATEGISTS)) {
            report += `
• **${strategist.name}** (${strategist.role})
  Especialidade: ${strategist.specialty}
  Fases ativas: ${strategist.activePhases.join(', ')}
`;
        }

        report += `
---
*🤖 Generated by Funnel Phase Connector*
`;

        return report;
    }
}

// ==================== EXPORTS ====================

module.exports = {
    FunnelPhaseConnector,
    CONFIG,
    createConnector: () => new FunnelPhaseConnector()
};

// ==================== CLI ====================

if (require.main === module) {
    const connector = new FunnelPhaseConnector();
    const args = process.argv.slice(2);

    if (args[0] === '--register') {
        const projectId = args[1] || 'proj_' + Date.now();
        const projectName = args[2] || 'Novo Projeto';
        const phase = args[3] || 'ideation';

        const result = connector.registerProject(projectId, projectName, phase);
        console.log(JSON.stringify(result, null, 2));
    } else if (args[0] === '--advance') {
        const projectId = args[1];
        const newPhase = args[2];

        if (!projectId || !newPhase) {
            console.log('Uso: --advance <projectId> <newPhase>');
        } else {
            const result = connector.changePhase(projectId, newPhase);
            console.log(JSON.stringify(result, null, 2));
        }
    } else if (args[0] === '--playbook') {
        const phase = args[1] || 'launch';
        const playbook = connector.getPhasePlaybook(phase);
        console.log(JSON.stringify(playbook, null, 2));
    } else if (args[0] === '--report') {
        console.log(connector.generateReport());
    } else {
        console.log(`
🚀 FUNNEL PHASE CONNECTOR CLI
=============================

USO:
  node funnel-phase-connector.js --register [id] [name] [phase]  Registrar projeto
  node funnel-phase-connector.js --advance <id> <phase>          Avançar fase
  node funnel-phase-connector.js --playbook [phase]              Ver playbook
  node funnel-phase-connector.js --report                        Gerar relatório

FASES DISPONÍVEIS:
  ideation, validation, development, pre_launch, launch, scaling, optimization, maturity

INTEGRAÇÃO:
  const { createConnector } = require('./funnel-phase-connector');
  
  const connector = createConnector();
  
  // Registrar projeto
  connector.registerProject('sono-01', 'Produto Sono', 'ideation');
  
  // Avançar fase
  connector.changePhase('sono-01', 'validation');
  
  // Ver próxima fase
  const next = connector.getNextPhaseRecommendation('sono-01');
`);
    }
}
