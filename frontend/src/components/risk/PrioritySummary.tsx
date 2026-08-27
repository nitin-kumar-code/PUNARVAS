import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export const PrioritySummary = () => {
  const cards = [
    {
      label: 'IMMEDIATE',
      value: 8,
      trend: 2,
      trendDir: 'up',
      color: 'text-punarvas-critical-red',
      borderColor: 'border-l-punarvas-critical-red',
    },
    {
      label: 'SHORT-TERM',
      value: 10,
      trend: 0,
      trendDir: 'flat',
      color: 'text-punarvas-high-orange',
      borderColor: 'border-l-punarvas-high-orange',
    },
    {
      label: 'MEDIUM-TERM',
      value: 6,
      trend: 1,
      trendDir: 'down',
      color: 'text-punarvas-medium-yellow',
      borderColor: 'border-l-punarvas-medium-yellow',
    },
    {
      label: 'LOWER PRIORITY',
      value: 12,
      trend: 0,
      trendDir: 'flat',
      color: 'text-punarvas-safe-green',
      borderColor: 'border-l-punarvas-safe-green',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div key={idx} className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${card.borderColor} p-5 flex flex-col`}>
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{card.label}</h3>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-punarvas-text">{card.value}</span>
            <div className={`flex items-center text-sm font-semibold ${card.color}`}>
              {card.trendDir === 'up' && <ArrowUp className="w-4 h-4 mr-0.5" />}
              {card.trendDir === 'down' && <ArrowDown className="w-4 h-4 mr-0.5" />}
              {card.trendDir === 'flat' && <Minus className="w-4 h-4 mr-0.5" />}
              {card.trend !== 0 && card.trend}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
