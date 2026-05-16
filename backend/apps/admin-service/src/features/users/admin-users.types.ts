export type UserRole = 'customer' | 'provider' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'inactive';

export interface AdminUserSummary {
  id: string;
  email: string;
  fullName: string | null;
  contactNumber: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string | null;
}

export interface AdminUsersSummaryStats {
  totalCount: number;
  byRole: { customer: number; provider: number; admin: number };
  byStatus: { active: number; suspended: number; inactive: number };
  recentCount: number;
  newThisMonth: number;
}
