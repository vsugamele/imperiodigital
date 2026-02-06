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
    | "overview"
    | "pipelines"
    | "alex"
    | "research"
    | "ofertas"
    | "architecture"
    | "schedule"
    | "crabwalk"
    | "chat";

interface Tab {
    id: TabId;
    label: string;
    icon: string;
}

interface TabNavigationProps {
    activeTab: TabId;
    onTabChange: (tabId: TabId) => void;
}

const TABS: Tab[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "pipelines", label: "Pipelines", icon: "🔄" },
    { id: "alex", label: "Alex Live", icon: "🤖" },
    { id: "research", label: "Research", icon: "🔍" },
    { id: "ofertas", label: "Lançamentos", icon: "🚀" },
    { id: "architecture", label: "Arquitetura", icon: "🏗️" },
    { id: "schedule", label: "Cronograma", icon: "📅" },
    { id: "crabwalk", label: "Crabwalk", icon: "🦀" },
    { id: "chat", label: "Chat", icon: "💬" },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
    return (
        <nav style={{
            padding: "16px 40px",
            display: "flex",
            gap: "8px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            overflowX: "auto"
        }}>
            {TABS.map(tab => (
                <TabButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => onTabChange(tab.id)}
                />
            ))}
        </nav>
    );
}

// Componente auxiliar para botão de tab
function TabButton({ tab, isActive, onClick }: { tab: Tab; isActive: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                background: isActive ? "rgba(78, 220, 136, 0.2)" : "transparent",
                color: isActive ? "var(--accent)" : "rgba(255,255,255,0.6)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "6px"
            }}
        >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
        </button>
    );
}
