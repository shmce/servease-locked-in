import { HttpException } from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { AdminIntegrationController } from './admin-integration.controller';
import { AdminServiceClient } from './clients/admin-service.client';

function makeController(overrides?: {
  client?: AdminServiceClient;
  role?: 'admin' | 'customer';
}): AdminIntegrationController {
  const adminServiceClient =
    overrides?.client ??
    ({
      listAdminIntegrations: jest.fn().mockResolvedValue([]),
      updateAdminIntegrationCredentials: jest.fn(),
      testAdminIntegration: jest.fn(),
    } as unknown as AdminServiceClient);

  return new AdminIntegrationController(
    {
      authenticate: jest.fn().mockResolvedValue('admin-1'),
    } as unknown as AuthTokenService,
    {
      getCurrentUser: jest.fn().mockResolvedValue({
        user: { id: 'admin-1', role: overrides?.role ?? 'admin' },
      }),
    } as unknown as CurrentUserService,
    adminServiceClient,
  );
}

describe('AdminIntegrationController', () => {
  it('lists integrations for an admin', async () => {
    const adminServiceClient = {
      listAdminIntegrations: jest.fn().mockResolvedValue([
        {
          provider: 'gcash',
          displayName: 'GCash',
          category: 'payment',
          isEnabled: true,
          status: 'active',
          webhookUrl: null,
          apiKeyPreview: null,
          lastTestedAt: null,
          lastError: null,
          updatedBy: null,
          updatedAt: null,
          createdAt: null,
        },
      ]),
      updateAdminIntegrationCredentials: jest.fn(),
      testAdminIntegration: jest.fn(),
    } as unknown as AdminServiceClient;
    const controller = makeController({ client: adminServiceClient });

    const result = await controller.list('Bearer token');

    expect(adminServiceClient.listAdminIntegrations).toHaveBeenCalled();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].provider).toBe('gcash');
  });

  it('rejects non-admin callers', async () => {
    const controller = makeController({ role: 'customer' });
    await expect(controller.list('Bearer token')).rejects.toBeInstanceOf(
      HttpException,
    );
  });

  it('forwards toggle requests to admin-service', async () => {
    const adminServiceClient = {
      listAdminIntegrations: jest.fn(),
      updateAdminIntegrationCredentials: jest.fn().mockResolvedValue({
        provider: 'stripe',
        displayName: 'Stripe',
        category: 'payment',
        isEnabled: true,
        status: 'active',
        webhookUrl: null,
        apiKeyPreview: null,
        lastTestedAt: null,
        lastError: null,
        updatedBy: 'admin-1',
        updatedAt: '2026-05-17T00:00:00.000Z',
        createdAt: null,
      }),
      testAdminIntegration: jest.fn(),
    } as unknown as AdminServiceClient;
    const controller = makeController({ client: adminServiceClient });

    const result = await controller.updateCredentials(
      'Bearer token',
      'stripe',
      { isEnabled: true },
    );

    expect(
      adminServiceClient.updateAdminIntegrationCredentials,
    ).toHaveBeenCalledWith({
      provider: 'stripe',
      adminUserId: 'admin-1',
      isEnabled: true,
      webhookUrl: undefined,
      apiKeyPreview: undefined,
    });
    expect(result.data.provider).toBe('stripe');
  });

  it('forwards test requests to admin-service', async () => {
    const adminServiceClient = {
      listAdminIntegrations: jest.fn(),
      updateAdminIntegrationCredentials: jest.fn(),
      testAdminIntegration: jest.fn().mockResolvedValue({
        provider: 'twilio',
        displayName: 'Twilio',
        category: 'messaging',
        isEnabled: true,
        status: 'active',
        webhookUrl: null,
        apiKeyPreview: null,
        lastTestedAt: '2026-05-17T01:00:00.000Z',
        lastError: null,
        updatedBy: 'admin-1',
        updatedAt: '2026-05-17T01:00:00.000Z',
        createdAt: null,
      }),
    } as unknown as AdminServiceClient;
    const controller = makeController({ client: adminServiceClient });

    const result = await controller.test('Bearer token', 'twilio', {});

    expect(adminServiceClient.testAdminIntegration).toHaveBeenCalledWith({
      provider: 'twilio',
      adminUserId: 'admin-1',
      success: true,
      errorMessage: null,
    });
    expect(result.data.lastTestedAt).toBe('2026-05-17T01:00:00.000Z');
  });
});
