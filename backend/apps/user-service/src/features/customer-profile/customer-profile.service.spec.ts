import {
  CustomerProfileRepository,
  CustomerProfileService,
} from './customer-profile.service';

describe('CustomerProfileService', () => {
  it('returns customer profile data for a user', async () => {
    const repository: CustomerProfileRepository = {
      findByUserId: jest.fn().mockResolvedValue({
        id: 'd1810af8-6172-4582-b1d8-b292ee37233a',
        address: 'Primary saved address',
      }),
    };
    const service = new CustomerProfileService(repository);

    await expect(
      service.findByUserId('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).resolves.toEqual({
      id: 'd1810af8-6172-4582-b1d8-b292ee37233a',
      address: 'Primary saved address',
    });
  });
});
