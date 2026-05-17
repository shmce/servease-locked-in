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
    const { data, error } = await this.client
      .schema('admin')
      .from('integrations')
      .select(
        'provider,display_name,category,is_enabled,status,webhook_url,api_key_preview,last_tested_at,last_error,updated_by,updated_at,created_at',
      )
      .order('category', { ascending: true })
      .order('display_name', { ascending: true });

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
    const { data, error } = await this.client
      .schema('admin')
      .from('integrations')
      .select(
        'provider,display_name,category,is_enabled,status,webhook_url,api_key_preview,last_tested_at,last_error,updated_by,updated_at,created_at',
      )
      .eq('provider', provider)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get integration: ${error.message}`);
    }

    return data ? this.mapIntegration(data as AdminIntegrationRow) : null;
  }

  async updateCredentials(
    input: UpdateAdminIntegrationCredentialsInput,
  ): Promise<AdminIntegrationSummary> {
    const patch: Record<string, unknown> = {
      updated_by: input.adminUserId,
      updated_at: new Date().toISOString(),
    };

    if (input.isEnabled !== undefined && input.isEnabled !== null) {
      patch.is_enabled = input.isEnabled;
      patch.status = input.isEnabled ? 'active' : 'inactive';
    }

    if (input.webhookUrl !== undefined) {
      patch.webhook_url = input.webhookUrl;
    }

    if (input.apiKeyPreview !== undefined) {
      patch.api_key_preview = input.apiKeyPreview;
    }

    const { data, error } = await this.client
      .schema('admin')
      .from('integrations')
      .update(patch)
      .eq('provider', input.provider)
      .select(
        'provider,display_name,category,is_enabled,status,webhook_url,api_key_preview,last_tested_at,last_error,updated_by,updated_at,created_at',
      )
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update integration: ${error.message}`);
    }

    if (!data) {
      throw new AdminIntegrationNotFoundError(input.provider);
    }

    return this.mapIntegration(data as AdminIntegrationRow);
  }

  async recordTestResult(
    input: RecordAdminIntegrationTestInput,
  ): Promise<AdminIntegrationSummary> {
    const now = new Date().toISOString();
    const status: AdminIntegrationStatus = input.success ? 'active' : 'error';

    const { data, error } = await this.client
      .schema('admin')
      .from('integrations')
      .update({
        status,
        last_tested_at: now,
        last_error: input.success ? null : input.errorMessage ?? 'Test failed.',
        updated_by: input.adminUserId,
        updated_at: now,
      })
      .eq('provider', input.provider)
      .select(
        'provider,display_name,category,is_enabled,status,webhook_url,api_key_preview,last_tested_at,last_error,updated_by,updated_at,created_at',
      )
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to record integration test: ${error.message}`);
    }

    if (!data) {
      throw new AdminIntegrationNotFoundError(input.provider);
    }

    return this.mapIntegration(data as AdminIntegrationRow);
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
