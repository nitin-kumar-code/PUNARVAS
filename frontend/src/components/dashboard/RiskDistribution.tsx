import { useState, useEffect } from 'react';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { PieChart, Loader2, AlertTriangle } from 'lucide-react';

export const RiskDistribution = () => {
  const { data, loading, error } = useDashboardSummary();
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    if (data && !loading) {
      const timer = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [data, loading]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-punarvas-primary-blue" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full flex flex-col items-center justify-center text-center min-h-[300px]">
        <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-red-600 font-medium">Failed to load risk distribution</p>
      </div>
    );
  }

  const dist = data.risk_distribution;
  const total = dist.critical + dist.high + dist.medium + dist.low;

  const distributionData = [
    { level: 'Critical', count: dist.critical, color: 'bg-red-600' },
    { level: 'High', count: dist.high, color: 'bg-orange-500' },
    { level: 'Medium', count: dist.medium, color: 'bg-yellow-400' },
    { level: 'Low', count: dist.low, color: 'bg-green-600' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <PieChart className="w-5 h-5 text-slate-500" />
        <h3 className="font-bold text-punarvas-text text-lg">Risk Distribution</h3>
      </div>
      
      <div className="space-y-5">
        {distributionData.map((item) => {
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
          
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
