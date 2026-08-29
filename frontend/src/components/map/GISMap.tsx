import React, { Fragment } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapHabitation, MapSite } from '../../types/api';
import L from 'leaflet';
import { Loader2 } from 'lucide-react';

// Fix Leaflet default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

export const GISMap = ({ filters, onLocationSelect, selectedLocationId, habitations, sites, loading }: GISMapProps) => {
  const center: [number, number] = [30.3, 79.3]; // Centered around Chamoli

  // Define realistic hazard overlays
  const hazardOverlays = [
    {
      type: 'flood',
      visible: filters.hazards.flood,
      elements: [
        <Polyline key="f1" positions={[[30.4, 79.2], [30.35, 79.25], [30.2, 79.4]]} color="#3b82f6" weight={40} opacity={0.3} />
      ]
    },
    {
      type: 'earthquake',
      visible: filters.hazards.earthquake,
      elements: [
        <Polyline key="e1" positions={[[30.5, 79.1], [30.1, 79.5]]} color="#ef4444" weight={3} dashArray="10, 10" />
      ]
    },
    {
      type: 'landslide',
      visible: filters.hazards.landslide,
      elements: [
        <Circle key="l1" center={[30.35, 79.35]} radius={3000} pathOptions={{ fillColor: '#f97316', fillOpacity: 0.3, color: 'transparent' }} />
      ]
    }
  ];

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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full relative z-0">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
          <Loader2 className="w-8 h-8 animate-spin text-punarvas-primary-blue" />
        </div>
      )}
      <MapContainer center={center} zoom={10} className="w-full h-full" zoomControl={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomControl position="bottomright" />
        
        {/* Render active hazard overlays */}
        {hazardOverlays.map(h => h.visible && h.elements)}
        
        {/* Render Habitations based on severity filter */}
        {!loading && filteredHabitations.map((loc) => (
          <Fragment key={loc.id}>
            {/* Base layer population density representation */}
            {filters.baseLayer.populationDensity && (
              <Circle
                center={[loc.latitude, loc.longitude]}
                radius={Math.sqrt(loc.population) * 10}
                pathOptions={{
                  fillColor: loc.risk_level === 'CRITICAL' ? '#E53935' : loc.risk_level === 'HIGH' ? '#FF8A00' : '#F5B700',
                  fillOpacity: 0.15,
                  color: loc.risk_level === 'CRITICAL' ? '#E53935' : loc.risk_level === 'HIGH' ? '#FF8A00' : '#F5B700',
                  weight: 1,
                  dashArray: "4,4"
                }}
              />
            )}
            
            <Marker 
              position={[loc.latitude, loc.longitude]} 
              icon={getIconForLevel(loc.risk_level)}
              eventHandlers={{
                click: () => onLocationSelect(loc),
              }}
            >
              <Popup className="custom-popup" closeButton={false}>
                <div className="font-semibold text-xs text-slate-800">{loc.name}</div>
              </Popup>
            </Marker>
          </Fragment>
        ))}

        {/* Render Sites */}
        {!loading && filteredSites.map((site) => (
          <Marker 
            key={site.id}
            position={[site.latitude, site.longitude]} 
            icon={getIconForLevel('Safe')}
            eventHandlers={{
              click: () => onLocationSelect(site),
            }}
          >
            <Popup className="custom-popup" closeButton={false}>
              <div className="font-semibold text-xs text-slate-800">{site.name}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend (Floating) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-slate-200 shadow-lg rounded-full px-5 py-2 z-[1000] flex gap-5">
        {[
          { label: 'Critical Risk', color: 'bg-punarvas-critical-red' },
          { label: 'High Risk', color: 'bg-punarvas-high-orange' },
          { label: 'Medium Risk', color: 'bg-punarvas-medium-yellow' },
          { label: 'Low Risk', color: 'bg-punarvas-safe-green' },
          { label: 'Safe Site', color: 'bg-punarvas-safe-green', icon: true },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            {item.icon ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-punarvas-safe-green"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
            ) : (
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
            )}
            <span className="text-[10px] font-semibold text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
