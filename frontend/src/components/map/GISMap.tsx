import React, { Fragment, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import type { MapHabitation, MapSite } from '../../types/api';
import L from 'leaflet';
import { Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
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
    case 'CRITICAL': return '#E53935'; // punarvas-critical-red
    case 'HIGH': return '#FF8A00'; // punarvas-high-orange
    case 'MEDIUM': return '#F5B700'; // punarvas-medium-yellow
    case 'LOW': return '#18A957'; // punarvas-safe-green
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

// Create custom icons based on risk level
const createCustomIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-icon',
    html: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C12 21.5 20.5 15.5 20.5 9.5C20.5 4.80558 16.6944 1 12 1C7.30558 1 3.5 4.80558 3.5 9.5C3.5 15.5 12 21.5 12 21.5Z" fill="white" stroke="${color}" stroke-width="2"/>
        <circle cx="12" cy="9.5" r="3.5" fill="${color}"/>
      </svg>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
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

interface GISMapProps {
  filters: any;
  onLocationSelect: (location: MapHabitation | MapSite | null) => void;
  selectedLocationId: string | null;
  habitations: MapHabitation[];
  sites: MapSite[];
  loading?: boolean;
}

const MapUpdater = ({ bounds }: { bounds: L.LatLngBounds | null }) => {
  const map = useMap();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      if (bounds && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
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

export const GISMap = ({ filters, onLocationSelect, selectedLocationId, habitations, sites, loading }: GISMapProps) => {
  const [zoomLevel, setZoomLevel] = useState<number>(10);
  
  const mapSeverity = (level: string) => {
    if (level === 'CRITICAL') return 'Critical';
    if (level === 'HIGH') return 'High';
    if (level === 'MEDIUM') return 'Medium';
    if (level === 'LOW') return 'Low';
    return 'Low';
  };

  const filteredHabitations = React.useMemo(() => {
    return habitations.filter(loc => filters.severity[mapSeverity(loc.risk_level)] !== false);
  }, [filters.severity, habitations]);

  const filteredSites = React.useMemo(() => {
    return filters.severity['Safe'] !== false ? sites : [];
  }, [filters.severity, sites]);

  const bounds = React.useMemo(() => {
    const coords: [number, number][] = [];
    filteredHabitations.forEach(h => {
      if (h.latitude && h.longitude && !isNaN(h.latitude) && !isNaN(h.longitude)) {
        coords.push([h.latitude, h.longitude]);
      }
    });
    filteredSites.forEach(s => {
      if (s.latitude && s.longitude && !isNaN(s.latitude) && !isNaN(s.longitude)) {
        coords.push([s.latitude, s.longitude]);
      }
    });
    if (coords.length === 0) return null;
    return L.latLngBounds(coords);
  }, [filteredHabitations, filteredSites]);

  const hasData = bounds !== null;

  // Grid processing for low zoom
  const riskSurface = React.useMemo(() => {
    const grid = new Map<string, { lat: number, lng: number, count: number, maxScore: number }>();
    filteredHabitations.forEach(hab => {
      const rLat = Math.round(hab.latitude * 20) / 20; // roughly 5km grouping
      const rLng = Math.round(hab.longitude * 20) / 20;
      const key = `${rLat}-${rLng}`;
      const existing = grid.get(key) || { lat: rLat, lng: rLng, count: 0, maxScore: 0 };
      existing.count++;
      existing.maxScore = Math.max(existing.maxScore, hab.risk_score || 0);
      grid.set(key, existing);
    });
    return Array.from(grid.values());
  }, [filteredHabitations]);

  const isLowZoom = zoomLevel < 11;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full relative z-0 min-h-[400px]">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
          <Loader2 className="w-8 h-8 animate-spin text-punarvas-primary-blue" />
        </div>
      )}

      {!loading && !hasData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center text-slate-500 bg-white p-4 rounded shadow-lg border border-slate-200">
            <AlertTriangle className="w-8 h-8 mb-2" />
            <p className="font-medium">No geographic data available for current filters</p>
          </div>
        </div>
      )}

      {hasData && (
        <MapContainer 
          bounds={bounds} 
          className="w-full h-full absolute inset-0" 
          zoomControl={false}
          maxZoom={18}
        >
          <MapUpdater bounds={bounds} />
          <MapZoomListener onZoomChange={setZoomLevel} />
          <TileLayer
            url={MAP_CONFIG.tileUrl}
            attribution={MAP_CONFIG.attribution}
          />
          <ZoomControl position="bottomright" />
          
          {/* Low Zoom: Aggregated Risk Surface */}
          {isLowZoom && riskSurface.map(cell => (
            <Circle
              key={`surface-${cell.lat}-${cell.lng}`}
              center={[cell.lat, cell.lng]}
              radius={4000} // ~4km radius to fill grid visually
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
              {filteredHabitations.map((loc) => {
                if (!loc.latitude || !loc.longitude || isNaN(loc.latitude) || isNaN(loc.longitude)) return null;
                return (
                  <Marker 
                    key={loc.id}
                    position={[loc.latitude, loc.longitude]} 
                    icon={getIconForLevel(loc.risk_level)}
                    eventHandlers={{
                      click: () => onLocationSelect(loc),
                    }}
                  >
                    <Popup className="custom-popup rounded-xl">
                      <div className="p-1 min-w-[220px]">
                        <h4 className="font-bold text-sm text-punarvas-text mb-1">{loc.village_name || loc.name}</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: getRiskColor(loc.risk_level) }} />
                          <span className="text-xs font-semibold text-slate-600">{loc.risk_level} Risk • {loc.triage_level || 'Pending'}</span>
                        </div>
                        <div className="space-y-1.5 text-xs text-slate-600 border-b border-slate-100 pb-2 mb-2">
                          <div className="flex justify-between">
                            <span>Risk Score:</span>
                            <span className="font-semibold text-slate-900">{loc.risk_score}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Population:</span>
                            <span className="font-semibold text-slate-900">{loc.population}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Confidence:</span>
                            <span className="font-semibold text-slate-500">{loc.confidence_score ? `${loc.confidence_score}%` : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-xs text-slate-600">
                          <div className="flex justify-between">
                            <span>Hazard:</span>
                            <span className="font-medium">{loc.hazard_component || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Exposure:</span>
                            <span className="font-medium">{loc.exposure_component || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Vulnerability:</span>
                            <span className="font-medium">{loc.vulnerability_component || 'N/A'}</span>
                          </div>
                        </div>
                        {loc.explanation && (
                          <div className="mt-2 text-[10px] text-slate-500 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                            "{loc.explanation}"
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          )}

          {/* Render Sites independent of clusters so they are always visible */}
          {filteredSites.map((site) => {
            if (!site.latitude || !site.longitude || isNaN(site.latitude) || isNaN(site.longitude)) return null;
            // Status-based styling
            const isSafe = site.status.toLowerCase() === 'approved' || site.status.toLowerCase() === 'active';
            const siteColor = isSafe ? '#18A957' : '#E53935'; // Green for approved/active, red for rejected/unsafe
            
            return (
              <Marker 
                key={site.id}
                position={[site.latitude, site.longitude]} 
                icon={createCustomIcon(siteColor)}
                eventHandlers={{
                  click: () => onLocationSelect(site),
                }}
              >
                <Popup className="custom-popup rounded-xl">
                  <div className="p-1 min-w-[220px]">
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
                      <div className="flex justify-between">
                        <span>Hazard Score:</span>
                        <span className="font-medium">{site.hazard_score || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk Score:</span>
                        <span className="font-medium">{site.site_risk_score || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tier:</span>
                        <span className="font-medium">{site.site_tier || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="font-semibold text-slate-500">{site.confidence_score ? `${site.confidence_score}%` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      )}

      {/* Map Legend (Floating) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-slate-200 shadow-lg rounded-full px-5 py-2 z-[1000] flex gap-5">
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
