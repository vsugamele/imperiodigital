/**
 * CommandCenter v2.0
 * ==================
 * 
 * ANTES: 945 linhas monolíticas
 * DEPOIS: ~150 linhas como orquestrador
 * 
 * ARQUITETURA:
 * Este componente agora é apenas um ORQUESTRADOR que:
 * 1. Usa o hook useCommandCenter para gerenciar estado
 * 2. Renderiza Header e TabNavigation
 * 3. Renderiza o conteúdo da tab ativa
 * 
 * COMPONENTES EXTRAÍDOS:
 * - hooks/useCommandCenter.ts → Estado centralizado
 * - components/Header.tsx → Header + Quick Stats
 * - components/TabNavigation.tsx → Navegação por tabs
 * - components/tabs/* → Conteúdo de cada tab
 * - components/cards/* → Cards reutilizáveis
 */

"use client";

import { useState } from "react";

// Hook de estado centralizado
import { useCommandCenter } from "./hooks/useCommandCenter";

// Componentes
import {
  Header,
  TabNavigation,
  OverviewTab,
  AlexTab,
  PipelinesTab,
  ScheduleTab,
  ArchitectureTab,
  ChatTab,
  ResearchTab,
  CrabwalkTab,
} from "./components";
import type { TabId } from "./components";

// OfertasHub ainda não foi refatorado
import OfertasHub from "./OfertasHub";

// ============================================
// COMPONENT
// ============================================

export default function CommandCenter() {
  // Estado do dashboard via hook
  const {
    alex,
    pipelines,
    cronJobs,
    metrics,
    currentTime,
    loading,
    error
  } = useCommandCenter();

  // Tab ativa
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #0a0a0a 0%, #111 100%)",
        color: "#fff"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "3px solid rgba(78, 220, 136, 0.2)",
            borderTopColor: "#4edc88",
            borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 1s linear infinite"
          }} />
          <p style={{ opacity: 0.7 }}>Carregando Command Center...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #0a0a0a 0%, #111 100%)",
        color: "#fff"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
          <h2>Erro ao carregar</h2>
          <p style={{ opacity: 0.7 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="command-center" style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0a0a0a 0%, #111 100%)",
      color: "#fff",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Header */}
      <Header
        pipelines={pipelines}
        cronJobs={cronJobs}
        metrics={metrics}
        currentTime={currentTime}
      />

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <main style={{ padding: "32px 40px" }}>
        {activeTab === "overview" && (
          <OverviewTab pipelines={pipelines} metrics={metrics} />
        )}

        {activeTab === "alex" && alex && (
          <AlexTab alex={alex} />
        )}

        {activeTab === "pipelines" && (
          <PipelinesTab pipelines={pipelines} />
        )}

        {activeTab === "schedule" && (
          <ScheduleTab cronJobs={cronJobs} />
        )}

        {activeTab === "architecture" && (
          <ArchitectureTab />
        )}

        {activeTab === "chat" && (
          <ChatTab />
        )}

        {activeTab === "research" && (
          <ResearchTab />
        )}

        {activeTab === "crabwalk" && (
          <CrabwalkTab />
        )}

        {activeTab === "ofertas" && (
          <OfertasHub />
        )}
      </main>

      {/* Global Styles */}
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
