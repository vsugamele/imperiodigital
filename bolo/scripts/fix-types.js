const fs = require('fs');
const path = require('path');

const loginContent = `"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, AuthProvider } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Senha</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
      </div>
      <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 text-slate-900">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">BOLO</h1>
          <p className="text-slate-600 mt-2">Faça login na sua conta</p>
        </div>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
        <p className="text-center text-sm text-slate-600">
          Não tem conta? <Link href="/register" className="text-blue-600 hover:underline">Criar</Link>
        </p>
      </div>
    </div>
  );
}
`;

const registerContent = `"use client\";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, AuthProvider } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

function RegisterForm() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, companyName);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-slate-700">Nome da empresa/marca</label>
        <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Minha Empresa" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="seu@email.com" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Senha</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" minLength={6} required />
      </div>
      <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar conta'}
      </button>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 text-slate-900">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">BOLO</h1>
          <p className="text-slate-600 mt-2">Crie sua conta</p>
        </div>
        <AuthProvider>
          <RegisterForm />
        </AuthProvider>
        <p className="text-center text-sm text-slate-600">
          Já tem conta? <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('C:/Users/vsuga/clawd/bolo/src/app/(auth)/login/page.tsx', loginContent);
fs.writeFileSync('C:/Users/vsuga/clawd/bolo/src/app/(auth)/register/page.tsx', registerContent);
console.log('Pages updated with types');
