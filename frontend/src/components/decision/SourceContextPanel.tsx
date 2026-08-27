import React from 'react';
import type { DecisionRecord } from '../../data/decisionData';

export const SourceContextPanel = ({ decision }: { decision: DecisionRecord }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-6">
      
      {/* SOURCE VILLAGE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 w-full lg:w-[30%] shrink-0">
        <h3 className="text-punarvas-primary-blue text-sm font-bold tracking-wide uppercase mb-4">Source Village</h3>
        <h2 className="text-3xl font-bold text-punarvas-text tracking-tight mb-6">{decision.source.name}</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Population</p>
            <p className="text-xl font-bold text-punarvas-text">{decision.source.population.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hazard</p>
            <p className="text-xl font-bold text-punarvas-text">{decision.source.hazard}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center bg-red-50/50 border border-red-100 rounded-lg p-3 mb-4">
          <span className="text-sm font-semibold text-punarvas-text">Priority</span>
          <span className="text-sm font-bold text-punarvas-critical-red">{decision.source.priority}</span>
        </div>
        
        <div className="flex justify-between items-center bg-red-50/50 border border-red-100 rounded-lg p-3">
          <span className="text-sm font-semibold text-punarvas-text">Risk Score</span>
          <span className="text-xl font-bold text-punarvas-critical-red">
            {decision.source.riskScore} <span className="text-sm text-punarvas-critical-red/70">/ 100</span>
          </span>
        </div>
      </div>

      {/* WHY THIS VILLAGE? */}
      <div className="bg-[#EEF2F6] rounded-xl border border-blue-100 shadow-sm p-6 w-full lg:flex-1 shrink-0">
        <h3 className="text-punarvas-primary-blue text-sm font-bold tracking-wide uppercase mb-1">Why This Village?</h3>
        <p className="text-sm font-medium text-slate-600 mb-6">Priority Score Breakdown (Total: {decision.source.riskScore})</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 h-[140px]">
          {decision.factors.map((factor, idx) => {
            const colorClass = factor.severity === 'critical' ? 'text-punarvas-critical-red' : 
                               factor.severity === 'high' ? 'text-punarvas-high-orange' : 
                               'text-punarvas-medium-yellow';
            return (
              <div key={idx} className="bg-white rounded-lg border border-white/40 shadow-sm flex flex-col justify-center items-center text-center p-4">
                <span className={`text-4xl font-bold mb-2 ${colorClass}`}>+{factor.contribution}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{factor.name}</span>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
};
