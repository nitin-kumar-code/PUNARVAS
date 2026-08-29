export interface RiskDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface PriorityHabitation {
  id: string;
  name: string;
  population: number;
  risk_score: number;
}

export interface ImmediateRelocationCandidate {
  habitation_id: string;
  name: string;
  risk_score: number;
  vulnerable_population: number;
  primary_hazard: string;
  reason_for_priority: string;
}

export interface DashboardSummary {
  total_habitations: number;
  critical_habitations: number;
  immediate_relocation: number;
  vulnerable_population: number | null;
  safe_relocation_capacity: number | null;
  available_relocation_capacity: number | null;
  critical_population: number;
  high_risk_population: number;
  average_risk_score: number;
  relocation_coverage: number | null;
  risk_distribution: RiskDistribution;
  priority_habitations: PriorityHabitation[];
  immediate_relocation_candidates: ImmediateRelocationCandidate[];
}

export interface MapHabitation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  risk_level: string;
  population: number;
  vulnerable_population: number;
}

export interface MapSite {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  available_capacity: number | null;
  status: string;
  overall_safety_score: number;
}
