import React from 'react';
import { X, AlertTriangle, Zap, Radio, ShieldCheck } from 'lucide-react';
import type { MapHabitation, MapSite } from '../../types/api';

interface SelectedLocationPanelProps {
  location: MapHabitation | MapSite | null;
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

  const isHabitation = 'risk_score' in location;
  const isSite = 'available_capacity' in location;

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
            {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
          </div>
          
          <div className="flex items-end gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {isHabitation ? 'Risk Index' : 'Safety Score'}
            </span>
            {isHabitation ? (
              <span className={`text-3xl font-bold ${
                (location as MapHabitation).risk_level === 'CRITICAL' ? 'text-punarvas-critical-red' : 
                (location as MapHabitation).risk_level === 'HIGH' ? 'text-punarvas-high-orange' : 
                (location as MapHabitation).risk_level === 'MEDIUM' ? 'text-punarvas-medium-yellow' : 
                'text-punarvas-safe-green'
              }`}>
                {(location as MapHabitation).risk_score}
              </span>
            ) : (
              <span className="text-3xl font-bold text-punarvas-safe-green">
                {(location as MapSite).overall_safety_score}
              </span>
            )}
            <span className="text-sm font-semibold text-slate-400 mb-1.5">/100</span>
          </div>
        </div>

        {/* Demographics / Capacity */}
        <div className="md:col-span-1 px-2 border-r border-slate-100">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            {isHabitation ? 'Demographics' : 'Capacity Details'}
          </h3>
          {isHabitation ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">Population</p>
                <p className="text-lg font-bold text-punarvas-text">{(location as MapHabitation).population.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-punarvas-high-orange mb-0.5">Vulnerable</p>
                <p className="text-lg font-bold text-punarvas-high-orange">{((location as MapHabitation).vulnerable_population ?? 0).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">Available</p>
                <p className="text-lg font-bold text-punarvas-safe-green">{((location as MapSite).available_capacity ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">Status</p>
                <p className="text-sm font-bold text-punarvas-text mt-1">{(location as MapSite).status}</p>
              </div>
            </div>
          )}
        </div>

        {/* Hazard Profile */}
        <div className="md:col-span-1 px-2 border-r border-slate-100">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Hazard Profile</h3>
          <div className="flex flex-wrap gap-2">
            {isHabitation && (location as MapHabitation).risk_level === 'CRITICAL' && (
              <div className="px-2 py-1 border rounded text-[10px] font-bold uppercase bg-red-50 border-red-200 text-punarvas-critical-red">
                Critical Zone
              </div>
            )}
            {isSite && (
              <div className="px-2 py-1 border rounded text-[10px] font-bold uppercase bg-green-50 border-green-200 text-punarvas-safe-green flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Safe Site
              </div>
            )}
            {(!isHabitation || (location as MapHabitation).risk_level !== 'CRITICAL') && !isSite && (
              <span className="text-sm text-slate-400">Data pending</span>
            )}
          </div>
        </div>

        {/* Infrastructure Status */}
        <div className="md:col-span-1 pl-2">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Infrastructure Status</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="text-slate-400 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> <span className="text-xs font-medium">Unknown</span></div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="text-slate-400 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> <span className="text-xs font-medium">Unknown</span></div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="text-slate-400 flex items-center gap-1.5"><Radio className="w-3.5 h-3.5" /> <span className="text-xs font-medium">Unknown</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
