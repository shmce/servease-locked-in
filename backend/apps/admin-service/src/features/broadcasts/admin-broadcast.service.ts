import { Injectable } from '@nestjs/common';
import { InvalidAdminBroadcastRequestError } from './admin-broadcast.errors';
import {
  AdminBroadcastAudience,
  AdminBroadcastRepeatRule,
  AdminBroadcastStatus,
  AdminBroadcastSummary,
  CreateAdminBroadcastInput,
} from './admin-broadcast.types';
import { SupabaseAdminBroadcastRepository } from './supabase-admin-broadcast.repository';

const validAudiences = new Set<AdminBroadcastAudience>([
  'admins',
  'all',
  'customers',
  'providers',
]);
const validRepeatRules = new Set<AdminBroadcastRepeatRule>([
  'none',
  'daily',
  'weekly',
  'monthly',
]);
const validStatuses = new Set<AdminBroadcastStatus>([
  'scheduled',
  'sent',
  'failed',
  'cancelled',
]);

@Injectable()
export class AdminBroadcastService {
  constructor(
    private readonly broadcastRepository: SupabaseAdminBroadcastRepository,
  ) {}

  createBroadcast(
    input: CreateAdminBroadcastInput,
  ): Promise<AdminBroadcastSummary> {
    if (
      !input.adminUserId?.trim() ||
      !validAudiences.has(input.audience) ||
      !input.title?.trim() ||
      !input.message?.trim() ||
      !validStatuses.has(input.status) ||
      (input.repeatRule && !validRepeatRules.has(input.repeatRule))
    ) {
      throw new InvalidAdminBroadcastRequestError();
    }

    const scheduledAt = input.scheduledAt?.trim() || null;
    if (scheduledAt && Number.isNaN(new Date(scheduledAt).getTime())) {
      throw new InvalidAdminBroadcastRequestError();
    }

    return this.broadcastRepository.createBroadcast({
      ...input,
      adminUserId: input.adminUserId.trim(),
      audienceCohort: input.audienceCohort?.trim() || null,
      title: input.title.trim(),
      message: input.message.trim(),
      scheduledAt,
      repeatRule: input.repeatRule ?? 'none',
      deliveredCount: input.deliveredCount ?? 0,
      failedCount: input.failedCount ?? 0,
    });
  }

  listBroadcasts(limit?: number | null): Promise<AdminBroadcastSummary[]> {
    if (
      limit !== null &&
      limit !== undefined &&
      (!Number.isInteger(limit) || limit < 1 || limit > 500)
    ) {
      throw new InvalidAdminBroadcastRequestError();
    }

    return this.broadcastRepository.listBroadcasts(limit ?? 100);
  }
}
