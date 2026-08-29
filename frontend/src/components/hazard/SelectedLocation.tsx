import React from 'react';
import { MapPin, X } from 'lucide-react';
import type { TriageRecord } from '../../hooks/useHabitations';

interface Props {
  habitation: TriageRecord | null;
}

export const SelectedLocation = ({ habitation }: Props) => {
  if (!habitation) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full relative items-center justify-center p-6 text-center">
        <MapPin className="w-10 h-10 text-slate-300 mb-3" />
        <h3 className="text-lg font-bold text-slate-700">No Location Selected</h3>
        <p className="text-sm text-slate-500 mt-2">Select a habitation on the map or from the list to view its hazard exposure.</p>
      </div>
    );
  }

  const getExposureColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL': return 'text-punarvas-critical-red';
      case 'HIGH': return 'text-punarvas-high-orange';
      case 'MEDIUM': return 'text-punarvas-medium-yellow';
      case 'LOW': return 'text-punarvas-safe-green';
      default: return 'text-slate-500';
    }
  };

  const getBadgeClass = (priority: string) => {
    switch (priority) {
      case 'P1': return 'text-punarvas-critical-red border border-red-200 bg-red-50';
      case 'P2': return 'text-punarvas-high-orange border border-orange-200 bg-orange-50';
      default: return 'text-punarvas-safe-green border border-green-200 bg-green-50';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full relative">
      <div className="p-5 border-b border-slate-100 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-punarvas-text mb-4">Selected Location</h3>
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-punarvas-text mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-punarvas-text">{habitation.habitation}</h2>
              <p className="text-xs font-semibold text-slate-500">{habitation.district}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <button className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getBadgeClass(habitation.priority)}`}>
            {habitation.riskLevel} RISK
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-500">Risk Score</span>
            <span className="text-sm font-bold text-punarvas-critical-red">{habitation.riskScore} / 100</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-500">Total Population</span>
            <span className="text-sm font-bold text-punarvas-text">{habitation.population.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-500">Vulnerable Population</span>
            <span className="text-sm font-bold text-punarvas-text">{habitation.vulnerablePopulation.toLocaleString()}</span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-bold text-punarvas-text mb-3">Primary Hazard</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600 capitalize">{habitation.hazard.toLowerCase().replace('_', ' ')}</span>
              <span className={`text-[10px] font-bold uppercase ${getExposureColor(habitation.riskLevel)}`}>{habitation.riskLevel}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-punarvas-text mb-3">Risk Drivers (Insights)</h4>
          <ul className="space-y-2">
            <li className="flex justify-between items-start">
              <span className="text-xs font-medium text-slate-600 flex items-center gap-2">
                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                Hazard Component
              </span>
              <span className="text-xs font-bold text-punarvas-text">+{habitation.hazardSeverity}</span>
            </li>
            <li className="flex justify-between items-start">
              <span className="text-xs font-medium text-slate-600 flex items-center gap-2">
                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                Exposure Component
              </span>
              <span className="text-xs font-bold text-punarvas-text">+{habitation.exposureLevel}</span>
            </li>
            <li className="flex justify-between items-start">
              <span className="text-xs font-medium text-slate-600 flex items-center gap-2">
                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                Vulnerability Component
              </span>
              <span className="text-xs font-bold text-punarvas-text">+{habitation.vulnerability}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-5 border-t border-slate-100">
        <button className="w-full bg-white border border-punarvas-primary-blue text-punarvas-primary-blue hover:bg-blue-50 py-2.5 rounded-lg text-sm font-bold transition-colors">
          View Detailed Report
        </button>
      </div>
    </div>
  );
};
