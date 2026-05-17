import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { AdminBookingGatewayService } from './admin-booking.service';
import { AdminPaymentGatewayService } from './admin-payment.service';
import { AdminUsersGatewayService } from './admin-users.service';
import { AdminReportController } from './admin-report.controller';

function makeController(overrides?: {
  bookings?: AdminBookingGatewayService;
  payments?: AdminPaymentGatewayService;
  users?: AdminUsersGatewayService;
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
  );
}

describe('AdminReportController', () => {
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
