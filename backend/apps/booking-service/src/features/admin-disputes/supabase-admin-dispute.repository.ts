import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { AdminDisputeStatus, AdminDisputeSummary } from './admin-dispute.types';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<string, unknown>,
  ): PromiseLike<{
    data: AdminDisputeRow[] | null;
    error: { message: string; code?: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data: AdminDisputeRow | null;
      error: { message: string; code?: string } | null;
    }>;
  };
}

interface AdminDisputeRow {
  id: string;
  booking_id: string | null;
  booking_reference: string | null;
  customer_id: string | null;
  provider_id: string | null;
  raised_by: string;
  reason: string | null;
  status: AdminDisputeStatus | null;
  amount: string | number | null;
  created_at: string | null;
}

@Injectable()
export class SupabaseAdminDisputeRepository {
  private readonly client: SupabaseRpcClient;

  constructor(client?: SupabaseRpcClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  async listDisputes(
    status?: AdminDisputeStatus | null,
  ): Promise<AdminDisputeSummary[]> {
    const { data, error } = await this.client.rpc('servease_admin_list_disputes', {
      p_status: status ?? null,
    });

    if (error) {
      throw new Error(`Failed to list admin disputes: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapDispute(row));
  }

  async getDispute(disputeId: string): Promise<AdminDisputeSummary | null> {
    const { data, error } = await this.client
      .rpc('servease_admin_get_dispute', {
        p_dispute_id: disputeId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get admin dispute: ${error.message}`);
    }

    return data ? this.mapDispute(data) : null;
  }

  async updateDisputeStatus(
    disputeId: string,
    status: AdminDisputeStatus,
  ): Promise<AdminDisputeSummary | null> {
    const { data, error } = await this.client
      .rpc('servease_admin_update_dispute_status', {
        p_dispute_id: disputeId,
        p_status: status,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update admin dispute: ${error.message}`);
    }

    return data ? this.mapDispute(data) : null;
  }

  private mapDispute(row: AdminDisputeRow): AdminDisputeSummary {
    return {
      id: row.id,
      bookingId: row.booking_id,
      bookingReference: row.booking_reference,
      customerId: row.customer_id,
      providerId: row.provider_id,
      raisedBy: row.raised_by,
      reason: row.reason,
      status: row.status ?? 'open',
      amount: Number(row.amount ?? 0),
      createdAt: row.created_at,
    };
  }
}
