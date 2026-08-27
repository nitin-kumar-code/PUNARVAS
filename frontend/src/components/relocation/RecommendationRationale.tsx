import React from 'react';
import { Check } from 'lucide-react';
import type { RelocationSite } from '../../data/relocationData';

interface RecommendationRationaleProps {
  site: RelocationSite | null;
}

export const RecommendationRationale = ({ site }: RecommendationRationaleProps) => {
  if (!site) return null;

  // Mock calculation values based on site metrics for explainability demo
  const safetyWeight = (site.safetyScore * 0.35).toFixed(1);
  const capacityScore = Math.min(100, Math.round((site.availableCapacity / 1000) * 100));
  const capacityWeight = (capacityScore * 0.25).toFixed(1);
  const accScore = site.accessibility === 'Good' ? 91 : site.accessibility === 'Moderate' ? 70 : 40;
  const accWeight = (accScore * 0.15).toFixed(1);
  const infScore = site.infrastructure.roads === 'Operational' ? 95 : 60;
  const infWeight = (infScore * 0.15).toFixed(1);
  const distScore = Math.max(0, 100 - (site.distance * 2));
  const distWeight = (distScore * 0.10).toFixed(1);
  
  const totalScore = (parseFloat(safetyWeight) + parseFloat(capacityWeight) + parseFloat(accWeight) + parseFloat(infWeight) + parseFloat(distWeight)).toFixed(1);

  return (
    <div className="bg-slate-50 rounded-xl border border-blue-100 p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-punarvas-dark-navy mb-5">
        Recommendation Rationale: <span className="text-punarvas-primary-blue">{site.name}</span>
      </h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-punarvas-safe-green" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Below hazard threshold (Safety &gt; 85)</span>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-punarvas-safe-green" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Significant available capacity ({site.availableCapacity} units)</span>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-punarvas-safe-green" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Good accessibility (Travel time ~{site.travelTime} mins)</span>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-punarvas-safe-green" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Existing healthcare infrastructure within 5km</span>
        </div>
      </div>

      <div className="mt-auto border-t border-blue-100 pt-5">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Why was this site recommended?</h4>
        <div className="font-mono text-[10px] text-slate-600 space-y-1 bg-white p-3 rounded-lg border border-slate-200">
          <div className="flex justify-between">
            <span>Safety Score</span>
            <span>{site.safetyScore} × 35% = {safetyWeight}</span>
          </div>
          <div className="flex justify-between">
            <span>Capacity Fit</span>
            <span>{capacityScore} × 25% = {capacityWeight}</span>
          </div>
          <div className="flex justify-between">
            <span>Accessibility</span>
            <span>{accScore} × 15% = {accWeight}</span>
          </div>
          <div className="flex justify-between">
            <span>Infrastructure</span>
            <span>{infScore} × 15% = {infWeight}</span>
          </div>
          <div className="flex justify-between">
            <span>Distance</span>
            <span>{distScore} × 10% = {distWeight}</span>
          </div>
          <div className="border-t border-dashed border-slate-300 pt-1 mt-1 flex justify-between font-bold text-punarvas-text">
            <span>Recommendation Score</span>
            <span>{totalScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
