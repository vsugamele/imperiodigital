import { NextResponse } from 'next/server';

export async function GET() {
    // Simulated real-time intelligence data
    const trends = {
        crypto: [
            { id: "c1", topic: "Solana Breakpoint Hype", score: 92, status: "surging", summary: "Network upgrades and new phone rumors driving high social sentiment." },
            { id: "c2", topic: "ETH ETF Inflows", score: 65, status: "stable", summary: "Institutional buying continues steady pace despite sideways price action." }
        ],
        politics: [
            { id: "p1", topic: "Global Trade Policy Shifts", score: 88, status: "critical", summary: "New tariffs proposed; major implications for logistics and tech supply chains." },
            { id: "p2", topic: "EU Tech Regulation", score: 74, status: "rising", summary: "New AI safety standards being drafted; impact on open-source models." }
        ],
        investment: [
            { id: "i1", topic: "NVIDIA Earnings Anticipation", score: 98, status: "peak", summary: "Market weighted heavily on upcoming chip revenue guidance." },
            { id: "i2", topic: "Real Estate Tokenization", score: 45, status: "rising", summary: "Emerging trend in fractionalizing premium properties." }
        ],
        gossip: [
            { id: "g1", topic: "Metaverse Celebrity Brands", score: 82, status: "surging", summary: "Major influencers launching digital-only fashion lines." },
            { id: "g2", topic: "AI Influencer Drama", score: 55, status: "declining", summary: "User engagement dropping for non-human personas without deep narratives." }
        ]
    };

    const alerts = [
        { id: "a1", type: "flash", title: "Flash Alert: NASDAQ Volatility", message: "Sudden spike in tech sector volatility detected." }
    ];

    return NextResponse.json({ ok: true, trends, alerts });
}
