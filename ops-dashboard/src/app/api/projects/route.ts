import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type Project = {
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
    created_at: string;
    updated_at: string;
};

// GET - Listar todos os projetos
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: projects, error } = await supabase
            .from("dashboard_projects")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            // Se tabela não existir, retorna projetos padrão
            if (error.code === "42P01" || error.message.includes("does not exist")) {
                return NextResponse.json({
                    ok: true,
                    projects: getDefaultProjects(),
                    source: "default"
                });
            }
            throw error;
        }

        return NextResponse.json({
            ok: true,
            projects: projects || [],
            source: "supabase"
        });

    } catch (error: any) {
        return NextResponse.json({
            ok: true,
            projects: getDefaultProjects(),
            source: "fallback",
            error: error.message
        });
    }
}

// POST - Criar novo projeto
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, emoji, description, color, team, workspace_path } = body;

        if (!name) {
            return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
        }

        const supabase = await createClient();

        const newProject = {
            name,
            emoji: emoji || "🚀",
            description: description || "",
            color: color || "#4edc88",
            status: "active",
            tasks_total: 0,
            tasks_done: 0,
            team: team || [],
            workspace_path: workspace_path || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from("dashboard_projects")
            .insert(newProject)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ ok: true, project: data });

    } catch (error: any) {
        return NextResponse.json({
            ok: false,
            error: error.message
        }, { status: 500 });
    }
}

// PUT - Atualizar projeto
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ ok: false, error: "ID is required" }, { status: 400 });
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from("dashboard_projects")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ ok: true, project: data });

    } catch (error: any) {
        return NextResponse.json({
            ok: false,
            error: error.message
        }, { status: 500 });
    }
}

// DELETE - Remover projeto
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ ok: false, error: "ID is required" }, { status: 400 });
        }

        const supabase = await createClient();

        const { error } = await supabase
            .from("dashboard_projects")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ ok: true, deleted: id });

    } catch (error: any) {
        return NextResponse.json({
            ok: false,
            error: error.message
        }, { status: 500 });
    }
}

// Projetos padrão quando tabela não existe
function getDefaultProjects(): Project[] {
    return [
        {
            id: "igaming",
            name: "iGaming Empire",
            emoji: "🎰",
            description: "Automação de conteúdo para marcas de iGaming",
            color: "#ff6b6b",
            status: "active",
            tasks_total: 12,
            tasks_done: 8,
            team: ["TEO", "JONATHAN", "LAISE", "PEDRO"],
            workspace_path: "C:/Users/vsuga/Desktop/Agentes",
            created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
            updated_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: "petselect",
            name: "PetSelect UK",
            emoji: "🐕",
            description: "Geração de vídeos para e-commerce de pets",
            color: "#4ecdc4",
            status: "active",
            tasks_total: 8,
            tasks_done: 5,
            team: ["PETSELECT"],
            workspace_path: "",
            created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
            updated_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
            id: "vaas",
            name: "VaaS Platform",
            emoji: "🎬",
            description: "Video as a Service - plataforma SaaS",
            color: "#a78bfa",
            status: "paused",
            tasks_total: 20,
            tasks_done: 4,
            team: [],
            workspace_path: "",
            created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
            updated_at: new Date(Date.now() - 259200000).toISOString()
        },
        {
            id: "infra",
            name: "Infraestrutura",
            emoji: "🏗️",
            description: "Dashboard, automações e monitoramento",
            color: "#ffd93d",
            status: "active",
            tasks_total: 15,
            tasks_done: 10,
            team: ["ALEX"],
            workspace_path: "",
            created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
            updated_at: new Date().toISOString()
        }
    ];
}
