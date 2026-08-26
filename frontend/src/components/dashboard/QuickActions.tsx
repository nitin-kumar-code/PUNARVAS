import { useState, useEffect } from 'react';
import { Plus, ShieldAlert, Compass, Package, Download } from 'lucide-react';
import { RelocationPlanModal } from './RelocationPlanModal';

export const QuickActions = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-4 mt-6">
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-punarvas-primary-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Generate Relocation Plan
        </button>
        
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-punarvas-text px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm">
          <ShieldAlert className="w-5 h-5 text-slate-500" />
          Review Critical Areas
        </button>
        
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-punarvas-text px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm">
          <Compass className="w-5 h-5 text-slate-500" />
          Hazard Explorer
        </button>
        
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-punarvas-text px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm">
          <Package className="w-5 h-5 text-slate-500" />
          Resource Allocation
        </button>
        
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-punarvas-text px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm ml-auto">
          <Download className="w-5 h-5 text-slate-500" />
          Export Dashboard
        </button>
      </div>

      <RelocationPlanModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
