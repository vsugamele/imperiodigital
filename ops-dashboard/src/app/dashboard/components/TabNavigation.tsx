/**
 * TabNavigation Component
 * =======================
 * 
 * Renderiza a navegação por tabs do Command Center.
 * 
 * PROPS:
 * - activeTab: ID da tab atualmente ativa
 * - onTabChange: Callback quando usuário clica em uma tab
 * 
 * TABS DISPONÍVEIS:
 * - overview: Visão geral de pipelines e métricas
 * - pipelines: Lista detalhada de pipelines
 * - alex: Status em tempo real do Alex
 * - research: YouTube Research Hub
 * - ofertas: Hub de lançamentos
 * - architecture: Diagrama do sistema
 * - schedule: Cronograma de automações
 * - crabwalk: Monitor Crabwalk
 * - chat: Chat com OpenClaw
 */

"use client";

import React from "react";

export type TabId =
    | "overview" | "alex" | "architecture" | "chat"
    | "bu_hub" | "ofertas" | "verticais"
    | "pipelines" | "schedule" | "seguranca" | "financeiro" | "operacional" | "mapa" | "research" | "crabwalk"
    | "docs";

interface TabNavigationProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

const CATEGORIES = [
    {
        label: "Commands",
        tabs: [
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "alex", label: "Alex Core", icon: "🤖" },
            { id: "architecture", label: "Architecture", icon: "🏗️" },
            { id: "docs", label: "Docs", icon: "📚" },
            { id: "chat", label: "Chat", icon: "💬" },
        ]
    },
    {
        label: "Business Units",
        tabs: [
            { id: "bu_hub", label: "BU Hub", icon: "🏢" },
            { id: "ofertas", label: "Ofertas", icon: "💰" },
            { id: "verticais", label: "Verticais", icon: "🚀" },
        ]
    },
    {
        label: "Control Plane",
        tabs: [
            { id: "pipelines", label: "Pipelines", icon: "⛓️" },
            { id: "schedule", label: "Schedule", icon: "📅" },
            { id: "seguranca", label: "Segurança", icon: "🛡️" },
            { id: "financeiro", label: "Financeiro", icon: "📈" },
            { id: "operacional", label: "Operacional", icon: "⚙️" },
            { id: "mapa", label: "Mapa", icon: "🗺️" },
        ]
    }
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
    return (
        <nav className="tab-navigation" style={{
            padding: "0 40px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            background: "rgba(0,0,0,0.2)",
            display: "flex",
            gap: "32px"
        }}>
            {CATEGORIES.map(category => (
                <div key={category.label} style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        color: "rgba(255,255,255,0.3)",
                        padding: "12px 0 4px",
                        fontWeight: 600
                    }}>
                        {category.label}
                    </span>
                    <div style={{ display: "flex", gap: "8px", paddingBottom: "12px" }}>
                        {category.tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id as TabId)}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: activeTab === tab.id ? "rgba(255,255,255,0.08)" : "transparent",
                                    color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.5)",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                <span>{tab.icon}</span>
                                <span style={{ fontWeight: activeTab === tab.id ? 600 : 400 }}>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </nav>
    );
}

