import type { RiskLevel } from '../types';

export interface MapLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  riskIndex: number;
  riskLevel: RiskLevel;
  population: number;
  vulnerablePopulation: number;
  hazards: {
    flood?: 'High' | 'Moderate' | 'Low';
    earthquake?: 'High' | 'Moderate' | 'Low';
    landslide?: 'High' | 'Moderate' | 'Low';
  };
  infrastructure: {
    roads: 'Operational' | 'Warning' | 'Critical';
    power: 'Operational' | 'Warning' | 'Critical';
    comms: 'Operational' | 'Warning' | 'Critical';
  };
}

export const mapLocations: MapLocation[] = [
  {
    id: 'villageA',
    name: 'Village A',
    latitude: 23.8315,
    longitude: 91.2868,
    riskIndex: 87,
    riskLevel: 'Critical',
    population: 42500,
    vulnerablePopulation: 8240,
    hazards: {
      flood: 'High',
      earthquake: 'Moderate'
    },
    infrastructure: {
      roads: 'Warning',
      power: 'Critical',
      comms: 'Operational'
    }
  },
  {
    id: 'sector4',
    name: 'Sector 4',
    latitude: 23.7950,
    longitude: 91.3200,
    riskIndex: 72,
    riskLevel: 'High',
    population: 15200,
    vulnerablePopulation: 3100,
    hazards: {
      flood: 'Moderate',
      landslide: 'High'
    },
    infrastructure: {
      roads: 'Operational',
      power: 'Warning',
      comms: 'Operational'
    }
  },
  {
    id: 'hillsideB',
    name: 'Hillside B',
    latitude: 23.7800,
    longitude: 91.2600,
    riskIndex: 55,
    riskLevel: 'Medium',
    population: 8500,
    vulnerablePopulation: 1200,
    hazards: {
      landslide: 'Moderate'
    },
    infrastructure: {
      roads: 'Warning',
      power: 'Operational',
      comms: 'Operational'
    }
  },
  {
    id: 'valleyOutpost',
    name: 'Valley Outpost',
    latitude: 23.8500,
    longitude: 91.3100,
    riskIndex: 22,
    riskLevel: 'Low',
    population: 1200,
    vulnerablePopulation: 150,
    hazards: {
      flood: 'Low'
    },
    infrastructure: {
      roads: 'Operational',
      power: 'Operational',
      comms: 'Operational'
    }
  },
  {
    id: 'siteC',
    name: 'Safe Site C',
    latitude: 23.8600,
    longitude: 91.2500,
    riskIndex: 5,
    riskLevel: 'Safe',
    population: 0,
    vulnerablePopulation: 0,
    hazards: {},
    infrastructure: {
      roads: 'Operational',
      power: 'Operational',
      comms: 'Operational'
    }
  }
];
