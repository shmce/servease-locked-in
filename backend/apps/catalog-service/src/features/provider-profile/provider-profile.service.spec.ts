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
});
