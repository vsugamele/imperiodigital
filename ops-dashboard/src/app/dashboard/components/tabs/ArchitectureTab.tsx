/**
 * ArchitectureTab Component
 * =========================
 * 
 * Tab que exibe o diagrama visual da arquitetura do sistema.
 * Mostra os componentes principais e o fluxo de dados.
 */

"use client";

import React from "react";

interface ArchComponent {
    name: string;
    desc: string;
    color: string;
    icon: string;
}

const COMPONENTS: ArchComponent[] = [
    { name: "CLAWDBOT", desc: "Main Agent", color: "#4edc88", icon: "🤖" },
    { name: "UPLOAD-POST", desc: "Scheduler API", color: "#ffd93d", icon: "📡" },
    { name: "SUPABASE", desc: "Database", color: "#a78bfa", icon: "🗄️" },
    { name: "DRIVE", desc: "Storage", color: "#38bdf8", icon: "☁️" },
];

const FLOW_STEPS = [
    { label: "📸 Imagens", color: "rgba(78, 220, 136, 0.1)" },
    { label: "🎨 Gemini", color: "rgba(255, 217, 61, 0.1)" },
    { label: "🎬 FFmpeg", color: "rgba(167, 139, 250, 0.1)" },
    { label: "☁️ Drive", color: "rgba(56, 189, 248, 0.1)" },
    { label: "📅 Upload-Post", color: "rgba(255, 107, 107, 0.1)" },
];

export function ArchitectureTab() {
    return (
        <div className="glass-card" style={{ padding: "40px", borderRadius: "16px" }}>
            <h3 style={{ margin: "0 0 30px 0", fontSize: "20px", fontWeight: 800 }}>
                🏗️ Arquitetura do Sistema
            </h3>

            {/* Components Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "20px",
                marginBottom: "40px"
            }}>
                {COMPONENTS.map(comp => (
                    <ComponentCard key={comp.name} component={comp} />
                ))}
            </div>

            {/* Flow Diagram */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                flexWrap: "wrap"
            }}>
                {FLOW_STEPS.map((step, i) => (
                    <React.Fragment key={step.label}>
                        <span style={{
                            padding: "8px 16px",
                            background: step.color,
                            borderRadius: "8px"
                        }}>
                            {step.label}
                        </span>
                        {i < FLOW_STEPS.length - 1 && <span>→</span>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

function ComponentCard({ component }: { component: ArchComponent }) {
    return (
        <div style={{
            padding: "20px",
            borderRadius: "12px",
            background: `${component.color}11`,
            border: `1px solid ${component.color}44`,
            textAlign: "center"
        }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                {component.icon}
            </div>
            <div style={{ fontWeight: 700 }}>{component.name}</div>
            <div style={{ fontSize: "12px", opacity: 0.6 }}>{component.desc}</div>
        </div>
    );
}
