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
