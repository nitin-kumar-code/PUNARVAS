import React from 'react';
import { ChevronDown } from 'lucide-react';

interface MapControlPanelProps {
  filters: any;
  setFilters: (f: any) => void;
}

export const MapControlPanel = ({ filters, setFilters }: MapControlPanelProps) => {
  const toggleHazard = (hazard: string) => {
    setFilters((prev: any) => ({
      ...prev,
      hazards: {
        ...prev.hazards,
        [hazard]: !prev.hazards[hazard]
      }
    }));
  };

  const toggleSeverity = (severity: string) => {
    setFilters((prev: any) => ({
      ...prev,
      severity: {
        ...prev.severity,
        [severity]: !prev.severity[severity]
      }
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-6 h-full overflow-y-auto">
      {/* View Area */}
      <div>
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">View Area</h3>
        <div className="space-y-3">
          <div className="relative">
            <select className="w-full appearance-none bg-white border border-slate-200 text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-punarvas-primary-blue/20 focus:border-punarvas-primary-blue text-slate-700 font-medium">
              <option>State (Uttarakhand)</option>
              <option>State (Himachal Pradesh)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <input
            type="text"
            defaultValue="Chamoli"
            className="w-full bg-white border border-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-punarvas-primary-blue/20 focus:border-punarvas-primary-blue text-slate-700 font-medium"
          />
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Base Layers */}
      <div>
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Base Layers</h3>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={filters.baseLayer.populationDensity}
            onChange={(e) => setFilters((p: any) => ({ ...p, baseLayer: { ...p.baseLayer, populationDensity: e.target.checked }}))}
            className="w-4 h-4 rounded border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue cursor-pointer" 
          />
          <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Population Density</span>
        </label>
      </div>

      <hr className="border-slate-100" />

      {/* Hazard Layers */}
      <div>
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Hazard Layers</h3>
        <div className="space-y-3">
          {[
            { id: 'flood', label: 'Flood Exposure' },
            { id: 'earthquake', label: 'Earthquake Faults' }
          ].map(hazard => (
            <label key={hazard.id} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={filters.hazards[hazard.id] || false}
                onChange={() => toggleHazard(hazard.id)}
                className="w-4 h-4 rounded border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue cursor-pointer" 
              />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{hazard.label}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Risk Severity */}
      <div>
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Risk Severity</h3>
        <div className="space-y-3">
          {[
            { id: 'Critical', label: 'Critical (80-100)', color: 'bg-punarvas-critical-red' },
            { id: 'High', label: 'High (60-79)', color: 'bg-punarvas-high-orange' },
            { id: 'Medium', label: 'Medium (40-59)', color: 'bg-punarvas-medium-yellow' },
            { id: 'Low', label: 'Low (0-39)', color: 'bg-punarvas-safe-green' },
          ].map(severity => (
            <label key={severity.id} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={filters.severity[severity.id] ?? true}
                onChange={() => toggleSeverity(severity.id)}
                className="w-4 h-4 rounded border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue cursor-pointer" 
              />
              <div className={`w-3 h-3 rounded ${severity.color}`} />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{severity.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
