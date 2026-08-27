import React, { useState, useMemo } from 'react';
import { WorkflowStepper } from '../components/relocation/WorkflowStepper';
import { SourceHabitationCard } from '../components/relocation/SourceHabitationCard';
import { CandidateSites } from '../components/relocation/CandidateSites';
import { RecommendationRationale } from '../components/relocation/RecommendationRationale';
import { ProposedAllocation } from '../components/relocation/ProposedAllocation';
import { SiteDetailsModal } from '../components/relocation/SiteDetailsModal';

import { triageData } from '../data/triageData';
import { relocationSites } from '../data/relocationData';
import type { RelocationSite } from '../data/relocationData';

export const RelocationPlanner = () => {
  const [currentStep, setCurrentStep] = useState(3); // Start at "Safe Candidates" for demo
  
  // Use Village A for demo
  const sourceHabitation = triageData[0]; 

  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>(['site-b', 'site-d']);
  const [viewSite, setViewSite] = useState<RelocationSite | null>(null);

  // Engine: identify recommended site
  const recommendedSite = useMemo(() => {
    const eligible = relocationSites.filter(s => s.eligible);
    // Highest safety score logic for demo
    return eligible.reduce((prev, curr) => (curr.safetyScore > prev.safetyScore ? curr : prev), eligible[0]);
  }, []);

  const handleSelectSite = (id: string) => {
    setSelectedSiteIds(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      return [...prev, id];
    });
  };

  // Allocation engine
  const allocation = useMemo(() => {
    let remaining = sourceHabitation.population;
    const alloc: { site: RelocationSite; people: number }[] = [];
    
    // Sort selected sites by recommendation, then safety
    const sitesToAllocate = relocationSites
      .filter(s => selectedSiteIds.includes(s.id))
      .sort((a, b) => {
        if (a.id === recommendedSite?.id) return -1;
        if (b.id === recommendedSite?.id) return 1;
        return b.safetyScore - a.safetyScore;
      });

    for (const site of sitesToAllocate) {
      if (remaining <= 0) break;
      const amount = Math.min(remaining, site.availableCapacity);
      alloc.push({ site, people: amount });
      remaining -= amount;
    }

    const covered = sourceHabitation.population - remaining;
    const coveragePercent = Math.round((covered / sourceHabitation.population) * 100);

    return { alloc, coveragePercent };
  }, [selectedSiteIds, sourceHabitation.population, recommendedSite]);

  return (
    <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col pb-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-punarvas-text tracking-tight mb-1">Relocation Planner</h1>
          <p className="text-punarvas-text-secondary text-sm">Safe, capacity-aware and explainable relocation planning.</p>
        </div>
        <button className="bg-punarvas-primary-blue hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors">
          + Prepare Relocation Plan
        </button>
      </div>

      <WorkflowStepper currentStep={currentStep} onStepClick={setCurrentStep} />

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left Column - 30% */}
        <div className="w-full lg:w-[30%] flex flex-col gap-6 shrink-0 overflow-y-auto pr-1">
          <SourceHabitationCard habitation={sourceHabitation} />
          
          <RecommendationRationale siteName={recommendedSite?.name || ''} />
        </div>

        {/* Right Column - 70% */}
        <div className="w-full lg:flex-1 flex flex-col gap-6 shrink-0 overflow-y-auto pr-1 pb-4">
          
          <CandidateSites 
            sites={relocationSites} 
            selectedSites={selectedSiteIds}
            onSelectSite={handleSelectSite}
            recommendedSiteId={recommendedSite?.id}
            onViewDetails={setViewSite}
          />
          
          <ProposedAllocation 
            source={sourceHabitation} 
            allocations={allocation.alloc} 
            coveragePercent={allocation.coveragePercent} 
          />
        </div>
      </div>

      <SiteDetailsModal 
        isOpen={!!viewSite} 
        onClose={() => setViewSite(null)} 
        site={viewSite}
        isSelected={viewSite ? selectedSiteIds.includes(viewSite.id) : false}
        onSelect={handleSelectSite}
      />
    </div>
  );
};
