import { createApicenterClient } from '@servease/common';
import { InvalidSharedGeoRequestError } from './shared-geo.errors';
import { SharedGeoService } from './shared-geo.service';

jest.mock('@servease/common', () => ({
  createApicenterClient: jest.fn(),
}));

const mockCreateApicenterClient = createApicenterClient as jest.Mock;

describe('SharedGeoService', () => {
  beforeEach(() => {
    mockCreateApicenterClient.mockReset();
  });

  it('geocodes normalized addresses through APICenter geo', async () => {
    const geoGeocodeAddress = jest.fn().mockResolvedValue({
      formattedAddress: 'Manila, Philippines',
      latitude: 14.5995,
      longitude: 120.9842,
      provider: 'google-maps',
    });
    mockCreateApicenterClient.mockReturnValue({ geoGeocodeAddress });
    const service = new SharedGeoService();

    await service.geocodeAddress({
      address: ' Manila, Philippines ',
      language: ' en ',
    });

    expect(geoGeocodeAddress).toHaveBeenCalledWith({
      address: 'Manila, Philippines',
      language: 'en',
      region: undefined,
    });
  });

  it('rejects invalid coordinates before APICenter calls', async () => {
    const service = new SharedGeoService();

    await expect(
      service.reverseGeocode({ latitude: 91, longitude: 120 }),
    ).rejects.toBeInstanceOf(InvalidSharedGeoRequestError);
    expect(mockCreateApicenterClient).not.toHaveBeenCalled();
  });

  it('checks geofence through APICenter geo', async () => {
    const geoFenceCheck = jest.fn().mockResolvedValue({
      inside: true,
      distanceDetails: [],
      provider: 'local',
    });
    mockCreateApicenterClient.mockReturnValue({ geoFenceCheck });
    const service = new SharedGeoService();

    await service.checkFence({
      latitude: 14.5995,
      longitude: 120.9842,
      fenceId: ' metro-manila ',
    });

    expect(geoFenceCheck).toHaveBeenCalledWith({
      latitude: 14.5995,
      longitude: 120.9842,
      fenceId: 'metro-manila',
      fences: undefined,
    });
  });
});

