import { CurrentUserService } from '../current-user/current-user.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminPaymentGatewayService } from './admin-payment.service';
import { AdminRefundController } from './admin-refund.controller';

describe('AdminRefundController', () => {
  function buildController({
    auditFailure,
  }: { auditFailure?: Error } = {}) {
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('admin-user-1'),
    } as unknown as AuthTokenService;
    const currentUserService = {
      getCurrentUser: jest.fn().mockResolvedValue({
        user: {
          id: 'admin-user-1',
          email: 'admin@example.com',
          fullName: 'Admin User',
          role: 'admin',
          status: 'active',
        },
      }),
    } as unknown as CurrentUserService;
    const adminPaymentGatewayService = {
      approveRefund: jest.fn().mockResolvedValue({
        id: 'refund-1',
        paymentId: 'payment-1',
        bookingId: 'booking-1',
        status: 'approved',
      }),
      rejectRefund: jest.fn().mockResolvedValue({
        id: 'refund-1',
        paymentId: 'payment-1',
        bookingId: 'booking-1',
        status: 'rejected',
      }),
    } as unknown as AdminPaymentGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: auditFailure
        ? jest.fn().mockRejectedValue(auditFailure)
        : jest.fn().mockResolvedValue({ id: 'audit-1' }),
    } as unknown as AdminAuditGatewayService;

    return {
      adminAuditGatewayService,
      adminPaymentGatewayService,
      controller: new AdminRefundController(
        adminPaymentGatewayService,
        adminAuditGatewayService,
        authTokenService,
        currentUserService,
      ),
      currentUserService,
    };
  }

  it('approves refunds only after resolving an admin user', async () => {
    const { adminPaymentGatewayService, controller, currentUserService } =
      buildController();

    const response = await controller.approve(
      'Bearer token',
      { headers: {}, socket: {} },
      'refund-1',
      { reason: 'Approved' },
    );

    expect(currentUserService.getCurrentUser).toHaveBeenCalledWith('admin-user-1');
    expect(adminPaymentGatewayService.approveRefund).toHaveBeenCalledWith(
      'refund-1',
      'admin-user-1',
      'Approved',
    );
    expect(response.data.status).toBe('approved');
  });

  it('keeps refund approval successful when audit logging fails', async () => {
    const { adminAuditGatewayService, controller } = buildController({
      auditFailure: new Error('audit unavailable'),
    });
    const warnSpy = jest
      .spyOn(controller['logger'], 'warn')
      .mockImplementation(() => undefined);

    const response = await controller.approve(
      'Bearer token',
      { headers: {}, socket: {} },
      'refund-1',
      { reason: 'Approved' },
    );

    expect(adminAuditGatewayService.createAuditLog).toHaveBeenCalled();
    expect(response.data.status).toBe('approved');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Could not create refund audit log'),
    );
    warnSpy.mockRestore();
  });

  it('rejects refunds with a required reason before calling admin service', async () => {
    const { adminPaymentGatewayService, controller } = buildController();

    await expect(
      controller.reject(
        'Bearer token',
        { headers: {}, socket: {} },
        'refund-1',
        { reason: ' ' },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        error: expect.objectContaining({
          code: 'invalid_admin_request',
        }),
      }),
      status: 400,
    });
    expect(adminPaymentGatewayService.rejectRefund).not.toHaveBeenCalled();
  });
});
