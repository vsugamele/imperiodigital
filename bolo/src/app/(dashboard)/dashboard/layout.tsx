"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, AuthProvider } from "@/lib/auth-context";
import { 
  LayoutDashboard, 
  Sparkles, 
  CreditCard, 
  Settings, 
  LogOut,
  Image,
  FileText
} from "lucide-react";
import { useState, useEffect } from "react";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [credits, setCredits] = useState(85);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">BOLO</h1>
          <p className="text-sm text-slate-500">Automação de Conteúdo</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          <Link 
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link 
            href="/dashboard/generate"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-blue-600" /> Gerar Conteúdo
          </Link>
          <Link 
            href="/dashboard/content"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Image className="w-5 h-5" /> Meus Conteúdos
          </Link>
          <Link 
            href="/dashboard/carousel"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <FileText className="w-5 h-5" /> Carrosséis
          </Link>
          <Link 
            href="/dashboard/billing"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <CreditCard className="w-5 h-5" /> Credits
          </Link>
          <Link 
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Settings className="w-5 h-5" /> Configurações
          </Link>
        </nav>

        {/* Credits Card */}
        <div className="mt-auto p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white mb-4">
          <p className="text-sm opacity-90">Credits disponíveis</p>
          <p className="text-3xl font-bold">{credits}</p>
          <Link 
            href="/dashboard/billing"
            className="mt-3 block text-center text-sm bg-white/20 hover:bg-white/30 rounded-md py-1.5 transition-colors"
          >
            Comprar mais
          </Link>
        </div>

        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Sair
        </button>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}
