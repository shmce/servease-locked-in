import { GeoServiceClient } from './clients/geo-service.client';
import { InvalidGeoRequestError } from './geo.errors';
import { GeoGatewayService } from './geo.service';

describe('GeoGatewayService', () => {
  it('geocodes normalized addresses through the user service geo client', async () => {
    const geoServiceClient = {
      geocodeAddress: jest.fn().mockResolvedValue({
        formattedAddress: 'Manila, Philippines',
        latitude: 14.5995,
        longitude: 120.9842,
        provider: 'google-maps',
      }),
    } as unknown as GeoServiceClient;
    const service = new GeoGatewayService(geoServiceClient);

    await service.geocodeAddress({
      address: ' Manila, Philippines ',
      language: ' en ',
    });

    expect(geoServiceClient.geocodeAddress).toHaveBeenCalledWith({
      address: 'Manila, Philippines',
      language: 'en',
      region: undefined,
    });
  });

  it('rejects invalid reverse-geocode coordinates before service calls', async () => {
    const geoServiceClient = {
      reverseGeocode: jest.fn(),
    } as unknown as GeoServiceClient;
    const service = new GeoGatewayService(geoServiceClient);

    expect(() =>
      service.reverseGeocode({ latitude: 95, longitude: 120 }),
    ).toThrow(InvalidGeoRequestError);
    expect(geoServiceClient.reverseGeocode).not.toHaveBeenCalled();
  });
});

