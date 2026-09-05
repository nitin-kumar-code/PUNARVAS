import React from 'react';
import { AlertTriangle, Users, MapPin } from 'lucide-react';
import type { TriageRecord } from '../../hooks/useHabitations';
import { HazardBadgeList } from '../../utils/hazardUtils';

export const SourceHabitationCard = ({ habitation }: { habitation: TriageRecord }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-l-4 border-punarvas-critical-red p-6">
        <div className="flex items-start justify-between mb-8">
          <h2 className="text-2xl font-bold text-punarvas-text tracking-tight">{habitation.habitation}</h2>
          <div className="px-2.5 py-1 rounded text-[10px] font-bold bg-punarvas-critical-red text-white uppercase tracking-wider">
            {habitation.priority}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <span className="text-sm font-semibold text-slate-500">Risk Score</span>
            <span className="text-xl font-bold text-punarvas-critical-red">
              {habitation.riskScore} <span className="text-xs text-slate-400">/ 100</span>
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <span className="text-sm font-semibold text-slate-500">Population</span>
            <span className="text-lg font-bold text-punarvas-text">{habitation.population.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <span className="text-sm font-semibold text-slate-500">Vulnerable</span>
            <span className="text-lg font-bold text-punarvas-text">{habitation.vulnerablePopulation.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-500">Hazard Profile</span>
            <HazardBadgeList hazards={habitation.hazards} primaryHazard={habitation.hazard} />
          </div>
        </div>
      </div>
    </div>
  );
};
