import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { hazardData } from '../../data/hazardData';

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'Critical': return '#E53935';
    case 'High': return '#FF8A00';
    case 'Medium': return '#F5B700';
    case 'Low': return '#18A957';
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

export const HazardMapView = () => {
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
        <MapContainer center={[23.78, 91.30]} zoom={11} className="w-full h-full z-0">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Zones */}
          {hazardData.mapZones.map((zone) => (
            <Circle 
              key={zone.id}
              center={zone.coordinates as [number, number]} 
              radius={zone.radius}
              pathOptions={{
                color: getSeverityColor(zone.severity),
                fillColor: getSeverityColor(zone.severity),
                fillOpacity: 0.3,
                weight: 1,
                dashArray: '4'
              }}
            >
              <Tooltip permanent direction="center" className="bg-transparent border-0 text-slate-800 font-bold shadow-none text-sm bg-white/70 px-2 py-0.5 rounded-full">
                {zone.name}
              </Tooltip>
            </Circle>
          ))}

          {/* Markers */}
          {hazardData.mapMarkers.map((marker) => (
            <Marker 
              key={marker.id} 
              position={marker.coordinates as [number, number]}
              icon={createCustomIcon(getSeverityColor(marker.severity))}
            >
              <Popup>
                <div className="font-bold">{marker.name}</div>
                <div className="text-xs">Severity: {marker.severity}</div>
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
