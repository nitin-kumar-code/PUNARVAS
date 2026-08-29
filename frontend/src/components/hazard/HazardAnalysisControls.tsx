import React from 'react';
import { RefreshCw } from 'lucide-react';

export const HazardAnalysisControls = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
      <h3 className="text-sm font-bold text-punarvas-text mb-4">Hazard Analysis Controls</h3>
      
      <div className="flex flex-wrap gap-6 items-end">
        {/* Dropdowns */}
        <div className="flex gap-4 flex-wrap flex-1">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hazard Type</label>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-punarvas-primary-blue">
              <option>All Hazards</option>
              <option>Flood</option>
              <option>Landslide</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Risk Severity</label>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-punarvas-primary-blue">
              <option>All Severity</option>
              <option>Critical</option>
              <option>High</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Administrative Area</label>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-punarvas-primary-blue">
              <option>Tripura</option>
              <option>West Tripura</option>
              <option>South Tripura</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Time Period</label>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-punarvas-primary-blue">
              <option>Current Assessment</option>
              <option>Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-6 items-center border-l border-slate-200 pl-6 h-[42px]">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-punarvas-primary-blue"></div>
            </div>
            <span className="text-xs font-semibold text-slate-700">Population Density</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-punarvas-primary-blue"></div>
            </div>
            <span className="text-xs font-semibold text-slate-700">Infrastructure</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-punarvas-primary-blue"></div>
            </div>
            <span className="text-xs font-semibold text-slate-700">Habitations</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button className="bg-punarvas-primary-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors h-[42px]">
            Apply Filters
          </button>
          <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors h-[42px] flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>

      </div>
    </div>
  );
};
