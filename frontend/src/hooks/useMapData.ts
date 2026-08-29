import { useState, useEffect } from 'react';
import { fetchApi } from '../api/apiClient';
import type { MapHabitation, MapSite } from '../types/api';

export function useMapData() {
  const [habitations, setHabitations] = useState<MapHabitation[]>([]);
  const [sites, setSites] = useState<MapSite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    
    const loadData = async () => {
      try {
        setLoading(true);
        // Using Promise.all to fetch both in parallel, with larger limits since it's map data
        const [habData, siteData] = await Promise.all([
          fetchApi<MapHabitation[]>('/map/habitations', { signal: controller.signal }),
          fetchApi<MapSite[]>('/map/sites', { signal: controller.signal })
        ]);
        
        setHabitations(habData);
        setSites(siteData);
        setError(null);
        setLoading(false);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      controller.abort();
    };
  }, []);

  return { habitations, sites, loading, error };
}
