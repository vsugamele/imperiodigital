"use client";

import React, { useState } from "react";

type Mind = {
    id: string;
    name: string;
    avatar_url?: string;
    role: string;
    apex_score: number;
    neural_data_files: number;
    top_skill?: string;
    dna?: {
        mbti?: { type: string; stats?: any };
        enneagram?: { type: string; wing: string; label: string; subtype: string };
        disc?: { D: number; I: number; S: number; C: number; label: string };
        specific_behaviors?: string[];
    };
    proficiencies?: { name: string; level: number }[];
    about?: string;
};

export default function MindProfile({ mind }: { mind: Mind }) {
    const [activeTab, setActiveTab] = useState("dna");

    // Helper for MBTI bars
    const MBTIBar = ({ labelL, labelR, valL, valR, color }: any) => (
        <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 700, marginBottom: "4px", opacity: 0.8 }}>
                <span>{labelL}</span>
                <span>{labelR}</span>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", display: "flex", overflow: "hidden" }}>
                <div style={{ width: `${valL}%`, background: color, opacity: 0.8 }} />
                <div style={{ width: `${valR}%`, background: "rgba(255,255,255,0.1)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginTop: "2px", opacity: 0.5 }}>
                <span>{valL}%</span>
                <span>{valR}%</span>
            </div>
        </div>
    );

    // Helper for DISC bars
    const DISCBar = ({ label, value, color }: any) => (
        <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, marginBottom: "6px" }}>
                <span style={{ opacity: 0.6 }}>{label}</span>
                <span>{value}/100</span>
            </div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: "3px" }} />
            </div>
        </div>
    );

    return (
        <div style={{ color: "#fff", fontFamily: "Inter, sans-serif" }}>
            {/* Header / Banner area inspired by screenshot */}
            <div style={{ display: "flex", gap: "32px", alignItems: "center", marginBottom: "40px" }}>
                <div style={{ position: "relative" }}>
                    <div style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "24px",
                        overflow: "hidden",
                        border: "2px solid rgba(255,255,255,0.1)",
                        background: "linear-gradient(45deg, #1a1a1a, #333)"
                    }}>
                        <img
                            src={mind.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mind.name}`}
                            alt={mind.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </div>
                    <div style={{
                        position: "absolute",
                        bottom: "-10px",
                        right: "-10px",
                        background: "var(--accent)",
                        color: "#000",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: 900
                    }}>
                        ID: {mind.id.slice(0, 5).toUpperCase()}
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: "48px", fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>{mind.name}</h1>
                    <p style={{ fontSize: "18px", opacity: 0.6, margin: "4px 0 0", borderLeft: "2px solid var(--accent)", paddingLeft: "12px" }}>{mind.role}</p>
                    <div style={{ marginTop: "12px", fontSize: "12px", opacity: 0.4, textTransform: "uppercase", letterSpacing: "1px" }}>
                        ✨ [IA PARA AMPLIFICAR A MENTE]
                    </div>
                </div>

                {/* Score Cards */}
                <div style={{ display: "flex", gap: "16px" }}>
                    <div className="glass-card" style={{ padding: "16px 24px", minWidth: "120px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", opacity: 0.5, fontWeight: 700, marginBottom: "4px" }}>APEX SCORE</div>
                        <div style={{ fontSize: "28px", fontWeight: 900 }}>{mind.apex_score.toFixed(1)} <span style={{ fontSize: "12px", opacity: 0.3 }}>/10</span></div>
                    </div>
                    <div className="glass-card" style={{ padding: "16px 24px", minWidth: "120px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", opacity: 0.5, fontWeight: 700, marginBottom: "4px" }}>NEURAL DATA</div>
                        <div style={{ fontSize: "28px", fontWeight: 900 }}>{mind.neural_data_files} <span style={{ fontSize: "12px", opacity: 0.3 }}>files</span></div>
                    </div>
                    <div className="glass-card" style={{ padding: "16px 24px", minWidth: "150px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", opacity: 0.5, fontWeight: 700, marginBottom: "4px" }}>TOP SKILL</div>
                        <div style={{ fontSize: "14px", fontWeight: 900, color: "var(--accent)" }}>{mind.top_skill}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: "32px" }}>
                {["Geral", "DNA", "Comunicação", "História", "Artefatos"].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        style={{
                            padding: "12px 16px",
                            background: "none",
                            border: "none",
                            color: activeTab === tab.toLowerCase() ? "var(--accent)" : "#fff",
                            opacity: activeTab === tab.toLowerCase() ? 1 : 0.4,
                            fontWeight: 700,
                            fontSize: "13px",
                            cursor: "pointer",
                            borderBottom: activeTab === tab.toLowerCase() ? "2px solid var(--accent)" : "none",
                            transition: "all 0.2s"
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* DNA Tab View - Based on User Screenshot */}
            {activeTab === "dna" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                    {/* MBTI Column */}
                    <div className="glass-card" style={{ padding: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <div style={{ fontSize: "10px", opacity: 0.5, fontWeight: 800 }}>MYERS-BRIGGS</div>
                            <div style={{ padding: "4px 12px", background: "rgba(78,220,136,0.1)", borderRadius: "20px", fontSize: "12px", fontWeight: 900, color: "var(--accent)" }}>
                                {mind.dna?.mbti?.type || "N/A"}
                            </div>
                        </div>
                        <h3 style={{ fontSize: "20px", margin: "0 0 20px" }}>{mind.dna?.mbti?.type === 'ISTP' ? 'The Virtuoso' : (mind.dna?.mbti?.type ? 'The Architect' : 'Neural Core')}</h3>

                        {mind.dna?.mbti?.stats ? (
                            <>
                                <MBTIBar labelL="I" labelR="E" valL={mind.dna.mbti.stats.I} valR={mind.dna.mbti.stats.E} color="#a78bfa" />
                                <MBTIBar labelL="S" labelR="N" valL={mind.dna.mbti.stats.S} valR={mind.dna.mbti.stats.N} color="#38bdf8" />
                                <MBTIBar labelL="F" labelR="T" valL={mind.dna.mbti.stats.F} valR={mind.dna.mbti.stats.T} color="#4edc88" />
                                <MBTIBar labelL="P" labelR="J" valL={mind.dna.mbti.stats.P} valR={mind.dna.mbti.stats.J} color="#fb923c" />
                            </>
                        ) : (
                            <div style={{ opacity: 0.3, fontSize: '11px' }}>Calibration required...</div>
                        )}
                    </div>

                    {/* Enneagram Column */}
                    <div className="glass-card" style={{ padding: "24px" }}>
                        <div style={{ fontSize: "10px", opacity: 0.5, fontWeight: 800, marginBottom: "20px" }}>ENNEAGRAM</div>
                        {mind.dna?.enneagram ? (
                            <>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>❤️</div>
                                    <div>
                                        <div style={{ fontSize: "16px", fontWeight: 800 }}>Tipo {mind.dna.enneagram.type}w{mind.dna.enneagram.wing}</div>
                                        <div style={{ fontSize: "11px", color: "var(--accent)" }}>{mind.dna.enneagram.subtype}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "20px" }}>🔍 {mind.dna.enneagram.label}</div>
                            </>
                        ) : (
                            <div style={{ opacity: 0.3, fontSize: '11px' }}>Damping field active...</div>
                        )}

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div style={{ background: "rgba(255, 107, 107, 0.05)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,107,107,0.1)" }}>
                                <div style={{ fontSize: "9px", color: "#ff6b6b", fontWeight: 900, marginBottom: "4px" }}>MEDO</div>
                                <div style={{ fontSize: "11px", opacity: 0.7 }}>Perda de autonomia intelectual.</div>
                            </div>
                            <div style={{ background: "rgba(78, 220, 136, 0.05)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(78,220,136,0.1)" }}>
                                <div style={{ fontSize: "9px", color: "var(--accent)", fontWeight: 900, marginBottom: "4px" }}>DESEJO</div>
                                <div style={{ fontSize: "11px", opacity: 0.7 }}>Dominar a realidade através do entendimento.</div>
                            </div>
                        </div>
                    </div>

                    {/* DISC Column */}
                    <div className="glass-card" style={{ padding: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <div style={{ fontSize: "10px", opacity: 0.5, fontWeight: 800 }}>DISC</div>
                            <div style={{ padding: "4px 12px", background: "rgba(56,189,248,0.1)", borderRadius: "20px", fontSize: "12px", fontWeight: 900, color: "#38bdf8" }}>
                                {mind.dna?.disc ?
                                    Object.entries(mind.dna.disc).filter(([k]) => k.length === 1).sort((a, b) => (b[1] as number) - (a[1] as number)).map(x => x[0]).join('')
                                    : "N/A"
                                }
                            </div>
                        </div>

                        {mind.dna?.disc ? (
                            <>
                                <DISCBar label="D - DOMINÂNCIA" value={mind.dna.disc.D} color="#ff6b6b" />
                                <DISCBar label="I - INFLUÊNCIA" value={mind.dna.disc.I} color="#ffd93d" />
                                <DISCBar label="S - ESTABILIDADE" value={mind.dna.disc.S} color="#4edc88" />
                                <DISCBar label="C - CONFORMIDADE" value={mind.dna.disc.C} color="#38bdf8" />
                            </>
                        ) : (
                            <div style={{ opacity: 0.3, fontSize: '11px' }}>Analyzing behavior...</div>
                        )}

                        <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ fontSize: "9px", opacity: 0.5, fontWeight: 900, marginBottom: "12px" }}>COMPORTAMENTOS ESPECÍFICOS</div>
                            <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                                {(mind.dna?.specific_behaviors || []).map((text: string, i: number) => (
                                    <li key={i} style={{ fontSize: "11px", opacity: 0.8, marginBottom: "8px", display: "flex", gap: "8px" }}>
                                        <span style={{ color: "var(--accent)" }}>•</span> {text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "geral" && (
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
                    <div className="glass-card" style={{ padding: "32px" }}>
                        <h3 style={{ margin: "0 0 16px" }}>Sobre a Mente</h3>
                        <p style={{ lineHeight: 1.6, opacity: 0.8 }}>{mind.about}</p>
                    </div>
                    <div className="glass-card" style={{ padding: "32px" }}>
                        <h3 style={{ margin: "0 0 24px" }}>Proficiências</h3>
                        {(mind.proficiencies || []).map((p: any, i) => {
                            const name = typeof p === 'string' ? p : p.name;
                            const level = typeof p === 'string' ? 5 : p.level;

                            return (
                                <div key={i} style={{ marginBottom: "20px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                        <span style={{ fontWeight: 700 }}>{name}</span>
                                        <span style={{ fontSize: "12px", color: "var(--accent)" }}>LVL {level}</span>
                                    </div>
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        {[1, 2, 3, 4, 5].map(lvl => (
                                            <div key={lvl} style={{
                                                height: "4px",
                                                flex: 1,
                                                background: lvl <= level ? "var(--accent)" : "rgba(255,255,255,0.1)",
                                                borderRadius: "2px"
                                            }} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
