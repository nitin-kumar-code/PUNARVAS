import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Lightbulb, MapPin, Activity, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TriageRecord } from '../../hooks/useHabitations';
import { HazardBadgeList } from '../../utils/hazardUtils';
import { useMLPrediction } from '../../hooks/useMLPrediction';

interface SelectedHabitationPanelProps {
  habitation: TriageRecord | null;
  onOpenRelocation: () => void;
}

export const SelectedHabitationPanel = ({ habitation, onOpenRelocation }: SelectedHabitationPanelProps) => {
  const navigate = useNavigate();
  const [calculationOpen, setCalculationOpen] = useState(false);
  const [simulate, setSimulate] = useState(false);
  
  const { prediction, loading } = useMLPrediction(
    habitation?.id || null, 
    simulate, 
    simulate ? 120.0 : undefined
  );

  if (!habitation) return null;

  const handleViewOnMap = () => {
    navigate('/map', { state: { selectedLocationId: habitation.id } });
  };
  
  // Use ML prediction if available, otherwise fallback to base record
  const displayScore = prediction ? prediction.dynamic_risk : habitation.riskScore;
  const displayLevel = prediction ? prediction.dynamic_triage_level : habitation.riskLevel;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col overflow-y-auto relative">
      {/* ML Status Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 text-blue-700 text-[9px] font-bold uppercase tracking-wider">
        <Cpu className="w-3 h-3" />
        {loading ? 'Running ML Inference...' : 'ML Risk Assessment Active'}
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 mt-4">
        <div>
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Selected Habitation</h2>
          <h1 className="text-2xl font-bold text-punarvas-text tracking-tight">{habitation.habitation}</h1>
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
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ML Risk Score</h3>
          <p className="text-2xl font-bold leading-none text-punarvas-critical-red flex items-baseline gap-1">
            {loading ? '...' : displayScore}
            <span className="text-xs font-semibold text-slate-400">/100</span>
          </p>
        </div>
      </div>

      {/* Composite Breakdown (ML output if available) */}
      <div className="mb-8">
        <h3 className="text-[11px] font-bold text-slate-800 uppercase flex items-center gap-2 mb-4">
          <Activity className="w-3.5 h-3.5 text-slate-400" />
          Predictive Hazards
        </h3>
        
        {prediction ? (
          <div className="space-y-4">
            <div className="flex items-center text-sm">
              <span className="w-32 text-slate-600">Flood Probability</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full mx-4 overflow-hidden">
                <div className={`h-full rounded-full ${prediction.flood_risk === 'CRITICAL' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${prediction.flood_probability * 100}%` }} />
              </div>
              <span className="font-bold w-10 text-right text-slate-800">{(prediction.flood_probability * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="w-32 text-slate-600">Landslide Prob.</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full mx-4 overflow-hidden">
                <div className={`h-full rounded-full ${prediction.landslide_risk === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${prediction.landslide_probability * 100}%` }} />
              </div>
              <span className="font-bold w-10 text-right text-slate-800">{(prediction.landslide_probability * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="w-32 text-slate-600">Overall ML Tier</span>
              <div className="flex-1 px-4">
                <span className={`px-2 py-1 text-xs font-bold rounded ${
                  prediction.overall_risk === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                  prediction.overall_risk === 'HIGH' ? 'bg-orange-100 text-orange-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>{prediction.overall_risk}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 opacity-50">
            <p className="text-xs text-slate-500 italic">Waiting for ML Prediction model...</p>
          </div>
        )}
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
        <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
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
                <span>Legacy Composite Score</span>
                <span>{((habitation.hazardSeverity * 0.4) + (habitation.exposureLevel * 0.3) + (habitation.vulnerability * 0.3)).toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Simulation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-xs font-bold text-blue-900 uppercase mb-2">Dynamic Risk Simulation</h4>
          <p className="text-xs text-blue-700 mb-3">Run the ML model against extreme weather conditions to preview predictive hazard increases.</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setSimulate(true)} 
              className={`px-3 py-1.5 text-xs font-bold rounded shadow-sm ${simulate ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 border border-blue-300'}`}
            >
              Simulate 120mm Rainfall
            </button>
            <button 
              onClick={() => setSimulate(false)} 
              className={`px-3 py-1.5 text-xs font-bold rounded shadow-sm ${!simulate ? 'bg-slate-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}
            >
              Reset to Current
            </button>
          </div>
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
