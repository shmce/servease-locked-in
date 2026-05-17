import { CurrentUserService } from '../current-user/current-user.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminPaymentGatewayService } from './admin-payment.service';
import { AdminSettlementController } from './admin-settlement.controller';

describe('AdminSettlementController', () => {
  it('lists settlements from payout requests for admin finance review', async () => {
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
      listPayouts: jest.fn().mockResolvedValue([
        {
          id: 'payout-1',
          providerId: 'provider-1',
          status: 'requested',
        },
      ]),
    } as unknown as AdminPaymentGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn(),
    } as unknown as AdminAuditGatewayService;
    const controller = new AdminSettlementController(
      adminPaymentGatewayService,
      adminAuditGatewayService,
      authTokenService,
      currentUserService,
    );

    const response = await controller.list('Bearer token', 'requested');

    expect(adminPaymentGatewayService.listPayouts).toHaveBeenCalledWith(
      'requested',
    );
    expect(response.data).toHaveLength(1);
    expect(response.data[0].id).toBe('payout-1');
  });

  it('approves settlements by moving the payout to processing and auditing the action', async () => {
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
      updatePayoutStatus: jest.fn().mockResolvedValue({
        id: 'payout-1',
        providerId: 'provider-1',
        status: 'processing',
      }),
      recordPayoutEvent: jest.fn().mockResolvedValue({
        id: 'event-1',
        payoutId: 'payout-1',
      }),
    } as unknown as AdminPaymentGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    } as unknown as AdminAuditGatewayService;
    const controller = new AdminSettlementController(
      adminPaymentGatewayService,
      adminAuditGatewayService,
      authTokenService,
      currentUserService,
    );

    const response = await controller.approve(
      'Bearer token',
      { headers: {}, socket: {} },
      'payout-1',
    );

    expect(adminPaymentGatewayService.updatePayoutStatus).toHaveBeenCalledWith(
      'payout-1',
      'processing',
    );
    expect(adminPaymentGatewayService.recordPayoutEvent).toHaveBeenCalledWith(
      'payout-1',
      expect.objectContaining({
        eventType: 'approved',
        status: 'processing',
        adminUserId: 'admin-user-1',
      }),
    );
    expect(adminAuditGatewayService.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'Approved settlement for processing',
        actionType: 'approve',
        entityType: 'Settlement',
        entityId: 'payout-1',
        metadata: {
          payoutId: 'payout-1',
          providerId: 'provider-1',
          status: 'processing',
        },
      }),
    );
    expect(response.data.status).toBe('processing');
  });

  it('rejects settlements by cancelling the payout and auditing the action', async () => {
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
      updatePayoutStatus: jest.fn().mockResolvedValue({
        id: 'payout-1',
        providerId: 'provider-1',
        status: 'cancelled',
      }),
      recordPayoutEvent: jest.fn().mockResolvedValue({
        id: 'event-1',
        payoutId: 'payout-1',
      }),
    } as unknown as AdminPaymentGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    } as unknown as AdminAuditGatewayService;
    const controller = new AdminSettlementController(
      adminPaymentGatewayService,
      adminAuditGatewayService,
      authTokenService,
      currentUserService,
    );

    const response = await controller.reject(
      'Bearer token',
      { headers: {}, socket: {} },
      'payout-1',
    );

    expect(adminPaymentGatewayService.updatePayoutStatus).toHaveBeenCalledWith(
      'payout-1',
      'cancelled',
    );
    expect(adminPaymentGatewayService.recordPayoutEvent).toHaveBeenCalledWith(
      'payout-1',
      expect.objectContaining({
        eventType: 'rejected',
        status: 'cancelled',
        adminUserId: 'admin-user-1',
      }),
    );
    expect(adminAuditGatewayService.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'Rejected settlement payout',
        actionType: 'reject',
        entityType: 'Settlement',
        entityId: 'payout-1',
        metadata: {
          payoutId: 'payout-1',
          providerId: 'provider-1',
          status: 'cancelled',
        },
      }),
    );
    expect(response.data.status).toBe('cancelled');
  });
});
