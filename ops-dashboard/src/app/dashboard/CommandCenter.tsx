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
import dynamic from "next/dynamic";

// Hook de estado centralizado
import { useCommandCenter } from "./hooks/useCommandCenter";

// Componentes
// Basic Components (Pre-loaded)
import {
  Header,
  TabNavigation,
  OverviewTab,
} from "./components";
import type { TabId } from "./components";

// Lazy Loaded Tabs
const BusinessUnitsHub = dynamic(() => import("./components/tabs/BusinessUnitsHub").then(mod => mod.BusinessUnitsHub), { loading: () => <p>Loading Hub...</p> });
const AlexTab = dynamic(() => import("./components/tabs/AlexTab").then(mod => mod.AlexTab), { loading: () => <p>Loading Alex...</p> });
const PipelinesTab = dynamic(() => import("./components/tabs/PipelinesTab").then(mod => mod.PipelinesTab), { loading: () => <p>Loading Pipelines...</p> });
const ScheduleTab = dynamic(() => import("./components/tabs/ScheduleTab").then(mod => mod.ScheduleTab), { loading: () => <p>Loading Schedule...</p> });
const ArchitectureTab = dynamic(() => import("./components/tabs/ArchitectureTab").then(mod => mod.ArchitectureTab), { loading: () => <p>Loading Architecture...</p> });
const ChatTab = dynamic(() => import("./components/tabs/ChatTab").then(mod => mod.ChatTab), { loading: () => <p>Loading Chat...</p> });
const ResearchTab = dynamic(() => import("./components/tabs/ResearchTab").then(mod => mod.ResearchTab), { loading: () => <p>Loading Research...</p> });
const CrabwalkTab = dynamic(() => import("./components/tabs/CrabwalkTab").then(mod => mod.CrabwalkTab), { loading: () => <p>Loading Crabwalk...</p> });
const MapaTab = dynamic(() => import("./components/tabs/MapaTab").then(mod => mod.MapaTab), { loading: () => <p>Loading Map...</p> });
const OperacionalTab = dynamic(() => import("./components/tabs/OperacionalTab").then(mod => mod.OperacionalTab), { loading: () => <p>Loading Operations...</p> });
const FinanceiroTab = dynamic(() => import("./components/tabs/FinanceiroTab").then(mod => mod.FinanceiroTab), { loading: () => <p>Loading Finance...</p> });
const SegurancaTab = dynamic(() => import("./components/tabs/SegurancaTab").then(mod => mod.SegurancaTab), { loading: () => <p>Loading Security...</p> });

// Other Components
const OfertasHub = dynamic(() => import("./ofertas"), { loading: () => <p>Loading Ofertas...</p> });
const VerticaisHub = dynamic(() => import("./VerticaisHub"), { loading: () => <p>Loading Projects...</p> });
const DocsTab = dynamic(() => import("./components/tabs/DocsTab").then(mod => mod.DocsTab), { loading: () => <p>Loading Docs...</p> });

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

        {activeTab === "bu_hub" && (
          <BusinessUnitsHub />
        )}

        {activeTab === "ofertas" && (
          <OfertasHub />
        )}

        {activeTab === "verticais" && (
          <VerticaisHub />
        )}

        {activeTab === "mapa" && (
          <MapaTab />
        )}

        {activeTab === "operacional" && (
          <OperacionalTab />
        )}

        {activeTab === "financeiro" && (
          <FinanceiroTab />
        )}

        {activeTab === "seguranca" && (
          <SegurancaTab />
        )}

        {activeTab === "docs" && (
          <DocsTab />
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
