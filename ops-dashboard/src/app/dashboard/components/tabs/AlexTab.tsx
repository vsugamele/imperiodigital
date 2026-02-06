/**
 * AlexTab Component
 * =================
 * 
 * Tab que exibe o status em tempo real do Alex (IA).
 * 
 * LAYOUT:
 * ┌────────────────────┐ ┌────────────────────────────────┐
 * │    ALEX AVATAR     │ │     ACTIVITY LOG               │
 * │                    │ │                                │
 * │      [🤖]          │ │  22:14  Gerou vídeo TEO        │
 * │      ALEX          │ │  22:11  Health check           │
 * │    [WORKING]       │ │  22:06  Respondeu mensagem     │
 * │                    │ │  22:00  Daily report           │
 * │  Tarefa: ...       │ │  21:55  Dashboard atualizado   │
 * │  Uptime: 24h       │ │                                │
 * │  Msgs: 127         │ │                                │
 * │  Automações: 3     │ │                                │
 * └────────────────────┘ └────────────────────────────────┘
 */

"use client";

import React from "react";
import type { AlexStatus } from "@/types";
import { getStatusColor, formatUptime } from "../../hooks/useCommandCenter";

interface AlexTabProps {
    alex: AlexStatus;
}

export function AlexTab({ alex }: AlexTabProps) {
    const statusColor = getStatusColor(alex.status);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
            {/* Alex Avatar Card */}
            <AlexAvatarCard alex={alex} statusColor={statusColor} />

            {/* Activity Log */}
            <ActivityLog />
        </div>
    );
}

// ============================================
// ALEX AVATAR CARD
// ============================================

function AlexAvatarCard({ alex, statusColor }: { alex: AlexStatus; statusColor: string }) {
    const statusEmoji = {
        thinking: "🧠",
        working: "⚡",
        standby: "😴",
        error: "❌"
    }[alex.status] || "🤖";

    return (
        <div className="glass-card" style={{ padding: "40px", textAlign: "center", borderRadius: "16px" }}>
            {/* Avatar Circle */}
            <div style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: `${statusColor}22`,
                border: `2px solid ${statusColor}`,
                margin: "0 auto 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "48px",
                boxShadow: `0 0 40px ${statusColor}44`
            }}>
                {statusEmoji}
            </div>

            {/* Name */}
            <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: 900 }}>
                ALEX
            </h2>

            {/* Status Badge */}
            <div style={{
                display: "inline-block",
                padding: "4px 16px",
                borderRadius: "100px",
                background: `${statusColor}22`,
                color: statusColor,
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "24px"
            }}>
                {alex.status.toUpperCase()}
            </div>

            {/* Info List */}
            <div style={{ textAlign: "left", fontSize: "14px", opacity: 0.8 }}>
                <InfoRow label="Tarefa Atual" value={alex.currentTask || "Idle"} />
                <InfoRow label="Uptime" value={formatUptime(alex.uptime)} />
                <InfoRow label="Mensagens Processadas" value={alex.messagesProcessed.toString()} />
                <InfoRow label="Automações Ativas" value={alex.automationsRunning.toString()} />
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ marginBottom: "12px" }}>
            <div style={{ opacity: 0.5, fontSize: "11px" }}>{label}</div>
            <div style={{ fontWeight: 600 }}>{value}</div>
        </div>
    );
}

// ============================================
// ACTIVITY LOG
// ============================================

// Tipo de log de atividade
interface ActivityLogEntry {
    time: string;
    action: string;
    type: "success" | "info" | "warning" | "error";
}

// Dados mock de atividade (TODO: buscar da API)
const MOCK_ACTIVITIES: ActivityLogEntry[] = [
    { time: "22:14", action: "Gerou vídeo TEO com no_cost", type: "success" },
    { time: "22:11", action: "Executou pipeline health check", type: "info" },
    { time: "22:06", action: "Respondeu mensagem do Vinicius", type: "info" },
    { time: "22:00", action: "Daily report enviado", type: "success" },
    { time: "21:55", action: "Atualizou dashboard de custos", type: "info" },
];

function ActivityLog() {
    return (
        <div className="glass-card" style={{ padding: "24px", borderRadius: "16px" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: 700 }}>
                📝 Atividade Recente
            </h3>

            {MOCK_ACTIVITIES.map((log, i) => (
                <div
                    key={i}
                    style={{
                        display: "flex",
                        gap: "16px",
                        padding: "12px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.05)"
                    }}
                >
                    <span style={{ opacity: 0.5, fontSize: "12px", minWidth: "50px" }}>
                        {log.time}
                    </span>
                    <span style={{ flex: 1 }}>{log.action}</span>
                    <span style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: log.type === "success" ? "#4edc88" : "#ffd93d",
                        marginTop: "6px"
                    }} />
                </div>
            ))}
        </div>
    );
}
