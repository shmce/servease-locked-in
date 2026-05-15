import { createHealthResponse } from './create-health-response';

describe('createHealthResponse', () => {
  it('returns a stable service health payload', () => {
    const now = new Date('2026-05-15T00:00:00.000Z');

    expect(createHealthResponse('api-gateway', now)).toEqual({
      service: 'api-gateway',
      status: 'ok',
      timestamp: '2026-05-15T00:00:00.000Z',
    });
  });
});
