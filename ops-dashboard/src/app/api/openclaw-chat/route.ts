import { NextResponse } from "next/server";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

// API endpoint to send messages to OpenClaw and get responses
// Uses the OpenClaw CLI to communicate with the gateway

export async function POST(request: Request) {
    try {
        const { message } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json({
                ok: false,
                error: "Message is required"
            }, { status: 400 });
        }

        // Escape the message for shell
        const escapedMessage = message.replace(/"/g, '\\"').replace(/\n/g, ' ');

        // Send message via OpenClaw CLI
        // The CLI will route to the current session
        const command = `openclaw message send --to self --message "${escapedMessage}"`;

        const { stdout, stderr } = await execAsync(command, {
            timeout: 30000,
            cwd: "C:/Users/vsuga/clawd"
        });

        const output = stdout + stderr;

        // Parse response
        let response = output.trim() || "Mensagem enviada com sucesso";
        let toolCalls = undefined;

        // --- Demo Enhancement: Mock Tool Calls for specific prompts ---
        if (message.toLowerCase().includes("status") || message.toLowerCase().includes("pipeline")) {
            toolCalls = [
                { name: "check_health", status: "done", result: "All pipelines healthy except LAISE (60%)." },
                { name: "get_logs", status: "done", result: "[INFO] Starting system scan..." }
            ];
        } else if (message.toLowerCase().includes("search") || message.toLowerCase().includes("pesquisa")) {
            toolCalls = [
                { name: "google_search", status: "done", result: "Found 1,240,000 results for your query." },
                { name: "read_url", status: "running" }
            ];
        }
        // -------------------------------------------------------------

        return NextResponse.json({
            ok: true,
            response,
            toolCalls,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        // If OpenClaw is not running, return friendly error
        const errorMessage = error.message || "Unknown error";

        if (errorMessage.includes("not recognized") || errorMessage.includes("not found")) {
            return NextResponse.json({
                ok: false,
                error: "OpenClaw CLI não encontrado. Execute: npm install -g openclaw",
                details: errorMessage
            }, { status: 503 });
        }

        if (errorMessage.includes("timeout")) {
            return NextResponse.json({
                ok: false,
                error: "Timeout ao comunicar com OpenClaw. Verifique se o Gateway está rodando.",
                details: errorMessage
            }, { status: 504 });
        }

        return NextResponse.json({
            ok: false,
            error: "Erro ao comunicar com OpenClaw",
            details: errorMessage
        }, { status: 500 });
    }
}

// Health check endpoint
export async function GET() {
    try {
        const { stdout } = await execAsync("openclaw health", { timeout: 5000 });

        return NextResponse.json({
            ok: true,
            status: "connected",
            output: stdout.trim()
        });
    } catch {
        return NextResponse.json({
            ok: false,
            status: "offline"
        });
    }
}
