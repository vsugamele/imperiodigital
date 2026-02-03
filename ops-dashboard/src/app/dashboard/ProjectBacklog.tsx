"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";

type Task = {
    id: string;
    title: string;
    status: "todo" | "in-progress" | "done";
    priority: "high" | "medium" | "low";
    notes?: string;
};

type Project = {
    id: string;
    name: string;
    color: string;
    profiles?: string[];
    tasks: Task[];
};

type BacklogData = {
    projects: Project[];
};

const priorityConfig = {
    high: { color: "#ff6b6b", label: "Alta", icon: "🔥" },
    medium: { color: "#ffd93d", label: "Média", icon: "⚡" },
    low: { color: "#4edc88", label: "Baixa", icon: "📌" }
};

const statusConfig = {
    todo: { label: "A Fazer", color: "#60a5fa", icon: "📋" },
    "in-progress": { label: "Em Progresso", color: "#ffd93d", icon: "⚙️" },
    done: { label: "Concluído", color: "#4edc88", icon: "✅" }
};

// Skeleton component
const Skeleton = ({ width = "100%", height = "20px" }: { width?: string; height?: string }) => (
    <div className="skeleton" style={{ width, height, minHeight: height }} />
);

export default function ProjectBacklog() {
    const [data, setData] = useState<BacklogData | null>(null);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch("/api/backlog", {
                    cache: "force-cache",
                    next: { revalidate: 60 } // Cache for 60 seconds
                });
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                    if (json.projects?.length > 0 && !selectedProject) {
                        setSelectedProject(json.projects[0].id);
                    }
                }
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Memoize current project and task groups
    const { currentProject, taskGroups, stats } = useMemo(() => {
        const proj = data?.projects?.find(p => p.id === selectedProject);
        const tasks = proj?.tasks || [];

        return {
            currentProject: proj,
            taskGroups: {
                todo: tasks.filter(t => t.status === "todo"),
                "in-progress": tasks.filter(t => t.status === "in-progress"),
                done: tasks.filter(t => t.status === "done")
            },
            stats: {
                total: tasks.length,
                done: tasks.filter(t => t.status === "done").length,
                progress: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === "done").length / tasks.length) * 100) : 0
            }
        };
    }, [data, selectedProject]);

    const handleProjectClick = useCallback((id: string) => {
        setSelectedProject(id);
    }, []);

    if (loading) {
        return (
            <section className="glass-card" style={{ padding: "24px" }}>
                <Skeleton height="32px" width="200px" />
                <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "16px" }}>
                            <Skeleton height="20px" width="100px" />
                            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                <Skeleton height="60px" />
                                <Skeleton height="60px" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="glass-card" style={{ padding: "24px" }}>
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px"
            }}>
                <div>
                    <h3 style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        <span style={{ color: "var(--accent)" }}>📊</span>
                        Project Backlog
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", opacity: 0.5 }}>
                        Gestão visual de tarefas por projeto
                    </p>
                </div>

                {/* Progress indicator */}
                <div style={{
                    background: "rgba(0,0,0,0.3)",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                }}>
                    <div style={{
                        width: "60px",
                        height: "6px",
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: "3px",
                        overflow: "hidden"
                    }}>
                        <div style={{
                            width: `${stats.progress}%`,
                            height: "100%",
                            background: "var(--accent)",
                            transition: "width 0.3s ease"
                        }} />
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 600 }}>
                        {stats.done}/{stats.total}
                    </span>
                </div>
            </div>

            {/* Project Tabs */}
            <div style={{
                display: "flex",
                gap: "8px",
                marginBottom: "20px",
                overflowX: "auto",
                paddingBottom: "4px"
            }}>
                {data?.projects?.map(project => (
                    <button
                        key={project.id}
                        onClick={() => handleProjectClick(project.id)}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "none",
                            background: selectedProject === project.id
                                ? `${project.color}20`
                                : "rgba(255,255,255,0.03)",
                            color: selectedProject === project.id ? project.color : "#fff",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            whiteSpace: "nowrap",
                            borderLeft: selectedProject === project.id
                                ? `3px solid ${project.color}`
                                : "3px solid transparent"
                        }}
                    >
                        {project.name}
                    </button>
                ))}
            </div>

            {/* Kanban Columns */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px"
            }}>
                {(["todo", "in-progress", "done"] as const).map(status => {
                    const config = statusConfig[status];
                    const tasks = taskGroups[status];

                    return (
                        <div key={status} style={{
                            background: "rgba(0,0,0,0.2)",
                            borderRadius: "12px",
                            padding: "14px",
                            minHeight: "200px"
                        }}>
                            {/* Column Header */}
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "12px",
                                paddingBottom: "8px",
                                borderBottom: `2px solid ${config.color}30`
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span>{config.icon}</span>
                                    <span style={{
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        color: config.color
                                    }}>
                                        {config.label}
                                    </span>
                                </div>
                                <span style={{
                                    fontSize: "10px",
                                    background: `${config.color}20`,
                                    color: config.color,
                                    padding: "2px 8px",
                                    borderRadius: "10px",
                                    fontWeight: 700
                                }}>
                                    {tasks.length}
                                </span>
                            </div>

                            {/* Task Cards */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {tasks.length === 0 ? (
                                    <div style={{
                                        textAlign: "center",
                                        padding: "20px",
                                        opacity: 0.3,
                                        fontSize: "12px"
                                    }}>
                                        Nenhuma tarefa
                                    </div>
                                ) : (
                                    tasks.slice(0, 5).map(task => {
                                        const pConfig = priorityConfig[task.priority];
                                        return (
                                            <div key={task.id} style={{
                                                background: "rgba(255,255,255,0.03)",
                                                borderRadius: "8px",
                                                padding: "12px",
                                                borderLeft: `3px solid ${pConfig.color}`,
                                                transition: "all 0.2s ease"
                                            }}>
                                                <div style={{
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    lineHeight: 1.4
                                                }}>
                                                    {task.title}
                                                </div>
                                                <div style={{
                                                    marginTop: "6px",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center"
                                                }}>
                                                    <span style={{
                                                        fontSize: "10px",
                                                        color: pConfig.color,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "4px"
                                                    }}>
                                                        {pConfig.icon} {pConfig.label}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                {tasks.length > 5 && (
                                    <div style={{
                                        textAlign: "center",
                                        fontSize: "10px",
                                        opacity: 0.5,
                                        padding: "8px"
                                    }}>
                                        +{tasks.length - 5} mais
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
