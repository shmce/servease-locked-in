export type UserRole = 'customer' | 'provider' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'inactive';

export interface StoredUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string | null;
  contactNumber: string | null;
  role: UserRole;
  status: UserStatus;
}

export interface InternalUserResponse {
  id: string;
  email: string;
  fullName: string | null;
  contactNumber: string | null;
  role: UserRole;
  status: UserStatus;
}

export interface UpdateInternalUserInput {
  userId: string;
  fullName: string;
  contactNumber?: string | null;
}

export interface UserSessionRecord {
  id: string;
  email: string;
  createdAt: string | null;
  lastSignInAt: string | null;
}

export interface TwoFactorStateRecord {
  userId: string;
  secret: string | null;
  enabled: boolean;
  verifiedAt: string | null;
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
