/**
 * 🏛️ DECISION COUNCIL
 * 
 * Sistema de deliberação multi-agente onde workers votam e decidem
 * em conjunto sobre estratégias, projetos e ações.
 * 
 * Parte do Phase 2 do Squad Enhancement.
 */

const fs = require('fs');
const path = require('path');

// ==================== CONFIGURAÇÃO ====================

const CONFIG = {
    COUNCIL_MEMBERS: {
        ALEX: {
            name: 'Alex',
            role: 'Orchestrator',
            weight: 1.5,        // Peso do voto
            expertise: ['strategy', 'coordination', 'automation'],
            bias: 'efficiency'  // Tendência de decisão
        },
        GARY: {
            name: 'Gary',
            role: 'Growth Specialist',
            weight: 1.2,
            expertise: ['content', 'engagement', 'trends'],
            bias: 'growth'
        },
        EUGENE: {
            name: 'Eugene',
            role: 'Copy Master',
            weight: 1.0,
            expertise: ['copywriting', 'persuasion', 'messaging'],
            bias: 'conversion'
        },
        HORMOZI: {
            name: 'Hormozi',
            role: 'Offer Architect',
            weight: 1.3,
            expertise: ['offers', 'pricing', 'sales'],
            bias: 'revenue'
        },
        RUSSELL: {
            name: 'Russell',
            role: 'Funnel Specialist',
            weight: 1.2,
            expertise: ['funnels', 'webinars', 'conversions'],
            bias: 'systems'
        },
        WATCHER: {
            name: 'WATCHER',
            role: 'Security Monitor',
            weight: 1.0,
            expertise: ['security', 'monitoring', 'risk'],
            bias: 'caution'
        }
    },

    DECISION_TYPES: {
        STRATEGIC: 'strategic',     // Decisões de alto nível
        OPERATIONAL: 'operational', // Decisões do dia-a-dia
        EMERGENCY: 'emergency'      // Decisões urgentes
    },

    CONSENSUS_THRESHOLD: 0.6,     // 60% para aprovar
    QUORUM_MIN: 3,                // Mínimo de votantes

    LOG_FILE: './logs/decision-council.json',
    STATE_FILE: './tmp/council-state.json'
};

// ==================== CONSELHO ====================

