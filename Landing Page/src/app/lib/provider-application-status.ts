export type ProviderApplicationVerificationStatus =
  | 'pending'
  | 'approved'
  | 'rejected';

export interface ProviderApplicationStatus {
  id: string;
  applicationReference: string;
  businessName: string | null;
  serviceArea: string | null;
  serviceDescription: string | null;
  verificationStatus: ProviderApplicationVerificationStatus;
  latestDecisionReason: string | null;
  latestDecisionAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface ApiResponse<T> {
  data?: T;
  error?: {
    message?: string;
  };
}

export function getProviderApplicationStatus(
  accessToken: string,
): Promise<ProviderApplicationStatus> {
  return fetchProviderApplicationStatusApi<ProviderApplicationStatus>(
    '/api/provider-application/status',
    accessToken,
  );
}

async function fetchProviderApplicationStatusApi<T>(
  path: string,
  accessToken: string,
): Promise<T> {
  const response = await fetch(path, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: 'application/json',
    },
  }).catch(() => null);

  if (!response) {
    throw new Error('Could not reach the provider application service.');
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !payload?.data) {
    throw new Error(
      payload?.error?.message ?? 'Provider application status request failed.',
    );
  }

  return payload.data;
}
