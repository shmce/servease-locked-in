import { Injectable } from '@nestjs/common';
import {
  AdminIntegrationNotFoundError,
  InvalidAdminIntegrationRequestError,
} from './admin-integration.errors';
import {
  AdminIntegrationSummary,
  RecordAdminIntegrationTestInput,
  UpdateAdminIntegrationCredentialsInput,
} from './admin-integration.types';
import { ApicenterIntegrationProbe } from './apicenter-integration-probe';
import { SupabaseAdminIntegrationRepository } from './supabase-admin-integration.repository';

@Injectable()
export class AdminIntegrationService {
  constructor(
    private readonly integrationRepository: SupabaseAdminIntegrationRepository,
    private readonly apicenterIntegrationProbe: ApicenterIntegrationProbe,
  ) {}

  listIntegrations(): Promise<AdminIntegrationSummary[]> {
    return this.integrationRepository.listIntegrations();
  }

  async updateCredentials(
    input: UpdateAdminIntegrationCredentialsInput,
  ): Promise<AdminIntegrationSummary> {
    if (!input.provider?.trim() || !input.adminUserId?.trim()) {
      throw new InvalidAdminIntegrationRequestError(
        'Provider and adminUserId are required.',
      );
    }

    if (
      input.isEnabled === undefined &&
      input.webhookUrl === undefined &&
      input.apiKeyPreview === undefined
    ) {
      throw new InvalidAdminIntegrationRequestError(
        'At least one credential field must change.',
      );
    }

    return this.integrationRepository.updateCredentials({
      ...input,
      provider: input.provider.trim(),
      adminUserId: input.adminUserId.trim(),
      webhookUrl:
        input.webhookUrl === undefined ? undefined : input.webhookUrl?.trim() || null,
      apiKeyPreview:
        input.apiKeyPreview === undefined
          ? undefined
          : input.apiKeyPreview?.trim() || null,
    });
  }

  async test(
    input: RecordAdminIntegrationTestInput,
  ): Promise<AdminIntegrationSummary> {
    if (!input.provider?.trim() || !input.adminUserId?.trim()) {
      throw new InvalidAdminIntegrationRequestError(
        'Provider and adminUserId are required.',
      );
    }

    const existing = await this.integrationRepository.getIntegration(
      input.provider.trim(),
    );

    if (!existing) {
      throw new AdminIntegrationNotFoundError(input.provider);
    }

    const probe = await this.apicenterIntegrationProbe.testProvider(
      input.provider.trim(),
    );
    const probeSuccess = probe?.success ?? input.success;
    const success = probeSuccess && existing.isEnabled;
    const errorMessage = !existing.isEnabled
      ? 'Integration is disabled. Enable it before running the test.'
      : probeSuccess
        ? null
        : probe?.errorMessage ?? input.errorMessage ?? 'Test failed.';

    return this.integrationRepository.recordTestResult({
      provider: input.provider.trim(),
      success,
      errorMessage,
      adminUserId: input.adminUserId.trim(),
    });
  }
}
