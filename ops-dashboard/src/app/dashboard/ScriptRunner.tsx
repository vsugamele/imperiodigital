"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

type Script = {
    name: string;
    path: string;
    type: "js" | "py" | "ps1" | "other";
    category: string;
    description?: string;
};

type ExecutionStatus = {
    status: "idle" | "running" | "completed" | "error";
    executionId: string | null;
    script: string;
    message: string;
    elapsed?: number;
    log?: string;
    logPath?: string;
};

type RunningExec = {
    executionId: string;
    script: string;
    elapsedSeconds: number;
    pid?: number;
};

type RecentLog = {
    executionId: string;
    createdAt: string;
    size: number;
};

const categoryConfig: Record<string, { color: string; icon: string; label: string }> = {
    igaming: { color: "#ffd93d", icon: "🎰", label: "iGaming" },
    petselect: { color: "#60a5fa", icon: "🐾", label: "PetSelect" },
    vanessa: { color: "#f472b6", icon: "💅", label: "Vanessa" },
    "image-gen": { color: "#fb923c", icon: "🖼️", label: "Imagem" },
    transcribe: { color: "#a855f7", icon: "🎙️", label: "Transcrição" },
    infrastructure: { color: "#4edc88", icon: "⚙️", label: "Infra" },
    religion: { color: "#60a5fa", icon: "🙏", label: "Religion" },
    autonomous: { color: "#ec4899", icon: "🤖", label: "Autonomous" },
    high_ticket: { color: "#22c55e", icon: "💰", label: "High Ticket" },
    other: { color: "#6b7280", icon: "📦", label: "Outros" }
};

const typeIcons: Record<string, string> = {
    js: "🟨",
    py: "🐍",
    ps1: "💠",
    other: "📄"
};

