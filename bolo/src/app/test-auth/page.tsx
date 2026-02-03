"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from '@supabase/supabase-js';

export default function TestAuthPage() {
  const [email, setEmail] = useState("vinaum123@gmail.com");
  const [password, setPassword] = useState("teste123");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const log = (msg: string) => setLogs(l => [...l, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleLogin = async () => {
    setLoading(true);
    setResult(null);
    setLogs([]);
    
    log("Iniciando login...");
    log(`Email: ${email}`);
    
    try {
      log("Chamando supabase.auth.signInWithPassword...");
      
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const { data, error } = await supabase.auth.signInWithPassword(
        { email, password },
        { shouldCreateUser: false }
      );
      
      clearTimeout(timeoutId);
      
      log(`Resposta recebida`);
      log(`Error: ${error?.message || "nenhum"}`);
      
      if (error) {
        setResult({ success: false, error: error.message, status: error.status });
        log(`FALHA: ${error.message}`);
      } else if (data.user) {
        log(`SUCESSO! User ID: ${data.user.id}`);
        setResult({ success: true, user: { id: data.user.id, email: data.user.email } });
        
        // Try redirect
        log("Redirecionando para /dashboard...");
        router.push("/dashboard");
      } else {
        log("Resposta vazia - pode ser bug do Supabase");
        setResult({ success: false, error: "Resposta vazia do Supabase" });
      }
    } catch (e: any) {
      log(`EXCEÇÃO: ${e.message}`);
      setResult({ success: false, error: e.message });
    }

    setLoading(false);
  };

  const handleCheckSession = async () => {
    setLoading(true);
    setLogs([]);
    log("Verificando sessão...");
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      log(`User: ${user?.email || "null"}`);
      log(`Error: ${error?.message || "nenhum"}`);
      setResult({ user, error });
    } catch (e: any) {
      log(`Exceção: ${e.message}`);
      setResult({ error: e.message });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">BOLO - Debug Login</h1>
          <p className="text-slate-600 mt-2">Verificando problema de login</p>
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

          <div className="flex gap-2">
            <button 
              onClick={handleLogin}
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-md"
            >
              {loading ? "Carregando..." : "Testar Login"}
            </button>
            
            <button 
              onClick={handleCheckSession}
              disabled={loading}
              className="flex-1 py-2.5 bg-purple-600 text-white rounded-md"
            >
              Verificar Sessão
            </button>
          </div>
        </div>

        {logs.length > 0 && (
          <div className="bg-slate-900 text-green-400 p-4 rounded-md text-xs font-mono">
            {logs.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        )}

        {result && (
          <pre className="bg-red-50 text-red-600 p-4 rounded-md text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}

        <p className="text-center text-sm text-slate-600">
          <Link href="/login" className="text-blue-600">Voltar ao login normal</Link>
        </p>
      </div>
    </div>
  );
}
