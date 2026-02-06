/**
 * ScheduleTab Component
 * =====================
 * 
 * Tab que exibe o cronograma de automações (cron jobs).
 * Mostra tabela com nome, expressão cron, próxima/última execução e status.
 */

"use client";

import React from "react";
import type { CronJob } from "@/types";
import { getStatusColor } from "../../hooks/useCommandCenter";

interface ScheduleTabProps {
    cronJobs: CronJob[];
}

export function ScheduleTab({ cronJobs }: ScheduleTabProps) {
    return (
        <div className="glass-card" style={{ padding: "24px", borderRadius: "16px" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: 800 }}>
                📅 Cronograma de Automações
            </h3>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <TableHeader>JOB</TableHeader>
                        <TableHeader>CRON</TableHeader>
                        <TableHeader>PRÓXIMA EXECUÇÃO</TableHeader>
                        <TableHeader>ÚLTIMA</TableHeader>
                        <TableHeader>STATUS</TableHeader>
                    </tr>
                </thead>
                <tbody>
                    {cronJobs.map(job => (
                        <CronJobRow key={job.name} job={job} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TableHeader({ children }: { children: React.ReactNode }) {
    return (
        <th style={{
            padding: "12px",
            textAlign: "left",
            opacity: 0.5,
            fontSize: "12px"
        }}>
            {children}
        </th>
    );
}

function CronJobRow({ job }: { job: CronJob }) {
    const statusColor = getStatusColor(job.status);

    return (
        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <td style={{ padding: "16px 12px", fontWeight: 600 }}>
                {job.name}
            </td>
            <td style={{
                padding: "16px 12px",
                fontFamily: "monospace",
                fontSize: "12px",
                opacity: 0.7
            }}>
                {job.schedule}
            </td>
            <td style={{ padding: "16px 12px", fontSize: "13px" }}>
                {new Date(job.nextRun).toLocaleString("pt-BR")}
            </td>
            <td style={{ padding: "16px 12px", fontSize: "13px", opacity: 0.7 }}>
                {new Date(job.lastRun).toLocaleString("pt-BR")}
            </td>
            <td style={{ padding: "16px 12px" }}>
                <span style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "100px",
                    fontSize: "11px",
                    fontWeight: 700,
                    background: `${statusColor}22`,
                    color: statusColor
                }}>
                    {job.status.toUpperCase()}
                </span>
            </td>
        </tr>
    );
}
