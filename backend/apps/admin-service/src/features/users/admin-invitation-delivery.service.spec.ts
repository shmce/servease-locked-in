import { ConfigService } from '@nestjs/config';
import { createApicenterClient } from '@servease/common';
import { AdminInvitationDeliveryService } from './admin-invitation-delivery.service';

jest.mock('@servease/common', () => ({
  createApicenterClient: jest.fn(),
}));

const mockCreateApicenterClient = createApicenterClient as jest.Mock;

describe('AdminInvitationDeliveryService', () => {
  beforeEach(() => {
    mockCreateApicenterClient.mockReset();
  });

  it('sends admin invitation email through APICenter', async () => {
    const emailSend = jest.fn().mockResolvedValue({
      messageId: 'message-1',
      provider: 'apicenter',
      status: 'queued',
    });
    mockCreateApicenterClient.mockReturnValue({ emailSend });
    const configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          APICENTER_URL: 'https://apicenter.test/',
          APICENTER_TRIBE_ID: 'servease-admin',
          APICENTER_TRIBE_SECRET: 'secret',
          ADMIN_PORTAL_URL: 'https://admin.servease.test',
        };
        return values[key];
      }),
    } as unknown as ConfigService;
    const service = new AdminInvitationDeliveryService(configService);

    const delivered = await service.sendInvitation({
      email: 'Ops@Example.com',
      fullName: 'Ops Admin',
      temporaryPassword: 'Password#2026',
      accessRole: 'operations-manager',
    });

    expect(delivered).toBe(true);
    expect(mockCreateApicenterClient).toHaveBeenCalledWith({
      APICENTER_URL: 'https://apicenter.test/',
      APICENTER_TRIBE_ID: 'servease-admin',
      APICENTER_TRIBE_SECRET: 'secret',
    });
    expect(emailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: [{ email: 'ops@example.com', name: 'Ops Admin' }],
        subject: 'You have been invited to ServEase Admin',
        metadata: {
          source: 'admin-user-invitation',
          accessRole: 'operations-manager',
        },
      }),
    );
    expect(emailSend.mock.calls[0][0].text).toContain(
      'https://admin.servease.test/login',
    );
    expect(emailSend.mock.calls[0][0].text).toContain('Password#2026');
  });

  it('uses configured APICenter invitation templates with fallback data', async () => {
    const emailSend = jest.fn().mockResolvedValue({
      messageId: 'message-1',
      provider: 'apicenter',
      status: 'queued',
    });
    mockCreateApicenterClient.mockReturnValue({ emailSend });
    const configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          ADMIN_INVITATION_TEMPLATE_ID: 'admin-invite-v1',
          ADMIN_PORTAL_URL: 'https://admin.servease.test',
        };
        return values[key];
      }),
    } as unknown as ConfigService;
    const service = new AdminInvitationDeliveryService(configService);

    const delivered = await service.sendInvitation({
      email: 'ops@example.com',
      fullName: 'Ops Admin',
      temporaryPassword: 'Password#2026',
      accessRole: 'operations-manager',
    });

    expect(delivered).toBe(true);
    expect(emailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: 'admin-invite-v1',
        templateData: {
          fullName: 'Ops Admin',
          loginUrl: 'https://admin.servease.test/login',
          temporaryPassword: 'Password#2026',
          accessRole: 'operations-manager',
          accessRoleLabel: 'Operations Manager',
        },
        text: undefined,
        html: undefined,
      }),
    );
  });

  it('returns false when APICenter delivery is unavailable', async () => {
    mockCreateApicenterClient.mockImplementation(() => {
      throw new Error('apicenter_not_configured');
    });
    const configService = {
      get: jest.fn(),
    } as unknown as ConfigService;
    const service = new AdminInvitationDeliveryService(configService);

    await expect(
      service.sendInvitation({
        email: 'ops@example.com',
        fullName: 'Ops Admin',
        temporaryPassword: 'Password#2026',
        accessRole: 'operations-manager',
      }),
    ).resolves.toBe(false);
  });
});
