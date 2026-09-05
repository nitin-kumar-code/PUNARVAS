import React from 'react';
import type { AuditEvent } from '../../hooks/useAuditLogs';

interface Props {
  events: AuditEvent[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
  page: number;
  setPage: (p: number) => void;
  totalFiltered: number;
  itemsPerPage: number;
}

export const AuditTable = ({ events, selectedEventId, onSelectEvent, page, setPage, totalFiltered, itemsPerPage }: Props) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPDATED': return <span className="bg-blue-50 text-punarvas-primary-blue border border-blue-200 text-[10px] font-bold px-2 py-1 rounded uppercase">UPDATED</span>;
      case 'COMPLETED': return <span className="bg-green-50 text-punarvas-safe-green border border-green-200 text-[10px] font-bold px-2 py-1 rounded uppercase">COMPLETED</span>;
      case 'RECORDED': return <span className="bg-green-50 text-punarvas-safe-green border border-green-200 text-[10px] font-bold px-2 py-1 rounded uppercase">RECORDED</span>;
      case 'REJECTED': return <span className="bg-red-50 text-punarvas-critical-red border border-red-200 text-[10px] font-bold px-2 py-1 rounded uppercase">REJECTED</span>;
      default: return <span className="bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-bold px-2 py-1 rounded uppercase">{status}</span>;
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const totalPages = Math.ceil(totalFiltered / itemsPerPage);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-white">
        <h3 className="text-lg font-bold text-punarvas-dark-navy">Decision & System Audit Trail</h3>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-punarvas-primary-blue text-[10px] uppercase tracking-wider border-b border-slate-200">
              <th className="py-3 px-4 font-bold">TIME</th>
              <th className="py-3 px-4 font-bold">EVENT</th>
              <th className="py-3 px-4 font-bold">HABITATION / SITE</th>
              <th className="py-3 px-4 font-bold">USER / SYSTEM</th>
              <th className="py-3 px-4 font-bold w-1/4">ACTION</th>
              <th className="py-3 px-4 font-bold">STATUS</th>
              <th className="py-3 px-4 font-bold text-right">REFERENCE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((ev) => (
              <tr 
                key={ev.id} 
                onClick={() => onSelectEvent(ev.id)}
                className={`cursor-pointer transition-colors ${selectedEventId === ev.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
              >
                <td className="py-4 px-4 text-sm text-slate-500 font-semibold">{formatTime(ev.timestamp)}</td>
                <td className="py-4 px-4 text-sm text-slate-700 font-medium">{ev.eventLabel}</td>
                <td className="py-4 px-4 text-sm text-slate-700">{ev.entityName}</td>
                <td className="py-4 px-4 text-sm text-slate-700">{ev.actorName}</td>
                <td className="py-4 px-4 text-sm text-slate-700">{ev.action}</td>
                <td className="py-4 px-4">{getStatusBadge(ev.status)}</td>
                <td className="py-4 px-4 text-sm font-mono text-right">
                  <span 
                    className="text-punarvas-primary-blue hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (ev.referenceId.startsWith('RISK')) window.location.href = '/risk';
                      else if (ev.referenceId.startsWith('SITE')) window.location.href = '/map';
                      else if (ev.referenceId.startsWith('OPT') || ev.referenceId.startsWith('PLAN') || ev.referenceId.startsWith('DEC')) window.location.href = '/decision';
                      else if (ev.referenceId.startsWith('RES')) window.location.href = '/resource';
                      else if (ev.referenceId.startsWith('ROUTE')) window.location.href = '/map';
                    }}
                  >
                    {ev.referenceId}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-white text-sm text-slate-500 font-semibold">
        <span>Showing {(page - 1) * itemsPerPage + 1}–{Math.min(page * itemsPerPage, totalFiltered)} of {totalFiltered} events</span>
        <div className="flex gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
          >
            Prev
          </button>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
