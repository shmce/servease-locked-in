import { Injectable } from '@nestjs/common';
import { AdminDisputeStatus, AdminDisputeSummary } from './admin-dispute.types';
import { SupabaseAdminDisputeRepository } from './supabase-admin-dispute.repository';

@Injectable()
export class AdminDisputeService {
  constructor(
    private readonly adminDisputeRepository: SupabaseAdminDisputeRepository,
  ) {}

  listDisputes(
    status?: AdminDisputeStatus | null,
  ): Promise<AdminDisputeSummary[]> {
    return this.adminDisputeRepository.listDisputes(status ?? null);
  }

  getDispute(disputeId: string): Promise<AdminDisputeSummary | null> {
    return this.adminDisputeRepository.getDispute(disputeId);
  }

  resolveDispute(disputeId: string): Promise<AdminDisputeSummary | null> {
    return this.adminDisputeRepository.updateDisputeStatus(disputeId, 'resolved');
  }
}
