import { Inject, Injectable } from '@nestjs/common';
import {
  CreateProviderProfileInput,
  AdminProviderApplicationDocumentSummary,
  AdminProviderApplicationReview,
  ProviderPortfolioMediaInput,
  ProviderPortfolioMediaReplacementInput,
  ProviderPortfolioOrderItem,
  ProviderPortfolioMediaSummary,
  ProviderOwnedServiceInput,
  ProviderOwnedServiceSummary,
  AdminProviderApplicationSummary,
  ProviderApplicationStatus,
  ProviderProfileSummary,
  SubmitProviderApplicationDocumentInput,
  UpdateProviderApplicationReviewInput,
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
  replacePortfolioMedia(
    input: ProviderPortfolioMediaReplacementInput,
  ): Promise<ProviderPortfolioMediaSummary>;
  reorderPortfolioMedia(
    userId: string,
    items: ProviderPortfolioOrderItem[],
  ): Promise<ProviderPortfolioMediaSummary[]>;
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
  getProviderApplicationByUserId(
    userId: string,
  ): Promise<AdminProviderApplicationSummary | null>;
  getProviderApplicationDocument(
    applicationId: string,
    documentId: string,
  ): Promise<AdminProviderApplicationDocumentSummary | null>;
  submitProviderApplicationDocument(
    input: SubmitProviderApplicationDocumentInput,
  ): Promise<AdminProviderApplicationDocumentSummary>;
  getProviderApplicationReview(
    applicationId: string,
  ): Promise<AdminProviderApplicationReview | null>;
  updateProviderApplicationReview(
    input: UpdateProviderApplicationReviewInput,
  ): Promise<AdminProviderApplicationReview>;
  addProviderApplicationReviewNote(input: {
    applicationId: string;
    adminUserId: string;
    note: string;
  }): Promise<AdminProviderApplicationReview>;
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

  async replacePortfolioMedia(): Promise<ProviderPortfolioMediaSummary> {
    throw new Error('provider_profile_repository_not_configured');
  }

  async reorderPortfolioMedia(): Promise<ProviderPortfolioMediaSummary[]> {
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

  async getProviderApplicationByUserId(): Promise<AdminProviderApplicationSummary | null> {
    return null;
  }

  async getProviderApplicationDocument(): Promise<AdminProviderApplicationDocumentSummary | null> {
    return null;
  }

  async submitProviderApplicationDocument(): Promise<AdminProviderApplicationDocumentSummary> {
    throw new Error('provider_profile_repository_not_configured');
  }

  async getProviderApplicationReview(): Promise<AdminProviderApplicationReview | null> {
    return null;
  }

  async updateProviderApplicationReview(): Promise<AdminProviderApplicationReview> {
    throw new Error('provider_profile_repository_not_configured');
  }

  async addProviderApplicationReviewNote(): Promise<AdminProviderApplicationReview> {
    throw new Error('provider_profile_repository_not_configured');
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

  replacePortfolioMedia(
    input: ProviderPortfolioMediaReplacementInput,
  ): Promise<ProviderPortfolioMediaSummary> {
    if (!input.userId || !input.mediaId || !input.fileUrl.trim()) {
      throw new Error('invalid_provider_portfolio_request');
    }

    return this.providerProfileRepository.replacePortfolioMedia(input);
  }

  reorderPortfolioMedia(
    userId: string,
    items: ProviderPortfolioOrderItem[],
  ): Promise<ProviderPortfolioMediaSummary[]> {
    if (
      !userId ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.some(
        (item) =>
          !item.id ||
          !Number.isInteger(item.sortOrder) ||
          item.sortOrder < 0,
      )
    ) {
      throw new Error('invalid_provider_portfolio_order_request');
    }

    return this.providerProfileRepository.reorderPortfolioMedia(userId, items);
  }

  deletePortfolioMedia(userId: string, mediaId: string): Promise<void> {
    return this.providerProfileRepository.deletePortfolioMedia(userId, mediaId);
  }

  listOwnedServices(userId: string): Promise<ProviderOwnedServiceSummary[]> {
    return this.providerProfileRepository.listOwnedServices(userId);
  }

  async replaceOwnedServices(
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

    const providerProfile = await this.providerProfileRepository.findByUserId(userId);
    if (!providerProfile) {
      throw new Error('provider_profile_not_found');
    }
    if (providerProfile.verificationStatus !== 'approved') {
      throw new Error('provider_approval_required');
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

  getProviderApplicationByUserId(
    userId: string,
  ): Promise<AdminProviderApplicationSummary | null> {
    return this.providerProfileRepository.getProviderApplicationByUserId(userId);
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

  async submitProviderApplicationDocument(
    input: SubmitProviderApplicationDocumentInput,
  ): Promise<AdminProviderApplicationDocumentSummary> {
    if (
      !input.userId ||
      !input.documentType?.trim() ||
      (!input.fileUrl?.trim() && !input.storagePath?.trim())
    ) {
      throw new Error('invalid_provider_application_document_request');
    }

    return this.providerProfileRepository.submitProviderApplicationDocument({
      userId: input.userId,
      documentType: input.documentType.trim(),
      fileUrl: input.fileUrl?.trim() || null,
      storagePath: input.storagePath?.trim() || null,
    });
  }

  getProviderApplicationReview(
    applicationId: string,
  ): Promise<AdminProviderApplicationReview | null> {
    if (!applicationId) {
      throw new Error('invalid_provider_application_request');
    }

    return this.providerProfileRepository.getProviderApplicationReview(
      applicationId,
    );
  }

  updateProviderApplicationReview(
    input: UpdateProviderApplicationReviewInput,
  ): Promise<AdminProviderApplicationReview> {
    if (
      !input.applicationId ||
      !input.adminUserId ||
      !Array.isArray(input.kycChecklist) ||
      !Array.isArray(input.businessChecklist) ||
      !Array.isArray(input.verificationRecords)
    ) {
      throw new Error('invalid_provider_application_review_request');
    }

    return this.providerProfileRepository.updateProviderApplicationReview(input);
  }

  addProviderApplicationReviewNote(input: {
    applicationId: string;
    adminUserId: string;
    note: string;
  }): Promise<AdminProviderApplicationReview> {
    if (!input.applicationId || !input.adminUserId || !input.note.trim()) {
      throw new Error('invalid_provider_application_review_request');
    }

    return this.providerProfileRepository.addProviderApplicationReviewNote({
      ...input,
      note: input.note.trim(),
    });
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
