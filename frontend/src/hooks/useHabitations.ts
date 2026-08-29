import { useState, useEffect } from 'react';
import { fetchApi } from '../api/apiClient';

// Defining backend type internally
interface BackendHabitation {
  id: string;
  name: string;
  district: string;
  primary_hazard: string;
  risk_score: number;
  risk_level: string;
  hazard_component: number;
  exposure_component: number;
  vulnerability_component: number;
  vulnerable_population: number;
  population: number;
  confidence_score: number;
  priority_level: string;
  updated_at: string;
  explanation: string;
}

export interface TriageRecord {
  id: string;
  habitation: string;
  district: string;
  hazard: string;
  riskScore: number;
  riskLevel: string;
  hazardSeverity: number;
  exposureLevel: number;
  vulnerability: number;
  vulnerablePopulation: number;
  population: number;
  confidence: string;
  priority: string;
  assessmentTime: string;
  evidence: string[];
  explanation: string[];
}

export function useHabitations() {
  const [data, setData] = useState<TriageRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    
    const loadData = async () => {
      try {
        setLoading(true);
        // Using limit=2000 to get the full dataset of 1,170 records
        const results = await fetchApi<BackendHabitation[]>('/habitations?limit=2000', {
          signal: controller.signal,
        });
        
        // Map to TriageRecord expected by the frontend
        const mappedData: TriageRecord[] = results.map(r => {
          let conf = 'Medium';
          if (r.confidence_score > 80) conf = 'High';
          else if (r.confidence_score < 50) conf = 'Low';

          return {
            id: r.id,
            habitation: r.name,
            district: r.district,
            hazard: r.primary_hazard,
            riskScore: r.risk_score,
            riskLevel: r.risk_level === 'CRITICAL' ? 'Critical' : r.risk_level === 'HIGH' ? 'High' : r.risk_level === 'MEDIUM' ? 'Medium' : 'Low',
            hazardSeverity: r.hazard_component,
            exposureLevel: r.exposure_component,
            vulnerability: r.vulnerability_component,
            vulnerablePopulation: r.vulnerable_population,
            population: r.population,
            confidence: conf,
            priority: r.risk_level === 'CRITICAL' ? 'P1' : r.risk_level === 'HIGH' ? 'P2' : 'P3',
            assessmentTime: r.updated_at,
            evidence: ['Automated ML Assessment'],
            explanation: [r.explanation]
          };
        });

        setData(mappedData);
        setError(null);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      controller.abort();
    };
  }, []);

  return { data, loading, error };
}
