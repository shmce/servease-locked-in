import { Injectable } from '@nestjs/common';
import {
  AdminAuditLogSummary,
  CreateAdminAuditLogInput,
  ListAdminAuditLogsFilter,
} from './admin-audit.types';
import { AdminServiceClient } from './clients/admin-service.client';

@Injectable()
export class AdminAuditGatewayService {
  constructor(private readonly adminServiceClient: AdminServiceClient) {}

  listAuditLogs(
    filter: ListAdminAuditLogsFilter,
  ): Promise<AdminAuditLogSummary[]> {
    return this.adminServiceClient.listAuditLogs(filter);
  }

  createAuditLog(
    input: CreateAdminAuditLogInput,
  ): Promise<AdminAuditLogSummary> {
    return this.adminServiceClient.createAuditLog(input);
  }
}
