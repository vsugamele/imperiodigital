/**
 * OverviewTab Component
 * =====================
 * 
 * Tab de visão geral que exibe:
 * - Grid de cards de pipelines (3 colunas)
 * - Painel de métricas do sistema
 * 
 * LAYOUT:
 * ┌──────────────────────────────────┐ ┌────────────┐
 * │ Pipeline Grid (3 cols)           │ │ Metrics    │
 * │ ┌─────┐ ┌─────┐ ┌─────┐         │ │ Panel      │
 * │ │ TEO │ │ JON │ │LAISE│         │ │            │
 * │ └─────┘ └─────┘ └─────┘         │ │ CPU        │
 * │ ┌─────┐ ┌─────┐                 │ │ Memory     │
 * │ │PEDRO│ │ PET │                 │ │ Disk       │
 * │ └─────┘ └─────┘                 │ │ ...        │
 * └──────────────────────────────────┘ └────────────┘
 */

"use client";

import React from "react";
import type { PipelineStatus, SystemMetric } from "@/types";
import { PipelineCard } from "../cards/PipelineCard";
import { MetricsPanel } from "../cards/MetricsPanel";

interface OverviewTabProps {
    pipelines: PipelineStatus[];
    metrics: SystemMetric[];
}

export function OverviewTab({ pipelines, metrics }: OverviewTabProps) {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "24px"
        }}>
            {/* Pipeline Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px"
            }}>
                {pipelines.map(pipeline => (
                    <PipelineCard
                        key={pipeline.product}
                        pipeline={pipeline}
                    />
                ))}
            </div>

            {/* Metrics Panel */}
            <MetricsPanel metrics={metrics} />
        </div>
    );
}
