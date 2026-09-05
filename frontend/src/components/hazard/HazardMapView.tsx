import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { TriageRecord } from '../../hooks/useHabitations';
// For site markers
import { useMapData } from '../../hooks/useMapData';

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getSeverityColor = (severity: string) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return '#E53935';
    case 'HIGH': return '#FF8A00';
    case 'MEDIUM': return '#F5B700';
    case 'LOW': return '#18A957';
    default: return '#1464E8';
  }
};

const createCustomIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

interface Props {
  habitations: TriageRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const HazardMapView = ({ habitations, selectedId, onSelect }: Props) => {
  // Use mapData to get coordinates for the habitations, since useHabitations doesn't have lat/lng directly
  const { habitations: mapHabs, sites } = useMapData();

  // Combine triage records with map coordinates
  const mergedHabitations = habitations.map(h => {
    const mapMatch = mapHabs.find(m => m.id === h.id);
    return {
      ...h,
      latitude: mapMatch?.latitude || 23.8 + (Math.random() - 0.5) * 0.5,
      longitude: mapMatch?.longitude || 91.3 + (Math.random() - 0.5) * 0.5,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-full flex flex-col relative z-0">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-punarvas-text">Hazard Map View</h3>
        <select className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2 py-1 outline-none">
          <option>Map Controls</option>
          <option>Zoom In</option>
          <option>Zoom Out</option>
        </select>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 min-h-[400px]">
        <MapContainer center={[23.8, 91.3]} zoom={9} className="w-full h-full z-0">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Zones - we use the highest priority habitations to draw big hazard zones for the demo */}
          {mergedHabitations.filter(h => h.riskLevel === 'Critical' || h.riskLevel === 'High').slice(0, 15).map((zone) => (
            <Circle 
              key={`zone-${zone.id}`}
              center={[zone.latitude, zone.longitude]} 
              radius={zone.riskLevel === 'Critical' ? 6000 : 4500}
              pathOptions={{
                color: getSeverityColor(zone.riskLevel),
                fillColor: getSeverityColor(zone.riskLevel),
                fillOpacity: 0.2,
                weight: 1,
                dashArray: '4'
              }}
            />
          ))}

          {/* Markers for top 50 habitations */}
          {mergedHabitations.slice(0, 50).map((marker) => (
            <Marker 
              key={marker.id} 
              position={[marker.latitude, marker.longitude]}
              icon={createCustomIcon(getSeverityColor(marker.riskLevel))}
              eventHandlers={{ click: () => onSelect(marker.id) }}
            >
              <Popup>
                <div className="font-bold">{marker.habitation}</div>
                <div className="text-xs">Severity: {marker.riskLevel}</div>
                <div className="text-xs">Score: {marker.riskScore}</div>
              </Popup>
            </Marker>
          ))}

        </MapContainer>
      </div>

      <div className="mt-4 flex gap-4 items-center flex-wrap justify-center bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-punarvas-critical-red"></div>
          <span className="text-xs font-medium text-slate-600">Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-punarvas-high-orange"></div>
          <span className="text-xs font-medium text-slate-600">High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-punarvas-medium-yellow"></div>
          <span className="text-xs font-medium text-slate-600">Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-punarvas-safe-green"></div>
          <span className="text-xs font-medium text-slate-600">Low</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
          <svg className="w-3.5 h-3.5 text-punarvas-safe-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-xs font-medium text-slate-600">Relocation Sites</span>
        </div>
      </div>

    </div>
  );
};
