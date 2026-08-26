import React from 'react';
import { X, AlertTriangle, Zap, Radio } from 'lucide-react';
import type { MapLocation } from '../../data/mapData';

interface SelectedLocationPanelProps {
  location: MapLocation | null;
  onClose: () => void;
}

export const SelectedLocationPanel = ({ location, onClose }: SelectedLocationPanelProps) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!location) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mt-4 flex items-start justify-between relative">
      <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors">
        <X className="w-5 h-5" />
      </button>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Title & Index */}
        <div className="md:col-span-1 pr-6 border-r border-slate-100">
          <h2 className="text-xl font-bold text-punarvas-text mb-1">{location.name}</h2>
          <div className="flex items-center gap-1 text-slate-500 text-xs mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {location.latitude}° N, {location.longitude}° E
          </div>
          
          <div className="flex items-end gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Risk Index</span>
            <span className={`text-3xl font-bold ${
              location.riskLevel === 'Critical' ? 'text-punarvas-critical-red' : 
              location.riskLevel === 'High' ? 'text-punarvas-high-orange' : 
              location.riskLevel === 'Medium' ? 'text-punarvas-medium-yellow' : 
              'text-punarvas-safe-green'
            }`}>
              {location.riskIndex}
            </span>
            <span className="text-sm font-semibold text-slate-400 mb-1.5">/100</span>
          </div>
        </div>

        {/* Demographics */}
        <div className="md:col-span-1 px-2 border-r border-slate-100">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Demographics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-0.5">Population</p>
              <p className="text-lg font-bold text-punarvas-text">{location.population.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-punarvas-high-orange mb-0.5">Vulnerable</p>
              <p className="text-lg font-bold text-punarvas-high-orange">{location.vulnerablePopulation.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Hazard Profile */}
        <div className="md:col-span-1 px-2 border-r border-slate-100">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Hazard Profile</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(location.hazards).map(([hazard, level]) => (
              <div key={hazard} className={`px-2 py-1 border rounded text-[10px] font-bold uppercase ${
                level === 'High' ? 'bg-red-50 border-red-200 text-punarvas-critical-red' :
                level === 'Moderate' ? 'bg-orange-50 border-orange-200 text-punarvas-high-orange' :
                'bg-yellow-50 border-yellow-200 text-punarvas-medium-yellow'
              }`}>
                {hazard}: {level}
              </div>
            ))}
            {Object.keys(location.hazards).length === 0 && (
              <span className="text-sm text-slate-400">None detected</span>
            )}
          </div>
        </div>

        {/* Infrastructure Status */}
        <div className="md:col-span-1 pl-2">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Infrastructure Status</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              {location.infrastructure.roads === 'Operational' ? (
                <div className="text-punarvas-safe-green flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> <span className="text-xs font-medium">Roads</span></div>
              ) : location.infrastructure.roads === 'Warning' ? (
                <div className="text-punarvas-medium-yellow flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> <span className="text-xs font-medium">Roads</span></div>
              ) : (
                <div className="text-punarvas-critical-red flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> <span className="text-xs font-medium line-through">Roads</span></div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {location.infrastructure.power === 'Operational' ? (
                <div className="text-punarvas-safe-green flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> <span className="text-xs font-medium">Power</span></div>
              ) : location.infrastructure.power === 'Warning' ? (
                <div className="text-punarvas-medium-yellow flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> <span className="text-xs font-medium">Power</span></div>
              ) : (
                <div className="text-punarvas-critical-red flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> <span className="text-xs font-medium line-through">Power</span></div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {location.infrastructure.comms === 'Operational' ? (
                <div className="text-punarvas-safe-green flex items-center gap-1.5"><Radio className="w-3.5 h-3.5" /> <span className="text-xs font-medium">Comms</span></div>
              ) : location.infrastructure.comms === 'Warning' ? (
                <div className="text-punarvas-medium-yellow flex items-center gap-1.5"><Radio className="w-3.5 h-3.5" /> <span className="text-xs font-medium">Comms</span></div>
              ) : (
                <div className="text-punarvas-critical-red flex items-center gap-1.5"><Radio className="w-3.5 h-3.5" /> <span className="text-xs font-medium line-through">Comms</span></div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
