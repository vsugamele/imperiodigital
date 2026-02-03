"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { company_name: companyName } }
      });
      
      if (error) throw new Error(error.message);
      
      // Success - user is created
      alert("Conta criada! Verifique seu email para confirmar (ou faça login direto).");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">BOLO</h1>
          <p className="text-slate-600 mt-2">Criar conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
              required
              minLength={6}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Empresa/Nome</label>
            <input 
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-green-600 text-white rounded-md flex items-center justify-center">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          Já tem conta? <Link href="/login" className="text-blue-600">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
