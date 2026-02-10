/**
 * ArchitectureTab Component
 * =========================
 * 
 * Tab que exibe o diagrama visual da arquitetura do sistema.
 * Agora mostra as MENTES REAIS do ecossistema:
 * - Workers: Alex, Gary, Eugene, Hormozi, Vanessa, Russell, WATCHER
 * - Gurus: Dan Kennedy, Gary Halbert, etc.
 * 
 * LAYOUT:
 * ┌─────────────────────────────────────────────────┐
 * │              🧠 COGNITIVE CORE                  │
 * │   ┌─────────────────────────────────────────┐   │
 * │   │    ALEX (Autopilot & Orchestrator)      │   │
 * │   └─────────────────────────────────────────┘   │
 * │                      ↓                          │
 * │   ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
 * │   │Gary│ │Eug │ │Horm│ │Van │ │Rus │ │WATC│   │
 * │   └────┘ └────┘ └────┘ └────┘ └────┘ └────┘   │
 * │                      ↓                          │
 * │    [INFRA] Supabase ↔ Drive ↔ Upload-Post      │
 * └─────────────────────────────────────────────────┘
 */

"use client";

import React, { useState, useEffect } from "react";

interface Mind {
    id: string;
    name: string;
    role: string;
    apex_score: number;
    type: 'worker' | 'guru';
    top_skill?: string;
}

export function ArchitectureTab() {
    const [minds, setMinds] = useState<Mind[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMinds() {
            try {
                const res = await fetch("/api/intel/minds");
                const data = await res.json();
                if (data.ok) setMinds(data.minds);
            } catch (err) {
                console.error("Error fetching minds:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchMinds();
    }, []);

    const workers = minds.filter(m => m.type === 'worker');
    const gurus = minds.filter(m => m.type === 'guru');
    const alex = workers.find(w => w.name.toLowerCase() === 'alex');
    const otherWorkers = workers.filter(w => w.name.toLowerCase() !== 'alex');

    if (loading) {
        return (
            <div className="glass-card" style={{ padding: "60px", textAlign: "center", borderRadius: "16px" }}>
                <div style={{ fontSize: "32px", marginBottom: "16px" }}>🧠</div>
                <p style={{ opacity: 0.5 }}>Carregando arquitetura...</p>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Title */}
            <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", textAlign: "center" }}>
                <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 900 }}>
                    🧠 <span style={{ color: "var(--accent)" }}>COGNITIVE</span> CORE
                </h2>
                <p style={{ margin: "8px 0 0", opacity: 0.5, fontSize: "14px" }}>
                    Arquitetura de IA do Ecossistema • {workers.length} Workers • {gurus.length} Gurus
                </p>
            </div>

            {/* Alex - Central Orchestrator */}
            {alex && (
                <div className="glass-card" style={{
                    padding: "32px",
                    borderRadius: "16px",
                    border: "2px solid var(--accent)",
                    background: "rgba(78, 220, 136, 0.05)",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🤖</div>
                    <h3 style={{ margin: 0, fontSize: "24px", fontWeight: 900, color: "var(--accent)" }}>
                        {alex.name.toUpperCase()}
                    </h3>
                    <p style={{ margin: "4px 0 12px", fontSize: "14px", opacity: 0.7 }}>
                        {alex.role}
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", gap: "24px", fontSize: "13px" }}>
                        <span>🎯 APEX: {alex.apex_score}/10</span>
                        <span>⚡ {alex.top_skill}</span>
                    </div>
                </div>
            )}

            {/* Arrow Down */}
            <div style={{ textAlign: "center", fontSize: "24px", opacity: 0.3 }}>↓</div>

            {/* Workers Grid */}
            <div>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, opacity: 0.7 }}>
                    🔧 WORKERS ({otherWorkers.length})
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                    {otherWorkers.map(worker => (
                        <WorkerCard key={worker.id} worker={worker} />
                    ))}
                </div>
            </div>

            {/* Arrow Down */}
            <div style={{ textAlign: "center", fontSize: "24px", opacity: 0.3 }}>↓</div>

            {/* Gurus Section */}
            <div>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, opacity: 0.7 }}>
                    📚 GURUS (Conhecimento Base) - {gurus.length}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
                    {gurus.map(guru => (
                        <GuruCard key={guru.id} guru={guru} />
                    ))}
                </div>
            </div>

            {/* Arrow Down */}
            <div style={{ textAlign: "center", fontSize: "24px", opacity: 0.3 }}>↓</div>

            {/* Infrastructure */}
            <div className="glass-card" style={{ padding: "24px", borderRadius: "16px" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, opacity: 0.7 }}>
                    ⚙️ INFRAESTRUTURA
                </h3>
                <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "16px" }}>
                    <InfraItem icon="🗄️" name="Supabase" desc="Database" />
                    <InfraItem icon="☁️" name="Drive" desc="Storage" />
                    <InfraItem icon="📡" name="Upload-Post" desc="Scheduler" />
                    <InfraItem icon="🤖" name="ClawdBot" desc="Gateway" />
                </div>
            </div>

            {/* Data Flow */}
            <div className="glass-card" style={{ padding: "24px", borderRadius: "16px" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, opacity: 0.7 }}>
                    🔄 FLUXO DE DADOS
                </h3>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    flexWrap: "wrap"
                }}>
                    <FlowStep label="📸 Input" />
                    <span style={{ opacity: 0.3 }}>→</span>
                    <FlowStep label="🧠 AI Process" />
                    <span style={{ opacity: 0.3 }}>→</span>
                    <FlowStep label="🎬 Generate" />
                    <span style={{ opacity: 0.3 }}>→</span>
                    <FlowStep label="☁️ Upload" />
                    <span style={{ opacity: 0.3 }}>→</span>
                    <FlowStep label="📅 Schedule" />
                </div>
            </div>
        </div>
    );
}

