import { Inject, Injectable } from '@nestjs/common';
import {
  CreateProviderProfileInput,
  AdminProviderApplicationDocumentSummary,
  ProviderPortfolioMediaInput,
  ProviderPortfolioMediaSummary,
  ProviderOwnedServiceInput,
  ProviderOwnedServiceSummary,
  AdminProviderApplicationSummary,
  ProviderApplicationStatus,
  ProviderProfileSummary,
  UpdateProviderProfileInput,
} from './provider-profile.types';

export const PROVIDER_PROFILE_REPOSITORY = Symbol('PROVIDER_PROFILE_REPOSITORY');

export interface ProviderProfileRepository {
  findByUserId(userId: string): Promise<ProviderProfileSummary | null>;
  create(input: CreateProviderProfileInput): Promise<ProviderProfileSummary>;
  update(input: UpdateProviderProfileInput): Promise<ProviderProfileSummary>;
  listPortfolioMedia(providerId: string): Promise<ProviderPortfolioMediaSummary[]>;
  addPortfolioMedia(
    input: ProviderPortfolioMediaInput,
  ): Promise<ProviderPortfolioMediaSummary>;
  deletePortfolioMedia(userId: string, mediaId: string): Promise<void>;
  listOwnedServices(userId: string): Promise<ProviderOwnedServiceSummary[]>;
  replaceOwnedServices(
    userId: string,
    services: ProviderOwnedServiceInput[],
  ): Promise<ProviderOwnedServiceSummary[]>;
  listProviderApplications(filter: {
    status?: ProviderApplicationStatus | null;
    query?: string | null;
    limit?: number | null;
  }): Promise<AdminProviderApplicationSummary[]>;
  getProviderApplication(
    applicationId: string,
  ): Promise<AdminProviderApplicationSummary | null>;
  getProviderApplicationDocument(
    applicationId: string,
    documentId: string,
  ): Promise<AdminProviderApplicationDocumentSummary | null>;
  decideProviderApplication(input: {
    applicationId: string;
    adminUserId: string;
    decision: Exclude<ProviderApplicationStatus, 'pending'>;
    reason: string;
  }): Promise<AdminProviderApplicationSummary>;
}

@Injectable()
export class EmptyProviderProfileRepository implements ProviderProfileRepository {
  async findByUserId(): Promise<ProviderProfileSummary | null> {
    return null;
  }

  async create(): Promise<ProviderProfileSummary> {
    throw new Error('provider_profile_repository_not_configured');
  }

  async update(): Promise<ProviderProfileSummary> {
    throw new Error('provider_profile_repository_not_configured');
  }

  async listPortfolioMedia(): Promise<ProviderPortfolioMediaSummary[]> {
    return [];
  }

  async addPortfolioMedia(): Promise<ProviderPortfolioMediaSummary> {
    throw new Error('provider_profile_repository_not_configured');
  }

  async deletePortfolioMedia(): Promise<void> {
    throw new Error('provider_profile_repository_not_configured');
  }

  async listOwnedServices(): Promise<ProviderOwnedServiceSummary[]> {
    return [];
  }

  async replaceOwnedServices(): Promise<ProviderOwnedServiceSummary[]> {
    throw new Error('provider_profile_repository_not_configured');
  }

  async listProviderApplications(): Promise<AdminProviderApplicationSummary[]> {
    return [];
  }

  async getProviderApplication(): Promise<AdminProviderApplicationSummary | null> {
    return null;
  }

  async getProviderApplicationDocument(): Promise<AdminProviderApplicationDocumentSummary | null> {
    return null;
  }

  async decideProviderApplication(): Promise<AdminProviderApplicationSummary> {
    throw new Error('provider_profile_repository_not_configured');
  }
}

@Injectable()
export class ProviderProfileService {
  constructor(
    @Inject(PROVIDER_PROFILE_REPOSITORY)
    private readonly providerProfileRepository: ProviderProfileRepository,
  ) {}

  async findByUserId(userId: string): Promise<ProviderProfileSummary | null> {
    return this.providerProfileRepository.findByUserId(userId);
  }

  async create(input: CreateProviderProfileInput): Promise<ProviderProfileSummary> {
    return this.providerProfileRepository.create(input);
  }

  async update(input: UpdateProviderProfileInput): Promise<ProviderProfileSummary> {
    return this.providerProfileRepository.update(input);
  }

  listPortfolioMedia(providerId: string): Promise<ProviderPortfolioMediaSummary[]> {
    return this.providerProfileRepository.listPortfolioMedia(providerId);
  }

  addPortfolioMedia(
    input: ProviderPortfolioMediaInput,
  ): Promise<ProviderPortfolioMediaSummary> {
    if (!input.userId || !input.fileUrl.trim()) {
      throw new Error('invalid_provider_portfolio_request');
    }

    return this.providerProfileRepository.addPortfolioMedia(input);
  }

  deletePortfolioMedia(userId: string, mediaId: string): Promise<void> {
    return this.providerProfileRepository.deletePortfolioMedia(userId, mediaId);
  }

  listOwnedServices(userId: string): Promise<ProviderOwnedServiceSummary[]> {
    return this.providerProfileRepository.listOwnedServices(userId);
  }

  replaceOwnedServices(
    userId: string,
    services: ProviderOwnedServiceInput[],
  ): Promise<ProviderOwnedServiceSummary[]> {
    if (
      !userId ||
      !Array.isArray(services) ||
      services.some((service) => !service.title?.trim())
    ) {
      throw new Error('invalid_provider_service_request');
    }

    return this.providerProfileRepository.replaceOwnedServices(userId, services);
  }

  listProviderApplications(filter: {
    status?: ProviderApplicationStatus | null;
    query?: string | null;
    limit?: number | null;
  }): Promise<AdminProviderApplicationSummary[]> {
    if (
      filter.status &&
      !['pending', 'approved', 'rejected'].includes(filter.status)
    ) {
      throw new Error('invalid_provider_application_request');
    }

    return this.providerProfileRepository.listProviderApplications(filter);
  }

  getProviderApplication(
    applicationId: string,
  ): Promise<AdminProviderApplicationSummary | null> {
    return this.providerProfileRepository.getProviderApplication(applicationId);
  }

  getProviderApplicationDocument(
    applicationId: string,
    documentId: string,
  ): Promise<AdminProviderApplicationDocumentSummary | null> {
    if (!applicationId || !documentId) {
      throw new Error('invalid_provider_application_request');
    }

    return this.providerProfileRepository.getProviderApplicationDocument(
      applicationId,
      documentId,
    );
  }

  decideProviderApplication(input: {
    applicationId: string;
    adminUserId: string;
    decision: Exclude<ProviderApplicationStatus, 'pending'>;
    reason: string;
  }): Promise<AdminProviderApplicationSummary> {
    if (
      !input.applicationId ||
      !input.adminUserId ||
      !['approved', 'rejected'].includes(input.decision) ||
      !input.reason.trim()
    ) {
      throw new Error('invalid_provider_application_request');
    }

    return this.providerProfileRepository.decideProviderApplication({
      ...input,
      reason: input.reason.trim(),
    });
  }
}
