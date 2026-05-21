export type UserRole = 'customer' | 'provider' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'inactive';

export interface CurrentUserIdentity {
  id: string;
  email: string;
  fullName: string | null;
  contactNumber: string | null;
  role: UserRole;
  status: UserStatus;
}

export interface CustomerProfileSummary {
  id: string;
  address: string | null;
}

export interface ProviderProfileSummary {
  id: string;
  businessName: string | null;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  averageRating: number;
  reviewCount: number;
}

export interface CurrentUserProfile {
  user: CurrentUserIdentity;
  customerProfile: CustomerProfileSummary | null;
  providerProfile: ProviderProfileSummary | null;
}

export interface UpdateCurrentUserProfileInput {
  fullName: string;
  contactNumber?: string | null;
  address?: string | null;
  businessName?: string | null;
}

export interface UpdateCurrentUserPasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateCurrentUserPasswordResponse {
  ok: true;
}

export interface TwoFactorProvisioningResponse {
  enabled: false;
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
  verifiedAt: string | null;
}

interface ApiResponse<T> {
  data?: T;
  error?: {
    message?: string;
  };
}

export function getCurrentUserProfile(
  accessToken: string,
): Promise<CurrentUserProfile> {
  return fetchCurrentUserApi<CurrentUserProfile>('/api/me', {
    accessToken,
  });
}

export function updateCurrentUserProfile(
  accessToken: string,
  input: UpdateCurrentUserProfileInput,
): Promise<CurrentUserProfile> {
  return fetchCurrentUserApi<CurrentUserProfile>('/api/me', {
    accessToken,
    method: 'PATCH',
    body: input,
  });
}

export function updateCurrentUserPassword(
  accessToken: string,
  input: UpdateCurrentUserPasswordInput,
): Promise<UpdateCurrentUserPasswordResponse> {
  return fetchCurrentUserApi<UpdateCurrentUserPasswordResponse>(
    '/api/me/password',
    {
      accessToken,
      method: 'PATCH',
      body: input,
    },
  );
}

export function deleteCurrentUserAccount(
  accessToken: string,
): Promise<{ ok: true }> {
  return fetchCurrentUserApi<{ ok: true }>('/api/me', {
    accessToken,
    method: 'DELETE',
  });
}

export function enableCurrentUserTwoFactor(
  accessToken: string,
): Promise<TwoFactorProvisioningResponse> {
  return fetchCurrentUserApi<TwoFactorProvisioningResponse>(
    '/api/me/two-factor/enable',
    {
      accessToken,
      method: 'POST',
    },
  );
}

export function verifyCurrentUserTwoFactor(
  accessToken: string,
  code: string,
): Promise<TwoFactorStatusResponse> {
  return fetchCurrentUserApi<TwoFactorStatusResponse>(
    '/api/me/two-factor/verify',
    {
      accessToken,
      method: 'POST',
      body: { code },
    },
  );
}

export function disableCurrentUserTwoFactor(
  accessToken: string,
  code?: string | null,
): Promise<TwoFactorStatusResponse> {
  return fetchCurrentUserApi<TwoFactorStatusResponse>(
    '/api/me/two-factor/disable',
    {
      accessToken,
      method: 'POST',
      body: { code: code ?? null },
    },
  );
}

async function fetchCurrentUserApi<T>(
  path: string,
  options: {
    accessToken: string;
    method?: 'DELETE' | 'GET' | 'PATCH' | 'POST';
    body?: unknown;
  },
): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers: {
      authorization: `Bearer ${options.accessToken}`,
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).catch(() => null);

  if (!response) {
    throw new Error('Could not reach the profile service.');
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error?.message ?? 'Profile request failed.');
  }

  return payload.data;
}
