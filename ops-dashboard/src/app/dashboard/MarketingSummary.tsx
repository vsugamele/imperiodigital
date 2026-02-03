"use client";

import { useEffect, useState } from "react";

type Summary = {
  ok: boolean;
  error?: string;
  window?: number;
  total?: Record<string, number>;
  byProfile?: Record<string, Record<string, number>>;
  scheduledPosts?: Array<{ profile: string; date: string; platform: string }>;
  lastRow?: unknown;
};

// Default fallback data
const defaultData: Summary = {
  ok: true,
  window: 0,
  total: { scheduled: 0, posted: 0 },
  byProfile: {},
  scheduledPosts: []
};

export default function MarketingSummary() {
  const [data, setData] = useState<Summary>(defaultData);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await fetch("/api/marketing-summary", { cache: "no-store" });
      if (res.ok) {
        const json = (await res.json()) as Summary;
        if (json.ok) setData(json);
      }
    } catch {
      // Keep default data on error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
  }, []);

  const profiles = Object.entries(data.byProfile || {}).sort((a, b) => a[0].localeCompare(b[0]));
  const rows = data.window || 0;
  const hasData = profiles.length > 0;

  return (
    <section className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>📈</span> Performance de Marketing
          </h3>
          <p style={{ fontSize: '11px', opacity: 0.5, marginTop: '4px' }}>
            Métricas consolidadas VaaS
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent)' }}>{rows}</div>
          <div style={{ fontSize: '9px', opacity: 0.5, textTransform: 'uppercase' }}>Posts</div>
        </div>
      </div>

      {!hasData ? (
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '10px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>
            Sem dados de marketing
          </div>
          <div style={{ fontSize: '10px', opacity: 0.4, marginTop: '4px' }}>
            Execute o pipeline VaaS para gerar métricas
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {profiles.map(([profile, counts]) => (
              <div key={profile} style={{
                background: 'rgba(255,255,255,0.02)',
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 10,
                padding: 12
              }}>
                <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>{profile.toUpperCase()}</div>
                <div style={{ fontSize: 11, opacity: 0.8, lineHeight: 1.5 }}>
                  {Object.entries(counts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 4)
                    .map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <span style={{ opacity: 0.5 }}>{k}</span>
                        <b style={{ color: k === 'scheduled' ? 'var(--accent)' : 'inherit' }}>{v}</b>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {data.scheduledPosts && data.scheduledPosts.length > 0 && (
            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 700, opacity: 0.6 }}>
                  📅 Próximos Agendamentos
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.scheduledPosts.slice(0, 5).map((post, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 16px',
                    background: 'rgba(78, 220, 136, 0.03)',
                    border: '1px solid rgba(78, 220, 136, 0.1)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}>
                    <span style={{ fontWeight: 700, opacity: 0.9 }}>{post.profile}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 800, fontFamily: 'monospace' }}>
                      {new Date(post.date).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
