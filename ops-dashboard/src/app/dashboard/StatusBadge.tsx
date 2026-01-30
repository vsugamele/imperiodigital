"use client";

import { useEffect, useState } from "react";

type Status = {
  state: "working" | "standby" | "offline";
  lastActivityMs: number | null;
  ageMs: number | null;
  nowMs: number;
};

function fmtAge(ms: number | null) {
  if (ms == null) return "—";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h`;
}

export default function StatusBadge() {
  const [status, setStatus] = useState<Status | null>(null);

  async function refresh() {
    const res = await fetch("/api/status", { cache: "no-store" });
    const json = (await res.json()) as Status;
    setStatus(json);
  }

  useEffect(() => {
    const t0 = setTimeout(refresh, 0);
    const t = setInterval(refresh, 10_000);
    return () => {
      clearTimeout(t0);
      clearInterval(t);
    };
  }, []);

  const state = status?.state ?? "offline";
  const color =
    state === "working" ? "#4ade80" : state === "standby" ? "#fbbf24" : "#ff6b6b";

  const label =
    state === "working" ? "Trabalhando" : state === "standby" ? "Standby" : "Offline";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: "1px solid #333",
        borderRadius: 999,
        padding: "6px 10px",
        background: "rgba(0,0,0,0.25)",
        fontSize: 12,
      }}
      title={status?.ageMs != null ? `Última atividade há ${fmtAge(status.ageMs)}` : ""}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: color,
          boxShadow: `0 0 0 3px rgba(255,255,255,0.04)`
        }}
      />
      <span style={{ opacity: 0.9 }}>Alex:</span>
      <b style={{ color }}>{label}</b>
      <span style={{ opacity: 0.6 }}>({fmtAge(status?.ageMs ?? null)})</span>
    </div>
  );
}
