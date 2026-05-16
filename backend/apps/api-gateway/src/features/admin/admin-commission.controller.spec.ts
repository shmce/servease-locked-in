import { CurrentUserService } from '../current-user/current-user.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminCommissionController } from './admin-commission.controller';
import { AdminPaymentGatewayService } from './admin-payment.service';

describe('AdminCommissionController', () => {
  function buildController() {
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
      updateCommissionRule: jest.fn().mockResolvedValue({
        id: 'platform-default',
        categoryKey: 'platform-default',
        categoryLabel: 'Platform Default',
        currentRate: 16,
        previousRate: 15,
        status: 'active',
      }),
    } as unknown as AdminPaymentGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    } as unknown as AdminAuditGatewayService;

    return {
      adminPaymentGatewayService,
      controller: new AdminCommissionController(
        adminPaymentGatewayService,
        adminAuditGatewayService,
        authTokenService,
        currentUserService,
      ),
      currentUserService,
    };
  }

  it('updates commission rules only after resolving an admin user', async () => {
    const { adminPaymentGatewayService, controller, currentUserService } =
      buildController();

    const response = await controller.update(
      'Bearer token',
      { headers: {}, socket: {} },
      'platform-default',
      { currentRate: 16, status: 'active' },
    );

    expect(currentUserService.getCurrentUser).toHaveBeenCalledWith('admin-user-1');
    expect(adminPaymentGatewayService.updateCommissionRule).toHaveBeenCalledWith(
      'platform-default',
      {
        currentRate: 16,
        status: 'active',
        adminUserId: 'admin-user-1',
      },
    );
    expect(response.data.currentRate).toBe(16);
  });

  it('rejects invalid commission rates before calling admin service', async () => {
    const { adminPaymentGatewayService, controller } = buildController();

    await expect(
      controller.update(
        'Bearer token',
        { headers: {}, socket: {} },
        'platform-default',
        { currentRate: 101, status: 'active' },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        error: expect.objectContaining({
          code: 'invalid_admin_request',
        }),
      }),
      status: 400,
    });
    expect(adminPaymentGatewayService.updateCommissionRule).not.toHaveBeenCalled();
  });
});
