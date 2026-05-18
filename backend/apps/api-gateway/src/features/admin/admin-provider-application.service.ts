import { Injectable } from '@nestjs/common';
import { AdminServiceClient } from './clients/admin-service.client';
import {
  AdminProviderApplicationDocumentSummary,
  AdminProviderApplicationReview,
  AdminProviderApplicationSummary,
  ListProviderApplicationsFilter,
  UpdateProviderApplicationReviewInput,
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

  getProviderApplicationReview(
    applicationId: string,
  ): Promise<AdminProviderApplicationReview> {
    return this.adminServiceClient.getProviderApplicationReview(applicationId);
  }

  updateProviderApplicationReview(input: {
    applicationId: string;
    adminUserId: string;
  } & UpdateProviderApplicationReviewInput): Promise<AdminProviderApplicationReview> {
    return this.adminServiceClient.updateProviderApplicationReview(input);
  }

  addProviderApplicationReviewNote(input: {
    applicationId: string;
    adminUserId: string;
    note: string;
  }): Promise<AdminProviderApplicationReview> {
    return this.adminServiceClient.addProviderApplicationReviewNote(input);
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
