"use client";

import React, { useState, useEffect } from "react";

type FileItem = {
    name: string;
    isDirectory: boolean;
    size: number;
    extension: string | null;
};

type ProjectExplorerProps = {
    initialPath: string;
    projectName: string;
    onClose: () => void;
};

export default function ProjectExplorer({ initialPath, projectName, onClose }: ProjectExplorerProps) {
    const [currentPath, setCurrentPath] = useState(initialPath);
    const [contents, setContents] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [previewFile, setPreviewFile] = useState<{ name: string; content: string } | null>(null);

    const loadDirectory = async (targetPath: string) => {
        setLoading(true);
        setError(null);
        setPreviewFile(null);
        try {
            const res = await fetch(`/api/projects/explorer?path=${encodeURIComponent(targetPath)}`);
            const data = await res.json();
            if (data.ok) {
                setContents(data.contents);
                setCurrentPath(data.path);
            } else {
                setError(data.error || "Failed to load directory");
            }
        } catch (err) {
            setError("Network error loading workspace");
        } finally {
            setLoading(false);
        }
    };

    const readFile = async (fileName: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/explorer?path=${encodeURIComponent(currentPath)}&file=${encodeURIComponent(fileName)}`);
            const data = await res.json();
            if (data.ok) {
                setPreviewFile({ name: data.fileName, content: data.content });
            } else {
                alert(data.error || "Cannot read this file");
            }
        } catch (err) {
            alert("Error reading file");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDirectory(initialPath);
    }, [initialPath]);

    const navigateUp = () => {
        const parts = currentPath.split(/[\\/]/).filter(Boolean);
        if (parts.length > 1) {
            parts.pop();
            const newPath = currentPath.startsWith('/') ? '/' + parts.join('/') : parts.join('/');
            loadDirectory(newPath);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '1000px',
                height: '80vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                {/* Explorer Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Workspace: {projectName}</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '11px', opacity: 0.5, fontFamily: 'monospace' }}>{currentPath}</p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', opacity: 0.5 }}
                    >
                        ✕
                    </button>
                </div>

                {/* Toolbar */}
                <div style={{ padding: '12px 24px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <button
                        onClick={navigateUp}
                        disabled={loading}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        ↑ Voltar
                    </button>
                    <button
                        onClick={() => loadDirectory(currentPath)}
                        style={{ background: 'none', border: 'none', color: '#fff', fontSize: '12px', opacity: 0.5, cursor: 'pointer' }}
                    >
                        🔄 Atualizar
                    </button>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                    {loading && !contents.length && <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>Lendo diretório...</div>}

                    {error && (
                        <div style={{ color: '#ff6b6b', textAlign: 'center', padding: '40px' }}>
                            <p>{error}</p>
                            <button onClick={() => setCurrentPath(initialPath)} style={{ color: '#fff', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Resetar para raiz</button>
                        </div>
                    )}

                    {!previewFile ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                            {contents.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => item.isDirectory ? loadDirectory(currentPath + '/' + item.name) : readFile(item.name)}
                                    style={{
                                        padding: '16px 12px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                                        {item.isDirectory ? '📁' : '📄'}
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        color: item.isDirectory ? 'var(--accent)' : '#fff'
                                    }}>
                                        {item.name}
                                    </div>
                                    {!item.isDirectory && (
                                        <div style={{ fontSize: '9px', opacity: 0.4, marginTop: '4px' }}>
                                            {(item.size / 1024).toFixed(1)} KB
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', fontWeight: 700 }}>Preview: {previewFile.name}</span>
                                <button onClick={() => setPreviewFile(null)} style={{ color: 'var(--accent)', background: 'none', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                                    ← Fechar Preview
                                </button>
                            </div>
                            <pre style={{
                                flex: 1,
                                background: '#000',
                                padding: '20px',
                                borderRadius: '12px',
                                overflow: 'auto',
                                fontSize: '12px',
                                lineHeight: 1.5,
                                color: '#ddd',
                                border: '1px solid rgba(255,255,255,0.1)',
                                fontFamily: 'monospace'
                            }}>
                                {previewFile.content}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
