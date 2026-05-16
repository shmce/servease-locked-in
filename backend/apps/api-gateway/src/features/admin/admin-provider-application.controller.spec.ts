import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminProviderApplicationController } from './admin-provider-application.controller';
import { AdminProviderApplicationGatewayService } from './admin-provider-application.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';

describe('AdminProviderApplicationController documents', () => {
  it('returns provider application document metadata for admins', async () => {
    const providerApplicationService = {
      getProviderApplicationDocument: jest.fn().mockResolvedValue({
        id: '33333333-3333-4333-8333-333333333333',
        applicationId: '11111111-1111-4111-8111-111111111111',
        userId: '22222222-2222-4222-8222-222222222222',
        documentType: 'government_id',
        fileUrl: null,
        storagePath: 'provider-documents/user-1/government-id.jpg',
        status: 'pending',
        createdAt: '2026-05-16T01:00:00.000Z',
        previewUrl: 'https://storage.test/preview',
        downloadUrl: 'https://storage.test/download',
      }),
    } as unknown as AdminProviderApplicationGatewayService;
    const controller = new AdminProviderApplicationController(
      providerApplicationService,
      { createAuditLog: jest.fn() } as unknown as AdminAuditGatewayService,
      {
        authenticate: jest
          .fn()
          .mockResolvedValue('99999999-9999-4999-8999-999999999999'),
      } as unknown as AuthTokenService,
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: {
            id: '99999999-9999-4999-8999-999999999999',
            email: 'admin@servease.test',
            fullName: 'Admin User',
            role: 'admin',
          },
        }),
      } as unknown as CurrentUserService,
      { createNotification: jest.fn() } as unknown as NotificationServiceClient,
    );

    const response = await controller.getDocument(
      'Bearer token',
      '11111111-1111-4111-8111-111111111111',
      '33333333-3333-4333-8333-333333333333',
    );

    expect(
      providerApplicationService.getProviderApplicationDocument,
    ).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      '33333333-3333-4333-8333-333333333333',
    );
    expect(response.data.previewUrl).toBe('https://storage.test/preview');
  });

  it('requests more information by notifying the provider applicant', async () => {
    const providerApplicationService = {
      getProviderApplication: jest.fn().mockResolvedValue({
        id: '11111111-1111-4111-8111-111111111111',
        applicationReference: 'PA-1111111111',
        userId: '22222222-2222-4222-8222-222222222222',
        businessName: 'GreenFix',
      }),
    } as unknown as AdminProviderApplicationGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    } as unknown as AdminAuditGatewayService;
    const notificationServiceClient = {
      createNotification: jest.fn().mockResolvedValue({
        id: 'notification-1',
      }),
    } as unknown as NotificationServiceClient;
    const controller = new AdminProviderApplicationController(
      providerApplicationService,
      adminAuditGatewayService,
      {
        authenticate: jest
          .fn()
          .mockResolvedValue('99999999-9999-4999-8999-999999999999'),
      } as unknown as AuthTokenService,
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: {
            id: '99999999-9999-4999-8999-999999999999',
            email: 'admin@servease.test',
            fullName: 'Admin User',
            role: 'admin',
          },
        }),
      } as unknown as CurrentUserService,
      notificationServiceClient,
    );

    const response = await controller.requestInfo(
      'Bearer token',
      { headers: {}, socket: {} },
      '11111111-1111-4111-8111-111111111111',
      { message: 'Please upload a clearer government ID.' },
    );

    expect(providerApplicationService.getProviderApplication).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
    );
    expect(notificationServiceClient.createNotification).toHaveBeenCalledWith({
      userId: '22222222-2222-4222-8222-222222222222',
      type: 'provider_application_info_requested',
      title: 'More information needed for your provider application',
      body: 'Please upload a clearer government ID.',
      metadata: {
        applicationId: '11111111-1111-4111-8111-111111111111',
        applicationReference: 'PA-1111111111',
        adminUserId: '99999999-9999-4999-8999-999999999999',
      },
    });
    expect(adminAuditGatewayService.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'Requested provider application information',
        actionType: 'update',
        entityType: 'ProviderApplication',
        entityId: '11111111-1111-4111-8111-111111111111',
      }),
    );
    expect(response.data.notificationId).toBe('notification-1');
  });
});
