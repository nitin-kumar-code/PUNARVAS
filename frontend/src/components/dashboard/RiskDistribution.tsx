import { useState, useEffect } from 'react';
import { riskDistribution } from '../../data/mockData';
import { PieChart } from 'lucide-react';

export const RiskDistribution = () => {
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const total = riskDistribution.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <PieChart className="w-5 h-5 text-slate-500" />
        <h3 className="font-bold text-punarvas-text text-lg">Risk Distribution</h3>
      </div>
      
      <div className="space-y-5">
        {riskDistribution.map((item) => {
          const percentage = Math.round((item.count / total) * 100);
          
          return (
            <div key={item.level}>
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-semibold text-punarvas-text">{item.level}</span>
                <span className={`text-sm font-bold ${item.level === 'Critical' ? 'text-punarvas-critical-red' : item.level === 'High' ? 'text-punarvas-high-orange' : item.level === 'Medium' ? 'text-punarvas-medium-yellow' : 'text-punarvas-safe-green'}`}>
                  {String(item.count).padStart(2, '0')}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`} 
                  style={{ width: animated ? `${percentage}%` : '0%' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
