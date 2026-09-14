export interface RelocationSite {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  safetyScore: number;
  eligible: boolean;
  capacity: number;
  availableCapacity: number;
  distance: number;
  travelTime: number;
  hazards: {
    flood: string;
    landslide: string;
    earthquake: string;
  };
  accessibility: string;
  healthcareDistance: number;
  infrastructure: {
    roads: string;
    power: string;
    water: string;
    comms: string;
    healthcare: string;
  };
  reason?: string;
}

export const relocationSites: RelocationSite[] = [
  {
    id: "site-a",
    name: "Site A",
    latitude: 23.8500,
    longitude: 91.3000,
    safetyScore: 88,
    eligible: true,
    capacity: 600,
    availableCapacity: 420,
    distance: 12.5,
    travelTime: 45,
    hazards: { flood: "Low", landslide: "Low", earthquake: "Low" },
    accessibility: "Moderate",
    healthcareDistance: 8.5,
    infrastructure: { roads: "Operational", power: "Warning", water: "Operational", comms: "Operational", healthcare: "Available" }
  },
  {
    id: "site-b",
    name: "Site B",
    latitude: 23.8600,
    longitude: 91.2500,
    safetyScore: 94,
    eligible: true,
    capacity: 1200,
    availableCapacity: 1000,
    distance: 8.4,
    travelTime: 38,
    hazards: { flood: "Low", landslide: "Low", earthquake: "Moderate" },
    accessibility: "Good",
    healthcareDistance: 4.2,
    infrastructure: { roads: "Operational", power: "Operational", water: "Operational", comms: "Operational", healthcare: "Available" }
  },
  {
    id: "site-c",
    name: "Site C",
    latitude: 23.8200,
    longitude: 91.3100,
    safetyScore: 45,
    eligible: false,
    capacity: 500,
    availableCapacity: 500,
    distance: 5.2,
    travelTime: 20,
    hazards: { flood: "High", landslide: "Low", earthquake: "Low" },
    accessibility: "Good",
    healthcareDistance: 2.1,
    infrastructure: { roads: "Operational", power: "Operational", water: "Warning", comms: "Warning", healthcare: "Available" },
    reason: "Blocked due to severe natural hazard exposure (Flood Zone) and overall safety score below minimum threshold."
  },
  {
    id: "site-d",
    name: "Site D",
    latitude: 23.8800,
    longitude: 91.2900,
    safetyScore: 91,
    eligible: true,
    capacity: 900,
    availableCapacity: 840,
    distance: 15.2,
    travelTime: 55,
    hazards: { flood: "Low", landslide: "Low", earthquake: "Low" },
    accessibility: "Moderate",
    healthcareDistance: 6.0,
    infrastructure: { roads: "Operational", power: "Operational", water: "Operational", comms: "Operational", healthcare: "Limited" }
  }
];
