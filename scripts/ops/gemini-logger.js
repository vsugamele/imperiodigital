/**
 * GEMINI CONSUMPTION LOGGER
 * Rastreia todo o uso da API Gemini/Vertex AI
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = 'ops-dashboard/tmp';
const LOG_FILE = `${LOG_DIR}/gemini-logs.json`;

class GeminiLogger {
    private logs: any[] = [];
    private writeInterval: NodeJS.Timeout | null = null;

    constructor() {
        // Carregar logs existentes
        this.loadLogs();
        
        // Salvar periodicamente
        this.writeInterval = setInterval(() => {
            this.saveLogs();
        }, 60000); // A cada minuto
    }

    private loadLogs() {
        try {
            if (fs.existsSync(LOG_FILE)) {
                this.logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
            }
        } catch (e) {
            this.logs = [];
        }
    }

    private saveLogs() {
        if (!fs.existsSync(LOG_DIR)) {
            fs.mkdirSync(LOG_DIR, { recursive: true });
        }
        fs.writeFileSync(LOG_FILE, JSON.stringify(this.logs, null, 2));
    }

    /**
     * Registrar uma chamada à API Gemini
     */
    log(config: {
        type: string;          // 'copy' | 'image' | 'chat' | 'analysis'
        worker: string;       // Nome do worker (Eugene, Gary, etc)
        prompt: string;       // Primeiros 200 chars do prompt
        model: string;        // Modelo usado
        inputTokens: number;
        outputTokens: number;
        cost: number;         // Custo estimado em dólares
        latency?: number;     // Tempo de resposta em ms
        status: 'success' | 'error';
        error?: string;
    }) {
        const entry = {
            id: `gem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            type: config.type,
            worker: config.worker,
            prompt: config.prompt.substring(0, 200),
            model: config.model,
            inputTokens: config.inputTokens,
            outputTokens: config.outputTokens,
            totalTokens: config.inputTokens + config.outputTokens,
            cost: config.cost,
            latency: config.latency,
            status: config.status,
            error: config.error
        };

        this.logs.unshift(entry); // Adicionar no início

        // Manter apenas últimos 1000 logs
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(0, 1000);
        }

        this.saveLogs();
        return entry;
    }

    /**
     * Obter todos os logs
     */
    getLogs(limit?: number) {
        return limit ? this.logs.slice(0, limit) : this.logs;
    }

    /**
     * Obter estatísticas
     */
    getStats() {
        const totalLogs = this.logs.length;
        const successfulLogs = this.logs.filter(l => l.status === 'success').length;
        const totalTokens = this.logs.reduce((acc, l) => acc + l.totalTokens, 0);
        const totalCost = this.logs.reduce((acc, l) => acc + l.cost, 0);
        const avgLatency = this.logs.filter(l => l.latency).reduce((acc, l, _, arr) => acc + (l.latency || 0) / arr.length, 0);

        // Por worker
        const byWorker: Record<string, { count: number, tokens: number, cost: number }> = {};
        this.logs.forEach(l => {
            if (!byWorker[l.worker]) {
                byWorker[l.worker] = { count: 0, tokens: 0, cost: 0 };
            }
            byWorker[l.worker].count++;
            byWorker[l.worker].tokens += l.totalTokens;
            byWorker[l.worker].cost += l.cost;
        });

        // Por tipo
        const byType: Record<string, { count: number, tokens: number, cost: number }> = {};
        this.logs.forEach(l => {
            if (!byType[l.type]) {
                byType[l.type] = { count: 0, tokens: 0, cost: 0 };
            }
            byType[l.type].count++;
            byType[l.type].tokens += l.totalTokens;
            byType[l.type].cost += l.cost;
        });

        return {
            totalLogs,
            successfulLogs,
            failedLogs: totalLogs - successfulLogs,
            totalTokens,
            totalCost,
            avgLatency: Math.round(avgLatency),
            byWorker,
            byType
        };
    }

    /**
     * Limpar logs antigos
     */
    clear(keepLast: number = 100) {
        this.logs = this.logs.slice(0, keepLast);
        this.saveLogs();
    }
}

// Singleton instance
let logger: GeminiLogger | null = null;

function getLogger(): GeminiLogger {
    if (!logger) {
        logger = new GeminiLogger();
    }
    return logger;
}

// Exportar funções convenientes
module.exports = {
    getLogger,
    GeminiLogger
};
