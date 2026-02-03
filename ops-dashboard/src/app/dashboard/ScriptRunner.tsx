"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";

type Script = {
    name: string;
    path: string;
    type: "js" | "py" | "ps1" | "other";
    category: string;
    description?: string;
};

type ScriptsData = {
    scripts: Script[];
    total: number;
};

const categoryConfig: Record<string, { color: string; icon: string; label: string }> = {
    igaming: { color: "#ffd93d", icon: "🎰", label: "iGaming" },
    petselect: { color: "#60a5fa", icon: "🐾", label: "PetSelect" },
    vanessa: { color: "#f472b6", icon: "💅", label: "Vanessa" },
    "image-gen": { color: "#fb923c", icon: "🖼️", label: "Imagem" },
    transcribe: { color: "#a855f7", icon: "🎙️", label: "Transcrição" },
    infrastructure: { color: "#4edc88", icon: "⚙️", label: "Infra" },
    other: { color: "#6b7280", icon: "📦", label: "Outros" }
};

const typeIcons: Record<string, string> = {
    js: "🟨",
    py: "🐍",
    ps1: "💠",
    other: "📄"
};

// Skeleton component
const Skeleton = ({ width = "100%", height = "20px" }: { width?: string; height?: string }) => (
    <div className="skeleton" style={{ width, height, minHeight: height }} />
);

export default function ScriptRunner() {
    const [data, setData] = useState<ScriptsData | null>(null);
    const [filter, setFilter] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [runningScript, setRunningScript] = useState<string | null>(null);
    const [runResult, setRunResult] = useState<{ script: string; success: boolean; message: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/scripts", {
                    cache: "force-cache",
                    next: { revalidate: 300 } // Cache for 5 minutes
                });
                if (res.ok) setData(await res.json());
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Memoize filtered scripts
    const { filteredScripts, categories } = useMemo(() => {
        const scripts = data?.scripts || [];
        const cats = [...new Set(scripts.map(s => s.category))].sort();

        let filtered = scripts;
        if (filter !== "all") {
            filtered = filtered.filter(s => s.category === filter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.description?.toLowerCase().includes(q)
            );
        }

        return { filteredScripts: filtered, categories: cats };
    }, [data, filter, search]);

    const runScript = useCallback(async (scriptPath: string, scriptName: string) => {
        setRunningScript(scriptName);
        setRunResult(null);

        try {
            const res = await fetch("/api/run-script", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ script: scriptPath })
            });

            if (res.ok) {
                setRunResult({ script: scriptName, success: true, message: "Iniciado!" });
            } else {
                const err = await res.json();
                setRunResult({ script: scriptName, success: false, message: err.error || "Erro" });
            }
        } catch {
            setRunResult({ script: scriptName, success: false, message: "Falha na conexão" });
        } finally {
            setRunningScript(null);
            setTimeout(() => setRunResult(null), 3000);
        }
    }, []);

    const hasData = filteredScripts.length > 0;

    return (
        <section className="glass-card" style={{ padding: "24px" }}>
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px"
            }}>
                <div>
                    <h3 style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        <span style={{ color: "var(--accent)" }}>🚀</span>
                        Script Runner
                        <span style={{
                            fontSize: "10px",
                            background: "rgba(78, 220, 136, 0.1)",
                            color: "#4edc88",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontWeight: 700
                        }}>
                            {data?.total || 0}
                        </span>
                    </h3>
                </div>

                {/* Search */}
                <input
                    type="text"
                    placeholder="🔍 Buscar..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(0,0,0,0.3)",
                        color: "#fff",
                        fontSize: "12px",
                        width: "200px",
                        outline: "none"
                    }}
                />
            </div>

            {/* Category Filters */}
            <div style={{
                display: "flex",
                gap: "8px",
                marginBottom: "20px",
                flexWrap: "wrap"
            }}>
                <button
                    onClick={() => setFilter("all")}
                    style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "none",
                        background: filter === "all" ? "rgba(78, 220, 136, 0.2)" : "rgba(255,255,255,0.03)",
                        color: filter === "all" ? "#4edc88" : "#fff",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                >
                    Todos
                </button>
                {categories.map(cat => {
                    const config = categoryConfig[cat] || categoryConfig.other;
                    return (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            style={{
                                padding: "6px 14px",
                                borderRadius: "8px",
                                border: "none",
                                background: filter === cat ? `${config.color}20` : "rgba(255,255,255,0.03)",
                                color: filter === cat ? config.color : "#fff",
                                fontSize: "11px",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            {config.icon} {config.label}
                        </button>
                    );
                })}
            </div>

            {/* Toast */}
            {runResult && (
                <div style={{
                    position: "fixed",
                    bottom: "100px",
                    right: "24px",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    background: runResult.success ? "rgba(78, 220, 136, 0.9)" : "rgba(255, 107, 107, 0.9)",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    zIndex: 1000,
                    animation: "slideIn 0.3s ease"
                }}>
                    {runResult.success ? "✅" : "❌"} {runResult.script}: {runResult.message}
                </div>
            )}

            {/* Scripts Grid */}
            {!hasData ? (
                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '10px',
                    padding: '24px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>🚀</div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>
                        {loading ? "Carregando scripts..." : "Nenhum script encontrado"}
                    </div>
                    <div style={{ fontSize: '10px', opacity: 0.4, marginTop: '4px' }}>
                        Verifique a pasta de scripts
                    </div>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "10px",
                    maxHeight: "360px",
                    overflowY: "auto",
                    paddingRight: "8px"
                }}>
                    {filteredScripts.slice(0, 24).map(script => {
                        const catConfig = categoryConfig[script.category] || categoryConfig.other;
                        const isRunning = runningScript === script.name;

                        return (
                            <div key={script.path} style={{
                                background: "rgba(255,255,255,0.02)",
                                borderRadius: "10px",
                                padding: "12px",
                                borderLeft: `3px solid ${catConfig.color}`,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                transition: "all 0.2s"
                            }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px"
                                    }}>
                                        <span>{typeIcons[script.type] || "📄"}</span>
                                        <span style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}>
                                            {script.name.replace(/\.[^.]+$/, "")}
                                        </span>
                                    </div>
                                    {script.description && (
                                        <div style={{
                                            fontSize: "10px",
                                            opacity: 0.5,
                                            marginTop: "4px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}>
                                            {script.description}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => runScript(script.path, script.name)}
                                    disabled={isRunning}
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "8px",
                                        border: "none",
                                        background: isRunning
                                            ? "rgba(255,255,255,0.1)"
                                            : `${catConfig.color}20`,
                                        color: catConfig.color,
                                        fontSize: "14px",
                                        cursor: isRunning ? "wait" : "pointer",
                                        opacity: isRunning ? 0.5 : 1,
                                        transition: "all 0.2s",
                                        flexShrink: 0
                                    }}
                                >
                                    {isRunning ? "⏳" : "▶"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {filteredScripts.length > 24 && (
                <div style={{
                    textAlign: "center",
                    marginTop: "12px",
                    fontSize: "11px",
                    opacity: 0.5
                }}>
                    Mostrando 24 de {filteredScripts.length} scripts
                </div>
            )}
        </section>
    );
}
