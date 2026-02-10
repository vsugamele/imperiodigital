"use client";

import React, { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  role: "user" | "alex";
  content: string;
  timestamp: Date;
}

export default function AlexChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simular resposta do Alex
    setTimeout(() => {
      const alexResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "alex",
        content: generateAlexResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, alexResponse]);
      setLoading(false);
    }, 1500);
  };

  const quickActions = [
    { label: "📊 Ver Status", action: "status" },
    { label: "📋 Tarefas", action: "tasks" },
    { label: "🚀 Executar Script", action: "script" },
    { label: "💰 Ver Custos", action: "costs" },
  ];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 100px)',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #4edc88 0%, #22c55e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px'
        }}>
          🤖
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Alex</h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', opacity: 0.5, color: '#4edc88' }}>● Online & Ready</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {quickActions.map(action => (
          <button
            key={action.action}
            onClick={() => setInput(action.label)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '40px' }}>
            <p style={{ marginBottom: '8px' }}>🤖</p>
            <p style={{ fontSize: '14px' }}>Olá! Sou o Alex. Como posso ajudar?</p>
          </div>
        )}
        
        {messages.map(msg => (
          <div 
            key={msg.id}
            style={{ 
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: '12px'
            }}
          >
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' 
                ? 'rgba(78, 220, 136, 0.15)' 
                : 'rgba(255,255,255,0.05)',
              border: msg.role === 'alex' ? '1px solid rgba(255,255,255,0.05)' : 'none'
            }}>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>{msg.content}</p>
              <p style={{ margin: '8px 0 0', fontSize: '10px', opacity: 0.4 }}>
                {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ 
              width: '8px', height: '8px', borderRadius: '50%', background: '#4edc88',
              animation: 'pulse 1s infinite'
            }} />
            <span style={{ fontSize: '12px', opacity: 0.5 }}>Alex está digitando...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ 
        padding: '20px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        gap: '12px'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Digite sua mensagem..."
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.03)',
            color: '#fff',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: input.trim() && !loading 
              ? 'linear-gradient(135deg, #4edc88 0%, #22c55e 100%)' 
              : 'rgba(255,255,255,0.1)',
            color: input.trim() && !loading ? '#000' : 'rgba(255,255,255,0.3)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
        >
          Enviar
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}

function generateAlexResponse(input: string): string {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('status') || lowerInput.includes('ver')) {
    return "📊 Status Atual:\n\n• Alex: Online & Ready\n• Gary: Idle (aguardando tarefas)\n• Eugene: Idle (aguardando tarefas)\n• Hormozi: Idle (aguardando tarefas)\n\nQuer que eu execute alguma ação?";
  }
  
  if (lowerInput.includes('tarefa') || lowerInput.includes('task')) {
    return "📋 Tarefas Ativas:\n\n• Backlog: 2 tarefas\n• Blocked: 2 tarefas\n• Doing: 0 tarefas\n\nQuer ver o kanban completo ou criar uma nova tarefa?";
  }
  
  if (lowerInput.includes('custo') || lowerInput.includes('custo') || lowerInput.includes('gemini')) {
    return "💰 Consumo Gemini:\n\n• Hoje: ~$0.02\n• Esta semana: ~$0.15\n• Este mês: ~$0.50\n\nQuer ver o detalhamento completo?";
  }
  
  if (lowerInput.includes('script') || lowerInput.includes('executar')) {
    return "🚀 Scripts Disponíveis:\n\n• Daily Content Generation\n• Pipeline Health Check\n• Quote Post Creator\n• YouTube Download\n\nQual script deseja executar?";
  }
  
  return "Entendi! Como posso ajudar?\n\nPosso:\n• Ver status do sistema\n• Listar tarefas\n• Executar scripts\n• Ver métricas de custo\n\nO que gostaria de fazer?";
}
