import { CurrentUserService } from './current-user.service';
import {
  AccountDeletionDependencyUnavailableError,
  AccountInactiveError,
  ProfileDependencyUnavailableError,
} from './current-user.errors';
import { AuthServiceClient } from './clients/auth-service.client';
import { CatalogServiceClient } from './clients/catalog-service.client';
import { UserServiceClient } from './clients/user-service.client';
import { BookingServiceClient } from '../booking/clients/booking-service.client';

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
        listCustomerAddresses: jest.fn().mockResolvedValue([
          {
            id: 'f1810af8-6172-4582-b1d8-b292ee37233a',
            userId: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
            label: 'Home',
            address: 'Primary saved address',
            barangay: null,
            city: null,
            province: null,
            region: null,
            latitude: null,
            longitude: null,
            isDefault: true,
            createdAt: null,
            updatedAt: null,
          },
        ]),
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
      customerAddresses: [
        {
          id: 'f1810af8-6172-4582-b1d8-b292ee37233a',
          userId: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
          label: 'Home',
          address: 'Primary saved address',
          barangay: null,
          city: null,
          province: null,
          region: null,
          latitude: null,
          longitude: null,
          isDefault: true,
          createdAt: null,
          updatedAt: null,
        },
      ],
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

  it('does not block customer login when saved address lookup is unavailable', async () => {
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
        listCustomerAddresses: jest
          .fn()
          .mockRejectedValue(new ProfileDependencyUnavailableError()),
      } as unknown as UserServiceClient,
      {
        findProviderProfileByUserId: jest.fn(),
      } as unknown as CatalogServiceClient,
    );

    await expect(
      service.getCurrentUser('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).resolves.toMatchObject({
      user: {
        id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        role: 'customer',
      },
      customerProfile: {
        id: 'd1810af8-6172-4582-b1d8-b292ee37233a',
      },
      customerAddresses: [],
      providerProfile: null,
    });
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
        listCustomerAddresses: jest.fn().mockResolvedValue([]),
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

  it('verifies active account status before updating a password', async () => {
    const authServiceClient = {
      findUserById: jest.fn().mockResolvedValue({
        id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        email: 'customer@example.com',
        fullName: 'Customer Name',
        contactNumber: '+639000000000',
        role: 'customer',
        status: 'active',
      }),
      updatePassword: jest.fn().mockResolvedValue({ ok: true }),
    } as unknown as AuthServiceClient;
    const service = new CurrentUserService(
      authServiceClient,
      {} as UserServiceClient,
      {} as CatalogServiceClient,
    );

    await expect(
      service.updateCurrentUserPassword('9b6ed52b-8a97-4b89-b6a8-364c65f8736b', {
        currentPassword: 'OldPassword#2026',
        newPassword: 'NewPassword#2026',
      }),
    ).resolves.toEqual({ ok: true });
    expect(authServiceClient.updatePassword).toHaveBeenCalledWith(
      '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      'customer@example.com',
      {
        currentPassword: 'OldPassword#2026',
        newPassword: 'NewPassword#2026',
      },
    );
  });

  it('loads two-factor status for active accounts', async () => {
    const authServiceClient = {
      findUserById: jest.fn().mockResolvedValue({
        id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        email: 'provider@example.com',
        fullName: 'Provider Name',
        contactNumber: '+639000000000',
        role: 'provider',
        status: 'active',
      }),
      getTwoFactorStatus: jest.fn().mockResolvedValue({
        enabled: true,
        verifiedAt: '2026-05-22T10:00:00.000Z',
      }),
    } as unknown as AuthServiceClient;
    const service = new CurrentUserService(
      authServiceClient,
      {} as UserServiceClient,
      {} as CatalogServiceClient,
    );

    await expect(
      service.getTwoFactorStatus('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).resolves.toEqual({
      enabled: true,
      verifiedAt: '2026-05-22T10:00:00.000Z',
    });
    expect(authServiceClient.getTwoFactorStatus).toHaveBeenCalledWith(
      '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
    );
  });

  it('cancels active bookings before deleting the current user account', async () => {
    const authServiceClient = {
      findUserById: jest.fn().mockResolvedValue({
        id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        email: 'customer@example.com',
        fullName: 'Customer Name',
        contactNumber: '+639000000000',
        role: 'customer',
        status: 'active',
      }),
      deleteCurrentUserAccount: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthServiceClient;
    const bookingServiceClient = {
      listBookings: jest.fn().mockResolvedValue([
        {
          id: 'booking-1',
          status: 'confirmed',
        },
        {
          id: 'booking-2',
          status: 'completed',
        },
      ]),
      transitionStatus: jest.fn().mockResolvedValue({ id: 'booking-1' }),
    } as unknown as BookingServiceClient;
    const service = new CurrentUserService(
      authServiceClient,
      {} as UserServiceClient,
      {} as CatalogServiceClient,
      bookingServiceClient,
    );

    await expect(
      service.deleteCurrentUser('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).resolves.toEqual({ ok: true });
    expect(bookingServiceClient.transitionStatus).toHaveBeenCalledWith(
      'booking-1',
      '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      'confirmed',
      'cancelled',
      'Account deleted',
      'Account owner requested deletion.',
    );
    expect(authServiceClient.deleteCurrentUserAccount).toHaveBeenCalledWith(
      '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
    );
  });

  it('does not delete the account when active booking lookup fails', async () => {
    const authServiceClient = {
      findUserById: jest.fn().mockResolvedValue({
        id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        email: 'customer@example.com',
        fullName: 'Customer Name',
        contactNumber: '+639000000000',
        role: 'customer',
        status: 'active',
      }),
      deleteCurrentUserAccount: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthServiceClient;
    const bookingServiceClient = {
      listBookings: jest.fn().mockRejectedValue(new Error('booking service down')),
      transitionStatus: jest.fn(),
    } as unknown as BookingServiceClient;
    const service = new CurrentUserService(
      authServiceClient,
      {} as UserServiceClient,
      {} as CatalogServiceClient,
      bookingServiceClient,
    );

    await expect(
      service.deleteCurrentUser('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).rejects.toThrow('booking service down');
    expect(authServiceClient.deleteCurrentUserAccount).not.toHaveBeenCalled();
  });

  it('does not delete the account when active booking cancellation fails', async () => {
    const authServiceClient = {
      findUserById: jest.fn().mockResolvedValue({
        id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        email: 'customer@example.com',
        fullName: 'Customer Name',
        contactNumber: '+639000000000',
        role: 'customer',
        status: 'active',
      }),
      deleteCurrentUserAccount: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthServiceClient;
    const bookingServiceClient = {
      listBookings: jest.fn().mockResolvedValue([
        {
          id: 'booking-1',
          status: 'confirmed',
        },
      ]),
      transitionStatus: jest.fn().mockRejectedValue(new Error('cancel failed')),
    } as unknown as BookingServiceClient;
    const service = new CurrentUserService(
      authServiceClient,
      {} as UserServiceClient,
      {} as CatalogServiceClient,
      bookingServiceClient,
    );

    await expect(
      service.deleteCurrentUser('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).rejects.toThrow('cancel failed');
    expect(authServiceClient.deleteCurrentUserAccount).not.toHaveBeenCalled();
  });

  it('requires booking service availability before deleting the current user account', async () => {
    const authServiceClient = {
      findUserById: jest.fn().mockResolvedValue({
        id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        email: 'customer@example.com',
        fullName: 'Customer Name',
        contactNumber: '+639000000000',
        role: 'customer',
        status: 'active',
      }),
      deleteCurrentUserAccount: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthServiceClient;
    const service = new CurrentUserService(
      authServiceClient,
      {} as UserServiceClient,
      {} as CatalogServiceClient,
    );

    await expect(
      service.deleteCurrentUser('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).rejects.toBeInstanceOf(AccountDeletionDependencyUnavailableError);
    expect(authServiceClient.deleteCurrentUserAccount).not.toHaveBeenCalled();
  });
});
