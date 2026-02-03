"use client";

import React, { useState, useEffect } from "react";

type Receipt = {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    status: "verified" | "warning" | "error";
    signature: string;
};

export default function SecurityDashboard() {
    const [receipts, setReceipts] = useState<Receipt[]>([
        {
            id: "rcpt-5521",
            timestamp: new Date().toISOString(),
            action: "exec: igaming-video.js",
            actor: "Alex (Automator)",
            status: "verified",
            signature: "0x7f3a...8e2b"
        },
        {
            id: "rcpt-5520",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            action: "read: .env.local",
            actor: "Clawdbot",
            status: "warning",
            signature: "0x1a2b...c3d4"
        }
    ]);

    return (
        <div style={{ padding: "0" }}>
            {/* Policy Status Banner */}
            <div style={{
                background: "rgba(78, 220, 136, 0.05)",
                border: "1px solid rgba(78, 220, 136, 0.2)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#4edc88" }}>
                        🛡️ Governança ClawdStrike Ativa
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.7 }}>
                        Políticas de Egress e Filesystem aplicadas. Todos os recibos estão sendo assinados.
                    </p>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", opacity: 0.5, textTransform: "uppercase" }}>Uptime de Segurança</div>
                    <div style={{ fontSize: "20px", fontWeight: 800 }}>100%</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
                {/* Left Column: Policy Overview */}
                <div>
                    <section className="glass-card" style={{ padding: "20px", marginBottom: "20px" }}>
                        <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: 700 }}>Políticas de Rede</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {["github.com", "google.ai", "supabase.co"].map(domain => (
                                <div key={domain} style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "12px",
                                    padding: "8px",
                                    background: "rgba(255,255,255,0.03)",
                                    borderRadius: "6px"
                                }}>
                                    <span>{domain}</span>
                                    <span style={{ color: "#4edc88" }}>Permitido</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="glass-card" style={{ padding: "20px" }}>
                        <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: 700 }}>Proteção de Arquivos</h4>
                        <div style={{ fontSize: "12px", opacity: 0.7, lineHeight: "1.6" }}>
                            🚫 .env (Restrito)<br />
                            🚫 ~/.ssh/* (Restrito)<br />
                            🚫 C:/Windows/* (Restrito)<br />
                            ✅ project/src/* (Livre)
                        </div>
                    </section>
                </div>

                {/* Right Column: Signed Receipts */}
                <div>
                    <section className="glass-card" style={{ padding: "20px", minHeight: "400px" }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "20px"
                        }}>
                            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>📜 Recibos Assinados (Audit Log)</h4>
                            <button style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "none",
                                borderRadius: "6px",
                                padding: "4px 10px",
                                fontSize: "11px",
                                color: "#888",
                                cursor: "pointer"
                            }}>Exportar Logs</button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {receipts.map(r => (
                                <div key={r.id} style={{
                                    padding: "12px 16px",
                                    background: "rgba(255,255,255,0.02)",
                                    border: "1px solid rgba(255,255,255,0.05)",
                                    borderRadius: "10px"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                        <span style={{ fontWeight: 700, fontSize: "13px" }}>{r.action}</span>
                                        <span style={{
                                            fontSize: "10px",
                                            padding: "2px 8px",
                                            borderRadius: "100px",
                                            background: r.status === "verified" ? "rgba(78, 220, 136, 0.1)" : "rgba(255, 217, 61, 0.1)",
                                            color: r.status === "verified" ? "#4edc88" : "#ffd93d"
                                        }}>
                                            {r.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", opacity: 0.5 }}>
                                        <span>{r.actor}</span>
                                        <span>{new Date(r.timestamp).toLocaleString()}</span>
                                    </div>
                                    <div style={{
                                        marginTop: "8px",
                                        fontSize: "10px",
                                        fontFamily: "monospace",
                                        opacity: 0.3,
                                        background: "rgba(0,0,0,0.2)",
                                        padding: "4px",
                                        borderRadius: "4px"
                                    }}>
                                        Signature: {r.signature}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
