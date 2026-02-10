"use client";

import { useState, useEffect } from "react";
import ProjectExplorer from "./ProjectExplorer";

type Project = {
    id: string;
    name: string;
    emoji: string;
    description: string;
    color: string;
    status: "active" | "paused" | "completed";
    tasks_total: number;
    tasks_done: number;
    team: string[];
    workspace_path: string;
    updated_at: string;
};

const emojis = ["🎰", "🐕", "🎬", "🏗️", "📊", "🚀", "💰", "🎨", "📱", "🌐", "🔧", "⚡", "🎯", "📈", "🤖"];
const colors = ["#ff6b6b", "#4ecdc4", "#a78bfa", "#ffd93d", "#4edc88", "#38bdf8", "#f472b6", "#fb923c"];

export default function ProjectManager() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewForm, setShowNewForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newProject, setNewProject] = useState({
        name: "",
        emoji: "🚀",
        description: "",
        color: "#4edc88",
        team: "",
        workspace_path: ""
    });
    const [activeExplorer, setActiveExplorer] = useState<{ path: string; name: string } | null>(null);

    // Load projects from API
    useEffect(() => {
        async function loadProjects() {
            try {
                const res = await fetch("/api/projects");
                const data = await res.json();
                if (data.ok && data.projects) {
                    setProjects(data.projects);
                }
            } catch (err) {
                console.error("Failed to load projects:", err);
            } finally {
                setLoading(false);
            }
        }
        loadProjects();
    }, []);

    async function handleCreateProject() {
        if (!newProject.name.trim() || saving) return;

        setSaving(true);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newProject.name,
                    emoji: newProject.emoji,
                    description: newProject.description,
                    color: newProject.color,
                    team: newProject.team ? newProject.team.split(",").map(t => t.trim()) : [],
                    workspace_path: newProject.workspace_path
                })
            });
            const data = await res.json();

            if (data.ok && data.project) {
                setProjects([data.project, ...projects]);
            } else {
                // Fallback: add locally
                const localProject: Project = {
                    id: Date.now().toString(),
                    name: newProject.name,
                    emoji: newProject.emoji,
                    description: newProject.description,
                    color: newProject.color,
                    status: "active",
                    tasks_total: 0,
                    tasks_done: 0,
                    team: newProject.team ? newProject.team.split(",").map(t => t.trim()) : [],
                    workspace_path: newProject.workspace_path,
                    updated_at: new Date().toISOString()
                };
                setProjects([localProject, ...projects]);
            }

            setNewProject({ name: "", emoji: "🚀", description: "", color: "#4edc88", team: "", workspace_path: "" });
            setShowNewForm(false);
        } catch (err) {
            console.error("Failed to create project:", err);
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteProject(id: string) {
        try {
            await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
            setProjects(projects.filter(p => p.id !== id));
        } catch (err) {
            console.error("Failed to delete project:", err);
            setProjects(projects.filter(p => p.id !== id)); // Remove locally anyway
        }
    }

    async function handleStatusChange(id: string, status: Project["status"]) {
        setProjects(projects.map(p => p.id === id ? { ...p, status } : p));
        try {
            await fetch("/api/projects", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status })
            });
        } catch (err) {
            console.error("Failed to update project status:", err);
        }
    }

    function getStatusColor(status: Project["status"]) {
        switch (status) {
            case "active": return "#4edc88";
            case "paused": return "#ffd93d";
            case "completed": return "#a78bfa";
        }
    }

    return (
        <div style={{ padding: "16px 0" }}>
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px"
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800 }}>📂 Projetos</h2>
                    <p style={{ margin: "4px 0 0", opacity: 0.6, fontSize: "13px" }}>
                        {projects.filter(p => p.status === "active").length} ativos • {projects.length} total
                    </p>
                </div>
                <button
                    onClick={() => setShowNewForm(!showNewForm)}
                    style={{
                        padding: "10px 20px",
                        background: showNewForm ? "rgba(255,255,255,0.1)" : "var(--accent)",
                        border: "none",
                        borderRadius: "10px",
                        color: showNewForm ? "#fff" : "#000",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer"
                    }}
                >
                    {showNewForm ? "✕ Cancelar" : "+ Novo Projeto"}
                </button>
            </div>

            {/* New Project Form */}
            {showNewForm && (
                <div style={{
                    padding: "20px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    marginBottom: "24px"
                }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700 }}>Criar Novo Projeto</h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", opacity: 0.6 }}>Nome</label>
                            <input
                                type="text"
                                value={newProject.name}
                                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                placeholder="Nome do projeto"
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px",
                                    color: "#fff",
                                    fontSize: "14px"
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", opacity: 0.6 }}>Local Workspace Path</label>
                            <input
                                type="text"
                                value={newProject.workspace_path}
                                onChange={(e) => setNewProject({ ...newProject, workspace_path: e.target.value })}
                                placeholder="C:/Users/vsuga/Desktop/Agentes/..."
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px",
                                    color: "#fff",
                                    fontSize: "14px"
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", opacity: 0.6 }}>Team (separar por vírgula)</label>
                            <input
                                type="text"
                                value={newProject.team}
                                onChange={(e) => setNewProject({ ...newProject, team: e.target.value })}
                                placeholder="TEO, LAISE, JONATHAN"
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px",
                                    color: "#fff",
                                    fontSize: "14px"
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", opacity: 0.6 }}>Descrição</label>
                            <input
                                type="text"
                                value={newProject.description}
                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                placeholder="Descrição curta do projeto"
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px",
                                    color: "#fff",
                                    fontSize: "14px"
                                }}
                            />
                        </div>
                    </div>

                    {/* Emoji Selector */}
                    <div style={{ marginTop: "16px" }}>
                        <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", opacity: 0.6 }}>Avatar</label>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {emojis.map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setNewProject({ ...newProject, emoji })}
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "8px",
                                        border: newProject.emoji === emoji ? "2px solid var(--accent)" : "1px solid rgba(255,255,255,0.1)",
                                        background: newProject.emoji === emoji ? "rgba(78, 220, 136, 0.2)" : "rgba(255,255,255,0.03)",
                                        fontSize: "20px",
                                        cursor: "pointer"
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selector */}
                    <div style={{ marginTop: "16px" }}>
                        <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", opacity: 0.6 }}>Cor</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {colors.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewProject({ ...newProject, color })}
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        border: newProject.color === color ? "3px solid #fff" : "none",
                                        background: color,
                                        cursor: "pointer"
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleCreateProject}
                        disabled={!newProject.name.trim()}
                        style={{
                            marginTop: "20px",
                            padding: "12px 24px",
                            background: newProject.name.trim() ? "var(--accent)" : "rgba(255,255,255,0.1)",
                            border: "none",
                            borderRadius: "10px",
                            color: newProject.name.trim() ? "#000" : "#666",
                            fontWeight: 700,
                            fontSize: "14px",
                            cursor: newProject.name.trim() ? "pointer" : "not-allowed"
                        }}
                    >
                        Criar Projeto
                    </button>
                </div>
            )}

            {/* Projects Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "16px"
            }}>
                {projects.map(project => (
                    <div
                        key={project.id}
                        style={{
                            padding: "20px",
                            background: "rgba(255,255,255,0.03)",
                            border: `1px solid ${project.color}33`,
                            borderRadius: "16px",
                            borderLeft: `4px solid ${project.color}`
                        }}
                    >
                        {/* Project Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{
                                    fontSize: "32px",
                                    width: "48px",
                                    height: "48px",
                                    background: `${project.color}22`,
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    {project.emoji}
                                </span>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{project.name}</h3>
                                    <p style={{ margin: "2px 0 0", fontSize: "12px", opacity: 0.6 }}>{project.description}</p>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                                <button
                                    onClick={() => setActiveExplorer({ path: project.workspace_path, name: project.name })}
                                    disabled={!project.workspace_path}
                                    style={{
                                        width: "28px",
                                        height: "28px",
                                        background: project.workspace_path ? "rgba(78,220,136,0.1)" : "rgba(255,255,255,0.05)",
                                        border: "none",
                                        borderRadius: "6px",
                                        color: project.workspace_path ? "var(--accent)" : "#666",
                                        cursor: project.workspace_path ? "pointer" : "not-allowed",
                                        fontSize: "12px"
                                    }}
                                    title={project.workspace_path ? "Abrir Explorer" : "Workspace não configurado"}
                                >
                                    🔍
                                </button>
                                <button
                                    onClick={() => handleDeleteProject(project.id)}
                                    style={{
                                        width: "28px",
                                        height: "28px",
                                        background: "rgba(255,107,107,0.1)",
                                        border: "none",
                                        borderRadius: "6px",
                                        color: "#ff6b6b",
                                        cursor: "pointer",
                                        fontSize: "12px"
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div style={{ marginBottom: "12px" }}>
                            <select
                                value={project.status}
                                onChange={(e) => handleStatusChange(project.id, e.target.value as Project["status"])}
                                style={{
                                    padding: "6px 12px",
                                    background: `${getStatusColor(project.status)}22`,
                                    border: `1px solid ${getStatusColor(project.status)}44`,
                                    borderRadius: "20px",
                                    color: getStatusColor(project.status),
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    textTransform: "uppercase"
                                }}
                            >
                                <option value="active">Ativo</option>
                                <option value="paused">Pausado</option>
                                <option value="completed">Concluído</option>
                            </select>
                        </div>

                        {/* Progress */}
                        <div style={{ marginBottom: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                                <span style={{ opacity: 0.6 }}>Progresso</span>
                                <span>{project.tasks_done}/{project.tasks_total} tasks</span>
                            </div>
                            <div style={{
                                height: "6px",
                                background: "rgba(255,255,255,0.1)",
                                borderRadius: "3px",
                                overflow: "hidden"
                            }}>
                                <div style={{
                                    height: "100%",
                                    width: project.tasks_total > 0 ? `${(project.tasks_done / project.tasks_total) * 100}%` : "0%",
                                    background: project.color,
                                    borderRadius: "3px"
                                }} />
                            </div>
                        </div>

                        {/* Team */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: "4px" }}>
                                {project.team.length > 0 ? (
                                    project.team.slice(0, 4).map((member, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                padding: "4px 8px",
                                                background: "rgba(255,255,255,0.08)",
                                                borderRadius: "4px",
                                                fontSize: "10px",
                                                fontWeight: 600
                                            }}
                                        >
                                            {member}
                                        </span>
                                    ))
                                ) : (
                                    <span style={{ fontSize: "11px", opacity: 0.4 }}>Sem team</span>
                                )}
                                {project.team.length > 4 && (
                                    <span style={{ fontSize: "10px", opacity: 0.5 }}>+{project.team.length - 4}</span>
                                )}
                            </div>
                            <span style={{ fontSize: "10px", opacity: 0.4 }}>
                                {new Date(project.updated_at).toLocaleDateString("pt-BR")}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Project Explorer Modal */}
            {activeExplorer && (
                <ProjectExplorer
                    initialPath={activeExplorer.path}
                    projectName={activeExplorer.name}
                    onClose={() => setActiveExplorer(null)}
                />
            )}
        </div>
    );
}
