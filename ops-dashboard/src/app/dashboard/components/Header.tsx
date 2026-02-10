/**
 * Header Component
 * ================
 * 
 * Renderiza o header do Command Center com:
 * - Logo e título
 * - Timestamp em tempo real
 * - Quick stats (Pipelines OK, Jobs OK, Custo Hoje)
 * 
 * PROPS:
 * - pipelines: Array de status dos pipelines
 * - cronJobs: Array de cron jobs
 * - metrics: Array de métricas do sistema
 * - currentTime: Date atualizada em tempo real
 */

"use client";

import type { PipelineStatus, CronJob, SystemMetric } from "@/types";
import { Clock } from "./Clock";

interface HeaderProps {
    pipelines: PipelineStatus[];
    cronJobs: CronJob[];
    metrics: SystemMetric[];
}

export function Header({ pipelines, cronJobs, metrics }: HeaderProps) {
    const healthyPipelines = pipelines.filter(p => p.status === "healthy").length;
    const okJobs = cronJobs.filter(c => c.status === "ok").length;
    const costToday = metrics.find(m => m.name === "Cost Today")?.value ?? 0;

    return (
        <header style={{
            padding: "20px 40px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(10px)",
            position: "sticky",
            top: 0,
            zIndex: 100
        }}>
            {/* Logo & Title */}
            <div>
                <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 900 }}>
                    🎛️ <span style={{ color: "var(--accent)" }}>COMMAND</span> CENTER
                </h1>
                <p style={{ margin: "4px 0 0 0", opacity: 0.5, fontSize: "13px" }}>
                    Empire Control System v2.0
                </p>
            </div>

            {/* Right Side: Clock & Stats */}
            <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                <Clock />
                <QuickStat
                    value={`${healthyPipelines}/${pipelines.length}`}
                    label="Pipelines OK"
                    color="var(--accent)"
                />
                <QuickStat
                    value={okJobs}
                    label="Jobs OK"
                    color="#4edc88"
                />
                <QuickStat
                    value={`$${costToday.toFixed(2)}`}
                    label="Custo Hoje"
                    color="#ffd93d"
                />
            </div>
        </header>
    );
}

// Componente auxiliar para estatísticas rápidas
function QuickStat({ value, label, color }: { value: string | number; label: string; color: string }) {
    return (
        <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 900, color }}>
                {value}
            </div>
            <div style={{ fontSize: "10px", opacity: 0.5 }}>
                {label}
            </div>
        </div>
    );
}
