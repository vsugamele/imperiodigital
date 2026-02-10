"use client";

import React from "react";
import {
    Users,
    ShoppingBag,
    Rocket,
    Target,
    ChevronRight,
    Activity,
    BarChart3,
    TrendingUp,
    AlertCircle
} from "lucide-react";

interface BUCardProps {
    id: string;
    name: string;
    mission: string;
    priority: string;
    status: "healthy" | "warning" | "critical";
    metrics: { label: string; value: string | number; unit?: string }[];
    agents: string[];
    icon: React.ReactNode;
}

const BUCard = ({ name, mission, priority, status, metrics, agents, icon }: BUCardProps) => {
    const statusColor = status === "healthy" ? "#4edc88" : status === "warning" ? "#ffd93d" : "#ff6b6b";

    return (
        <div className="glass-card" style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            transition: "transform 0.2s ease, border-color 0.2s ease",
            cursor: "pointer",
            border: `1px solid rgba(255, 255, 255, 0.05)`,
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Background Glow */}
            <div style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                width: "100px",
                height: "100px",
                background: statusColor,
                filter: "blur(60px)",
                opacity: 0.1,
                zIndex: 0
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: statusColor
                    }}>
                        {icon}
                    </div>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>{name}</h3>
                            <span style={{
                                fontSize: "10px",
                                padding: "2px 8px",
                                borderRadius: "10px",
                                background: "rgba(255,255,255,0.1)",
                                color: "rgba(255,255,255,0.6)",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                            }}>{priority}</span>
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{mission}</p>
                    </div>
                </div>
                <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: statusColor,
                    boxShadow: `0 0 10px ${statusColor}`
                }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", position: "relative", zIndex: 1 }}>
                {metrics.map((m, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px" }}>
                        <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{m.label}</p>
                        <p style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 700 }}>
                            {m.value}{m.unit}
                        </p>
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", gap: "4px" }}>
                    {agents.map((a, i) => (
                        <div key={i} title={a} style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: 600,
                            color: "rgba(255,255,255,0.8)"
                        }}>
                            {a[0]}
                        </div>
                    ))}
                </div>
                <button style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.4)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    cursor: "pointer"
                }}>
                    Details <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

export function BusinessUnitsHub() {
    const BU_DATA: BUCardProps[] = [
        {
            id: "bu1",
            name: "BU1: Profile Factory",
            mission: "Niche discovery & organic growth",
            priority: "Priority 1",
            status: "healthy" as const,
            agents: ["Gary", "Vanessa", "Eugene", "Paulo"],
            metrics: [
                { label: "Active Profiles", value: 4 },
                { label: "Followers Gained", value: "+124", unit: "" }
            ],
            icon: <Users size={20} />
        },
        {
            id: "bu2",
            name: "BU2: Infoproduct Lab",
            mission: "Weekly product creation & sales",
            priority: "Priority 2",
            status: "warning" as const,
            agents: ["Hormozi", "Russell", "Eugene"],
            metrics: [
                { label: "Current Launch", value: "E-book V1" },
                { label: "CTR", value: "3.2", unit: "%" }
            ],
            icon: <ShoppingBag size={20} />
        },
        {
            id: "bu3",
            name: "BU3: Expert Launch Pad",
            mission: "Expert scouting & big launches",
            priority: "Priority 3",
            status: "healthy" as const,
            agents: ["Kennedy", "Russell", "Sugarman"],
            metrics: [
                { label: "Active Experts", value: 2 },
                { label: "Funnels Ready", value: 3 }
            ],
            icon: <Rocket size={20} />
        },
        {
            id: "bu4",
            name: "BU4: Traffic Command",
            mission: "Unified ROAS & CPA management",
            priority: "Priority 4",
            status: "healthy" as const,
            agents: ["Midas", "Dash", "Nova", "Track"],
            metrics: [
                { label: "Avg ROAS", value: "3.5", unit: "x" },
                { label: "Active Budget", value: 450, unit: " USD" }
            ],
            icon: <Target size={20} />
        }
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Business Units Hub</h2>
                    <p style={{ color: "rgba(255,255,255,0.5)", margin: "8px 0 0" }}>High-level vision of the 4 autonomous machines.</p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                    <div className="glass-card" style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                        <Activity size={14} color="#4edc88" />
                        <span>System Healthy</span>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "24px" }}>
                {BU_DATA.map(bu => (
                    <BUCard key={bu.id} {...bu} />
                ))}
            </div>

            <div style={{ marginTop: "16px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <BarChart3 size={20} /> Sinergy Telemetry
                </h3>
                <div className="glass-card" style={{ padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
                    <TrendingUp size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
                    <p>Consolidating real-time data from all BU pipelines...</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: "20px", background: "rgba(255,107,107,0.05)", border: "1px solid rgba(255,107,107,0.1)", display: "flex", gap: "16px", alignItems: "center" }}>
                <AlertCircle color="#ff6b6b" />
                <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
                    <strong>Attention Needed:</strong> BU2 (Infoproduct Lab) reports a drop in CTR on Landing Page V1. Eugene has been notified to #audit.
                </p>
            </div>

            <style jsx>{`
        .glass-card:hover {
          border-color: rgba(255, 255, 255, 0.1) !important;
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
        </div>
    );
}
