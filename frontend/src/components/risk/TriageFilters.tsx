import React from 'react';
import { ChevronDown } from 'lucide-react';

interface TriageFiltersProps {
  pendingHazard: string;
  setPendingHazard: (v: string) => void;
  pendingDistrict: string;
  setPendingDistrict: (v: string) => void;
  pendingRiskLevel: string;
  setPendingRiskLevel: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export const TriageFilters = ({
  pendingHazard, setPendingHazard,
  pendingDistrict, setPendingDistrict,
  pendingRiskLevel, setPendingRiskLevel,
  onApply, onReset
}: TriageFiltersProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-wrap items-center gap-4">
      {/* Hazard Dropdown */}
      <div className="relative">
        <select 
          value={pendingHazard}
          onChange={(e) => setPendingHazard(e.target.value)}
          className="appearance-none bg-white border border-slate-200 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-punarvas-primary-blue/20 focus:border-punarvas-primary-blue text-slate-700 font-medium min-w-[160px]"
        >
          <option value="All">Hazard: All</option>
          <option value="Landslide">Landslide</option>
          <option value="Flood">Flood</option>
          <option value="Earthquake">Earthquake</option>
          <option value="Cyclone">Cyclone</option>
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* District Dropdown */}
      <div className="relative">
        <select 
          value={pendingDistrict}
          onChange={(e) => setPendingDistrict(e.target.value)}
          className="appearance-none bg-white border border-slate-200 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-punarvas-primary-blue/20 focus:border-punarvas-primary-blue text-slate-700 font-medium min-w-[160px]"
        >
          <option value="All">District: All</option>
          <option value="West Tripura">West Tripura</option>
          <option value="South Tripura">South Tripura</option>
          <option value="North Tripura">North Tripura</option>
          <option value="Dhalai">Dhalai</option>
          <option value="Gomati">Gomati</option>
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Risk Level Dropdown */}
      <div className="relative">
        <select 
          value={pendingRiskLevel}
          onChange={(e) => setPendingRiskLevel(e.target.value)}
          className="appearance-none bg-white border border-slate-200 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-punarvas-primary-blue/20 focus:border-punarvas-primary-blue text-slate-700 font-medium min-w-[160px]"
        >
          <option value="All">Risk Level: All</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Time Dropdown (Mock - doesn't affect data in this demo) */}
      <div className="relative">
        <select className="appearance-none bg-white border border-slate-200 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-punarvas-primary-blue/20 focus:border-punarvas-primary-blue text-slate-700 font-medium min-w-[180px]">
          <option>Time: Latest Assessment</option>
          <option>Last 24 Hours</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button onClick={onReset} className="text-sm font-semibold text-slate-600 hover:bg-slate-100 px-4 py-2.5 rounded-lg transition-colors border border-transparent">
          Reset
        </button>
        <button onClick={onApply} className="bg-punarvas-primary-blue hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm">
          Apply Filters
        </button>
      </div>
    </div>
  );
};
