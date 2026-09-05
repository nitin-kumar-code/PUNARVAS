import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { TriageRecord } from '../../hooks/useHabitations';

interface Props {
  habitations: TriageRecord[];
}

export const HazardIntensitySummary = ({ habitations }: Props) => {
  const intensitySummary = useMemo(() => {
    let critical = 0, high = 0, medium = 0, low = 0;
    
    habitations.forEach(h => {
      const level = h.riskLevel?.toUpperCase();
      if (level === 'CRITICAL') critical++;
      else if (level === 'HIGH') high++;
      else if (level === 'MEDIUM') medium++;
      else if (level === 'LOW') low++;
    });

    return { critical, high, medium, low, total: critical + high + medium + low };
  }, [habitations]);

  const { critical, high, medium, low, total } = intensitySummary;
  
  const data = [
    { name: 'Critical', value: critical, color: '#E53935' },
    { name: 'High', value: high, color: '#FF8A00' },
    { name: 'Medium', value: medium, color: '#F5B700' },
    { name: 'Low', value: low, color: '#18A957' }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col h-full">
      <h3 className="text-sm font-bold text-punarvas-text mb-4">Hazard Intensity Summary</h3>
      
      <div className="flex items-center gap-6 flex-1">
        <div className="w-[120px] h-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-[10px] font-bold text-slate-700">{item.name}</span>
              </div>
              <div className="text-[10px] font-semibold text-slate-500">
                {total > 0 ? Math.round((item.value / total) * 100) : 0}% ({item.value})
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between items-center">
        <span className="text-sm font-bold text-slate-600">Total Areas</span>
        <span className="text-sm font-bold text-punarvas-text">{total}</span>
      </div>
    </div>
  );
};
