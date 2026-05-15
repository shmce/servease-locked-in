import { AuthServiceClient } from '../current-user/clients/auth-service.client';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import { UserServiceClient } from '../current-user/clients/user-service.client';
import { InvalidRegistrationRequestError } from './registration.errors';
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
});
