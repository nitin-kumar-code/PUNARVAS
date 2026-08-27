import React from 'react';
import { Check } from 'lucide-react';

interface RecommendationRationaleProps {
  siteName: string;
}

export const RecommendationRationale = ({ siteName }: RecommendationRationaleProps) => {
  return (
    <div className="bg-slate-50 rounded-xl border border-blue-100 p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-punarvas-dark-navy mb-5">
        Recommendation Rationale: <span className="text-punarvas-primary-blue">{siteName}</span>
      </h3>
      
      <div className="space-y-4 flex-1">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-punarvas-safe-green" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Below hazard threshold (Elevation &gt; 450m)</span>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-punarvas-safe-green" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Sufficient capacity for entire vulnerable group</span>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-punarvas-safe-green" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Good accessibility (Travel time &lt; 45 mins)</span>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-punarvas-safe-green" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Existing healthcare infrastructure within 5km</span>
        </div>
      </div>
    </div>
  );
};
