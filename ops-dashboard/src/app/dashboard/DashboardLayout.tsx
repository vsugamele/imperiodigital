"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function DashboardLayout({ children, currentTab }: { children: React.ReactNode, currentTab: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>Carregando...</span>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '⚡' },
    { id: 'chat', label: 'Chat Alex', icon: '💬' },
    { id: 'traffic', label: 'Auto-Traffic', icon: '🚗' },
    { id: 'copy-generator', label: 'Copy Gen', icon: '📝' },
    { id: 'squad', label: 'Squad', icon: '🎯' },
    { id: 'hackerverso', label: 'Hackerverso', icon: '🧠' },
    { id: 'research', label: 'Research', icon: '🔍' },
    { id: 'ofertas', label: 'Lançamentos', icon: '🚀' },
    { id: 'mentes', label: 'Mentes', icon: '🧠' },
    { id: 'company-map', label: 'Mapa', icon: '🗺️' },
    { id: 'operacional', label: 'Operacional', icon: '🏢' },
    { id: 'financeiro', label: 'Financeiro', icon: '💰' },
    { id: 'security', label: 'Segurança', icon: '🛡️' },
    { id: 'ops-kanban', label: 'Ops Kanban', icon: '📋' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex' }}>
      <aside style={{ width: '260px', padding: '24px 16px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '32px', padding: '0 12px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900 }}>
            COMMAND <span style={{ color: '#4EDC88' }}>CENTER</span>
          </h1>
          <p style={{ margin: '4px 0 0', opacity: 0.5, fontSize: '12px' }}>Connected</p>
        </div>

        <nav style={{ flex: 1 }}>
          {tabs.map(tab => (
            <Link
              key={tab.id}
              href={`/dashboard?tab=${tab.id}`}
              prefetch={true}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '4px',
                textDecoration: 'none',
                color: currentTab === tab.id ? '#4EDC88' : 'rgba(255,255,255,0.6)',
                background: currentTab === tab.id ? 'rgba(78, 220, 136, 0.1)' : 'transparent',
                fontSize: '14px',
                fontWeight: 600,
                border: currentTab === tab.id ? '1px solid rgba(78, 220, 136, 0.2)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '16px', background: 'rgba(78, 220, 136, 0.05)', borderRadius: '12px', border: '1px solid rgba(78, 220, 136, 0.1)', marginTop: '16px' }}>
          <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '8px' }}>STATUS ALEX</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4edc88', boxShadow: '0 0 10px #4edc88' }}></span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#4edc88' }}>Online & Ready</span>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
