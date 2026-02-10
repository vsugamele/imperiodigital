"use client";

import React, { useState, useEffect } from "react";

type Trend = {
    id: string;
    topic: string;
    score: number;
    status: "surging" | "rising" | "stable" | "declining" | "critical" | "peak";
    summary: string;
};

type TrendData = {
    crypto: Trend[];
    politics: Trend[];
    investment: Trend[];
    gossip: Trend[];
};

type Alert = {
    id: string;
    type: string;
    title: string;
    message: string;
};

export default function TrendRadar() {
    const [data, setData] = useState<TrendData | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [activeCategory, setActiveCategory] = useState<keyof TrendData>("crypto");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/intel/trends");
                const json = await res.json();
                if (json.ok) {
                    setData(json.trends);
                    setAlerts(json.alerts);
                }
            } catch (err) {
                console.error("Failed to load trends", err);
            } finally {
                setLoading(false);
            }
        }
        load();
        const interval = setInterval(load, 60000);
        return () => clearInterval(interval);
    }, []);

    const statusColors = {
        surging: "#4edc88",
        rising: "#38bdf8",
        stable: "#888",
        declining: "#ff6b6b",
        critical: "#f43f5e",
        peak: "#fbbf24"
    };

    if (loading) return <div style={{ opacity: 0.5 }}>Inicializando Radar de Tendências...</div>;

    const currentTrends = data ? data[activeCategory] : [];

    return (
        <section className="glass-card" style={{ padding: '24px', background: 'rgba(10,10,10,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>📡</span> Radar de Inteligência Global
                    </h3>
                    <p style={{ fontSize: '11px', opacity: 0.5, marginTop: '4px' }}>Monitoramento de sinais e tendências em tempo real</p>
                </div>
                {alerts.length > 0 && (
                    <div style={{
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#f43f5e',
                        fontWeight: 700,
                        animation: 'pulse 2s infinite'
                    }}>
                        🚨 {alerts[0].title}
                    </div>
                )}
            </div>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {(['crypto', 'politics', 'investment', 'gossip'] as const).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: activeCategory === cat ? 'rgba(255,255,255,0.1)' : 'transparent',
                            color: activeCategory === cat ? '#fff' : '#888',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {cat === 'gossip' ? 'Trends/Fofocas' : cat === 'politics' ? 'Política' : cat === 'investment' ? 'Investimento' : 'Crypto'}
                    </button>
                ))}
            </div>

            {/* Trends List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentTrends.map(trend => (
                    <div key={trend.id} style={{
                        padding: '16px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '9px',
                                    fontWeight: 900,
                                    background: `${statusColors[trend.status]}22`,
                                    color: statusColors[trend.status],
                                    border: `1px solid ${statusColors[trend.status]}44`
                                }}>
                                    {trend.status.toUpperCase()}
                                </div>
                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>{trend.topic}</h4>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', fontWeight: 900, color: statusColors[trend.status] }}>{trend.score}%</div>
                                <div style={{ fontSize: '8px', opacity: 0.4 }}>MOMENTUM</div>
                            </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', opacity: 0.6, lineHeight: 1.5 }}>{trend.summary}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
