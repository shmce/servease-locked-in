import { CurrentUserService } from './current-user.service';
import { AccountInactiveError } from './current-user.errors';
import { AuthServiceClient } from './clients/auth-service.client';
import { CatalogServiceClient } from './clients/catalog-service.client';
import { UserServiceClient } from './clients/user-service.client';

describe('CurrentUserService', () => {
  it('aggregates customer profile data for the current user', async () => {
    const service = new CurrentUserService(
      {
        findUserById: jest.fn().mockResolvedValue({
          id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
          email: 'customer@example.com',
          fullName: 'Customer Name',
          contactNumber: '+639000000000',
          role: 'customer',
          status: 'active',
        }),
      } as unknown as AuthServiceClient,
      {
        findCustomerProfileByUserId: jest.fn().mockResolvedValue({
          id: 'd1810af8-6172-4582-b1d8-b292ee37233a',
          address: 'Primary saved address',
        }),
      } as unknown as UserServiceClient,
      {
        findProviderProfileByUserId: jest.fn(),
      } as unknown as CatalogServiceClient,
    );

    await expect(
      service.getCurrentUser('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).resolves.toEqual({
      user: {
        id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        email: 'customer@example.com',
        fullName: 'Customer Name',
        contactNumber: '+639000000000',
        role: 'customer',
        status: 'active',
      },
      customerProfile: {
        id: 'd1810af8-6172-4582-b1d8-b292ee37233a',
        address: 'Primary saved address',
      },
      providerProfile: null,
    });
  });

  it('blocks inactive accounts before profile aggregation', async () => {
    const service = new CurrentUserService(
      {
        findUserById: jest.fn().mockResolvedValue({
          id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
          email: 'customer@example.com',
          fullName: 'Customer Name',
          contactNumber: '+639000000000',
          role: 'customer',
          status: 'suspended',
        }),
      } as unknown as AuthServiceClient,
      {
        findCustomerProfileByUserId: jest.fn(),
      } as unknown as UserServiceClient,
      {
        findProviderProfileByUserId: jest.fn(),
      } as unknown as CatalogServiceClient,
    );

    await expect(
      service.getCurrentUser('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).rejects.toBeInstanceOf(AccountInactiveError);
  });

  it('updates customer profile data for active customers', async () => {
    const service = new CurrentUserService(
      {
        updateUser: jest.fn().mockResolvedValue({
          id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
          email: 'customer@example.com',
          fullName: 'Updated Customer',
          contactNumber: '+639000000001',
          role: 'customer',
          status: 'active',
        }),
      } as unknown as AuthServiceClient,
      {
        updateCustomerProfile: jest.fn().mockResolvedValue({
          id: 'd1810af8-6172-4582-b1d8-b292ee37233a',
          address: 'Updated address',
        }),
      } as unknown as UserServiceClient,
      {
        updateProviderProfile: jest.fn(),
      } as unknown as CatalogServiceClient,
    );

    await expect(
      service.updateCurrentUser('9b6ed52b-8a97-4b89-b6a8-364c65f8736b', {
        fullName: 'Updated Customer',
        contactNumber: '+639000000001',
        address: 'Updated address',
      }),
    ).resolves.toMatchObject({
      user: {
        fullName: 'Updated Customer',
      },
      customerProfile: {
        address: 'Updated address',
      },
      providerProfile: null,
    });
  });
});
