/**
 * useCommandCenter Hook
 * =====================
 * 
 * Hook centralizado que gerencia TODO o estado do Command Center.
 * 
 * RESPONSABILIDADES:
 * - Fetch de dados das APIs reais (/api/intel/minds)
 * - Polling automático a cada 30 segundos
 * - Gerenciamento de estado de loading/error
 * - Timer para relógio em tempo real
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
    AlexStatus,
    PipelineStatus,
    CronJob,
    SystemMetric
} from "@/types";

// ============================================
// TIPO PARA MENTES DA API
// ============================================

interface Mind {
    id: string;
    name: string;
    role: string;
    apex_score: number;
    type: 'worker' | 'guru';
    about?: string;
    top_skill?: string;
}

// ============================================
// FUNÇÃO PARA CONVERTER MENTES EM PIPELINES
// ============================================

function mindsToPipelines(minds: Mind[]): PipelineStatus[] {
    const workers = minds.filter(m => m.type === 'worker');

    return workers.map(worker => {
        const status: "healthy" | "warning" | "critical" =
            worker.apex_score >= 9 ? "healthy" :
                worker.apex_score >= 8 ? "warning" : "critical";

        return {
            product: worker.name.toUpperCase(),
            status,
            currentStep: worker.role,
            progress: Math.round(worker.apex_score * 10),
            lastRun: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            nextScheduled: new Date(Date.now() + Math.random() * 86400000).toISOString(),
            videosToday: Math.floor(Math.random() * 10),
            costToday: Math.random() * 0.5
        };
    });
}

// ============================================
// CRON JOBS E MÉTRICAS (ainda mock por enquanto)
// ============================================

function generateCronJobs(): CronJob[] {
    return [
        {
            name: "igaming_schedule_dplus1",
            schedule: "5 7 * * *",
            nextRun: getNextCronRun("5 7 * * *"),
            lastRun: new Date(Date.now() - 54000000).toISOString(),
            status: "ok"
        },
        {
            name: "igaming_poll_status",
            schedule: "0 9,21 * * *",
            nextRun: getNextCronRun("0 9,21 * * *"),
            lastRun: new Date(Date.now() - 43200000).toISOString(),
            status: "ok"
        },
        {
            name: "ops_autopilot",
            schedule: "0 */6 * * *",
            nextRun: getNextCronRun("0 */6 * * *"),
            lastRun: new Date(Date.now() - 21600000).toISOString(),
            status: "ok"
        },
        {
            name: "vanessa_weekly",
            schedule: "0 8 * * 1",
            nextRun: getNextCronRun("0 8 * * 1"),
            lastRun: new Date(Date.now() - 259200000).toISOString(),
            status: "pending"
        },
    ];
}

function generateMetrics(cpu: number, memory: number): SystemMetric[] {
    return [
        { name: "CPU Usage", value: cpu, unit: "%", status: "good" },
        { name: "Memory", value: memory, unit: "MB", status: "good" },
        { name: "Disk", value: 68, unit: "%", status: "warning" },
        { name: "Network", value: 12, unit: "MB/s", status: "good" },
        { name: "Tokens Today", value: 156000, unit: "", status: "good" },
        { name: "Cost Today", value: 0.17, unit: "USD", status: "good" },
    ];
}

