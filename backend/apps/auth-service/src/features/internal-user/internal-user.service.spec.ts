import { InternalUserService, UserRepository } from './internal-user.service';
import { UserNotFoundError } from './internal-user.errors';

describe('InternalUserService', () => {
  it('returns a safe user response from the repository record', async () => {
    const repository: UserRepository = {
      findById: jest.fn().mockResolvedValue({
        id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        email: 'customer@example.com',
        passwordHash: 'never-return-this',
        fullName: 'Customer Name',
        contactNumber: '+639000000000',
        role: 'customer',
        status: 'active',
      }),
      update: jest.fn(),
    };
    const service = new InternalUserService(repository);

    await expect(
      service.findById('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).resolves.toEqual({
      id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      email: 'customer@example.com',
      fullName: 'Customer Name',
      contactNumber: '+639000000000',
      role: 'customer',
      status: 'active',
    });
  });

  it('throws when the user does not exist', async () => {
    const repository: UserRepository = {
      findById: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    };
    const service = new InternalUserService(repository);

    await expect(
      service.findById('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it('updates and presents safe user profile fields', async () => {
    const repository: UserRepository = {
      findById: jest.fn(),
      update: jest.fn().mockResolvedValue({
        id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        email: 'customer@example.com',
        passwordHash: 'never-return-this',
        fullName: 'Updated Customer',
        contactNumber: '+639000000001',
        role: 'customer',
        status: 'active',
      }),
    };
    const service = new InternalUserService(repository);

    await expect(
      service.update({
        userId: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        fullName: 'Updated Customer',
        contactNumber: '+639000000001',
      }),
    ).resolves.toMatchObject({
      fullName: 'Updated Customer',
      contactNumber: '+639000000001',
    });
  });

  it('returns two-factor status without exposing the secret', async () => {
    const repository: UserRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      getTwoFactor: jest.fn().mockResolvedValue({
        userId: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        secret: 'secret',
        enabled: true,
        verifiedAt: '2026-05-22T10:00:00.000Z',
      }),
    };
    const service = new InternalUserService(repository);

    await expect(
      service.getTwoFactorStatus('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).resolves.toEqual({
      enabled: true,
      verifiedAt: '2026-05-22T10:00:00.000Z',
    });
  });
});
