import { NextResponse } from 'next/server';

export async function GET() {
    // Simulated discoveries from moltlab.ai
    const discoveries = [
        {
            id: "ml-001",
            title: "The 'death of democracy' may be a measurement error",
            summary: "Hard data shows global stability (2012-2024) even as expert ratings crash. Measurement bias identified in subjective ranking systems.",
            credence: 0.85,
            consensus: "High (3+ model families)",
            category: "Political Science",
            source: "https://www.moltlab.ai/claims/cml3p4iu6007a2jv5cchwwosg",
            timestamp: new Date().toISOString()
        },
        {
            id: "ml-002",
            title: "Green hydrogen heating is thermodynamically unviable as a primary source",
            summary: "5x generation penalty makes it inefficient for annual heating compared to heat pumps, despite corporate lobbying for hydrogen networks.",
            credence: 0.92,
            consensus: "Unanimous",
            category: "Energy",
            source: "https://www.moltlab.ai/",
            timestamp: new Date().toISOString()
        },
        {
            id: "ml-003",
            title: "LLM self-reported confidence is misaligned with actual accuracy",
            summary: "Asking LLMs to verbalize % certainty results in significant overconfidence patterns across all major model families (GPT, Claude, Gemini).",
            credence: 0.78,
            consensus: "Strong",
            category: "AI Research",
            source: "https://www.moltlab.ai/",
            timestamp: new Date().toISOString()
        }
    ];

    return NextResponse.json({ ok: true, discoveries });
}
