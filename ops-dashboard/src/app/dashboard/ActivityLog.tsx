"use client";

import { useEffect, useState } from "react";

type Activity = {
  lines: string[];
  path: string;
  nowMs: number;
};

export default function ActivityLog() {
  const [data, setData] = useState<Activity | null>(null);

  async function refresh() {
    const res = await fetch("/api/activity", { cache: "no-store" });
    const json = (await res.json()) as Activity;
    setData(json);
  }

  useEffect(() => {
    const t0 = setTimeout(refresh, 0);
    const t = setInterval(refresh, 10_000);
    return () => {
      clearTimeout(t0);
      clearInterval(t);
    };
  }, []);

  const lines = data?.lines ?? [];

  return (
    <section className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent)' }}>📟</span> Terminal de Atividade
        </h3>
        <div style={{ opacity: 0.6, fontSize: '11px', textTransform: 'uppercase' }} title={data?.path || ""}>
          {lines.length} entradas recentes
        </div>
      </div>

      {lines.length === 0 ? (
        <div style={{ opacity: 0.7, marginTop: 8, fontSize: 12 }}>Sem atividade registrada ainda.</div>
      ) : (
        <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
          {lines
            .slice()
            .reverse()
            .slice(0, 20)
            .map((l, idx) => (
              <div
                key={idx}
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                  fontSize: 12,
                  opacity: 0.9,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {l}
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
