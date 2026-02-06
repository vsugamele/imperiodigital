// ========================================
// COMPONENTES ATÔMICOS - UI Base
// ========================================

"use client";

import React from "react";

// --- Status Badge ---

interface StatusBadgeProps {
    status: "healthy" | "warning" | "critical" | "offline" | "ok" | "failed" | "running" | "pending";
    size?: "sm" | "md" | "lg";
    pulse?: boolean;
}

export function StatusBadge({ status, size = "md", pulse = false }: StatusBadgeProps) {
    const colors: Record<string, string> = {
        healthy: "#4EDC88",
        ok: "#4EDC88",
        warning: "#F59E0B",
        running: "#F59E0B",
        pending: "#6B7280",
        critical: "#EF4444",
        failed: "#EF4444",
        offline: "#6B7280",
    };

    const sizes = {
        sm: { dot: 6, font: 10, padding: "2px 6px" },
        md: { dot: 8, font: 11, padding: "4px 10px" },
        lg: { dot: 10, font: 13, padding: "6px 14px" },
    };

    const color = colors[status] || "#6B7280";
    const s = sizes[size];

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: s.padding,
                borderRadius: "20px",
                fontSize: s.font,
                fontWeight: 600,
                background: `${color}22`,
                color: color,
            }}
        >
            <span
                style={{
                    width: s.dot,
                    height: s.dot,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 ${s.dot}px ${color}`,
                    animation: pulse ? "pulse 2s infinite" : undefined,
                }}
            />
            {status.toUpperCase()}
        </span>
    );
}

// --- Progress Bar ---

interface ProgressBarProps {
    value: number;
    max?: number;
    color?: string;
    height?: number;
    showLabel?: boolean;
}

export function ProgressBar({
    value,
    max = 100,
    color,
    height = 4,
    showLabel = false
}: ProgressBarProps) {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));

    const autoColor = percent >= 80 ? "#4EDC88" : percent >= 50 ? "#F59E0B" : "#EF4444";
    const barColor = color || autoColor;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
                style={{
                    flex: 1,
                    height,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: height / 2,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${percent}%`,
                        height: "100%",
                        background: barColor,
                        transition: "width 0.3s ease",
                    }}
                />
            </div>
            {showLabel && (
                <span style={{ fontSize: 11, color: barColor, fontWeight: 600 }}>
                    {Math.round(percent)}%
                </span>
            )}
        </div>
    );
}

// --- Card Container ---

interface CardProps {
    children: React.ReactNode;
    title?: string;
    icon?: string;
    accent?: string;
    padding?: string;
    onClick?: () => void;
    selected?: boolean;
}

export function Card({
    children,
    title,
    icon,
    accent,
    padding = "20px",
    onClick,
    selected = false
}: CardProps) {
    return (
        <div
            onClick={onClick}
            style={{
                background: selected
                    ? `${accent || "#F59E0B"}11`
                    : "rgba(255,255,255,0.02)",
                borderRadius: "16px",
                padding,
                border: selected
                    ? `2px solid ${accent || "#F59E0B"}44`
                    : "1px solid rgba(255,255,255,0.05)",
                cursor: onClick ? "pointer" : "default",
                transition: "all 0.2s ease",
            }}
        >
            {title && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "16px",
                        fontSize: 14,
                        fontWeight: 700,
                    }}
                >
                    {icon && <span>{icon}</span>}
                    <span>{title}</span>
                </div>
            )}
            {children}
        </div>
    );
}

// --- Metric Display ---

interface MetricProps {
    label: string;
    value: string | number;
    unit?: string;
    trend?: "up" | "down" | "neutral";
    color?: string;
}

export function Metric({ label, value, unit, trend, color }: MetricProps) {
    const trendIcons = { up: "↑", down: "↓", neutral: "→" };
    const trendColors = { up: "#4EDC88", down: "#EF4444", neutral: "#6B7280" };

    return (
        <div>
            <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>
                {label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: color || "#fff" }}>
                    {value}
                </span>
                {unit && (
                    <span style={{ fontSize: 12, opacity: 0.5 }}>{unit}</span>
                )}
                {trend && (
                    <span style={{ color: trendColors[trend], fontSize: 14, marginLeft: 4 }}>
                        {trendIcons[trend]}
                    </span>
                )}
            </div>
        </div>
    );
}

// --- Tab Navigation ---

interface TabsProps {
    tabs: { id: string; label: string; icon?: string }[];
    activeTab: string;
    onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
    return (
        <div
            style={{
                display: "flex",
                gap: "4px",
                background: "rgba(0,0,0,0.3)",
                padding: "4px",
                borderRadius: "12px",
            }}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: activeTab === tab.id
                            ? "rgba(255,255,255,0.1)"
                            : "transparent",
                        color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.5)",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                    }}
                >
                    {tab.icon && <span>{tab.icon}</span>}
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

// --- Loading Spinner ---

export function Spinner({ size = 20, color = "#F59E0B" }: { size?: number; color?: string }) {
    return (
        <div
            style={{
                width: size,
                height: size,
                border: `2px solid ${color}33`,
                borderTopColor: color,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
            }}
        />
    );
}

// --- Empty State ---

interface EmptyStateProps {
    icon: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div
            style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.05)",
            }}
        >
            <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</div>
            {description && (
                <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 16 }}>{description}</div>
            )}
            {action}
        </div>
    );
}

// --- Button ---

interface ButtonProps {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    onClick,
    disabled = false,
    loading = false
}: ButtonProps) {
    const variants = {
        primary: { bg: "#F59E0B", color: "#000" },
        secondary: { bg: "rgba(255,255,255,0.1)", color: "#fff" },
        danger: { bg: "#EF4444", color: "#fff" },
        ghost: { bg: "transparent", color: "#fff" },
    };

    const sizes = {
        sm: { padding: "6px 12px", fontSize: 11 },
        md: { padding: "10px 18px", fontSize: 13 },
        lg: { padding: "14px 24px", fontSize: 15 },
    };

    const v = variants[variant];
    const s = sizes[size];

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            style={{
                padding: s.padding,
                fontSize: s.fontSize,
                fontWeight: 600,
                borderRadius: "8px",
                border: variant === "ghost" ? "1px solid rgba(255,255,255,0.2)" : "none",
                background: v.bg,
                color: v.color,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                transition: "all 0.2s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
            }}
        >
            {loading && <Spinner size={14} color={v.color} />}
            {children}
        </button>
    );
}
