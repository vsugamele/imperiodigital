export const dynamic = "force-dynamic";

type Automation = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  schedule: { kind: string; expr: string; tz: string };
  state: {
    nextRunAtMs: number | null;
    lastRunAtMs: number | null;
    lastStatus: string | null;
    lastDurationMs: number | null;
  };
};

async function getData() {
  const res = await fetch("http://localhost:3000/api/automations", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  return (await res.json()) as { jobs: Automation[] };
}

function fmt(ms: number | null) {
  if (!ms) return "—";
  const d = new Date(ms);
  return d.toLocaleString();
}

export default async function AutomationsPage() {
  const data = await getData();
  const jobs = data.jobs || [];

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Automações</h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>
        Jobs do cron do Clawdbot (lidos localmente). Próximo passo: healthcheck D+1 (alerta se faltar agendamento).
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        {jobs.map((j) => (
          <div
            key={j.id}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: 14,
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{j.name}</div>
                {j.description ? <div style={{ opacity: 0.8, fontSize: 13 }}>{j.description}</div> : null}
              </div>
              <div style={{ textAlign: "right", fontSize: 13 }}>
                <div>
                  <b>{j.enabled ? "enabled" : "disabled"}</b>
                </div>
                <div style={{ opacity: 0.8 }}>{j.schedule.expr || ""}</div>
                <div style={{ opacity: 0.7 }}>{j.schedule.tz || ""}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 12, fontSize: 13 }}>
              <div>
                <div style={{ opacity: 0.7 }}>Last run</div>
                <div>{fmt(j.state.lastRunAtMs)}</div>
                <div style={{ opacity: 0.8 }}>{j.state.lastStatus || "—"}</div>
              </div>
              <div>
                <div style={{ opacity: 0.7 }}>Next run</div>
                <div>{fmt(j.state.nextRunAtMs)}</div>
                <div style={{ opacity: 0.8 }}>{j.state.lastDurationMs != null ? `${j.state.lastDurationMs}ms` : "—"}</div>
              </div>
            </div>
          </div>
        ))}

        {!jobs.length ? <div style={{ opacity: 0.7 }}>Nenhum job encontrado.</div> : null}
      </div>
    </main>
  );
}
