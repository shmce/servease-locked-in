import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createApicenterClient } from '../../../../../libs/common/src';
import {
  AdminReportDeliverySummary,
  AdminReportScheduleSummary,
} from './admin-report.types';
import { AdminReportService } from './admin-report.service';

@Injectable()
export class AdminReportDeliveryService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(AdminReportDeliveryService.name);
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly adminReportService: AdminReportService,
  ) {}

  onModuleInit(): void {
    if (
      this.configService.get<string>('ADMIN_REPORT_DELIVERY_WORKER_ENABLED') !==
      'true'
    ) {
      return;
    }

    const intervalMs = Number(
      this.configService.get<string>('ADMIN_REPORT_DELIVERY_INTERVAL_MS') ??
        '300000',
    );
    this.timer = setInterval(
      () => void this.runDueSchedules().catch((error) => this.logError(error)),
      Number.isFinite(intervalMs) && intervalMs >= 60000 ? intervalMs : 300000,
    );
    void this.runDueSchedules().catch((error) => this.logError(error));
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async runDueSchedules(
    now = new Date(),
    limit = 25,
  ): Promise<AdminReportDeliverySummary> {
    if (this.isRunning) {
      return this.adminReportService.summarizeDeliveryResults([], 0);
    }

    this.isRunning = true;
    const errors: AdminReportDeliverySummary['errors'] = [];
    try {
      const schedules = await this.adminReportService.listDueSchedules(
        now,
        limit,
      );

      for (const schedule of schedules) {
        try {
          await this.sendScheduleEmail(schedule);
          await this.adminReportService.markScheduleDelivered(schedule, now);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          errors.push({ scheduleId: schedule.id, errorMessage });
          await this.adminReportService.markScheduleDeliveryFailed(
            schedule.id,
            errorMessage,
          );
        }
      }

      return this.adminReportService.summarizeDeliveryResults(
        errors,
        schedules.length,
      );
    } finally {
      this.isRunning = false;
    }
  }

  private async sendScheduleEmail(
    schedule: AdminReportScheduleSummary,
  ): Promise<void> {
    const client = createApicenterClient({
      APICENTER_URL: this.configService.get<string>('APICENTER_URL'),
      APICENTER_TRIBE_ID: this.configService.get<string>('APICENTER_TRIBE_ID'),
      APICENTER_SERVICE_ID: this.configService.get<string>(
        'APICENTER_SERVICE_ID',
      ),
      APICENTER_TRIBE_SECRET: this.configService.get<string>(
        'APICENTER_TRIBE_SECRET',
      ),
    });
    await client.emailSend({
      to: schedule.recipients.map((email) => ({ email })),
      subject: `ServEase scheduled ${schedule.type} report`,
      text: [
        `${schedule.name} is ready.`,
        '',
        `Format: ${schedule.format.toUpperCase()}`,
        `Download: ${this.downloadUrl(schedule.downloadPath)}`,
      ].join('\n'),
      html: [
        `<p>${this.escapeHtml(schedule.name)} is ready.</p>`,
        `<p><strong>Format:</strong> ${schedule.format.toUpperCase()}</p>`,
        `<p><a href="${this.escapeHtml(
          this.downloadUrl(schedule.downloadPath),
        )}">Download report</a></p>`,
      ].join(''),
      metadata: {
        scheduleId: schedule.id,
        reportType: schedule.type,
        format: schedule.format,
      },
    });
  }

  private downloadUrl(downloadPath: string): string {
    const baseUrl =
      this.configService
        .get<string>('ADMIN_REPORT_DOWNLOAD_BASE_URL')
        ?.replace(/\/$/, '') ?? '';
    return baseUrl ? `${baseUrl}${downloadPath}` : downloadPath;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private logError(error: unknown): void {
    this.logger.error(error instanceof Error ? error.message : String(error));
  }
}
