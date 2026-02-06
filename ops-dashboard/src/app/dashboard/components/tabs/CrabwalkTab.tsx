/**
 * CrabwalkTab Component
 * =====================
 * 
 * Wrapper para o Crabwalk Monitor (localhost:3002).
 */

"use client";

import React from "react";

export function CrabwalkTab() {
    return (
        <div style={{ height: "calc(100vh - 200px)", borderRadius: "16px", overflow: "hidden" }}>
            {/* Header */}
            <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(0,0,0,0.3)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "24px" }}>🦀</span>
                    <div>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Crabwalk Monitor</h3>
                        <p style={{ margin: 0, fontSize: "11px", opacity: 0.6 }}>OpenClaw Real-Time Companion</p>
                    </div>
                </div>
                <a
                    href="http://localhost:3002"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.1)",
                        color: "#fff",
                        textDecoration: "none",
                        fontSize: "11px"
                    }}
                >
                    🔗 Abrir em nova aba
                </a>
            </div>

            {/* Content */}
            <iframe
                src="http://localhost:3002"
                style={{
                    width: "100%",
                    height: "calc(100% - 60px)",
                    border: "none",
                    background: "#0a0a0a"
                }}
                title="Crabwalk Monitor"
            />
        </div>
    );
}
