import { Injectable } from '@nestjs/common';
import { CatalogServiceClient } from './clients/catalog-service.client';
import {
  AdminProviderApplicationDocumentSummary,
  AdminProviderApplicationReview,
  AdminProviderApplicationSummary,
  ListProviderApplicationsFilter,
  UpdateProviderApplicationReviewInput,
} from './admin-provider-application.types';

@Injectable()
export class AdminProviderApplicationService {
  constructor(private readonly catalogServiceClient: CatalogServiceClient) {}

  listProviderApplications(
    filter: ListProviderApplicationsFilter,
  ): Promise<AdminProviderApplicationSummary[]> {
    return this.catalogServiceClient.listProviderApplications(filter);
  }

  getProviderApplication(
    applicationId: string,
  ): Promise<AdminProviderApplicationSummary> {
    return this.catalogServiceClient.getProviderApplication(applicationId);
  }

  getProviderApplicationDocument(
    applicationId: string,
    documentId: string,
  ): Promise<AdminProviderApplicationDocumentSummary> {
    return this.catalogServiceClient.getProviderApplicationDocument(
      applicationId,
      documentId,
    );
  }

  getProviderApplicationReview(
    applicationId: string,
  ): Promise<AdminProviderApplicationReview> {
    return this.catalogServiceClient.getProviderApplicationReview(applicationId);
  }

  updateProviderApplicationReview(
    input: UpdateProviderApplicationReviewInput,
  ): Promise<AdminProviderApplicationReview> {
    return this.catalogServiceClient.updateProviderApplicationReview(input);
  }

  addProviderApplicationReviewNote(input: {
    applicationId: string;
    adminUserId: string;
    note: string;
  }): Promise<AdminProviderApplicationReview> {
    return this.catalogServiceClient.addProviderApplicationReviewNote(input);
  }

  decideProviderApplication(input: {
    applicationId: string;
    adminUserId: string;
    decision: 'approved' | 'rejected';
    reason: string;
  }): Promise<AdminProviderApplicationSummary> {
    if (!input.applicationId || !input.adminUserId || !input.reason.trim()) {
      throw new Error('invalid_provider_application_request');
    }

    return this.catalogServiceClient.decideProviderApplication({
      ...input,
      reason: input.reason.trim(),
    });
  }
}
