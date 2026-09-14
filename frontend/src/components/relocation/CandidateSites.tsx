import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { RelocationSite } from '../../data/relocationData';

interface CandidateSitesProps {
  sites: RelocationSite[];
  selectedSites: string[];
  onSelectSite: (id: string) => void;
  recommendedSiteId?: string;
  onViewDetails: (site: RelocationSite) => void;
  isPlanGenerated?: boolean;
}

export const CandidateSites = ({ sites, selectedSites, onSelectSite, recommendedSiteId, onViewDetails, isPlanGenerated }: CandidateSitesProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-punarvas-text mb-1">Candidate Sites</h3>
      
      {sites.map(site => {
        const isSelected = selectedSites.includes(site.id);
        const isRecommended = site.id === recommendedSiteId;
        
        if (!site.eligible) {
          return (
            <div key={site.id} className="bg-red-50/50 rounded-xl border border-red-200 p-5 relative overflow-hidden cursor-not-allowed" onClick={() => onViewDetails(site)}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-bold text-slate-700">{site.name}</h4>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-punarvas-critical-red bg-red-100/50">
                    <XCircle className="w-3.5 h-3.5" />
                    UNSAFE / NOT ELIGIBLE
                  </div>
                </div>
              </div>
              <p className="text-sm font-semibold text-punarvas-critical-red mt-2">{site.reason}</p>
            </div>
          );
        }

        return (
          <div 
            key={site.id} 
            className={`bg-white rounded-xl border p-5 relative transition-all ${
              isSelected 
                ? 'border-punarvas-primary-blue shadow-md ring-1 ring-punarvas-primary-blue/30' 
                : isRecommended 
                  ? 'border-punarvas-safe-green shadow-sm' 
                  : 'border-slate-200 shadow-sm hover:border-slate-300'
            }`}
          >
            {isRecommended && (
              <div className="absolute top-0 right-0 bg-punarvas-safe-green text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Recommended
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-bold text-punarvas-text">{site.name}</h4>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-punarvas-safe-green bg-green-50 border border-green-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    SAFE
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-500">
                  Capacity: {site.capacity} people <span className="mx-2">•</span> Available: <span className="text-slate-800 font-bold">{site.availableCapacity}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 mt-4 sm:mt-0">
                <button 
                  onClick={() => onViewDetails(site)}
                  className="text-sm font-semibold text-punarvas-primary-blue hover:text-blue-800 transition-colors"
                >
                  View Details
                </button>
                <button 
                  onClick={() => onSelectSite(site.id)}
                  disabled={isPlanGenerated && !isSelected}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${
                    isSelected 
                      ? 'bg-punarvas-dark-navy text-white hover:bg-slate-800' 
                      : isPlanGenerated 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : 'bg-punarvas-primary-blue text-white hover:bg-blue-700'
                  }`}
                >
                  {isSelected ? 'Selected' : isPlanGenerated ? 'Locked' : 'Select Site'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
