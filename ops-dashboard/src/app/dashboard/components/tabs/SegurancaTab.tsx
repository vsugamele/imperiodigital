"use client";

import React from "react";

export function SegurancaTab() {
    return (
        <div style={{ padding: "24px", color: "#fff" }}>
            <div style={{
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "12px"
            }}>
                <span style={{ fontSize: "24px" }}>🛡️</span>
                <div>
                    <h2 style={{ margin: 0, fontSize: "18px", color: "#4ade80" }}>Governança ClawdStrike Ativa</h2>
                    <p style={{ margin: 0, fontSize: "12px", opacity: 0.7 }}>Políticas de Egress e Filesystem aplicadas. Todos os recibos estão sendo assinados.</p>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontSize: "10px", opacity: 0.5, textTransform: "uppercase" }}>Uptime de Segurança</div>
                    <div style={{ fontSize: "20px", fontWeight: 900, color: "#4ade80" }}>100%</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Políticas de Rede */}
                <div className="glass-card" style={{ padding: "24px" }}>
                    <h3 style={{ margin: "0 0 20px", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        🌐 Políticas de Rede
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[
                            { site: "github.com", status: "Permitido" },
                            { site: "google.ai", status: "Permitido" },
                            { site: "supabase.co", status: "Permitido" },
                            { site: "hotmart.com", status: "Monitorado" },
                            { site: "kiwify.com.br", status: "Monitorado" }
                        ].map(item => (
                            <div key={item.site} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "8px 0",
                                borderBottom: "1px solid rgba(255,255,255,0.05)"
                            }}>
                                <span style={{ opacity: 0.8 }}>{item.site}</span>
                                <span style={{
                                    fontSize: "10px",
                                    background: item.status === "Permitido" ? "rgba(34, 197, 94, 0.2)" : "rgba(234, 179, 8, 0.2)",
                                    color: item.status === "Permitido" ? "#4ade80" : "#fbbf24",
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    textTransform: "uppercase",
                                    fontWeight: 700
                                }}>{item.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Proteção de Arquivos */}
                <div className="glass-card" style={{ padding: "24px" }}>
                    <h3 style={{ margin: "0 0 20px", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        🔐 Proteção de Arquivos
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[
                            { file: ".env (Restrito)", status: "Protegido" },
                            { file: "~/.ssh/* (Restrito)", status: "Protegido" },
                            { file: "C:/Windows/* (Restrito)", status: "Protegido" },
                            { file: "project/src/* (User)", status: "Livre" }
                        ].map(item => (
                            <div key={item.file} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "8px 0",
                                borderBottom: "1px solid rgba(255,255,255,0.05)"
                            }}>
                                <span style={{ opacity: 0.8 }}>{item.file}</span>
                                <span style={{ color: item.status === "Protegido" ? "#4ade80" : "#6366f1" }}>
                                    {item.status === "Protegido" ? "✅" : "🔓"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Audit Log */}
            <div className="glass-card" style={{ marginTop: "24px", padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px" }}>📜 Recibos Assinados (Audit Log)</h3>
                    <button style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        cursor: "pointer"
                    }}>Exportar Logs</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                        { action: "exec: igaming-video.js", actor: "Alex (Automator)", time: "06/02/2026, 14:52:30", type: "VERIFIED" },
                        { action: "read: .env.local", actor: "ClawdBot", time: "06/02/2026, 13:25:00", type: "WARNING" },
                        { action: "write: verticals.json", actor: "Imperius (CEO)", time: "06/02/2026, 12:10:15", type: "VERIFIED" }
                    ].map((log, i) => (
                        <div key={i} style={{
                            background: "rgba(0,0,0,0.2)",
                            padding: "16px",
                            borderRadius: "8px",
                            borderLeft: `4px solid ${log.type === "VERIFIED" ? "#4ade80" : "#f87171"}`
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                <span style={{ fontWeight: 800 }}>{log.action}</span>
                                <span style={{
                                    fontSize: "10px",
                                    color: log.type === "VERIFIED" ? "#4ade80" : "#f87171",
                                    fontWeight: 900
                                }}>{log.type}</span>
                            </div>
                            <div style={{ fontSize: "11px", opacity: 0.6 }}>
                                Ator: {log.actor} • {log.time}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
