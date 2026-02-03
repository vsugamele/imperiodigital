"use client";

import { useState, useEffect, useCallback } from "react";

export type Notification = {
    id: string;
    type: "error" | "warning" | "success" | "info";
    title: string;
    message: string;
    source: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
};

const typeConfig = {
    error: { icon: "🚨", color: "#ff6b6b", bg: "rgba(255, 107, 107, 0.1)" },
    warning: { icon: "⚠️", color: "#ffd93d", bg: "rgba(255, 217, 61, 0.1)" },
    success: { icon: "✅", color: "#4edc88", bg: "rgba(78, 220, 136, 0.1)" },
    info: { icon: "ℹ️", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.1)" }
};

// Demo notifications for testing
const demoNotifications: Notification[] = [
    {
        id: "1",
        type: "error",
        title: "Pipeline LAISE Falhou",
        message: "Rate limit exceeded no YouTube. Retry em 5 minutos.",
        source: "PipelineHealth",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        read: false,
        actionUrl: "/dashboard/command-center"
    },
    {
        id: "2",
        type: "warning",
        title: "Quota Baixa - Gemini API",
        message: "Apenas 15% da quota restante para hoje.",
        source: "TokenTracker",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: false
    },
    {
        id: "3",
        type: "success",
        title: "6 Vídeos Agendados",
        message: "TEO pipeline concluiu com sucesso.",
        source: "PipelineHealth",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true
    }
];

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);
    const [showPanel, setShowPanel] = useState(false);
    const [showToast, setShowToast] = useState<Notification | null>(null);

    const unreadCount = notifications.filter(n => !n.read).length;
    const hasErrors = notifications.some(n => n.type === "error" && !n.read);

    // Mark notification as read
    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    // Clear all notifications
    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    // Show toast for new errors
    useEffect(() => {
        const latestError = notifications.find(n => n.type === "error" && !n.read);
        if (latestError && !showToast) {
            setShowToast(latestError);
            const timer = setTimeout(() => setShowToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notifications, showToast]);

    // Poll for pipeline updates
    useEffect(() => {
        const checkPipelines = async () => {
            try {
                const res = await fetch("/api/pipeline-health");
                const data = await res.json();

                if (data.products) {
                    const failedPipelines = data.products.filter((p: any) =>
                        p.status === "failed" || !p.ok
                    );

                    failedPipelines.forEach((p: any) => {
                        const existingError = notifications.find(
                            n => n.source === "PipelineHealth" && n.title.includes(p.profile) && !n.read
                        );

                        if (!existingError) {
                            const newNotification: Notification = {
                                id: Date.now().toString() + p.profile,
                                type: "error",
                                title: `Pipeline ${p.profile} com Problemas`,
                                message: p.steps.schedule.errors?.[0] || "Verifique o status do pipeline.",
                                source: "PipelineHealth",
                                timestamp: new Date().toISOString(),
                                read: false,
                                actionUrl: "/dashboard?tab=ops"
                            };
                            setNotifications(prev => [newNotification, ...prev]);
                        }
                    });
                }
            } catch {
                // Silent fail for polling
            }
        };

        // Check every 60 seconds
        const interval = setInterval(checkPipelines, 60000);
        return () => clearInterval(interval);
    }, [notifications]);

    return (
        <>
            {/* Notification Bell Button */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                style={{
                    position: "relative",
                    padding: "10px 16px",
                    background: hasErrors ? "rgba(255, 107, 107, 0.1)" : "rgba(255,255,255,0.05)",
                    border: hasErrors ? "1px solid rgba(255, 107, 107, 0.3)" : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    color: hasErrors ? "#ff6b6b" : "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px"
                }}
            >
                <span style={{ fontSize: "16px" }}>{hasErrors ? "🔔" : "🔔"}</span>
                {unreadCount > 0 && (
                    <span style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        background: hasErrors ? "#ff6b6b" : "var(--accent)",
                        color: "#000",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        fontSize: "11px",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Toast Notification */}
            {showToast && (
                <div style={{
                    position: "fixed",
                    top: "100px",
                    right: "30px",
                    zIndex: 2000,
                    padding: "16px 20px",
                    background: typeConfig[showToast.type].bg,
                    border: `1px solid ${typeConfig[showToast.type].color}44`,
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    maxWidth: "400px",
                    animation: "slideIn 0.3s ease"
                }}>
                    <span style={{ fontSize: "24px" }}>{typeConfig[showToast.type].icon}</span>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: typeConfig[showToast.type].color }}>
                            {showToast.title}
                        </h4>
                        <p style={{ margin: "4px 0 0", fontSize: "12px", opacity: 0.8 }}>{showToast.message}</p>
                    </div>
                    <button
                        onClick={() => {
                            markAsRead(showToast.id);
                            setShowToast(null);
                        }}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#888",
                            cursor: "pointer",
                            fontSize: "16px",
                            padding: "0"
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Notification Panel */}
            {showPanel && (
                <div style={{
                    position: "fixed",
                    top: "80px",
                    right: "20px",
                    zIndex: 999,
                    width: "380px",
                    maxHeight: "500px",
                    background: "rgba(20, 20, 20, 0.98)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
                    overflow: "hidden"
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                            🔔 Notificações {unreadCount > 0 && `(${unreadCount})`}
                        </h3>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    padding: "4px 10px",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "none",
                                    borderRadius: "6px",
                                    color: "#888",
                                    fontSize: "11px",
                                    cursor: "pointer"
                                }}
                            >
                                Marcar lidas
                            </button>
                            <button
                                onClick={clearAll}
                                style={{
                                    padding: "4px 10px",
                                    background: "rgba(255,107,107,0.1)",
                                    border: "none",
                                    borderRadius: "6px",
                                    color: "#ff6b6b",
                                    fontSize: "11px",
                                    cursor: "pointer"
                                }}
                            >
                                Limpar
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: "40px 20px", textAlign: "center", opacity: 0.5 }}>
                                <p style={{ margin: 0 }}>Nenhuma notificação</p>
                            </div>
                        ) : (
                            notifications.map(notif => {
                                const cfg = typeConfig[notif.type];
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => markAsRead(notif.id)}
                                        style={{
                                            padding: "14px 20px",
                                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                                            background: notif.read ? "transparent" : cfg.bg,
                                            cursor: "pointer",
                                            transition: "background 0.2s"
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                            <span style={{ fontSize: "18px" }}>{cfg.icon}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <h4 style={{
                                                        margin: 0,
                                                        fontSize: "13px",
                                                        fontWeight: notif.read ? 500 : 700,
                                                        color: cfg.color
                                                    }}>
                                                        {notif.title}
                                                    </h4>
                                                    {!notif.read && (
                                                        <span style={{
                                                            width: "8px",
                                                            height: "8px",
                                                            borderRadius: "50%",
                                                            background: cfg.color
                                                        }} />
                                                    )}
                                                </div>
                                                <p style={{
                                                    margin: "4px 0 0",
                                                    fontSize: "12px",
                                                    opacity: 0.7,
                                                    lineHeight: 1.4
                                                }}>
                                                    {notif.message}
                                                </p>
                                                <div style={{
                                                    marginTop: "8px",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    fontSize: "10px",
                                                    opacity: 0.5
                                                }}>
                                                    <span>{notif.source}</span>
                                                    <span>{new Date(notif.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Slide-in animation */}
            <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
        </>
    );
}
