"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.message || "Acesso negado");
      }
    } catch (err) {
      setError("Falha na conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <label htmlFor="pin">PIN de Acesso</label>
        <input
          type="password"
          id="pin"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••••"
          maxLength={6}
          autoFocus
          required
        />
        {error && <p className="error-msg">{error}</p>}
        <button type="submit" disabled={loading || pin.length < 6}>
          {loading ? "Verificando..." : "Entrar no Dashboard"}
        </button>
      </form>

      <style jsx>{`
        .login-container {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
          width: 100%;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        label {
          color: #a1a1aa;
          font-size: 0.875rem;
          font-weight: 500;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        input {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 12px;
          color: white;
          font-size: 1.5rem;
          letter-spacing: 0.6rem;
          text-align: center;
          outline: none;
          transition: all 0.3s ease;
        }
        input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
          background: rgba(0, 0, 0, 0.4);
        }
        button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
        }
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          filter: grayscale(1);
        }
        .error-msg {
          color: #f87171;
          font-size: 0.875rem;
          text-align: center;
          margin: 0;
          font-weight: 500;
          animation: shake 0.4s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
