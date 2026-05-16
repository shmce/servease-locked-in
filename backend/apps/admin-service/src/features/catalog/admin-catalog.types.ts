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
  isActive: boolean;
  createdAt: string | null;
  userEmail: string | null;
  userFullName: string | null;
  userContactNumber?: string | null;
  userStatus: string | null;
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
