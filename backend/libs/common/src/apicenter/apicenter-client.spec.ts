import { TribeClient } from '@implementsprint/sdk';
import {
  ApicenterConfigurationError,
  createApicenterClient,
} from './apicenter-client';

jest.mock('@implementsprint/sdk', () => ({
  TribeClient: jest.fn(),
}));

const MockTribeClient = TribeClient as jest.MockedClass<typeof TribeClient>;

describe('createApicenterClient', () => {
  beforeEach(() => {
    MockTribeClient.mockClear();
  });

  it('creates a tribe client from sanitized APICenter env values', () => {
    createApicenterClient({
      APICENTER_URL: 'https://api-center.test/',
      APICENTER_TRIBE_ID: ' servease ',
      APICENTER_SERVICE_ID: ' admin-service ',
      APICENTER_TRIBE_SECRET: ' secret ',
    });

    expect(MockTribeClient).toHaveBeenCalledWith({
      gatewayUrl: 'https://api-center.test',
      tribeId: 'servease',
      sourceServiceId: 'admin-service',
      secret: 'secret',
    });
  });

  it('rejects missing APICenter configuration before constructing the SDK client', () => {
    expect(() =>
      createApicenterClient({
        APICENTER_URL: 'https://api-center.test',
        APICENTER_TRIBE_ID: 'servease',
      }),
    ).toThrow(ApicenterConfigurationError);
    expect(MockTribeClient).not.toHaveBeenCalled();
  });
});
