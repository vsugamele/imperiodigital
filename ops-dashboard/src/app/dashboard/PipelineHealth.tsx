"use client";

import { useEffect, useState } from "react";

type PipelineProduct = {
  ok: boolean;
  profile: string;
  status: "completed" | "running" | "failed" | "pending";
  lastRun: string | null;
  hasRecentVideo: boolean;
  expectedPerDay: number;
  generatedToday: number;
  steps: {
    download: { count: number; ok: boolean };
    generate: { count: number; ok: boolean };
    video: { count: number; ok: boolean };
    upload: { count: number; ok: boolean };
    schedule: { count: number; ok: boolean; errors: string[] };
  };
};

type Report = {
  generatedAt: string;
  products: PipelineProduct[];
  summary: {
    total: number;
    healthy: number;
    running: number;
    failed: number;
    pending: number;
  };
};

// Default fallback data with demo products
const defaultReport: Report = {
  generatedAt: new Date().toISOString(),
  products: [
    {
      ok: true,
      profile: "TEO",
      status: "completed",
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      hasRecentVideo: true,
      expectedPerDay: 6,
      generatedToday: 6,
      steps: {
        download: { count: 6, ok: true },
        generate: { count: 6, ok: true },
        video: { count: 6, ok: true },
        upload: { count: 6, ok: true },
        schedule: { count: 6, ok: true, errors: [] }
      }
    },
    {
      ok: true,
      profile: "JONATHAN",
      status: "completed",
      lastRun: new Date(Date.now() - 5400000).toISOString(),
      hasRecentVideo: true,
      expectedPerDay: 6,
      generatedToday: 6,
      steps: {
        download: { count: 6, ok: true },
        generate: { count: 6, ok: true },
        video: { count: 6, ok: true },
        upload: { count: 6, ok: true },
        schedule: { count: 6, ok: true, errors: [] }
      }
    },
    {
      ok: false,
      profile: "LAISE",
      status: "running",
      lastRun: new Date(Date.now() - 1800000).toISOString(),
      hasRecentVideo: false,
      expectedPerDay: 6,
      generatedToday: 4,
      steps: {
        download: { count: 6, ok: true },
        generate: { count: 5, ok: true },
        video: { count: 4, ok: true },
        upload: { count: 4, ok: true },
        schedule: { count: 3, ok: false, errors: ["Rate limit exceeded", "Retry in 5 min"] }
      }
    },
    {
      ok: true,
      profile: "PEDRO",
      status: "completed",
      lastRun: new Date(Date.now() - 7200000).toISOString(),
      hasRecentVideo: true,
      expectedPerDay: 6,
      generatedToday: 6,
      steps: {
        download: { count: 6, ok: true },
        generate: { count: 6, ok: true },
        video: { count: 6, ok: true },
        upload: { count: 6, ok: true },
        schedule: { count: 6, ok: true, errors: [] }
      }
    },
    {
      ok: true,
      profile: "PETSELECT",
      status: "pending",
      lastRun: new Date(Date.now() - 14400000).toISOString(),
      hasRecentVideo: true,
      expectedPerDay: 3,
      generatedToday: 3,
      steps: {
        download: { count: 3, ok: true },
        generate: { count: 3, ok: true },
        video: { count: 3, ok: true },
        upload: { count: 3, ok: true },
        schedule: { count: 2, ok: true, errors: [] }
      }
    }
  ],
  summary: { total: 5, healthy: 3, running: 1, failed: 0, pending: 1 }
};

const statusConfig = {
  completed: { color: '#4edc88', icon: '✅', label: 'OK' },
  running: { color: '#ffd93d', icon: '🔄', label: 'Rodando' },
  failed: { color: '#ff6b6b', icon: '❌', label: 'Falhou' },
  pending: { color: '#a0a0a0', icon: '⏳', label: 'Pendente' }
};

