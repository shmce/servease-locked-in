import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminBookingController } from './admin-booking.controller';
import { AdminBookingGatewayService } from './admin-booking.service';

describe('AdminBookingController', () => {
  it('notifies the provider owner when an admin escalates a booking', async () => {
    const adminBookingGatewayService = {
      escalateBooking: jest.fn().mockResolvedValue({
        id: 'booking-1',
        bookingReference: 'SRV-001',
        providerId: 'provider-1',
        serviceTitle: 'Home cleaning',
        latestEscalationPriority: 'high',
        latestEscalationReason: 'Customer reported no-show',
      }),
    } as unknown as AdminBookingGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    } as unknown as AdminAuditGatewayService;
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('admin-1'),
    } as unknown as AuthTokenService;
    const currentUserService = {
      getCurrentUser: jest.fn().mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@servease.test',
          fullName: 'Admin User',
          role: 'admin',
        },
      }),
    } as unknown as CurrentUserService;
    const catalogServiceClient = {
      findProviderOwnerByProviderId: jest.fn().mockResolvedValue({
        userId: 'provider-user-1',
      }),
    } as unknown as CatalogServiceClient;
    const notificationServiceClient = {
      createNotification: jest.fn().mockResolvedValue({
        id: 'notification-1',
      }),
    } as unknown as NotificationServiceClient;
    const controller = new AdminBookingController(
      adminBookingGatewayService,
      adminAuditGatewayService,
      authTokenService,
      currentUserService,
      catalogServiceClient,
      notificationServiceClient,
    );

    const response = await controller.escalate(
      'Bearer token',
      { headers: {}, socket: {} },
      'booking-1',
      { reason: 'Customer reported no-show', priority: 'high' },
    );

    expect(adminBookingGatewayService.escalateBooking).toHaveBeenCalledWith(
      'booking-1',
      'admin-1',
      { reason: 'Customer reported no-show', priority: 'high' },
    );
    expect(catalogServiceClient.findProviderOwnerByProviderId).toHaveBeenCalledWith(
      'provider-1',
    );
    expect(notificationServiceClient.createNotification).toHaveBeenCalledWith({
      userId: 'provider-user-1',
      type: 'admin_booking_escalated',
      title: 'Booking escalated by ServEase admin',
      body: 'Booking SRV-001 was escalated: Customer reported no-show',
      metadata: {
        bookingId: 'booking-1',
        bookingReference: 'SRV-001',
        priority: 'high',
        reason: 'Customer reported no-show',
        adminUserId: 'admin-1',
      },
    });
    expect(response.data.latestEscalationPriority).toBe('high');
  });

  it('sends provider messages as provider-owner notifications', async () => {
    const adminBookingGatewayService = {
      getBooking: jest.fn().mockResolvedValue({
        id: 'booking-1',
        bookingReference: 'SRV-001',
        providerId: 'provider-1',
        serviceTitle: 'Home cleaning',
      }),
      appendMessage: jest.fn().mockResolvedValue({
        id: 'message-1',
        bookingId: 'booking-1',
        senderUserId: 'admin-1',
        senderRole: 'admin',
        body: 'Please contact the customer before arrival.',
        metadata: null,
        createdAt: '2026-05-17T10:00:00.000Z',
      }),
    } as unknown as AdminBookingGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    } as unknown as AdminAuditGatewayService;
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('admin-1'),
    } as unknown as AuthTokenService;
    const currentUserService = {
      getCurrentUser: jest.fn().mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@servease.test',
          fullName: 'Admin User',
          role: 'admin',
        },
      }),
    } as unknown as CurrentUserService;
    const catalogServiceClient = {
      findProviderOwnerByProviderId: jest.fn().mockResolvedValue({
        userId: 'provider-user-1',
      }),
    } as unknown as CatalogServiceClient;
    const notificationServiceClient = {
      createNotification: jest.fn().mockResolvedValue({
        id: 'notification-1',
      }),
    } as unknown as NotificationServiceClient;
    const controller = new AdminBookingController(
      adminBookingGatewayService,
      adminAuditGatewayService,
      authTokenService,
      currentUserService,
      catalogServiceClient,
      notificationServiceClient,
    );

    const response = await controller.sendProviderMessage(
      'Bearer token',
      { headers: {}, socket: {} },
      'booking-1',
      { message: 'Please contact the customer before arrival.' },
    );

    expect(adminBookingGatewayService.getBooking).toHaveBeenCalledWith('booking-1');
    expect(catalogServiceClient.findProviderOwnerByProviderId).toHaveBeenCalledWith(
      'provider-1',
    );
    expect(adminBookingGatewayService.appendMessage).toHaveBeenCalledWith(
      'booking-1',
      expect.objectContaining({
        senderUserId: 'admin-1',
        senderRole: 'admin',
        body: 'Please contact the customer before arrival.',
      }),
    );
    expect(notificationServiceClient.createNotification).toHaveBeenCalledWith({
      userId: 'provider-user-1',
      type: 'admin_provider_message',
      title: 'Message from ServEase admin',
      body: 'Please contact the customer before arrival.',
      metadata: {
        bookingId: 'booking-1',
        bookingReference: 'SRV-001',
        adminUserId: 'admin-1',
        messageId: 'message-1',
      },
    });
    expect(response.data.notificationId).toBe('notification-1');
    expect(response.data.messageId).toBe('message-1');
  });

  it('still notifies providers when admin message persistence fails', async () => {
    const adminBookingGatewayService = {
      getBooking: jest.fn().mockResolvedValue({
        id: 'booking-1',
        bookingReference: 'SRV-001',
        providerId: 'provider-1',
        serviceTitle: 'Home cleaning',
      }),
      appendMessage: jest.fn().mockRejectedValue(new Error('thread unavailable')),
    } as unknown as AdminBookingGatewayService;
    const catalogServiceClient = {
      findProviderOwnerByProviderId: jest.fn().mockResolvedValue({
        userId: 'provider-user-1',
      }),
    } as unknown as CatalogServiceClient;
    const notificationServiceClient = {
      createNotification: jest.fn().mockResolvedValue({
        id: 'notification-1',
      }),
    } as unknown as NotificationServiceClient;
    const controller = new AdminBookingController(
      adminBookingGatewayService,
      { createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }) } as unknown as AdminAuditGatewayService,
      { authenticate: jest.fn().mockResolvedValue('admin-1') } as unknown as AuthTokenService,
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: {
            id: 'admin-1',
            email: 'admin@servease.test',
            fullName: 'Admin User',
            role: 'admin',
          },
        }),
      } as unknown as CurrentUserService,
      catalogServiceClient,
      notificationServiceClient,
    );
    const warnSpy = jest
      .spyOn(controller['logger'], 'warn')
      .mockImplementation(() => undefined);

    const response = await controller.sendProviderMessage(
      'Bearer token',
      { headers: {}, socket: {} },
      'booking-1',
      { message: 'Please contact the customer before arrival.' },
    );

    expect(notificationServiceClient.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'provider-user-1',
        metadata: expect.objectContaining({
          messageId: null,
        }),
      }),
    );
    expect(response.data.notificationId).toBe('notification-1');
    expect(response.data.messageId).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Could not persist admin provider message'),
    );
    warnSpy.mockRestore();
  });
});
