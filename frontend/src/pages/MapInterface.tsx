import React, { useState } from 'react';
import { Filter, Plus } from 'lucide-react';
import { MapControlPanel } from '../components/map/MapControlPanel';
import { GISMap } from '../components/map/GISMap';
import { SelectedLocationPanel } from '../components/map/SelectedLocationPanel';
import { useMapData } from '../hooks/useMapData';
import type { MapHabitation, MapSite } from '../types/api';

import { useLocation, useNavigate } from 'react-router-dom';

export const MapInterface = () => {
  const navigate = useNavigate();
  const { habitations, sites, loading } = useMapData();
  const locationState = useLocation().state as { selectedLocationId?: string } | null;
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(locationState?.selectedLocationId || null);
  
  const [filters, setFilters] = useState({
    baseLayer: {
      populationDensity: true,
    },
    hazards: {
      flood: true,
      earthquake: true,
      landslide: false,
      volcano: false,
      tsunami: false,
      cyclone: false,
      drought: false,
    },
    severity: {
      Critical: true,
      High: true,
      Medium: false,
      Low: false,
      Safe: true, 
    }
  });

  // Find the selected location from either habitations or sites
  const selectedLocation = React.useMemo(() => {
    if (!selectedLocationId) return null;
    const hab = habitations.find(h => h.id === selectedLocationId);
    if (hab) return hab;
    const site = sites.find(s => s.id === selectedLocationId);
    return site || null;
  }, [selectedLocationId, habitations, sites]);

  return (
    <div className="max-w-[1800px] mx-auto w-full h-[calc(100vh-6rem)] flex flex-col pb-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-punarvas-text tracking-tight mb-1">Map Interface</h1>
          <p className="text-punarvas-text-secondary text-sm">GIS-based multi-hazard visualization and operational oversight.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button 
            onClick={() => navigate('/relocation')}
            className="flex items-center gap-2 bg-punarvas-primary-blue text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Generate Plan
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0">
        
        {/* Left Panel - ~25% */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col h-full overflow-hidden">
          <MapControlPanel filters={filters} setFilters={setFilters} />
        </div>

        {/* Right Panel - Map & Selection - ~75% */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-1 rounded-xl overflow-hidden relative">
            <GISMap 
              filters={filters} 
              selectedLocationId={selectedLocationId} 
              onLocationSelect={(loc) => setSelectedLocationId(loc?.id || null)} 
              habitations={habitations}
              sites={sites}
              loading={loading}
            />
          </div>
          
          <div className="shrink-0">
            <SelectedLocationPanel location={selectedLocation} onClose={() => setSelectedLocationId(null)} />
          </div>
        </div>
      </div>
    </div>
  );
};
