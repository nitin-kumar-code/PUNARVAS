import React, { useState, useMemo, useEffect } from 'react';
import { TriageFilters } from '../components/risk/TriageFilters';
import { PrioritySummary } from '../components/risk/PrioritySummary';
import { PriorityHabitationsTable } from '../components/risk/PriorityHabitationsTable';
import { SelectedHabitationPanel } from '../components/risk/SelectedHabitationPanel';
import { useNavigate } from 'react-router-dom';
import { triageData } from '../data/triageData';

export const RiskTriage = () => {
  const navigate = useNavigate();
  
  // Filter state
  const [hazardFilter, setHazardFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [riskLevelFilter, setRiskLevelFilter] = useState('All');
  
  // Pending filters (controlled by dropdowns before clicking Apply)
  const [pendingHazard, setPendingHazard] = useState('All');
  const [pendingDistrict, setPendingDistrict] = useState('All');
  const [pendingRiskLevel, setPendingRiskLevel] = useState('All');

  const filteredData = useMemo(() => {
    return triageData.filter(record => {
      if (hazardFilter !== 'All' && record.hazard !== hazardFilter) return false;
      if (districtFilter !== 'All' && record.district !== districtFilter) return false;
      if (riskLevelFilter !== 'All' && record.riskLevel !== riskLevelFilter) return false;
      return true;
    });
  }, [hazardFilter, districtFilter, riskLevelFilter]);

  const [selectedId, setSelectedId] = useState<string>(filteredData.length > 0 ? filteredData[0].id : '');

  // Reset selected ID if it gets filtered out
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
      />
      
      <PrioritySummary data={filteredData} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 overflow-hidden">
        {/* Table - 65% */}
        <div className="w-full lg:w-[60%] flex-shrink-0 h-full">
          <PriorityHabitationsTable data={filteredData} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        {/* Details - 40% */}
        <div className="w-full lg:flex-1 h-full">
          <SelectedHabitationPanel 
            habitation={selectedHabitation} 
            onOpenRelocation={() => navigate('/relocation', { state: { selectedHabitationId: selectedId } })} 
          />
        </div>
      </div>
    </div>
  );
};
