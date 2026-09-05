import React from 'react';
import { ListTodo, Calendar, Cpu, User } from 'lucide-react';

interface Props {
  stats: {
    total: number;
    today: number;
    system: number;
    officer: number;
  };
}

export const AuditSummaryCards = ({ stats }: Props) => {
  const cards = [
    { label: 'TOTAL EVENTS', value: stats.total, icon: ListTodo },
    { label: 'TODAY', value: stats.today, icon: Calendar },
    { label: 'SYSTEM EVENTS', value: stats.system, icon: Cpu },
    { label: 'OFFICER ACTIONS', value: stats.officer, icon: User }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold text-slate-500 tracking-wide uppercase mb-1">{card.label}</h3>
              <div className="text-3xl font-black text-punarvas-dark-navy">{card.value.toLocaleString()}</div>
            </div>
            <Icon className="w-6 h-6 text-slate-300" />
          </div>
        );
      })}
    </div>
  );
};
