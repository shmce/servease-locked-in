import { SupabaseCatalogBrowseRepository } from './supabase-catalog-browse.repository';

describe('SupabaseCatalogBrowseRepository', () => {
  it('maps active categories from RPC rows', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          id: '2de4b01a-9321-4e04-91d2-0ce48fdddf7d',
          name: 'Home Cleaning',
          description: 'Cleaning services',
          icon: 'sparkles',
        },
      ],
      error: null,
    });
    const repository = new SupabaseCatalogBrowseRepository({ rpc });

    await expect(repository.listCategories()).resolves.toEqual([
      {
        id: '2de4b01a-9321-4e04-91d2-0ce48fdddf7d',
        name: 'Home Cleaning',
        description: 'Cleaning services',
        icon: 'sparkles',
      },
    ]);
    expect(rpc).toHaveBeenCalledWith('servease_list_catalog_categories');
  });

  it('forwards category filters when listing services', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          id: '14e09a89-b7ad-483b-bfb6-6c49d8923197',
          category_id: '2de4b01a-9321-4e04-91d2-0ce48fdddf7d',
          name: 'Deep Clean',
          description: 'Detailed home cleaning',
          price: '1200',
          pricing_mode: 'flat',
        },
      ],
      error: null,
    });
    const repository = new SupabaseCatalogBrowseRepository({ rpc });

    await expect(
      repository.listServices('2de4b01a-9321-4e04-91d2-0ce48fdddf7d'),
    ).resolves.toEqual([
      {
        id: '14e09a89-b7ad-483b-bfb6-6c49d8923197',
        categoryId: '2de4b01a-9321-4e04-91d2-0ce48fdddf7d',
        name: 'Deep Clean',
        description: 'Detailed home cleaning',
        price: 1200,
        pricingMode: 'flat',
      },
    ]);
    expect(rpc).toHaveBeenCalledWith('servease_list_catalog_services', {
      p_category_id: '2de4b01a-9321-4e04-91d2-0ce48fdddf7d',
    });
  });

  it('lists active service areas from the service-area catalog', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          id: '2de4b01a-9321-4e04-91d2-0ce48fdddf7d',
          name: 'Makati',
          city: 'Makati',
          region: 'Metro Manila',
          status: 'active',
          provider_count: '8',
          latitude: '14.5547',
          longitude: '121.0244',
        },
        {
          id: '14e09a89-b7ad-483b-bfb6-6c49d8923197',
          name: 'Retired Area',
          city: 'Retired',
          region: 'Metro Manila',
          status: 'inactive',
          provider_count: '0',
          latitude: null,
          longitude: null,
        },
      ],
      error: null,
    });
    const repository = new SupabaseCatalogBrowseRepository({ rpc });

    await expect(repository.listServiceAreas()).resolves.toEqual([
      {
        id: '2de4b01a-9321-4e04-91d2-0ce48fdddf7d',
        name: 'Makati',
        city: 'Makati',
        region: 'Metro Manila',
        status: 'active',
        providerCount: 8,
        latitude: 14.5547,
        longitude: 121.0244,
      },
    ]);
    expect(rpc).toHaveBeenCalledWith('servease_admin_list_service_areas');
  });

  it('forwards filters and maps provider listing summaries', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          id: '416dbd36-967d-43f8-9ca7-e0fa0441a1fa',
          provider_id: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
          provider_business_name: 'Reliable Repairs',
          service_id: '14e09a89-b7ad-483b-bfb6-6c49d8923197',
          title: 'Deep Clean Package',
          description: 'Full house deep clean',
          price: '1500',
          pricing_mode: 'flat',
          average_rating: '4.8',
          review_count: 12,
          verification_status: 'approved',
        },
      ],
      error: null,
    });
    const repository = new SupabaseCatalogBrowseRepository({ rpc });

    await expect(
      repository.listProviderListings(
        '14e09a89-b7ad-483b-bfb6-6c49d8923197',
        'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      ),
    ).resolves.toEqual([
      {
        id: '416dbd36-967d-43f8-9ca7-e0fa0441a1fa',
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        providerBusinessName: 'Reliable Repairs',
        serviceId: '14e09a89-b7ad-483b-bfb6-6c49d8923197',
        title: 'Deep Clean Package',
        description: 'Full house deep clean',
        price: 1500,
        pricingMode: 'flat',
        averageRating: 4.8,
        reviewCount: 12,
        verificationStatus: 'approved',
      },
    ]);
    expect(rpc).toHaveBeenCalledWith('servease_list_provider_service_listings', {
      p_service_id: '14e09a89-b7ad-483b-bfb6-6c49d8923197',
      p_provider_id: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    });
  });
});
