"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Falhou ao logar";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={signIn} style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span>Email</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="seu@email.com"
          required
          style={{ padding: 10, border: "1px solid #333", borderRadius: 8 }}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Senha</span>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="********"
          required
          style={{ padding: 10, border: "1px solid #333", borderRadius: 8 }}
        />
      </label>

      {error ? (
        <div style={{ color: "#ff6b6b", fontSize: 14 }}>{error}</div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: 12,
          borderRadius: 10,
          background: "#111",
          color: "#fff",
          border: "1px solid #333",
          cursor: "pointer",
        }}
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <p style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.4 }}>
        Obs: esse login pressupõe que o usuário já existe no Supabase.
      </p>
    </form>
  );
}
