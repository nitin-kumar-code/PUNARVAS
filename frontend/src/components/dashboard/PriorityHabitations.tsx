import { useState, useEffect } from 'react';
import { habitations } from '../../data/mockData';
import { Users, ChevronRight } from 'lucide-react';

export const PriorityHabitations = () => {
  // Only show the ones needing attention
  const displayHabitations = habitations.filter(h => h.riskLevel !== 'Safe').slice(0, 4);

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
            {displayHabitations.map((hab, idx) => (
              <tr key={hab.id} className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                <td className="p-3 pl-5">
                  <span className="font-semibold text-sm text-punarvas-text">{hab.name}</span>
                </td>
                <td className="p-3 text-center">
                  <span className={`font-bold text-sm ${hab.riskIndex > 90 ? 'text-punarvas-critical-red' : hab.riskIndex > 70 ? 'text-punarvas-high-orange' : hab.riskIndex > 40 ? 'text-punarvas-medium-yellow' : 'text-punarvas-safe-green'}`}>
                    {hab.riskIndex.toFixed(1)}
                  </span>
                </td>
                <td className="p-3 text-sm text-slate-700 text-center font-medium">{hab.population}</td>
                <td className="p-3 text-sm text-punarvas-critical-red text-center font-medium">{hab.vulnerablePopulation}</td>
                <td className="p-3 text-center">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold text-white ${
                    hab.priority === 'P1' ? 'bg-punarvas-critical-red' : 
                    hab.priority === 'P2' ? 'bg-punarvas-high-orange' : 
                    'bg-punarvas-safe-green'
                  }`}>
                    {hab.priority}
                  </span>
                </td>
                <td className="p-3 text-sm text-slate-500 font-medium">
                  {hab.status === 'Routing' ? (
                    <span className="text-punarvas-primary-blue">{hab.status}</span>
                  ) : (
                    hab.status
                  )}
                </td>
                <td className="p-3 text-center pr-5 text-punarvas-primary-blue">
                  <button className="p-1 hover:bg-blue-50 rounded">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
