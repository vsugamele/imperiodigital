"use client";

import React from "react";

export function OperacionalTab() {
    return (
        <div style={{ padding: "24px", color: "#fff" }}>
            <h2 style={{ margin: "0 0 24px", fontSize: "22px" }}>⚙️ Fluxo Operacional Inteligente</h2>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                {/* Pipeline de Processos */}
                <div className="glass-card" style={{ padding: "24px" }}>
                    <h3 style={{ margin: "0 0 20px", fontSize: "16px" }}>🔥 Processos em Execução</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {[
                            { name: "Lançamento iGaming v4", stage: "Edição de Criativos", progress: 65, worker: "Alex" },
                            { name: "Funil Religião Diário", stage: "Scripting Gemini", progress: 90, worker: "Imperius" },
                            { name: "Vanessa Content Blitz", stage: "Captura de Vídeo", progress: 20, worker: "Human/AI Hybrid" },
                            { name: "Audit de Metas Semanais", stage: "Analysis", progress: 100, worker: "Imperius" }
                        ].map(proc => (
                            <div key={proc.name} style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                    <span style={{ fontWeight: 700 }}>{proc.name}</span>
                                    <span style={{ fontSize: "11px", opacity: 0.6 }}>Responsável: {proc.worker}</span>
                                </div>
                                <div style={{ fontSize: "13px", color: "#6366f1", marginBottom: "8px" }}>{proc.stage}</div>
                                <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                                    <div style={{ width: `${proc.progress}%`, height: "100%", background: "linear-gradient(90deg, #6366f1, #a855f7)", borderRadius: "3px" }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Gargalos e Insights */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className="glass-card" style={{ padding: "24px", borderLeft: "4px solid #f59e0b" }}>
                        <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#f59e0b" }}>⚠️ Alerta de Gargalo</h3>
                        <p style={{ fontSize: "13px", opacity: 0.8 }}>
                            A etapa de **Edição de Vídeo** na vertical iGaming está operando com latência acima do esperado (4.2h vs 2.0h).
                        </p>
                        <button style={{
                            marginTop: "12px",
                            width: "100%",
                            padding: "8px",
                            background: "rgba(245, 158, 11, 0.2)",
                            border: "1px solid #f59e0b",
                            color: "#fff",
                            borderRadius: "6px",
                            cursor: "pointer"
                        }}>Otimizar Fluxo</button>
                    </div>

                    <div className="glass-card" style={{ padding: "24px", borderLeft: "4px solid #22c55e" }}>
                        <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#22c55e" }}>💡 Insight de Processo</h3>
                        <p style={{ fontSize: "13px", opacity: 0.8 }}>
                            Injetar o framework **"4 Níveis do Criativo"** no Alex reduziu o tempo de revisão em 45%.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
