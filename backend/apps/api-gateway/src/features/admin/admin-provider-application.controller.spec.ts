import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminProviderApplicationController } from './admin-provider-application.controller';
import { AdminProviderApplicationGatewayService } from './admin-provider-application.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';

describe('AdminProviderApplicationController documents', () => {
  const adminUser = {
    id: '99999999-9999-4999-8999-999999999999',
    email: 'admin@servease.test',
    fullName: 'Admin User',
    role: 'admin',
  };

  function authTokenService(): AuthTokenService {
    return {
      authenticate: jest.fn().mockResolvedValue(adminUser.id),
    } as unknown as AuthTokenService;
  }

  function currentUserService(): CurrentUserService {
    return {
      getCurrentUser: jest.fn().mockResolvedValue({
        user: adminUser,
      }),
    } as unknown as CurrentUserService;
  }

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
      authTokenService(),
      currentUserService(),
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
      authTokenService(),
      currentUserService(),
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

  it('blocks approval when the persisted review is incomplete', async () => {
    const providerApplicationService = {
      getProviderApplicationReview: jest.fn().mockResolvedValue({
        applicationId: '11111111-1111-4111-8111-111111111111',
        isComplete: false,
      }),
      decideProviderApplication: jest.fn(),
    } as unknown as AdminProviderApplicationGatewayService;
    const controller = new AdminProviderApplicationController(
      providerApplicationService,
      { createAuditLog: jest.fn() } as unknown as AdminAuditGatewayService,
      authTokenService(),
      currentUserService(),
      { createNotification: jest.fn() } as unknown as NotificationServiceClient,
    );

    await expect(
      controller.approve(
        'Bearer token',
        { headers: {}, socket: {} },
        '11111111-1111-4111-8111-111111111111',
        { reason: 'Looks good.' },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        error: expect.objectContaining({
          code: 'invalid_admin_request',
        }),
      }),
    });
    expect(
      providerApplicationService.decideProviderApplication,
    ).not.toHaveBeenCalled();
  });

  it('notifies the provider applicant after approval', async () => {
    const providerApplicationService = {
      getProviderApplicationReview: jest.fn().mockResolvedValue({
        applicationId: '11111111-1111-4111-8111-111111111111',
        isComplete: true,
      }),
      decideProviderApplication: jest.fn().mockResolvedValue({
        id: '11111111-1111-4111-8111-111111111111',
        applicationReference: 'PA-1111111111',
        userId: '22222222-2222-4222-8222-222222222222',
        businessName: 'GreenFix',
      }),
    } as unknown as AdminProviderApplicationGatewayService;
    const notificationServiceClient = {
      createNotification: jest.fn().mockResolvedValue({
        id: 'notification-1',
      }),
    } as unknown as NotificationServiceClient;
    const controller = new AdminProviderApplicationController(
      providerApplicationService,
      {
        createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      } as unknown as AdminAuditGatewayService,
      authTokenService(),
      currentUserService(),
      notificationServiceClient,
    );

    await controller.approve(
      'Bearer token',
      { headers: {}, socket: {} },
      '11111111-1111-4111-8111-111111111111',
      { reason: 'Application met requirements.' },
    );

    expect(notificationServiceClient.createNotification).toHaveBeenCalledWith({
      userId: '22222222-2222-4222-8222-222222222222',
      type: 'provider_application_approved',
      title: 'Provider application approved',
      body: 'Application met requirements.',
      metadata: {
        applicationId: '11111111-1111-4111-8111-111111111111',
        applicationReference: 'PA-1111111111',
        adminUserId: adminUser.id,
        decision: 'approved',
      },
    });
  });

  it('keeps provider approval successful when notification delivery fails', async () => {
    const providerApplicationService = {
      getProviderApplicationReview: jest.fn().mockResolvedValue({
        applicationId: '11111111-1111-4111-8111-111111111111',
        isComplete: true,
      }),
      decideProviderApplication: jest.fn().mockResolvedValue({
        id: '11111111-1111-4111-8111-111111111111',
        applicationReference: 'PA-1111111111',
        userId: '22222222-2222-4222-8222-222222222222',
        businessName: 'GreenFix',
      }),
    } as unknown as AdminProviderApplicationGatewayService;
    const controller = new AdminProviderApplicationController(
      providerApplicationService,
      {
        createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      } as unknown as AdminAuditGatewayService,
      authTokenService(),
      currentUserService(),
      {
        createNotification: jest
          .fn()
          .mockRejectedValue(new Error('notification unavailable')),
      } as unknown as NotificationServiceClient,
    );
    const warnSpy = jest
      .spyOn(controller['logger'], 'warn')
      .mockImplementation(() => undefined);

    const response = await controller.approve(
      'Bearer token',
      { headers: {}, socket: {} },
      '11111111-1111-4111-8111-111111111111',
      { reason: 'Application met requirements.' },
    );

    await Promise.resolve();

    expect(response.data.id).toBe('11111111-1111-4111-8111-111111111111');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Could not create provider application approved notification',
      ),
    );
    warnSpy.mockRestore();
  });

  it('updates review state with the authenticated admin id', async () => {
    const providerApplicationService = {
      updateProviderApplicationReview: jest.fn().mockResolvedValue({
        applicationId: '11111111-1111-4111-8111-111111111111',
        isComplete: true,
      }),
    } as unknown as AdminProviderApplicationGatewayService;
    const controller = new AdminProviderApplicationController(
      providerApplicationService,
      { createAuditLog: jest.fn() } as unknown as AdminAuditGatewayService,
      authTokenService(),
      currentUserService(),
      { createNotification: jest.fn() } as unknown as NotificationServiceClient,
    );

    const response = await controller.updateReview(
      'Bearer token',
      '11111111-1111-4111-8111-111111111111',
      {
        kycChecklist: [],
        businessChecklist: [],
        verificationRecords: [],
        ocrData: {},
      },
    );

    expect(
      providerApplicationService.updateProviderApplicationReview,
    ).toHaveBeenCalledWith({
      applicationId: '11111111-1111-4111-8111-111111111111',
      adminUserId: adminUser.id,
      kycChecklist: [],
      businessChecklist: [],
      verificationRecords: [],
      ocrData: {},
    });
    expect(response.data.isComplete).toBe(true);
  });

});
