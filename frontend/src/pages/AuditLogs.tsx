import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { AuditSummaryCards } from '../components/audit/AuditSummaryCards';
import { AuditFilterBar } from '../components/audit/AuditFilterBar';
import { AuditTable } from '../components/audit/AuditTable';
import { DecisionTrace } from '../components/audit/DecisionTrace';

export const AuditLogs = () => {
  const { 
    events, 
    totalFiltered, 
    page, 
    setPage, 
    itemsPerPage, 
    filters, 
    setFilters, 
    stats, 
    decisionTrace 
  } = useAuditLogs();
  
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleExport = () => {
    // Mock export functionality
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Timestamp,Event,Entity,Actor,Action,Status,Reference\n"
      + events.map(e => `${e.timestamp},${e.eventLabel},${e.entityName},${e.actorName},"${e.action}",${e.status},${e.referenceId}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "punarvas_audit_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1800px] mx-auto w-full pb-10 flex flex-col h-[calc(100vh-100px)]">
      
      {/* Page Header */}
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-punarvas-text tracking-tight mb-1">Audit Logs</h1>
          <p className="text-punarvas-text-secondary text-sm">Traceable record of risk assessments, site screening, optimization decisions and relocation plans.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="bg-white border border-punarvas-primary-blue text-punarvas-primary-blue hover:bg-blue-50 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Logs
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="shrink-0">
        <AuditSummaryCards stats={stats} />
      </div>

      {/* Filter Bar */}
      <div className="shrink-0">
        <AuditFilterBar filters={filters} setFilters={setFilters} />
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column (Table) - ~70% */}
        <div className="w-full lg:flex-[7] min-h-0 flex flex-col">
          <AuditTable 
            events={events} 
            selectedEventId={selectedEventId}
            onSelectEvent={setSelectedEventId}
            page={page}
            setPage={setPage}
            totalFiltered={totalFiltered}
            itemsPerPage={itemsPerPage}
          />
        </div>

        {/* Right Column (Decision Trace) - ~30% */}
        <div className="w-full lg:flex-[3] min-h-0 flex flex-col">
          <DecisionTrace 
            traceEvents={decisionTrace} 
            selectedEventId={selectedEventId}
            onSelectEvent={setSelectedEventId}
          />
        </div>
      </div>

    </div>
  );
};
