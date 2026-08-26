import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

export const DashboardHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-punarvas-text tracking-tight mb-2">Situation Overview</h1>
        <p className="text-punarvas-text-secondary text-sm">Real-time view of habitation risk, vulnerable population and relocation readiness.</p>
      </div>
      <button className="flex items-center gap-2 bg-punarvas-primary-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
        <Plus className="w-5 h-5" />
        Generate Relocation Plan
      </button>
    </div>
  );
};
