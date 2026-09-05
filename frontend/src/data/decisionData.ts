export interface DecisionFactor {
  name: string;
  contribution: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface DecisionRecord {
  decisionId: string;
  status: 'DRAFT' | 'UNDER REVIEW' | 'APPROVED / READY FOR EXECUTION' | 'EXECUTING' | 'COMPLETED' | 'REJECTED';
  source: {
    id: string;
    name: string;
    population: number;
    vulnerablePopulation: number;
    hazard: string;
    hazards?: Record<string, number>;
    riskScore: number;
    priority: string;
  };
  factors: DecisionFactor[];
  confidence: number;
  confidenceLabel: string;
  destinations: {
    site: string;
    role: 'Primary' | 'Secondary' | 'Overflow';
    allocation: number;
  }[];
  coverage: number;
  auditTrail: { timestamp: string; event: string }[];
}

export const mockDecision: DecisionRecord = {
  decisionId: "PLAN-001",
  status: "APPROVED / READY FOR EXECUTION",
  source: {
    id: "village-a",
    name: "Village A",
    population: 1840,
    vulnerablePopulation: 312,
    hazard: "Landslide",
    riskScore: 91,
    priority: "P1 — IMMEDIATE"
  },
  factors: [
    { name: "HAZARD EXPOSURE", contribution: 35, severity: "critical" },
    { name: "VULNERABILITY", contribution: 27, severity: "high" },
    { name: "POOR ROAD ACCESS", contribution: 18, severity: "medium" },
    { name: "ACTIVE HAZARD SIGNAL", contribution: 11, severity: "critical" }
  ],
  confidence: 94,
  confidenceLabel: "HIGH",
  destinations: [
    { site: "SITE B", role: "Primary", allocation: 1000 },
    { site: "SITE D", role: "Secondary", allocation: 840 }
  ],
  coverage: 100,
  auditTrail: [
    { timestamp: "10:32 AM", event: "Risk assessment generated" },
    { timestamp: "10:34 AM", event: "Village A classified as P1 — Immediate" },
    { timestamp: "10:36 AM", event: "Candidate sites screened" },
    { timestamp: "10:37 AM", event: "Site B recommended" },
    { timestamp: "10:38 AM", event: "Allocation calculated" },
    { timestamp: "10:40 AM", event: "Decision approved" }
  ]
};
