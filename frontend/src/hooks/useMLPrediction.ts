import { useState, useEffect } from 'react';
import { fetchApi } from '../api/apiClient';

export interface MLPrediction {
  habitation_id: string;
  village_name: string;
  baseline_risk: number;
  dynamic_risk: number;
  risk_delta: number;
  trend: string;
  flood_probability: number;
  landslide_probability: number;
  flood_risk: string;
  landslide_risk: string;
  dynamic_triage_level: string;
  active_alerts: string[];
}

export function useMLPrediction(habitationId: string | null, simulate: boolean = false, simRainfall?: number, simRiver?: number) {
  const [prediction, setPrediction] = useState<MLPrediction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!habitationId) {
      setPrediction(null);
      return;
    }

    const controller = new AbortController();
    
    const loadPrediction = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = `/ml-risk/${habitationId}`;
        const params = new URLSearchParams();
        if (simulate) {
          params.append('simulate', 'true');
          if (simRainfall !== undefined) params.append('sim_rainfall', simRainfall.toString());
          if (simRiver !== undefined) params.append('sim_river', simRiver.toString());
        }
        
        const qs = params.toString();
        if (qs) url += `?${qs}`;

        const data = await fetchApi<MLPrediction>(url, {
          signal: controller.signal,
        });
        
        setPrediction(data);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPrediction();

    return () => controller.abort();
  }, [habitationId, simulate, simRainfall, simRiver]);

  return { prediction, loading, error };
}
