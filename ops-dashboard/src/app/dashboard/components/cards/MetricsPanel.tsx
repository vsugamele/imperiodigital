/**
 * MetricsPanel Component
 * ======================
 * 
 * Painel que exibe métricas do sistema em formato de lista.
 * 
 * PROPS:
 * - metrics: Array de SystemMetric
 * 
 * EXIBE:
 * - Nome da métrica
 * - Valor atual com unidade
 * - Barra de progresso colorida por status
 */

"use client";

import React from "react";
import type { SystemMetric } from "@/types";
import { getStatusColor } from "../../hooks/useCommandCenter";

interface MetricsPanelProps {
    metrics: SystemMetric[];
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
    return (
        <div className="glass-card" style={{ padding: "24px", borderRadius: "16px" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: 700 }}>
                📈 System Metrics
            </h3>

            {metrics.map(metric => (
                <MetricItem key={metric.name} metric={metric} />
            ))}
        </div>
    );
}

function MetricItem({ metric }: { metric: SystemMetric }) {
    const color = getStatusColor(metric.status);

    // Normalizar valor para porcentagem (0-100)
    const normalizedValue = metric.unit === "%"
        ? metric.value
        : metric.name.includes("Token")
            ? Math.min(100, (metric.value / 200000) * 100)
            : Math.min(100, metric.value);

    return (
        <div style={{ marginBottom: "16px" }}>
            {/* Label + Value */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px"
            }}>
                <span style={{ fontSize: "13px", opacity: 0.8 }}>
                    {metric.name}
                </span>
                <span style={{ fontSize: "13px", fontWeight: 700, color }}>
                    {formatMetricValue(metric)}
                </span>
            </div>

            {/* Progress Bar */}
            <div style={{
                height: "4px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "2px",
                overflow: "hidden"
            }}>
                <div style={{
                    width: `${normalizedValue}%`,
                    height: "100%",
                    background: color,
                    borderRadius: "2px",
                    transition: "width 0.3s"
                }} />
            </div>
        </div>
    );
}

function formatMetricValue(metric: SystemMetric): string {
    if (metric.unit === "USD") {
        return `$${metric.value.toFixed(2)}`;
    }

    if (metric.name.includes("Token")) {
        return `${(metric.value / 1000).toFixed(0)}K`;
    }

    return `${metric.value}${metric.unit}`;
}
