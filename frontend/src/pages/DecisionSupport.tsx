import React, { useState, useMemo } from 'react';
import { Download, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SourceContextPanel } from '../components/decision/SourceContextPanel';
import { FinalReceipt } from '../components/decision/FinalReceipt';
import { mockDecision } from '../data/decisionData';
import type { DecisionRecord } from '../data/decisionData';

export const DecisionSupport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;

  // Construct decision dynamically from state, fallback to mock if direct navigation
  const [decision, setDecision] = useState<DecisionRecord>(() => {
    if (!state?.source) return mockDecision;

    // Dynamically calculate the factors so they sum exactly to the risk score
    // In a real app this comes from the backend AI model
    const risk = state.source.riskScore;
    const factor1 = Math.round(risk * 0.38); // ~38%
    const factor2 = Math.round(risk * 0.30); // ~30%
    const factor3 = Math.round(risk * 0.20); // ~20%
    const factor4 = risk - (factor1 + factor2 + factor3); // remainder ensures exact match

    return {
      decisionId: `PLAN-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      status: 'APPROVED / READY FOR EXECUTION',
      source: {
        id: state.source.id,
        name: state.source.habitation, // triage data uses 'habitation'
        population: state.source.population,
        vulnerablePopulation: state.source.vulnerablePopulation,
        hazard: state.source.hazard,
        riskScore: state.source.riskScore,
        priority: state.source.priority
      },
      factors: [
        { name: "HAZARD EXPOSURE", contribution: factor1, severity: "critical" },
        { name: "VULNERABILITY", contribution: factor2, severity: "high" },
        { name: "POOR ROAD ACCESS", contribution: factor3, severity: "medium" },
        { name: "ACTIVE HAZARD SIGNAL", contribution: factor4, severity: "critical" }
      ],
      confidence: 94,
      confidenceLabel: "HIGH",
      destinations: state.allocation.alloc.map((a: any, idx: number) => ({
        site: a.site.name,
        role: idx === 0 ? "Primary" : "Secondary",
        allocation: a.people
      })),
      coverage: state.allocation.coveragePercent,
      auditTrail: mockDecision.auditTrail
    };
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleExecute = () => {
    setDecision(prev => ({ ...prev, status: 'EXECUTING' }));
    setShowConfirmModal(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full pb-10 relative">
      
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
            : decision.status === 'EXECUTING'
            ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        } rounded-lg transition-colors`}>
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
            <p><strong>Confidence:</strong> {decision.confidence}% (Note: Mock heuristic for demo)</p>
          </div>
        </details>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-3">
          <button 
            onClick={() => setShowConfirmModal(true)}
            disabled={decision.status !== 'APPROVED / READY FOR EXECUTION'}
            className="disabled:opacity-50 disabled:cursor-not-allowed bg-punarvas-safe-green hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-sm transition-colors text-lg"
          >
            Execute Relocation Plan
          </button>
          <button className="bg-punarvas-dark-navy hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-bold shadow-sm transition-colors">
            Export Receipt
          </button>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/map', { state: { selectedLocationId: decision.source.id } })}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-3 rounded-lg font-bold transition-colors"
          >
            View on Map
          </button>
          <button 
            onClick={() => navigate('/relocation', { state: { selectedHabitationId: decision.source.id } })}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-3 rounded-lg font-bold transition-colors"
          >
            Return to Planner
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-punarvas-dark-navy/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-punarvas-text">Confirm Execution</h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-semibold text-slate-500">Source</span>
                <span className="text-sm font-bold">{decision.source.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-semibold text-slate-500">Population</span>
                <span className="text-sm font-bold">{decision.source.population.toLocaleString()}</span>
              </div>
              {decision.destinations.map((d, i) => (
                <div key={i} className="flex justify-between border-b pb-2">
                  <span className="text-sm font-semibold text-slate-500">{d.role}</span>
                  <span className="text-sm font-bold">{d.site} ({d.allocation})</span>
                </div>
              ))}
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-semibold text-slate-500">Coverage</span>
                <span className={`text-sm font-bold ${decision.coverage === 100 ? 'text-punarvas-safe-green' : 'text-punarvas-high-orange'}`}>{decision.coverage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-slate-500">Status</span>
                <span className="text-sm font-bold text-punarvas-safe-green">{decision.status}</span>
              </div>
            </div>

            <div className="p-5 bg-slate-50 flex justify-end gap-3 border-t border-slate-200">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 border rounded-lg font-semibold text-slate-700 hover:bg-slate-100">Cancel</button>
              <button onClick={handleExecute} className="px-4 py-2 bg-punarvas-critical-red text-white rounded-lg font-bold hover:bg-red-700 transition-colors">Confirm & Execute</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
