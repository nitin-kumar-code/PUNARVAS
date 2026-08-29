import React from 'react';
import { MapPin } from 'lucide-react';

interface Props {
  destinations: any[];
}

export const AllocationDestination = ({ destinations }: Props) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full mt-6">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-slate-700" />
          <h3 className="text-[15px] font-bold text-punarvas-text">Allocation by Destination</h3>
        </div>
        <button className="text-xs font-bold text-punarvas-primary-blue hover:text-blue-700">View All</button>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {destinations.map(dest => {
          const kitsShortage = dest.resources.kits < dest.resources.reqKits;
          
          return (
            <div key={dest.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-punarvas-text">{dest.name}</h4>
                <span className="text-xs font-bold text-punarvas-primary-blue bg-blue-50 px-2 py-1 rounded">{dest.population} Pax</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 rounded-lg p-2 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-400 mb-1">BUSES</span>
                  <span className="text-sm font-black text-slate-700">{dest.resources.buses}</span>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-400 mb-1">MEDICAL</span>
                  <span className="text-sm font-black text-slate-700">{dest.resources.medical}</span>
                </div>
                <div className={`rounded-lg p-2 flex flex-col items-center justify-center ${kitsShortage ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}>
                  <span className={`text-[10px] font-bold mb-1 ${kitsShortage ? 'text-punarvas-critical-red' : 'text-slate-400'}`}>KITS</span>
                  <span className={`text-sm font-black ${kitsShortage ? 'text-punarvas-critical-red' : 'text-slate-700'}`}>
                    {kitsShortage ? `${dest.resources.kits}/${dest.resources.reqKits}` : dest.resources.kits}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
