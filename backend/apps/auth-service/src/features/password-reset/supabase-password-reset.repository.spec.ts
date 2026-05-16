import { PasswordResetDependencyUnavailableError } from './password-reset.errors';
import { SupabasePasswordResetRepository } from './supabase-password-reset.repository';

describe('SupabasePasswordResetRepository', () => {
  it('requests a password reset email with normalized input', async () => {
    const resetPasswordForEmail = jest.fn().mockResolvedValue({ error: null });
    const repository = new SupabasePasswordResetRepository({
      auth: { resetPasswordForEmail },
    });

    await expect(
      repository.requestReset({
        email: ' Customer@Example.COM ',
        redirectTo: 'https://servease.test/reset-password',
      }),
    ).resolves.toEqual({ ok: true });
    expect(resetPasswordForEmail).toHaveBeenCalledWith(
      'customer@example.com',
      { redirectTo: 'https://servease.test/reset-password' },
    );
  });

  it('maps Supabase failures to a dependency error', async () => {
    const repository = new SupabasePasswordResetRepository({
      auth: {
        resetPasswordForEmail: jest.fn().mockResolvedValue({
          error: { message: 'smtp unavailable' },
        }),
      },
    });

    await expect(
      repository.requestReset({ email: 'customer@example.com' }),
    ).rejects.toBeInstanceOf(PasswordResetDependencyUnavailableError);
  });
});
