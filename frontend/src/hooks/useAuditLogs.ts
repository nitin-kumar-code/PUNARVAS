import { useState, useMemo } from 'react';

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: string;
  eventLabel: string;
  entityName: string;
  actorType: 'AI_ENGINE' | 'SYSTEM' | 'OR_TOOLS' | 'OFFICER';
  actorName: string;
  action: string;
  status: 'UPDATED' | 'COMPLETED' | 'RECORDED' | 'REJECTED' | 'WARNING' | 'PENDING' | 'FAILED';
  referenceId: string;
  metadata?: any;
}

const generateMockEvents = (): AuditEvent[] => {
  const events: AuditEvent[] = [];
  const today = new Date().toISOString().split('T')[0];

  // The 7 specific events from the prompt
  events.push(
    {
      id: "ev-001",
      timestamp: `${today}T14:32:00Z`,
      eventType: "RISK_UPDATED",
      eventLabel: "Risk Updated",
      entityName: "Village A",
      actorType: "AI_ENGINE",
      actorName: "AI Engine",
      action: "Risk score changed 87 → 91",
      status: "UPDATED",
      referenceId: "RISK-001",
      metadata: { previousScore: 87, newScore: 91, hazard: "Landslide", confidence: 94 }
    },
    {
      id: "ev-002",
      timestamp: `${today}T14:33:00Z`,
      eventType: "SITE_SCREENED",
      eventLabel: "Site Screened",
      entityName: "Site C",
      actorType: "SYSTEM",
      actorName: "System",
      action: "Flood-prone site rejected",
      status: "REJECTED",
      referenceId: "SITE-003",
      metadata: { reason: "Flood-prone area", hazard: "Flood", risk: "Critical" }
    },
    {
      id: "ev-003",
      timestamp: `${today}T14:34:00Z`,
      eventType: "OPTIMIZATION_COMPLETED",
      eventLabel: "Optimization Completed",
      entityName: "Village A",
      actorType: "OR_TOOLS",
      actorName: "OR-Tools",
      action: "Site B selected",
      status: "COMPLETED",
      referenceId: "OPT-001"
    },
    {
      id: "ev-004",
      timestamp: `${today}T14:35:00Z`,
      eventType: "PLAN_GENERATED",
      eventLabel: "Plan Generated",
      entityName: "Village A",
      actorType: "OFFICER",
      actorName: "Officer",
      action: "Plan #001 generated",
      status: "COMPLETED",
      referenceId: "PLAN-001"
    },
    {
      id: "ev-005",
      timestamp: `${today}T14:36:00Z`,
      eventType: "DECISION_RECORDED",
      eventLabel: "Decision Recorded",
      entityName: "Village A",
      actorType: "OFFICER",
      actorName: "Officer",
      action: "Site B + Site D approved",
      status: "RECORDED",
      referenceId: "DEC-001"
    },
    {
      id: "ev-006",
      timestamp: `${today}T14:38:00Z`,
      eventType: "RESOURCE_CHECK",
      eventLabel: "Resource Check",
      entityName: "Site B",
      actorType: "SYSTEM",
      actorName: "System",
      action: "Shelter capacity verified",
      status: "COMPLETED",
      referenceId: "RES-001"
    },
    {
      id: "ev-007",
      timestamp: `${today}T14:40:00Z`,
      eventType: "ROUTE_UPDATED",
      eventLabel: "Route Updated",
      entityName: "Village A → Site B",
      actorType: "SYSTEM",
      actorName: "System",
      action: "Evacuation route recalculated",
      status: "UPDATED",
      referenceId: "ROUTE-001"
    }
  );

  // Generate an extra 121 mock events deterministically
  for (let i = 8; i <= 128; i++) {
    const isToday = i < 25; // Events 8-24 are today (17 events) + 7 explicit = 24 total today
    const daysAgo = isToday ? 0 : Math.ceil((i - 24) / 10); // Spreads events back across ~10 days deterministically
    
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    // Deterministic time: e.g., 10:00, 10:15, 10:30...
    const hr = (8 + (i % 10)).toString().padStart(2, '0');
    const min = ((i % 4) * 15).toString().padStart(2, '0');
    
    const dateStr = date.toISOString().split('T')[0];
    
    events.push({
      id: `ev-${i.toString().padStart(3, '0')}`,
      timestamp: `${dateStr}T${hr}:${min}:00Z`,
      eventType: "RESOURCE_CHECK",
      eventLabel: "Resource Check",
      entityName: i % 2 === 0 ? "Site B" : "Sector 4",
      actorType: "SYSTEM",
      actorName: "System",
      action: `Routine capacity check ${i}`,
      status: "COMPLETED",
      referenceId: `RES-${i.toString().padStart(3, '0')}`
    });
  }

  // Sort descending by default
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const ALL_EVENTS = generateMockEvents();

export function useAuditLogs() {
  const [filters, setFilters] = useState({
    date: 'All Dates',
    eventType: 'All Events',
    habitation: 'All',
    actor: 'All',
    search: ''
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const filteredEvents = useMemo(() => {
    return ALL_EVENTS.filter(ev => {
      // Basic filtering
      if (filters.eventType !== 'All Events' && ev.eventLabel !== filters.eventType) return false;
      if (filters.habitation !== 'All' && !ev.entityName.includes(filters.habitation)) return false;
      if (filters.actor !== 'All' && ev.actorName !== filters.actor) return false;
      
      // Search text
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const matches = 
          ev.eventLabel.toLowerCase().includes(term) ||
          ev.entityName.toLowerCase().includes(term) ||
          ev.action.toLowerCase().includes(term) ||
          ev.referenceId.toLowerCase().includes(term) ||
          ev.actorName.toLowerCase().includes(term);
        if (!matches) return false;
      }
      return true;
    });
  }, [filters]);

  const totalEvents = ALL_EVENTS.length;
  const todayEvents = ALL_EVENTS.filter(e => e.timestamp.startsWith(new Date().toISOString().split('T')[0])).length;
  const systemEvents = ALL_EVENTS.filter(e => e.actorType === 'SYSTEM' || e.actorType === 'AI_ENGINE').length;
  const officerEvents = ALL_EVENTS.filter(e => e.actorType === 'OFFICER').length;

  const paginatedEvents = filteredEvents.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  
  // The decision trace is usually the 7 events related to Village A.
  const decisionTrace = ALL_EVENTS.filter(e => e.id.localeCompare("ev-007") <= 0).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return {
    events: paginatedEvents,
    filteredEvents,
    totalFiltered: filteredEvents.length,
    page,
    setPage,
    itemsPerPage,
    filters,
    setFilters,
    stats: {
      total: totalEvents,
      today: todayEvents,
      system: systemEvents,
      officer: officerEvents
    },
    decisionTrace
  };
}
