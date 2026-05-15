import {
  CurrentUserIdentity,
  CustomerProfileSummary,
  ProviderProfileSummary,
} from '../current-user/current-user.types';

export interface RegisterAccountRequest {
  role: 'customer' | 'provider';
  email: string;
  password: string;
  fullName: string;
  contactNumber?: string | null;
  address?: string | null;
  businessName?: string | null;
  serviceDescription?: string | null;
  serviceArea?: string | null;
}

export interface RegisteredAccountResponse {
  user: CurrentUserIdentity;
  customerProfile: CustomerProfileSummary | null;
  providerProfile: ProviderProfileSummary | null;
}
