"use client";

import { useEffect, useState } from "react";

type Costs = {
  ok: boolean;
  currency: string;
  today: string;
  month: string;
  rows: number;
  totals: { today: number; month: number };
  byProject: { today: Record<string, number>; month: Record<string, number> };
  note?: string;
};

function money(x: number) {
  if (!isFinite(x)) return "—";
  return `$${x.toFixed(4)}`;
}

export default function CostsSummary() {
  const [data, setData] = useState<Costs | null>(null);

  async function refresh() {
    const res = await fetch("/api/costs", { cache: "no-store" });
    const json = (await res.json()) as Costs;
    setData(json);
  }

  useEffect(() => {
    const t0 = setTimeout(refresh, 0);
    const t = setInterval(refresh, 30_000);
    return () => {
      clearTimeout(t0);
      clearInterval(t);
    };
  }, []);

  const projects = Array.from(
    new Set([
      ...Object.keys(data?.byProject?.today || {}),
      ...Object.keys(data?.byProject?.month || {}),
    ])
  ).sort((a, b) => a.localeCompare(b));

  return (
    <section className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>💰</span> Ledger de Custos (IA)
          </h3>
          <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>
            Hoje ({data?.today ?? "—"}) e mês ({data?.month ?? "—"})
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'Outfit' }}>
            {money(data?.totals?.today ?? 0)}
          </div>
          <div style={{ fontSize: '10px', opacity: 0.6, textTransform: 'uppercase' }}>Total Hoje</div>
        </div>
      </div>

      {data?.note ? (
        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>{data.note}</div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 10,
          marginTop: 12,
        }}
      >
        {projects.length ? (
          projects.map((p) => (
            <div
              key={p}
              style={{
                border: "1px solid #2a2a2a",
                borderRadius: 12,
                padding: 10,
                background: "rgba(0,0,0,0.25)",
              }}
            >
              <div style={{ fontWeight: 700 }}>{p}</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                Hoje: <b>{money((data?.byProject?.today || {})[p] || 0)}</b>
              </div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                Mês: <b>{money((data?.byProject?.month || {})[p] || 0)}</b>
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Sem dados ainda (vamos começar a registrar as chamadas).
          </div>
        )}
      </div>
    </section>
  );
}
