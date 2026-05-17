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

