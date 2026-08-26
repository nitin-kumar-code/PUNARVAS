import { useState, useEffect } from 'react';
import { kpiStats } from '../../data/mockData';
import { Home, AlertTriangle, Activity, Users, ShieldCheck } from 'lucide-react';

export const KPIGrid = () => {
  const cards = [
    {
      title: 'AT-RISK HABITATIONS',
      value: kpiStats.atRiskHabitations,
      subValue: '8 Critical',
      icon: Home,
      color: 'text-punarvas-primary-blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-t-punarvas-primary-blue',
      subColor: 'text-punarvas-primary-blue',
    },
    {
      title: 'CRITICAL ZONES',
      value: String(kpiStats.criticalZones).padStart(2, '0'),
      subValue: 'Immediate attention',
      icon: AlertTriangle,
      color: 'text-punarvas-critical-red',
      bgColor: 'bg-red-50',
      borderColor: 'border-t-punarvas-critical-red',
      subColor: 'text-punarvas-critical-red',
    },
    {
      title: 'IMMEDIATE RELOCATION',
      value: kpiStats.immediateRelocation,
      subValue: 'People requiring action',
      icon: Activity,
      color: 'text-punarvas-high-orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-t-punarvas-high-orange',
      subColor: 'text-punarvas-high-orange',
    },
    {
      title: 'VULNERABLE POPULATION',
      value: kpiStats.vulnerablePopulation.toLocaleString(),
      subValue: 'People identified',
      icon: Users,
      color: 'text-punarvas-primary-blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-t-punarvas-primary-blue',
      subColor: 'text-punarvas-primary-blue',
    },
    {
      title: 'SAFE RELOCATION CAPACITY',
      value: kpiStats.safeRelocationCapacity.toLocaleString(),
      subValue: 'People accommodated',
      icon: ShieldCheck,
      color: 'text-punarvas-safe-green',
      bgColor: 'bg-green-50',
      borderColor: 'border-t-punarvas-safe-green',
      subColor: 'text-punarvas-safe-green',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div key={idx} className={`bg-white rounded-xl shadow-sm border border-slate-100 border-t-4 ${card.borderColor} p-4 flex flex-col`}>
          <div className="flex items-start gap-3 mb-2">
            <div className={`p-2 rounded-lg ${card.bgColor} ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide leading-tight mt-1">{card.title}</h3>
          </div>
          <div className="mt-auto">
            <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
            <div className={`text-[11px] font-medium mt-1 ${card.subColor}`}>{card.subValue}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
