import React from 'react';
import { Waves, Mountain, Activity, Wind, Sun, Flame, Radio, RefreshCw } from 'lucide-react';

export const HazardLayers = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 w-full flex flex-col h-full">
      <h3 className="text-sm font-bold text-punarvas-text mb-4">Hazard Layers</h3>
      
      <div className="space-y-3 mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue" defaultChecked />
          <Waves className="w-4 h-4 text-punarvas-primary-blue" />
          <span className="text-sm font-medium text-slate-700">Flood</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue" defaultChecked />
          <Mountain className="w-4 h-4 text-punarvas-high-orange" />
          <span className="text-sm font-medium text-slate-700">Landslide</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue" />
          <Activity className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Earthquake</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue" />
          <Wind className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Cyclone</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue" />
          <Sun className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Drought</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue" />
          <Flame className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Heatwave</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue" />
          <Waves className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Coastal Erosion</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue" />
          <Flame className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Forest Fire</span>
        </label>
      </div>

      <div className="border-t border-slate-100 pt-5 mb-6">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1"><Radio className="w-3 h-3" /> Intensity / Risk Level</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-punarvas-critical-red focus:ring-punarvas-critical-red" defaultChecked />
            <span className="w-3 h-3 rounded-sm bg-punarvas-critical-red"></span>
            <span className="text-sm font-medium text-punarvas-critical-red">Critical</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-punarvas-high-orange focus:ring-punarvas-high-orange" defaultChecked />
            <span className="w-3 h-3 rounded-sm bg-punarvas-high-orange"></span>
            <span className="text-sm font-medium text-punarvas-high-orange">High</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-punarvas-medium-yellow focus:ring-punarvas-medium-yellow" defaultChecked />
            <span className="w-3 h-3 rounded-sm bg-punarvas-medium-yellow"></span>
            <span className="text-sm font-medium text-slate-700">Medium</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-punarvas-safe-green focus:ring-punarvas-safe-green" defaultChecked />
            <span className="w-3 h-3 rounded-sm bg-punarvas-safe-green"></span>
            <span className="text-sm font-medium text-slate-700">Low</span>
          </label>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5 mb-auto">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Additional Overlays</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="overlay" className="w-4 h-4 border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue" defaultChecked />
            <span className="text-sm font-medium text-slate-700">Population Density</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="overlay" className="w-4 h-4 border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue" />
            <span className="text-sm font-medium text-slate-700">Vulnerable Population</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="overlay" className="w-4 h-4 border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue" />
            <span className="text-sm font-medium text-slate-700">Infrastructure</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="overlay" className="w-4 h-4 border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue" />
            <span className="text-sm font-medium text-slate-700">Road Network</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="overlay" className="w-4 h-4 border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue" />
            <span className="text-sm font-medium text-slate-700">Relocation Sites</span>
          </label>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <button className="w-full bg-punarvas-primary-blue hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors">
          Apply Layers
        </button>
        <button className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" /> Reset Filters
        </button>
      </div>

    </div>
  );
};
