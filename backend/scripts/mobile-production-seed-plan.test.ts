import {
  buildMobileProductionSeedPlan,
  defaultMobileProductionSeedBatchId,
} from './mobile-production-seed-plan';

describe('mobile production-like seed plan', () => {
  it('uses deterministic, reversible seed identifiers and no real user emails', () => {
    const plan = buildMobileProductionSeedPlan();

    expect(plan.seedBatchId).toBe(defaultMobileProductionSeedBatchId);
    expect(plan.totalRows).toBeGreaterThanOrEqual(95);
    expect(plan.totalRows).toBeLessThanOrEqual(125);
    expect(plan.databaseOnly).toBe(true);
    expect(plan.demoUsers.customer.email).toBe(
      'mobile.customer.seed@servease.test',
    );
    expect(plan.demoUsers.provider.email).toBe(
      'mobile.provider.seed@servease.test',
    );
    expect(plan.demoUsers.admin.email).toBe(
      'mobile.admin.seed@servease.test',
    );
    expect(plan.tableCounts).toEqual(
      expect.objectContaining({
        'identity_and_user.users': 14,
        'provider_catalog.provider_profiles': 12,
        'provider_catalog.provider_services': 12,
        'booking.bookings': 16,
        'messages.messages': 16,
        'notification_and_support.support_tickets': 6,
        'payment.payments': 10,
      }),
    );
  });
});
