import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { Layers, Loader2, AlertTriangle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASEURL || 'http://localhost:8000/api/v1';
const IS_DEV = import.meta.env.DEV;

// Known Leaflet workaround for broken default icon paths in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Centralized styles to prevent drift
const RISK_STYLES = {
  CRITICAL: { color: 'red', bgClass: 'bg-red-500 text-white' },
  HIGH: { color: 'orange', bgClass: 'bg-orange-500 text-white' },
  MEDIUM: { color: 'yellow', bgClass: 'bg-yellow-400 text-black' },
  LOW: { color: 'green', bgClass: 'bg-green-500 text-white' }
} as const;

// Types
type RiskLevel = keyof typeof RISK_STYLES;
type SiteStatus = 'ACTIVE' | 'LIMITED' | 'FULL' | 'UNSAFE' | 'UNAVAILABLE';

const createColorIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const ICONS = {
  CRITICAL: createColorIcon(RISK_STYLES.CRITICAL.color),
  HIGH: createColorIcon(RISK_STYLES.HIGH.color),
  MEDIUM: createColorIcon(RISK_STYLES.MEDIUM.color),
  LOW: createColorIcon(RISK_STYLES.LOW.color),
  SITE_SAFE: createColorIcon('#10b981'), // Tailwind Emerald 500
  SITE_RECOMMENDED: new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px #3b82f6; animation: pulse 2s infinite;"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  }),
  SITE_UNSAFE: createColorIcon('#ef4444') // Tailwind Red 500
};

type Habitation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  risk_level: RiskLevel;
  risk_score: number;
  total_population: number;
  vulnerable_population: number;
  primary_hazard: string;
};

type Site = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  overall_safety_score: number;
  status: SiteStatus;
  available_capacity: number;
};

type Hazard = {
  id: string;
  type: string;
  severity: number;
  latitude: number;
  longitude: number;
};

type Allocation = {
  site_id: string;
  population: number;
  percentage: number;
  distance_km: number;
  site_score: number;
};

export type Plan = {
  source_habitation_id: string;
  status: string;
  source_population: number;
  allocated_population: number;
  coverage_percentage: number;
  allocations: Allocation[];
  rejected_sites: {site_id: string; reason: string}[];
};

