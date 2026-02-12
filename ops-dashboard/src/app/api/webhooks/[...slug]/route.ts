import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ==================== WEBHOOK LOGS ====================

const LOGS_DIR = path.join(process.cwd(), '..', 'data', 'webhook-logs');

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function logWebhook(projeto: string, acao: string, payload: unknown, result: unknown) {
    ensureDir(LOGS_DIR);
    const entry = {
        timestamp: new Date().toISOString(),
        projeto,
        acao,
        payload,
        result,
    };

    // Per-project log file
    const logFile = path.join(LOGS_DIR, `${projeto}.json`);
    let logs: unknown[] = [];
    if (fs.existsSync(logFile)) {
        try { logs = JSON.parse(fs.readFileSync(logFile, 'utf8')); } catch { }
    }
    logs.push(entry);
    if (logs.length > 500) logs = logs.slice(-500);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

// ==================== HANDLER REGISTRY ====================

import { WebhookHandler } from './types';

type HandlersMap = Record<string, Record<string, WebhookHandler>>;

// Import handlers
import { jpHandlers } from './handlers/jp';

const HANDLERS: HandlersMap = {
    jp: jpHandlers,
    // Add more projects here:
    // igaming: igamingHandlers,
    // ofertas: ofertasHandlers,
};

// ==================== ROUTE ====================

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    const { slug } = await params;

    if (!slug || slug.length < 2) {
        return NextResponse.json(
            { error: 'URL inválida. Use /api/webhooks/{projeto}/{acao}', example: '/api/webhooks/jp/create-user' },
            { status: 400 }
        );
    }

    const [projeto, acao] = slug;
    console.log(`🌐 Incoming Webhook: [${projeto}] / [${acao}]`);
    const projectHandlers = HANDLERS[projeto];

    if (!projectHandlers) {
        console.warn(`❌ Project "${projeto}" not found`);
        return NextResponse.json(
            { error: `Projeto "${projeto}" não registrado`, projetos_disponiveis: Object.keys(HANDLERS) },
            { status: 404 }
        );
    }

    const handlerDef = projectHandlers[acao];
    if (!handlerDef) {
        console.warn(`❌ Action "${acao}" not found for project "${projeto}"`);
        return NextResponse.json(
            { error: `Ação "${acao}" não existe no projeto "${projeto}"`, acoes_disponiveis: Object.keys(projectHandlers) },
            { status: 404 }
        );
    }

    try {
        console.log(`📡 Executing handler for: ${projeto}/${acao}`);
        const payload = await req.json().catch(() => ({})) as Record<string, unknown>;
        const result = await handlerDef.handler(payload) as Record<string, unknown>;
        logWebhook(projeto, acao, payload, { success: true, ...result });
        return NextResponse.json({ success: true, projeto, acao, ...result });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logWebhook(projeto, acao, {}, { success: false, error: errorMessage });
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

// GET: Listar projetos e ações disponíveis
export async function GET() {
    const registry: Record<string, string[]> = {};
    for (const [projeto, handlers] of Object.entries(HANDLERS)) {
        registry[projeto] = Object.entries(handlers).map(
            ([acao, def]) => `${acao} - ${def.description}`
        );
    }

    // Also return recent logs
    let recentLogs: unknown[] = [];
    if (fs.existsSync(LOGS_DIR)) {
        const files = fs.readdirSync(LOGS_DIR).filter(f => f.endsWith('.json'));
        for (const file of files) {
            try {
                const logs = JSON.parse(fs.readFileSync(path.join(LOGS_DIR, file), 'utf8'));
                recentLogs.push(...logs.slice(-10));
            } catch { }
        }
        recentLogs.sort((a, b) => {
            const timeA = (a as { timestamp: string }).timestamp;
            const timeB = (b as { timestamp: string }).timestamp;
            return new Date(timeB).getTime() - new Date(timeA).getTime();
        });
        recentLogs = recentLogs.slice(0, 20);
    }

    return NextResponse.json({
        hub: 'Webhook Hub Centralizado',
        uso: 'POST /api/webhooks/{projeto}/{acao}',
        projetos: registry,
        logs_recentes: recentLogs,
    });
}
