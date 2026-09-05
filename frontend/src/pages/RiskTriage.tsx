import React, { useState, useMemo, useEffect } from 'react';
import { TriageFilters } from '../components/risk/TriageFilters';
import { PrioritySummary } from '../components/risk/PrioritySummary';
import { PriorityHabitationsTable } from '../components/risk/PriorityHabitationsTable';
import { SelectedHabitationPanel } from '../components/risk/SelectedHabitationPanel';
import { useNavigate } from 'react-router-dom';
import { useHabitations } from '../hooks/useHabitations';
import { Loader2, AlertTriangle } from 'lucide-react';

export const RiskTriage = () => {
  const navigate = useNavigate();
  const { data: allData, loading, error } = useHabitations();
  
  // Filter state
  const [hazardFilter, setHazardFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [riskLevelFilter, setRiskLevelFilter] = useState('All');
  
  // Pending filters (controlled by dropdowns before clicking Apply)
  const [pendingHazard, setPendingHazard] = useState('All');
  const [pendingDistrict, setPendingDistrict] = useState('All');
  const [pendingRiskLevel, setPendingRiskLevel] = useState('All');

  const availableDistricts = useMemo(() => Array.from(new Set(allData.map(d => d.district))).sort(), [allData]);
  const availableHazards = useMemo(() => Array.from(new Set(allData.map(d => d.hazard))).sort(), [allData]);

  const filteredData = useMemo(() => {
    return allData.filter(record => {
      if (hazardFilter !== 'All' && record.hazard !== hazardFilter) return false;
      if (districtFilter !== 'All' && record.district !== districtFilter) return false;
      if (riskLevelFilter !== 'All' && record.riskLevel !== riskLevelFilter) return false;
      return true;
    });
  }, [allData, hazardFilter, districtFilter, riskLevelFilter]);

  const [selectedId, setSelectedId] = useState<string>('');

  // Reset selected ID if it gets filtered out or initialized
  useEffect(() => {
    if (filteredData.length > 0 && !filteredData.find(d => d.id === selectedId)) {
      setSelectedId(filteredData[0].id);
    } else if (filteredData.length === 0) {
      setSelectedId('');
    }
  }, [filteredData, selectedId]);

  const handleApply = () => {
    setHazardFilter(pendingHazard);
    setDistrictFilter(pendingDistrict);
    setRiskLevelFilter(pendingRiskLevel);
  };

  const handleReset = () => {
    setPendingHazard('All');
    setPendingDistrict('All');
    setPendingRiskLevel('All');
    setHazardFilter('All');
    setDistrictFilter('All');
    setRiskLevelFilter('All');
  };

  const selectedHabitation = filteredData.find(t => t.id === selectedId) || null;

  if (loading) {
    return (
      <div className="max-w-[1800px] mx-auto w-full h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-punarvas-primary-blue mb-4" />
          <p className="text-slate-500 font-medium">Loading full registry data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1800px] mx-auto w-full h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 flex flex-col items-center max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error Loading Registry</h2>
          <p className="text-slate-600">{error.message || 'Failed to load habitations data from the backend.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto w-full h-[calc(100vh-6rem)] flex flex-col pb-4">
      
      {/* Page Header */}
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-punarvas-text tracking-tight mb-1">Risk & Triage</h1>
        <p className="text-punarvas-text-secondary text-sm">Explainable prioritization — which habitation needs attention first, and why?</p>
      </div>

      <TriageFilters 
        pendingHazard={pendingHazard} setPendingHazard={setPendingHazard}
        pendingDistrict={pendingDistrict} setPendingDistrict={setPendingDistrict}
        pendingRiskLevel={pendingRiskLevel} setPendingRiskLevel={setPendingRiskLevel}
        onApply={handleApply}
        onReset={handleReset}
        availableDistricts={availableDistricts}
        availableHazards={availableHazards}
      />
      
      <PrioritySummary data={filteredData} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 overflow-hidden">
        {/* Table - 65% */}
        <div className="w-full lg:w-[60%] flex-shrink-0 h-full">
          <PriorityHabitationsTable data={filteredData} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        {/* Details - 40% */}
        <div className="w-full lg:flex-1 h-full overflow-y-auto">
          <SelectedHabitationPanel 
            habitation={selectedHabitation} 
            onOpenRelocation={() => navigate('/relocation', { state: { selectedHabitation: selectedHabitation } })} 
          />
        </div>
      </div>
    </div>
  );
};