export default function GisMap({ globalPlan, setGlobalPlan }: { globalPlan: any, setGlobalPlan: (plan: any) => void }) {
  const [habitations, setHabitations] = useState<Habitation[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  
  const plan = globalPlan;
  const setPlan = setGlobalPlan;
  const [loadingPlan, setLoadingPlan] = useState(false);
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [usingDevMock, setUsingDevMock] = useState(false);

  // Filters
  const [showHabitations, setShowHabitations] = useState(true);
  const [showSites, setShowSites] = useState(true);
  const [showHazards, setShowHazards] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        const [habsRes, sitesRes, hazRes] = await Promise.all([
          axios.get(`${API_BASE}/habitations/`, { signal: controller.signal }),
          axios.get(`${API_BASE}/sites/`, { signal: controller.signal }),
          axios.get(`${API_BASE}/hazards/`, { signal: controller.signal })
        ]);
        setHabitations(habsRes.data);
        setSites(sitesRes.data);
        setHazards(hazRes.data);
        setInitialLoading(false);
      } catch (err) {
        if (axios.isCancel(err)) return; // unmount cleanup
        console.error("API failed", err);
        setApiError("Failed to connect to backend mapping service.");
        if (IS_DEV) {
          setUsingDevMock(true);
          loadMockData();
        }
        setInitialLoading(false);
      }
    };
    fetchData();
    
    return () => {
      controller.abort();
    };
  }, []);

  const loadMockData = () => {
    setHabitations([
      {
        id: 'hab-1', name: 'Village A', latitude: 20.0, longitude: 80.0,
        risk_level: 'CRITICAL', risk_score: 91, total_population: 1840,
        vulnerable_population: 312, primary_hazard: 'FLOOD'
      }
    ]);
    setSites([
      { id: 'site-b', name: 'Site B', latitude: 20.1, longitude: 80.1, overall_safety_score: 95, status: 'ACTIVE', available_capacity: 1000 },
      { id: 'site-d', name: 'Site D', latitude: 20.2, longitude: 80.2, overall_safety_score: 90, status: 'ACTIVE', available_capacity: 840 },
      { id: 'site-c', name: 'Site C', latitude: 20.3, longitude: 80.3, overall_safety_score: 20, status: 'UNSAFE', available_capacity: 1000 },
    ]);
    setHazards([
      { id: 'haz-1', type: 'FLOOD', severity: 90, latitude: 20.05, longitude: 80.05 }
    ]);
  };

  const getHabitationIcon = (level: RiskLevel) => {
    return ICONS[level] || ICONS.LOW;
  };

  const getSiteIcon = (site: Site) => {
    if (site.status === 'UNSAFE' || site.status === 'UNAVAILABLE') return ICONS.SITE_UNSAFE;
    if (plan?.allocations.find((a: any) => a.site_id === site.id)) return ICONS.SITE_RECOMMENDED;
    return ICONS.SITE_SAFE;
  };

  const getHazardColor = (type: string) => {
    switch(type.toUpperCase()) {
      case 'FLOOD': return '#3b82f6';
      case 'LANDSLIDE': return '#8b5cf6';
      case 'EARTHQUAKE': return '#f59e0b';
      default: return '#ef4444';
    }
  };

  const handleRecommend = async (habId: string) => {
    setLoadingPlan(true);
    setPlan(null); // Clear previous plan
    try {
      if (usingDevMock) {
        setTimeout(() => {
          setPlan({
            source_habitation_id: habId,
            status: 'FULLY_COVERED',
            source_population: 1840,
            allocated_population: 1840,
            coverage_percentage: 100,
            allocations: [
              { site_id: 'site-b', population: 1000, percentage: 54.3, distance_km: 15.2, site_score: 85 },
              { site_id: 'site-d', population: 840, percentage: 45.7, distance_km: 18.1, site_score: 75 }
            ],
            rejected_sites: [{ site_id: 'site-c', reason: 'Status is UNSAFE' }]
          });
          setLoadingPlan(false);
        }, 500);
        return;
      }

      const res = await axios.post(`${API_BASE}/relocation/recommend`, { habitation_id: habId });
      
      if (res.data.allocations.length === 0) {
        alert("Optimization returned no viable sites for this habitation.");
      }
      setPlan(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate relocation plan");
    } finally {
      setLoadingPlan(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Loading Geographic Data...</h2>
      </div>
    );
  }

  const center: [number, number] = habitations.length > 0 
    ? [habitations[0].latitude, habitations[0].longitude] 
    : [20.5937, 78.9629]; // Default India

  return (
    <div className="relative w-full h-screen font-sans">
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}</style>
      
      {/* Legend & Controls Panel */}
      <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg w-72">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Layers size={20} /> Map Controls
        </h2>
        
        {apiError && !usingDevMock && (
          <div className="mb-4 text-xs bg-red-100 border border-red-400 text-red-700 p-3 rounded flex items-start gap-2 shadow-sm font-bold">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <span>CRITICAL ERROR: {apiError}. Data fetching failed entirely.</span>
          </div>
        )}

        {usingDevMock && (
          <div className="mb-4 text-xs bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded flex flex-col gap-1 shadow-sm font-bold">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>DEV MODE WARNING</span>
            </div>
            <span className="font-normal">Backend unavailable. Using isolated mock data. Do not trust this output.</span>
          </div>
        )}

        <div className="space-y-2 mb-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showHabitations} onChange={e => setShowHabitations(e.target.checked)} className="rounded" />
            <span>Habitations</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showSites} onChange={e => setShowSites(e.target.checked)} className="rounded" />
            <span>Relocation Sites</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showHazards} onChange={e => setShowHazards(e.target.checked)} className="rounded" />
            <span>Hazard Layers</span>
          </label>
        </div>

        <hr className="my-4" />

        <div className="text-sm">
          <h3 className="font-semibold mb-2">Legend</h3>
          
          <div className="space-y-1 mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Risk Levels</p>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div> Critical</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500 border border-white"></div> High</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400 border border-white"></div> Medium</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 border border-white"></div> Low</div>
          </div>
          
          <div className="space-y-1 mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Sites</p>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10b981] border border-white"></div> Safe / Appropriate</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white animate-pulse"></div> Recommended</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div> Unsafe / Rejected</div>
          </div>
        </div>
      </div>

      {plan && plan.status === 'INSUFFICIENT_CAPACITY' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-orange-100 border border-orange-400 text-orange-800 px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 animate-bounce">
          <AlertTriangle size={20} />
          WARNING: INSUFFICIENT SAFE CAPACITY. Only {plan.coverage_percentage}% of population covered!
        </div>
      )}

      {plan && plan.allocations.length === 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-100 border border-red-500 text-red-800 px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 animate-bounce">
          <AlertTriangle size={20} />
          CRITICAL: No viable sites found. Population remains uncovered!
        </div>
      )}

      <MapContainer center={center} zoom={11} className="w-full h-full" zoomControl={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />

        {/* Hazard Layers */}
        {showHazards && hazards.map(h => (
          <Circle
            key={h.id}
            center={[h.latitude, h.longitude]}
            // Note: radius is a placeholder heuristic proxy for display purposes, not true hazard-extent modeling
            radius={h.severity * 50} 
            pathOptions={{ color: getHazardColor(h.type), fillColor: getHazardColor(h.type), fillOpacity: 0.2 }}
          >
            <Popup>
              <strong>{h.type} Hazard</strong><br/>
              Severity: {h.severity}
            </Popup>
          </Circle>
        ))}

        {/* Relocation Route Polylines */}
        {plan && showHabitations && showSites && plan.allocations.map((alloc: any) => {
          const source = habitations.find(h => h.id === plan.source_habitation_id);
          const dest = sites.find(s => s.id === alloc.site_id);
          if (!source || !dest) return null;
          return (
            <Polyline 
              key={`${source.id}-${dest.id}`}
              positions={[[source.latitude, source.longitude], [dest.latitude, dest.longitude]]}
              pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '5, 10' }}
            >
              <Popup>
                <strong>Relocation Route</strong><br/>
                Allocated: {alloc.population} people ({alloc.percentage}%)<br/>
                Distance: {alloc.distance_km} km
              </Popup>
            </Polyline>
          )
        })}

        {/* Sites */}
        {showSites && sites.map(site => {
          const alloc = plan?.allocations.find((a: any) => a.site_id === site.id);
          const rejected = plan?.rejected_sites.find((r: any) => r.site_id === site.id);
          const isRecommended = !!alloc;
          
          return (
            <Marker key={site.id} position={[site.latitude, site.longitude]} icon={getSiteIcon(site)}>
              <Popup>
                <div className="font-sans min-w-[200px]">
                  <h3 className="font-bold text-lg border-b pb-1 mb-2">{site.name}</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{site.status}</span>
                    <span className="text-gray-600">Safety Score:</span>
                    <span className="font-medium">{site.overall_safety_score || 'N/A'}</span>
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">{site.available_capacity}</span>
                  </div>
                  {isRecommended && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 text-blue-800 p-2 rounded text-sm">
                      <div className="font-bold text-base mb-1">✓ Recommended</div>
                      <div>Allocated: <strong>{alloc.population}</strong> people</div>
                      <div>Score: {alloc.site_score}</div>
                    </div>
                  )}
                  {rejected && (
                    <div className="mt-3 bg-red-50 border border-red-200 text-red-800 p-2 rounded text-sm">
                      <div className="font-bold mb-1">✗ Rejected</div>
                      <div className="text-xs">{rejected.reason}</div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Habitations */}
        {showHabitations && habitations.map(hab => {
          const style = RISK_STYLES[hab.risk_level] || RISK_STYLES.LOW;
          
          return (
            <Marker key={hab.id} position={[hab.latitude, hab.longitude]} icon={getHabitationIcon(hab.risk_level)}>
              <Popup>
                <div className="font-sans min-w-[220px]">
                  <h3 className="font-bold text-lg border-b pb-1 mb-2 flex items-center justify-between">
                    {hab.name}
                    <span className={`text-xs px-2 py-1 rounded-full ${style.bgClass}`}>
                      {hab.risk_level}
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm mb-3">
                    <span className="text-gray-600">Risk Score:</span>
                    <span className="font-bold">{hab.risk_score}</span>
                    <span className="text-gray-600">Population:</span>
                    <span>{hab.total_population}</span>
                    <span className="text-gray-600">Vulnerable:</span>
                    <span className="text-red-600 font-medium">{hab.vulnerable_population}</span>
                    <span className="text-gray-600">Primary Hazard:</span>
                    <span>{hab.primary_hazard || 'None'}</span>
                  </div>

                  {plan?.source_habitation_id === hab.id && (
                    <div className="mb-3 p-2 bg-gray-50 border rounded text-sm">
                      <div className="font-bold border-b pb-1 mb-1 text-blue-800">Relocation Plan</div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-semibold text-blue-600">{plan.status}</span>
                        <span className="text-gray-600">Allocated:</span>
                        <span>{plan.allocated_population} / {plan.source_population}</span>
                        <span className="text-gray-600">Coverage:</span>
                        <span>{plan.coverage_percentage}%</span>
                      </div>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => handleRecommend(hab.id)}
                    disabled={loadingPlan}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded text-sm transition disabled:opacity-50"
                  >
                    {loadingPlan ? 'Analyzing...' : 'Generate Relocation Plan'}
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}

      </MapContainer>
    </div>
  );
}
