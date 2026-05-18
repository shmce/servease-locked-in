import { createApicenterClient } from '@servease/common';
import { InvalidSharedGeoRequestError } from './shared-geo.errors';
import { SharedGeoService } from './shared-geo.service';

jest.mock('@servease/common', () => ({
  createApicenterClient: jest.fn(),
}));

const mockCreateApicenterClient = createApicenterClient as jest.Mock;

describe('SharedGeoService', () => {
  const originalFetch = global.fetch;
  const originalOpenRouteServiceApiKey = process.env.OPENROUTESERVICE_API_KEY;

  beforeEach(() => {
    mockCreateApicenterClient.mockReset();
    process.env.OPENROUTESERVICE_API_KEY = 'ors-test-key';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalOpenRouteServiceApiKey === undefined) {
      delete process.env.OPENROUTESERVICE_API_KEY;
    } else {
      process.env.OPENROUTESERVICE_API_KEY = originalOpenRouteServiceApiKey;
    }
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

  it('gets driving directions through OpenRouteService', async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        bbox: [120.98, 14.58, 121.01, 14.62],
        features: [
          {
            geometry: {
              coordinates: [
                [120.9842, 14.5995],
                [121.001, 14.61],
              ],
            },
            properties: {
              summary: {
                distance: 3210,
                duration: 780,
              },
              segments: [
                {
                  steps: [
                    {
                      instruction: 'Head north',
                      distance: 120,
                      duration: 30,
                      name: 'Test Road',
                      type: 11,
                      way_points: [0, 1],
                    },
                  ],
                },
              ],
            },
          },
        ],
      }),
    });

    const service = new SharedGeoService();
    const route = await service.directions({
      origin: { latitude: 14.5995, longitude: 120.9842 },
      destination: { latitude: 14.61, longitude: 121.001 },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          authorization: 'ors-test-key',
          'content-type': 'application/json',
        }),
      }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      coordinates: [
        [120.9842, 14.5995],
        [121.001, 14.61],
      ],
      instructions: true,
      language: 'en',
      units: 'm',
    });
    expect(route).toEqual(
      expect.objectContaining({
        provider: 'openrouteservice',
        distanceMeters: 3210,
        durationSeconds: 780,
        geometry: [
          { latitude: 14.5995, longitude: 120.9842 },
          { latitude: 14.61, longitude: 121.001 },
        ],
      }),
    );
    expect(route.steps[0]).toEqual({
      instruction: 'Head north',
      distanceMeters: 120,
      durationSeconds: 30,
      name: 'Test Road',
      type: 11,
      wayPoints: [0, 1],
    });
  });

  it('rejects invalid directions coordinates before OpenRouteService calls', async () => {
    const service = new SharedGeoService();

    await expect(
      service.directions({
        origin: { latitude: Number.NaN, longitude: 120.9842 },
        destination: { latitude: 14.61, longitude: 121.001 },
      }),
    ).rejects.toBeInstanceOf(InvalidSharedGeoRequestError);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
