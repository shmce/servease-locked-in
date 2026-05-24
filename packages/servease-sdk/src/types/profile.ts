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

export interface CurrentUserProfile {
  user: CurrentUserIdentity;
  customerProfile: CustomerProfileSummary | null;
  customerAddresses: CustomerAddressSummary[];
  providerProfile: ProviderProfileSummary | null;
}

export interface CreateCustomerAddressInput {
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

export type UpdateCustomerAddressInput = Partial<CreateCustomerAddressInput>;

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

export interface UserPreferenceSummary {
  userId: string;
  pushNotificationsEnabled: boolean;
  darkModeEnabled: boolean;
  language: string;
  notificationPreferences: Record<string, unknown>;
  updatedAt: string | null;
}

export interface UpdateUserPreferencesRequest {
  pushNotificationsEnabled?: boolean | null;
  darkModeEnabled?: boolean | null;
  language?: string | null;
  notificationPreferences?: Record<string, unknown> | null;
}