// ============================================
// Componentes Auxiliares
// ============================================

function WorkerCard({ worker }: { worker: Mind }) {
    const getWorkerEmoji = (name: string) => {
        const emojis: Record<string, string> = {
            'gary': '📊',
            'eugene': '✍️',
            'hormozi': '💰',
            'vanessa': '🎨',
            'russell': '🎯',
            'watcher': '👁️'
        };
        return emojis[name.toLowerCase()] || '🤖';
    };

    return (
        <div className="glass-card" style={{
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            transition: "all 0.2s"
        }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                {getWorkerEmoji(worker.name)}
            </div>
            <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 800 }}>
                {worker.name.toUpperCase()}
            </h4>
            <p style={{ margin: 0, fontSize: "10px", opacity: 0.6 }}>
                {worker.role}
            </p>
            <div style={{
                marginTop: "12px",
                height: "4px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "2px",
                overflow: "hidden"
            }}>
                <div style={{
                    width: `${worker.apex_score * 10}%`,
                    height: "100%",
                    background: "var(--accent)",
                    borderRadius: "2px"
                }} />
            </div>
        </div>
    );
}

function GuruCard({ guru }: { guru: Mind }) {
    return (
        <div style={{
            padding: "12px 16px",
            borderRadius: "8px",
            background: "rgba(167, 139, 250, 0.1)",
            border: "1px solid rgba(167, 139, 250, 0.2)",
            textAlign: "center"
        }}>
            <div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "4px" }}>
                {guru.name}
            </div>
            <div style={{ fontSize: "9px", opacity: 0.6 }}>
                {guru.top_skill || guru.role}
            </div>
        </div>
    );
}

function InfraItem({ icon, name, desc }: { icon: string; name: string; desc: string }) {
    return (
        <div style={{ textAlign: "center", minWidth: "100px" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>{icon}</div>
            <div style={{ fontSize: "13px", fontWeight: 700 }}>{name}</div>
            <div style={{ fontSize: "10px", opacity: 0.5 }}>{desc}</div>
        </div>
    );
}

function FlowStep({ label }: { label: string }) {
    return (
        <div style={{
            padding: "8px 16px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.05)",
            fontSize: "12px",
            fontWeight: 600
        }}>
            {label}
        </div>
    );
}
