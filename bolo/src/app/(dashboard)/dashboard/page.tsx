"use client";

import Link from "next/link";
import { Sparkles, TrendingUp, FileText, CreditCard } from "lucide-react";

export default function DashboardPage() {
  const stats = {
    credits: 85,
    postsThisMonth: 127,
    avgCostPerPost: 0.74,
    campaigns: 3
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Bem-vindo ao BOLO! Veja suas métricas e crie conteúdo.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Credits disponíveis</p>
              <p className="text-3xl font-bold text-slate-900">{stats.credits}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Posts este mês</p>
              <p className="text-3xl font-bold text-slate-900">{stats.postsThisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Custo médio/post</p>
              <p className="text-3xl font-bold text-slate-900">R$ {stats.avgCostPerPost}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Campanhas ativas</p>
              <p className="text-3xl font-bold text-slate-900">{stats.campaigns}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate Content */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2">Criar novo conteúdo</h2>
          <p className="text-blue-100 mb-4">
            Gere posts, anúncios e carrosséis automaticamente com IA
          </p>
          <Link 
            href="/dashboard/generate"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            <Sparkles className="w-5 h-5" /> Gerar Agora
          </Link>
        </div>

        {/* View History */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Seus conteúdos</h2>
          <p className="text-slate-600 mb-4">
            Veja todo o histórico de conteúdos gerados
          </p>
          <Link 
            href="/dashboard/content"
            className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            <FileText className="w-5 h-5" /> Ver Histórico
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Atividade Recente</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">Post iGaming gerado</p>
              <p className="text-sm text-slate-500">Há 2 horas</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">50 credits adicionados</p>
              <p className="text-sm text-slate-500">Há 1 dia</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">Campanha "Black Friday" criada</p>
              <p className="text-sm text-slate-500">Há 3 dias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
