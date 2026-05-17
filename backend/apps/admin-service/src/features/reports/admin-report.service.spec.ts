import { InvalidAdminReportScheduleRequestError } from './admin-report.errors';
import { AdminReportService } from './admin-report.service';
import { SupabaseAdminReportRepository } from './supabase-admin-report.repository';

describe('AdminReportService', () => {
  it('persists a valid report schedule with next-run and download metadata', async () => {
    const repository = {
      createSchedule: jest.fn().mockImplementation(async (input) => ({
        id: 'schedule-1',
        adminUserId: input.adminUserId,
        type: input.type,
        format: input.format,
        status: 'scheduled',
        name: input.name,
        frequency: input.frequency,
        recipients: input.recipients,
        nextRunAt: input.nextRunAt,
        createdAt: '2026-05-18T00:00:00.000Z',
        downloadPath: input.downloadPath,
        lastDeliveredAt: null,
        lastDeliveryError: null,
        deliveryCount: 0,
      })),
    } as unknown as SupabaseAdminReportRepository;
    const service = new AdminReportService(repository);

    const schedule = await service.createSchedule({
      adminUserId: 'admin-1',
      type: 'financial',
      format: 'pdf',
      name: ' Weekly finance ',
      frequency: 'weekly',
      recipients: [' finance@example.com ', 'invalid'],
    });

    expect(repository.createSchedule).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: 'admin-1',
        type: 'financial',
        format: 'pdf',
        name: 'Weekly finance',
        frequency: 'weekly',
        recipients: ['finance@example.com'],
        downloadPath: '/v1/admin/reports/financial.pdf',
      }),
    );
    expect(schedule.nextRunAt).toEqual(expect.any(String));
  });

  it('rejects schedules without valid recipients', async () => {
    const service = new AdminReportService({
      createSchedule: jest.fn(),
    } as unknown as SupabaseAdminReportRepository);

    expect(() =>
      service.createSchedule({
        adminUserId: 'admin-1',
        type: 'users',
        format: 'csv',
        name: 'Users',
        frequency: 'daily',
        recipients: ['not-an-email'],
      }),
    ).toThrow(InvalidAdminReportScheduleRequestError);
  });

  it('lists due schedules with a bounded worker limit', async () => {
    const repository = {
      listDueSchedules: jest.fn().mockResolvedValue([]),
    } as unknown as SupabaseAdminReportRepository;
    const service = new AdminReportService(repository);
    const now = new Date('2026-05-18T08:00:00.000Z');

    await service.listDueSchedules(now, 10);

    expect(repository.listDueSchedules).toHaveBeenCalledWith(
      '2026-05-18T08:00:00.000Z',
      10,
    );
  });

  it('marks delivered schedules with the next run based on frequency', async () => {
    const repository = {
      markScheduleDelivered: jest.fn().mockResolvedValue({}),
    } as unknown as SupabaseAdminReportRepository;
    const service = new AdminReportService(repository);

    await service.markScheduleDelivered(
      {
        id: 'schedule-1',
        adminUserId: 'admin-1',
        type: 'users',
        format: 'csv',
        status: 'scheduled',
        name: 'Users',
        frequency: 'daily',
        recipients: ['ops@example.com'],
        nextRunAt: '2026-05-18T08:00:00.000Z',
        createdAt: '2026-05-17T08:00:00.000Z',
        downloadPath: '/v1/admin/reports/users.csv',
        lastDeliveredAt: null,
        lastDeliveryError: null,
        deliveryCount: 0,
      },
      new Date('2026-05-18T08:00:00.000Z'),
    );

    expect(repository.markScheduleDelivered).toHaveBeenCalledWith({
      scheduleId: 'schedule-1',
      nextRunAt: '2026-05-19T08:00:00.000Z',
    });
  });

  it('summarizes delivery attempts and failures', () => {
    const service = new AdminReportService({
      createSchedule: jest.fn(),
    } as unknown as SupabaseAdminReportRepository);

    expect(
      service.summarizeDeliveryResults(
        [{ scheduleId: 'schedule-1', errorMessage: 'failed' }],
        3,
      ),
    ).toEqual({
      attempted: 3,
      delivered: 2,
      failed: 1,
      errors: [{ scheduleId: 'schedule-1', errorMessage: 'failed' }],
    });
  });
});
