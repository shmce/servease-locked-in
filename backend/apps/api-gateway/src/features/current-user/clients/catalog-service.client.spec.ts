import { ConfigService } from '@nestjs/config';
import { CatalogServiceClient } from './catalog-service.client';

describe('CatalogServiceClient', () => {
  it('loads provider business name from public provider listings by provider id', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'listing-1',
            providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
            providerBusinessName: 'GreenFix Home Services',
            serviceId: 'service-1',
            title: 'Deep Cleaning',
            description: null,
            price: 1500,
            pricingMode: 'flat',
            averageRating: 4.9,
            reviewCount: 28,
            verificationStatus: 'approved',
          },
        ],
      }),
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    try {
      const client = new CatalogServiceClient(configService());
      const businessName = await client.findProviderBusinessNameByProviderId(
        'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      );

      expect(fetchMock).toHaveBeenCalledWith(
        'http://catalog-service.test/internal/catalog/providers?providerId=b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      );
      expect(businessName).toBe('GreenFix Home Services');
    } finally {
      globalThis.fetch = originalFetch;
      jest.restoreAllMocks();
    }
  });

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

  it('loads the current provider application status by user id', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          id: 'provider-application-1',
          applicationReference: 'PA-1234567890',
          businessName: 'GreenFix Home Services',
          serviceArea: 'Metro Manila',
          serviceDescription: 'Cleaning and repair',
          verificationStatus: 'pending',
          latestDecisionReason: 'Please upload your updated ID.',
          latestDecisionAt: '2026-05-17T08:00:00.000Z',
          createdAt: '2026-05-17T07:00:00.000Z',
          updatedAt: '2026-05-17T08:00:00.000Z',
        },
      }),
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    try {
      const client = new CatalogServiceClient(configService());
      const status = await client.getProviderApplicationByUserId(
        '22222222-2222-4222-8222-222222222222',
      );

      expect(status?.applicationReference).toBe('PA-1234567890');
      expect(fetchMock).toHaveBeenCalledWith(
        'http://catalog-service.test/internal/providers/applications/by-user/22222222-2222-4222-8222-222222222222',
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
