"use client";

import React from "react";

export function FinanceiroTab() {
    return (
        <div style={{ padding: "24px", color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 900 }}>💰 Gestão Financeira & ROI</h2>
                <div style={{ background: "rgba(34, 197, 94, 0.1)", padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(34, 197, 94, 0.3)" }}>
                    <div style={{ fontSize: "12px", opacity: 0.7, textTransform: "uppercase" }}>Lucro Líquido Estimado (Mês)</div>
                    <div style={{ fontSize: "24px", fontWeight: 900, color: "#4ade80" }}>R$ 42.580,00</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
                {[
                    { label: "Custo IA (API)", value: "R$ 1.250", color: "#f87171", icon: "🤖" },
                    { label: "Tráfego Pago", value: "R$ 15.000", color: "#6366f1", icon: "📈" },
                    { label: "Receita Bruta", value: "R$ 58.830", color: "#4ade80", icon: "💵" },
                    { label: "ROI Médio", value: "3.9x", color: "#fbbf24", icon: "🎯" }
                ].map(stat => (
                    <div key={stat.label} className="glass-card" style={{ padding: "20px", textAlign: "center" }}>
                        <div style={{ fontSize: "24px", marginBottom: "8px" }}>{stat.icon}</div>
                        <div style={{ fontSize: "11px", opacity: 0.6, marginBottom: "4px" }}>{stat.label}</div>
                        <div style={{ fontSize: "20px", fontWeight: 900, color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Performance por Vertical */}
            <div className="glass-card" style={{ padding: "24px" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "18px" }}>📊 Lucratividade por Vertical</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {[
                        { vertical: "iGaming", revenue: 25000, cost: 5000, roi: "5.0x" },
                        { vertical: "Religião/Espiritual", revenue: 12000, cost: 2000, roi: "6.0x" },
                        { vertical: "Vanessa (Expert)", revenue: 15000, cost: 8000, roi: "1.8x" },
                        { vertical: "Lançamentos (Hub)", revenue: 6830, cost: 2500, roi: "2.7x" }
                    ].map(v => (
                        <div key={v.vertical} style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                <span style={{ fontWeight: 800, fontSize: "16px" }}>{v.vertical}</span>
                                <span style={{ background: "rgba(34, 197, 94, 0.2)", color: "#4ade80", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>
                                    ROI: {v.roi}
                                </span>
                            </div>
                            <div style={{ display: "flex", gap: "24px" }}>
                                <div>
                                    <div style={{ fontSize: "10px", opacity: 0.5 }}>RECEITA</div>
                                    <div style={{ fontSize: "14px", fontWeight: 700 }}>R$ {v.revenue.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "10px", opacity: 0.5 }}>CUSTO</div>
                                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#f87171" }}>R$ {v.cost.toLocaleString()}</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "10px", opacity: 0.5, marginBottom: "4px" }}>DISTRIBUIÇÃO DE MARGEM</div>
                                    <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden", display: "flex" }}>
                                        <div style={{ width: `${(v.revenue - v.cost) / v.revenue * 100}%`, height: "100%", background: "#4ade80" }}></div>
                                        <div style={{ width: `${v.cost / v.revenue * 100}%`, height: "100%", background: "#f87171" }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
