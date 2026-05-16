import { Injectable } from '@nestjs/common';
import { AdminServiceClient } from './clients/admin-service.client';
import {
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

  decideProviderApplication(input: {
    applicationId: string;
    adminUserId: string;
    decision: 'approved' | 'rejected';
    reason: string;
  }): Promise<AdminProviderApplicationSummary> {
    return this.adminServiceClient.decideProviderApplication(input);
  }
}
