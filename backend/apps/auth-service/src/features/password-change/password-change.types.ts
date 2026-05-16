export interface PasswordChangeRequest {
  userId: string;
  email: string;
  currentPassword: string;
  newPassword: string;
}

export interface PasswordChangeResponse {
  ok: true;
}
