import { useEffect, useState } from 'react';
import { getStoredProviderAccessToken } from '@/shared/models/apiService';

interface PerformanceInsightsViewData {
  accessToken: string | null;
}

export function usePerformanceInsightsViewModel(): {
  data: PerformanceInsightsViewData | null;
  isLoading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<PerformanceInsightsViewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setData({ accessToken: getStoredProviderAccessToken() });
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Unable to load page data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error };
}