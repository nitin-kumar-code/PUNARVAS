import { useState, useEffect, Fragment } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ChevronDown, Layers, Loader2, AlertTriangle } from 'lucide-react';
import { useMapData } from '../../hooks/useMapData';
import L from 'leaflet';

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

export const RiskMapCard = () => {
  const [layersOpen, setLayersOpen] = useState(false);
  const { habitations, sites, loading, error } = useMapData();
  const center: [number, number] = [30.3, 79.3]; // Centered around Chamoli, Uttarakhand

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
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

      <div className="flex-1 relative z-0">
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

        <MapContainer center={center} zoom={10} className="w-full h-full" zoomControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {!loading && habitations.map((hab) => (
            <Fragment key={hab.id}>
              <Circle
                center={[hab.latitude, hab.longitude]}
                radius={800}
                pathOptions={{
                  fillColor: getRiskColor(hab.risk_level),
                  fillOpacity: 0.2,
                  color: getRiskColor(hab.risk_level),
                  weight: 1,
                  opacity: 0.4
                }}
              />
              <Marker position={[hab.latitude, hab.longitude]}>
                <Popup className="rounded-xl overflow-hidden">
                  <div className="p-1 min-w-[200px]">
                    <h4 className="font-bold text-sm text-punarvas-text mb-1">{hab.name}</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: getRiskColor(hab.risk_level) }} />
                      <span className="text-xs font-semibold text-slate-600">{hab.risk_level} Risk</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Risk Score:</span>
                        <span className="font-semibold text-slate-900">{hab.risk_score}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Population:</span>
                        <span className="font-semibold text-slate-900">{hab.population}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vulnerable:</span>
                        <span className="font-semibold text-punarvas-critical-red">{hab.vulnerable_population ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </Fragment>
          ))}

          {!loading && sites.map((site) => (
            <Fragment key={site.id}>
              <Circle
                center={[site.latitude, site.longitude]}
                radius={1200}
                pathOptions={{
                  fillColor: getRiskColor('Safe'),
                  fillOpacity: 0.2,
                  color: getRiskColor('Safe'),
                  weight: 1,
                  opacity: 0.4
                }}
              />
              <Marker position={[site.latitude, site.longitude]}>
                <Popup className="rounded-xl overflow-hidden">
                  <div className="p-1 min-w-[200px]">
                    <h4 className="font-bold text-sm text-punarvas-text mb-1">{site.name}</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheckIcon className="w-3.5 h-3.5 text-punarvas-safe-green" />
                      <span className="text-xs font-semibold text-slate-600">Safe Site ({site.status})</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Safety Score:</span>
                        <span className="font-semibold text-slate-900">{site.overall_safety_score}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available Cap:</span>
                        <span className="font-semibold text-punarvas-safe-green">{site.available_capacity ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </Fragment>
          ))}
        </MapContainer>
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
              <ShieldCheckIcon className="w-3.5 h-3.5 text-punarvas-safe-green" />
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

// Dummy shield icon for legend since we can't easily import inside mapping
function ShieldCheckIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
