export interface PasswordResetRequest {
  email: string;
  redirectTo?: string | null;
}

export interface PasswordResetResponse {
  ok: true;
}
