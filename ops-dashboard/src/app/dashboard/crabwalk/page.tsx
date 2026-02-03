"use client";

import React, { useState, useEffect } from "react";

const CRABWALK_URL = "http://localhost:3002";

export default function CrabwalkMonitor() {
  const [iframeKey, setIframeKey] = useState(0);
  const [status, setStatus] = useState<"connecting" | "connected" | "offline">("connecting");

  // Check if Crabwalk is available
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(CRABWALK_URL, { mode: 'no-cors' });
        setStatus("connected");
      } catch (e) {
        setStatus("offline");
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
    setStatus("connecting");
    setTimeout(() => setStatus("connected"), 1000);
  };

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)",
      borderRadius: "12px",
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(0,0,0,0.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>🦀</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
              Crabwalk Monitor
            </h3>
            <p style={{ margin: 0, fontSize: "11px", opacity: 0.6 }}>
              OpenClaw Real-Time Companion
            </p>
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            padding: "6px 12px",
            borderRadius: "20px",
            background: status === "connected" 
              ? "rgba(78, 220, 136, 0.2)" 
              : status === "connecting"
              ? "rgba(255, 217, 61, 0.2)"
              : "rgba(255, 107, 107, 0.2)",
            color: status === "connected" 
              ? "#4edc88" 
              : status === "connecting"
              ? "#ffd93d"
              : "#ff6b6b"
          }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: status === "connected" 
                ? "#4edc88" 
                : status === "connecting"
                ? "#ffd93d"
                : "#ff6b6b",
              animation: status === "connected" ? "pulse 2s infinite" : "none"
            }} />
            {status === "connected" ? "Online" : status === "connecting" ? "Conectando..." : "Offline"}
          </span>
          
          <button
            onClick={handleRefresh}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "11px"
            }}
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Iframe */}
      <div style={{ flex: 1, position: "relative" }}>
        {status === "offline" && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.8)"
          }}>
            <span style={{ fontSize: "48px", marginBottom: "16px" }}>🦀</span>
            <h4 style={{ margin: "0 0 8px 0", color: "#ff6b6b" }}>
              Crabwalk Offline
            </h4>
            <p style={{ margin: 0, opacity: 0.6, fontSize: "13px", textAlign: "center" }}>
              Execute:<br/>
              <code style={{ 
                background: "rgba(255,255,255,0.1)", 
                padding: "4px 8px", 
                borderRadius: "4px",
                marginTop: "8px",
                display: "inline-block"
              }}>
                cd C:\Users\vsuga\crabwalk && npm run dev
              </code>
            </p>
          </div>
        )}
        
        <iframe
          key={iframeKey}
          src={CRABWALK_URL}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            background: "#0a0a0a"
          }}
          onLoad={() => setStatus("connected")}
          onError={() => setStatus("offline")}
        />
      </div>

      {/* Footer */}
      <div style={{
        padding: "10px 16px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(0,0,0,0.3)",
        fontSize: "10px",
        opacity: 0.5
      }}>
        <span>🦀 Crabwalk v1.0</span>
        <span>{CRABWALK_URL}</span>
      </div>
    </div>
  );
}
