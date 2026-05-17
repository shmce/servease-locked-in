import { Injectable } from '@nestjs/common';
import { InvalidAdminReportScheduleRequestError } from './admin-report.errors';
import {
  AdminReportDeliverySummary,
  AdminReportFormat,
  AdminReportFrequency,
  AdminReportScheduleSummary,
  AdminReportType,
  CreateAdminReportScheduleInput,
} from './admin-report.types';
import { SupabaseAdminReportRepository } from './supabase-admin-report.repository';

const reportTypes = new Set<AdminReportType>([
  'bookings',
  'revenue',
  'users',
  'financial',
]);
const reportFormats = new Set<AdminReportFormat>(['csv', 'pdf']);
const reportFrequencies = new Set<AdminReportFrequency>([
  'daily',
  'weekly',
  'monthly',
]);

@Injectable()
export class AdminReportService {
  constructor(
    private readonly reportRepository: SupabaseAdminReportRepository,
  ) {}

  createSchedule(
    input: CreateAdminReportScheduleInput,
  ): Promise<AdminReportScheduleSummary> {
    const recipients = input.recipients
      .map((recipient) => recipient.trim())
      .filter((recipient) => recipient.includes('@'));

    if (
      !input.adminUserId?.trim() ||
      !reportTypes.has(input.type) ||
      !reportFormats.has(input.format) ||
      !reportFrequencies.has(input.frequency) ||
      !input.name?.trim() ||
      recipients.length === 0
    ) {
      throw new InvalidAdminReportScheduleRequestError();
    }

    const createdAt = new Date();
    return this.reportRepository.createSchedule({
      ...input,
      adminUserId: input.adminUserId.trim(),
      name: input.name.trim(),
      recipients,
      nextRunAt: this.nextRunAt(createdAt, input.frequency).toISOString(),
      downloadPath: `/v1/admin/reports/${input.type}.${input.format}`,
    });
  }

  listSchedules(
    type?: AdminReportType | null,
    limit?: number | null,
  ): Promise<AdminReportScheduleSummary[]> {
    if (type && !reportTypes.has(type)) {
      throw new InvalidAdminReportScheduleRequestError();
    }
    if (
      limit !== null &&
      limit !== undefined &&
      (!Number.isInteger(limit) || limit < 1 || limit > 500)
    ) {
      throw new InvalidAdminReportScheduleRequestError();
    }

    return this.reportRepository.listSchedules(type ?? null, limit ?? 100);
  }

  listDueSchedules(
    now: Date,
    limit?: number | null,
  ): Promise<AdminReportScheduleSummary[]> {
    if (
      limit !== null &&
      limit !== undefined &&
      (!Number.isInteger(limit) || limit < 1 || limit > 100)
    ) {
      throw new InvalidAdminReportScheduleRequestError();
    }

    return this.reportRepository.listDueSchedules(
      now.toISOString(),
      limit ?? 25,
    );
  }

  markScheduleDelivered(
    schedule: AdminReportScheduleSummary,
    deliveredAt: Date,
  ): Promise<AdminReportScheduleSummary> {
    return this.reportRepository.markScheduleDelivered({
      scheduleId: schedule.id,
      nextRunAt: this.nextRunAt(deliveredAt, schedule.frequency).toISOString(),
    });
  }

  markScheduleDeliveryFailed(
    scheduleId: string,
    errorMessage: string,
  ): Promise<AdminReportScheduleSummary> {
    if (!scheduleId.trim()) {
      throw new InvalidAdminReportScheduleRequestError();
    }

    return this.reportRepository.markScheduleDeliveryFailed({
      scheduleId,
      errorMessage: errorMessage.trim().slice(0, 1000),
    });
  }

  summarizeDeliveryResults(
    errors: AdminReportDeliverySummary['errors'],
    attempted: number,
  ): AdminReportDeliverySummary {
    return {
      attempted,
      delivered: attempted - errors.length,
      failed: errors.length,
      errors,
    };
  }

  nextRunAt(
    createdAt: Date,
    frequency: AdminReportFrequency,
  ): Date {
    const nextRunAt = new Date(createdAt);
    if (frequency === 'daily') {
      nextRunAt.setDate(nextRunAt.getDate() + 1);
    } else if (frequency === 'weekly') {
      nextRunAt.setDate(nextRunAt.getDate() + 7);
    } else {
      nextRunAt.setMonth(nextRunAt.getMonth() + 1);
    }
    return nextRunAt;
  }
}