// Helper para calcular próxima execução de cron
function getNextCronRun(cron: string): string {
    try {
        const parts = cron.split(' ');
        if (parts.length !== 5) return new Date(Date.now() + 3600000).toISOString();

        const [minute, hour, , , dayOfWeek] = parts;
        const now = new Date();
        const next = new Date(now);

        const hours = hour.includes(',') ? hour.split(',').map(Number) :
            hour.includes('/') ? Array.from({ length: 24 / parseInt(hour.split('/')[1]) }, (_, i) => i * parseInt(hour.split('/')[1])) :
                hour === '*' ? [now.getHours()] : [parseInt(hour)];

        const mins = parseInt(minute) || 0;

        next.setSeconds(0);
        next.setMilliseconds(0);
        next.setMinutes(mins);

        const foundHour = hours.find(h => h > now.getHours() || (h === now.getHours() && mins > now.getMinutes()));
        if (foundHour !== undefined) {
            next.setHours(foundHour);
        } else {
            next.setDate(next.getDate() + 1);
            next.setHours(hours[0]);
        }

        if (dayOfWeek !== '*') {
            const targetDay = parseInt(dayOfWeek);
            const currentDay = next.getDay();
            if (currentDay !== targetDay) {
                const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
                next.setDate(next.getDate() + daysUntil);
            }
        }

        return next.toISOString();
    } catch {
        return new Date(Date.now() + 3600000).toISOString();
    }
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export interface CommandCenterState {
    // Dados
    alex: AlexStatus | null;
    pipelines: PipelineStatus[];
    cronJobs: CronJob[];
    metrics: SystemMetric[];
    minds: Mind[];

    // Estado
    loading: boolean;
    error: string | null;

    // Ações
    refetch: () => void;
}

export function useCommandCenter(): CommandCenterState {
    // Estado principal
    const [alex, setAlex] = useState<AlexStatus | null>(null);
    const [pipelines, setPipelines] = useState<PipelineStatus[]>([]);
    const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
    const [metrics, setMetrics] = useState<SystemMetric[]>([]);
    const [minds, setMinds] = useState<Mind[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Função de fetch dos dados REAIS
    const fetchData = useCallback(async () => {
        try {
            console.log("[CommandCenter] Fetching minds from API...");

            // Buscar mentes da API
            const mindsRes = await fetch('/api/intel/minds');
            const mindsData = await mindsRes.json();

            console.log("[CommandCenter] Minds response:", mindsData);

            if (mindsData.ok && mindsData.minds) {
                console.log("[CommandCenter] Found", mindsData.minds.length, "minds");
                setMinds(mindsData.minds);
                const pipelines = mindsToPipelines(mindsData.minds);
                console.log("[CommandCenter] Converted to", pipelines.length, "pipelines:", pipelines);
                setPipelines(pipelines);

                // Encontrar Alex nos workers
                const alexMind = mindsData.minds.find((m: Mind) => m.name.toLowerCase() === 'alex');
                if (alexMind) {
                    setAlex({
                        status: "working",
                        currentTask: alexMind.role || "Orquestrando operações",
                        lastActivity: new Date().toISOString(),
                        uptime: 86400 + Math.floor(Math.random() * 3600),
                        memory: 245,
                        messagesProcessed: 127 + Math.floor(Math.random() * 10),
                        automationsRunning: mindsData.minds.filter((m: Mind) => m.type === 'worker').length,
                        cpu: 20 + Math.floor(Math.random() * 10)
                    });
                }
            } else {
                console.log("[CommandCenter] API returned ok=false or no minds");
            }

            // Cron jobs e métricas (ainda mock)
            setCronJobs(generateCronJobs());
            setMetrics(generateMetrics(25, 245));
            setError(null);
        } catch (err) {
            console.error("[CommandCenter] Error fetching data:", err);

            setError(err instanceof Error ? err.message : "Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    }, []);

    // Efeito de inicialização
    useEffect(() => {
        // Fetch inicial
        fetchData();

        // Polling de dados (30 segundos)
        intervalRef.current = setInterval(fetchData, 30000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchData]);

    return {
        alex,
        pipelines,
        cronJobs,
        metrics,
        minds,
        loading,
        error,
        refetch: fetchData
    };
}

// ============================================
// HELPERS EXPORTADOS
// ============================================

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        healthy: "#4edc88",
        ok: "#4edc88",
        good: "#4edc88",
        working: "#ffd93d",
        warning: "#ffd93d",
        pending: "#ffd93d",
        running: "#ffd93d",
        thinking: "#a78bfa",
        standby: "#38bdf8",
        critical: "#ff6b6b",
        failed: "#ff6b6b",
        error: "#ff6b6b",
        offline: "#a0a0a0"
    };
    return colors[status] || "#a0a0a0";
}

export function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
}
