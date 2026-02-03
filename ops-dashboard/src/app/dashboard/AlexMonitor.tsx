"use client";

import React, { useState, useEffect, useMemo } from "react";

type StatusData = {
    state: "working" | "thinking" | "standby" | "offline";
    explicitState?: { state: string; note?: string; updatedAtMs: number };
    lastActivityMs: number | null;
    ageMs: number | null;
    nowMs: number;
};

type AutopilotActivity = {
    status: "working" | "standby";
    lastAction: string;
    lastUpdate: string;
    nextRun: string;
};

type OpenClawData = {
    gateway: { healthy: boolean; version?: string; error?: string };
    config: {
        primaryModel: string;
        fallbackCount: number;
    } | null;
    skillsCount: number;
};

const stateColors = {
    working: "#4edc88",
    thinking: "#60a5fa",
    standby: "#ffd93d",
    offline: "#ff6b6b",
};

const stateLabels = {
    working: "EM OPERAÇÃO",
    thinking: "PROCESSANDO",
    standby: "STANDBY",
    offline: "OFFLINE",
};

// Default fallback data
const defaultData: StatusData = {
    state: "standby",
    lastActivityMs: null,
    ageMs: null,
    nowMs: Date.now()
};

const defaultAutopilot: AutopilotActivity = {
    status: "standby",
    lastAction: "Aguardando próxima tarefa",
    lastUpdate: new Date().toISOString(),
    nextRun: "07:00"
};

const defaultOpenclaw: OpenClawData = {
    gateway: { healthy: true },
    config: { primaryModel: "MiniMax-M2.1", fallbackCount: 5 },
    skillsCount: 12
};

export default function AlexMonitor() {
    const [data, setData] = useState<StatusData>(defaultData);
    const [autopilotData, setAutopilotData] = useState<AutopilotActivity>(defaultAutopilot);
    const [openclawData, setOpenclawData] = useState<OpenClawData>(defaultOpenclaw);

    const { statusColor, statusLabel, gatewayColor } = useMemo(() => {
        const state = data?.state || "standby";
        return {
            statusColor: stateColors[state] || stateColors.standby,
            statusLabel: stateLabels[state] || stateLabels.standby,
            gatewayColor: openclawData?.gateway?.healthy ? "#4edc88" : "#ff6b6b"
        };
    }, [data?.state, openclawData?.gateway?.healthy]);

    useEffect(() => {
        async function loadAll() {
            try {
                const [statusRes, autopilotRes, openclawRes] = await Promise.all([
                    fetch("/api/status", { cache: "no-store" }).catch(() => null),
                    fetch("/api/autopilot-activity", { cache: "no-store" }).catch(() => null),
                    fetch("/api/openclaw", { cache: "no-store" }).catch(() => null)
                ]);

                if (statusRes?.ok) {
                    const json = await statusRes.json();
                    setData(json);
                }
                if (autopilotRes?.ok) {
                    const json = await autopilotRes.json();
                    setAutopilotData(json);
                }
                if (openclawRes?.ok) {
                    const json = await openclawRes.json();
                    setOpenclawData(json);
                }
            } catch (e) {
                console.log("API fetch error, using defaults");
            }
        }

        loadAll();
        const interval = setInterval(loadAll, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="glass-card" style={{
            padding: '24px',
            borderLeft: `4px solid ${statusColor}`,
            background: `linear-gradient(135deg, ${statusColor}08 0%, rgba(18,18,18,0.7) 100%)`
        }}>
            {/* Main Status Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <div className={data?.state === 'working' ? 'pulse-live' : ''} style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: statusColor,
                            boxShadow: `0 0 10px ${statusColor}`
                        }} />
                        <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: statusColor,
                            letterSpacing: '0.12em'
                        }}>
                            COMMAND CENTER
                        </span>
                    </div>
                    <h2 style={{
                        margin: 0,
                        fontSize: '26px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        Alex
                        <span style={{
                            color: statusColor,
                            fontSize: '18px',
                            fontWeight: 700
                        }}>
                            {statusLabel}
                        </span>
                    </h2>
                </div>

                <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '9px', opacity: 0.5, marginBottom: '2px' }}>UPTIME</div>
                    <div style={{ fontSize: '16px', fontWeight: 800 }}>99.9%</div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {/* Activity Card */}
                <div style={{
                    background: 'rgba(0,0,0,0.25)',
                    borderRadius: '10px',
                    padding: '14px',
                    borderLeft: '3px solid var(--accent)'
                }}>
                    <div style={{ fontSize: '9px', opacity: 0.5, textTransform: 'uppercase', marginBottom: '6px' }}>
                        Atividade
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.4 }}>
                        {data?.explicitState?.note || "Monitorando sistemas..."}
                    </div>
                </div>

                {/* Autopilot Card */}
                <div style={{
                    background: 'rgba(0,0,0,0.25)',
                    borderRadius: '10px',
                    padding: '14px',
                    borderLeft: '3px solid #ffd93d'
                }}>
                    <div style={{ fontSize: '9px', opacity: 0.5, textTransform: 'uppercase', marginBottom: '6px' }}>
                        Autopilot
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: autopilotData?.status === 'working' ? '#4edc88' : '#ffd93d' }}>
                        {autopilotData?.lastAction || "Aguardando..."}
                    </div>
                    <div style={{ fontSize: '9px', opacity: 0.4, marginTop: '3px' }}>
                        Próx: {autopilotData?.nextRun || "07:00"}
                    </div>
                </div>

                {/* OpenClaw Gateway Card */}
                <div style={{
                    background: 'rgba(0,0,0,0.25)',
                    borderRadius: '10px',
                    padding: '14px',
                    borderLeft: `3px solid ${gatewayColor}`
                }}>
                    <div style={{ fontSize: '9px', opacity: 0.5, textTransform: 'uppercase', marginBottom: '6px' }}>
                        🦞 Gateway
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: gatewayColor }}>
                        {openclawData?.gateway?.healthy ? "Online" : "Offline"}
                    </div>
                    <div style={{ fontSize: '9px', opacity: 0.4, marginTop: '3px' }}>
                        {openclawData?.skillsCount || 0} skills
                    </div>
                </div>

                {/* Model Card */}
                <div style={{
                    background: 'rgba(0,0,0,0.25)',
                    borderRadius: '10px',
                    padding: '14px',
                    borderLeft: '3px solid #60a5fa'
                }}>
                    <div style={{ fontSize: '9px', opacity: 0.5, textTransform: 'uppercase', marginBottom: '6px' }}>
                        🤖 Modelo
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#60a5fa' }}>
                        {openclawData?.config?.primaryModel?.split('/').pop() || "MiniMax-M2.1"}
                    </div>
                    <div style={{ fontSize: '9px', opacity: 0.4, marginTop: '3px' }}>
                        +{openclawData?.config?.fallbackCount || 5} fallbacks
                    </div>
                </div>
            </div>
        </section>
    );
}
