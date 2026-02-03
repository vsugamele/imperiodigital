import Link from "next/link";

export default function DashboardIndex() {
  const dashboards = [
    {
      href: "/dashboard",
      title: "📊 Dashboard Original",
      description: "Visão geral com marketing, custos e atividade",
      color: "#4edc88"
    },
    {
      href: "/dashboard/command-center",
      title: "🎛️ Command Center",
      description: "Controle total: pipelines, Alex, arquitetura, cron",
      color: "#ffd93d"
    },
    {
      href: "/dashboard/ops-enhanced",
      title: "📋 OPS Enhanced",
      description: "Kanban, agenda, rotinas detalhadas e arquitetura",
      color: "#a78bfa"
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #0d1117 100%)',
      color: '#fff',
      fontFamily: 'system-ui',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px'
    }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <h1 style={{ 
          margin: '0 0 40px 0', 
          fontSize: '32px', 
          fontWeight: 900,
          textAlign: 'center'
        }}>
          🎛️ <span style={{ color: 'var(--accent)' }}>OPS</span> DASHBOARDS
        </h1>
        
        <div style={{ display: 'grid', gap: '20px' }}>
          {dashboards.map((dash, i) => (
            <Link 
              key={i}
              href={dash.href}
              style={{
                display: 'block',
                padding: '28px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${dash.color}33`,
                borderRadius: '16px',
                textDecoration: 'none',
                color: '#fff',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '20px', 
                    fontWeight: 700,
                    color: dash.color
                  }}>
                    {dash.title}
                  </h2>
                  <p style={{ margin: 0, opacity: 0.6, fontSize: '14px' }}>
                    {dash.description}
                  </p>
                </div>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '12px',
                  background: dash.color + '22',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
