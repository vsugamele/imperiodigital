/**
 * DocsTab Component
 * =================
 * 
 * Documentação centralizada do projeto:
 * - APIs (Upload-Post, Drive, Supabase, Claude, Codex)
 * - Scripts de referência
 * - Quick commands
 * - Arquitetura
 */

"use client";

import React, { useState } from "react";

interface DocSection {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
}

export function DocsTab() {
  const [activeSection, setActiveSection] = useState("upload-post");

  const sections: DocSection[] = [
    {
      id: "upload-post",
      title: "Upload-Post API",
      icon: "📡",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Quick Reference */}
          <div className="glass-card" style={{ padding: "20px", borderRadius: "12px" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700 }}>
              ⚡ Quick Reference
            </h4>
            <div style={{ display: "grid", gap: "8px", fontSize: "13px" }}>
              <CodeLine method="GET" path="/api/uploadposts/schedule" desc="Listar jobs" />
              <CodeLine method="DELETE" path="/api/uploadposts/schedule/{job_id}" desc="Cancelar job" />
              <CodeLine method="POST" path="/api/upload" desc="Upload de vídeo" />
            </div>
          </div>

          {/* Example */}
          <div className="glass-card" style={{ padding: "20px", borderRadius: "12px" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700 }}>
              💻 Cancelar Job (Node.js)
            </h4>
            <pre style={{ margin: 0, fontSize: "11px", background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", overflow: "auto" }}>
              {`const https = require('https');
const { getUploadPostApiKey } = require('./uploadpost-key');

const API_KEY = getUploadPostApiKey();
const jobId = 'ce5ceeb8aff74ad59e49520085a04081';

const req = https.request(\`https://api.upload-post.com/api/uploadposts/schedule/\${jobId}\`, {
  method: 'DELETE',
  headers: { 'Authorization': \`Apikey \${API_KEY}\` }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.parse(data)));
});
req.end();`}
            </pre>
          </div>

          {/* Docs Link */}
          <div style={{ textAlign: "center", padding: "12px" }}>
            <a href="https://docs.upload-post.com/api" target="_blank" style={{
              color: "var(--accent)",
              textDecoration: "none",
              fontSize: "13px"
            }}>
              📚 Ver documentação oficial →
            </a>
          </div>
        </div>
      )
    },
    {
      id: "quick-commands",
      title: "Quick Commands",
      icon: "⚡",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <CommandGroup title="Schedulers" commands={[
            { cmd: "node scripts/schedule-next-day.js", desc: "iGaming D+1" },
            { cmd: "node scripts/jp-schedule-next-day.js", desc: "JP Videos" },
            { cmd: "node scripts/petselect-schedule-next-day.js", desc: "PetSelectUK" },
            { cmd: "node scripts/religion-scheduler.js", desc: "Religion (10:00 + 19:00)" }
          ]} />
          <CommandGroup title="Analytics" commands={[
            { cmd: "node scripts/daily-intelligence.js", desc: "Relatório diário" },
            { cmd: "node scripts/healthcheck-dplus1.js", desc: "Healthcheck posts" },
            { cmd: "node command-center/scripts/status.js", desc: "Status do projeto" }
          ]} />
          <CommandGroup title="Cleanup" commands={[
            { cmd: "node scripts/cleanup-0802.js", desc: "Limpar jobs 08/02" },
            { cmd: "node scripts/cleanup-uploadpost-jobs.js", desc: "Limpar duplicatas" }
          ]} />
        </div>
      )
    },
    {
      id: "apis",
      title: "APIs & Serviços",
      icon: "🔗",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <ApiCard
            name="Upload-Post"
            status="✅"
            icon="📡"
            config="config/upload-post.local.json"
            docs="docs.upload-post.com"
          />
          <ApiCard
            name="Google Drive"
            status="✅"
            icon="☁️"
            config="OAuth2 configurado"
            docs="developers.google.com/drive"
          />
          <ApiCard
            name="Supabase"
            status="✅"
            icon="🗄️"
            config="URL + Key em .env"
            docs="supabase.com/docs"
          />
          <ApiCard
            name="Claude"
            status="✅"
            icon="🧠"
            config="OAuth OpenClaw"
            docs="claude.ai"
          />
          <ApiCard
            name="Codex"
            status="⚠️"
            icon="💻"
            config="OPENAI_API_KEY"
            docs="platform.openai.com/codex"
          />
        </div>
      )
    },
    {
      id: "tools",
      title: "Ferramentas",
      icon: "🔧",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <ToolCard
            name="FFmpeg"
            path="ffmpeg/bin/ffmpeg.exe"
            uso="Processamento de vídeo"
          />
          <ToolCard
            name="Whisper"
            path="whisper-cli.exe"
            uso="Transcrição de áudio"
            modelo="models/ggml-base.bin (141MB)"
          />
          <ToolCard
            name="RClone"
            path="rclone.exe"
            uso="Sync com Drive"
          />
        </div>
      )
    },
    {
      id: "project-map",
      title: "Mapa do Projeto",
      icon: "🗺️",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="glass-card" style={{ padding: "20px", borderRadius: "12px" }}>
            <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700 }}>
              📁 Estrutura Principal
            </h4>
            <pre style={{ margin: 0, fontSize: "10px", opacity: 0.7, overflow: "auto" }}>
              {`clawd/
├── scripts/              ← 115 scripts operacionais
├── ops-dashboard/        ← Dashboard web (localhost:3000)
├── command-center/       ← Docs e mapas centralizados
├── skills/               ← Skills OpenClaw
├── projects/             ← Projetos ativos
└── results/              ← Logs e outputs`}
            </pre>
          </div>
          <div className="glass-card" style={{ padding: "20px", borderRadius: "12px" }}>
            <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700 }}>
              🎯 Projetos Ativos
            </h4>
            <div style={{ display: "grid", gap: "8px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>iGaming</span>
                <span style={{ color: "var(--accent)" }}>✅ 24 posts/dia</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>JP Videos</span>
                <span style={{ color: "var(--accent)" }}>✅ 1 post/dia</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Religion</span>
                <span style={{ color: "var(--accent)" }}>✅ 2 posts/dia</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>PetSelectUK</span>
                <span style={{ color: "#f59e0b" }}>⚠️ Pausado</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: "flex", gap: "24px" }}>
      {/* Sidebar */}
      <div style={{
        width: "240px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              background: activeSection === section.id
                ? "rgba(78, 220, 136, 0.1)"
                : "rgba(255, 255, 255, 0.03)",
              border: activeSection === section.id
                ? "1px solid var(--accent)"
                : "1px solid transparent",
              borderRadius: "8px",
              color: activeSection === section.id
                ? "#fff"
                : "rgba(255, 255, 255, 0.6)",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "13px",
              fontWeight: 500,
              transition: "all 0.2s"
            }}
          >
            <span>{section.icon}</span>
            <span>{section.title}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        {sections.filter(s => s.id === activeSection).map(section => (
          <div key={section.id}>
            <h3 style={{ margin: "0 0 20px", fontSize: "20px", fontWeight: 700 }}>
              {section.icon} {section.title}
            </h3>
            {section.content}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Componentes Auxiliares
// ============================================

function CodeLine({ method, path, desc }: { method: string; path: string; desc: string }) {
  const methodColors: Record<string, string> = {
    GET: "#22c55e",
    POST: "#3b82f6",
    DELETE: "#ef4444",
    PATCH: "#f59e0b"
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "70px 1fr auto",
      gap: "12px",
      alignItems: "center",
      padding: "8px 12px",
      background: "rgba(255,255,255,0.02)",
      borderRadius: "6px"
    }}>
      <span style={{
        fontSize: "10px",
        fontWeight: 700,
        color: methodColors[method] || "#fff",
        background: `${methodColors[method]}20`,
        padding: "2px 6px",
        borderRadius: "4px",
        textAlign: "center"
      }}>
        {method}
      </span>
      <code style={{ fontSize: "11px", fontFamily: "monospace" }}>{path}</code>
      <span style={{ fontSize: "11px", opacity: 0.5 }}>{desc}</span>
    </div>
  );
}

function CommandGroup({ title, commands }: { title: string; commands: { cmd: string; desc: string }[] }) {
  return (
    <div className="glass-card" style={{ padding: "16px", borderRadius: "12px" }}>
      <h4 style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: 700, opacity: 0.7 }}>
        {title}
      </h4>
      {commands.map((cmd, i) => (
        <div key={i} style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 0",
          borderBottom: i < commands.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"
        }}>
          <code style={{ fontSize: "11px", color: "var(--accent)" }}>{cmd.cmd}</code>
          <span style={{ fontSize: "11px", opacity: 0.5 }}>{cmd.desc}</span>
        </div>
      ))}
    </div>
  );
}