export default function ScriptRunner() {
    const [scripts, setScripts] = useState<Script[]>([]);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Execution state
    const [execution, setExecution] = useState<ExecutionStatus>({
        status: "idle",
        executionId: null,
        script: "",
        message: ""
    });
    const [runningExecs, setRunningExecs] = useState<RunningExec[]>([]);
    const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
    const [showLogModal, setShowLogModal] = useState(false);
    const [currentLog, setCurrentLog] = useState("");
    const [currentScript, setCurrentScript] = useState("");
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Load scripts
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/scripts");
                if (res.ok) {
                    const data = await res.json();
                    setScripts(data.scripts || []);
                }
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Poll for running executions
    useEffect(() => {
        const poll = async () => {
            try {
                const res = await fetch("/api/run-script?action=status");
                if (res.ok) {
                    const data = await res.json();
                    setRunningExecs(data.runningExecutions || []);
                    setRecentLogs(data.recent || []);
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
        };

        poll();
        pollingRef.current = setInterval(poll, 3000);
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    // Update execution status
    const updateExecutionStatus = (status: ExecutionStatus["status"], message: string, log?: string) => {
        setExecution(prev => ({ ...prev, status, message, log }));
    };

    const runScript = useCallback(async (scriptPath: string, scriptName: string) => {
        // Start execution
        updateExecutionStatus("running", "Iniciando...", "");
        setShowLogModal(true);

        try {
            const res = await fetch("/api/run-script", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ script: scriptPath })
            });

            if (res.ok) {
                const data = await res.json();
                setExecution({
                    status: "running",
                    executionId: data.executionId,
                    script: scriptName,
                    message: "Executando...",
                    logPath: data.logPath
                });
            } else {
                const err = await res.json();
                updateExecutionStatus("error", err.error || "Erro");
            }
        } catch {
            updateExecutionStatus("error", "Falha na conexão");
        }
    }, []);

    // Load log for viewing
    const viewLog = async (executionId: string, scriptName: string) => {
        try {
            const res = await fetch(`/api/run-script?action=log&executionId=${executionId}`);
            if (res.ok) {
                const data = await res.json();
                setCurrentScript(scriptName);
                setCurrentLog(data.truncated || data.log || "Log vazio");
                setShowLogModal(true);
            }
        } catch {
            alert("Erro ao carregar log");
        }
    };

    // Filtered scripts
    const filteredScripts = scripts.filter(s => {
        if (filter !== "all" && s.category !== filter) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            if (!s.name.toLowerCase().includes(q) && !s.description?.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const categories = [...new Set(scripts.map(s => s.category))].sort();

    // Check if script is running
    const isRunning = (name: string) => runningExecs.some(e => e.script === name);

    return (
        <section className="glass-card" style={{ padding: "24px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "var(--accent)" }}>🚀</span>
                        Script Runner
                        <span style={{ fontSize: "10px", background: "rgba(78, 220, 136, 0.1)", color: "#4edc88", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                            {scripts.length}
                        </span>
                        {runningExecs.length > 0 && (
                            <span style={{ fontSize: "10px", background: "rgba(251, 191, 36, 0.2)", color: "#fbbf24", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                                {runningExecs.length} executando
                            </span>
                        )}
                    </h3>
                </div>
                <input
                    type="text"
                    placeholder="🔍 Buscar..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: "12px", width: "200px", outline: "none" }}
                />
            </div>

            {/* Running Executions */}
            {runningExecs.length > 0 && (
                <div style={{ background: "rgba(251, 191, 36, 0.1)", borderRadius: "8px", padding: "12px", marginBottom: "16px", border: "1px solid rgba(251, 191, 36, 0.3)" }}>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#fbbf24", marginBottom: "8px" }}>⚡ EXECUTANDO AGORA</div>
                    {runningExecs.map(exec => (
                        <div key={exec.executionId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                            <span>🔄 {exec.script}</span>
                            <span style={{ opacity: 0.7 }}>{exec.elapsedSeconds}s</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Category Filters */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                <button onClick={() => setFilter("all")} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: filter === "all" ? "rgba(78, 220, 136, 0.2)" : "rgba(255,255,255,0.03)", color: filter === "all" ? "#4edc88" : "#fff", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                    Todos
                </button>
                {categories.map(cat => {
                    const config = categoryConfig[cat] || categoryConfig.other;
                    return (
                        <button key={cat} onClick={() => setFilter(cat)} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: filter === cat ? `${config.color}20` : "rgba(255,255,255,0.03)", color: filter === cat ? config.color : "#fff", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                            {config.icon} {config.label}
                        </button>
                    );
                })}
            </div>

            {/* Scripts Grid */}
            {!loading && filteredScripts.length === 0 ? (
                <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "24px", textAlign: "center" }}>
                    <div style={{ fontSize: "28px", marginBottom: "10px" }}>🚀</div>
                    <div style={{ fontSize: "12px", opacity: 0.6 }}>Nenhum script encontrado</div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px", maxHeight: "360px", overflowY: "auto", paddingRight: "8px" }}>
                    {filteredScripts.slice(0, 24).map(script => {
                        const catConfig = categoryConfig[script.category] || categoryConfig.other;
                        const running = isRunning(script.name);
                        const isCurrent = execution.script === script.name;

                        return (
                            <div key={script.path} style={{ background: "rgba(255,255,255,0.02)", borderRadius: "10px", padding: "12px", borderLeft: `3px solid ${catConfig.color}`, transition: "all 0.2s" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                                            <span>{typeIcons[script.type] || "📄"}</span>
                                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{script.name.replace(/\.[^.]+$/, "")}</span>
                                        </div>
                                        {script.description && <div style={{ fontSize: "10px", opacity: 0.5, marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{script.description}</div>}
                                    </div>
                                    <button onClick={() => runScript(script.path, script.name)} disabled={running} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: running ? "rgba(255,255,255,0.1)" : `${catConfig.color}20`, color: catConfig.color, fontSize: "14px", cursor: running ? "wait" : "pointer", opacity: running ? 0.5 : 1 }}>
                                        {running ? "⏳" : "▶"}
                                    </button>
                                </div>
                                {isCurrent && execution.status === "running" && (
                                    <div style={{ marginTop: "8px", fontSize: "10px", color: "#fbbf24" }}>⏳ Executando...</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Recent Logs */}
            {recentLogs.length > 0 && (
                <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize: "11px", opacity: 0.5, marginBottom: "8px" }}>📋 EXECUÇÕES RECENTES</div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {recentLogs.slice(0, 5).map(log => (
                            <button key={log.executionId} onClick={() => viewLog(log.executionId, log.executionId.split("-")[0])} style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: "10px", cursor: "pointer" }}>
                                📄 {log.executionId.split("-")[0]}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Log Modal */}
            {showLogModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "24px", width: "80%", maxWidth: "800px", maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <h4 style={{ margin: 0, fontSize: "16px" }}>📋 {execution.script || currentScript}</h4>
                            <button onClick={() => setShowLogModal(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: "20px", cursor: "pointer" }}>✕</button>
                        </div>
                        {execution.status === "running" && (
                            <div style={{ background: "rgba(251, 191, 36, 0.1)", padding: "8px", borderRadius: "6px", marginBottom: "12px", fontSize: "12px", color: "#fbbf24" }}>
                                ⚡ Executando... (aguarde output)
                            </div>
                        )}
                        <div style={{ flex: 1, overflow: "auto", background: "#0a0a0a", borderRadius: "8px", padding: "12px", fontFamily: "monospace", fontSize: "11px", whiteSpace: "pre-wrap", color: "#22c55e" }}>
                            {currentLog || "Aguardando output..."}
                        </div>
                        <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <button onClick={() => setShowLogModal(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer" }}>Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
