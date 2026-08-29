import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { HazardAnalysisControls } from '../components/hazard/HazardAnalysisControls';
import { HazardLayers } from '../components/hazard/HazardLayers';
import { HazardMapView } from '../components/hazard/HazardMapView';
import { SelectedLocation } from '../components/hazard/SelectedLocation';
import { HazardIntensitySummary } from '../components/hazard/HazardIntensitySummary';
import { HazardExposureTrend } from '../components/hazard/HazardExposureTrend';
import { RecentHazardEvents } from '../components/hazard/RecentHazardEvents';

export const HazardExplorer = () => {
  return (
    <div className="max-w-[1400px] mx-auto w-full pb-10">
      
      {/* Page Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-punarvas-text tracking-tight mb-1">Hazard Explorer</h1>
          <p className="text-punarvas-text-secondary text-sm">Explore hazard layers, intensity zones and historical events to support risk understanding.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-300 hover:bg-slate-50 text-punarvas-primary-blue px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Hazard Report
          </button>
          <button className="bg-white border border-slate-300 hover:bg-slate-50 text-punarvas-primary-blue px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
        </div>
      </div>

      <HazardAnalysisControls />

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6 h-[800px] mb-6">
        
        {/* Left Column - 18% equivalent (2/12 columns is 16.6%, let's use custom widths or standard Tailwind) */}
        {/* We'll use absolute grid spacing or col-span. Screenshot is ~ 20% / 50% / 30% */}
        <div className="col-span-12 lg:col-span-3 xl:col-span-2 h-full">
          <HazardLayers />
        </div>

        {/* Center Column */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-6 flex flex-col gap-6 h-full">
          <div className="flex-[3]">
            <HazardMapView />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-6">
            <HazardIntensitySummary />
            <HazardExposureTrend />
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-4 flex flex-col gap-6 h-full">
          <div className="flex-1 min-h-[450px]">
            <SelectedLocation />
          </div>
          <div className="h-[250px] shrink-0">
            <RecentHazardEvents />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex justify-center gap-4 shadow-sm items-center">
        <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          View Risk & Triage
        </button>
        <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          Relocation Planner
        </button>
        <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          Resource Allocation
        </button>
        <div className="flex-1 text-right ml-8">
          <button className="bg-punarvas-primary-blue hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2 ml-auto">
            <Download className="w-4 h-4" /> Generate Hazard Report
          </button>
        </div>
      </div>

    </div>
  );
};
