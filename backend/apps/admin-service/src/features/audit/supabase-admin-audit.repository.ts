import { Injectable, Optional } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import {
  AdminAuditActionType,
  AdminAuditLogSummary,
  CreateAdminAuditLogInput,
  ListAdminAuditLogsFilter,
} from './admin-audit.types';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<
      string,
      Record<string, unknown> | string | number | boolean | null
    >,
  ): PromiseLike<{
    data: AdminAuditLogRow[] | null;
    error: { message: string; code?: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data: AdminAuditLogRow | null;
      error: { message: string; code?: string } | null;
    }>;
  };
}

interface AdminAuditLogRow {
  id: string;
  admin_user_id: string;
  admin_email: string | null;
  admin_name: string | null;
  action: string;
  action_type: AdminAuditActionType;
  entity_type: string;
  entity_id: string | null;
  details: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
}

@Injectable()
export class SupabaseAdminAuditRepository {
  private readonly client: SupabaseRpcClient;

  constructor(@Optional() client?: SupabaseRpcClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  async createAuditLog(
    input: CreateAdminAuditLogInput,
  ): Promise<AdminAuditLogSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_create_audit_log', {
        p_admin_user_id: input.adminUserId,
        p_admin_email: input.adminEmail ?? null,
        p_admin_name: input.adminName ?? null,
        p_action: input.action,
        p_action_type: input.actionType,
        p_entity_type: input.entityType,
        p_entity_id: input.entityId ?? null,
        p_details: input.details ?? null,
        p_ip_address: input.ipAddress ?? null,
        p_metadata: input.metadata ?? {},
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to create audit log: ${error.message}`);
    }

    if (!data) {
      throw new Error('Audit log was not created.');
    }

    return this.mapAuditLog(data);
  }

  async listAuditLogs(
    filter: ListAdminAuditLogsFilter,
  ): Promise<AdminAuditLogSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_admin_list_audit_logs',
      {
        p_admin_user_id: filter.adminUserId ?? null,
        p_action_type: filter.actionType ?? null,
        p_entity_type: filter.entityType ?? null,
        p_query: filter.query ?? null,
        p_from: filter.from ?? null,
        p_to: filter.to ?? null,
        p_limit: filter.limit ?? 100,
      },
    );

    if (error) {
      throw new Error(`Failed to list audit logs: ${error.message}`);
    }

    return ((data ?? []) as AdminAuditLogRow[]).map((row) =>
      this.mapAuditLog(row),
    );
  }

  private mapAuditLog(row: AdminAuditLogRow): AdminAuditLogSummary {
    return {
      id: row.id,
      adminUserId: row.admin_user_id,
      adminEmail: row.admin_email,
      adminName: row.admin_name,
      action: row.action,
      actionType: row.action_type,
      entityType: row.entity_type,
      entityId: row.entity_id,
      details: row.details,
      ipAddress: row.ip_address,
      metadata: row.metadata ?? {},
      createdAt: row.created_at,
    };
  }
}
