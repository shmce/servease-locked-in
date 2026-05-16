import { Injectable } from '@nestjs/common';
import { CatalogServiceClient } from './clients/catalog-service.client';
import {
  AdminProviderApplicationDocumentSummary,
  AdminProviderApplicationSummary,
  ListProviderApplicationsFilter,
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
