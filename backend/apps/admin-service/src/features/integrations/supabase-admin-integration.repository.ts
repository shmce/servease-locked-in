import { Injectable, Optional } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import {
  AdminIntegrationStatus,
  AdminIntegrationSummary,
  RecordAdminIntegrationTestInput,
  UpdateAdminIntegrationCredentialsInput,
} from './admin-integration.types';
import { AdminIntegrationNotFoundError } from './admin-integration.errors';

interface AdminIntegrationRow {
  provider: string;
  display_name: string;
  category: string;
  is_enabled: boolean;
  status: AdminIntegrationStatus;
  webhook_url: string | null;
  api_key_preview: string | null;
  last_tested_at: string | null;
  last_error: string | null;
  updated_by: string | null;
  updated_at: string | null;
  created_at: string | null;
}

@Injectable()
export class SupabaseAdminIntegrationRepository {
  private readonly client: SupabaseClient;

  constructor(@Optional() client?: SupabaseClient) {
    this.client = client ?? createSupabaseServiceClient();
  }

  async listIntegrations(): Promise<AdminIntegrationSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_admin_list_integrations',
    );

    if (error) {
      throw new Error(`Failed to list integrations: ${error.message}`);
    }

    return ((data ?? []) as AdminIntegrationRow[]).map((row) =>
      this.mapIntegration(row),
    );
  }

  async getIntegration(
    provider: string,
  ): Promise<AdminIntegrationSummary | null> {
    const list = await this.listIntegrations();
    return list.find((item) => item.provider === provider) ?? null;
  }

  async updateCredentials(
    input: UpdateAdminIntegrationCredentialsInput,
  ): Promise<AdminIntegrationSummary> {
    const { data, error } = await this.client.rpc(
      'servease_admin_update_integration_credentials',
      {
        p_provider: input.provider,
        p_admin_user_id: input.adminUserId,
        p_is_enabled:
          input.isEnabled === undefined ? null : input.isEnabled,
        p_webhook_url:
          input.webhookUrl === undefined ? null : input.webhookUrl,
        p_api_key_preview:
          input.apiKeyPreview === undefined ? null : input.apiKeyPreview,
        p_apply_webhook: input.webhookUrl !== undefined,
        p_apply_api_key: input.apiKeyPreview !== undefined,
      },
    );

    if (error) {
      throw new Error(`Failed to update integration: ${error.message}`);
    }

    const rows = (data ?? []) as AdminIntegrationRow[];
    if (rows.length === 0) {
      throw new AdminIntegrationNotFoundError(input.provider);
    }

    return this.mapIntegration(rows[0]);
  }

  async recordTestResult(
    input: RecordAdminIntegrationTestInput,
  ): Promise<AdminIntegrationSummary> {
    const { data, error } = await this.client.rpc(
      'servease_admin_record_integration_test',
      {
        p_provider: input.provider,
        p_admin_user_id: input.adminUserId,
        p_success: input.success,
        p_error_message: input.errorMessage ?? null,
      },
    );

    if (error) {
      throw new Error(`Failed to record integration test: ${error.message}`);
    }

    const rows = (data ?? []) as AdminIntegrationRow[];
    if (rows.length === 0) {
      throw new AdminIntegrationNotFoundError(input.provider);
    }

    return this.mapIntegration(rows[0]);
  }

  private mapIntegration(row: AdminIntegrationRow): AdminIntegrationSummary {
    return {
      provider: row.provider,
      displayName: row.display_name,
      category: row.category,
      isEnabled: row.is_enabled,
      status: row.status,
      webhookUrl: row.webhook_url,
      apiKeyPreview: row.api_key_preview,
      lastTestedAt: row.last_tested_at,
      lastError: row.last_error,
      updatedBy: row.updated_by,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }
}
