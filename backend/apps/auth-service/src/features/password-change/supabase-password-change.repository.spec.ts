import {
  InvalidPasswordChangeRequestError,
  PasswordChangeDependencyUnavailableError,
} from './password-change.errors';
import { SupabasePasswordChangeRepository } from './supabase-password-change.repository';

describe('SupabasePasswordChangeRepository', () => {
  it('verifies the current password before updating the auth password', async () => {
    const signInWithPassword = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    const updateUserById = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    const repository = new SupabasePasswordChangeRepository(
      { auth: { signInWithPassword } },
      { auth: { admin: { updateUserById } } },
    );

    await expect(
      repository.changePassword({
        userId: 'user-1',
        email: ' Customer@Example.COM ',
        currentPassword: 'OldPassword#2026',
        newPassword: 'NewPassword#2026',
      }),
    ).resolves.toEqual({ ok: true });
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'customer@example.com',
      password: 'OldPassword#2026',
    });
    expect(updateUserById).toHaveBeenCalledWith('user-1', {
      password: 'NewPassword#2026',
    });
  });

  it('rejects when the current password does not verify for the same user', async () => {
    const repository = new SupabasePasswordChangeRepository(
      {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: { user: { id: 'other-user' } },
            error: null,
          }),
        },
      },
      {
        auth: {
          admin: {
            updateUserById: jest.fn(),
          },
        },
      },
    );

    await expect(
      repository.changePassword({
        userId: 'user-1',
        email: 'customer@example.com',
        currentPassword: 'wrong',
        newPassword: 'NewPassword#2026',
      }),
    ).rejects.toBeInstanceOf(InvalidPasswordChangeRequestError);
  });

  it('maps update failures to a dependency error', async () => {
    const repository = new SupabasePasswordChangeRepository(
      {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } },
            error: null,
          }),
        },
      },
      {
        auth: {
          admin: {
            updateUserById: jest.fn().mockResolvedValue({
              data: { user: null },
              error: { message: 'downstream' },
            }),
          },
        },
      },
    );

    await expect(
      repository.changePassword({
        userId: 'user-1',
        email: 'customer@example.com',
        currentPassword: 'OldPassword#2026',
        newPassword: 'NewPassword#2026',
      }),
    ).rejects.toBeInstanceOf(PasswordChangeDependencyUnavailableError);
  });
});
