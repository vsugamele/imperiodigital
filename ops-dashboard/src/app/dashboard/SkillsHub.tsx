"use client";

import React, { useState, useEffect } from "react";

type Skill = {
    name: string;
    description?: string;
    author: string;
    installed: boolean;
    category: string;
    icon: string;
    updatedAtMs?: number;
};

export default function SkillsHub() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [installing, setInstalling] = useState<string | null>(null);

    const fetchSkills = async () => {
        try {
            const res = await fetch("/api/skills");
            if (res.ok) {
                const data = await res.json();
                const all = [...data.installed, ...data.available];
                setSkills(all);
            }
        } catch (e) {
            console.error("Failed to fetch skills", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const handleInstall = async (name: string) => {
        setInstalling(name);
        try {
            const res = await fetch("/api/skills", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "install", skillName: name })
            });
            if (res.ok) {
                // Refresh skills
                fetchSkills();
            }
        } finally {
            setInstalling(null);
        }
    };

    const filtered = skills.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.description?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || (filter === "installed" && s.installed) || (filter === "available" && !s.installed);
        return matchesSearch && matchesFilter;
    });

    return (
        <section className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "var(--accent)" }}>🧩</span> Skills Hub
                    </h3>
                    <p style={{ fontSize: "11px", opacity: 0.5, marginTop: "4px" }}>
                        Gerencie as habilidades e integrações do Alex.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <input
                        type="text"
                        placeholder="Buscar skills..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            background: "rgba(0,0,0,0.2)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#fff",
                            fontSize: "12px",
                            outline: "none"
                        }}
                    />
                </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                {[
                    { id: "all", label: "Tudo" },
                    { id: "installed", label: "Instalados" },
                    { id: "available", label: "ClawHub" }
                ].map(b => (
                    <button
                        key={b.id}
                        onClick={() => setFilter(b.id)}
                        style={{
                            padding: "6px 14px",
                            borderRadius: "8px",
                            border: "none",
                            background: filter === b.id ? "rgba(78, 220, 136, 0.2)" : "rgba(255,255,255,0.05)",
                            color: filter === b.id ? "#4edc88" : "#fff",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer"
                        }}
                    >
                        {b.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px", opacity: 0.5 }}>Carregando hub...</div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "16px"
                }}>
                    {filtered.map(skill => (
                        <div key={skill.name} style={{
                            background: "rgba(255,255,255,0.03)",
                            borderRadius: "12px",
                            padding: "16px",
                            border: "1px solid rgba(255,255,255,0.05)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                    <div style={{ fontSize: "24px" }}>{skill.icon}</div>
                                    <span style={{
                                        fontSize: "9px",
                                        padding: "2px 8px",
                                        borderRadius: "100px",
                                        background: skill.installed ? "rgba(78, 220, 136, 0.1)" : "rgba(167, 139, 250, 0.1)",
                                        color: skill.installed ? "#4edc88" : "#a78bfa",
                                        fontWeight: 700
                                    }}>
                                        {skill.installed ? "INSTALADO" : "CLAWHUB"}
                                    </span>
                                </div>
                                <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: 700 }}>{skill.name}</h4>
                                <p style={{ margin: 0, fontSize: "11px", opacity: 0.6, lineHeight: "1.5" }}>
                                    {skill.description || "Nenhuma descrição disponível."}
                                </p>
                            </div>

                            <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "10px", opacity: 0.4 }}>por {skill.author}</span>
                                {!skill.installed && (
                                    <button
                                        onClick={() => handleInstall(skill.name)}
                                        disabled={!!installing}
                                        style={{
                                            padding: "6px 12px",
                                            borderRadius: "6px",
                                            border: "none",
                                            background: "var(--accent)",
                                            color: "#0a0a0a",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            cursor: installing ? "wait" : "pointer"
                                        }}
                                    >
                                        {installing === skill.name ? "Instalando..." : "Instalar"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
