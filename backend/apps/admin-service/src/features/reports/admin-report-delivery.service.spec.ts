import { ConfigService } from '@nestjs/config';
import { createApicenterClient } from '@servease/common';
import { AdminReportDeliveryService } from './admin-report-delivery.service';
import { AdminReportService } from './admin-report.service';
import { AdminReportScheduleSummary } from './admin-report.types';

jest.mock('@servease/common', () => ({
  createApicenterClient: jest.fn(),
}));

const mockCreateApicenterClient = createApicenterClient as jest.Mock;

function schedule(
  overrides: Partial<AdminReportScheduleSummary> = {},
): AdminReportScheduleSummary {
  return {
    id: 'schedule-1',
    adminUserId: 'admin-1',
    type: 'financial',
    format: 'pdf',
    status: 'scheduled',
    name: 'Weekly finance',
    frequency: 'weekly',
    recipients: ['finance@example.com'],
    nextRunAt: '2026-05-18T08:00:00.000Z',
    createdAt: '2026-05-01T08:00:00.000Z',
    downloadPath: '/v1/admin/reports/financial.pdf',
    lastDeliveredAt: null,
    lastDeliveryError: null,
    deliveryCount: 0,
    ...overrides,
  };
}

describe('AdminReportDeliveryService', () => {
  beforeEach(() => {
    mockCreateApicenterClient.mockReset();
  });

  it('sends due report schedules through APICenter email and advances the schedule', async () => {
    const emailSend = jest.fn().mockResolvedValue({
      messageId: 'message-1',
      provider: 'resend',
      status: 'queued',
    });
    mockCreateApicenterClient.mockReturnValue({ emailSend });

    const dueSchedule = schedule();
    const reportService = {
      listDueSchedules: jest.fn().mockResolvedValue([dueSchedule]),
      markScheduleDelivered: jest.fn().mockResolvedValue(dueSchedule),
      markScheduleDeliveryFailed: jest.fn(),
      summarizeDeliveryResults: jest
        .fn()
        .mockImplementation((errors, attempted) => ({
          attempted,
          delivered: attempted - errors.length,
          failed: errors.length,
          errors,
        })),
    } as unknown as AdminReportService;
    const configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          APICENTER_URL: 'https://apicenter.test/',
          APICENTER_TRIBE_ID: 'servease-admin',
          APICENTER_TRIBE_SECRET: 'secret',
          ADMIN_REPORT_DOWNLOAD_BASE_URL: 'https://admin.servease.test',
        };
        return values[key];
      }),
    } as unknown as ConfigService;

    const service = new AdminReportDeliveryService(
      configService,
      reportService,
    );
    const result = await service.runDueSchedules(
      new Date('2026-05-18T08:00:00.000Z'),
      5,
    );

    expect(mockCreateApicenterClient).toHaveBeenCalledWith({
      APICENTER_URL: 'https://apicenter.test/',
      APICENTER_TRIBE_ID: 'servease-admin',
      APICENTER_TRIBE_SECRET: 'secret',
    });
    expect(emailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: [{ email: 'finance@example.com' }],
        subject: 'ServEase scheduled financial report',
        metadata: {
          scheduleId: 'schedule-1',
          reportType: 'financial',
          format: 'pdf',
        },
      }),
    );
    expect(emailSend.mock.calls[0][0].text).toContain(
      'https://admin.servease.test/v1/admin/reports/financial.pdf',
    );
    expect(reportService.markScheduleDelivered).toHaveBeenCalledWith(
      dueSchedule,
      new Date('2026-05-18T08:00:00.000Z'),
    );
    expect(result).toEqual({
      attempted: 1,
      delivered: 1,
      failed: 0,
      errors: [],
    });
  });

  it('records failed APICenter delivery attempts', async () => {
    mockCreateApicenterClient.mockReturnValue({
      emailSend: jest.fn().mockRejectedValue(new Error('email denied')),
    });

    const dueSchedule = schedule();
    const reportService = {
      listDueSchedules: jest.fn().mockResolvedValue([dueSchedule]),
      markScheduleDelivered: jest.fn(),
      markScheduleDeliveryFailed: jest.fn().mockResolvedValue(dueSchedule),
      summarizeDeliveryResults: jest
        .fn()
        .mockImplementation((errors, attempted) => ({
          attempted,
          delivered: attempted - errors.length,
          failed: errors.length,
          errors,
        })),
    } as unknown as AdminReportService;
    const configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          APICENTER_URL: 'https://apicenter.test',
          APICENTER_TRIBE_ID: 'servease-admin',
          APICENTER_TRIBE_SECRET: 'secret',
        };
        return values[key];
      }),
    } as unknown as ConfigService;

    const service = new AdminReportDeliveryService(
      configService,
      reportService,
    );
    const result = await service.runDueSchedules();

    expect(reportService.markScheduleDelivered).not.toHaveBeenCalled();
    expect(reportService.markScheduleDeliveryFailed).toHaveBeenCalledWith(
      'schedule-1',
      'email denied',
    );
    expect(result).toEqual({
      attempted: 1,
      delivered: 0,
      failed: 1,
      errors: [{ scheduleId: 'schedule-1', errorMessage: 'email denied' }],
    });
  });
});
