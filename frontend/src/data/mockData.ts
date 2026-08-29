// TODO: This file is currently retained because CriticalAlerts.tsx still depends on it. 
// Once CriticalAlerts is migrated to backend data, this file should be removed. 

import type { Habitation, Alert, KPIStats } from '../types';

export const kpiStats: KPIStats = {
  atRiskHabitations: 24,
  criticalZones: 8,
  immediateRelocation: 312,
  vulnerablePopulation: 1284,
  safeRelocationCapacity: 1650,
};

// Coordinates are just mock locations for a map
export const habitations: Habitation[] = [
  {
    id: 'h1',
    name: 'Village A',
    riskIndex: 98.5,
    population: 450,
    vulnerablePopulation: 120,
    priority: 'P1',
    status: 'Pending',
    riskLevel: 'Critical',
    coordinates: [27.7172, 85.3240], // Example coordinate
  },
  {
    id: 'h2',
    name: 'Sector 4',
    riskIndex: 82.1,
    population: 1200,
    vulnerablePopulation: 340,
    priority: 'P2',
    status: 'Routing',
    riskLevel: 'High',
    coordinates: [27.7120, 85.3340],
  },
  {
    id: 'h3',
    name: 'Hillside B',
    riskIndex: 75.0,
    population: 210,
    vulnerablePopulation: 45,
    priority: 'P2',
    status: 'Routing',
    riskLevel: 'High',
    coordinates: [27.7050, 85.3150],
  },
  {
    id: 'h4',
    name: 'Site C',
    riskIndex: 60.0,
    population: 850,
    vulnerablePopulation: 150,
    priority: 'P3',
    status: 'Monitored',
    riskLevel: 'Medium',
    coordinates: [27.7250, 85.3400],
  },
  {
    id: 'h5',
    name: 'Valley Outpost',
    riskIndex: 45.2,
    population: 80,
    vulnerablePopulation: 12,
    priority: 'P3',
    status: 'Monitored',
    riskLevel: 'Low',
    coordinates: [27.6950, 85.3300],
  },
  {
    id: 'h6',
    name: 'Relocation Camp Alpha',
    riskIndex: 12.0,
    population: 0,
    vulnerablePopulation: 0,
    priority: 'P3',
    status: 'Monitored',
    riskLevel: 'Safe',
    coordinates: [27.7100, 85.3500],
  }
];

export const alerts: Alert[] = [
  {
    id: 'a1',
    title: 'Village A: Critical landslide risk',
    timeAgo: '10 min ago',
    vulnerablePeople: 312,
    riskLevel: 'Critical',
    type: 'landslide',
  },
  {
    id: 'a2',
    title: 'Sector 4: Rising flood risk',
    timeAgo: '1 hr ago',
    vulnerablePeople: 340,
    riskLevel: 'High',
    type: 'flood',
  },
  {
    id: 'a3',
    title: 'Site C: Destination marked unsafe',
    timeAgo: '3 hr ago',
    vulnerablePeople: 0,
    riskLevel: 'Medium',
    type: 'safe_site',
  }
];

export const riskDistribution = [
  { level: 'Critical', count: 8, color: 'bg-red-600' },
  { level: 'High', count: 10, color: 'bg-orange-500' },
  { level: 'Medium', count: 6, color: 'bg-yellow-400' },
  { level: 'Low', count: 12, color: 'bg-green-600' },
];
