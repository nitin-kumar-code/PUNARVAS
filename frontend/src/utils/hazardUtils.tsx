import React from 'react';

export type HazardMap = Record<string, number> | null | undefined;

export const normalizeHabitationHazards = (hazards: HazardMap, primaryHazard?: string) => {
  if (hazards && Object.keys(hazards).length > 0) {
    return Object.entries(hazards).map(([name, score]) => ({
      name,
      score,
      severity: score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 40 ? 'MODERATE' : 'LOW',
    }));
  }
  
  if (primaryHazard && primaryHazard !== 'Unknown' && primaryHazard !== 'UNKNOWN') {
    return [{
      name: primaryHazard,
      score: 0,
      severity: 'UNKNOWN'
    }];
  }

  return [];
};

export const HazardBadgeList = ({ hazards, primaryHazard }: { hazards: HazardMap, primaryHazard?: string }) => {
  const normalized = normalizeHabitationHazards(hazards, primaryHazard);
  
  if (normalized.length === 0) {
    return <span className="text-slate-400 text-xs font-medium">Not specified</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {normalized.map(h => (
        <div key={h.name} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 whitespace-nowrap">
          <span className="font-bold text-slate-800">{h.name}</span>
          {h.score > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <span className={`text-[10px] font-bold tracking-wide uppercase ${
                h.severity === 'CRITICAL' ? 'text-punarvas-critical-red' :
                h.severity === 'HIGH' ? 'text-punarvas-high-orange' :
                h.severity === 'MODERATE' ? 'text-punarvas-medium-yellow' :
                'text-punarvas-safe-green'
              }`}>
                {h.severity}
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
