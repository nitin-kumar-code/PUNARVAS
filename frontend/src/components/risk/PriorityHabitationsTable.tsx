import React, { useState, useMemo } from 'react';
import { Download, MoreVertical, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { TriageRecord } from '../../hooks/useHabitations';
import { HazardBadgeList } from '../../utils/hazardUtils';

interface PriorityHabitationsTableProps {
  data: TriageRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
}

type SortField = 'habitation' | 'hazard' | 'riskScore' | 'vulnerablePopulation' | 'confidence';

export const PriorityHabitationsTable = ({ data, selectedId, onSelect }: PriorityHabitationsTableProps) => {
  const [sortField, setSortField] = useState<SortField>('riskScore');
  const [sortDesc, setSortDesc] = useState<boolean>(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(true); // Default to desc for new sort
    }
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      // Handle confidence string ordering
      if (sortField === 'confidence') {
        const confVal: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        valA = confVal[a.confidence] || 0;
        valB = confVal[b.confidence] || 0;
      }

      if (valA < valB) return sortDesc ? 1 : -1;
      if (valA > valB) return sortDesc ? -1 : 1;
      return 0;
    });
  }, [data, sortField, sortDesc]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-40" />;
    return sortDesc ? <ArrowDown className="w-3 h-3 inline-block ml-1" /> : <ArrowUp className="w-3 h-3 inline-block ml-1" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <h3 className="font-bold text-punarvas-text text-lg flex items-center gap-2">
          Priority Habitations
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{data.length} records</span>
        </h3>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded transition-colors" title="Download CSV">
            <Download className="w-5 h-5" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded transition-colors" title="More Options">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto flex-1 h-full min-h-0">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="sticky top-0 bg-punarvas-dark-navy z-10">
            <tr className="text-white text-[10px] uppercase tracking-wider">
              <th className="p-3 pl-5 font-semibold cursor-pointer select-none" onClick={() => handleSort('habitation')}>
                HABITATION <SortIcon field="habitation" />
              </th>
              <th className="p-3 font-semibold cursor-pointer select-none" onClick={() => handleSort('hazard')}>
                HAZARD <SortIcon field="hazard" />
              </th>
              <th className="p-3 font-semibold w-40 cursor-pointer select-none" onClick={() => handleSort('riskScore')}>
                RISK SCORE <SortIcon field="riskScore" />
              </th>
              <th className="p-3 font-semibold cursor-pointer select-none" onClick={() => handleSort('vulnerablePopulation')}>
                VULNERABLE POP. <SortIcon field="vulnerablePopulation" />
              </th>
              <th className="p-3 font-semibold pr-5 text-right cursor-pointer select-none" onClick={() => handleSort('confidence')}>
                CONFIDENCE <SortIcon field="confidence" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr 
                key={row.id} 
                onClick={() => onSelect(row.id)}
                className={`border-b border-slate-100 cursor-pointer transition-colors ${
                  selectedId === row.id 
                    ? 'bg-blue-50/50 relative after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-punarvas-primary-blue' 
                    : idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/30 hover:bg-slate-50'
                }`}
              >
                <td className="p-3 pl-5 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    row.riskLevel === 'Critical' ? 'bg-punarvas-critical-red' :
                    row.riskLevel === 'High' ? 'bg-punarvas-high-orange' :
                    row.riskLevel === 'Medium' ? 'bg-punarvas-medium-yellow' :
                    'bg-punarvas-safe-green'
                  }`} />
                  <span className="font-semibold text-sm text-punarvas-text whitespace-nowrap">{row.habitation}</span>
                </td>
                <td className="p-3 text-sm text-slate-600">
                  <HazardBadgeList hazards={row.hazards} primaryHazard={row.hazard} />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-sm w-6 ${
                      row.riskLevel === 'Critical' ? 'text-punarvas-critical-red' :
                      row.riskLevel === 'High' ? 'text-punarvas-high-orange' :
                      row.riskLevel === 'Medium' ? 'text-punarvas-medium-yellow' :
                      'text-punarvas-safe-green'
                    }`}>
                      {row.riskScore}
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex min-w-[50px]">
                      <div 
                        className={`h-full rounded-full ${
                          row.riskLevel === 'Critical' ? 'bg-punarvas-critical-red' :
                          row.riskLevel === 'High' ? 'bg-punarvas-high-orange' :
                          row.riskLevel === 'Medium' ? 'bg-punarvas-medium-yellow' :
                          'bg-punarvas-safe-green'
                        }`} 
                        style={{ width: `${row.riskScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm font-medium text-slate-700">{row.vulnerablePopulation}</td>
                <td className="p-3 pr-5 text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    row.confidence === 'High' ? 'bg-red-50 text-punarvas-critical-red border border-red-100' :
                    row.confidence === 'Medium' ? 'bg-yellow-50 text-punarvas-medium-yellow border border-yellow-100' :
                    'bg-slate-50 text-slate-500 border border-slate-200'
                  }`}>
                    {row.confidence}
                  </span>
                </td>
              </tr>
            ))}
            
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                  No habitations match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
