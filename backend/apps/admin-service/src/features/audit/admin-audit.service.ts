import { Injectable } from '@nestjs/common';
import { InvalidAdminAuditRequestError } from './admin-audit.errors';
import {
  AdminAuditActionType,
  AdminAuditLogSummary,
  CreateAdminAuditLogInput,
  ListAdminAuditLogsFilter,
} from './admin-audit.types';
import { SupabaseAdminAuditRepository } from './supabase-admin-audit.repository';

const validActionTypes = new Set<AdminAuditActionType>([
  'approve',
  'create',
  'delete',
  'export',
  'login',
  'other',
  'reject',
  'resolve',
  'update',
]);

@Injectable()
export class AdminAuditService {
  constructor(private readonly auditRepository: SupabaseAdminAuditRepository) {}

  createAuditLog(
    input: CreateAdminAuditLogInput,
  ): Promise<AdminAuditLogSummary> {
    if (
      !input.adminUserId?.trim() ||
      !input.action?.trim() ||
      !validActionTypes.has(input.actionType) ||
      !input.entityType?.trim() ||
      !isPlainObject(input.metadata ?? {})
    ) {
      throw new InvalidAdminAuditRequestError();
    }

    return this.auditRepository.createAuditLog({
      ...input,
      action: input.action.trim(),
      entityType: input.entityType.trim(),
      entityId: input.entityId?.trim() || null,
      details: input.details?.trim() || null,
      ipAddress: input.ipAddress?.trim() || null,
      metadata: input.metadata ?? {},
    });
  }

  listAuditLogs(
    filter: ListAdminAuditLogsFilter,
  ): Promise<AdminAuditLogSummary[]> {
    if (
      (filter.actionType && !validActionTypes.has(filter.actionType)) ||
      (filter.limit !== null &&
        filter.limit !== undefined &&
        (!Number.isInteger(filter.limit) || filter.limit < 1 || filter.limit > 500))
    ) {
      throw new InvalidAdminAuditRequestError();
    }

    return this.auditRepository.listAuditLogs({
      ...filter,
      entityType: filter.entityType?.trim() || null,
      query: filter.query?.trim() || null,
      limit: filter.limit ?? 100,
    });
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
