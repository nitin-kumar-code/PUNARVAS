import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export interface DestinationAllocation {
  id: string;
  name: string;
  population: number;
}

export interface ResourceRecord {
  id: string;
  name: string;
  category: string;
  unit: string;
  required: number;
  available: number;
  allocated: number;
  priority: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
}

const DEFAULT_POPULATION = 1840;
const DEFAULT_DESTINATIONS: DestinationAllocation[] = [
  { id: 'site-b', name: 'Relocation Site B', population: 920 },
  { id: 'site-d', name: 'Relocation Site D', population: 920 }
];

export function useResourceAllocation() {
  const locationState = useLocation().state as { population?: number, destinations?: DestinationAllocation[] } | null;
  
  const population = locationState?.population || DEFAULT_POPULATION;
  const destinations = locationState?.destinations || DEFAULT_DESTINATIONS;

  // Calculation Assumptions
  const BUS_CAPACITY = 44;
  const KITS_PER_PERSON = 1;
  const SHELTER_PER_PERSON = 1;
  const WATER_PER_PERSON = 3;
  const MEDICAL_RATIO = 230;
  const STAFF_RATIO = 40.88;

  // Calculate requirements dynamically
  const reqBuses = Math.ceil(population / BUS_CAPACITY);
  const reqKits = Math.ceil(population * KITS_PER_PERSON);
  const reqShelter = Math.ceil(population * SHELTER_PER_PERSON);
  const reqWater = Math.ceil(population * WATER_PER_PERSON);
  const reqMedical = Math.ceil(population / MEDICAL_RATIO);
  const reqStaff = Math.ceil(population / STAFF_RATIO);

  // Mock available inventory (slightly off to show shortages/surpluses)
  const [inventory, setInventory] = useState<Record<string, number>>({
    'buses': 48,
    'medical': 10,
    'shelter': 2100,
    'kits': 1600,
    'water': 6000,
    'staff': 38
  });

  const getStatus = (req: number, avail: number) => {
    const gap = avail - req;
    if (gap < 0) return 'SHORTAGE';
    if (gap < req * 0.1) return 'WARNING'; // Less than 10% surplus
    return 'SUFFICIENT';
  };

  const getGap = (req: number, avail: number) => avail - req;

  const resources: ResourceRecord[] = [
    {
      id: 'buses',
      name: 'Buses (50-seater)',
      category: 'Transport',
      unit: 'buses',
      required: reqBuses,
      available: inventory['buses'],
      allocated: Math.min(inventory['buses'], reqBuses),
      priority: 'Critical',
      criticality: 'critical'
    },
    {
      id: 'medical',
      name: 'Medical Teams',
      category: 'Medical',
      unit: 'teams',
      required: reqMedical,
      available: inventory['medical'],
      allocated: Math.min(inventory['medical'], reqMedical),
      priority: 'Critical',
      criticality: 'critical'
    },
    {
      id: 'kits',
      name: 'Relief Kits (Std)',
      category: 'Relief',
      unit: 'kits',
      required: reqKits,
      available: inventory['kits'],
      allocated: Math.min(inventory['kits'], reqKits),
      priority: 'Medium',
      criticality: 'medium'
    },
    {
      id: 'shelter',
      name: 'Shelter Capacity (Pax)',
      category: 'Shelter',
      unit: 'pax',
      required: reqShelter,
      available: inventory['shelter'],
      allocated: Math.min(inventory['shelter'], reqShelter),
      priority: 'Critical',
      criticality: 'critical'
    },
    {
      id: 'water',
      name: 'Potable Water (L)',
      category: 'Water',
      unit: 'L',
      required: reqWater,
      available: inventory['water'],
      allocated: Math.min(inventory['water'], reqWater),
      priority: 'Medium',
      criticality: 'medium'
    },
    {
      id: 'staff',
      name: 'Emergency Staff',
      category: 'Staff',
      unit: 'staff',
      required: reqStaff,
      available: inventory['staff'],
      allocated: Math.min(inventory['staff'], reqStaff),
      priority: 'High',
      criticality: 'high'
    }
  ];

  const destinationAllocations = destinations.map(dest => {
    // For destination allocation, we simply prorate available resources 
    // unless they exceed required, then we prorate required.
    // E.g., if there's a shortage, they share the shortage.
    const proportion = dest.population / population;
    
    return {
      ...dest,
      resources: {
        buses: Math.floor(Math.min(inventory['buses'], reqBuses) * proportion),
        medical: Math.floor(Math.min(inventory['medical'], reqMedical) * proportion),
        kits: Math.floor(Math.min(inventory['kits'], reqKits) * proportion),
        reqKits: Math.ceil(dest.population * KITS_PER_PERSON)
      }
    };
  });

  const requestSupply = (resourceId: string, quantity: number) => {
    // In a real app, this would make an API call
    // For demo, we just magically increase inventory to resolve the shortage
    setInventory(prev => ({
      ...prev,
      [resourceId]: prev[resourceId] + quantity
    }));
  };

  const hasShortages = resources.some(r => getGap(r.required, r.available) < 0);
  const overallStatus = hasShortages 
    ? (resources.some(r => r.criticality === 'critical' && getGap(r.required, r.available) < 0) ? 'NOT READY' : 'READY WITH WARNINGS')
    : 'FULLY READY';

  return {
    population,
    destinations: destinationAllocations,
    resources,
    getStatus,
    getGap,
    requestSupply,
    overallStatus
  };
}
