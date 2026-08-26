import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { habitations } from '../../data/mockData';

export const RelocationPlanModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [selectedHab, setSelectedHab] = useState(habitations[0].id);
  const hab = habitations.find(h => h.id === selectedHab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-punarvas-dark-navy/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold text-punarvas-text">Generate Relocation Plan</h2>
          <button onClick={() => { onClose(); setStep(1); }} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Habitation</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-punarvas-primary-blue focus:border-punarvas-primary-blue text-sm"
                  value={selectedHab}
                  onChange={(e) => setSelectedHab(e.target.value)}
                >
                  {habitations.filter(h => h.riskLevel !== 'Safe').map(h => (
                    <option key={h.id} value={h.id}>{h.name} ({h.riskLevel} Risk)</option>
                  ))}
                </select>
              </div>

              {hab && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Risk Level</p>
                      <p className={`font-bold mt-0.5 ${hab.riskLevel === 'Critical' ? 'text-punarvas-critical-red' : hab.riskLevel === 'High' ? 'text-punarvas-high-orange' : 'text-punarvas-medium-yellow'}`}>
                        {hab.riskLevel}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Population</p>
                      <p className="font-bold text-punarvas-text mt-0.5">{hab.population}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Vulnerable</p>
                      <p className="font-bold text-punarvas-text mt-0.5">{hab.vulnerablePopulation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Current Priority</p>
                      <p className="font-bold text-punarvas-text mt-0.5">{hab.priority}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Preferred Relocation Radius (km)</label>
                <input type="range" min="5" max="50" defaultValue="15" className="w-full" />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>5 km</span>
                  <span>15 km</span>
                  <span>50 km</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-punarvas-safe-green">
                <CheckCircle className="w-8 h-8" />
                <h3 className="text-lg font-bold text-punarvas-text">Optimal Site Identified</h3>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                <h4 className="font-bold text-punarvas-text mb-4 text-lg">Recommended Site: Valley Outpost</h4>
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Available Capacity</p>
                    <p className="font-bold text-punarvas-text mt-0.5 text-lg">420 people</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Distance</p>
                    <p className="font-bold text-punarvas-text mt-0.5 text-lg">8.4 km</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Safety Score</p>
                    <p className="font-bold text-punarvas-safe-green mt-0.5 text-lg">92/100</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Estimated Transit</p>
                    <p className="font-bold text-punarvas-text mt-0.5 text-lg">45 mins</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
          <button 
            onClick={() => { onClose(); setStep(1); }}
            className="px-5 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors text-sm"
          >
            Cancel
          </button>
          
          {step === 1 ? (
            <button 
              onClick={() => setStep(2)}
              className="px-5 py-2 bg-punarvas-primary-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              Find Optimal Site
            </button>
          ) : (
            <button 
              onClick={() => { onClose(); setStep(1); }}
              className="px-5 py-2 bg-punarvas-safe-green text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm & Generate Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
