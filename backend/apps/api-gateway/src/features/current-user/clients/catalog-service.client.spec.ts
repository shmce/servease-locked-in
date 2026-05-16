import { ConfigService } from '@nestjs/config';
import { CatalogServiceClient } from './catalog-service.client';

describe('CatalogServiceClient', () => {
  it('loads provider ownership from the catalog service by provider id', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          userId: 'provider-user-1',
          businessName: 'GreenFix Home Services',
        },
      }),
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    try {
      const client = new CatalogServiceClient(configService());
      const owner = await client.findProviderOwnerByProviderId(
        'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      );

      expect(fetchMock).toHaveBeenCalledWith(
        'http://catalog-service.test/internal/providers/applications/b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      );
      expect(owner).toEqual({
        userId: 'provider-user-1',
        businessName: 'GreenFix Home Services',
      });
    } finally {
      globalThis.fetch = originalFetch;
      jest.restoreAllMocks();
    }
  });

  it('updates provider profile detail fields through the catalog service', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          id: 'provider-1',
          businessName: 'GreenFix Home Services',
          bio: 'Licensed home repair provider.',
          serviceDescription: 'Electrical and plumbing support.',
          serviceArea: 'Metro Manila',
          yearsExperience: 9,
          verificationStatus: 'approved',
          averageRating: 4.8,
          reviewCount: 12,
        },
      }),
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    try {
      const client = new CatalogServiceClient(configService());
      const result = await client.updateProviderProfile('user-1', {
        businessName: 'GreenFix Home Services',
        bio: 'Licensed home repair provider.',
        serviceDescription: 'Electrical and plumbing support.',
        serviceArea: 'Metro Manila',
        yearsExperience: 9,
      });

      expect(result.yearsExperience).toBe(9);
      expect(fetchMock).toHaveBeenCalledWith(
        'http://catalog-service.test/internal/providers/by-user/user-1',
        {
          method: 'PATCH',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            businessName: 'GreenFix Home Services',
            bio: 'Licensed home repair provider.',
            serviceDescription: 'Electrical and plumbing support.',
            serviceArea: 'Metro Manila',
            yearsExperience: 9,
          }),
        },
      );
    } finally {
      globalThis.fetch = originalFetch;
      jest.restoreAllMocks();
    }
  });
});

function configService(): ConfigService {
  return {
    get: jest.fn().mockReturnValue('http://catalog-service.test'),
  } as unknown as ConfigService;
}
