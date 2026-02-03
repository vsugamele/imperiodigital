"use client";

import { useState } from "react";
import { CreditCard, Check, Wallet } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: 97,
    credits: 100,
    perCredit: "R$ 0,97",
    features: ["100 credits/mês", "Suporte por email", "Templates básicos"]
  },
  {
    name: "Pro",
    price: 297,
    credits: 400,
    perCredit: "R$ 0,74",
    popular: true,
    features: ["400 credits/mês", "Suporte prioritário", "Todos os templates", "Brand Voice"]
  },
  {
    name: "Agency",
    price: 897,
    credits: 1500,
    perCredit: "R$ 0,60",
    features: ["1.500 credits/mês", "Suporte VIP", "Templates ilimitados", "API access"]
  }
];

const transactions = [
  { id: 1, date: "2026-02-01", amount: 97, credits: 100, status: "approved" },
  { id: 2, date: "2026-01-15", amount: 297, credits: 400, status: "approved" },
  { id: 3, date: "2026-01-01", amount: 97, credits: 100, status: "approved" },
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Billing</h1>
        <p className="text-slate-600 mt-1">Gerencie seus credits e planos</p>
      </div>

      {/* Current Credits */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100">Credits disponíveis</p>
            <p className="text-5xl font-bold">85</p>
            <p className="text-blue-100 mt-2">~114 posts restantes</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Planos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative bg-white rounded-xl p-6 border-2 transition-all cursor-pointer ${
                selectedPlan === plan.name ? "border-blue-500 shadow-lg" : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => setSelectedPlan(plan.name)}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Mais Popular
                </span>
              )}
              <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-slate-900">R$ {plan.price}</span>
                <span className="text-slate-500">/mês</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{plan.perCredit} por credit</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-green-500" /> {feature}
                  </li>
                ))}
              </ul>
              <button 
                className={`w-full mt-6 py-2.5 rounded-lg font-medium transition-colors ${
                  selectedPlan === plan.name 
                    ? "bg-blue-600 text-white" 
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {selectedPlan === plan.name ? "Selecionado" : "Selecionar"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Histórico de transações</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Data</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Plano</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Credits</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Valor</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-900">{tx.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">Starter</td>
                  <td className="px-6 py-4 text-sm text-slate-600">+{tx.credits}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">R$ {tx.amount}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      <Check className="w-3 h-3" /> Aprovado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
