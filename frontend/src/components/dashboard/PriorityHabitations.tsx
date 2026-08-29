import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { Users, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import type { ImmediateRelocationCandidate } from '../../types/api';

export const PriorityHabitations = () => {
  const { data, loading, error } = useDashboardSummary();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-punarvas-primary-blue" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col p-6 items-center justify-center text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-red-600 font-medium">Failed to load priority habitations</p>
      </div>
    );
  }

  // Get top 4 priority habitations
  const displayHabitations = data.immediate_relocation_candidates.slice(0, 4);

  const getPriority = (score: number) => {
    if (score >= 80) return 'P1';
    if (score >= 60) return 'P2';
    return 'P3';
  };

  const getStatus = (score: number) => {
    if (score >= 80) return 'Routing';
    if (score >= 60) return 'Pending';
    return 'Monitored';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-500" />
          <h3 className="font-bold text-punarvas-text text-lg">Priority Habitations</h3>
        </div>
        <button className="text-sm font-semibold text-punarvas-primary-blue hover:underline">View Full Registry</button>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-punarvas-dark-navy text-white text-[10px] uppercase tracking-wider">
              <th className="p-3 font-semibold w-[25%] pl-5">HABITATION</th>
              <th className="p-3 font-semibold text-center">RISK INDEX</th>
              <th className="p-3 font-semibold text-center">POP.</th>
              <th className="p-3 font-semibold text-center">VULN.</th>
              <th className="p-3 font-semibold text-center">PRIORITY</th>
              <th className="p-3 font-semibold">STATUS</th>
              <th className="p-3 font-semibold text-center pr-5">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {displayHabitations.map((hab: ImmediateRelocationCandidate, idx: number) => {
              const priority = getPriority(hab.risk_score);
              const status = getStatus(hab.risk_score);
              return (
                <tr key={hab.habitation_id} className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                  <td className="p-3 pl-5">
                    <span className="font-semibold text-sm text-punarvas-text">{hab.name}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`font-bold text-sm ${hab.risk_score > 90 ? 'text-punarvas-critical-red' : hab.risk_score > 70 ? 'text-punarvas-high-orange' : hab.risk_score > 40 ? 'text-punarvas-medium-yellow' : 'text-punarvas-safe-green'}`}>
                      {hab.risk_score.toFixed(1)}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-slate-700 text-center font-medium">N/A</td>
                  <td className="p-3 text-sm text-punarvas-critical-red text-center font-medium">{hab.vulnerable_population ?? 0}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold text-white ${
                      priority === 'P1' ? 'bg-punarvas-critical-red' : 
                      priority === 'P2' ? 'bg-punarvas-high-orange' : 
                      'bg-punarvas-safe-green'
                    }`}>
                      {priority}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-slate-500 font-medium">
                    {status === 'Routing' ? (
                      <span className="text-punarvas-primary-blue">{status}</span>
                    ) : (
                      status
                    )}
                  </td>
                  <td className="p-3 text-center pr-5 text-punarvas-primary-blue">
                    <button className="p-1 hover:bg-blue-50 rounded">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {displayHabitations.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No priority habitations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
