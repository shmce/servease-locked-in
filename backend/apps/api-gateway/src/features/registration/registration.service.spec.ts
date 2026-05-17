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
      providerProfile: null,
    });
    expect(userServiceClient.createCustomerProfile).toHaveBeenCalledWith(
      'user-1',
      '123 Test St',
    );
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
        businessName: 'Provider Co',
      }),
    ).rejects.toThrow('downstream');
    expect(authServiceClient.deleteRegisteredUser).toHaveBeenCalledWith('user-1');
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
