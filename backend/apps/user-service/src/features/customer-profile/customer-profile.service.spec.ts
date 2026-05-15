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
      create: jest.fn(),
      update: jest.fn(),
    };
    const service = new CustomerProfileService(repository);

    await expect(
      service.findByUserId('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).resolves.toEqual({
      id: 'd1810af8-6172-4582-b1d8-b292ee37233a',
      address: 'Primary saved address',
    });
  });

  it('creates customer profile data for registration', async () => {
    const repository: CustomerProfileRepository = {
      findByUserId: jest.fn(),
      create: jest.fn().mockResolvedValue({
        id: 'd1810af8-6172-4582-b1d8-b292ee37233a',
        address: 'Primary saved address',
      }),
      update: jest.fn(),
    };
    const service = new CustomerProfileService(repository);

    await service.create({
      userId: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      address: 'Primary saved address',
    });

    expect(repository.create).toHaveBeenCalledWith({
      userId: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      address: 'Primary saved address',
    });
  });

  it('updates customer profile data', async () => {
    const repository: CustomerProfileRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn().mockResolvedValue({
        id: 'd1810af8-6172-4582-b1d8-b292ee37233a',
        address: 'Updated address',
      }),
    };
    const service = new CustomerProfileService(repository);

    await service.update({
      userId: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      address: 'Updated address',
    });

    expect(repository.update).toHaveBeenCalledWith({
      userId: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      address: 'Updated address',
    });
  });
});
