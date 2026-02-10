"use client";

import React, { useState, useEffect } from "react";

interface TrafficAction {
  type: string;
  platform: string;
  campaign: string;
  adset?: string;
  reason: string;
  timestamp: string;
}

interface TrafficStats {
  totalMetaCampaigns: number;
  totalGoogleCampaigns: number;
  killedCount: number;
  scaledCount: number;
  totalActions: number;
}

export default function AutoTraffic() {
  const [stats, setStats] = useState<TrafficStats>({
    totalMetaCampaigns: 0,
    totalGoogleCampaigns: 0,
    killedCount: 0,
    scaledCount: 0,
    totalActions: 0
  });
  const [actions, setActions] = useState<TrafficAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const loadTodayReport = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const reportPath = `results/traffic/${today}.json`;
      
      // This would normally fetch from the server
      // For now, showing mock data
      setStats({
        totalMetaCampaigns: 12,
        totalGoogleCampaigns: 5,
        killedCount: 3,
        scaledCount: 2,
        totalActions: 5
      });
      setLastUpdate(new Date().toLocaleString('pt-BR'));
    } catch (error) {
      console.error('Error loading report:', error);
    }
  };

  useEffect(() => {
    loadTodayReport();
  }, []);

  const runOrchestrator = async () => {
    setLoading(true);
    // Simular execução
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStats({
      totalMetaCampaigns: 12,
      totalGoogleCampaigns: 5,
      killedCount: 3,
      scaledCount: 2,
      totalActions: 5
    });
    setLastUpdate(new Date().toLocaleString('pt-BR'));
    setLoading(false);
  };

  const killRules = [
    { metric: "ROAS", threshold: "< 1.0", impressions: "1000+", color: "#EF4444" },
    { metric: "CPA", threshold: "> 2x target", impressions: "1000+", color: "#EF4444" },
    { metric: "CTR", threshold: "< 0.5%", impressions: "500+", color: "#EF4444" },
    { metric: "Frequência", threshold: "> 4.0", impressions: "2000+", color: "#EF4444" },
  ];

  const scaleRules = [
    { metric: "ROAS", threshold: "> 2.5", duration: "3 dias", action: "Budget +20%", color: "#4EDC88" },
    { metric: "ROAS", threshold: "> 3.0", condition: "Freq < 2", action: "Nova Audiência", color: "#4EDC88" },
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)',
      padding: '32px',
      color: '#fff',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900 }}>
            🚗 AUTO-<span style={{ color: '#F59E0B' }}>TRAFFIC</span>
          </h1>
          <p style={{ margin: '8px 0 0', opacity: 0.6, fontSize: '14px' }}>
            Automação inteligente de tráfego com Meta Ads + Google Ads
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={runOrchestrator}
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Executando...' : '▶️ Run Orchestrator'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#3B82F6' }}>{stats.totalMetaCampaigns}</div>
          <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>Meta Campaigns</div>
        </div>
        <div style={{ background: 'rgba(168, 85, 247, 0.1)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#A855F7' }}>{stats.totalGoogleCampaigns}</div>
          <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>Google Campaigns</div>
        </div>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#EF4444' }}>{stats.killedCount}</div>
          <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>KILL Actions</div>
        </div>
        <div style={{ background: 'rgba(78, 220, 136, 0.1)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(78, 220, 136, 0.2)' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#4EDC88' }}>{stats.scaledCount}</div>
          <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>SCALE Actions</div>
        </div>
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#F59E0B' }}>{stats.totalActions}</div>
          <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>Total Actions</div>
        </div>
      </div>

      {/* Rules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {/* KILL Rules */}
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700 }}>
            🔴 KILL Rules
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {killRules.map((rule, idx) => (
              <div key={`${rule.metric}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: `3px solid ${rule.color}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{rule.metric}</div>
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>{rule.threshold} after {rule.impressions}</div>
                </div>
                <div style={{ padding: '4px 12px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: '#EF4444' }}>PAUSE</div>
              </div>
            ))}
          </div>
        </div>

        {/* SCALE Rules */}
        <div style={{ background: 'rgba(78, 220, 136, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(78, 220, 136, 0.2)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700 }}>
            🟢 SCALE Rules
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {scaleRules.map((rule, idx) => (
              <div key={`${rule.metric}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: `3px solid ${rule.color}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{rule.metric}</div>
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>{rule.threshold} {rule.duration || rule.condition}</div>
                </div>
                <div style={{ padding: '4px 12px', background: 'rgba(78, 220, 136, 0.2)', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: '#4EDC88' }}>{rule.action}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700 }}>
          🔄 Workflow de Automação
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', flexWrap: 'wrap' }}>
          <span style={{ padding: '8px 16px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>📱 Meta Ads</span>
          <span style={{ color: '#F59E0B', fontSize: '20px' }}>→</span>
          <span style={{ padding: '8px 16px', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>📊 Check Metrics</span>
          <span style={{ color: '#F59E0B', fontSize: '20px' }}>→</span>
          <span style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>🔴 KILL</span>
          <span style={{ color: '#F59E0B', fontSize: '20px' }}>→</span>
          <span style={{ padding: '8px 16px', background: 'rgba(78, 220, 136, 0.2)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>🟢 SCALE</span>
          <span style={{ color: '#F59E0B', fontSize: '20px' }}>→</span>
          <span style={{ padding: '8px 16px', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>📈 Report</span>
        </div>
        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '12px', opacity: 0.6 }}>
          <strong>🔁 Intervalo de verificação:</strong> A cada 1 hora | <strong>📊 Relatórios:</strong> A cada 6 horas | <strong>⏰ Última execução:</strong> {lastUpdate || 'Nunca'}
        </div>
      </div>

      {/* Actions Log */}
      {actions.length > 0 && (
        <div style={{ marginTop: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700 }}>
            📋 Últimas Ações
          </h2>
          <div style={{ display: 'grid', gap: '8px' }}>
            {actions.slice(0, 10).map((action, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: `3px solid ${action.type === 'KILL' ? '#EF4444' : '#4EDC88'}` }}>
                <span style={{ fontSize: '16px' }}>{action.type === 'KILL' ? '🔴' : '🟢'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{action.campaign}</div>
                  <div style={{ fontSize: '11px', opacity: 0.6 }}>{action.reason}</div>
                </div>
                <span style={{ fontSize: '11px', opacity: 0.5 }}>{new Date(action.timestamp).toLocaleTimeString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
