"use client";

import { useEffect, useState } from "react";

type Summary = {
  ok: boolean;
  error?: string;
  window?: number;
  total?: Record<string, number>;
  byProfile?: Record<string, Record<string, number>>;
  lastRow?: unknown;
};

export default function MarketingSummary() {
  const [data, setData] = useState<Summary | null>(null);

  async function refresh() {
    const res = await fetch("/api/marketing-summary", { cache: "no-store" });
    const json = (await res.json()) as Summary;
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

  if (!data) {
    return (
      <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12, opacity: 0.8 }}>
        Carregando marketing…
      </div>
    );
  }

  if (!data.ok) {
    return (
      <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12, color: "#ff6b6b" }}>
        Marketing summary error: {data.error}
      </div>
    );
  }

  const profiles = Object.entries(data.byProfile || {}).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800 }}>Marketing — últimos {data.window} registros</div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Total: {Object.entries(data.total || {})
            .map(([k, v]) => `${k}:${v}`)
            .join("  ")}
        </div>
      </div>

      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        {profiles.map(([profile, counts]) => (
          <div key={profile} style={{ border: "1px solid #2a2a2a", borderRadius: 12, padding: 10 }}>
            <div style={{ fontWeight: 700 }}>{profile}</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85, lineHeight: 1.6 }}>
              {Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <span>{k}</span>
                    <b>{v}</b>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
