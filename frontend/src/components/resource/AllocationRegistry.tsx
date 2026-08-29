import React, { useState } from 'react';
import { Table, Search, Bus, PlusSquare, Package, Home, Droplets, Users } from 'lucide-react';
import type { ResourceRecord } from '../../hooks/useResourceAllocation';

interface Props {
  resources: ResourceRecord[];
  getGap: (req: number, avail: number) => number;
  getStatus: (req: number, avail: number) => string;
  onRequestSupply: (id: string, qty: number) => void;
}

export const AllocationRegistry = ({ resources, getGap, getStatus, onRequestSupply }: Props) => {
  const [filter, setFilter] = useState('');

  const filteredResources = resources.filter(r => {
    const status = getStatus(r.required, r.available);
    return r.name.toLowerCase().includes(filter.toLowerCase()) || 
           status.toLowerCase().includes(filter.toLowerCase());
  });

  const getIcon = (id: string) => {
    switch (id) {
      case 'buses': return <Bus className="w-4 h-4 text-slate-500" />;
      case 'medical': return <PlusSquare className="w-4 h-4 text-slate-500" />;
      case 'kits': return <Package className="w-4 h-4 text-punarvas-critical-red" />;
      case 'shelter': return <Home className="w-4 h-4 text-slate-500" />;
      case 'water': return <Droplets className="w-4 h-4 text-slate-500" />;
      case 'staff': return <Users className="w-4 h-4 text-punarvas-high-orange" />;
      default: return <Package className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUFFICIENT': return <span className="bg-green-50 text-punarvas-safe-green border border-green-200 text-[10px] font-bold px-2 py-1 rounded uppercase">SUFFICIENT</span>;
      case 'WARNING': return <span className="bg-orange-50 text-punarvas-high-orange border border-orange-200 text-[10px] font-bold px-2 py-1 rounded uppercase">WARNING</span>;
      case 'SHORTAGE': return <span className="bg-red-50 text-punarvas-critical-red border border-red-200 text-[10px] font-bold px-2 py-1 rounded uppercase">SHORTAGE</span>;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-slate-700" />
          <h3 className="text-[15px] font-bold text-punarvas-text">Allocation Registry</h3>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Filter resources..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-punarvas-primary-blue"
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-punarvas-dark-navy text-white text-[10px] uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold w-1/4">RESOURCE TYPE</th>
              <th className="py-3 px-4 font-semibold text-center">REQUIRED</th>
              <th className="py-3 px-4 font-semibold text-center">AVAILABLE</th>
              <th className="py-3 px-4 font-semibold text-center">ALLOCATED</th>
              <th className="py-3 px-4 font-semibold text-center">GAP</th>
              <th className="py-3 px-4 font-semibold text-center w-32">STATUS</th>
              <th className="py-3 px-4 font-semibold text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredResources.map((res) => {
              const gap = getGap(res.required, res.available);
              const status = getStatus(res.required, res.available);
              const isShortage = gap < 0;

              return (
                <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {getIcon(res.id)}
                      <span className={`text-sm font-bold ${isShortage ? 'text-punarvas-critical-red' : 'text-slate-700'}`}>
                        {res.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-slate-600 font-medium">{res.required.toLocaleString()}</td>
                  <td className="py-4 px-4 text-center text-sm text-slate-600 font-medium">{res.available.toLocaleString()}</td>
                  <td className="py-4 px-4 text-center text-sm text-slate-600 font-medium">{res.allocated.toLocaleString()}</td>
                  <td className="py-4 px-4 text-center text-sm font-bold">
                    <span className={isShortage ? 'text-punarvas-critical-red' : 'text-slate-600'}>
                      {gap > 0 ? `+${gap}` : gap}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {getStatusBadge(status)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {isShortage ? (
                      <button 
                        onClick={() => onRequestSupply(res.id, Math.abs(gap))}
                        className="text-xs font-bold text-punarvas-primary-blue hover:text-blue-700 uppercase tracking-wider"
                      >
                        RESOLVE
                      </button>
                    ) : status === 'WARNING' ? (
                      <button className="text-xs font-bold text-punarvas-primary-blue hover:text-blue-700 uppercase tracking-wider">
                        ASSIGN
                      </button>
                    ) : (
                      <button className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider">
                        REVIEW
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
