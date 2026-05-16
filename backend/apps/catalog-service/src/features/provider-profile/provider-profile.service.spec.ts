import {
  ProviderProfileRepository,
  ProviderProfileService,
} from './provider-profile.service';

describe('ProviderProfileService', () => {
  it('returns provider profile data for a user', async () => {
    const repository: ProviderProfileRepository = {
      findByUserId: jest.fn().mockResolvedValue({
        id: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        businessName: 'Reliable Repairs',
        verificationStatus: 'approved',
        averageRating: 4.8,
        reviewCount: 12,
      }),
      create: jest.fn(),
      update: jest.fn(),
      listPortfolioMedia: jest.fn(),
      addPortfolioMedia: jest.fn(),
      deletePortfolioMedia: jest.fn(),
      listOwnedServices: jest.fn(),
      replaceOwnedServices: jest.fn(),
      listProviderApplications: jest.fn(),
      getProviderApplication: jest.fn(),
      decideProviderApplication: jest.fn(),
    };
    const service = new ProviderProfileService(repository);

    await expect(
      service.findByUserId('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).resolves.toEqual({
      id: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
      businessName: 'Reliable Repairs',
      verificationStatus: 'approved',
      averageRating: 4.8,
      reviewCount: 12,
    });
  });

  it('creates provider profile data for registration', async () => {
    const repository: ProviderProfileRepository = {
      findByUserId: jest.fn(),
      create: jest.fn().mockResolvedValue({
        id: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        businessName: 'Reliable Repairs',
        verificationStatus: 'pending',
        averageRating: 0,
        reviewCount: 0,
      }),
      update: jest.fn(),
      listPortfolioMedia: jest.fn(),
      addPortfolioMedia: jest.fn(),
      deletePortfolioMedia: jest.fn(),
      listOwnedServices: jest.fn(),
      replaceOwnedServices: jest.fn(),
      listProviderApplications: jest.fn(),
      getProviderApplication: jest.fn(),
      decideProviderApplication: jest.fn(),
    };
    const service = new ProviderProfileService(repository);

    await service.create({
      userId: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      businessName: 'Reliable Repairs',
      serviceArea: 'Metro Manila',
      serviceDescription: 'Home repair services',
    });

    expect(repository.create).toHaveBeenCalledWith({
      userId: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      businessName: 'Reliable Repairs',
      serviceArea: 'Metro Manila',
      serviceDescription: 'Home repair services',
    });
  });

  it('updates provider profile data', async () => {
    const repository: ProviderProfileRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn().mockResolvedValue({
        id: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        businessName: 'Updated Repairs',
        verificationStatus: 'pending',
        averageRating: 0,
        reviewCount: 0,
      }),
      listPortfolioMedia: jest.fn(),
      addPortfolioMedia: jest.fn(),
      deletePortfolioMedia: jest.fn(),
      listOwnedServices: jest.fn(),
      replaceOwnedServices: jest.fn(),
      listProviderApplications: jest.fn(),
      getProviderApplication: jest.fn(),
      decideProviderApplication: jest.fn(),
    };
    const service = new ProviderProfileService(repository);

    await service.update({
      userId: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      businessName: 'Updated Repairs',
    });

    expect(repository.update).toHaveBeenCalledWith({
      userId: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      businessName: 'Updated Repairs',
    });
  });

  it('replaces owned provider services after validating titles', async () => {
    const repository: ProviderProfileRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      listPortfolioMedia: jest.fn(),
      addPortfolioMedia: jest.fn(),
      deletePortfolioMedia: jest.fn(),
      listOwnedServices: jest.fn(),
      replaceOwnedServices: jest.fn().mockResolvedValue([]),
      listProviderApplications: jest.fn(),
      getProviderApplication: jest.fn(),
      decideProviderApplication: jest.fn(),
    };
    const service = new ProviderProfileService(repository);
    const services = [
      {
        title: 'Deep Cleaning',
        description: 'Full home cleaning',
        price: 1500,
        pricingMode: 'flat' as const,
        isActive: true,
      },
    ];

    await service.replaceOwnedServices(
      '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      services,
    );

    expect(repository.replaceOwnedServices).toHaveBeenCalledWith(
      '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      services,
    );
  });
});
