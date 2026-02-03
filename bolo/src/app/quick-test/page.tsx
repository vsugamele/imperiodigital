"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from '@supabase/supabase-js';

export default function QuickTestPage() {
  const [email, setEmail] = useState("teste@exemplo.com");
  const [password, setPassword] = useState("teste123456");
  const [companyName, setCompanyName] = useState("Empresa Teste");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleRegister = async () => {
    setLoading(true);
    setResult(null);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { company_name: companyName } }
    });
    
    setResult({ action: "register", data, error });
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    setResult(null);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    setResult({ action: "login", data, error });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">BOLO - Quick Test</h1>
          <p className="text-slate-600 mt-2">Cria conta e faz login</p>
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
            <label className="block text-sm font-medium text-slate-700">Senha (mínimo 6)</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Empresa</label>
            <input 
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleRegister}
              disabled={loading || password.length < 6}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-md disabled:opacity-50"
            >
              1️⃣ Criar Conta
            </button>
            
            <button 
              onClick={handleLogin}
              disabled={loading || password.length < 6}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              2️⃣ Login
            </button>
          </div>
        </div>

        {result && (
          <pre className={`p-4 rounded-md text-xs overflow-auto ${
            result.error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
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
