import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Caminho para o arquivo de verticais
const VERTICALS_PATH = path.join(process.cwd(), 'src', 'lib', 'data', 'verticals.json');
const OUTPUT_DIR = path.join(process.cwd(), '..', 'projects', 'ofertas', 'outputs');

function getVerticalsData() {
    if (!fs.existsSync(VERTICALS_PATH)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(VERTICALS_PATH, 'utf8'));
}

function getOfertasStats() {
    if (!fs.existsSync(OUTPUT_DIR)) return { total: 0, ativas: 0, concluidas: 0 };

    let total = 0;
    let ativas = 0;
    let concluidas = 0;

    const dirs = fs.readdirSync(OUTPUT_DIR);
    dirs.forEach(dir => {
        const dashboardPath = path.join(OUTPUT_DIR, dir, 'dashboard.json');
        if (fs.existsSync(dashboardPath)) {
            try {
                const dashboard = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));
                total++;

                const progresso = parseInt(dashboard.status?.progresso || '0');
                if (progresso >= 100) {
                    concluidas++;
                } else if (progresso > 0) {
                    ativas++;
                }
            } catch (e) {
                // Ignore invalid JSON
            }
        }
    });

    return { total, ativas, concluidas };
}

export async function GET() {
    const verticalsData = getVerticalsData();

    if (!verticalsData) {
        return NextResponse.json({ error: 'Arquivo verticals.json não encontrado' }, { status: 404 });
    }

    // Enriquecer dados com métricas em tempo real
    const ofertasStats = getOfertasStats();

    // Atualizar KPIs da vertical de lançamentos
    const verticaisEnriquecidas = (verticalsData.verticais as any[]).map((v) => {
        if (v.id === 'lancamentos') {
            return {
                ...v,
                metricas_tempo_real: {
                    ideias_pipeline: ofertasStats.total,
                    em_producao: ofertasStats.ativas,
                    concluidas: ofertasStats.concluidas
                }
            };
        }
        return v;
    });

    return NextResponse.json({
        verticais: verticaisEnriquecidas,
        framework_lancamento: verticalsData.framework_lancamento,
        produtos_jp_freitas: verticalsData.produtos_jp_freitas,
        auditoria_projetos: verticalsData.auditoria_projetos,
        learning_engine: verticalsData.learning_engine,
        resumo: {
            total_verticais: verticalsData.verticais.length,
            em_producao: (verticalsData.verticais as { status: string }[]).filter((v) => v.status === 'producao').length,
            ativas: (verticalsData.verticais as { status: string }[]).filter((v) => v.status === 'ativo').length,
            planejamento: (verticalsData.verticais as { status: string }[]).filter((v) => v.status === 'planejamento').length
        },
        ultima_atualizacao: verticalsData.ultima_atualizacao
    });
}

export async function POST(request: Request) {
    try {
        const updates = await request.json();
        const verticalsData = getVerticalsData();

        if (!verticalsData) {
            return NextResponse.json({ error: 'Arquivo verticals.json não encontrado' }, { status: 404 });
        }

        // Atualizar vertical específica
        if (updates.verticalId && updates.dados) {
            const idx = (verticalsData.verticais as { id: string }[]).findIndex((v) => v.id === updates.verticalId);
            if (idx !== -1) {
                verticalsData.verticais[idx] = { ...verticalsData.verticais[idx], ...updates.dados };
                verticalsData.ultima_atualizacao = new Date().toISOString();

                fs.writeFileSync(VERTICALS_PATH, JSON.stringify(verticalsData, null, 2));
                return NextResponse.json({ success: true, vertical: verticalsData.verticais[idx] });
            }
            return NextResponse.json({ error: 'Vertical não encontrada' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    } catch (error: unknown) {
        console.error('Error updating vertical:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
