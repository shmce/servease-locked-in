import { createApicenterClient } from '@servease/common';
import { InvalidSharedAuthRequestError } from './shared-auth.errors';
import { SharedAuthService } from './shared-auth.service';

jest.mock('@servease/common', () => ({
  createApicenterClient: jest.fn(),
}));

const mockCreateApicenterClient = createApicenterClient as jest.Mock;

describe('SharedAuthService', () => {
  beforeEach(() => {
    mockCreateApicenterClient.mockReset();
  });

  it('generates OTP through APICenter OTP', async () => {
    const otpGenerate = jest.fn().mockResolvedValue({
      otpId: 'otp-1',
      expiresAt: '2026-05-18T00:00:00Z',
      channel: 'email',
      target: 'user@example.com',
    });
    mockCreateApicenterClient.mockReturnValue({ otpGenerate });
    const service = new SharedAuthService();

    await service.generateOtp({
      target: 'user@example.com',
      channel: 'email',
      length: 6,
      expiresInSeconds: 300,
    });

    expect(otpGenerate).toHaveBeenCalledWith({
      target: 'user@example.com',
      channel: 'email',
      length: 6,
      expiresInSeconds: 300,
    });
  });

  it('rejects invalid OTP input before APICenter calls', async () => {
    const service = new SharedAuthService();

    await expect(
      service.generateOtp({ target: 'not-email', channel: 'email' }),
    ).rejects.toBeInstanceOf(InvalidSharedAuthRequestError);
    expect(mockCreateApicenterClient).not.toHaveBeenCalled();
  });

  it('gets Google authorization URL through APICenter gauth', async () => {
    const gauthGetAuthorizationUrl = jest.fn().mockResolvedValue({
      authorizationUrl: 'https://accounts.google.test/auth',
    });
    mockCreateApicenterClient.mockReturnValue({ gauthGetAuthorizationUrl });
    const service = new SharedAuthService();

    await service.getGoogleAuthorizationUrl({
      redirectUri: 'https://servease.test/auth/google/callback',
      scopes: [' openid ', 'email'],
    });

    expect(gauthGetAuthorizationUrl).toHaveBeenCalledWith({
      redirectUri: 'https://servease.test/auth/google/callback',
      scopes: ['openid', 'email'],
      state: undefined,
    });
  });
});

