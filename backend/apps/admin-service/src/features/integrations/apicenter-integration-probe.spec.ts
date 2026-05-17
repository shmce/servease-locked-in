import { ConfigService } from '@nestjs/config';
import { TribeClient } from '@implementsprint/sdk';
import { ApicenterIntegrationProbe } from './apicenter-integration-probe';

jest.mock('@implementsprint/sdk', () => ({
  TribeClient: jest.fn(),
}));

const MockTribeClient = TribeClient as jest.MockedClass<typeof TribeClient>;

describe('ApicenterIntegrationProbe', () => {
  beforeEach(() => {
    MockTribeClient.mockClear();
  });

  it('skips providers that are not covered by the APICenter SDK shared services', async () => {
    const probe = new ApicenterIntegrationProbe(
      configService({
        APICENTER_URL: 'https://apicenter.test',
        APICENTER_TRIBE_ID: 'servease-admin',
        APICENTER_TRIBE_SECRET: 'secret',
      }),
    );

    await expect(probe.testProvider('firebase')).resolves.toBeNull();
    expect(MockTribeClient).not.toHaveBeenCalled();
  });

  it('skips APICenter probing when SDK gateway credentials are not configured', async () => {
    const probe = new ApicenterIntegrationProbe(configService({}));

    await expect(probe.testProvider('twilio')).resolves.toBeNull();
    expect(MockTribeClient).not.toHaveBeenCalled();
  });

  it('passes when the mapped shared service is active and accessible', async () => {
    const authenticate = jest.fn().mockResolvedValue(undefined);
    const listSharedServices = jest.fn().mockResolvedValue([
      {
        serviceId: 'sms',
        name: 'SMS',
        status: 'active',
        serviceType: 'shared',
        canAccess: true,
      },
    ]);
    MockTribeClient.mockImplementation(
      () =>
        ({
          authenticate,
          listSharedServices,
        }) as unknown as TribeClient,
    );
    const probe = new ApicenterIntegrationProbe(
      configService({
        APICENTER_URL: 'https://apicenter.test/',
        APICENTER_TRIBE_ID: 'servease-admin',
        APICENTER_TRIBE_SECRET: 'secret',
      }),
    );

    await expect(probe.testProvider('twilio')).resolves.toEqual({
      success: true,
      errorMessage: null,
    });
    expect(MockTribeClient).toHaveBeenCalledWith({
      gatewayUrl: 'https://apicenter.test',
      tribeId: 'servease-admin',
      secret: 'secret',
    });
    expect(authenticate).toHaveBeenCalledTimes(1);
    expect(listSharedServices).toHaveBeenCalledTimes(1);
  });

  it('fails when APICenter denies access to the mapped shared service', async () => {
    MockTribeClient.mockImplementation(
      () =>
        ({
          authenticate: jest.fn().mockResolvedValue(undefined),
          listSharedServices: jest.fn().mockResolvedValue([
          {
            serviceId: 'email',
            name: 'Email',
            status: 'active',
            serviceType: 'shared',
            canAccess: false,
          },
          ]),
        }) as unknown as TribeClient,
    );
    const probe = new ApicenterIntegrationProbe(
      configService({
        APICENTER_URL: 'https://apicenter.test',
        APICENTER_TRIBE_ID: 'servease-admin',
        APICENTER_TRIBE_SECRET: 'secret',
      }),
    );

    await expect(probe.testProvider('sendgrid')).resolves.toEqual({
      success: false,
      errorMessage:
        'APICenter denies this tribe access to shared service "email".',
    });
  });

  it('returns the SDK error when shared-service discovery fails', async () => {
    MockTribeClient.mockImplementation(
      () =>
        ({
          authenticate: jest.fn().mockResolvedValue(undefined),
          listSharedServices: jest
            .fn()
            .mockRejectedValue(new Error('APICenter unavailable')),
        }) as unknown as TribeClient,
    );
    const probe = new ApicenterIntegrationProbe(
      configService({
        APICENTER_URL: 'https://apicenter.test',
        APICENTER_TRIBE_ID: 'servease-admin',
        APICENTER_TRIBE_SECRET: 'secret',
      }),
    );

    await expect(probe.testProvider('sendgrid')).resolves.toEqual({
      success: false,
      errorMessage: 'APICenter probe failed: APICenter unavailable',
    });
  });

  it('fails when the mapped APICenter shared service is not registered', async () => {
    MockTribeClient.mockImplementation(
      () =>
        ({
          authenticate: jest.fn().mockResolvedValue(undefined),
          listSharedServices: jest.fn().mockResolvedValue([
          {
            serviceId: 'sms',
            name: 'SMS',
            status: 'active',
            serviceType: 'shared',
          },
          ]),
        }) as unknown as TribeClient,
    );
    const probe = new ApicenterIntegrationProbe(
      configService({
        APICENTER_URL: 'https://apicenter.test',
        APICENTER_TRIBE_ID: 'servease-admin',
        APICENTER_TRIBE_SECRET: 'secret',
      }),
    );

    await expect(probe.testProvider('sendgrid')).resolves.toEqual({
      success: false,
      errorMessage: 'APICenter shared service "email" is not registered.',
    });
  });
});

function configService(values: Record<string, string>): ConfigService {
  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}
