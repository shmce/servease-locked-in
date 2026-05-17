import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { AdminBookingGatewayService } from './admin-booking.service';
import { AdminPaymentGatewayService } from './admin-payment.service';
import { AdminUsersGatewayService } from './admin-users.service';
import { AdminReportController } from './admin-report.controller';
import { AdminServiceClient } from './clients/admin-service.client';

function makeController(overrides?: {
  bookings?: AdminBookingGatewayService;
  payments?: AdminPaymentGatewayService;
  users?: AdminUsersGatewayService;
  admin?: AdminServiceClient;
}): AdminReportController {
  const adminBookingGatewayService =
    overrides?.bookings ??
    ({
      listBookings: jest.fn().mockResolvedValue([]),
    } as unknown as AdminBookingGatewayService);

  const adminPaymentGatewayService =
    overrides?.payments ??
    ({
      listPayments: jest.fn().mockResolvedValue([]),
      listPayouts: jest.fn().mockResolvedValue([]),
      listRefunds: jest.fn().mockResolvedValue([]),
    } as unknown as AdminPaymentGatewayService);

  const adminUsersGatewayService =
    overrides?.users ??
    ({
      listUsers: jest.fn().mockResolvedValue([]),
    } as unknown as AdminUsersGatewayService);
  const adminServiceClient =
    overrides?.admin ??
    ({
      listAdminReportSchedules: jest.fn().mockResolvedValue([]),
      createAdminReportSchedule: jest.fn().mockResolvedValue({
        id: 'schedule-1',
        adminUserId: 'admin-1',
        type: 'financial',
        format: 'pdf',
        status: 'scheduled',
        name: 'Weekly finance report',
        frequency: 'weekly',
        recipients: ['finance@example.com'],
        nextRunAt: '2026-05-25T00:00:00.000Z',
        createdAt: '2026-05-18T00:00:00.000Z',
        downloadPath: '/v1/admin/reports/financial.pdf',
      }),
    } as unknown as AdminServiceClient);

  return new AdminReportController(
    {
      authenticate: jest.fn().mockResolvedValue('admin-1'),
    } as unknown as AuthTokenService,
    {
      getCurrentUser: jest.fn().mockResolvedValue({
        user: { id: 'admin-1', role: 'admin' },
      }),
    } as unknown as CurrentUserService,
    adminBookingGatewayService,
    adminPaymentGatewayService,
    adminUsersGatewayService,
    adminServiceClient,
  );
}

