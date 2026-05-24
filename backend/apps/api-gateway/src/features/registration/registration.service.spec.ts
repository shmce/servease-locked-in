import { AuthServiceClient } from '../current-user/clients/auth-service.client';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import { UserServiceClient } from '../current-user/clients/user-service.client';
import {
  InvalidRegistrationRequestError,
  InvalidSharedAuthRequestError,
} from './registration.errors';
import { RegistrationGatewayService } from './registration.service';

describe('RegistrationGatewayService', () => {
  it('creates customer accounts and customer profiles', async () => {
    const authServiceClient = {
      registerUser: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'customer@example.com',
        fullName: 'Customer Example',
        contactNumber: null,
        role: 'customer',
        status: 'active',
      }),
      deleteRegisteredUser: jest.fn(),
    } as unknown as AuthServiceClient;
    const userServiceClient = {
      createCustomerProfile: jest.fn().mockResolvedValue({
        id: 'customer-profile-1',
        address: '123 Test St',
      }),
      createCustomerAddress: jest.fn().mockResolvedValue({
        id: 'customer-address-1',
        userId: 'user-1',
        label: 'Home',
        address: '123 Test St',
        barangay: null,
        city: null,
        province: null,
        region: null,
        latitude: null,
        longitude: null,
        isDefault: true,
        createdAt: null,
        updatedAt: null,
      }),
    } as unknown as UserServiceClient;
    const catalogServiceClient = {
      createProviderProfile: jest.fn(),
    } as unknown as CatalogServiceClient;
    const service = new RegistrationGatewayService(
      authServiceClient,
      userServiceClient,
      catalogServiceClient,
    );

    await expect(
      service.register({
        role: 'customer',
        email: 'customer@example.com',
        password: 'Password#2026',
        fullName: 'Customer Example',
        address: '123 Test St',
      }),
    ).resolves.toMatchObject({
      user: {
        role: 'customer',
      },
      customerProfile: {
        address: '123 Test St',
      },
      customerAddresses: [
        {
          label: 'Home',
          address: '123 Test St',
          isDefault: true,
        },
      ],
      providerProfile: null,
    });
    expect(userServiceClient.createCustomerProfile).toHaveBeenCalledWith(
      'user-1',
      '123 Test St',
    );
    expect(userServiceClient.createCustomerAddress).toHaveBeenCalledWith('user-1', {
      label: 'Home',
      address: '123 Test St',
      isDefault: true,
    });
    expect(catalogServiceClient.createProviderProfile).not.toHaveBeenCalled();
  });

  it('cleans up auth users when provider profile creation fails', async () => {
    const authServiceClient = {
      registerUser: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'provider@example.com',
        fullName: 'Provider Example',
        contactNumber: null,
        role: 'provider',
        status: 'active',
      }),
      deleteRegisteredUser: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthServiceClient;
    const service = new RegistrationGatewayService(
      authServiceClient,
      {} as UserServiceClient,
      {
        createProviderProfile: jest.fn().mockRejectedValue(new Error('downstream')),
      } as unknown as CatalogServiceClient,
    );

    await expect(
      service.register({
        role: 'provider',
        email: 'provider@example.com',
        password: 'Password#2026',
        fullName: 'Provider Example',
        birthdate: '1990-05-23',
        businessName: 'Provider Co',
      }),
    ).rejects.toThrow('downstream');
    expect(authServiceClient.deleteRegisteredUser).toHaveBeenCalledWith('user-1');
  });

  it('forwards provider birthdate to Auth Service registration', async () => {
    const authServiceClient = {
      registerUser: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'provider@example.com',
        fullName: 'Provider Example',
        contactNumber: '+639171234567',
        role: 'provider',
        status: 'active',
      }),
      deleteRegisteredUser: jest.fn(),
    } as unknown as AuthServiceClient;
    const catalogServiceClient = {
      createProviderProfile: jest.fn().mockResolvedValue({
        id: 'provider-profile-1',
        businessName: 'Provider Co',
        verificationStatus: 'pending',
        averageRating: 0,
        reviewCount: 0,
      }),
    } as unknown as CatalogServiceClient;
    const service = new RegistrationGatewayService(
      authServiceClient,
      {} as UserServiceClient,
      catalogServiceClient,
    );

    await service.register({
      role: 'provider',
      email: 'provider@example.com',
      password: 'Password#2026',
      fullName: 'Provider Example',
      contactNumber: '+639171234567',
      birthdate: '1990-05-23',
      businessName: 'Provider Co',
    });

    expect(authServiceClient.registerUser).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'provider',
        birthdate: '1990-05-23',
      }),
    );
  });

  it('creates an initial linked provider service when provider signup includes a service id', async () => {
    const authServiceClient = {
      registerUser: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'provider@example.com',
        fullName: 'Provider Example',
        contactNumber: '+639171234567',
        role: 'provider',
        status: 'active',
      }),
      deleteRegisteredUser: jest.fn(),
    } as unknown as AuthServiceClient;
    const catalogServiceClient = {
      createProviderProfile: jest.fn().mockResolvedValue({
        id: 'provider-profile-1',
        businessName: 'Provider Co',
        verificationStatus: 'pending',
        averageRating: 0,
        reviewCount: 0,
      }),
      replaceProviderOwnedServices: jest.fn().mockResolvedValue([
        {
          id: 'provider-service-1',
          providerId: 'provider-profile-1',
          serviceId: '14e09a89-b7ad-483b-bfb6-6c49d8923197',
          title: 'Deep Cleaning',
          price: null,
          pricingMode: 'flat',
          isActive: true,
        },
      ]),
    } as unknown as CatalogServiceClient;
    const service = new RegistrationGatewayService(
      authServiceClient,
      {} as UserServiceClient,
      catalogServiceClient,
    );

    await service.register({
      role: 'provider',
      email: 'provider@example.com',
      password: 'Password#2026',
      fullName: 'Provider Example',
      contactNumber: '+639171234567',
      birthdate: '1990-05-23',
      businessName: 'Provider Co',
      serviceId: '14e09a89-b7ad-483b-bfb6-6c49d8923197',
      serviceDescription: 'Deep Cleaning',
    });

    expect(catalogServiceClient.replaceProviderOwnedServices).not.toHaveBeenCalled();
  });

  it('does not create linked provider services during registration before approval', async () => {
    const authServiceClient = {
      registerUser: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'provider@example.com',
        fullName: 'Provider Example',
        contactNumber: '+639171234567',
        role: 'provider',
        status: 'active',
      }),
      deleteRegisteredUser: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthServiceClient;
    const service = new RegistrationGatewayService(
      authServiceClient,
      {} as UserServiceClient,
      {
        createProviderProfile: jest.fn().mockResolvedValue({
          id: 'provider-profile-1',
          businessName: 'Provider Co',
          verificationStatus: 'pending',
          averageRating: 0,
          reviewCount: 0,
        }),
        replaceProviderOwnedServices: jest.fn(),
      } as unknown as CatalogServiceClient,
    );

    await service.register({
      role: 'provider',
      email: 'provider@example.com',
      password: 'Password#2026',
      fullName: 'Provider Example',
      contactNumber: '+639171234567',
      birthdate: '1990-05-23',
      businessName: 'Provider Co',
      serviceId: '14e09a89-b7ad-483b-bfb6-6c49d8923197',
      serviceDescription: 'Deep Cleaning',
    });

    expect(authServiceClient.deleteRegisteredUser).not.toHaveBeenCalled();
  });

  it('returns current provider application documents for the checklist screen', async () => {
    const service = new RegistrationGatewayService(
      {} as AuthServiceClient,
      {} as UserServiceClient,
      {
        getProviderApplicationByUserId: jest.fn().mockResolvedValue({
          id: 'provider-application-1',
          applicationReference: 'PA-20260523-001',
          businessName: 'Provider Co',
          serviceArea: 'Quezon City',
          serviceDescription: null,
          verificationStatus: 'pending',
          latestDecisionReason: null,
          latestDecisionAt: null,
          createdAt: '2026-05-23T00:00:00.000Z',
          updatedAt: '2026-05-23T00:00:00.000Z',
          documents: [
            {
              id: 'document-1',
              applicationId: 'provider-application-1',
              userId: 'user-1',
              documentType: 'government_id',
              fileUrl: null,
              storagePath: 'provider_document/user-1/id.jpg',
              status: 'pending',
              createdAt: '2026-05-23T00:01:00.000Z',
              previewUrl: 'https://storage.test/id-preview',
              downloadUrl: 'https://storage.test/id-download',
            },
          ],
        }),
      } as unknown as CatalogServiceClient,
    );

    await expect(
      service.getProviderApplicationDocuments('user-1'),
    ).resolves.toMatchObject({
      application: {
        id: 'provider-application-1',
        verificationStatus: 'pending',
      },
      documents: [
        {
          documentType: 'government_id',
          status: 'pending',
          previewUrl: 'https://storage.test/id-preview',
        },
      ],
    });
  });

  it('rejects provider registration with malformed service id', async () => {
    const service = new RegistrationGatewayService(
      { registerUser: jest.fn() } as unknown as AuthServiceClient,
      {} as UserServiceClient,
      {} as CatalogServiceClient,
    );

    await expect(
      service.register({
        role: 'provider',
        email: 'provider@example.com',
        password: 'Password#2026',
        fullName: 'Provider Example',
        birthdate: '1990-05-23',
        businessName: 'Provider Co',
        serviceId: 'not-a-service-id',
      }),
    ).rejects.toBeInstanceOf(InvalidRegistrationRequestError);
  });

  it('rejects provider registration without a business name', async () => {
    const service = new RegistrationGatewayService(
      {} as AuthServiceClient,
      {} as UserServiceClient,
      {} as CatalogServiceClient,
    );

    await expect(
      service.register({
        role: 'provider',
        email: 'provider@example.com',
        password: 'Password#2026',
        fullName: 'Provider Example',
      }),
    ).rejects.toBeInstanceOf(InvalidRegistrationRequestError);
  });

  it('rejects provider registration without an adult birthdate', async () => {
    const service = new RegistrationGatewayService(
      { registerUser: jest.fn() } as unknown as AuthServiceClient,
      {} as UserServiceClient,
      {} as CatalogServiceClient,
    );

    await expect(
      service.register({
        role: 'provider',
        email: 'provider@example.com',
        password: 'Password#2026',
        fullName: 'Provider Example',
        businessName: 'Provider Co',
      }),
    ).rejects.toBeInstanceOf(InvalidRegistrationRequestError);

    await expect(
      service.register({
        role: 'provider',
        email: 'provider@example.com',
        password: 'Password#2026',
        fullName: 'Provider Example',
        birthdate: nextYearBirthdate(),
        businessName: 'Provider Co',
      }),
    ).rejects.toBeInstanceOf(InvalidRegistrationRequestError);
  });

  it('requests password reset through Auth Service with normalized email', async () => {
    const authServiceClient = {
      requestPasswordReset: jest.fn().mockResolvedValue({ ok: true }),
    } as unknown as AuthServiceClient;
    const service = new RegistrationGatewayService(
      authServiceClient,
      {} as UserServiceClient,
      {} as CatalogServiceClient,
    );

    await expect(
      service.requestPasswordReset({
        email: ' Customer@Example.COM ',
        redirectTo: 'https://servease.test/reset-password',
      }),
    ).resolves.toEqual({ ok: true });
    expect(authServiceClient.requestPasswordReset).toHaveBeenCalledWith({
      email: 'customer@example.com',
      redirectTo: 'https://servease.test/reset-password',
    });
  });

  it('generates OTP through Auth Service shared auth', async () => {
    const authServiceClient = {
      generateOtp: jest.fn().mockResolvedValue({
        otpId: 'otp-1',
        expiresAt: '2026-05-18T00:00:00.000Z',
        channel: 'email',
        target: 'customer@example.com',
      }),
    } as unknown as AuthServiceClient;
    const service = new RegistrationGatewayService(
      authServiceClient,
      {} as UserServiceClient,
      {} as CatalogServiceClient,
    );

    await service.generateOtp({
      target: ' customer@example.com ',
      channel: 'email',
      length: 6,
      expiresInSeconds: 300,
    });

    expect(authServiceClient.generateOtp).toHaveBeenCalledWith({
      target: 'customer@example.com',
      channel: 'email',
      length: 6,
      expiresInSeconds: 300,
    });
  });

  it('rejects invalid shared auth requests before Auth Service calls', async () => {
    const authServiceClient = {
      generateOtp: jest.fn(),
    } as unknown as AuthServiceClient;
    const service = new RegistrationGatewayService(
      authServiceClient,
      {} as UserServiceClient,
      {} as CatalogServiceClient,
    );

    await expect(
      service.generateOtp({
        target: '',
        channel: 'email',
      }),
    ).rejects.toBeInstanceOf(InvalidSharedAuthRequestError);
    expect(authServiceClient.generateOtp).not.toHaveBeenCalled();
  });

  it('gets Google authorization URLs through Auth Service shared auth', async () => {
    const authServiceClient = {
      getGoogleAuthorizationUrl: jest.fn().mockResolvedValue({
        authorizationUrl: 'https://accounts.google.test/auth',
      }),
    } as unknown as AuthServiceClient;
    const service = new RegistrationGatewayService(
      authServiceClient,
      {} as UserServiceClient,
      {} as CatalogServiceClient,
    );

    await service.getGoogleAuthorizationUrl({
      redirectUri: 'https://servease.test/auth/google/callback',
      scopes: ['openid', 'email'],
    });

    expect(authServiceClient.getGoogleAuthorizationUrl).toHaveBeenCalledWith({
      redirectUri: 'https://servease.test/auth/google/callback',
      scopes: ['openid', 'email'],
    });
  });
});

function nextYearBirthdate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
