import { CurrentUserService } from '../current-user/current-user.service';
import { AuthTokenService } from '../current-user/auth-token.service';
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
          role: 'admin',
          status: 'active',
        },
      }),
    } as unknown as CurrentUserService;
    const adminPaymentGatewayService = {
      updatePaymentStatus: jest.fn().mockResolvedValue({
        id: 'payment-1',
        status: 'paid',
      }),
    } as unknown as AdminPaymentGatewayService;
    const controller = new AdminPaymentController(
      adminPaymentGatewayService,
      authTokenService,
      currentUserService,
    );

    const response = await controller.updatePaymentStatus(
      'Bearer token',
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

  it('rejects invalid payment status without calling the admin service', async () => {
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('admin-user-1'),
    } as unknown as AuthTokenService;
    const currentUserService = {
      getCurrentUser: jest.fn().mockResolvedValue({
        user: {
          id: 'admin-user-1',
          role: 'admin',
          status: 'active',
        },
      }),
    } as unknown as CurrentUserService;
    const adminPaymentGatewayService = {
      updatePaymentStatus: jest.fn(),
    } as unknown as AdminPaymentGatewayService;
    const controller = new AdminPaymentController(
      adminPaymentGatewayService,
      authTokenService,
      currentUserService,
    );

    await expect(
      controller.updatePaymentStatus('Bearer token', 'payment-1', {
        status: 'archived',
      }),
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
});
