import { presentInternalUser } from './user-presenter';

describe('presentInternalUser', () => {
  it('returns safe identity fields without password hash', () => {
    const result = presentInternalUser({
      id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      email: 'customer@example.com',
      passwordHash: 'never-return-this',
      fullName: 'Customer Name',
      contactNumber: '+639000000000',
      role: 'customer',
      status: 'active',
    });

    expect(result).toEqual({
      id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      email: 'customer@example.com',
      fullName: 'Customer Name',
      contactNumber: '+639000000000',
      role: 'customer',
      status: 'active',
    });
    expect(result).not.toHaveProperty('passwordHash');
  });
});
