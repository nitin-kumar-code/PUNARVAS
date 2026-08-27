import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { SourceContextPanel } from '../components/decision/SourceContextPanel';
import { FinalReceipt } from '../components/decision/FinalReceipt';
import { mockDecision } from '../data/decisionData';

export const DecisionSupport = () => {
  const [decision] = useState(mockDecision);

  return (
    <div className="max-w-[1200px] mx-auto w-full pb-10">
      
      {/* Page Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-punarvas-text tracking-tight mb-1">DECISION SUPPORT</h1>
          <p className="text-punarvas-text-secondary text-sm">Explainable relocation recommendation and traceable decision receipt.</p>
        </div>
        <button className="bg-punarvas-dark-navy hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
          Export Receipt
        </button>
      </div>

      {/* Decision ID Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex justify-between items-center mb-6">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Decision ID</p>
          <h2 className="text-3xl font-bold text-punarvas-text">{decision.decisionId}</h2>
        </div>
        <div className={`px-4 py-2 text-sm font-bold uppercase ${
          decision.status === 'APPROVED / READY FOR EXECUTION' 
            ? 'bg-[#E8F8EE] text-punarvas-safe-green border border-[#BBE5CB]' 
            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        } rounded-lg`}>
          {decision.status}
        </div>
      </div>

      <SourceContextPanel decision={decision} />

      <FinalReceipt decision={decision} />

      {/* Accordions */}
      <div className="space-y-4 mb-8">
        <details className="bg-white rounded-xl border border-slate-200 shadow-sm group">
          <summary className="p-5 font-bold text-punarvas-text cursor-pointer select-none list-none flex justify-between items-center">
            Decision Audit Trail
            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="px-5 pb-5 pt-2 border-t border-slate-100">
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {decision.auditTrail.map((log, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-3 h-3 rounded-full border-2 border-white bg-slate-300 group-[.is-active]:bg-punarvas-primary-blue text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-slate-50 p-3 rounded border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-700 text-sm">{log.event}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </details>

        <details className="bg-white rounded-xl border border-slate-200 shadow-sm group">
          <summary className="p-5 font-bold text-punarvas-text cursor-pointer select-none list-none flex justify-between items-center">
            Evidence & Data Sources
            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="px-5 pb-5 pt-2 border-t border-slate-100">
            <ul className="list-disc pl-5 text-sm font-semibold text-slate-600 space-y-1">
              <li>Hazard assessment (USGS / NDRF)</li>
              <li>Population dataset (Census 2021)</li>
              <li>Infrastructure assessment (PWD)</li>
              <li>Rainfall observations (IMD)</li>
            </ul>
          </div>
        </details>

        <details className="bg-white rounded-xl border border-slate-200 shadow-sm group">
          <summary className="p-5 font-bold text-punarvas-text cursor-pointer select-none list-none flex justify-between items-center">
            Risk Model Information
            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="px-5 pb-5 pt-2 border-t border-slate-100 text-sm text-slate-600">
            <p><strong>Model:</strong> PUNARVAS Risk Prioritization Model</p>
            <p><strong>Version:</strong> v1.0</p>
            <p><strong>Assessment:</strong> Latest</p>
            <p><strong>Confidence:</strong> 94%</p>
          </div>
        </details>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-3">
          <button className="bg-punarvas-safe-green hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-sm transition-colors text-lg">
            Execute Relocation Plan
          </button>
          <button className="bg-punarvas-dark-navy hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-bold shadow-sm transition-colors">
            Export Receipt
          </button>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-3 rounded-lg font-bold transition-colors">
            View on Map
          </button>
          <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-3 rounded-lg font-bold transition-colors">
            Return to Planner
          </button>
        </div>
      </div>

    </div>
  );
};
