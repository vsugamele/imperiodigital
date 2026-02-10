"use client";

import { useState, useEffect } from "react";

// ==================== GEMINI CONSUMPTION TRACKER ====================

export default function GeminiTracker() {
  const [consumptions, setConsumptions] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar logs de consumo
    loadConsumptions();
  }, []);

  const loadConsumptions = async () => {
    try {
      // Tentar carregar do arquivo de log
      const response = await fetch('/api/gemini-logs');
      const data = await response.json();
      setConsumptions(data.logs || []);
      setTotalCost(data.total || 0);
    } catch (e) {
      // Se não houver API, usar dados mock
      const mockLogs = getMockLogs();
      setConsumptions(mockLogs);
      setTotalCost(calculateTotal(mockLogs));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      padding: '32px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900 }}>
          💎 <span style={{ color: '#a78bfa' }}>GEMINI</span> CONSUMO
        </h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.6, fontSize: '14px' }}>
          Rastreamento de uso da API Gemini/Vertex AI
        </p>
      </div>

      {/* Resumo */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div className="metric-card" style={{
          padding: '24px',
          background: 'rgba(167, 139, 250, 0.1)',
          border: '1px solid rgba(167, 139, 250, 0.3)',
          borderRadius: '16px'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>TOTAL REQUESTS</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#a78bfa' }}>
            {consumptions.length}
          </div>
        </div>

        <div className="metric-card" style={{
          padding: '24px',
          background: 'rgba(78, 220, 136, 0.1)',
          border: '1px solid rgba(78, 220, 136, 0.3)',
          borderRadius: '16px'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>CUSTO TOTAL</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#4edc88' }}>
            ${totalCost.toFixed(4)}
          </div>
        </div>

        <div className="metric-card" style={{
          padding: '24px',
          background: 'rgba(255, 217, 61, 0.1)',
          border: '1px solid rgba(255, 217, 61, 0.3)',
          borderRadius: '16px'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>INPUT TOKENS</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#ffd93d' }}>
            {formatNumber(consumptions.reduce((acc, c) => acc + (c.inputTokens || 0), 0))}
          </div>
        </div>

        <div className="metric-card" style={{
          padding: '24px',
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '16px'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>OUTPUT TOKENS</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#ff6b6b' }}>
            {formatNumber(consumptions.reduce((acc, c) => acc + (c.outputTokens || 0), 0))}
          </div>
        </div>
      </div>

      {/* Gráfico de uso por hora */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 800 }}>
          📊 Uso por Hora
        </h3>
        <HourlyChart consumptions={consumptions} />
      </div>

      {/* Logs detalhados */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 800 }}>
          📝 Últimas Requisições
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', opacity: 0.5 }}>HORA</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', opacity: 0.5 }}>TIPO</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', opacity: 0.5 }}>WORKER</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', opacity: 0.5 }}>INPUT</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', opacity: 0.5 }}>TOKENS</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', opacity: 0.5 }}>CUSTO</th>
              </tr>
            </thead>
            <tbody>
              {consumptions.slice(0, 20).map((log: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontSize: '12px', fontFamily: 'monospace' }}>
                    {formatTime(log.timestamp)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      background: getTypeColor(log.type),
                      color: '#fff'
                    }}>
                      {log.type?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', fontWeight: 600 }}>
                    {log.worker || '-'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {log.prompt?.substring(0, 50)}...
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontFamily: 'monospace' }}>
                    {(log.inputTokens || 0) + (log.outputTokens || 0)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#4edc88' }}>
                    ${(log.cost || 0).toFixed(6)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
        }
      `}</style>
    </div>
  );
}

// ==================== HELPERS ====================

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'copy': '#a78bfa',
    'image': '#4edc88',
    'chat': '#ffd93d',
    'analysis': '#ff6b6b',
    'default': '#38bdf8'
  };
  return colors[type] || colors['default'];
}

function calculateTotal(logs: any[]): number {
  // Custo médio por token (aproximado para Gemini 1.5 Pro)
  const costPerToken = 0.00000125; // $1.25 por 1M tokens
  const totalTokens = logs.reduce((acc, log) => acc + (log.inputTokens || 0) + (log.outputTokens || 0), 0);
  return totalTokens * costPerToken;
}

function HourlyChart({ consumptions }: { consumptions: any[] }) {
  // Agrupar por hora
  const hourlyData: Record<string, number> = {};
  consumptions.forEach(c => {
    const hour = new Date(c.timestamp).getHours();
    const key = `${hour}:00`;
    hourlyData[key] = (hourlyData[key] || 0) + (c.inputTokens || 0) + (c.outputTokens || 0);
  });

  const max = Math.max(...Object.values(hourlyData), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px' }}>
      {Array.from({ length: 24 }, (_, i) => {
        const hour = i;
        const key = `${hour}:00`;
        const value = hourlyData[key] || 0;
        const height = (value / max) * 100;
        
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              width: '100%', 
              height: `${Math.max(height, 2)}px`, 
              background: value > 0 ? 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)' : 'rgba(255,255,255,0.1)',
              borderRadius: '2px 2px 0 0',
              marginBottom: '4px'
            }} />
            {hour % 4 === 0 && (
              <span style={{ fontSize: '8px', opacity: 0.5 }}>{hour}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getMockLogs() {
  return [
    { timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'copy', worker: 'Eugene', inputTokens: 500, outputTokens: 1200, prompt: 'Gerar headline para produto de dropshipping', cost: 0.002125 },
    { timestamp: new Date(Date.now() - 3000000).toISOString(), type: 'image', worker: 'Alex', inputTokens: 200, outputTokens: 100, prompt: 'Gerar thumbnail para YouTube', cost: 0.000375 },
    { timestamp: new Date(Date.now() - 2400000).toISOString(), type: 'copy', worker: 'Gary', inputTokens: 800, outputTokens: 2500, prompt: 'Criar script para Reel', cost: 0.004125 },
    { timestamp: new Date(Date.now() - 1800000).toISOString(), type: 'analysis', worker: 'Alex', inputTokens: 1500, outputTokens: 800, prompt: 'Analisar métricas do funil', cost: 0.002875 },
    { timestamp: new Date(Date.now() - 1200000).toISOString(), type: 'copy', worker: 'Hormozi', inputTokens: 600, outputTokens: 1800, prompt: 'Estruturar oferta de upsell', cost: 0.003000 },
    { timestamp: new Date(Date.now() - 600000).toISOString(), type: 'chat', worker: 'Eugene', inputTokens: 300, outputTokens: 600, prompt: 'Revisar copy da página de vendas', cost: 0.001125 },
    { timestamp: new Date(Date.now() - 300000).toISOString(), type: 'copy', worker: 'Gary', inputTokens: 400, outputTokens: 900, prompt: 'Criar captions para Instagram', cost: 0.001625 },
  ];
}
