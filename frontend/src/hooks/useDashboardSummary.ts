import { useState, useEffect } from 'react';
import { fetchApi } from '../api/apiClient';
import type { DashboardSummary } from '../types/api';

export function useDashboardSummary() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchApi<DashboardSummary>('/dashboard/summary', {
          signal: controller.signal,
        });
        setData(result);
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
  }, []); // Run once on mount

  return { data, loading, error };
}
