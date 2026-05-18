import { SupabaseAdminUserRepository } from './supabase-admin-user.repository';

describe('SupabaseAdminUserRepository', () => {
  it('loads admin user summary through the injected Supabase client', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: {
        totalCount: 3,
        byRole: { customer: 1, provider: 1, admin: 1 },
        byStatus: { active: 2, suspended: 1, inactive: 0 },
        recentCount: 2,
        newThisMonth: 1,
      },
      error: null,
    });
    const repo = new SupabaseAdminUserRepository({ rpc });

    const summary = await repo.getSummary();

    expect(rpc).toHaveBeenCalledWith('servease_admin_users_summary');
    expect(summary).toEqual({
      totalCount: 3,
      byRole: { customer: 1, provider: 1, admin: 1 },
      byStatus: { active: 2, suspended: 1, inactive: 0 },
      recentCount: 2,
      newThisMonth: 1,
    });
  });
});
