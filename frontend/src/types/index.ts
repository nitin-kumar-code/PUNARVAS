export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Safe';

export interface Habitation {
  id: string;
  name: string;
  riskIndex: number;
  population: number;
  vulnerablePopulation: number;
  priority: 'P1' | 'P2' | 'P3';
  status: 'Pending' | 'Routing' | 'Monitored' | 'Relocated';
  riskLevel: RiskLevel;
  coordinates: [number, number]; // [latitude, longitude]
}

export interface Alert {
  id: string;
  title: string;
  timeAgo: string;
  vulnerablePeople: number;
  riskLevel: RiskLevel;
  type: 'landslide' | 'flood' | 'infrastructure' | 'safe_site' | 'other';
}

export interface KPIStats {
  atRiskHabitations: number;
  criticalZones: number;
  immediateRelocation: number;
  vulnerablePopulation: number;
  safeRelocationCapacity: number;
}
