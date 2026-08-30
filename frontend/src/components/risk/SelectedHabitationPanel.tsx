import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Lightbulb, MapPin, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TriageRecord } from '../../hooks/useHabitations';
import { HazardBadgeList } from '../../utils/hazardUtils';

interface SelectedHabitationPanelProps {
  habitation: TriageRecord | null;
  onOpenRelocation: () => void;
}

export const SelectedHabitationPanel = ({ habitation, onOpenRelocation }: SelectedHabitationPanelProps) => {
  const navigate = useNavigate();
  const [calculationOpen, setCalculationOpen] = useState(false);

  if (!habitation) return null;

  const handleViewOnMap = () => {
    navigate('/map', { state: { selectedLocationId: habitation.id } });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Selected Habitation</h2>
          <h1 className="text-2xl font-bold text-punarvas-text tracking-tight">{habitation.habitation}</h1>
        </div>
        <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1.5 border uppercase ${
          habitation.priority.includes('P1') ? 'bg-red-50 text-punarvas-critical-red border-red-200' :
          habitation.priority.includes('P2') ? 'bg-orange-50 text-punarvas-high-orange border-orange-200' :
          'bg-yellow-50 text-punarvas-medium-yellow border-yellow-200'
        }`}>
          <AlertTriangle className="w-3 h-3" />
          {habitation.priority}
        </div>
      </div>

      <div className="flex gap-8 mb-8 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hazard Profile</h3>
          <div className="mt-1">
            <HazardBadgeList hazards={habitation.hazards} primaryHazard={habitation.hazard} />
          </div>
        </div>
        <div className="border-l border-slate-200 pl-8">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Score</h3>
          <p className="text-2xl font-bold leading-none text-punarvas-critical-red flex items-baseline gap-1">
            {habitation.riskScore}
            <span className="text-xs font-semibold text-slate-400">/100</span>
          </p>
        </div>
      </div>

      {/* Composite Breakdown */}
      <div className="mb-8">
        <h3 className="text-[11px] font-bold text-slate-800 uppercase flex items-center gap-2 mb-4">
          <Activity className="w-3.5 h-3.5 text-slate-400" />
          Composite Breakdown
        </h3>
        
        <div className="space-y-4">
          {[
            { label: 'Hazard Severity', value: habitation.hazardSeverity, color: 'bg-punarvas-critical-red' },
            { label: 'Exposure Level', value: habitation.exposureLevel, color: 'bg-punarvas-high-orange' },
            { label: 'Vulnerability', value: habitation.vulnerability, color: 'bg-punarvas-high-orange' }
          ].map(metric => (
            <div key={metric.label} className="flex items-center text-sm">
              <span className="w-32 text-slate-600">{metric.label}</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full mx-4 overflow-hidden">
                <div className={`h-full rounded-full ${metric.color}`} style={{ width: `${metric.value}%` }} />
              </div>
              <span className="font-bold w-6 text-right text-slate-800">{metric.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Why is this critical? */}
      <div className="mb-8">
        <h3 className="text-[11px] font-bold text-slate-800 uppercase flex items-center gap-2 mb-4">
          <Lightbulb className="w-3.5 h-3.5 text-slate-400" />
          Why is this critical?
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {habitation.evidence.map((ev, i) => (
            <div key={i} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border flex items-center gap-1.5 ${
              i < 2 ? 'bg-red-50 text-punarvas-critical-red border-red-100' : 'bg-yellow-50 text-punarvas-medium-yellow border-yellow-100'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${i < 2 ? 'bg-punarvas-critical-red' : 'bg-punarvas-medium-yellow'}`} />
              {ev}
            </div>
          ))}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
          <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
            {habitation.explanation.map((exp, i) => (
              <li key={i}>{exp}</li>
            ))}
          </ul>
        </div>

        {/* Expandable Calculation */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button 
            onClick={() => setCalculationOpen(!calculationOpen)}
            className="w-full bg-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            How was this score calculated?
            {calculationOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {calculationOpen && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 font-mono text-[10px] text-slate-600">
              <div className="flex justify-between mb-1">
                <span>Hazard Severity</span>
                <span>{habitation.hazardSeverity} × 40% = {(habitation.hazardSeverity * 0.4).toFixed(1)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Exposure Level</span>
                <span>{habitation.exposureLevel} × 30% = {(habitation.exposureLevel * 0.3).toFixed(1)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Vulnerability</span>
                <span>{habitation.vulnerability} × 30% = {(habitation.vulnerability * 0.3).toFixed(1)}</span>
              </div>
              <div className="border-t border-dashed border-slate-300 pt-2 flex justify-between font-bold text-slate-800">
                <span>Composite Score</span>
                <span>{((habitation.hazardSeverity * 0.4) + (habitation.exposureLevel * 0.3) + (habitation.vulnerability * 0.3)).toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Recommended Action</h3>
        <p className="text-sm font-bold text-punarvas-text mb-4">Immediate relocation assessment</p>
        
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleViewOnMap} className="flex justify-center items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <MapPin className="w-4 h-4" />
            View on Map
          </button>
          <button onClick={onOpenRelocation} className="flex justify-center items-center gap-2 bg-punarvas-primary-blue text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            Start Relocation Plan
          </button>
        </div>
      </div>
    </div>
  );
};
