import React from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import type { DecisionRecord } from '../../data/decisionData';

export const FinalReceipt = ({ decision }: { decision: DecisionRecord }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden mb-6">
      
      {/* Top Banner */}
      <div className="absolute top-0 right-0 bg-punarvas-dark-navy text-white px-6 py-2 rounded-bl-lg font-bold text-sm tracking-wider">
        FINAL DECISION RECEIPT
      </div>
      
      <div className="p-8 pb-10">
        <div className="flex justify-end items-center mb-8">
          <div className="text-right mr-4 mt-8">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Confidence Level</div>
            <div className="text-xl font-bold text-punarvas-text uppercase">
              {decision.confidenceLabel} ({decision.confidence}%)
            </div>
          </div>
        </div>

        {/* Relocation Required Tag */}
        <div className="inline-block bg-red-50 border border-red-200 px-6 py-3 mb-12 relative overflow-hidden">
           <div className="absolute left-0 top-0 bottom-0 w-1 bg-punarvas-critical-red" />
           <h2 className="text-2xl font-bold text-punarvas-critical-red tracking-tight leading-tight">RELOCATION<br/>REQUIRED</h2>
        </div>

        {/* Relocation Flow */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 mb-8 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          
          {/* FROM */}
          <div className="flex flex-col items-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">From</div>
            <div className="bg-white border-2 border-punarvas-primary-blue rounded-lg px-8 py-4 shadow-sm text-center min-w-[200px]">
              <h3 className="text-xl font-bold text-punarvas-dark-navy mb-1">{decision.source.name}</h3>
              <p className="text-xs font-semibold text-slate-500">Pop: {decision.source.population.toLocaleString()}</p>
            </div>
          </div>

          <ArrowRight className="w-8 h-8 text-slate-300 rotate-90 lg:rotate-0" />

          {/* DESTINATIONS */}
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {decision.destinations.map((dest, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300 text-2xl font-light hidden lg:block">+</span>}
                <div className="flex flex-col items-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{dest.role} Destination</div>
                  <div className={`border-2 rounded-lg px-6 py-4 shadow-sm text-center min-w-[180px] flex items-center justify-center gap-3 ${
                    dest.role === 'Primary' 
                      ? 'bg-[#E8F8EE] border-[#BBE5CB] text-punarvas-safe-green' 
                      : 'bg-[#EFF5FF] border-[#CDE0FF] text-punarvas-primary-blue'
                  }`}>
                    <Building2 className={`w-5 h-5 ${dest.role === 'Primary' ? 'text-punarvas-safe-green' : 'text-punarvas-primary-blue'}`} />
                    <h3 className="text-xl font-bold tracking-tight">{dest.site}</h3>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

        </div>

        {/* Coverage Bar */}
        <div className="bg-[#E8F8EE] border border-[#BBE5CB] rounded-lg p-5 flex items-center justify-between">
          <span className="text-sm font-bold text-punarvas-safe-green">Total Population Coverage</span>
          <div className="flex-1 max-w-lg mx-6 h-2.5 bg-[#C9ECD5] rounded-full overflow-hidden">
            <div className="h-full bg-punarvas-safe-green rounded-full" style={{ width: `${decision.coverage}%` }} />
          </div>
          <span className="text-lg font-bold text-punarvas-safe-green">{decision.coverage}%</span>
        </div>
        
        {decision.coverage < 100 && (
          <div className="mt-3 text-center text-sm font-bold text-punarvas-high-orange bg-orange-50 p-2 rounded">
            {decision.source.population - decision.destinations.reduce((acc, curr) => acc + curr.allocation, 0)} people require additional capacity
          </div>
        )}

      </div>
    </div>
  );
};
