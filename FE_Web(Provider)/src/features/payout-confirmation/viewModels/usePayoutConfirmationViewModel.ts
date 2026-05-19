import { useEffect, useState } from 'react';
import { getStoredProviderAccessToken } from '@/shared/models/apiService';

interface PayoutConfirmationViewData {
  accessToken: string | null;
}

export function usePayoutConfirmationViewModel(): {
  data: PayoutConfirmationViewData | null;
  isLoading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<PayoutConfirmationViewData | null>(null);
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