describe('AdminReportController', () => {
  it('exports revenue as a PDF payload for admins', async () => {
    const adminPaymentGatewayService = {
      listPayments: jest.fn().mockResolvedValue([
        {
          id: 'pay-1',
          bookingId: 'book-1',
          customerId: 'customer-1',
          providerId: 'provider-1',
          amount: 1500,
          platformFee: 150,
          providerPayout: 1350,
          status: 'paid',
          paymentMethod: 'gcash',
          paidAt: '2026-05-18T08:30:00.000Z',
          createdAt: '2026-05-18T08:00:00.000Z',
        },
      ]),
      listPayouts: jest.fn(),
      listRefunds: jest.fn(),
    } as unknown as AdminPaymentGatewayService;
    const controller = makeController({ payments: adminPaymentGatewayService });

    const pdf = await controller.reportPdf('revenue', 'Bearer token');

    expect(adminPaymentGatewayService.listPayments).toHaveBeenCalled();
    expect(pdf).toContain('%PDF-1.4');
    expect(pdf).toContain('ServEase Revenue Report');
    expect(pdf).toContain('pay-1');
  });

  it('generates report metadata with a gateway download path', async () => {
    const adminUsersGatewayService = {
      listUsers: jest.fn().mockResolvedValue([
        {
          id: 'user-1',
          email: 'casey@example.com',
          fullName: 'Casey Customer',
          contactNumber: '+639170000000',
          role: 'customer',
          status: 'active',
          createdAt: '2026-05-01T00:00:00.000Z',
        },
      ]),
    } as unknown as AdminUsersGatewayService;
    const controller = makeController({ users: adminUsersGatewayService });

    const report = await controller.generate('users', 'Bearer token', {
      format: 'csv',
      dateRange: 'last-30-days',
    });

    expect(adminUsersGatewayService.listUsers).toHaveBeenCalledWith(
      null,
      null,
      null,
    );
    expect(report.data).toMatchObject({
      type: 'users',
      format: 'csv',
      status: 'ready',
      fileName: expect.stringMatching(/^servease-users-/),
      downloadPath: '/v1/admin/reports/users.csv',
      rowCount: 1,
    });
  });

  it('schedules report delivery metadata for admins', async () => {
    const adminServiceClient = {
      createAdminReportSchedule: jest.fn().mockResolvedValue({
        id: 'schedule-1',
        adminUserId: 'admin-1',
        type: 'financial',
        format: 'pdf',
        status: 'scheduled',
        name: 'Weekly finance report',
        frequency: 'weekly',
        recipients: ['finance@example.com'],
        nextRunAt: '2026-05-25T00:00:00.000Z',
        createdAt: '2026-05-18T00:00:00.000Z',
        downloadPath: '/v1/admin/reports/financial.pdf',
      }),
    } as unknown as AdminServiceClient;
    const controller = makeController({ admin: adminServiceClient });

    const schedule = await controller.schedule('financial', 'Bearer token', {
      name: 'Weekly finance report',
      frequency: 'weekly',
      recipients: ['finance@example.com'],
      format: 'pdf',
    });

    expect(schedule.data).toMatchObject({
      type: 'financial',
      format: 'pdf',
      status: 'scheduled',
      name: 'Weekly finance report',
      frequency: 'weekly',
      recipients: ['finance@example.com'],
      nextRunAt: expect.any(String),
      downloadPath: '/v1/admin/reports/financial.pdf',
    });
    expect(adminServiceClient.createAdminReportSchedule).toHaveBeenCalledWith({
      adminUserId: 'admin-1',
      type: 'financial',
      format: 'pdf',
      name: 'Weekly finance report',
      frequency: 'weekly',
      recipients: ['finance@example.com'],
    });
  });

  it('lists persisted report schedules for admins', async () => {
    const adminServiceClient = {
      listAdminReportSchedules: jest.fn().mockResolvedValue([
        {
          id: 'schedule-1',
          adminUserId: 'admin-1',
          type: 'users',
          format: 'csv',
          status: 'scheduled',
          name: 'Weekly users',
          frequency: 'weekly',
          recipients: ['ops@example.com'],
          nextRunAt: '2026-05-25T00:00:00.000Z',
          createdAt: '2026-05-18T00:00:00.000Z',
          downloadPath: '/v1/admin/reports/users.csv',
        },
      ]),
    } as unknown as AdminServiceClient;
    const controller = makeController({ admin: adminServiceClient });

    const schedules = await controller.listSchedules('users', 'Bearer token');

    expect(adminServiceClient.listAdminReportSchedules).toHaveBeenCalledWith(
      'users',
      100,
    );
    expect(schedules.data).toHaveLength(1);
    expect(schedules.data[0]).toMatchObject({
      id: 'schedule-1',
      type: 'users',
      name: 'Weekly users',
    });
  });

  it('rejects unsupported report types', async () => {
    const controller = makeController();

    await expect(
      controller.generate('inventory', 'Bearer token', { format: 'csv' }),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'invalid_report_type',
        },
      },
      status: 400,
    });
  });

  it('rejects unsupported report formats', async () => {
    const controller = makeController();

    await expect(
      controller.generate('revenue', 'Bearer token', { format: 'xlsx' }),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'invalid_report_format',
        },
      },
      status: 400,
    });
  });

  it('rejects schedules without recipients', async () => {
    const controller = makeController();

    await expect(
      controller.schedule('financial', 'Bearer token', {
        name: 'Weekly finance report',
        frequency: 'weekly',
        recipients: [],
        format: 'pdf',
      }),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'invalid_report_schedule',
        },
      },
      status: 400,
    });
  });

  it('exports booking analytics as CSV for admins', async () => {
    const adminBookingGatewayService = {
      listBookings: jest.fn().mockResolvedValue([
        {
          bookingReference: 'SRV-001',
          customerFullName: 'Casey Customer',
          customerId: 'customer-1',
          providerId: 'provider-1',
          serviceTitle: 'Deep Cleaning',
          serviceAddress: 'Makati, Metro Manila',
          scheduledAt: '2026-05-18T08:00:00.000Z',
          status: 'completed',
          totalAmount: 1500,
          cancelReason: null,
          cancelExplanation: null,
          createdAt: '2026-05-16T00:00:00.000Z',
        },
      ]),
    } as unknown as AdminBookingGatewayService;
    const controller = makeController({ bookings: adminBookingGatewayService });

    const csv = await controller.bookingsCsv('Bearer token');

    expect(adminBookingGatewayService.listBookings).toHaveBeenCalledWith({
      limit: 1000,
      query: null,
      status: null,
    });
    expect(csv).toContain('bookingReference,customer,providerId');
    expect(csv).toContain('SRV-001,Casey Customer,provider-1');
  });

  it('exports revenue payments as CSV for admins', async () => {
    const adminPaymentGatewayService = {
      listPayments: jest.fn().mockResolvedValue([
        {
          id: 'pay-1',
          bookingId: 'book-1',
          customerId: 'customer-1',
          providerId: 'provider-1',
          amount: 1500,
          platformFee: 150,
          providerPayout: 1350,
          status: 'paid',
          paymentMethod: 'gcash',
          paidAt: '2026-05-18T08:30:00.000Z',
          createdAt: '2026-05-18T08:00:00.000Z',
        },
      ]),
      listPayouts: jest.fn(),
      listRefunds: jest.fn(),
    } as unknown as AdminPaymentGatewayService;
    const controller = makeController({ payments: adminPaymentGatewayService });

    const csv = await controller.revenueCsv('Bearer token');

    expect(adminPaymentGatewayService.listPayments).toHaveBeenCalled();
    expect(csv).toContain('paymentId,bookingId,customerId');
    expect(csv).toContain('pay-1,book-1,customer-1,provider-1,1500');
  });

  it('exports users as CSV for admins', async () => {
    const adminUsersGatewayService = {
      listUsers: jest.fn().mockResolvedValue([
        {
          id: 'user-1',
          email: 'casey@example.com',
          fullName: 'Casey Customer',
          contactNumber: '+639170000000',
          role: 'customer',
          status: 'active',
          createdAt: '2026-05-01T00:00:00.000Z',
        },
      ]),
    } as unknown as AdminUsersGatewayService;
    const controller = makeController({ users: adminUsersGatewayService });

    const csv = await controller.usersCsv('Bearer token');

    expect(adminUsersGatewayService.listUsers).toHaveBeenCalledWith(
      null,
      null,
      null,
    );
    expect(csv).toContain('userId,email,fullName');
    expect(csv).toContain('user-1,casey@example.com,Casey Customer');
  });

  it('exports financial records (payments + payouts + refunds) as CSV', async () => {
    const adminPaymentGatewayService = {
      listPayments: jest.fn().mockResolvedValue([
        {
          id: 'pay-1',
          bookingId: 'book-1',
          customerId: 'customer-1',
          providerId: 'provider-1',
          amount: 1500,
          platformFee: 150,
          providerPayout: 1350,
          status: 'paid',
          paymentMethod: 'gcash',
          paidAt: '2026-05-18T08:30:00.000Z',
          createdAt: '2026-05-18T08:00:00.000Z',
        },
      ]),
      listPayouts: jest.fn().mockResolvedValue([
        {
          id: 'payout-1',
          providerId: 'provider-1',
          amount: 1350,
          processingFee: 50,
          netAmount: 1300,
          status: 'paid',
          payoutMethodId: 'method-1',
          methodType: 'bank',
          accountLabel: 'BPI',
          reference: 'PAYOUT-001',
          periodStart: null,
          periodEnd: null,
          requestedAt: '2026-05-19T00:00:00.000Z',
          paidAt: '2026-05-19T12:00:00.000Z',
          createdAt: '2026-05-19T00:00:00.000Z',
        },
      ]),
      listRefunds: jest.fn().mockResolvedValue([
        {
          id: 'refund-1',
          paymentId: 'pay-2',
          bookingId: 'book-2',
          customerId: 'customer-2',
          providerId: 'provider-2',
          amount: 500,
          reason: 'No-show',
          status: 'processed',
          requestedAt: '2026-05-18T09:00:00.000Z',
          decidedBy: 'admin-1',
          decisionReason: 'approved',
          decidedAt: '2026-05-18T10:00:00.000Z',
          processedAt: '2026-05-18T10:30:00.000Z',
          createdAt: '2026-05-18T09:00:00.000Z',
        },
      ]),
    } as unknown as AdminPaymentGatewayService;
    const controller = makeController({ payments: adminPaymentGatewayService });

    const csv = await controller.financialCsv('Bearer token');

    expect(csv).toContain('recordType,id,relatedId');
    expect(csv).toContain('payment,pay-1,book-1');
    expect(csv).toContain('payout,payout-1,PAYOUT-001');
    expect(csv).toContain('refund,refund-1,pay-2');
  });
});
