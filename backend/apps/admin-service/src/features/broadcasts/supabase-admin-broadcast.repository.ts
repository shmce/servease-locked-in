import { Injectable, Optional } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import {
  AdminBroadcastAudience,
  AdminBroadcastRepeatRule,
  AdminBroadcastStatus,
  AdminBroadcastSummary,
  CreateAdminBroadcastInput,
} from './admin-broadcast.types';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<string, string | number | null>,
  ): PromiseLike<{
    data: AdminBroadcastRow[] | null;
    error: { message: string; code?: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data: AdminBroadcastRow | null;
      error: { message: string; code?: string } | null;
    }>;
  };
}

interface AdminBroadcastRow {
  id: string;
  admin_user_id: string;
  audience: AdminBroadcastAudience;
  audience_cohort: string | null;
  title: string;
  message: string;
  status: AdminBroadcastStatus;
  scheduled_at: string | null;
  repeat_rule: AdminBroadcastRepeatRule | null;
  delivered_count: number | string | null;
  failed_count: number | string | null;
  sent_at: string | null;
  created_at: string | null;
}

@Injectable()
export class SupabaseAdminBroadcastRepository {
  private readonly client: SupabaseRpcClient;

  constructor(@Optional() client?: SupabaseRpcClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  async createBroadcast(
    input: CreateAdminBroadcastInput,
  ): Promise<AdminBroadcastSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_create_broadcast', {
        p_admin_user_id: input.adminUserId,
        p_audience: input.audience,
        p_audience_cohort: input.audienceCohort ?? null,
        p_title: input.title,
        p_message: input.message,
        p_status: input.status,
        p_scheduled_at: input.scheduledAt ?? null,
        p_repeat_rule: input.repeatRule ?? 'none',
        p_delivered_count: input.deliveredCount ?? 0,
        p_failed_count: input.failedCount ?? 0,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to create broadcast: ${error.message}`);
    }

    if (!data) {
      throw new Error('Broadcast was not created.');
    }

    return this.mapBroadcast(data);
  }

  async listBroadcasts(limit: number): Promise<AdminBroadcastSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_admin_list_broadcasts',
      {
        p_limit: limit,
      },
    );

    if (error) {
      throw new Error(`Failed to list broadcasts: ${error.message}`);
    }

    return ((data ?? []) as AdminBroadcastRow[]).map((row) =>
      this.mapBroadcast(row),
    );
  }

  private mapBroadcast(row: AdminBroadcastRow): AdminBroadcastSummary {
    return {
      id: row.id,
      adminUserId: row.admin_user_id,
      audience: row.audience,
      audienceCohort: row.audience_cohort,
      title: row.title,
      message: row.message,
      status: row.status,
      scheduledAt: row.scheduled_at,
      repeatRule: row.repeat_rule ?? 'none',
      deliveredCount: Number(row.delivered_count ?? 0),
      failedCount: Number(row.failed_count ?? 0),
      sentAt: row.sent_at,
      createdAt: row.created_at,
    };
  }
}
