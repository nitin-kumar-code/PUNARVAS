import React, { useState } from 'react';
import { X, AlertTriangle, Package } from 'lucide-react';
import type { ResourceRecord } from '../../hooks/useResourceAllocation';

interface ShortageModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ResourceRecord | null;
  gap: number;
  onRequestSupply: (id: string, qty: number) => void;
}

export const ShortageManagementModal = ({ isOpen, onClose, resource, gap, onRequestSupply }: ShortageModalProps) => {
  const [requestedQty, setRequestedQty] = useState(Math.abs(gap));

  if (!isOpen || !resource) return null;

  const handleRequest = () => {
    onRequestSupply(resource.id, requestedQty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-punarvas-dark-navy/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-punarvas-critical-red" />
            <h3 className="font-bold text-lg text-punarvas-text">Manage Shortage</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 bg-red-50 p-4 rounded-lg border border-red-100">
            <Package className="w-8 h-8 text-punarvas-critical-red" />
            <div>
              <h4 className="font-bold text-punarvas-text">{resource.name}</h4>
              <p className="text-sm font-semibold text-punarvas-critical-red">Current Shortage: {Math.abs(gap)} {resource.unit}</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm font-semibold text-slate-500">Required</span>
              <span className="text-sm font-bold">{resource.required.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm font-semibold text-slate-500">Available</span>
              <span className="text-sm font-bold">{resource.available.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm font-semibold text-slate-500">Priority</span>
              <span className="text-sm font-bold text-punarvas-critical-red uppercase">{resource.priority}</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">REQUEST ADDITIONAL SUPPLY</label>
            <input 
              type="number" 
              value={requestedQty}
              onChange={(e) => setRequestedQty(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-punarvas-primary-blue"
            />
          </div>
          
          <div className="pt-2">
            <p className="text-xs text-slate-500 italic">Or choose alternative action:</p>
            <div className="flex flex-col gap-2 mt-2">
              <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-bold transition-colors">Reallocate Existing Stock</button>
              <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-bold transition-colors">Mark Temporary Substitute</button>
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-50 flex justify-end gap-3 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors">Close</button>
          <button onClick={handleRequest} className="px-4 py-2 bg-punarvas-primary-blue text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm">Create Request</button>
        </div>
      </div>
    </div>
  );
};
