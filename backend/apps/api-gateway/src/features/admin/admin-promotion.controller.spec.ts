import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminPaymentGatewayService } from './admin-payment.service';
import { AdminPromotionController } from './admin-promotion.controller';

describe('AdminPromotionController', () => {
  it('lists promotions only after admin authentication', async () => {
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
        },
      }),
    } as unknown as CurrentUserService;
    const adminPaymentGatewayService = {
      listPromotions: jest.fn().mockResolvedValue([
        {
          id: 'promo-1',
          code: 'SERVEASE10',
          status: 'active',
        },
      ]),
    } as unknown as AdminPaymentGatewayService;
    const controller = new AdminPromotionController(
      adminPaymentGatewayService,
      { createAuditLog: jest.fn() } as unknown as AdminAuditGatewayService,
      authTokenService,
      currentUserService,
    );

    const response = await controller.list('Bearer token', 'active');

    expect(authTokenService.authenticate).toHaveBeenCalledWith('Bearer token');
    expect(adminPaymentGatewayService.listPromotions).toHaveBeenCalledWith(
      'active',
    );
    expect(response.data[0].code).toBe('SERVEASE10');
  });

  it('creates promotions through the admin service after validation', async () => {
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
        },
      }),
    } as unknown as CurrentUserService;
    const adminPaymentGatewayService = {
      createPromotion: jest.fn().mockResolvedValue({
        id: 'promo-1',
        code: 'SERVEASE10',
      }),
    } as unknown as AdminPaymentGatewayService;
    const controller = new AdminPromotionController(
      adminPaymentGatewayService,
      { createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }) } as unknown as AdminAuditGatewayService,
      authTokenService,
      currentUserService,
    );

    const response = await controller.create(
      'Bearer token',
      { headers: {}, socket: {} },
      {
        code: 'SERVEASE10',
        discountType: 'percent',
        discountValue: 10,
        minOrderAmount: 500,
      },
    );

    expect(adminPaymentGatewayService.createPromotion).toHaveBeenCalledWith({
      code: 'SERVEASE10',
      discountType: 'percent',
      discountValue: 10,
      minOrderAmount: 500,
    });
    expect(response.data.id).toBe('promo-1');
  });

  it('keeps promotion creation successful when audit logging fails', async () => {
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
        },
      }),
    } as unknown as CurrentUserService;
    const adminPaymentGatewayService = {
      createPromotion: jest.fn().mockResolvedValue({
        id: 'promo-1',
        code: 'SERVEASE10',
      }),
    } as unknown as AdminPaymentGatewayService;
    const controller = new AdminPromotionController(
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

    const response = await controller.create(
      'Bearer token',
      { headers: {}, socket: {} },
      {
        code: 'SERVEASE10',
        discountType: 'percent',
        discountValue: 10,
        minOrderAmount: 500,
      },
    );

    expect(response.data.id).toBe('promo-1');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Could not create promotion audit log'),
    );
    warnSpy.mockRestore();
  });
});
