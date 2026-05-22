export const defaultMobileProductionSeedBatchId = 'mobile_seed_2026_05_23';

export interface MobileProductionSeedPlan {
  seedBatchId: string;
  databaseOnly: boolean;
  totalRows: number;
  demoUsers: {
    customer: { id: string; email: string };
    provider: { id: string; email: string };
    admin: { id: string; email: string };
  };
  tableCounts: Record<string, number>;
}

const tableCounts: Record<string, number> = {
  'identity_and_user.users': 14,
  'identity_and_user.customer_profiles': 1,
  'identity_and_user.user_addresses': 1,
  'provider_catalog.service_categories': 3,
  'provider_catalog.services': 4,
  'provider_catalog.provider_profiles': 12,
  'provider_catalog.provider_services': 12,
  'booking.bookings': 16,
  'booking.booking_timeline_events': 4,
  'booking.booking_service_updates': 2,
  'booking.booking_live_locations': 2,
  'messages.conversations': 4,
  'messages.messages': 16,
  'notification_and_support.notifications': 4,
  'notification_and_support.support_tickets': 6,
  'notification_and_support.support_ticket_replies': 3,
  'payment.payments': 10,
  'trust_and_reputation.reviews': 4,
};

export function buildMobileProductionSeedPlan(
  seedBatchId = defaultMobileProductionSeedBatchId,
): MobileProductionSeedPlan {
  return {
    seedBatchId,
    databaseOnly: true,
    totalRows: Object.values(tableCounts).reduce((sum, count) => sum + count, 0),
    demoUsers: {
      customer: {
        id: 'a0c9b6a1-7760-5044-ad1b-aea3abf2430d',
        email: 'mobile.customer.seed@servease.test',
      },
      provider: {
        id: '6b3db75c-634b-566a-ac60-387873990b2b',
        email: 'mobile.provider.seed@servease.test',
      },
      admin: {
        id: '6d049eda-9583-54e6-94c1-f3f436050f65',
        email: 'mobile.admin.seed@servease.test',
      },
    },
    tableCounts: { ...tableCounts },
  };
}
