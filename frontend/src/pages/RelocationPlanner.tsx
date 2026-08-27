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

import { useLocation } from 'react-router-dom';

export const RelocationPlanner = () => {
  const locationState = useLocation().state as { selectedHabitationId?: string } | null;
  const [currentStep, setCurrentStep] = useState(3); // Start at "Safe Candidates" for demo
  
  // Use passed habitation or fallback to Village A for demo
  const sourceHabitation = triageData.find(t => t.id === locationState?.selectedHabitationId) || triageData[0];

  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>(['site-b', 'site-d']);
  const [viewSite, setViewSite] = useState<RelocationSite | null>(null);

  // Engine: calculate recommendation scores
  const recommendedSite = useMemo(() => {
    const eligible = relocationSites.filter(s => s.eligible);
    
    let bestSite = eligible[0];
    let maxScore = -1;

    for (const site of eligible) {
      const safetyWeight = site.safetyScore * 0.35;
      const capacityScore = Math.min(100, Math.round((site.availableCapacity / 1000) * 100));
      const capacityWeight = capacityScore * 0.25;
      const accScore = site.accessibility === 'Good' ? 91 : site.accessibility === 'Moderate' ? 70 : 40;
      const accWeight = accScore * 0.15;
      const infScore = site.infrastructure.roads === 'Operational' ? 95 : 60;
      const infWeight = infScore * 0.15;
      const distScore = Math.max(0, 100 - (site.distance * 2));
      const distWeight = distScore * 0.10;
      
      const totalScore = safetyWeight + capacityWeight + accWeight + infWeight + distWeight;
      
      if (totalScore > maxScore) {
        maxScore = totalScore;
        bestSite = site;
      }
    }
    
    return bestSite;
  }, []);

  const handleSelectSite = (id: string) => {
    const site = relocationSites.find(s => s.id === id);
    if (!site || !site.eligible) return; // STRICT ENFORCEMENT
    
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
      .filter(s => selectedSiteIds.includes(s.id) && s.eligible) // DOUBLE ENFORCEMENT
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
          
          <RecommendationRationale site={recommendedSite} />
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
