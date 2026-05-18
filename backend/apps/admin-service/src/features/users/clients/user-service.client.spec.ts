import { ConfigService } from '@nestjs/config';
import { UserServiceClient } from './user-service.client';

describe('UserServiceClient', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('defaults to the user-service port when USER_SERVICE_URL is not configured', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          totalCount: 0,
          byRole: { customer: 0, provider: 0, admin: 0 },
          byStatus: { active: 0, suspended: 0, inactive: 0 },
          recentCount: 0,
          newThisMonth: 0,
        },
      }),
    } as Response);
    const configService = {
      get: jest.fn((_key: string, fallback: string) => fallback),
    } as unknown as ConfigService;
    const client = new UserServiceClient(configService);

    await client.getSummary();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8502/internal/admin/users/summary',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});
