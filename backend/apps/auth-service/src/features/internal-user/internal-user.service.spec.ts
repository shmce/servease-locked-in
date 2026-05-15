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
    };
    const service = new InternalUserService(repository);

    await expect(
      service.findById('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });
});
