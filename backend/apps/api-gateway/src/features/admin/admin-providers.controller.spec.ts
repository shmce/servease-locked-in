import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { CatalogServiceClient as CatalogBrowseServiceClient } from '../catalog/clients/catalog-service.client';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminCatalogGatewayService } from './admin-catalog.service';
import { AdminProvidersController } from './admin-providers.controller';

describe('AdminProvidersController', () => {
  const adminUser = {
    id: 'admin-1',
    email: 'admin@servease.test',
    fullName: 'Admin User',
    contactNumber: null,
    role: 'admin',
    status: 'active',
  };

  function createController({
    adminCatalogGatewayService,
    adminAuditGatewayService,
  }: {
    adminCatalogGatewayService: Partial<AdminCatalogGatewayService>;
    adminAuditGatewayService: Partial<AdminAuditGatewayService>;
  }): AdminProvidersController {
    return new AdminProvidersController(
      adminCatalogGatewayService as AdminCatalogGatewayService,
      adminAuditGatewayService as AdminAuditGatewayService,
      { authenticate: jest.fn().mockResolvedValue(adminUser.id) } as unknown as AuthTokenService,
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: adminUser,
          customerProfile: null,
          providerProfile: null,
        }),
      } as unknown as CurrentUserService,
      {} as CatalogBrowseServiceClient,
    );
  }

  it('keeps provider status updates successful when audit logging fails', async () => {
    const adminCatalogGatewayService = {
      updateProviderStatus: jest.fn().mockResolvedValue({
        id: 'provider-1',
        userId: 'provider-user-1',
        businessName: 'GreenFix',
        bio: null,
        serviceDescription: null,
        serviceArea: null,
        yearsExperience: null,
        verificationStatus: 'approved',
        averageRating: 0,
        reviewCount: 0,
        totalBookings: 0,
        completionRate: null,
        isActive: true,
        createdAt: '2026-05-17T00:00:00.000Z',
        userEmail: 'provider@servease.test',
        userFullName: 'Provider User',
        userStatus: 'active',
      }),
    };
    const controller = createController({
      adminCatalogGatewayService,
      adminAuditGatewayService: {
        createAuditLog: jest
          .fn()
          .mockRejectedValue(new Error('audit unavailable')),
      },
    });
    const warnSpy = jest
      .spyOn(controller['logger'], 'warn')
      .mockImplementation(() => undefined);

    const response = await controller.updateStatus(
      'Bearer token',
      { headers: {}, socket: {} },
      'provider-1',
      { status: 'suspended', reason: 'Policy review' },
    );
    await Promise.resolve();

    expect(adminCatalogGatewayService.updateProviderStatus).toHaveBeenCalledWith(
      'provider-1',
      'suspended',
      'Policy review',
    );
    expect(response.data.id).toBe('provider-1');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Could not create admin provider audit log'),
    );
    warnSpy.mockRestore();
  });
});
