import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { projectId, projectName } = await request.json();

        // Simulated deliberation of different AI "Board Members"
        const deliberations = [
            {
                role: "Technical Auditor",
                agent: "Claude 3.5 Sonnet",
                status: "Approved",
                rationale: "O stack de tecnologia proposto para " + projectName + " é escalável. Recomendo atenção especial às políticas de RLS no Supabase.",
                score: 95
            },
            {
                role: "Financial Analyst",
                agent: "GPT-4o",
                status: "Needs Revision",
                rationale: "Os custos de API estimados podem exceder o orçamento mensal se o tráfego escalar 2x. Recomendo implementar caching agressivo.",
                score: 72
            },
            {
                role: "Strategy specialist",
                agent: "Gemini 1.5 Pro",
                status: "Approved",
                rationale: "Alinhamento forte com os objetivos de Q1. O 'time-to-market' é crítico, e a estrutura simplificada permite deploy rápido.",
                score: 88
            }
        ];

        const consensusScore = Math.round(deliberations.reduce((acc, d) => acc + d.score, 0) / deliberations.length);
        const approved = consensusScore > 80;

        return NextResponse.json({
            ok: true,
            projectId,
            deliberations,
            consensusScore,
            status: approved ? "Approved" : "Under Review",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }
}
