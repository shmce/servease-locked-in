export interface ReferralSummary {
  referralCode: string;
  referralLinkPath: string;
  completedReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: {
    message?: string;
  };
}

export function getReferralSummary(
  accessToken: string,
): Promise<ReferralSummary> {
  return fetchReferralApi<ReferralSummary>('/api/referrals', {
    accessToken,
  });
}

async function fetchReferralApi<T>(
  path: string,
  options: {
    accessToken: string;
  },
): Promise<T> {
  const response = await fetch(path, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${options.accessToken}`,
      accept: 'application/json',
    },
  }).catch(() => null);

  if (!response) {
    throw new Error('Could not reach referrals. Please try again.');
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error?.message ?? 'Referral request failed.');
  }

  return payload.data;
}
