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

export interface CustomerAddressSummary {
  id: string;
  userId: string;
  label: string;
  address: string;
  barangay: string | null;
  city: string | null;
  province: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProviderProfileSummary {
  id: string;
  businessName: string | null;
  bio?: string | null;
  serviceDescription?: string | null;
  serviceArea?: string | null;
  yearsExperience?: number | null;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  averageRating: number;
  reviewCount: number;
}

export interface ProviderOwnerSummary {
  userId: string;
  businessName: string | null;
}

export interface CurrentUserProfile {
  user: CurrentUserIdentity;
  customerProfile: CustomerProfileSummary | null;
  customerAddresses: CustomerAddressSummary[];
  providerProfile: ProviderProfileSummary | null;
}

export interface CreateCustomerAddressRequest {
  label?: string | null;
  address: string;
  barangay?: string | null;
  city?: string | null;
  province?: string | null;
  region?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean | null;
}

export type UpdateCustomerAddressRequest = Partial<CreateCustomerAddressRequest>;

export interface UpdateCurrentUserProfileInput {
  fullName: string;
  contactNumber?: string | null;
  address?: string | null;
  businessName?: string | null;
  bio?: string | null;
  serviceDescription?: string | null;
  serviceArea?: string | null;
  yearsExperience?: number | null;
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

export interface TwoFactorVerificationInput {
  code?: string | null;
}

export interface CurrentUserSessionSummary {
  id: string;
  email: string;
  createdAt: string | null;
  lastSignInAt: string | null;
  isCurrent: boolean;
}
