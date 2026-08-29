export const hazardData = {
  selectedLocation: {
    id: "loc-village-a",
    name: "Village A",
    district: "West Tripura District",
    riskScore: 91,
    population: 1840,
    vulnerablePopulation: 312,
    households: 482,
    exposure: {
      flood: "HIGH",
      landslide: "MODERATE",
      earthquake: "LOW",
      cyclone: "LOW",
    },
    riskDrivers: [
      { name: "Heavy rainfall intensity", contribution: 28 },
      { name: "Flood exposure", contribution: 24 },
      { name: "Vulnerable population", contribution: 18 },
      { name: "Housing vulnerability", contribution: 12 },
      { name: "Poor road accessibility", contribution: 9 },
    ]
  },
  intensitySummary: {
    critical: 8,
    high: 12,
    medium: 14,
    low: 10,
    total: 44
  },
  exposureTrend: {
    dates: ['20 Apr', '23 Apr', '27 Apr', '30 Apr', '04 May', '07 May', '11 May', '14 May', '18 May'],
    critical: [72, 74, 69, 70, 78, 73, 71, 76, 82],
    high: [51, 49, 52, 48, 54, 50, 47, 56, 59],
    medium: [35, 32, 37, 34, 39, 36, 33, 41, 44],
    low: [14, 17, 12, 16, 13, 15, 14, 19, 17]
  },
  recentEvents: [
    {
      id: "ev-1",
      icon: "rain",
      title: "Heavy Rainfall Event",
      description: "Heavy rainfall recorded in West Tripura.",
      time: "18 May, 10:20 AM"
    },
    {
      id: "ev-2",
      icon: "landslide",
      title: "Landslide Alert",
      description: "Landslide risk increased in Hillside B.",
      time: "17 May, 08:15 PM"
    },
    {
      id: "ev-3",
      icon: "flood",
      title: "Flood Risk Increase",
      description: "Water levels rising in secondary basin.",
      time: "16 May, 06:40 PM"
    },
    {
      id: "ev-4",
      icon: "heat",
      title: "Heatwave Advisory",
      description: "Heatwave expected in northern blocks.",
      time: "15 May, 02:10 PM"
    }
  ],
  mapZones: [
    { id: 'zone-1', name: 'Village A', severity: 'Critical', coordinates: [23.84, 91.28], radius: 6000 },
    { id: 'zone-2', name: 'Sector 4', severity: 'High', coordinates: [23.78, 91.35], radius: 4500 },
    { id: 'zone-3', name: 'Hillside B', severity: 'Medium', coordinates: [23.72, 91.22], radius: 3500 },
    { id: 'zone-4', name: 'Site C', severity: 'Low', coordinates: [23.81, 91.45], radius: 4000 }
  ],
  mapMarkers: [
    { id: 'm-1', name: 'Village A', severity: 'Critical', coordinates: [23.84, 91.28] },
    { id: 'm-2', name: 'Sector 4', severity: 'High', coordinates: [23.78, 91.35] },
    { id: 'm-3', name: 'Hillside B', severity: 'Medium', coordinates: [23.72, 91.22] },
    { id: 'm-4', name: 'Valley Outpost', severity: 'Low', coordinates: [23.70, 91.33] },
    { id: 'm-5', name: 'Site C', severity: 'Low', coordinates: [23.81, 91.45] }
  ]
};
