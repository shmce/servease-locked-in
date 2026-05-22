import {
  CurrentUserIdentity,
  CustomerAddressSummary,
  CustomerProfileSummary,
  ProviderProfileSummary,
} from '../current-user/current-user.types';

export interface RegisterAccountRequest {
  role: 'customer' | 'provider';
  email: string;
  password: string;
  fullName: string;
  contactNumber?: string | null;
  birthdate?: string | null;
  address?: string | null;
  businessName?: string | null;
  serviceId?: string | null;
  serviceDescription?: string | null;
  serviceArea?: string | null;
}

export interface RegisteredAccountResponse {
  user: CurrentUserIdentity;
  customerProfile: CustomerProfileSummary | null;
  customerAddresses: CustomerAddressSummary[];
  providerProfile: ProviderProfileSummary | null;
}

export interface ProviderApplicationStatusResponse {
  id: string;
  applicationReference: string;
  businessName: string | null;
  serviceArea: string | null;
  serviceDescription: string | null;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  latestDecisionReason: string | null;
  latestDecisionAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProviderApplicationDocumentResponse {
  id: string;
  applicationId: string;
  userId: string;
  documentType: string;
  fileUrl: string | null;
  storagePath: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string | null;
  previewUrl: string | null;
  downloadUrl: string | null;
}

export interface ProviderApplicationDocumentsResponse {
  application: ProviderApplicationStatusResponse;
  documents: ProviderApplicationDocumentResponse[];
}

export interface PasswordResetRequest {
  email: string;
  redirectTo?: string | null;
}

export interface PasswordResetResponse {
  ok: true;
}

export interface OtpGenerateRequest {
  target: string;
  channel: 'sms' | 'email';
  length?: number;
  expiresInSeconds?: number;
}

export interface OtpGenerateResponse {
  otpId: string;
  expiresAt: string;
  channel: string;
  target: string;
  code?: string;
}

export interface OtpVerifyRequest {
  otpId: string;
  code: string;
}

export interface OtpVerifyResponse {
  valid: boolean;
  target: string;
  channel: string;
}

export interface OtpStatusResponse {
  otpId: string;
  status: 'pending' | 'used' | 'expired';
  target: string;
  channel: string;
  expiresAt: string;
}

export interface GoogleAuthorizationUrlRequest {
  redirectUri: string;
  state?: string;
  scopes?: string[];
  codeChallenge?: string;
  codeChallengeMethod?: 'S256' | 'plain';
  accessType?: 'online' | 'offline';
  prompt?: string;
  loginHint?: string;
  includeGrantedScopes?: boolean;
}

export interface GoogleAuthorizationUrlResponse {
  authorizationUrl: string;
  state?: string;
  expiresAt?: string;
}

export interface GoogleTokenExchangeRequest {
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}

export interface GoogleTokenRefreshRequest {
  refreshToken: string;
}

export interface GoogleLogoutRequest {
  token?: string;
  refreshToken?: string;
  idTokenHint?: string;
}

export interface GoogleOAuthTokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType?: string;
  scope?: string;
  idToken?: string;
  refreshToken?: string | null;
}

export interface GoogleLogoutResponse {
  revoked: boolean;
  provider: 'google';
}
