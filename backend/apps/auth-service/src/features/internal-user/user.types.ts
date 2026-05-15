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
