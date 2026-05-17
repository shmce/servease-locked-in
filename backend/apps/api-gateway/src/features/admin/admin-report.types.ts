export type AdminReportType = 'bookings' | 'revenue' | 'users' | 'financial';
export type AdminReportFormat = 'csv' | 'pdf';
export type AdminReportFrequency = 'daily' | 'weekly' | 'monthly';

export interface ScheduledAdminReportResponse {
  id: string;
  adminUserId: string;
  type: AdminReportType;
  format: AdminReportFormat;
  status: 'scheduled';
  name: string;
  frequency: AdminReportFrequency;
  recipients: string[];
  nextRunAt: string;
  createdAt: string;
  downloadPath: string;
  lastDeliveredAt: string | null;
  lastDeliveryError: string | null;
  deliveryCount: number;
}

export interface CreateAdminReportScheduleInput {
  adminUserId: string;
  type: AdminReportType;
  format: AdminReportFormat;
  name: string;
  frequency: AdminReportFrequency;
  recipients: string[];
}
