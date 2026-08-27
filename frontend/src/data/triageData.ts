import type { RiskLevel } from '../types';

export interface TriageRecord {
  id: string;
  habitation: string;
  district: string;
  hazard: string;
  riskScore: number;
  riskLevel: RiskLevel;
  hazardSeverity: number;
  exposureLevel: number;
  vulnerability: number;
  vulnerablePopulation: number;
  population: number;
  confidence: 'High' | 'Medium' | 'Low';
  priority: string;
  assessmentTime: string;
  evidence: string[];
  explanation: string[];
}

// Math: (Hazard * 0.4) + (Exposure * 0.3) + (Vulnerability * 0.3)
export const triageData: TriageRecord[] = [
  {
    id: "villageA", // Changed to match mapData.ts IDs
    habitation: "Village A",
    district: "West Tripura",
    hazard: "Landslide",
    riskScore: 91,
    riskLevel: "Critical",
    hazardSeverity: 95, // 95 * 0.4 = 38
    exposureLevel: 90,  // 90 * 0.3 = 27
    vulnerability: 86,  // 86 * 0.3 = 25.8 (Total: 90.8 ~ 91)
    population: 1840,
    vulnerablePopulation: 312,
    confidence: "High",
    priority: "P1 — Immediate",
    assessmentTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    evidence: [
      "Heavy Rainfall Alert",
      "High Susceptibility",
      "Vulnerable Population",
      "Limited Access Route"
    ],
    explanation: [
      "Slope instability detected following >150mm rainfall in past 48h.",
      "Over 300 individuals residing in direct path of potential debris flow.",
      "Access route has limited redundancy.",
      "Current hazard conditions exceed the configured intervention threshold."
    ]
  },
  {
    id: "sector4",
    habitation: "Sector 4",
    district: "West Tripura",
    hazard: "Flood",
    riskScore: 82,
    riskLevel: "Critical",
    hazardSeverity: 80, // 32
    exposureLevel: 85,  // 25.5
    vulnerability: 82,  // 24.6 (Total: 82.1 ~ 82)
    population: 15200,
    vulnerablePopulation: 340,
    confidence: "High",
    priority: "P1/P2",
    assessmentTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    evidence: [
      "Rising River Levels",
      "Low Elevation",
      "Dense Population"
    ],
    explanation: [
      "River level is currently 1m above danger mark.",
      "Significant portion of the population is highly vulnerable."
    ]
  },
  {
    id: "hillsideB",
    habitation: "Hillside B",
    district: "South Tripura",
    hazard: "Landslide",
    riskScore: 75,
    riskLevel: "High",
    hazardSeverity: 75, // 30
    exposureLevel: 70,  // 21
    vulnerability: 80,  // 24 (Total: 75)
    population: 8500,
    vulnerablePopulation: 145,
    confidence: "Medium",
    priority: "P2",
    assessmentTime: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    evidence: [
      "Moderate Rainfall",
      "Steep Terrain"
    ],
    explanation: [
      "Terrain is steep and susceptible to landslide.",
      "Requires monitoring due to expected continuous rainfall."
    ]
  },
  {
    id: "valleyOutpost",
    habitation: "Valley Outpost",
    district: "North Tripura",
    hazard: "Flood",
    riskScore: 45,
    riskLevel: "Medium",
    hazardSeverity: 40, // 16
    exposureLevel: 50,  // 15
    vulnerability: 47,  // 14.1 (Total: 45.1 ~ 45)
    population: 1200,
    vulnerablePopulation: 12,
    confidence: "High",
    priority: "P3",
    assessmentTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    evidence: [
      "Historical Flood Zone"
    ],
    explanation: [
      "Currently low risk but historically flood-prone during monsoons."
    ]
  },
  {
    id: "siteC",
    habitation: "Safe Site C",
    district: "Dhalai",
    hazard: "Cyclone",
    riskScore: 28,
    riskLevel: "Low",
    hazardSeverity: 30, // 12
    exposureLevel: 20,  // 6
    vulnerability: 33,  // 9.9 (Total: 27.9 ~ 28)
    population: 3400,
    vulnerablePopulation: 0,
    confidence: "Low",
    priority: "P4",
    assessmentTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    evidence: [
      "High Elevation",
      "Sturdy Infrastructure"
    ],
    explanation: [
      "Location is elevated and historically safe from severe impact."
    ]
  },
  {
    id: "riverBend",
    habitation: "River Bend",
    district: "Gomati",
    hazard: "Flood",
    riskScore: 68,
    riskLevel: "High",
    hazardSeverity: 70, // 28
    exposureLevel: 65,  // 19.5
    vulnerability: 68,  // 20.4 (Total: 67.9 ~ 68)
    population: 5600,
    vulnerablePopulation: 210,
    confidence: "Medium",
    priority: "P2",
    assessmentTime: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    evidence: [
      "Proximity to Riverbank",
      "Erosion Detected"
    ],
    explanation: [
      "Riverbank erosion threatens outer settlements.",
      "Requires short-term mitigation."
    ]
  }
];
