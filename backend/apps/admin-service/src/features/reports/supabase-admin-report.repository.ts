import { Injectable, Optional } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import {
  AdminReportScheduleSummary,
  AdminReportType,
  CreateAdminReportScheduleInput,
} from './admin-report.types';

interface AdminReportScheduleRow {
  id: string;
  admin_user_id: string;
  report_type: AdminReportType;
  format: 'csv' | 'pdf';
  status: 'scheduled';
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  next_run_at: string;
  created_at: string;
  download_path: string;
  last_delivered_at: string | null;
  last_delivery_error: string | null;
  delivery_count: number | null;
}

@Injectable()
export class SupabaseAdminReportRepository {
  private readonly client: SupabaseClient;

  constructor(@Optional() client?: SupabaseClient) {
    this.client = client ?? createSupabaseServiceClient();
  }

  async createSchedule(
    input: CreateAdminReportScheduleInput & {
      nextRunAt: string;
      downloadPath: string;
    },
  ): Promise<AdminReportScheduleSummary> {
    const { data, error } = await this.client.rpc(
      'servease_admin_create_report_schedule',
      {
        p_admin_user_id: input.adminUserId,
        p_report_type: input.type,
        p_format: input.format,
        p_name: input.name,
        p_frequency: input.frequency,
        p_recipients: input.recipients,
        p_next_run_at: input.nextRunAt,
        p_download_path: input.downloadPath,
      },
    );

    if (error) {
      throw new Error(`Failed to create report schedule: ${error.message}`);
    }

    return this.mapSchedule(((data ?? []) as AdminReportScheduleRow[])[0]);
  }

  async listSchedules(
    type: AdminReportType | null,
    limit: number,
  ): Promise<AdminReportScheduleSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_admin_list_report_schedules',
      {
        p_report_type: type,
        p_limit: limit,
      },
    );

    if (error) {
      throw new Error(`Failed to list report schedules: ${error.message}`);
    }

    return ((data ?? []) as AdminReportScheduleRow[]).map((row) =>
      this.mapSchedule(row),
    );
  }

  async listDueSchedules(
    nowIso: string,
    limit: number,
  ): Promise<AdminReportScheduleSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_admin_list_due_report_schedules',
      {
        p_now: nowIso,
        p_limit: limit,
      },
    );

    if (error) {
      throw new Error(`Failed to list due report schedules: ${error.message}`);
    }

    return ((data ?? []) as AdminReportScheduleRow[]).map((row) =>
      this.mapSchedule(row),
    );
  }

  async markScheduleDelivered(input: {
    scheduleId: string;
    nextRunAt: string;
  }): Promise<AdminReportScheduleSummary> {
    const { data, error } = await this.client.rpc(
      'servease_admin_mark_report_schedule_delivered',
      {
        p_schedule_id: input.scheduleId,
        p_next_run_at: input.nextRunAt,
      },
    );

    if (error) {
      throw new Error(`Failed to mark report schedule delivered: ${error.message}`);
    }

    return this.mapSchedule(((data ?? []) as AdminReportScheduleRow[])[0]);
  }

  async markScheduleDeliveryFailed(input: {
    scheduleId: string;
    errorMessage: string;
  }): Promise<AdminReportScheduleSummary> {
    const { data, error } = await this.client.rpc(
      'servease_admin_mark_report_schedule_delivery_failed',
      {
        p_schedule_id: input.scheduleId,
        p_error_message: input.errorMessage,
      },
    );

    if (error) {
      throw new Error(`Failed to mark report schedule delivery failed: ${error.message}`);
    }

    return this.mapSchedule(((data ?? []) as AdminReportScheduleRow[])[0]);
  }

  private mapSchedule(
    row: AdminReportScheduleRow,
  ): AdminReportScheduleSummary {
    return {
      id: row.id,
      adminUserId: row.admin_user_id,
      type: row.report_type,
      format: row.format,
      status: row.status,
      name: row.name,
      frequency: row.frequency,
      recipients: row.recipients,
      nextRunAt: row.next_run_at,
      createdAt: row.created_at,
      downloadPath: row.download_path,
      lastDeliveredAt: row.last_delivered_at ?? null,
      lastDeliveryError: row.last_delivery_error ?? null,
      deliveryCount: row.delivery_count ?? 0,
    };
  }
}
