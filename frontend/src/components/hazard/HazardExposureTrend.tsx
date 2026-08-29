import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const HazardExposureTrend = () => {
  const data = useMemo(() => {
    // Generate dates dynamically for the last 30 days
    const result = [];
    const today = new Date();
    
    // We'll generate 9 data points spaced over 30 days for readability (like the original mock)
    for (let i = 8; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - (i * 3));
      const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); // e.g. "20 Apr"
      
      result.push({
        date: dateStr,
        critical: Math.floor(65 + Math.random() * 20),
        high: Math.floor(45 + Math.random() * 15),
        medium: Math.floor(30 + Math.random() * 15),
        low: Math.floor(10 + Math.random() * 10),
      });
    }
    return result;
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 shadow-md p-3 rounded-lg text-xs">
          <p className="font-bold text-slate-700 mb-2">{label}</p>
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center justify-between gap-4 mb-1">
              <span style={{ color: p.color }} className="font-semibold capitalize">{p.name}</span>
              <span className="font-bold">{p.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-bold text-punarvas-text">Hazard Exposure Trend <span className="text-slate-400 font-semibold">(Last 30 Days)</span></h3>
        </div>
        <select className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2 py-1 outline-none text-slate-700">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
          <option>Last 90 Days</option>
        </select>
      </div>
      
      <div className="flex-1 min-h-[160px] w-full -ml-4 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dx={-10} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} label={{ value: 'Exposure Index', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 10, fill: '#64748B' } }} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="critical" stroke="#E53935" strokeWidth={2} dot={{ r: 3, fill: '#E53935', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="high" stroke="#FF8A00" strokeWidth={2} dot={{ r: 3, fill: '#FF8A00', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="medium" stroke="#F5B700" strokeWidth={2} dot={{ r: 3, fill: '#F5B700', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="low" stroke="#18A957" strokeWidth={2} dot={{ r: 3, fill: '#18A957', strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-1.5 cursor-pointer">
          <div className="w-4 h-0.5 bg-punarvas-critical-red relative"><div className="absolute w-2 h-2 rounded-full bg-punarvas-critical-red top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div></div>
          <span className="text-[10px] font-bold text-slate-700">Critical</span>
        </div>
        <div className="flex items-center gap-1.5 cursor-pointer">
          <div className="w-4 h-0.5 bg-punarvas-high-orange relative"><div className="absolute w-2 h-2 rounded-full bg-punarvas-high-orange top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div></div>
          <span className="text-[10px] font-bold text-slate-700">High</span>
        </div>
        <div className="flex items-center gap-1.5 cursor-pointer">
          <div className="w-4 h-0.5 bg-punarvas-medium-yellow relative"><div className="absolute w-2 h-2 rounded-full bg-punarvas-medium-yellow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div></div>
          <span className="text-[10px] font-bold text-slate-700">Medium</span>
        </div>
        <div className="flex items-center gap-1.5 cursor-pointer">
          <div className="w-4 h-0.5 bg-punarvas-safe-green relative"><div className="absolute w-2 h-2 rounded-full bg-punarvas-safe-green top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div></div>
          <span className="text-[10px] font-bold text-slate-700">Low</span>
        </div>
      </div>
    </div>
  );
};
