"use client";

import React, { useState, useEffect } from "react";
import MindProfile from "./MindProfile";

export default function SyntheticGallery() {
    const [minds, setMinds] = useState<any[]>([]);
    const [selectedMind, setSelectedMind] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMinds = async () => {
            try {
                const res = await fetch("/api/intel/minds");
                const data = await res.json();
                if (data.ok) setMinds(data.minds);
            } catch (err) {
                console.error("Error fetching minds:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMinds();
    }, []);

    if (selectedMind) {
        return (
            <div>
                <button
                    onClick={() => setSelectedMind(null)}
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        marginBottom: "24px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 700
                    }}
                >
                    ← Voltar para Galeria
                </button>
                <MindProfile mind={selectedMind} />
            </div>
        );
    }

    return (
        <div style={{ padding: "16px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 900 }}>🧠 Mentes Sintéticas</h2>
                    <p style={{ margin: "4px 0 0", opacity: 0.5, fontSize: "14px" }}>Cognitive Core / Squad de Especialistas</p>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "80px", opacity: 0.5 }}>Carregando mentes...</div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                    {minds.map(mind => (
                        <div
                            key={mind.id}
                            className="glass-card"
                            onClick={() => setSelectedMind(mind)}
                            style={{
                                padding: "24px",
                                cursor: "pointer",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                border: "1px solid rgba(255,255,255,0.05)"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-5px)";
                                e.currentTarget.style.borderColor = "var(--accent)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                            }}
                        >
                            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
                                <div style={{ width: "60px", height: "60px", borderRadius: "16px", overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
                                    <img
                                        src={mind.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mind.name}`}
                                        alt={mind.name}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>{mind.name}</h3>
                                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--accent)", fontWeight: 700 }}>{mind.role}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "6px" }}>
                                    <span style={{ opacity: 0.5 }}>APEX POTENTIAL</span>
                                    <span style={{ fontWeight: 800 }}>{mind.apex_score}/10</span>
                                </div>
                                <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                                    <div style={{ width: `${mind.apex_score * 10}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), #38bdf8)", borderRadius: "2px" }} />
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontSize: "10px", opacity: 0.4 }}>{mind.neural_data_files} SENSORY FILES</div>
                                <div style={{ fontSize: "11px", fontWeight: 700, opacity: 0.6 }}>DNA: {mind.dna?.mbti?.type || "N/A"}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