function ApiCard({ name, status, icon, config, docs }: { name: string; status: string; icon: string; config: string; docs: string }) {
  return (
    <div className="glass-card" style={{
      padding: "16px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      gap: "16px"
    }}>
      <div style={{ fontSize: "28px" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700 }}>{name}</span>
          <span style={{ fontSize: "12px" }}>{status}</span>
        </div>
        <div style={{ fontSize: "11px", opacity: 0.5 }}>
          Config: {config}
        </div>
      </div>
      <a href={`https://${docs}`} target="_blank" style={{
        fontSize: "11px",
        color: "var(--accent)",
        textDecoration: "none"
      }}>
        Docs →
      </a>
    </div>
  );
}

function ToolCard({ name, path, uso, modelo }: { name: string; path: string; uso: string; modelo?: string }) {
  return (
    <div className="glass-card" style={{
      padding: "16px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      gap: "16px"
    }}>
      <div style={{ fontSize: "28px" }}>⚙️</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>{name}</div>
        <div style={{ fontSize: "11px", opacity: 0.5, marginBottom: modelo ? "4px" : 0 }}>
          {path}
        </div>
        {modelo && (
          <div style={{ fontSize: "10px", color: "rgba(167, 139, 250, 0.8)" }}>
            {modelo}
          </div>
        )}
      </div>
      <div style={{ fontSize: "11px", opacity: 0.5 }}>
        {uso}
      </div>
    </div>
  );
}
