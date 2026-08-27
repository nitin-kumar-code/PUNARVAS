import React from 'react';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import type { RelocationSite } from '../../data/relocationData';

interface SiteDetailsModalProps {
  site: RelocationSite | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export const SiteDetailsModal = ({ site, isOpen, onClose, onSelect, isSelected }: SiteDetailsModalProps) => {
  if (!isOpen || !site) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-punarvas-dark-navy/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${site.eligible ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200'}`}>
          <div>
            <h2 className="text-xl font-bold text-punarvas-text flex items-center gap-2">
              {site.name}
              {site.eligible ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-punarvas-safe-green bg-green-100 border border-green-200 uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> SAFE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-punarvas-critical-red bg-red-100 border border-red-200 uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> UNSAFE
                </span>
              )}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {!site.eligible && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-bold text-punarvas-critical-red mb-1 flex items-center gap-2">
                <Info className="w-4 h-4" /> Not Eligible
              </h4>
              <p className="text-sm text-red-800">{site.reason}</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Safety Score</p>
              <p className={`text-lg font-bold ${site.safetyScore > 80 ? 'text-punarvas-safe-green' : 'text-punarvas-high-orange'}`}>
                {site.safetyScore} <span className="text-xs text-slate-400">/100</span>
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Distance</p>
              <p className="text-lg font-bold text-slate-700">{site.distance} <span className="text-xs">km</span></p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Travel</p>
              <p className="text-lg font-bold text-slate-700">{site.travelTime} <span className="text-xs">min</span></p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Available</p>
              <p className="text-lg font-bold text-slate-700">{site.availableCapacity}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Hazard Exposure</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Flood</span>
                  <span className={`font-bold ${site.hazards.flood === 'High' ? 'text-punarvas-critical-red' : site.hazards.flood === 'Moderate' ? 'text-punarvas-high-orange' : 'text-punarvas-safe-green'}`}>{site.hazards.flood}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Landslide</span>
                  <span className={`font-bold ${site.hazards.landslide === 'High' ? 'text-punarvas-critical-red' : site.hazards.landslide === 'Moderate' ? 'text-punarvas-high-orange' : 'text-punarvas-safe-green'}`}>{site.hazards.landslide}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Earthquake</span>
                  <span className={`font-bold ${site.hazards.earthquake === 'High' ? 'text-punarvas-critical-red' : site.hazards.earthquake === 'Moderate' ? 'text-punarvas-high-orange' : 'text-punarvas-safe-green'}`}>{site.hazards.earthquake}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Infrastructure</h3>
              <div className="space-y-2">
                {Object.entries(site.infrastructure).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-slate-600 font-medium capitalize">{key}</span>
                    <span className={`font-bold ${val === 'Operational' || val === 'Available' ? 'text-punarvas-safe-green' : val === 'Warning' ? 'text-punarvas-high-orange' : 'text-slate-500'}`}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 mt-auto">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors text-sm"
          >
            Close
          </button>
          
          {site.eligible && (
            <button 
              onClick={() => { onSelect(site.id); onClose(); }}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-colors text-sm ${
                isSelected 
                  ? 'bg-punarvas-dark-navy text-white hover:bg-slate-800'
                  : 'bg-punarvas-primary-blue text-white hover:bg-blue-700'
              }`}
            >
              {isSelected ? 'Deselect Site' : 'Select Site'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
