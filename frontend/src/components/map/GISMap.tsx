import React, { Fragment } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { mapLocations } from '../../data/mapData';
import type { MapLocation } from '../../data/mapData';
import L from 'leaflet';

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

const icons = {
  Critical: createCustomIcon('#E53935'),
  High: createCustomIcon('#FF8A00'),
  Medium: createCustomIcon('#F5B700'),
  Low: createCustomIcon('#18A957'),
  Safe: createCustomIcon('#18A957'),
};

interface GISMapProps {
  filters: any;
  onLocationSelect: (location: MapLocation | null) => void;
  selectedLocationId: string | null;
}

export const GISMap = ({ filters, onLocationSelect, selectedLocationId }: GISMapProps) => {
  const center: [number, number] = [23.82, 91.28]; // Centered around Agartala

  // Define realistic hazard overlays
  const hazardOverlays = [
    {
      type: 'flood',
      visible: filters.hazards.flood,
      elements: [
        <Polyline key="f1" positions={[[23.85, 91.22], [23.83, 91.28], [23.80, 91.35]]} color="#3b82f6" weight={40} opacity={0.3} />
      ]
    },
    {
      type: 'earthquake',
      visible: filters.hazards.earthquake,
      elements: [
        <Polyline key="e1" positions={[[23.90, 91.20], [23.75, 91.30]]} color="#ef4444" weight={3} dashArray="10, 10" />
      ]
    },
    {
      type: 'landslide',
      visible: filters.hazards.landslide,
      elements: [
        <Circle key="l1" center={[23.79, 91.32]} radius={3000} pathOptions={{ fillColor: '#f97316', fillOpacity: 0.3, color: 'transparent' }} />
      ]
    }
  ];

  const filteredLocations = React.useMemo(() => {
    return mapLocations.filter(loc => filters.severity[loc.riskLevel] !== false);
  }, [filters.severity]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full relative z-0">
      <MapContainer center={center} zoom={11} className="w-full h-full" zoomControl={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomControl position="bottomright" />
        
        {/* Render active hazard overlays */}
        {hazardOverlays.map(h => h.visible && h.elements)}
        
        {/* Render Locations based on severity filter */}
        {filteredLocations.map((loc) => (
          <Fragment key={loc.id}>
            {/* Base layer population density representation */}
            {filters.baseLayer.populationDensity && (
              <Circle
                center={[loc.latitude, loc.longitude]}
                radius={Math.sqrt(loc.population) * 10}
                pathOptions={{
                  fillColor: loc.riskLevel === 'Critical' ? '#E53935' : loc.riskLevel === 'High' ? '#FF8A00' : '#F5B700',
                  fillOpacity: 0.15,
                  color: loc.riskLevel === 'Critical' ? '#E53935' : loc.riskLevel === 'High' ? '#FF8A00' : '#F5B700',
                  weight: 1,
                  dashArray: "4,4"
                }}
              />
            )}
            
            <Marker 
              position={[loc.latitude, loc.longitude]} 
              icon={icons[loc.riskLevel]}
              eventHandlers={{
                click: () => onLocationSelect(loc),
              }}
            >
              {/* Using a label/tooltip to show the name permanently next to the marker */}
              <Popup className="custom-popup" closeButton={false}>
                <div className="font-semibold text-xs text-slate-800">{loc.name}</div>
              </Popup>
            </Marker>
          </Fragment>
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
