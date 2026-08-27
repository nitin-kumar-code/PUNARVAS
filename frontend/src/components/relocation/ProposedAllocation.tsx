import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { TriageRecord } from '../../data/triageData';
import type { RelocationSite } from '../../data/relocationData';

interface ProposedAllocationProps {
  source: TriageRecord;
  allocations: { site: RelocationSite; people: number }[];
  coveragePercent: number;
}

export const ProposedAllocation = ({ source, allocations, coveragePercent }: ProposedAllocationProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-punarvas-dark-navy">Proposed Allocation</h3>
        <div className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
          coveragePercent === 100 ? 'bg-green-100 text-punarvas-safe-green' : 'bg-yellow-100 text-punarvas-medium-yellow'
        }`}>
          {coveragePercent === 100 ? '100% COVERED' : 'PARTIAL COVERAGE'}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-6 px-4 py-8">
        {/* Source */}
        <div className="bg-punarvas-dark-navy text-white rounded-lg p-5 w-48 text-center flex-shrink-0 shadow-md">
          <h4 className="font-bold text-lg mb-1">{source.habitation}</h4>
          <p className="text-xs text-blue-200">{source.population.toLocaleString()} people</p>
        </div>
        
        {/* Arrow */}
        <div className="text-slate-300 flex flex-col items-center">
          <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        
        {/* Destinations */}
        <div className="flex flex-col gap-3 w-48 flex-shrink-0">
          {allocations.map((alloc, idx) => (
            <div key={idx} className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
              <h4 className="font-bold text-punarvas-primary-blue text-sm mb-1">{alloc.site.name}</h4>
              <p className="text-[11px] text-slate-500 font-semibold">{alloc.people.toLocaleString()} people</p>
            </div>
          ))}
          {allocations.length === 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-sm font-semibold text-slate-400">
              No sites selected
            </div>
          )}
        </div>
      </div>
      
      {coveragePercent < 100 && coveragePercent > 0 && (
        <div className="mt-4 bg-yellow-50 text-yellow-800 text-xs font-semibold p-3 rounded-lg border border-yellow-200">
          {source.population - allocations.reduce((sum, a) => sum + a.people, 0)} people require additional capacity.
        </div>
      )}
    </div>
  );
};
