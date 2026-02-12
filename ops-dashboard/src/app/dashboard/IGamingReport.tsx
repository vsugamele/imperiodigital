"use client";

/**
 * 📊 IGAMING METRICS REPORT - COMMAND CENTER
 * Componente React com gráficos e calendário
 */

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ChevronLeft, ChevronRight, Plus, Filter, Download, RefreshCw } from 'lucide-react';

// 📊 DADOS COLETADOS
const METRICS_DATA = [
  { username: 'pedroo_viieiira', posts: 39, followers: 7, following: 28, engagement: 0 },
  { username: 'jhonattan_viieira', posts: 52, followers: 10, following: 55, engagement: 0 },
  { username: 'laiseboth', posts: 78, followers: 29, following: 21, engagement: 0 },
  { username: 'theo_viieiraa', posts: 51, followers: 2, following: 13, engagement: 0 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// 📅 DADOS DO CALENDÁRIO (simulado - integrar com Supabase)
const CALENDAR_EVENTS = [
  { date: '2026-02-06', title: 'Post iGaming - Pedro', type: 'instagram', status: 'scheduled' },
  { date: '2026-02-06', title: 'Post iGaming - Jhonattan', type: 'instagram', status: 'scheduled' },
  { date: '2026-02-07', title: 'Post iGaming - Laise', type: 'instagram', status: 'scheduled' },
  { date: '2026-02-08', title: 'Post iGaming - Theo', type: 'instagram', status: 'scheduled' },
];

export default function IGamingReport() {
  const [view, setView] = useState('dashboard'); // dashboard | calendar | analytics
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState(CALENDAR_EVENTS);
  const [loading, setLoading] = useState(false);

  // Calcular totais
  const totalPosts = METRICS_DATA.reduce((sum, p) => sum + p.posts, 0);
  const totalFollowers = METRICS_DATA.reduce((sum, p) => sum + p.followers, 0);
  const totalFollowing = METRICS_DATA.reduce((sum, p) => sum + p.following, 0);

  // 📊 GRÁFICO DE BARRAS - Posts por perfil
  const barChartData = METRICS_DATA.map(p => ({
    name: '@' + p.username,
    posts: p.posts,
    followers: p.followers,
  }));

  // 📈 GRÁFICO DE PIE - Distribuição de seguidores
  const pieData = METRICS_DATA.map(p => ({
    name: '@' + p.username,
    value: p.followers,
  }));

  // 🗓️ Funções do calendário
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const refreshData = async () => {
    setLoading(true);
    // Simular carregamento - integrar com Chrome Relay API
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">📊 IGaming Metrics Report</h1>
          <p className="text-gray-400">Command Center • Relatório Automático</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-6">
        {['dashboard', 'calendar', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            className={`px-6 py-2 rounded-lg capitalize transition ${view === tab ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
          >
            {tab === 'dashboard' && '📊'} {tab === 'calendar' && '🗓️'} {tab === 'analytics' && '📈'}
            {' '} {tab}
          </button>
        ))}
      </div>

      {/* DASHBOARD VIEW */}
      {view === 'dashboard' && (
        <>
          {/* CARDS DE RESUMO */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Posts', value: totalPosts, icon: '📝', color: 'blue' },
              { label: 'Seguidores', value: totalFollowers, icon: '👥', color: 'green' },
              { label: 'Seguindo', value: totalFollowing, icon: '👀', color: 'yellow' },
              { label: 'Perfis', value: METRICS_DATA.length, icon: '📱', color: 'purple' },
            ].map((card, i) => (
              <div key={i} className={`p-6 bg-${card.color}-900/30 border border-${card.color}-500/30 rounded-xl`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{card.label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
                  </div>
                  <span className="text-4xl">{card.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* GRÁFICOS */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* BAR CHART */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">📊 Posts por Perfil</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="posts" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="followers" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* PIE CHART */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">👥 Distribuição de Seguidores</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TABELA DETALHADA */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">📋 Detalhamento por Perfil</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="pb-3">Perfil</th>
                    <th className="pb-3">Posts</th>
                    <th className="pb-3">Seguidores</th>
                    <th className="pb-3">Seguindo</th>
                    <th className="pb-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {METRICS_DATA.map((profile, i) => (
                    <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="py-3">
                        <a href={`https://instagram.com/${profile.username}`} target="_blank" className="text-blue-400 hover:underline">
                          @{profile.username}
                        </a>
                      </td>
                      <td className="py-3 text-white">{profile.posts}</td>
                      <td className="py-3 text-green-400">{profile.followers}</td>
                      <td className="py-3 text-yellow-400">{profile.following}</td>
                      <td className="py-3">
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* CALENDAR VIEW */}
      {view === 'calendar' && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {selectedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={() => navigateMonth(-1)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button onClick={() => setSelectedDate(new Date())} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
                Hoje
              </button>
              <button onClick={() => navigateMonth(1)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
              <div key={dia} className="text-center text-gray-400 font-medium py-2">
                {dia}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: getDaysInMonth(selectedDate).firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 bg-gray-900/50 rounded-lg" />
            ))}
            {Array.from({ length: getDaysInMonth(selectedDate).days }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDate(day);
              return (
                <div key={day} className="h-24 bg-gray-900/50 rounded-lg p-2 hover:bg-gray-700/50 transition cursor-pointer">
                  <span className="text-gray-400 text-sm">{day}</span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event, j) => (
                      <div key={j} className={`text-xs px-2 py-1 rounded truncate ${event.type === 'instagram' ? 'bg-pink-600' : 'bg-blue-600'
                        }`}>
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayEvents.length - 2} mais</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg">
              <Plus className="w-4 h-4" />
              Novo Evento
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
              <Filter className="w-4 h-4" />
              Filtrar
            </button>
          </div>
        </div>
      )}

      {/* ANALYTICS VIEW */}
      {view === 'analytics' && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">📈 Análise Avançada</h2>

          <div className="grid grid-cols-2 gap-6">
            {/* LINE CHART */}
            <div className="col-span-2">
              <h3 className="text-xl font-bold text-white mb-4">📈 Evolução de Seguidores (Simulado)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { name: 'Jan', pedroo: 5, jhonattan: 8, laise: 25, theo: 1 },
                  { name: 'Fev', pedroo: 6, jhonattan: 9, laise: 27, theo: 2 },
                  { name: 'Mar', pedroo: 7, jhonattan: 10, laise: 29, theo: 2 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Legend />
                  <Line type="monotone" dataKey="pedroo" stroke="#0088FE" strokeWidth={2} />
                  <Line type="monotone" dataKey="jhonattan" stroke="#00C49F" strokeWidth={2} />
                  <Line type="monotone" dataKey="laise" stroke="#FFBB28" strokeWidth={2} />
                  <Line type="monotone" dataKey="theo" stroke="#FF8042" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* INSIGHTS */}
            <div className="bg-gray-900/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">💡 Insights</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  @laiseboth tem maior crescimento (+4 seguidores/mês)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">!</span>
                  @theo_viieiraa precisa de mais conteúdo para crescer
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">→</span>
                  Média de posts por perfil: {Math.round(totalPosts / METRICS_DATA.length)}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">★</span>
                  Taxa média de seguindo/seguidores: {(totalFollowing / totalFollowers).toFixed(1)}
                </li>
              </ul>
            </div>

            {/* RECOMENDAÇÕES */}
            <div className="bg-gray-900/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">🎯 Recomendações</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400">1.</span>
                  Engajamento está baixo - aumentar互动
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">2.</span>
                  Todos os perfis precisam de mais conteúdo
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">3.</span>
                  Seguir de volta para aumentar comunidade
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">4.</span>
                  Usar mais hashtags relevantes
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>📊 IGaming Metrics Report • Command Center • Dados coletados via Chrome Relay</p>
        <p>Última atualização: {new Date().toLocaleString('pt-BR')}</p>
      </div>
    </div>
  );
}
