import { useCallback, useMemo, useState } from 'react';
import {
  ApiOptions,
  ReferralSummary,
} from '../../../shared/models/types';
import {
  getReferralSummary,
} from '../../../shared/models/apiService';
import { formatMoney } from '../../../shared/utils/booking';

export function useCustomerReferralViewModel({
  apiOptions,
  referralSummary,
  onReferralSummaryLoaded,
  onNotice,
  readError,
}: {
  apiOptions: ApiOptions;
  referralSummary: ReferralSummary | null;
  onReferralSummaryLoaded: (summary: ReferralSummary) => void;
  onNotice: (notice: string) => void;
  readError: (error: unknown) => string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshReferralSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const nextReferralSummary = await getReferralSummary(apiOptions);
      onReferralSummaryLoaded(nextReferralSummary);
      onNotice('Referral summary refreshed.');
    } catch (caughtError) {
      const message = readError(caughtError);
      setError(message);
      onNotice(message);
    } finally {
      setIsLoading(false);
    }
  }, [apiOptions, onNotice, onReferralSummaryLoaded, readError]);

  const data = useMemo(
    () => ({
      referralCode: referralSummary?.referralCode ?? 'Loading',
      completedReferrals: `${referralSummary?.completedReferrals ?? 0}`,
      pendingReferrals: `${referralSummary?.pendingReferrals ?? 0}`,
      totalRewards: formatMoney(referralSummary?.totalRewards ?? 0),
    }),
    [referralSummary],
  );

  return {
    data,
    isLoading,
    error,
    refreshReferralSummary,
  };
}
