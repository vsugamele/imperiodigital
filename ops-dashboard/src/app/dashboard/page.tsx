import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "./StatusBadge";
import ActivityLog from "./ActivityLog";
import MarketingSummary from "./MarketingSummary";
import CostsSummary from "./CostsSummary";
import SkillsSummary from "./SkillsSummary";
import BlueprintSection from "./BlueprintSection";
import ArchitectureMap from "./ArchitectureMap";
import RoutineTimeline from "./RoutineTimeline";
import AlexMonitor from "./AlexMonitor";
import TaskMap from "./TaskMap";
import OperationalManual from "./OperationalManual";
import PipelineHealth from "./PipelineHealth";
import TokenTracker from "./TokenTracker";
import ProjectBacklog from "./ProjectBacklog";
import ScriptRunner from "./ScriptRunner";
import ProjectManager from "./ProjectManager";
import NotificationCenter from "./NotificationCenter";
import SecurityDashboard from "./SecurityDashboard";
import SkillsHub from "./SkillsHub";
import LiveLogs from "./LiveLogs";
import ActionApprovalModal from "./ActionApprovalModal";
import { createCard, moveCard, deleteCard } from "./actions";


export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sp = (await searchParams) ?? {};

  // Tab handling
  const currentTab = typeof sp.tab === 'string' ? sp.tab : 'overview';
  const showApproval = sp.demo_approve === 'true';

  // Label handling
  const selectedLabelRaw = sp.label;
  const selectedLabel = Array.isArray(selectedLabelRaw)
    ? selectedLabelRaw[0]
    : selectedLabelRaw;
  const labelFilter = !selectedLabel || selectedLabel === "all" ? null : selectedLabel;

  // Data Loading
  const { data: boards } = await supabase
    .from("boards")
    .select("id,title,created_at")
    .order("created_at", { ascending: true });

  const MAIN_TITLE = "Master";
  const activeBoard = (boards || []).find((b) => b.title === MAIN_TITLE) ?? boards?.[0];

  let columns: Array<{ id: string; title: string; position: number }> = [];
  let cards: Array<{
    id: string;
    title: string;
    description: string | null;
    position: number;
    column_id: string;
    labels: string[];
  }> = [];

  // Fetch Kanban data
  if (activeBoard) {
    const { data: colData } = await supabase
      .from("columns")
      .select("id,title,position")
      .eq("board_id", activeBoard.id)
      .order("position", { ascending: true });

    const { data: cardData } = await supabase
      .from("cards")
      .select("id,title,description,position,column_id,labels")
      .eq("board_id", activeBoard.id)
      .order("position", { ascending: true });

    columns = (colData ?? []) as typeof columns;
    cards = (cardData ?? []) as typeof cards;
  }

  const allLabels = Array.from(new Set(cards.flatMap((c) => c.labels || []))).sort();

  // Helper for consistent links
  const getTabUrl = (tabId: string) => `?tab=${tabId}${labelFilter ? `&label=${encodeURIComponent(labelFilter)}` : ''}`;

  return (
    <main className="min-h-screen" style={{ paddingBottom: '80px' }}>
      <ActionApprovalModal
        isOpen={showApproval}
        action={{
          type: "Shell Command Execution",
          target: "rm -rf caches/temp_logs_*",
          risk: "medium"
        }}
      />

      <header style={{
        padding: '24px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(10,10,10,0.8)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h1 style={{
                margin: 0,
                fontSize: '32px',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Empire <span style={{ color: 'var(--accent)', WebkitTextFillColor: 'initial' }}>Command Center</span>
              </h1>
              <div style={{
                background: 'rgba(78, 220, 136, 0.1)',
                color: 'var(--accent)',
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '10px',
                fontWeight: 800,
                border: '1px solid rgba(78, 220, 136, 0.2)',
                letterSpacing: '0.05em'
              }}>PRO MODE</div>
            </div>
            <p style={{ margin: '8px 0 0 0', opacity: 0.5, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4edc88', boxShadow: '0 0 10px #4edc88' }}></span>
              Sistemas Online & Operacionais — <span style={{ fontWeight: 600 }}>{user?.email}</span>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
            <StatusBadge />
            <NotificationCenter />
            <form action="/auth/signout" method="post" style={{ flexShrink: 0 }}>
              <button className="glass-card" style={{
                padding: '10px 24px',
                background: 'rgba(255, 107, 107, 0.1)',
                color: '#ff6b6b',
                border: '1px solid rgba(255, 107, 107, 0.2)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}>Sair</button>
            </form>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          maxWidth: '1400px',
          margin: '24px auto 0',
          display: 'flex',
          gap: '8px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '16px'
        }}>
          {[
            { id: 'overview', label: 'Visão Geral', icon: '📈' },
            { id: 'ops', label: 'Operações & Jobs', icon: '📟' },
            { id: 'intel', label: 'Inteligência & Tasks', icon: '🧠' },
            { id: 'projects', label: 'Projetos', icon: '📂' },
            { id: 'security', label: 'Segurança & Governança', icon: '🛡️' },
            { id: 'skills', label: 'Skills Hub', icon: '🧩' }
          ].map(tab => (
            <Link
              key={tab.id}
              href={getTabUrl(tab.id)}
              prefetch={true}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                color: currentTab === tab.id ? 'var(--accent)' : 'rgba(255,255,255,0.6)',
                background: currentTab === tab.id ? 'rgba(78, 220, 136, 0.1)' : 'transparent',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: currentTab === tab.id ? '1px solid rgba(78, 220, 136, 0.2)' : '1px solid transparent'
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </Link>
          ))}

          {/* Command Center Quick Access */}
          <Link
            href="/dashboard/command-center"
            prefetch={true}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              color: '#a78bfa',
              background: 'rgba(167, 139, 250, 0.1)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(167, 139, 250, 0.2)',
              marginLeft: 'auto'
            }}
          >
            <span>🦀</span> Command Center
          </Link>
        </nav>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
        {currentTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
            <AlexMonitor />
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
              <MarketingSummary />
              <TokenTracker />
            </div>
            <ActivityLog />
          </div>
        )}

        {currentTab === 'ops' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <PipelineHealth />
                <ScriptRunner />
                <LiveLogs />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <RoutineTimeline />
                <OperationalManual />
              </div>
            </div>

            {/* Kanban Section in Ops Tab */}
            <section style={{ marginTop: '20px' }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: '24px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>Kamban Master</h2>
                  <p style={{ margin: '4px 0 0 0', opacity: 0.5, fontSize: '14px' }}>Fluxo de trabalho orquestrado em tempo real</p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <Link href="?tab=ops&label=all" style={{
                    padding: "6px 16px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    textDecoration: "none",
                    background: labelFilter === null ? "var(--accent)" : "rgba(255,255,255,0.05)",
                    color: labelFilter === null ? "#000" : "#fff"
                  }}>All</Link>
                  {allLabels.map(l => (
                    <Link key={l} href={`?tab=ops&label=${encodeURIComponent(l)}`} style={{
                      padding: "6px 16px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 700,
                      textDecoration: "none",
                      background: labelFilter === l ? "var(--accent)" : "rgba(255,255,255,0.05)",
                      color: labelFilter === l ? "#000" : "#fff"
                    }}>{l.replace('Marketing:', '')}</Link>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'flex',
                overflowX: 'auto',
                paddingBottom: '20px',
                gap: '24px',
                alignItems: 'start'
              }}>
                {columns.map((col, cIdx) => (
                  <div key={col.id} className="glass-card" style={{ padding: '20px', minHeight: '500px', minWidth: '320px', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>
                        {col.title}
                      </h3>
                      <span style={{ fontSize: '12px', fontWeight: 700, opacity: 0.4 }}>
                        {cards.filter(c => c.column_id === col.id && (!labelFilter || c.labels?.includes(labelFilter))).length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {cards
                        .filter((card) => card.column_id === col.id && (!labelFilter || card.labels?.includes(labelFilter)))
                        .map((card) => (
                          <div key={card.id} className="glass-card" style={{
                            padding: '16px',
                            fontSize: '14px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            position: 'relative'
                          }}>
                            <div style={{ fontWeight: 700, marginBottom: '6px' }}>{card.title}</div>
                            {card.description && (
                              <p style={{ margin: 0, fontSize: '12px', opacity: 0.5, lineHeight: 1.4 }}>{card.description}</p>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {card.labels?.map(l => (
                                  <span key={l} style={{
                                    fontSize: '9px',
                                    background: 'rgba(78, 220, 136, 0.1)',
                                    color: 'var(--accent)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 800
                                  }}>{l.replace('Marketing:', '')}</span>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {cIdx > 0 && (
                                  <form action={async (fd) => {
                                    "use server";
                                    await moveCard(fd);
                                  }}>
                                    <input type="hidden" name="card_id" value={card.id} />
                                    <input type="hidden" name="to_column_id" value={columns[cIdx - 1].id} />
                                    <button type="submit" style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#fff', opacity: 0.3 }}>←</button>
                                  </form>
                                )}
                                {cIdx < columns.length - 1 && (
                                  <form action={async (fd) => {
                                    "use server";
                                    await moveCard(fd);
                                  }}>
                                    <input type="hidden" name="card_id" value={card.id} />
                                    <input type="hidden" name="to_column_id" value={columns[cIdx + 1].id} />
                                    <button type="submit" style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#fff', opacity: 0.3 }}>→</button>
                                  </form>
                                )}
                                <form action={async (fd) => {
                                  "use server";
                                  await deleteCard(fd);
                                }}>
                                  <input type="hidden" name="card_id" value={card.id} />
                                  <button type="submit" style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#ff6b6b', opacity: 0.5 }}>×</button>
                                </form>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {currentTab === 'intel' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
            <ProjectBacklog />
            <ArchitectureMap />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <BlueprintSection />
              <SkillsSummary />
            </div>
            <TaskMap />
          </div>
        )}

        {currentTab === 'projects' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
            <ProjectManager />
          </div>
        )}

        {currentTab === 'security' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
            <SecurityDashboard />
          </div>
        )}

        {currentTab === 'skills' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
            <SkillsHub />
          </div>
        )}
      </div>
    </main>
  );
}
