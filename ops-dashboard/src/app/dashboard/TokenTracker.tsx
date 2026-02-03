"use client";

import { useEffect, useState } from "react";

type TokenUsage = {
  today: string;
  month: string;
  todayTokens: number;
  monthTokens: number;
  todayCost: number;
  monthCost: number;
  byModel: Record<string, { tokens: number; cost: number }>;
  thresholds: {
    dailyLimit: number;
    monthlyLimit: number;
    dailyWarning: number;
    monthlyWarning: number;
  };
};

// Default fallback data
const defaultData: TokenUsage = {
  today: new Date().toISOString().split('T')[0],
  month: new Date().toISOString().slice(0, 7),
  todayTokens: 0,
  monthTokens: 0,
  todayCost: 0,
  monthCost: 0,
  byModel: {},
  thresholds: {
    dailyLimit: 1000000,
    monthlyLimit: 10000000,
    dailyWarning: 80,
    monthlyWarning: 80
  }
};

function formatNumber(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function formatCurrency(n: number) {
  return '$' + n.toFixed(4);
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percent = Math.min(100, (value / max) * 100);
  return (
    <div style={{
      height: '5px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '3px',
      overflow: 'hidden'
    }}>
      <div style={{
        width: `${percent}%`,
        height: '100%',
        background: color,
        transition: 'width 0.3s ease'
      }} />
    </div>
  );
}

export default function TokenTracker() {
  const [data, setData] = useState<TokenUsage>(defaultData);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await fetch("/api/token-usage", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Keep default data on error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, []);

  const dailyPercent = data.thresholds.dailyLimit > 0
    ? (data.todayTokens / data.thresholds.dailyLimit) * 100
    : 0;
  const monthlyPercent = data.thresholds.monthlyLimit > 0
    ? (data.monthTokens / data.thresholds.monthlyLimit) * 100
    : 0;
  const dailyWarning = dailyPercent > data.thresholds.dailyWarning;
  const monthlyWarning = monthlyPercent > data.thresholds.monthlyWarning;
  const hasData = Object.keys(data.byModel).length > 0;

  return (
    <section className="glass-card" style={{ padding: '24px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>🪙</span> Token Tracker
          </h3>
          <p style={{ fontSize: '11px', opacity: 0.5, marginTop: '4px' }}>
            Hoje ({data.today}) e mês ({data.month})
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent)' }}>
            {formatCurrency(data.todayCost)}
          </div>
          <div style={{ fontSize: '9px', opacity: 0.5, textTransform: 'uppercase' }}>Custo Hoje</div>
        </div>
      </div>

      {!hasData && !loading ? (
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '10px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🪙</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>
            Sem dados de tokens ainda
          </div>
          <div style={{ fontSize: '10px', opacity: 0.4, marginTop: '4px' }}>
            Execute <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              node scripts/scan-ai-calls.js
            </code>
          </div>
        </div>
      ) : (
        <>
          {/* Daily Usage */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 600, opacity: 0.7 }}>Limite Diário</span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: dailyWarning ? '#ffd93d' : 'var(--accent)'
              }}>
                {formatNumber(data.todayTokens)} / {formatNumber(data.thresholds.dailyLimit)}
              </span>
            </div>
            <ProgressBar
              value={data.todayTokens}
              max={data.thresholds.dailyLimit}
              color={dailyWarning ? '#ffd93d' : 'var(--accent)'}
            />
          </div>

          {/* Monthly Usage */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 600, opacity: 0.7 }}>Limite Mensal</span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: monthlyWarning ? '#ff6b6b' : 'var(--accent)'
              }}>
                {formatNumber(data.monthTokens)} / {formatNumber(data.thresholds.monthlyLimit)}
              </span>
            </div>
            <ProgressBar
              value={data.monthTokens}
              max={data.thresholds.monthlyLimit}
              color={monthlyWarning ? '#ff6b6b' : 'var(--accent)'}
            />
          </div>

          {/* By Model */}
          {hasData && (
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '10px',
              padding: '14px'
            }}>
              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                opacity: 0.5,
                marginBottom: '10px'
              }}>
                Por Modelo
              </div>
              {Object.entries(data.byModel)
                .sort((a, b) => b[1].tokens - a[1].tokens)
                .slice(0, 5)
                .map(([model, d]) => (
                  <div key={model} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    fontSize: '11px'
                  }}>
                    <span style={{ fontWeight: 600 }}>{model.toUpperCase()}</span>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <span style={{ opacity: 0.5 }}>{formatNumber(d.tokens)}</span>
                      <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{formatCurrency(d.cost)}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
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
        <span>Mensal: {formatCurrency(data.monthCost)}</span>
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
