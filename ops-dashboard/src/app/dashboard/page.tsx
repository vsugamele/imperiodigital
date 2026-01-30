import { createClient } from "@/lib/supabase/server";
import StatusBadge from "./StatusBadge";
import MarketingSummary from "./MarketingSummary";
import CostsSummary from "./CostsSummary";
import SkillsSummary from "./SkillsSummary";
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
  const selectedLabelRaw = sp.label;
  const selectedLabel = Array.isArray(selectedLabelRaw)
    ? selectedLabelRaw[0]
    : selectedLabelRaw;
  const labelFilter = !selectedLabel || selectedLabel === "all" ? null : selectedLabel;

  let { data: boards } = await supabase
    .from("boards")
    .select("id,title,created_at")
    .order("created_at", { ascending: true });

  // Single-board mode: ensure a single main board exists and migrate legacy boards if present.
  const MAIN_TITLE = "Master";

  if (user) {
    const main = (boards || []).find((b) => b.title === MAIN_TITLE);

    if (!main) {
      // Create main board + columns
      const { data: createdMain } = await supabase
        .from("boards")
        .insert({ owner_id: user.id, title: MAIN_TITLE })
        .select("id,title,created_at")
        .single();

      if (createdMain) {
        await supabase.from("columns").insert([
          { board_id: createdMain.id, owner_id: user.id, title: "Backlog", position: 0 },
          { board_id: createdMain.id, owner_id: user.id, title: "Doing", position: 1 },
          { board_id: createdMain.id, owner_id: user.id, title: "Blocked", position: 2 },
          { board_id: createdMain.id, owner_id: user.id, title: "Done", position: 3 },
        ]);
        boards = [createdMain];
      }
    }

    // If there are other boards besides MAIN, migrate their cards into MAIN with labels.
    const boardsNow = boards || [];
    const mainBoard = boardsNow.find((b) => b.title === MAIN_TITLE) || boardsNow[0];

    if (mainBoard) {
      // Fetch main columns
      const { data: mainCols } = await supabase
        .from("columns")
        .select("id,title")
        .eq("board_id", mainBoard.id);

      const colIdByTitle = new Map((mainCols || []).map((c) => [c.title, c.id]));

      // Find legacy boards (any not MAIN)
      const legacyBoards = (await supabase
        .from("boards")
        .select("id,title")
        .neq("id", mainBoard.id)).data as Array<{ id: string; title: string }> | null;

      if (legacyBoards && legacyBoards.length > 0) {
        for (const lb of legacyBoards) {
          // Fetch legacy columns
          const { data: lbCols } = await supabase
            .from("columns")
            .select("id,title")
            .eq("board_id", lb.id);

          const titleByColId = new Map((lbCols || []).map((c) => [c.id, c.title]));

          const { data: lbCards } = await supabase
            .from("cards")
            .select("id,title,description,position,column_id")
            .eq("board_id", lb.id);

          for (const card of lbCards || []) {
            const fromColTitle = titleByColId.get(card.column_id) || "";

            const toTitle =
              fromColTitle === "Doing" || fromColTitle === "Produção"
                ? "Doing"
                : fromColTitle === "Done" || fromColTitle === "Postado" || fromColTitle === "Agendado"
                  ? "Done"
                  : fromColTitle === "Blocked" || fromColTitle === "Erros" || fromColTitle === "Ajustes"
                    ? "Blocked"
                    : "Backlog";

            const toColumnId = colIdByTitle.get(toTitle) || colIdByTitle.get("Backlog");
            if (!toColumnId) continue;

            const label = lb.title.includes("Pedro")
              ? "Marketing:Pedro"
              : lb.title.includes("PetSelectUK")
                ? "Marketing:PetSelectUK"
                : lb.title.includes("Marketing")
                  ? "Marketing"
                  : "Ops";

            await supabase.from("cards").insert({
              board_id: mainBoard.id,
              column_id: toColumnId,
              owner_id: user.id,
              title: card.title,
              description: card.description,
              position: card.position ?? 0,
              labels: [label],
            });
          }

          // Cleanup legacy board content
          await supabase.from("cards").delete().eq("board_id", lb.id);
          await supabase.from("columns").delete().eq("board_id", lb.id);
          await supabase.from("boards").delete().eq("id", lb.id);
        }

        // Refresh boards after migration
        boards = (await supabase
          .from("boards")
          .select("id,title,created_at")
          .order("created_at", { ascending: true })).data;
      }
    }
  }

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

    // Seed initial cards if empty (autopilot roadmap)
    if (user && columns.length && cards.length === 0) {
      const colBacklog = columns.find((c) => c.title === "Backlog")?.id;
      if (colBacklog) {
        await supabase.from("cards").insert([
          {
            board_id: activeBoard.id,
            column_id: colBacklog,
            owner_id: user.id,
            title: "(Ops) Rodar SQL migration: labels (cards.labels)",
            description:
              "Rodar C:/Users/vsuga/clawd/ops-dashboard/supabase/kanban-migration-singleboard.sql no Supabase SQL Editor.",
            position: 0,
            labels: ["Ops"],
          },
          {
            board_id: activeBoard.id,
            column_id: colBacklog,
            owner_id: user.id,
            title: "(Ops) Filtro por labels (Todos/Ops/Pedro/PetSelectUK)",
            description: "Chips no topo filtrando cards por labels.",
            position: 0,
            labels: ["Ops"],
          },
          {
            board_id: activeBoard.id,
            column_id: colBacklog,
            owner_id: user.id,
            title: "(Ops) Status Alex: standby/pensando/trabalhando no topo",
            description: "Já existe /api/status. Melhorar para refletir estado real.",
            position: 0,
            labels: ["Ops"],
          },
          {
            board_id: activeBoard.id,
            column_id: colBacklog,
            owner_id: user.id,
            title: "(Marketing) Importar posting-log-v2.csv e gerar resumo por perfil",
            description:
              "Leitura do results/posting-log-v2.csv e cards/resumo por status (scheduled/posted/pending/failed).",
            position: 0,
            labels: ["Marketing:Pedro", "Marketing:PetSelectUK"],
          },
        ]);

        // re-fetch after seed
        const { data: seeded } = await supabase
          .from("cards")
          .select("id,title,description,position,column_id,labels")
          .eq("board_id", activeBoard.id)
          .order("position", { ascending: true });
        cards = (seeded ?? []) as typeof cards;
      }
    }
  }

  const visibleCards = labelFilter
    ? cards.filter((c) => (c.labels || []).includes(labelFilter))
    : cards;

  return (
    <main style={{ maxWidth: 1100, margin: "40px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Ops Dashboard</h1>
          <p style={{ opacity: 0.8, marginTop: 8 }}>
            Logado como: <b>{user?.email}</b>
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge />
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid #333",
                background: "#111",
                color: "#fff",
                cursor: "pointer",
                height: 42,
                alignSelf: "flex-start",
              }}
            >
              Sair
            </button>
          </form>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <MarketingSummary />
      </div>

      <div style={{ marginTop: 12 }}>
        <CostsSummary />
      </div>

      <div style={{ marginTop: 12 }}>
        <SkillsSummary />
      </div>

      <hr style={{ margin: "20px 0", opacity: 0.2 }} />

      {!activeBoard ? (
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Kanban</h2>
          <p style={{ opacity: 0.8 }}>
            Não encontrei nenhum board. Se você já rodou o SQL, faz refresh.
          </p>

          <p style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
            SQL: <code>C:\Users\vsuga\clawd\ops-dashboard\supabase\kanban-schema.sql</code>
          </p>
        </section>
      ) : (
        <section>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Kanban</h2>
              <span style={{ opacity: 0.7 }}>Visão única + labels</span>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(() => {
                const labelSet = new Set<string>();
                for (const c of cards || []) {
                  for (const l of c.labels || []) labelSet.add(l);
                }

                // Prefer showing some common labels first (if present), then the rest.
                const preferred = [
                  "Pedro",
                  "Jonathan",
                  "Marketing:Pedro",
                  "Marketing:PetSelectUK",
                  "Marketing",
                  "Ops",
                  "Data",
                  "Security",
                ];

                const all = Array.from(labelSet);
                const sorted = [
                  ...preferred.filter((x) => labelSet.has(x)),
                  ...all
                    .filter((x) => !preferred.includes(x))
                    .sort((a, b) => a.localeCompare(b)),
                ];

                const options = [
                  { label: "Todos", value: "all" },
                  ...sorted.map((value) => ({
                    value,
                    // Cosmetic label only; filtering uses the raw value.
                    label: value.replace(/^Marketing:/, ""),
                  })),
                ];

                return options.map((x) => {
                  const active = (x.value === "all" && !labelFilter) || labelFilter === x.value;
                  return (
                    <a
                      key={x.value}
                      href={`/dashboard?label=${encodeURIComponent(x.value)}`}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "1px solid #333",
                        textDecoration: "none",
                        color: active ? "#fff" : "#bbb",
                        background: active ? "#111" : "transparent",
                        fontSize: 12,
                      }}
                      title={x.value === "all" ? "" : `Filtrar por label: ${x.value}`}
                    >
                      {x.label}
                    </a>
                  );
                });
              })()}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.max(1, columns?.length || 1)}, minmax(240px, 1fr))`,
              gap: 12,
              marginTop: 12,
            }}
          >
            {columns.map((col, idx) => (
              <div
                key={col.id}
                style={{
                  border: "1px solid #333",
                  borderRadius: 12,
                  padding: 12,
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 10 }}>{col.title}</div>

                <form action={createCard} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input type="hidden" name="board_id" value={activeBoard.id} />
                  <input type="hidden" name="column_id" value={col.id} />
                  <input type="hidden" name="labels" value={labelFilter ?? ""} />
                  <input
                    name="title"
                    placeholder="Novo card..."
                    style={{
                      flex: 1,
                      padding: 8,
                      border: "1px solid #2a2a2a",
                      borderRadius: 10,
                      background: "rgba(0,0,0,0.25)",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "1px solid #2a2a2a",
                      background: "#111",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                    title="Adicionar"
                  >
                    +
                  </button>
                </form>

                <div style={{ display: "grid", gap: 8 }}>
                  {visibleCards
                    .filter((c) => c.column_id === col.id)
                    .map((card) => (
                      <div
                        key={card.id}
                        style={{
                          border: "1px solid #2a2a2a",
                          borderRadius: 10,
                          padding: 10,
                          background: "rgba(0,0,0,0.3)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ display: "grid", gap: 4 }}>
                            <div style={{ fontWeight: 600 }}>{card.title}</div>
                            {card.labels && card.labels.length ? (
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {card.labels.map((l) => (
                                  <span
                                    key={l}
                                    style={{
                                      fontSize: 11,
                                      padding: "2px 6px",
                                      borderRadius: 999,
                                      border: "1px solid #333",
                                      opacity: 0.85,
                                    }}
                                  >
                                    {l}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          <div style={{ display: "flex", gap: 6 }}>
                            {idx > 0 ? (
                              <form action={moveCard}>
                                <input type="hidden" name="card_id" value={card.id} />
                                <input
                                  type="hidden"
                                  name="to_column_id"
                                  value={columns[idx - 1].id}
                                />
                                <button
                                  type="submit"
                                  style={{
                                    border: "1px solid #333",
                                    background: "transparent",
                                    color: "#ddd",
                                    borderRadius: 8,
                                    padding: "2px 6px",
                                    cursor: "pointer",
                                  }}
                                  title="Mover pra esquerda"
                                >
                                  ←
                                </button>
                              </form>
                            ) : null}

                            {idx < columns.length - 1 ? (
                              <form action={moveCard}>
                                <input type="hidden" name="card_id" value={card.id} />
                                <input
                                  type="hidden"
                                  name="to_column_id"
                                  value={columns[idx + 1].id}
                                />
                                <button
                                  type="submit"
                                  style={{
                                    border: "1px solid #333",
                                    background: "transparent",
                                    color: "#ddd",
                                    borderRadius: 8,
                                    padding: "2px 6px",
                                    cursor: "pointer",
                                  }}
                                  title="Mover pra direita"
                                >
                                  →
                                </button>
                              </form>
                            ) : null}

                            <form action={deleteCard}>
                              <input type="hidden" name="card_id" value={card.id} />
                              <button
                                type="submit"
                                style={{
                                  border: "1px solid #333",
                                  background: "transparent",
                                  color: "#ff6b6b",
                                  borderRadius: 8,
                                  padding: "2px 6px",
                                  cursor: "pointer",
                                }}
                                title="Apagar"
                              >
                                ×
                              </button>
                            </form>
                          </div>
                        </div>

                        {card.description ? (
                          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                            {card.description}
                          </div>
                        ) : null}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
            Próximo: adicionar CRUD de cards + mover (drag & drop).
          </p>
        </section>
      )}
    </main>
  );
}
