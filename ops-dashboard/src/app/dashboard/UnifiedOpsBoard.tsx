"use client";

import { useEffect, useMemo, useState } from "react";

type Task = {
  id: string;
  title: string;
  status: string;
  priority?: string;
  assignee?: string | null;
  labels?: string[];
  notes?: string;
  updatedAt?: string;
  createdAt?: string;
};

type TasksPayload = {
  alexStatus?: string;
  updatedAt?: string;
  activityLog?: Array<{ timestamp: string; action: string; status: string; note?: string }>;
  tasks?: Task[];
};

const DOING = new Set(["doing", "in_progress", "working", "running"]);
const BLOCKED = new Set(["blocked", "paused", "waiting"]);
const NEXT = new Set(["todo", "backlog", "next", "open"]);
const DONE = new Set(["done", "completed", "closed"]);

export default function UnifiedOpsBoard() {
  const [data, setData] = useState<TasksPayload>({ tasks: [] });
  const [owner, setOwner] = useState<"all" | "alex" | "vinicius">("all");
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState<"Alex" | "Vinicius">("Alex");

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/tasks", { cache: "no-store" });
      const json = await res.json();
      setData(json || { tasks: [] });
    };
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const tasks = data.tasks || [];
    if (owner === "all") return tasks;
    return tasks.filter((t) => (t.assignee || "").toLowerCase() === owner);
  }, [data.tasks, owner]);

  const doing = filtered.filter((t) => DOING.has((t.status || "").toLowerCase()));
  const blocked = filtered.filter((t) => BLOCKED.has((t.status || "").toLowerCase()));
  const next = filtered.filter((t) => NEXT.has((t.status || "").toLowerCase()));
  const done = filtered.filter((t) => DONE.has((t.status || "").toLowerCase()));

  const latestActivity = data.activityLog?.[0];

  const addTask = async () => {
    const title = newTitle.trim();
    if (!title) return;
    const payload: TasksPayload = {
      ...data,
      updatedAt: new Date().toISOString(),
      tasks: [
        {
          id: `N${Date.now()}`,
          title,
          status: "todo",
          priority: "medium",
          assignee: newAssignee,
          labels: ["manual"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: "Criada via Ops Kanban",
        },
        ...(data.tasks || []),
      ],
    };
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setData(payload);
      setNewTitle('');
    }
  };

  const col = (title: string, items: Task[], color: string) => (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16 }}>
      <h3 style={{ margin: 0, marginBottom: 12, color }}>{title} ({items.length})</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {items.length === 0 && <div style={{ opacity: 0.5, fontSize: 13 }}>Sem itens</div>}
        {items.map((t) => (
          <div key={t.id} style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{t.title}</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
              #{t.id} • {t.assignee || "sem responsável"} • {t.priority || "sem prioridade"}
            </div>
            {t.notes && <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>{t.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0 }}>Kanban Operacional (Vinicius + Alex)</h2>
          <div style={{ fontSize: 12, opacity: 0.65 }}>
            Alex: {data.alexStatus || "unknown"} • Atualizado: {data.updatedAt || "-"}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nova tarefa..."
            style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: 8, minWidth: 220 }}
          />
          <select value={newAssignee} onChange={(e) => setNewAssignee(e.target.value as "Alex" | "Vinicius")} style={{ background: "#111", color: "#fff", border: "1px solid #333", borderRadius: 8, padding: 8 }}>
            <option value="Alex">Alex</option>
            <option value="Vinicius">Vinicius</option>
          </select>
          <button onClick={addTask} style={{ background: '#4EDC88', color: '#031', border: 'none', borderRadius: 8, padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}>+ Criar</button>
          <select value={owner} onChange={(e) => setOwner(e.target.value as "all" | "alex" | "vinicius")} style={{ background: "#111", color: "#fff", border: "1px solid #333", borderRadius: 8, padding: 8 }}>
            <option value="all">Todos</option>
            <option value="alex">Alex</option>
            <option value="vinicius">Vinicius</option>
          </select>
        </div>
      </div>

      <div style={{ background: "rgba(78,220,136,0.08)", border: "1px solid rgba(78,220,136,0.2)", borderRadius: 10, padding: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Última atividade do sistema</div>
        <div style={{ fontWeight: 700 }}>{latestActivity?.action || "-"} • {latestActivity?.status || "-"}</div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>{latestActivity?.note || "Sem nota"}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(220px, 1fr))", gap: 14 }}>
        {col("Pendente", next, "#ffd166")}
        {col("Fazendo agora", doing, "#4EDC88")}
        {col("Parado/Bloqueado", blocked, "#ff6b6b")}
        {col("Concluído", done, "#8ecae6")}
      </div>
    </section>
  );
}
