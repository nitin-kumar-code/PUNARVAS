import React, { useState, useEffect, useMemo } from 'react';
import { WorkflowStepper } from '../components/relocation/WorkflowStepper';
import { SourceHabitationCard } from '../components/relocation/SourceHabitationCard';
import { CandidateSites } from '../components/relocation/CandidateSites';
import { RecommendationRationale } from '../components/relocation/RecommendationRationale';
import { ProposedAllocation } from '../components/relocation/ProposedAllocation';
import { SiteDetailsModal } from '../components/relocation/SiteDetailsModal';

import { useLocation, useNavigate } from 'react-router-dom';
import { generateRelocationPlan, fetchSites, fetchHabitation } from '../api/relocation';
import type { RelocationSite } from '../data/relocationData';
import { useHabitations } from '../hooks/useHabitations';
import type { TriageRecord } from '../hooks/useHabitations';

export const RelocationPlanner = () => {
  const locationState = useLocation().state as { selectedHabitation?: TriageRecord; selectedHabitationId?: string } | null;
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(3);
  
  const [sourceHabitation, setSourceHabitation] = useState<TriageRecord | null>(null);
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [viewSite, setViewSite] = useState<RelocationSite | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [relocationSites, setRelocationSites] = useState<RelocationSite[]>([]);
  const [recommendedSiteId, setRecommendedSiteId] = useState<string | undefined>();
  const [allocationResult, setAllocationResult] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const sitesData = await fetchSites();
        const mappedSites: RelocationSite[] = sitesData.map((s: any) => ({
          id: s.id,
          name: s.name,
          latitude: s.latitude,
          longitude: s.longitude,
          safetyScore: s.overall_safety_score || s.site_safety_score || 0,
          eligible: s.safe !== undefined ? s.safe : s.status === 'ACTIVE',
          capacity: s.capacity_people || 0,
          availableCapacity: s.available_capacity || 0,
          distance: 0,
          travelTime: 0,
          hazards: { flood: "Low", landslide: "Low", earthquake: "Low" },
          accessibility: (s.accessibility_score || 0) > 70 ? 'Good' : 'Moderate',
          healthcareDistance: 5,
          infrastructure: { roads: "Operational", power: "Operational", water: "Operational", comms: "Operational", healthcare: "Available" },
          reason: s.explanation
        }));
        setRelocationSites(mappedSites);

        // We use a hardcoded fallback UUID if no state is passed, to not break the UI demo
        if (locationState?.selectedHabitation) {
          setSourceHabitation(locationState.selectedHabitation);
        } else if (locationState?.selectedHabitationId) {
          const habData = await fetchHabitation(locationState.selectedHabitationId);
          setSourceHabitation({
            id: habData.id,
            habitation: habData.name,
            district: habData.district,
            hazard: habData.primary_hazard || 'Unknown',
            riskScore: habData.risk_score || 0,
            riskLevel: habData.risk_level || 'Medium',
            hazardSeverity: 0,
            exposureLevel: 0,
            vulnerability: 0,
            vulnerablePopulation: habData.vulnerable_population || 0,
            population: habData.population || 0,
            confidence: 'High',
            priority: 'P1',
            assessmentTime: habData.created_at || new Date().toISOString(),
            evidence: [],
            explanation: habData.explanation ? [habData.explanation] : []
          });
        } else {
          // Fallback to first habitation from API if not provided via state
          const allHabsResponse = await fetch('http://localhost:8000/api/v1/habitations');
          const allHabs = await allHabsResponse.json();
          if (allHabs && allHabs.length > 0) {
            const habData = allHabs[0];
            setSourceHabitation({
              id: habData.id,
              habitation: habData.name,
              district: habData.district,
              hazard: habData.primary_hazard || 'Unknown',
              riskScore: habData.risk_score || 0,
              riskLevel: habData.risk_level || 'Medium',
              hazardSeverity: 0,
              exposureLevel: 0,
              vulnerability: 0,
              vulnerablePopulation: habData.vulnerable_population || 0,
              population: habData.population || 0,
              confidence: 'High',
              priority: 'P1',
              assessmentTime: habData.created_at || new Date().toISOString(),
              evidence: [],
              explanation: habData.explanation ? [habData.explanation] : []
            });
          }
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    loadData();
  }, [locationState]);

  const handleGeneratePlan = async () => {
    if (!sourceHabitation) return;
    setIsGenerating(true);
    try {
      const result = await generateRelocationPlan(sourceHabitation.id);
      
      const allocatedSiteIds = result.allocations.map((a: any) => a.site_id);
      setSelectedSiteIds(allocatedSiteIds);
      
      if (allocatedSiteIds.length > 0) {
        setRecommendedSiteId(allocatedSiteIds[0]);
      }
      
      setAllocationResult(result);
    } catch (err) {
      console.error("Failed to generate plan", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSite = (id: string) => {
    const site = relocationSites.find(s => s.id === id);
    if (!site || !site.eligible) return;
    
    setSelectedSiteIds(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      return [...prev, id];
    });
  };

  const recommendedSite = useMemo(() => {
    if (!recommendedSiteId) return null;
    return relocationSites.find(s => s.id === recommendedSiteId) || null;
  }, [recommendedSiteId, relocationSites]);

  const allocation = useMemo(() => {
    if (allocationResult) {
       const alloc = allocationResult.allocations.map((a: any) => {
         const site = relocationSites.find(s => s.id === a.site_id);
         return {
           site,
           people: a.population
         };
       }).filter((a: any) => a.site);
       return {
         alloc,
         coveragePercent: allocationResult.coverage_percentage
       };
    }
    return { alloc: [], coveragePercent: 0 };
  }, [allocationResult, relocationSites]);

  if (!sourceHabitation) {
    return (
      <div className="max-w-[1800px] mx-auto w-full h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-punarvas-primary-blue border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col pb-6">
      
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-punarvas-text tracking-tight mb-1">Relocation Planner</h1>
          <p className="text-punarvas-text-secondary text-sm">Safe, capacity-aware and explainable relocation planning.</p>
        </div>
        <button 
          onClick={handleGeneratePlan}
          disabled={isGenerating}
          className={`${isGenerating ? 'bg-blue-400' : 'bg-punarvas-primary-blue hover:bg-blue-700'} text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors`}
        >
          {isGenerating ? 'Generating...' : '+ Generate Relocation Plan'}
        </button>
      </div>

      <WorkflowStepper currentStep={currentStep} onStepClick={setCurrentStep} />

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        <div className="w-full lg:w-[30%] flex flex-col gap-6 shrink-0 overflow-y-auto pr-1">
          <SourceHabitationCard habitation={sourceHabitation} />
          
          {recommendedSite && <RecommendationRationale site={recommendedSite} />}
        </div>

        <div className="w-full lg:flex-1 flex flex-col gap-6 shrink-0 overflow-y-auto pr-1 pb-4">
          
          <CandidateSites 
            sites={relocationSites} 
            selectedSites={selectedSiteIds}
            onSelectSite={handleSelectSite}
            recommendedSiteId={recommendedSiteId}
            onViewDetails={setViewSite}
          />
          
          {allocationResult && (
            <ProposedAllocation 
              source={sourceHabitation} 
              allocations={allocation.alloc} 
              coveragePercent={allocation.coveragePercent} 
            />
          )}
        </div>
      </div>

      <SiteDetailsModal 
        isOpen={!!viewSite} 
        onClose={() => setViewSite(null)} 
        site={viewSite}
        isSelected={viewSite ? selectedSiteIds.includes(viewSite.id) : false}
        onSelect={handleSelectSite}
      />
      
      <div className="bg-white border-t border-slate-200 p-4 shrink-0 flex justify-end sticky bottom-0 mt-2 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => navigate('/decision', { 
            state: { 
              source: sourceHabitation, 
              allocation: allocation,
              recommendedSite: recommendedSite,
              selectedSites: selectedSiteIds
            } 
          })}
          className="bg-punarvas-safe-green hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-sm transition-colors text-lg"
        >
          Generate Final Plan
        </button>
      </div>

    </div>
  );
};
