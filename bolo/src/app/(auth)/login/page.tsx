"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Show error from redirect if any
  useState(() => {
    const errorParam = searchParams.get('error');
    const codeParam = searchParams.get('code');
    if (errorParam) {
      setError(`${errorParam} (code: ${codeParam})`);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Supabase error:', error);
        setError(`${error.message} (code: ${error.status})`);
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('Login success:', data.user.id);
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error('Exception:', err);
      setError(err.message || "Erro desconhecido");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">BOLO</h1>
          <p className="text-slate-600 mt-2">Faça login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> 
              <span>{error}</span>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 text-white rounded-md flex items-center justify-center hover:bg-blue-700 transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          Não tem conta? <Link href="/register" className="text-blue-600 hover:underline">Criar</Link>
        </p>
      </div>
    </div>
  );
}
