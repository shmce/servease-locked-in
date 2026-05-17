export type AdminIntegrationStatus = 'active' | 'inactive' | 'error';

export interface AdminIntegrationSummary {
  provider: string;
  displayName: string;
  category: string;
  isEnabled: boolean;
  status: AdminIntegrationStatus;
  webhookUrl: string | null;
  apiKeyPreview: string | null;
  lastTestedAt: string | null;
  lastError: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
  createdAt: string | null;
}

export interface UpdateAdminIntegrationCredentialsInput {
  provider: string;
  isEnabled?: boolean | null;
  webhookUrl?: string | null;
  apiKeyPreview?: string | null;
  adminUserId: string;
}

export interface RecordAdminIntegrationTestInput {
  provider: string;
  success: boolean;
  errorMessage?: string | null;
  adminUserId: string;
}
