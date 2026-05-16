import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { AdminBookingGatewayService } from './admin-booking.service';
import { AdminReportController } from './admin-report.controller';

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
    const controller = new AdminReportController(
      { authenticate: jest.fn().mockResolvedValue('admin-1') } as unknown as AuthTokenService,
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: { id: 'admin-1', role: 'admin' },
        }),
      } as unknown as CurrentUserService,
      adminBookingGatewayService,
    );

    const csv = await controller.bookingsCsv('Bearer token');

    expect(adminBookingGatewayService.listBookings).toHaveBeenCalledWith({
      limit: 1000,
      query: null,
      status: null,
    });
    expect(csv).toContain('bookingReference,customer,providerId');
    expect(csv).toContain('SRV-001,Casey Customer,provider-1');
  });
});
