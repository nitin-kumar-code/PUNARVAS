import { useState, useEffect, Fragment, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { ChevronDown, Layers, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useMapData } from '../../hooks/useMapData';
import L from 'leaflet';
import { MAP_CONFIG } from '../../config/mapConfig';

// Fix Leaflet default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getRiskColor = (level: string) => {
  switch (level) {
    case 'CRITICAL': return '#E53935';
    case 'HIGH': return '#FF8A00';
    case 'MEDIUM': return '#F5B700';
    case 'LOW': return '#18A957';
    case 'Safe': return '#18A957';
    default: return '#1464E8';
  }
};

const getRiskLevelFromScore = (score: number) => {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
};

const createCustomIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-icon',
    html: `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C12 21.5 20.5 15.5 20.5 9.5C20.5 4.80558 16.6944 1 12 1C7.30558 1 3.5 4.80558 3.5 9.5C3.5 15.5 12 21.5 12 21.5Z" fill="white" stroke="${color}" stroke-width="2"/>
        <circle cx="12" cy="9.5" r="3.5" fill="${color}"/>
      </svg>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -20],
  });
};

const icons: Record<string, L.DivIcon> = {
  CRITICAL: createCustomIcon('#E53935'),
  HIGH: createCustomIcon('#FF8A00'),
  MEDIUM: createCustomIcon('#F5B700'),
  LOW: createCustomIcon('#18A957'),
  Safe: createCustomIcon('#18A957'),
};

const getIconForLevel = (level: string) => icons[level] || icons['LOW'];

const MapUpdater = ({ bounds }: { bounds: L.LatLngBounds | null }) => {
  const map = useMap();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      if (bounds && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [map, bounds]);
  
  return null;
};

const MapZoomListener = ({ onZoomChange }: { onZoomChange: (z: number) => void }) => {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });
  
  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);
  
  return null;
};

export const RiskMapCard = () => {
  const [layersOpen, setLayersOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(10);
  const { habitations, sites, loading, error } = useMapData();

  const bounds = useMemo(() => {
    const coords: [number, number][] = [];
    if (habitations) {
      habitations.forEach(h => {
        if (h.latitude && h.longitude && !isNaN(h.latitude) && !isNaN(h.longitude)) {
          coords.push([h.latitude, h.longitude]);
        }
      });
    }
    if (sites) {
      sites.forEach(s => {
        if (s.latitude && s.longitude && !isNaN(s.latitude) && !isNaN(s.longitude)) {
          coords.push([s.latitude, s.longitude]);
        }
      });
    }
    if (coords.length === 0) return null;
    return L.latLngBounds(coords);
  }, [habitations, sites]);

  const hasData = bounds !== null;

  const riskSurface = useMemo(() => {
    const grid = new Map<string, { lat: number, lng: number, count: number, maxScore: number }>();
    if (!habitations) return [];
    habitations.forEach(hab => {
      const rLat = Math.round(hab.latitude * 20) / 20; 
      const rLng = Math.round(hab.longitude * 20) / 20;
      const key = `${rLat}-${rLng}`;
      const existing = grid.get(key) || { lat: rLat, lng: rLng, count: 0, maxScore: 0 };
      existing.count++;
      existing.maxScore = Math.max(existing.maxScore, hab.risk_score || 0);
      grid.set(key, existing);
    });
    return Array.from(grid.values());
  }, [habitations]);

  const isLowZoom = zoomLevel < 10;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between z-10 bg-white">
        <h3 className="font-bold text-punarvas-text text-lg">Risk Map Overview</h3>
        <div className="relative">
          <button 
            onClick={() => setLayersOpen(!layersOpen)}
            className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Map Layers
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          
          {layersOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50">
              {['Hazard Zones', 'Vulnerable Population', 'Infrastructure', 'Safe Relocation Sites'].map(layer => (
                <label key={layer} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-punarvas-primary-blue focus:ring-punarvas-primary-blue" />
                  <span className="text-sm text-slate-700">{layer}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative z-0 w-full h-full min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80">
            <Loader2 className="w-8 h-8 animate-spin text-punarvas-primary-blue" />
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80">
            <div className="flex flex-col items-center text-red-500 bg-white p-4 rounded shadow-lg border border-red-100">
              <AlertTriangle className="w-8 h-8 mb-2" />
              <p className="font-medium">Failed to load map data</p>
            </div>
          </div>
        )}

        {!loading && !hasData && !error && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80">
            <div className="flex flex-col items-center text-slate-500 bg-white p-4 rounded shadow-lg border border-slate-200">
              <AlertTriangle className="w-8 h-8 mb-2" />
              <p className="font-medium">No geographic data available</p>
            </div>
          </div>
        )}

        {hasData && (
          <MapContainer 
            bounds={bounds} 
            className="w-full h-full absolute inset-0" 
            zoomControl={false}
          >
            <MapUpdater bounds={bounds} />
            <MapZoomListener onZoomChange={setZoomLevel} />
            <TileLayer
              url={MAP_CONFIG.tileUrl}
              attribution={MAP_CONFIG.attribution}
            />
            
            {isLowZoom && riskSurface.map(cell => (
              <Circle
                key={`surface-${cell.lat}-${cell.lng}`}
                center={[cell.lat, cell.lng]}
                radius={4000}
                pathOptions={{
                  fillColor: getRiskColor(getRiskLevelFromScore(cell.maxScore)),
                  fillOpacity: 0.35,
                  color: 'transparent'
                }}
              >
                <Popup className="custom-popup rounded-xl">
                  <div className="p-2 min-w-[150px]">
                    <h4 className="font-bold text-sm text-punarvas-text mb-1">Model-Derived Risk Surface</h4>
                    <div className="text-xs text-slate-600 mb-2">Aggregated Risk Zone</div>
                    <div className="flex justify-between text-xs">
                      <span>Habitations:</span>
                      <span className="font-semibold text-slate-900">{cell.count}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Max Risk Score:</span>
                      <span className="font-semibold text-punarvas-critical-red">{cell.maxScore}</span>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}

            {!isLowZoom && (
              <MarkerClusterGroup disableClusteringAtZoom={14} maxClusterRadius={60} chunkedLoading={true}>
                {habitations.map((hab) => {
                  if (!hab.latitude || !hab.longitude || isNaN(hab.latitude) || isNaN(hab.longitude)) return null;
                  return (
                    <Marker 
                      key={hab.id} 
                      position={[hab.latitude, hab.longitude]}
                      icon={getIconForLevel(hab.risk_level)}
                    >
                      <Popup className="rounded-xl overflow-hidden">
                        <div className="p-1 min-w-[200px]">
                          <h4 className="font-bold text-sm text-punarvas-text mb-1">{hab.village_name || hab.name}</h4>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: getRiskColor(hab.risk_level) }} />
                            <span className="text-xs font-semibold text-slate-600">{hab.risk_level} Risk • {hab.triage_level || 'Pending'}</span>
                          </div>
                          <div className="space-y-1.5 text-xs text-slate-600 border-b border-slate-100 pb-2 mb-2">
                            <div className="flex justify-between">
                              <span>Risk Score:</span>
                              <span className="font-semibold text-slate-900">{hab.risk_score}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Population:</span>
                              <span className="font-semibold text-slate-900">{hab.population}</span>
                            </div>
                          </div>
                          <div className="space-y-1.5 text-xs text-slate-600">
                            <div className="flex justify-between">
                              <span>Hazard:</span>
                              <span className="font-medium">{hab.hazard_component || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Vulnerability:</span>
                              <span className="font-medium">{hab.vulnerability_component || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MarkerClusterGroup>
            )}

            {sites.map((site) => {
              if (!site.latitude || !site.longitude || isNaN(site.latitude) || isNaN(site.longitude)) return null;
              const isSafe = site.status.toLowerCase() === 'approved' || site.status.toLowerCase() === 'active';
              const siteColor = isSafe ? '#18A957' : '#E53935';
              return (
                <Marker 
                  key={site.id} 
                  position={[site.latitude, site.longitude]}
                  icon={createCustomIcon(siteColor)}
                >
                  <Popup className="rounded-xl overflow-hidden">
                    <div className="p-1 min-w-[200px]">
                      <h4 className="font-bold text-sm text-punarvas-text mb-1">{site.site_name || site.name}</h4>
                      <div className="flex items-center gap-2 mb-3">
                        {isSafe ? <ShieldCheck className="w-3.5 h-3.5 text-punarvas-safe-green" /> : <AlertTriangle className="w-3.5 h-3.5 text-punarvas-critical-red" />}
                        <span className="text-xs font-semibold text-slate-600">Safe Site ({site.status})</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span>Capacity:</span>
                          <span className="font-semibold text-slate-900">{site.available_capacity || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Safety Score:</span>
                          <span className="font-semibold text-slate-900">{site.site_safety_score || site.overall_safety_score || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      <div className="h-12 border-t border-slate-100 flex items-center justify-center gap-6 bg-white z-10 px-4">
        {[
          { label: 'Critical Risk', color: 'bg-punarvas-critical-red' },
          { label: 'High Risk', color: 'bg-punarvas-high-orange' },
          { label: 'Medium Risk', color: 'bg-punarvas-medium-yellow' },
          { label: 'Low Risk', color: 'bg-punarvas-safe-green' },
          { label: 'Safe Site', color: 'bg-punarvas-safe-green', icon: true },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            {item.icon ? (
              <ShieldCheck className="w-3.5 h-3.5 text-punarvas-safe-green" />
            ) : (
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
            )}
            <span className="text-xs font-medium text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
