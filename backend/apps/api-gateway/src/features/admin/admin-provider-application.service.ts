import { Injectable } from '@nestjs/common';
import { AdminServiceClient } from './clients/admin-service.client';
import {
  AdminProviderApplicationDocumentSummary,
  AdminProviderApplicationSummary,
  ListProviderApplicationsFilter,
} from './admin-provider-application.types';

@Injectable()
export class AdminProviderApplicationGatewayService {
  constructor(private readonly adminServiceClient: AdminServiceClient) {}

  listProviderApplications(
    filter: ListProviderApplicationsFilter,
  ): Promise<AdminProviderApplicationSummary[]> {
    return this.adminServiceClient.listProviderApplications(filter);
  }

  getProviderApplication(
    applicationId: string,
  ): Promise<AdminProviderApplicationSummary> {
    return this.adminServiceClient.getProviderApplication(applicationId);
  }

  getProviderApplicationDocument(
    applicationId: string,
    documentId: string,
  ): Promise<AdminProviderApplicationDocumentSummary> {
    return this.adminServiceClient.getProviderApplicationDocument(
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
    return this.adminServiceClient.decideProviderApplication(input);
  }
}
