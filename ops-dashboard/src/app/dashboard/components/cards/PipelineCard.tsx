/**
 * PipelineCard Component
 * ======================
 * 
 * Card individual que exibe status de um pipeline específico.
 * 
 * PROPS:
 * - pipeline: Objeto PipelineStatus com todas as informações
 * 
 * EXIBE:
 * - Nome do produto
 * - Indicador de status (cor + luz)
 * - Etapa atual
 * - Barra de progresso
 * - Vídeos gerados hoje
 * - Custo acumulado hoje
 */

"use client";

import React from "react";
import type { PipelineStatus } from "@/types";
import { getStatusColor } from "../../hooks/useCommandCenter";

interface PipelineCardProps {
    pipeline: PipelineStatus;
    compact?: boolean;
}

export function PipelineCard({ pipeline, compact = false }: PipelineCardProps) {
    const statusColor = getStatusColor(pipeline.status);

    return (
        <div
            className="glass-card"
            style={{
                padding: compact ? "16px" : "20px",
                border: `1px solid ${statusColor}44`,
                background: `${statusColor}08`,
                borderRadius: "16px",
                transition: "all 0.2s"
            }}
        >
            {/* Header: Nome + Status Indicator */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px"
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: compact ? "16px" : "18px",
                    fontWeight: 800
                }}>
                    {pipeline.product}
                </h3>
                <div style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: statusColor,
                    boxShadow: `0 0 10px ${statusColor}`
                }} />
            </div>

            {/* Current Step */}
            <div style={{
                fontSize: "12px",
                opacity: 0.7,
                marginBottom: "8px"
            }}>
                {pipeline.currentStep}
            </div>

            {/* Progress Bar */}
            <div style={{
                height: "4px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "2px",
                marginBottom: "12px",
                overflow: "hidden"
            }}>
                <div style={{
                    width: `${pipeline.progress}%`,
                    height: "100%",
                    background: statusColor,
                    borderRadius: "2px",
                    transition: "width 0.3s"
                }} />
            </div>

            {/* Footer: Métricas do dia */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                opacity: 0.6
            }}>
                <span>📹 {pipeline.videosToday} hoje</span>
                <span>💰 ${pipeline.costToday.toFixed(2)}</span>
            </div>
        </div>
    );
}

/**
 * PipelineCardExpanded Component
 * ==============================
 * 
 * Versão expandida com visualização de steps.
 */
export function PipelineCardExpanded({ pipeline }: PipelineCardProps) {
    const statusColor = getStatusColor(pipeline.status);
    const steps = ["📥 IMG", "🎨 GEN", "🎬 VID", "☁️ UP", "📅 SCH"];

    return (
        <div
            className="glass-card"
            style={{
                padding: "24px",
                marginBottom: "16px",
                border: `1px solid ${statusColor}44`,
                borderRadius: "16px"
            }}
        >
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px"
            }}>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>
                    {pipeline.product}
                </h3>
                <StatusBadge status={pipeline.status} color={statusColor} />
            </div>

            {/* Pipeline Steps Visual */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                {steps.map((step, i) => {
                    const stepComplete = i < (pipeline.progress / 100) * steps.length;
                    return (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                padding: "12px",
                                borderRadius: "8px",
                                background: stepComplete ? "rgba(78, 220, 136, 0.1)" : "rgba(255,255,255,0.05)",
                                border: `1px solid ${stepComplete ? "#4edc88" : "transparent"}`,
                                textAlign: "center",
                                fontSize: "11px",
                                fontWeight: 600,
                                opacity: stepComplete ? 1 : 0.5
                            }}
                        >
                            {step}
                        </div>
                    );
                })}
            </div>

            {/* Timestamps */}
            <div style={{
                display: "flex",
                gap: "32px",
                fontSize: "13px",
                opacity: 0.7
            }}>
                <span>🕐 Último: {new Date(pipeline.lastRun).toLocaleString("pt-BR")}</span>
                <span>📅 Próximo: {new Date(pipeline.nextScheduled).toLocaleString("pt-BR")}</span>
                <span>📹 {pipeline.videosToday} vídeos hoje</span>
            </div>
        </div>
    );
}

// Componente auxiliar
function StatusBadge({ status, color }: { status: string; color: string }) {
    return (
        <div style={{
            padding: "6px 16px",
            borderRadius: "100px",
            background: `${color}22`,
            color: color,
            fontSize: "12px",
            fontWeight: 700
        }}>
            {status.toUpperCase()}
        </div>
    );
}
