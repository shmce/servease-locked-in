export type UserRole = 'customer' | 'provider' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'inactive';
export const adminAccessRoleIds = [
  'super-admin',
  'finance-manager',
  'operations-manager',
  'customer-support',
  'content-moderator',
] as const;
export type AdminAccessRoleId = (typeof adminAccessRoleIds)[number];

export interface AdminUserSummary {
  id: string;
  email: string;
  fullName: string | null;
  contactNumber: string | null;
  role: UserRole;
  accessRole?: AdminAccessRoleId | null;
  accessRoleLabel?: string | null;
  permissions?: string[];
  requireTwoFactor?: boolean;
  invitationSent?: boolean;
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

export interface CreateAdminUserRequest {
  email: string;
  password: string;
  fullName: string;
  contactNumber?: string | null;
  accessRole?: AdminAccessRoleId | null;
  sendInvitation?: boolean | null;
  requireTwoFactor?: boolean | null;
}

export interface UpdateAdminUserAccessRequest {
  accessRole: AdminAccessRoleId;
  requireTwoFactor?: boolean | null;
}
