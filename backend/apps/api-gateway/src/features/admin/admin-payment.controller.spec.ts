import { CurrentUserService } from '../current-user/current-user.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminPaymentController } from './admin-payment.controller';
import { AdminPaymentGatewayService } from './admin-payment.service';

describe('AdminPaymentController', () => {
  it('updates payment status only after resolving an admin user', async () => {
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
      updatePaymentStatus: jest.fn().mockResolvedValue({
        id: 'payment-1',
        bookingId: 'booking-1',
        status: 'paid',
      }),
    } as unknown as AdminPaymentGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    } as unknown as AdminAuditGatewayService;
    const controller = new AdminPaymentController(
      adminPaymentGatewayService,
      adminAuditGatewayService,
      authTokenService,
      currentUserService,
    );

    const response = await controller.updatePaymentStatus(
      'Bearer token',
      { headers: {}, socket: {} },
      'payment-1',
      { status: 'paid' },
    );

    expect(currentUserService.getCurrentUser).toHaveBeenCalledWith('admin-user-1');
    expect(adminPaymentGatewayService.updatePaymentStatus).toHaveBeenCalledWith(
      'payment-1',
      'paid',
    );
    expect(response.data.status).toBe('paid');
  });

  it('keeps payment status updates successful when audit logging fails', async () => {
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
      updatePaymentStatus: jest.fn().mockResolvedValue({
        id: 'payment-1',
        bookingId: 'booking-1',
        status: 'paid',
      }),
    } as unknown as AdminPaymentGatewayService;
    const controller = new AdminPaymentController(
      adminPaymentGatewayService,
      {
        createAuditLog: jest
          .fn()
          .mockRejectedValue(new Error('audit unavailable')),
      } as unknown as AdminAuditGatewayService,
      authTokenService,
      currentUserService,
    );
    const warnSpy = jest
      .spyOn(controller['logger'], 'warn')
      .mockImplementation(() => undefined);

    const response = await controller.updatePaymentStatus(
      'Bearer token',
      { headers: {}, socket: {} },
      'payment-1',
      { status: 'paid' },
    );

    expect(response.data.status).toBe('paid');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Could not create payment audit log'),
    );
    warnSpy.mockRestore();
  });

  it('rejects invalid payment status without calling the admin service', async () => {
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
      updatePaymentStatus: jest.fn(),
    } as unknown as AdminPaymentGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn(),
    } as unknown as AdminAuditGatewayService;
    const controller = new AdminPaymentController(
      adminPaymentGatewayService,
      adminAuditGatewayService,
      authTokenService,
      currentUserService,
    );

    await expect(
      controller.updatePaymentStatus(
        'Bearer token',
        { headers: {}, socket: {} },
        'payment-1',
        {
          status: 'archived',
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        error: expect.objectContaining({
          code: 'invalid_admin_request',
        }),
      }),
      status: 400,
    });
    expect(adminPaymentGatewayService.updatePaymentStatus).not.toHaveBeenCalled();
  });

  it('syncs payment status with APICenter and writes an audit log', async () => {
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
      syncPaymentWithApicenter: jest.fn().mockResolvedValue({
        id: 'payment-1',
        bookingId: 'booking-1',
        status: 'paid',
        apicenterCheckoutId: 'checkout-1',
        apicenterCheckoutStatus: 'paid',
      }),
    } as unknown as AdminPaymentGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    } as unknown as AdminAuditGatewayService;
    const controller = new AdminPaymentController(
      adminPaymentGatewayService,
      adminAuditGatewayService,
      authTokenService,
      currentUserService,
    );

    const response = await controller.syncPaymentWithApicenter(
      'Bearer token',
      { headers: {}, socket: {} },
      'payment-1',
    );

    expect(adminPaymentGatewayService.syncPaymentWithApicenter).toHaveBeenCalledWith(
      'payment-1',
    );
    expect(adminAuditGatewayService.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'Synced payment with APICenter',
        entityId: 'payment-1',
      }),
    );
    expect(response.data.apicenterCheckoutStatus).toBe('paid');
  });

  it('releases a paid payment to provider payout after resolving an admin user', async () => {
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
      releasePaymentToProvider: jest.fn().mockResolvedValue({
        id: 'payout-1',
        providerId: 'provider-1',
        reference: 'PO-ABC123',
        status: 'processing',
      }),
    } as unknown as AdminPaymentGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    } as unknown as AdminAuditGatewayService;
    const controller = new AdminPaymentController(
      adminPaymentGatewayService,
      adminAuditGatewayService,
      authTokenService,
      currentUserService,
    );

    const response = await controller.releasePaymentToProvider(
      'Bearer token',
      { headers: {}, socket: {} },
      'payment-1',
      { note: 'Release after completion' },
    );

    expect(adminPaymentGatewayService.releasePaymentToProvider).toHaveBeenCalledWith(
      'payment-1',
      'admin-user-1',
      'Release after completion',
    );
    expect(adminAuditGatewayService.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'Released payment to provider payout',
        entityId: 'payment-1',
        metadata: expect.objectContaining({
          payoutId: 'payout-1',
          status: 'processing',
        }),
      }),
    );
    expect(response.data.id).toBe('payout-1');
  });
});
