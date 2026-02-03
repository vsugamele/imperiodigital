"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@supabase/supabase-js';

export default function SimpleLoginPage() {
  const [email, setEmail] = useState("teste@exemplo.com");
  const [password, setPassword] = useState("12345678");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setMessage("Usuário já logado! Redirecionando...");
        setTimeout(() => router.push("/dashboard"), 1000);
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(`Erro: ${error.message}`);
        setLoading(false);
        return;
      }

      if (data.user) {
        setMessage("Login sucesso! Redirecionando...");
        setTimeout(() => router.push("/dashboard"), 500);
      }
    } catch (e: any) {
      setMessage(`Exceção: ${e.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">BOLO - Login Simples</h1>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>

          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-md"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-md text-center ${message.includes('sucesso') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}

        <p className="text-center text-sm text-slate-600">
          <a href="/dashboard" className="text-blue-600">Ir direto para Dashboard</a>
        </p>
      </div>
    </div>
  );
}
