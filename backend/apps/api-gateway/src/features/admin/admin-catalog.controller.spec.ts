import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminCatalogController } from './admin-catalog.controller';
import { AdminCatalogGatewayService } from './admin-catalog.service';

describe('AdminCatalogController', () => {
  function buildController({
    auditFailure,
  }: { auditFailure?: Error } = {}) {
    const adminCatalogGatewayService = {
      createCategory: jest.fn().mockResolvedValue({
        id: 'category-1',
        name: 'Cleaning',
        description: null,
        icon: null,
        isActive: true,
        sortOrder: 1,
      }),
    } as unknown as AdminCatalogGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: auditFailure
        ? jest.fn().mockRejectedValue(auditFailure)
        : jest.fn().mockResolvedValue({ id: 'audit-1' }),
    } as unknown as AdminAuditGatewayService;
    const controller = new AdminCatalogController(
      adminCatalogGatewayService,
      adminAuditGatewayService,
      { authenticate: jest.fn().mockResolvedValue('admin-user-1') } as unknown as AuthTokenService,
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: {
            id: 'admin-user-1',
            email: 'admin@example.com',
            fullName: 'Admin User',
            role: 'admin',
            status: 'active',
          },
        }),
      } as unknown as CurrentUserService,
    );

    return {
      adminAuditGatewayService,
      adminCatalogGatewayService,
      controller,
    };
  }

  it('keeps category creation successful when audit logging fails', async () => {
    const { adminAuditGatewayService, adminCatalogGatewayService, controller } =
      buildController({ auditFailure: new Error('audit unavailable') });
    const warnSpy = jest
      .spyOn(controller['logger'], 'warn')
      .mockImplementation(() => undefined);

    const response = await controller.createCategory(
      'Bearer token',
      { headers: {}, socket: {} },
      { name: 'Cleaning' },
    );

    expect(adminCatalogGatewayService.createCategory).toHaveBeenCalledWith({
      name: 'Cleaning',
    });
    expect(adminAuditGatewayService.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'Created category Cleaning',
        entityType: 'Category',
        entityId: 'category-1',
      }),
    );
    expect(response.data.id).toBe('category-1');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Could not create catalog audit log'),
    );
    warnSpy.mockRestore();
  });
});
