/**
 * useCommandCenter Hook
 * =====================
 * 
 * Hook centralizado que gerencia TODO o estado do Command Center.
 * 
 * RESPONSABILIDADES:
 * - Fetch de dados da API de status
 * - Polling automático a cada 30 segundos
 * - Gerenciamento de estado de loading/error
 * - Timer para relógio em tempo real
 * 
 * FLUXO:
 * 1. Na montagem, busca dados iniciais da API
 * 2. Inicia polling para atualizar dados periodicamente
 * 3. Mantém relógio atualizado a cada segundo
 * 4. Expõe função refetch para atualização manual
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
// MOCK DATA (temporário - será substituído por APIs reais)
// ============================================

function generateMockData() {
    const now = new Date();

    const alex: AlexStatus = {
        status: "working",
        currentTask: "Processando automações do daily report",
        lastActivity: now.toISOString(),
        uptime: 86400 + Math.floor(Math.random() * 3600), // ~24h
        memory: 245,
        messagesProcessed: 127 + Math.floor(Math.random() * 10),
        automationsRunning: 3,
        cpu: 20 + Math.floor(Math.random() * 10)
    };

    const pipelines: PipelineStatus[] = [
        {
            product: "TEO",
            status: "healthy",
            currentStep: "Idle",
            progress: 100,
            lastRun: new Date(Date.now() - 3600000).toISOString(),
            nextScheduled: new Date(Date.now() + 86400000).toISOString(),
            videosToday: 6,
            costToday: 0
        },
        {
            product: "JONATHAN",
            status: "healthy",
            currentStep: "Idle",
            progress: 100,
            lastRun: new Date(Date.now() - 3600000).toISOString(),
            nextScheduled: new Date(Date.now() + 86400000).toISOString(),
            videosToday: 6,
            costToday: 0
        },
        {
            product: "LAISE",
            status: "warning",
            currentStep: "Generating",
            progress: 60,
            lastRun: new Date(Date.now() - 1800000).toISOString(),
            nextScheduled: new Date(Date.now() + 86400000).toISOString(),
            videosToday: 4,
            costToday: 0.12
        },
        {
            product: "PEDRO",
            status: "healthy",
            currentStep: "Idle",
            progress: 100,
            lastRun: new Date(Date.now() - 7200000).toISOString(),
            nextScheduled: new Date(Date.now() + 86400000).toISOString(),
            videosToday: 6,
            costToday: 0
        },
        {
            product: "PETSELECT",
            status: "healthy",
            currentStep: "Idle",
            progress: 100,
            lastRun: new Date(Date.now() - 14400000).toISOString(),
            nextScheduled: new Date(Date.now() + 43200000).toISOString(),
            videosToday: 3,
            costToday: 0.05
        },
    ];

    const cronJobs: CronJob[] = [
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
            name: "jp_schedule",
            schedule: "45 7 * * *",
            nextRun: getNextCronRun("45 7 * * *"),
            lastRun: new Date(Date.now() - 54000000).toISOString(),
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

    const metrics: SystemMetric[] = [
        { name: "CPU Usage", value: alex.cpu, unit: "%", status: "good" },
        { name: "Memory", value: alex.memory, unit: "MB", status: "good" },
        { name: "Disk", value: 68, unit: "%", status: "warning" },
        { name: "Network", value: 12, unit: "MB/s", status: "good" },
        { name: "Tokens Today", value: 156000, unit: "", status: "good" },
        { name: "Cost Today", value: 0.17, unit: "USD", status: "good" },
    ];

    return { alex, pipelines, cronJobs, metrics };
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

        let foundHour = hours.find(h => h > now.getHours() || (h === now.getHours() && mins > now.getMinutes()));
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
    currentTime: Date;

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
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Função de fetch dos dados
    const fetchData = useCallback(async () => {
        try {
            // TODO: Substituir por chamadas reais à API
            // const res = await fetch('/api/status');
            // const data = await res.json();

            // Por enquanto, usando mock data
            const { alex, pipelines, cronJobs, metrics } = generateMockData();

            setAlex(alex);
            setPipelines(pipelines);
            setCronJobs(cronJobs);
            setMetrics(metrics);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    }, []);

    // Efeito de inicialização
    useEffect(() => {
        // Fetch inicial
        fetchData();

        // Timer do relógio (1 segundo)
        const clockTimer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Polling de dados (30 segundos)
        intervalRef.current = setInterval(fetchData, 30000);

        return () => {
            clearInterval(clockTimer);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchData]);

    return {
        alex,
        pipelines,
        cronJobs,
        metrics,
        currentTime,
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