function StepIcon({ ok, label, count }: { ok: boolean; label: string; count: number }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 6px',
      background: ok ? 'rgba(78, 220, 136, 0.1)' : 'rgba(255, 107, 107, 0.1)',
      borderRadius: '4px',
      fontSize: '10px'
    }}>
      <span>{ok ? '✅' : '❌'}</span>
      <span style={{ opacity: 0.7 }}>{label}</span>
      <span style={{ fontWeight: 700, color: ok ? 'var(--accent)' : '#ff6b6b' }}>{count}</span>
    </div>
  );
}

function ProductCard({ product }: { product: PipelineProduct }) {
  const cfg = statusConfig[product.status];
  const progress = Math.min(100, (product.generatedToday / product.expectedPerDay) * 100);
  const hasErrors = product.steps.schedule.errors.length > 0;

  return (
    <div className="glass-card" style={{
      padding: '16px',
      border: `1px solid ${cfg.color}33`,
      background: `${cfg.color}05`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, textTransform: 'uppercase' }}>
            {product.profile}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <span style={{ fontSize: '16px' }}>{cfg.icon}</span>
            <span style={{ fontSize: '11px', color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 900, color: progress >= 100 ? 'var(--accent)' : '#ffd93d' }}>
            {product.generatedToday}/{product.expectedPerDay}
          </div>
          <div style={{ fontSize: '9px', opacity: 0.5 }}>Posts hoje</div>
        </div>
      </div>

      <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '12px', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: progress >= 100 ? 'var(--accent)' : '#ffd93d' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
        <StepIcon ok={product.steps.download.ok} label="IMG" count={product.steps.download.count} />
        <StepIcon ok={product.steps.generate.ok} label="GEN" count={product.steps.generate.count} />
        <StepIcon ok={product.steps.video.ok} label="VID" count={product.steps.video.count} />
        <StepIcon ok={product.steps.upload.ok} label="UP" count={product.steps.upload.count} />
        <StepIcon ok={product.steps.schedule.ok} label="SCH" count={product.steps.schedule.count} />
      </div>

      {hasErrors && (
        <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '6px', border: '1px solid rgba(255, 107, 107, 0.2)' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#ff6b6b', marginBottom: '4px' }}>⚠️ ERROS</div>
          {product.steps.schedule.errors.slice(0, 2).map((err, i) => (
            <div key={i} style={{ fontSize: '10px', opacity: 0.8, fontFamily: 'monospace' }}>
              {err.substring(0, 50)}{err.length > 50 ? '...' : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PipelineHealth() {
  const [data, setData] = useState<Report>(defaultReport);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await fetch("/api/pipeline-health", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Keep default data
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, []);

  const hasData = data.products.length > 0;

  return (
    <section className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>🔄</span> Pipeline Health
          </h3>
          <p style={{ fontSize: '11px', opacity: 0.5, marginTop: '4px' }}>
            Download → Generate → Video → Upload → Schedule
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#4edc88' }}>{data.summary.healthy}</div>
            <div style={{ opacity: 0.5 }}>OK</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#ffd93d' }}>{data.summary.running}</div>
            <div style={{ opacity: 0.5 }}>Run</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#ff6b6b' }}>{data.summary.failed}</div>
            <div style={{ opacity: 0.5 }}>Fail</div>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '10px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>🔄</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>
            {loading ? "Verificando pipelines..." : "Nenhum pipeline configurado"}
          </div>
          <div style={{ fontSize: '10px', opacity: 0.4, marginTop: '4px' }}>
            Execute os scripts de produção para ver o status
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {data.products.map((product) => (
            <ProductCard key={product.profile} product={product} />
          ))}
        </div>
      )}

      <div style={{
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '10px',
        opacity: 0.4
      }}>
        <span>Última: {new Date(data.generatedAt).toLocaleString('pt-BR')}</span>
        <button
          onClick={refresh}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.5)',
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '9px'
          }}
        >
          🔄 Atualizar
        </button>
      </div>
    </section>
  );
}
