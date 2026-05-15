import { CurrentUserController } from './current-user.controller';
import { AuthTokenService } from './auth-token.service';
import { CurrentUserService } from './current-user.service';

describe('CurrentUserController', () => {
  it('uses the bearer token to resolve the current user', async () => {
    const currentUserService = {
      getCurrentUser: jest.fn().mockResolvedValue({
        user: {
          id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
          email: 'customer@example.com',
          fullName: 'Customer Name',
          contactNumber: '+639000000000',
          role: 'customer',
          status: 'active',
        },
        customerProfile: null,
        providerProfile: null,
      }),
    } as unknown as CurrentUserService;
    const authTokenService = {
      authenticate: jest
        .fn()
        .mockResolvedValue('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    } as unknown as AuthTokenService;
    const controller = new CurrentUserController(
      currentUserService,
      authTokenService,
    );

    await expect(controller.show('Bearer valid-token')).resolves.toEqual({
      data: {
        user: {
          id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
          email: 'customer@example.com',
          fullName: 'Customer Name',
          contactNumber: '+639000000000',
          role: 'customer',
          status: 'active',
        },
        customerProfile: null,
        providerProfile: null,
      },
    });
    expect(authTokenService.authenticate).toHaveBeenCalledWith(
      'Bearer valid-token',
    );
    expect(currentUserService.getCurrentUser).toHaveBeenCalledWith(
      '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
    );
  });

  it('uses the bearer token to update the current user profile', async () => {
    const currentUserService = {
      updateCurrentUser: jest.fn().mockResolvedValue({
        user: {
          id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
          email: 'customer@example.com',
          fullName: 'Updated Customer',
          contactNumber: '+639000000001',
          role: 'customer',
          status: 'active',
        },
        customerProfile: {
          id: 'customer-profile-1',
          address: 'Updated address',
        },
        providerProfile: null,
      }),
    } as unknown as CurrentUserService;
    const authTokenService = {
      authenticate: jest
        .fn()
        .mockResolvedValue('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    } as unknown as AuthTokenService;
    const controller = new CurrentUserController(
      currentUserService,
      authTokenService,
    );

    await expect(
      controller.update('Bearer valid-token', {
        fullName: 'Updated Customer',
        contactNumber: '+639000000001',
        address: 'Updated address',
      }),
    ).resolves.toMatchObject({
      data: {
        user: {
          fullName: 'Updated Customer',
        },
        customerProfile: {
          address: 'Updated address',
        },
      },
    });
    expect(currentUserService.updateCurrentUser).toHaveBeenCalledWith(
      '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      {
        fullName: 'Updated Customer',
        contactNumber: '+639000000001',
        address: 'Updated address',
        businessName: null,
      },
    );
  });
});
