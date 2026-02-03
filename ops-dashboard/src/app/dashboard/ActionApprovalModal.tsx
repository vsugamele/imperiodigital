"use client";

import React from "react";

type ApprovalProps = {
    isOpen: boolean;
    onApprove?: () => void;
    onDeny?: () => void;
    action: {
        type: string;
        target: string;
        risk: "low" | "medium" | "high";
    };
};

export default function ActionApprovalModal({ isOpen: initialOpen, onApprove, onDeny, action }: ApprovalProps) {
    const [isVisible, setIsVisible] = React.useState(initialOpen);

    React.useEffect(() => {
        setIsVisible(initialOpen);
    }, [initialOpen]);

    if (!isVisible) return null;

    const handleAction = (callback?: () => void) => {
        if (callback) callback();
        setIsVisible(false);
    };

    const riskColors = {
        low: "#4edc88",
        medium: "#ffd93d",
        high: "#ff6b6b"
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="glass-card" style={{
                width: '400px',
                padding: '24px',
                border: `1px solid ${riskColors[action.risk]}44`,
                background: 'linear-gradient(135deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{
                        fontSize: '32px',
                        marginBottom: '10px',
                        animation: 'pulse 2s infinite'
                    }}>⚠️</div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Aprovação Requerida</h3>
                    <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>
                        Alex está solicitando permissão para uma ação sensível.
                    </p>
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ fontSize: '10px', opacity: 0.4, marginBottom: '4px', textTransform: 'uppercase' }}>Ação</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: riskColors[action.risk] }}>{action.type}</div>

                    <div style={{ margin: '12px 0', height: '1px', background: 'rgba(255,255,255,0.1)' }} />

                    <div style={{ fontSize: '10px', opacity: 0.4, marginBottom: '4px', textTransform: 'uppercase' }}>Alvo</div>
                    <div style={{ fontSize: '13px', fontFamily: 'monospace', opacity: 0.8 }}>{action.target}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                        onClick={() => handleAction(onDeny)}
                        style={{
                            padding: '12px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            borderRadius: '8px',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        Negar
                    </button>
                    <button
                        onClick={() => handleAction(onApprove)}
                        style={{
                            padding: '12px',
                            background: riskColors[action.risk],
                            border: 'none',
                            color: '#000',
                            borderRadius: '8px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: `0 0 15px ${riskColors[action.risk]}33`
                        }}
                    >
                        Autorizar
                    </button>
                </div>
            </div>
        </div>
    );
}
