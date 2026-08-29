import React, { useState } from 'react';
import { Download, CheckCircle2, CheckCircle } from 'lucide-react';
import { ResourceKPICards } from '../components/resource/ResourceKPICards';
import { ResourceReadiness } from '../components/resource/ResourceReadiness';
import { AllocationDestination } from '../components/resource/AllocationDestination';
import { AllocationRegistry } from '../components/resource/AllocationRegistry';
import { ShortageManagementModal } from '../components/resource/ResourceModals';
import { useResourceAllocation, type ResourceRecord } from '../hooks/useResourceAllocation';

export const ResourceAllocation = () => {
  const { population, destinations, resources, getStatus, getGap, requestSupply, overallStatus } = useResourceAllocation();
  
  const [activeShortage, setActiveShortage] = useState<ResourceRecord | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRequestSupply = (id: string, qty: number) => {
    setActiveShortage(resources.find(r => r.id === id) || null);
  };

  const handleConfirmRequest = (id: string, qty: number) => {
    requestSupply(id, qty);
  };

  const handleConfirmAllocations = () => {
    setShowConfirm(true);
  };

  return (
    <div className="max-w-[1800px] mx-auto w-full pb-10 flex flex-col h-full">
      
      {/* Page Header */}
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-punarvas-text tracking-tight mb-1">Resource Allocation</h1>
          <p className="text-punarvas-text-secondary text-sm">Ensure the resources required for safe and timely relocation are available.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-punarvas-primary-blue text-punarvas-primary-blue hover:bg-blue-50 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Allocation
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <ResourceKPICards population={population} resources={resources} />

      {/* Main Grid */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 mb-6">
        
        {/* Left Column (Readiness & Destination) */}
        <div className="w-full lg:w-[350px] flex flex-col shrink-0">
          <div className="flex-1 min-h-0">
            <ResourceReadiness resources={resources} />
          </div>
          <div className="flex-1 min-h-0">
            <AllocationDestination destinations={destinations} />
          </div>
        </div>

        {/* Right Column (Registry) */}
        <div className="w-full lg:flex-1 flex flex-col min-h-[400px]">
          <AllocationRegistry 
            resources={resources} 
            getGap={getGap} 
            getStatus={getStatus} 
            onRequestSupply={handleRequestSupply}
          />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] items-center shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-500">Overall Status:</span>
          {overallStatus === 'FULLY READY' ? (
            <span className="text-sm font-bold text-punarvas-safe-green bg-green-50 px-3 py-1 rounded-full border border-green-200">FULLY READY</span>
          ) : overallStatus === 'READY WITH WARNINGS' ? (
            <span className="text-sm font-bold text-punarvas-high-orange bg-orange-50 px-3 py-1 rounded-full border border-orange-200">READY WITH WARNINGS</span>
          ) : (
            <span className="text-sm font-bold text-punarvas-critical-red bg-red-50 px-3 py-1 rounded-full border border-red-200">NOT READY</span>
          )}
        </div>
        
        <div className="flex gap-4">
          <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-lg font-bold transition-colors">
            Review Relocation Plan
          </button>
          <button 
            onClick={handleConfirmAllocations}
            className="bg-punarvas-primary-blue hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" /> Confirm Allocations
          </button>
        </div>
      </div>

      <ShortageManagementModal 
        isOpen={!!activeShortage} 
        onClose={() => setActiveShortage(null)} 
        resource={activeShortage} 
        gap={activeShortage ? getGap(activeShortage.required, activeShortage.available) : 0}
        onRequestSupply={handleConfirmRequest}
      />

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-punarvas-dark-navy/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-lg text-punarvas-text flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-punarvas-primary-blue" />
                Confirm Resource Allocation
              </h3>
            </div>
            
            <div className="p-6 space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-semibold text-slate-500">People</span>
                <span className="text-sm font-bold">{population.toLocaleString()}</span>
              </div>
              
              {resources.map(r => {
                const gap = getGap(r.required, r.available);
                return (
                  <div key={r.id} className="flex justify-between border-b pb-2">
                    <span className="text-sm font-semibold text-slate-500">{r.name}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold">{Math.min(r.available, r.required)} / {r.required}</span>
                      {gap < 0 && <div className="text-xs font-bold text-punarvas-critical-red">SHORTAGE: {Math.abs(gap)}</div>}
                    </div>
                  </div>
                );
              })}
              
              {overallStatus !== 'FULLY READY' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-bold text-punarvas-critical-red">Allocation contains unresolved shortages.</p>
                </div>
              )}
            </div>

            <div className="p-5 bg-slate-50 flex justify-end gap-3 border-t border-slate-200">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={() => setShowConfirm(false)} className={`px-4 py-2 text-white rounded-lg font-bold transition-colors shadow-sm ${overallStatus === 'FULLY READY' ? 'bg-punarvas-safe-green hover:bg-green-700' : 'bg-punarvas-high-orange hover:bg-orange-700'}`}>
                {overallStatus === 'FULLY READY' ? 'Confirm & Continue' : 'Confirm with Exceptions'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
