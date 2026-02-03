"use client";

import React, { useState, useEffect, useRef } from "react";

type LogEntry = {
    timestamp: string;
    level: "info" | "warn" | "error" | "debug";
    source: string;
    message: string;
};

export default function LiveLogs() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [paused, setPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial logs mock
    useEffect(() => {
        const initialLogs: LogEntry[] = [
            { timestamp: new Date().toISOString(), level: "info", source: "System", message: "Kernel booting..." },
            { timestamp: new Date().toISOString(), level: "info", source: "OpenClaw", message: "Gateway connected to wss://ops.clawd.local" },
            { timestamp: new Date().toISOString(), level: "debug", source: "Alex", message: "Loading neural pathways..." }
        ];
        setLogs(initialLogs);

        const interval = setInterval(() => {
            if (paused) return;

            const newLog: LogEntry = {
                timestamp: new Date().toISOString(),
                level: Math.random() > 0.9 ? "error" : Math.random() > 0.8 ? "warn" : "info",
                source: ["Alex", "Pipeline", "DB", "Gateway"][Math.floor(Math.random() * 4)],
                message: [
                    "Checking health status of iGaming pipeline",
                    "New task received from CommandCenter",
                    "Optimizing database query execution",
                    "Executing shell script: scan-ai-calls.js",
                    "Signed receipt rcpt-5522 generated successfully",
                    "Egress policy check: api.github.com [ALLOWED]"
                ][Math.floor(Math.random() * 6)]
            };

            setLogs(prev => [...prev.slice(-49), newLog]);
        }, 3000);

        return () => clearInterval(interval);
    }, [paused]);

    useEffect(() => {
        if (scrollRef.current && !paused) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, paused]);

    const getLevelColor = (level: string) => {
        switch (level) {
            case "error": return "#ff6b6b";
            case "warn": return "#ffd93d";
            case "debug": return "#a78bfa";
            default: return "#4edc88";
        }
    };

    return (
        <section className="glass-card" style={{ padding: "16px", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", color: "#888" }}>
                    <span style={{ color: "var(--accent)" }}>📟</span> Live Operations Logs
                </h3>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => setLogs([])} style={{ background: "transparent", border: "none", color: "#666", fontSize: "10px", cursor: "pointer" }}>Limpar</button>
                    <button onClick={() => setPaused(!paused)} style={{
                        background: paused ? "rgba(78, 220, 136, 0.2)" : "rgba(255,255,255,0.05)",
                        border: "none",
                        borderRadius: "4px",
                        padding: "2px 8px",
                        color: paused ? "#4edc88" : "#888",
                        fontSize: "10px",
                        cursor: "pointer"
                    }}>
                        {paused ? "▶ Resume" : "⏸ Pause"}
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                style={{
                    height: "300px",
                    overflowY: "auto",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    lineHeight: "1.6",
                    color: "rgba(255,255,255,0.7)",
                    padding: "10px",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "6px"
                }}
            >
                {logs.map((log, i) => (
                    <div key={i} style={{ marginBottom: "2px", display: "flex", gap: "10px" }}>
                        <span style={{ opacity: 0.3, flexShrink: 0 }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span style={{ color: getLevelColor(log.level), fontWeight: 700, width: "50px", flexShrink: 0 }}>{log.level.toUpperCase()}</span>
                        <span style={{ color: "#60a5fa", width: "70px", flexShrink: 0 }}>{log.source}:</span>
                        <span style={{ wordBreak: "break-all" }}>{log.message}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
