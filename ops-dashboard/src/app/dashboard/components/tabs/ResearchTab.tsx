/**
 * ResearchTab Component
 * =====================
 * 
 * Wrapper para o YouTube Research Hub.
 * Usa iframe para carregar a página de pesquisa.
 */

"use client";

import React from "react";

export function ResearchTab() {
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
                    <span style={{ fontSize: "24px" }}>🔍</span>
                    <div>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>YouTube Research Hub</h3>
                        <p style={{ margin: 0, fontSize: "11px", opacity: 0.6 }}>Analise comentários e identifique oportunidades</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <iframe
                src="/dashboard?tab=research-hub"
                style={{
                    width: "100%",
                    height: "calc(100% - 60px)",
                    border: "none",
                    background: "#0a0a0a"
                }}
                title="Research Hub"
            />
        </div>
    );
}