class DecisionCouncil {
    constructor() {
        this.members = CONFIG.COUNCIL_MEMBERS;
        this.state = this.loadState();
        this.currentDeliberation = null;
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
            decisions: [],
            pendingDeliberations: [],
            lastSession: null
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
     * Iniciar uma deliberação
     */
    startDeliberation(topic, options, type = 'strategic', context = {}) {
        const deliberationId = `dlb_${Date.now()}`;

        this.currentDeliberation = {
            id: deliberationId,
            topic,
            options,
            type,
            context,
            startedAt: new Date().toISOString(),
            votes: {},
            rationales: {},
            status: 'in_progress'
        };

        this.state.pendingDeliberations.push(this.currentDeliberation);
        this.saveState();

        return {
            deliberationId,
            topic,
            options,
            awaitingVotes: Object.keys(this.members)
        };
    }

    /**
     * Simular voto de um membro baseado em sua expertise e bias
     */
    simulateVote(memberId, deliberation) {
        const member = this.members[memberId];
        if (!member) return null;

        const { options, context, type } = deliberation;

        // Pontuação para cada opção baseada no bias do membro
        const scores = options.map((option, idx) => {
            let score = 0.5; // Neutro

            // Se a opção alinha com o bias do membro
            if (option.toLowerCase().includes(member.bias)) {
                score += 0.3;
            }

            // Se a opção menciona expertise do membro
            for (const exp of member.expertise) {
                if (option.toLowerCase().includes(exp)) {
                    score += 0.15;
                }
            }

            // Adicionar um pouco de variância
            score += (Math.random() - 0.5) * 0.2;

            // WATCHER sempre adiciona cautela
            if (memberId === 'WATCHER' && (option.toLowerCase().includes('risk') || option.toLowerCase().includes('aggressive'))) {
                score -= 0.2;
            }

            // Hormozi favorece opções com ROI
            if (memberId === 'HORMOZI' && (option.toLowerCase().includes('revenue') || option.toLowerCase().includes('profit'))) {
                score += 0.2;
            }

            return { option, score: Math.max(0, Math.min(1, score)), idx };
        });

        // Escolher a opção com maior score
        const best = scores.sort((a, b) => b.score - a.score)[0];

        // Gerar rationale
        const rationale = this.generateRationale(member, best, deliberation);

        return {
            memberId,
            memberName: member.name,
            vote: best.idx,
            confidence: best.score,
            rationale,
            weight: member.weight
        };
    }

    generateRationale(member, choice, deliberation) {
        const templates = {
            efficiency: [
                `Optei por "${choice.option}" pois maximiza a eficiência operacional.`,
                `Essa opção reduz overhead e otimiza nossos recursos.`
            ],
            growth: [
                `"${choice.option}" tem maior potencial de crescimento.`,
                `Baseado nas tendências, essa opção gera mais engajamento.`
            ],
            conversion: [
                `A copy e o posicionamento de "${choice.option}" convertem melhor.`,
                `Essa mensagem ressoa mais com nosso público.`
            ],
            revenue: [
                `"${choice.option}" oferece o melhor ROI.`,
                `Os números apontam para maior lucratividade com essa escolha.`
            ],
            systems: [
                `"${choice.option}" se integra melhor ao nosso funil.`,
                `Essa opção cria um sistema mais escalável.`
            ],
            caution: [
                `"${choice.option}" apresenta menor risco operacional.`,
                `Mantemos a estabilidade do sistema com essa escolha.`
            ]
        };

        const biasTemplates = templates[member.bias] || templates.efficiency;
        return biasTemplates[Math.floor(Math.random() * biasTemplates.length)];
    }

    /**
     * Coletar votos de todos os membros
     */
    collectVotes(deliberationId) {
        let deliberation = this.currentDeliberation;

        if (!deliberation || deliberation.id !== deliberationId) {
            deliberation = this.state.pendingDeliberations.find(d => d.id === deliberationId);
        }

        if (!deliberation) {
            return { error: 'Deliberation not found' };
        }

        // Simular votos de cada membro
        for (const memberId of Object.keys(this.members)) {
            if (!deliberation.votes[memberId]) {
                const vote = this.simulateVote(memberId, deliberation);
                if (vote) {
                    deliberation.votes[memberId] = vote;
                }
            }
        }

        return {
            deliberationId,
            votes: deliberation.votes,
            totalVotes: Object.keys(deliberation.votes).length
        };
    }

    /**
     * Calcular resultado da deliberação
     */
    calculateResult(deliberationId) {
        let deliberation = this.currentDeliberation;

        if (!deliberation || deliberation.id !== deliberationId) {
            deliberation = this.state.pendingDeliberations.find(d => d.id === deliberationId);
        }

        if (!deliberation) {
            return { error: 'Deliberation not found' };
        }

        const votes = Object.values(deliberation.votes);

        if (votes.length < CONFIG.QUORUM_MIN) {
            return {
                status: 'no_quorum',
                votesReceived: votes.length,
                required: CONFIG.QUORUM_MIN
            };
        }

        // Calcular votos ponderados para cada opção
        const optionScores = {};
        let totalWeight = 0;

        for (const vote of votes) {
            const optionIdx = vote.vote;
            if (!optionScores[optionIdx]) {
                optionScores[optionIdx] = { weighted: 0, count: 0, voters: [] };
            }
            optionScores[optionIdx].weighted += vote.weight * vote.confidence;
            optionScores[optionIdx].count += 1;
            optionScores[optionIdx].voters.push(vote.memberName);
            totalWeight += vote.weight;
        }

        // Encontrar vencedor
        let winner = null;
        let maxScore = 0;

        for (const [idx, score] of Object.entries(optionScores)) {
            const normalizedScore = score.weighted / totalWeight;
            if (normalizedScore > maxScore) {
                maxScore = normalizedScore;
                winner = parseInt(idx);
            }
        }

        const approved = maxScore >= CONFIG.CONSENSUS_THRESHOLD;

        // Registrar decisão
        const decision = {
            deliberationId,
            topic: deliberation.topic,
            winningOption: winner !== null ? deliberation.options[winner] : null,
            consensusScore: maxScore,
            approved,
            votes: deliberation.votes,
            decidedAt: new Date().toISOString()
        };

        this.state.decisions.push(decision);

        // Remover das pendentes
        this.state.pendingDeliberations = this.state.pendingDeliberations.filter(
            d => d.id !== deliberationId
        );

        this.saveState();

        return {
            status: approved ? 'approved' : 'rejected',
            winningOption: decision.winningOption,
            consensusScore: (maxScore * 100).toFixed(1) + '%',
            votesBreakdown: optionScores,
            rationales: Object.values(deliberation.votes).map(v => ({
                member: v.memberName,
                rationale: v.rationale
            }))
        };
    }

    /**
     * Deliberação rápida (simula todo o processo)
     */
    quickDeliberate(topic, options, context = {}) {
        // Iniciar
        const { deliberationId } = this.startDeliberation(topic, options, 'operational', context);

        // Coletar votos
        this.collectVotes(deliberationId);

        // Calcular resultado
        return this.calculateResult(deliberationId);
    }

    /**
     * Gerar relatório do conselho
     */
    generateReport() {
        const recentDecisions = this.state.decisions.slice(-10);
        const pendingCount = this.state.pendingDeliberations.length;

        let report = `
🏛️ **DECISION COUNCIL REPORT**
📅 ${new Date().toLocaleString('pt-BR')}

---

**📊 ESTATÍSTICAS**
- Total de decisões: ${this.state.decisions.length}
- Deliberações pendentes: ${pendingCount}
- Membros ativos: ${Object.keys(this.members).length}

---

**🗳️ ÚLTIMAS DECISÕES**
`;

        if (recentDecisions.length === 0) {
            report += '\n_Nenhuma decisão registrada ainda._\n';
        } else {
            for (const decision of recentDecisions.slice(-5).reverse()) {
                const emoji = decision.approved ? '✅' : '❌';
                report += `
${emoji} **${decision.topic}**
   Decisão: ${decision.winningOption || 'Rejeitada'}
   Consenso: ${(decision.consensusScore * 100).toFixed(0)}%
   Data: ${new Date(decision.decidedAt).toLocaleDateString('pt-BR')}
`;
            }
        }

        report += `
---

**👥 MEMBROS DO CONSELHO**
`;

        for (const [id, member] of Object.entries(this.members)) {
            report += `- ${member.name} (${member.role}) - Peso: ${member.weight}x\n`;
        }

        report += `
---
*🤖 Generated by Decision Council*
`;

        return report;
    }
}

// ==================== EXPORTS ====================

module.exports = {
    DecisionCouncil,
    CONFIG,
    createCouncil: () => new DecisionCouncil()
};

// ==================== CLI ====================

if (require.main === module) {
    const council = new DecisionCouncil();
    const args = process.argv.slice(2);

    if (args[0] === '--deliberate') {
        const topic = args[1] || 'Qual estratégia de crescimento priorizar?';
        const options = [
            'Focar em conteúdo viral para Instagram',
            'Investir em funis de webinar',
            'Expandir para YouTube Shorts',
            'Otimizar ofertas de high-ticket'
        ];

        console.log('🏛️ Iniciando deliberação...\n');
        const result = council.quickDeliberate(topic, options);
        console.log(JSON.stringify(result, null, 2));
    } else if (args[0] === '--report') {
        console.log(council.generateReport());
    } else if (args[0] === '--history') {
        console.log(JSON.stringify(council.state.decisions.slice(-10), null, 2));
    } else {
        console.log(`
🏛️ DECISION COUNCIL CLI
========================

USO:
  node decision-council.js --deliberate [topic]   Iniciar deliberação
  node decision-council.js --report               Ver relatório
  node decision-council.js --history              Ver histórico

EXEMPLOS:
  node decision-council.js --deliberate "Qual campanha lançar?"
  node decision-council.js --report

INTEGRAÇÃO:
  const { createCouncil } = require('./decision-council');
  
  const council = createCouncil();
  
  // Deliberação rápida
  const result = council.quickDeliberate(
    'Lançar produto agora ou esperar?',
    ['Lançar imediatamente', 'Aguardar mais dados', 'Fazer soft-launch']
  );
  
  console.log(result.winningOption);
`);
    }
}
