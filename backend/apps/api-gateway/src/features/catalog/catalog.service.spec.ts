import { CatalogGatewayService } from './catalog.service';
import { CatalogServiceClient } from './clients/catalog-service.client';

describe('CatalogGatewayService', () => {
  it('returns categories from the catalog service client', async () => {
    const service = new CatalogGatewayService({
      listCategories: jest.fn().mockResolvedValue([
        {
          id: '2de4b01a-9321-4e04-91d2-0ce48fdddf7d',
          name: 'Home Cleaning',
          description: 'Cleaning services',
          icon: 'sparkles',
        },
      ]),
    } as unknown as CatalogServiceClient);

    await expect(service.listCategories()).resolves.toEqual([
      {
        id: '2de4b01a-9321-4e04-91d2-0ce48fdddf7d',
        name: 'Home Cleaning',
        description: 'Cleaning services',
        icon: 'sparkles',
      },
    ]);
  });

  it('forwards service filters to the catalog service client', async () => {
    const client = {
      listServices: jest.fn().mockResolvedValue([]),
    } as unknown as CatalogServiceClient;
    const service = new CatalogGatewayService(client);

    await service.listServices('2de4b01a-9321-4e04-91d2-0ce48fdddf7d');

    expect(client.listServices).toHaveBeenCalledWith(
      '2de4b01a-9321-4e04-91d2-0ce48fdddf7d',
    );
  });

  it('forwards provider listing filters to the catalog service client', async () => {
    const client = {
      listProviderListings: jest.fn().mockResolvedValue([]),
    } as unknown as CatalogServiceClient;
    const service = new CatalogGatewayService(client);

    await service.listProviderListings(
      '2de4b01a-9321-4e04-91d2-0ce48fdddf7d',
      'ba904d23-964a-4e67-8e31-a34d1a04584e',
    );

    expect(client.listProviderListings).toHaveBeenCalledWith(
      '2de4b01a-9321-4e04-91d2-0ce48fdddf7d',
      'ba904d23-964a-4e67-8e31-a34d1a04584e',
    );
  });
});
