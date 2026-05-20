export interface AdminCategoryItem {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface AdminServiceItem {
  id: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number | null;
  pricingMode: 'flat' | 'hourly';
  isActive: boolean;
}

export interface AdminProviderSummary {
  id: string;
  userId: string;
  businessName: string | null;
  bio: string | null;
  serviceDescription: string | null;
  serviceArea: string | null;
  yearsExperience: number | null;
  verificationStatus: string;
  averageRating: number;
  reviewCount: number;
  totalBookings: number | null;
  completionRate: number | null;
  isActive: boolean;
  createdAt: string | null;
  approvedByUserId?: string | null;
  approvedByName?: string | null;
  userEmail: string | null;
  userFullName: string | null;
  userContactNumber?: string | null;
  userStatus: string | null;
}

export type AdminServiceAreaStatus = 'active' | 'inactive';

export interface AdminServiceAreaSummary {
  id: string;
  name: string;
  city: string;
  region: string;
  status: AdminServiceAreaStatus;
  notes: string | null;
  providerCount: number;
  latitude: number | null;
  longitude: number | null;
  polygon?: unknown;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UpsertCategoryRequest {
  name: string;
  description?: string | null;
  icon?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpsertServiceRequest {
  categoryId?: string | null;
  name: string;
  description?: string | null;
  price?: number | null;
  pricingMode?: 'flat' | 'hourly';
  isActive?: boolean;
}

export interface UpsertServiceAreaRequest {
  name: string;
  city: string;
  region: string;
  status: AdminServiceAreaStatus;
  notes?: string | null;
  polygon?: unknown;
}
