import React from 'react';
import { CheckSquare } from 'lucide-react';

interface Props {
  resources: any[];
}

export const ResourceReadiness = ({ resources }: Props) => {
  const getRes = (id: string) => resources.find(r => r.id === id);
  const items = [
    { label: 'Transport', res: getRes('buses') },
    { label: 'Medical', res: getRes('medical') },
    { label: 'Shelter Units', res: getRes('shelter') },
    { label: 'Relief Kits', res: getRes('kits') }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 flex items-center gap-2">
        <CheckSquare className="w-5 h-5 text-slate-700" />
        <h3 className="text-[15px] font-bold text-punarvas-text">Resource Readiness</h3>
      </div>
      
      <div className="p-5 flex-1 space-y-6">
        {items.map(({ label, res }, idx) => {
          if (!res) return null;
          const pct = Math.round((res.available / res.required) * 100);
          const isShortage = pct < 100;
          
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700">{label}</span>
                <span className={isShortage ? 'text-punarvas-critical-red' : 'text-punarvas-safe-green'}>
                  {isShortage ? 'Shortage' : 'Ready'} ({pct}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isShortage ? 'bg-punarvas-critical-red' : 'bg-punarvas-safe-green'}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
