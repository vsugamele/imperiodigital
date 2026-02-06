/**
 * ChatTab Component
 * =================
 * 
 * Chat interface para comunicação direta com o Alex/OpenClaw.
 * 
 * FEATURES:
 * - Header com indicador de conexão
 * - Área de mensagens com scroll
 * - Visualização de tool calls
 * - Input com envio
 * 
 * API:
 * - POST /api/openclaw-chat
 * - Body: { message: string }
 * - Response: { ok: boolean, response: string, toolCalls?: array }
 */

"use client";

import React, { useState } from "react";

// Tipos
interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    time: string;
    toolCalls?: ToolCall[];
}

interface ToolCall {
    name: string;
    status: "running" | "done";
    result?: string;
}

export function ChatTab() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || sending) return;

        const userMessage = input.trim();
        const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

        // Adicionar mensagem do usuário
        setMessages(prev => [...prev, { role: "user", content: userMessage, time: now }]);
        setInput("");
        setSending(true);

        try {
            const res = await fetch("/api/openclaw-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage })
            });
            const data = await res.json();

            const responseTime = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            setMessages(prev => [...prev, {
                role: "assistant",
                content: data.ok ? data.response : `❌ ${data.error}`,
                time: responseTime,
                toolCalls: data.toolCalls
            }]);
        } catch {
            const errorTime = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "❌ Erro ao conectar com OpenClaw. Verifique se o Gateway está rodando.",
                time: errorTime
            }]);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="glass-card" style={{
            height: "calc(100vh - 200px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: "16px"
        }}>
            {/* Header */}
            <ChatHeader />

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                background: "rgba(0,0,0,0.2)"
            }}>
                {messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    messages.map((msg, i) => (
                        <MessageBubble key={i} message={msg} />
                    ))
                )}
                {sending && <TypingIndicator />}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} style={{
                padding: "16px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                gap: "12px"
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Digite sua mensagem para o Alex..."
                    disabled={sending}
                    style={{
                        flex: 1,
                        padding: "12px 16px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "14px",
                        outline: "none"
                    }}
                />
                <button
                    type="submit"
                    disabled={sending || !input.trim()}
                    style={{
                        padding: "12px 24px",
                        background: input.trim() ? "var(--accent)" : "rgba(255,255,255,0.1)",
                        border: "none",
                        borderRadius: "12px",
                        color: input.trim() ? "#000" : "#666",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: input.trim() ? "pointer" : "not-allowed"
                    }}
                >
                    {sending ? "..." : "Enviar"}
                </button>
            </form>
        </div>
    );
}

// ============================================
// Componentes Auxiliares
// ============================================

function ChatHeader() {
    return (
        <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "24px" }}>🦞</span>
                <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>OpenClaw Chat</h3>
                    <p style={{ margin: 0, fontSize: "11px", opacity: 0.6 }}>Terminal direto com Alex</p>
                </div>
            </div>
            <ConnectionBadge />
        </div>
    );
}

function ConnectionBadge() {
    return (
        <span style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            padding: "6px 12px",
            borderRadius: "20px",
            background: "rgba(78, 220, 136, 0.2)",
            color: "#4edc88"
        }}>
            <span style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#4edc88",
                animation: "pulse 2s infinite"
            }} />
            Conectado
        </span>
    );
}

function EmptyState() {
    return (
        <div style={{ textAlign: "center", padding: "40px", opacity: 0.5 }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🦞</div>
            <p style={{ fontSize: "14px" }}>Envie uma mensagem para o Alex</p>
            <p style={{ fontSize: "11px", opacity: 0.6 }}>
                Ex: &quot;status do sistema&quot;, &quot;rodar pipeline igaming&quot;, &quot;verificar posts agendados&quot;
            </p>
        </div>
    );
}

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === "user";

    return (
        <div style={{
            alignSelf: isUser ? "flex-end" : "flex-start",
            maxWidth: "80%",
            padding: "10px 14px",
            borderRadius: isUser ? "12px 12px 0 12px" : "12px 12px 12px 0",
            background: isUser ? "rgba(78, 220, 136, 0.15)" : "rgba(255,255,255,0.05)",
            border: isUser ? "1px solid rgba(78, 220, 136, 0.3)" : "1px solid rgba(255,255,255,0.1)"
        }}>
            <div style={{ fontSize: "13px", lineHeight: 1.5 }}>{message.content}</div>

            {/* Tool Calls */}
            {message.toolCalls?.map((tool, idx) => (
                <ToolCallVisualizer key={idx} tool={tool} />
            ))}

            <div style={{
                fontSize: "9px",
                opacity: 0.5,
                marginTop: "8px",
                textAlign: isUser ? "right" : "left"
            }}>
                {message.time}
            </div>
        </div>
    );
}

function ToolCallVisualizer({ tool }: { tool: ToolCall }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            padding: "8px 12px",
            marginTop: "8px",
            fontSize: "11px",
            cursor: "pointer"
        }} onClick={() => setExpanded(!expanded)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: tool.status === "running" ? "#ffd93d" : "#4edc88",
                        boxShadow: `0 0 6px ${tool.status === "running" ? "#ffd93d" : "#4edc88"}`
                    }} />
                    <span style={{ fontWeight: 600, opacity: 0.8 }}>
                        {tool.status === "running" ? "Executando" : "Concluído"}: <code>{tool.name}</code>
                    </span>
                </div>
                <span style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
            </div>
            {expanded && tool.result && (
                <div style={{
                    marginTop: "8px",
                    padding: "8px",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontSize: "10px",
                    whiteSpace: "pre-wrap",
                    maxHeight: "150px",
                    overflowY: "auto",
                    opacity: 0.7
                }}>
                    {tool.result}
                </div>
            )}
        </div>
    );
}

function TypingIndicator() {
    return (
        <div style={{
            alignSelf: "flex-start",
            padding: "10px 14px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
        }}>
            <div style={{
                width: "12px",
                height: "12px",
                border: "2px solid rgba(78, 220, 136, 0.2)",
                borderTopColor: "#4edc88",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
            }} />
            <span style={{ fontSize: "12px", opacity: 0.7 }}>Alex está pensando...</span>
        </div>
    );
}
