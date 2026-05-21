import { AuthRequiredError, InvalidAuthTokenError } from './current-user.errors';
import { AuthTokenService } from './auth-token.service';

describe('AuthTokenService', () => {
  it('returns the Supabase user id for a valid bearer token', async () => {
    const service = new AuthTokenService({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
            },
          },
          error: null,
        }),
      },
    });

    await expect(service.authenticate('Bearer valid-token')).resolves.toBe(
      '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
    );
    expect(service.authClient.auth.getUser).toHaveBeenCalledWith('valid-token');
  });

  it('accepts bearer auth schemes case-insensitively with extra spacing', async () => {
    const service = new AuthTokenService({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
            },
          },
          error: null,
        }),
      },
    });

    await expect(service.authenticate(' bearer   valid-token  ')).resolves.toBe(
      '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
    );
    expect(service.authClient.auth.getUser).toHaveBeenCalledWith('valid-token');
  });

  it('rejects requests without a bearer token', async () => {
    const service = new AuthTokenService({
      auth: {
        getUser: jest.fn(),
      },
    });

    await expect(service.authenticate(undefined)).rejects.toBeInstanceOf(
      AuthRequiredError,
    );
    expect(service.authClient.auth.getUser).not.toHaveBeenCalled();
  });

  it('rejects invalid Supabase tokens', async () => {
    const service = new AuthTokenService({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: null,
          },
          error: {
            message: 'invalid token',
          },
        }),
      },
    });

    await expect(service.authenticate('Bearer invalid-token')).rejects.toBeInstanceOf(
      InvalidAuthTokenError,
    );
  });
});
