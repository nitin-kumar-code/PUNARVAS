import React from 'react';
import type { AuditEvent } from '../../hooks/useAuditLogs';

interface Props {
  traceEvents: AuditEvent[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
}

export const DecisionTrace = ({ traceEvents, selectedEventId, onSelectEvent }: Props) => {
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const getMarkerColor = (status: string) => {
    switch(status) {
      case 'UPDATED': return 'bg-punarvas-primary-blue';
      case 'COMPLETED': return 'bg-punarvas-safe-green';
      case 'RECORDED': return 'bg-punarvas-safe-green';
      case 'REJECTED': return 'bg-punarvas-critical-red';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full overflow-y-auto">
      <h3 className="text-lg font-bold text-punarvas-dark-navy mb-6">Decision Trace: Village A</h3>
      
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
        {traceEvents.map((ev) => {
          const isSelected = selectedEventId === ev.id;
          
          return (
            <div 
              key={ev.id} 
              className={`relative flex items-start group cursor-pointer p-2 rounded-lg transition-colors ${isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
              onClick={() => onSelectEvent(ev.id)}
            >
              <div className={`flex items-center justify-center w-3 h-3 rounded-full border-2 border-white shadow shrink-0 z-10 mt-1 ${getMarkerColor(ev.status)}`}></div>
              <div className="ml-4">
                <span className="text-xs text-slate-500 font-semibold">{formatTime(ev.timestamp)}</span>
                <div className={`text-sm font-bold mt-0.5 ${ev.status === 'REJECTED' ? 'text-punarvas-critical-red' : 'text-slate-700'}`}>
                  {ev.eventLabel === 'Site Screened' && ev.status === 'REJECTED' ? 'Site C Rejected' : ev.eventLabel}
                </div>
                
                {ev.eventType === 'RISK_UPDATED' && ev.metadata && (
                  <div className="text-xs text-slate-500 mt-1">
                    Score: {ev.metadata.newScore}
                  </div>
                )}
                
                {ev.status === 'REJECTED' && ev.metadata && (
                  <div className="text-xs text-slate-500 mt-1">
                    {ev.metadata.reason}
                  </div>
                )}
                
                {ev.eventType === 'OPTIMIZATION_COMPLETED' && (
                  <div className="text-xs text-slate-500 mt-1">
                    Optimization Completed
                  </div>
                )}
                
                {/* Expandable Detail Section for Selected Event */}
                {isSelected && (
                  <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm text-xs space-y-1.5 cursor-default" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between"><span className="text-slate-500">Actor</span> <span className="font-bold">{ev.actorName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Action</span> <span className="font-bold">{ev.action}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Status</span> <span className="font-bold">{ev.status}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Reference</span> <span className="font-mono text-punarvas-primary-blue">{ev.referenceId}</span></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
