"use client";

import { useEffect, useState } from "react";

type Skill = { name: string; files: string[]; updatedAtMs: number };

type SkillsResp = {
  ok: boolean;
  skillsRoot?: string;
  count?: number;
  skills?: Skill[];
  error?: string;
};

export default function SkillsSummary() {
  const [data, setData] = useState<SkillsResp | null>(null);

  async function refresh() {
    const res = await fetch("/api/skills", { cache: "no-store" });
    const json = (await res.json()) as SkillsResp;
    setData(json);
  }

  useEffect(() => {
    const t0 = setTimeout(refresh, 0);
    const t = setInterval(refresh, 60_000);
    return () => {
      clearTimeout(t0);
      clearInterval(t);
    };
  }, []);

  const skills = data?.skills || [];

  return (
    <section
      style={{
        border: "1px solid #333",
        borderRadius: 14,
        padding: 14,
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>Skills (Clawdbot)</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {data?.ok
              ? `${data.count} instaladas`
              : data?.error
                ? data.error
                : "carregando…"}
          </div>
        </div>
      </div>

      {data?.ok ? (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 10,
          }}
        >
          {skills.map((s) => (
            <span
              key={s.name}
              style={{
                fontSize: 12,
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid #2a2a2a",
                background: "rgba(0,0,0,0.25)",
              }}
              title={`${s.files.join(", ") || "(no SKILL.md found)"}`}
            >
              {s.name}
            </span>
          ))}
        </div>
      ) : null}

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.6 }}>
        Próximo: mapear quais skills usamos por produto + lacunas.
      </div>
    </section>
  );
}
