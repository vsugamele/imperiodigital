"use client";

import React from "react";

export function MapaTab() {
    const nodes = [
        { id: "igaming", label: "iGaming", type: "vertical", x: "20%", y: "40%" },
        { id: "religiao", label: "Religião", type: "vertical", x: "20%", y: "60%" },
        { id: "vanessa", label: "Vanessa", type: "vertical", x: "50%", y: "20%" },
        { id: "lancamentos", label: "Lançamentos", type: "vertical", x: "80%", y: "50%" },

        { id: "alex", label: "Alex Worker", type: "worker", x: "40%", y: "50%" },
        { id: "imperius", label: "Imperius CEO", type: "ai", x: "60%", y: "50%" },

        { id: "mentes", label: "Mentes Hub", type: "data", x: "50%", y: "80%" }
    ];

    return (
        <div style={{ padding: "24px", height: "calc(100vh - 200px)", position: "relative" }}>
            <div className="glass-card" style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "rgba(0,0,0,0.4)" }}>
                <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between" }}>
                    <h3 style={{ margin: 0 }}>🗺️ Mapa de Ecossistema Inteligente</h3>
                    <div style={{ fontSize: "12px", opacity: 0.6 }}>Conexões em tempo real ativas</div>
                </div>

                <div style={{ position: "relative", width: "100%", height: "calc(100% - 60px)" }}>
                    {/* Linhas de conexão (SVG seria melhor, mas usando CSS simples por agora para evitar complexidade de libs) */}
                    <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                        <line x1="20%" y1="40%" x2="40%" y2="50%" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="2" strokeDasharray="5,5" />
                        <line x1="20%" y1="60%" x2="40%" y2="50%" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="2" strokeDasharray="5,5" />
                        <line x1="50%" y1="20%" x2="60%" y2="50%" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="2" strokeDasharray="5,5" />
                        <line x1="80%" y1="50%" x2="60%" y2="50%" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="2" strokeDasharray="5,5" />
                        <line x1="40%" y1="50%" x2="60%" y2="50%" stroke="rgba(34, 197, 94, 0.5)" strokeWidth="3" />
                        <line x1="50%" y1="80%" x2="40%" y2="50%" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                        <line x1="50%" y1="80%" x2="60%" y2="50%" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                    </svg>

                    {nodes.map(node => (
                        <div key={node.id} style={{
                            position: "absolute",
                            left: node.x,
                            top: node.y,
                            transform: "translate(-50%, -50%)",
                            background: node.type === "vertical" ? "rgba(99, 102, 241, 0.2)" :
                                node.type === "worker" ? "rgba(34, 197, 94, 0.2)" :
                                    node.type === "ai" ? "rgba(236, 72, 153, 0.2)" : "rgba(255,255,255,0.1)",
                            border: `1px solid ${node.type === "vertical" ? "#6366f1" :
                                    node.type === "worker" ? "#22c55e" :
                                        node.type === "ai" ? "#ec4899" : "rgba(255,255,255,0.3)"
                                }`,
                            padding: "12px 20px",
                            borderRadius: "12px",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                            textAlign: "center",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            zIndex: 10
                        }}>
                            <div style={{ fontSize: "10px", opacity: 0.5, textTransform: "uppercase", marginBottom: "4px" }}>{node.type}</div>
                            <div style={{ fontWeight: 800, fontSize: "14px" }}>{node.label}</div>
                        </div>
                    ))}
                </div>

                {/* Legenda */}
                <div style={{ position: "absolute", bottom: "20px", right: "20px", background: "rgba(0,0,0,0.6)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <div style={{ width: "10px", height: "10px", background: "#6366f1", borderRadius: "2px" }}></div>
                        <span style={{ fontSize: "11px" }}>Verticais de Negócio</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <div style={{ width: "10px", height: "10px", background: "#22c55e", borderRadius: "2px" }}></div>
                        <span style={{ fontSize: "11px" }}>Execução (Workers)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "10px", height: "10px", background: "#ec4899", borderRadius: "2px" }}></div>
                        <span style={{ fontSize: "11px" }}>Estratégia (AI CEO)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
