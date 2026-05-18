export const adminAccessRoleIds = [
  'super-admin',
  'finance-manager',
  'operations-manager',
  'customer-support',
  'content-moderator',
] as const;

export type AdminAccessRoleId = (typeof adminAccessRoleIds)[number];

export interface AdminAccessRoleDefinition {
  id: AdminAccessRoleId;
  label: string;
  permissions: string[];
}

export const adminAccessRoleDefinitions = {
  'super-admin': {
    id: 'super-admin',
    label: 'Super Admin',
    permissions: [
      'admin.full_access',
      'users.manage',
      'roles.manage',
      'bookings.manage',
      'disputes.manage',
      'finance.manage',
      'marketplace.manage',
      'reports.view',
      'settings.manage',
      'audit_logs.view',
    ],
  },
  'finance-manager': {
    id: 'finance-manager',
    label: 'Finance Manager',
    permissions: [
      'finance.manage',
      'transactions.view',
      'payouts.manage',
      'refunds.manage',
      'reports.financial',
    ],
  },
  'operations-manager': {
    id: 'operations-manager',
    label: 'Operations Manager',
    permissions: [
      'bookings.manage',
      'disputes.manage',
      'providers.view',
      'customers.view',
      'marketplace.manage',
    ],
  },
  'customer-support': {
    id: 'customer-support',
    label: 'Customer Support',
    permissions: [
      'support.manage',
      'bookings.view',
      'customers.view',
      'disputes.basic',
      'notifications.send',
      'transactions.view_limited',
    ],
  },
  'content-moderator': {
    id: 'content-moderator',
    label: 'Content Moderator',
    permissions: [
      'provider_applications.manage',
      'kyc.review',
      'marketplace.moderate',
      'categories.manage',
      'promotions.manage',
    ],
  },
} satisfies Record<AdminAccessRoleId, AdminAccessRoleDefinition>;

export function normalizeAdminAccessRole(
  role?: string | null,
): AdminAccessRoleId {
  const normalized = role?.trim() || 'super-admin';
  return isAdminAccessRoleId(normalized) ? normalized : 'super-admin';
}

export function getAdminAccessRoleDefinition(
  role?: string | null,
): AdminAccessRoleDefinition {
  return adminAccessRoleDefinitions[normalizeAdminAccessRole(role)];
}

export function isAdminAccessRoleId(role: string): role is AdminAccessRoleId {
  return (adminAccessRoleIds as readonly string[]).includes(role);
}
