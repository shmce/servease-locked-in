import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BookingSummary,
  CatalogCategory,
  CatalogServiceItem,
  CurrentUserProfile,
  CustomerAddressSummary,
  ProviderListing,
} from '../../../shared/models/types';
import { buildCustomerExploreViewModel } from './useCustomerExploreViewModel';

const categories: CatalogCategory[] = [
  {
    id: 'quiet',
    name: 'Quiet Category',
    description: null,
    icon: null,
  },
  {
    id: 'busy',
    name: 'Busy Category',
    description: null,
    icon: null,
  },
  {
    id: 'premium',
    name: 'Premium Category',
    description: null,
    icon: null,
  },
  {
    id: 'single-review',
    name: 'Single Review Category',
    description: null,
    icon: null,
  },
];

const services: CatalogServiceItem[] = [
  service('quiet-service', 'quiet'),
  service('busy-service', 'busy'),
  service('premium-service', 'premium'),
  service('single-review-service', 'single-review'),
];

describe('buildCustomerExploreViewModel category order', () => {
  it('keeps category rows in catalog order even when provider activity varies', () => {
    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      providers: [
        provider('quiet-provider', 'quiet-service', 4.8, 20),
        provider('busy-provider-1', 'busy-service', 4.4, 4),
        provider('busy-provider-2', 'busy-service', 4.3, 8),
        provider('busy-provider-3', 'busy-service', 4.2, 11),
      ],
    });

    assert.deepEqual(
      explore.data.categoryRows.map((row) => row.id),
      ['quiet', 'busy', 'premium', 'single-review'],
    );
  });
});

describe('buildCustomerExploreViewModel dashboard state', () => {
  it('uses profile-backed greeting and location labels', () => {
    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      profile: customerProfile({
        userFullName: 'Ada Lovelace',
        customerAddresses: [
          customerAddress({
            id: 'address-home',
            label: 'Home',
            city: 'Manila',
            isDefault: true,
          }),
        ],
      }),
    });

    assert.equal(explore.data.customerName, 'Ada Lovelace');
    assert.equal(explore.data.locationLabel, 'Home - Manila');
    assert.equal(explore.data.location.state, 'verified');
    assert.equal(explore.data.location.statusLabel, 'Pin verified');
  });

  it('uses persisted avatar data with initials fallback', () => {
    const withAvatar = buildCustomerExploreViewModel({
      ...baseInput(),
      profile: customerProfile({
        avatarUrl: 'https://storage.test/customer-avatar.jpg',
        userFullName: 'Ada Lovelace',
      }),
    });
    const fallback = buildCustomerExploreViewModel({
      ...baseInput(),
      profile: customerProfile({
        avatarUrl: null,
        userEmail: 'maria@example.com',
        userFullName: '   ',
      }),
    });

    assert.equal(
      withAvatar.data.avatar.uri,
      'https://storage.test/customer-avatar.jpg',
    );
    assert.equal(withAvatar.data.avatar.initial, 'A');
    assert.equal(
      withAvatar.data.avatar.accessibilityLabel,
      'Open customer profile for Ada',
    );
    assert.equal(fallback.data.avatar.uri, null);
    assert.equal(fallback.data.avatar.initial, 'M');
    assert.equal(
      fallback.data.avatar.accessibilityLabel,
      'Open customer profile for Maria@example.com',
    );
  });

  it('keeps notification display data separate from avatar display data', () => {
    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      unreadCount: 3,
      profile: customerProfile({
        avatarUrl: 'https://storage.test/customer-avatar.jpg',
      }),
    });

    assert.equal(explore.data.notification.hasUnread, true);
    assert.equal(explore.data.notification.unreadCount, 3);
    assert.equal(
      explore.data.notification.accessibilityLabel,
      'Notifications, 3 unread',
    );
    assert.equal(
      explore.data.avatar.accessibilityLabel,
      'Open customer profile for Customer',
    );
  });

  it('uses safe greeting fallback when customer name is missing', () => {
    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      profile: customerProfile({
        userFullName: '   ',
      }),
    });

    assert.equal(explore.data.customerName, 'You');
  });

  it('falls back when no customer addresses exist', () => {
    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      profile: customerProfile({
        customerAddresses: [],
      }),
    });

    assert.equal(explore.data.locationLabel, 'Set home address');
    assert.equal(explore.data.location.label, 'Set home address');
    assert.equal(explore.data.location.state, 'setup');
    assert.equal(explore.data.location.statusLabel, 'Add a saved address');
  });

  it('marks saved addresses without coordinates as needing verification', () => {
    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      profile: customerProfile({
        customerAddresses: [
          customerAddress({
            id: 'address-home',
            city: 'Makati',
            isDefault: true,
            latitude: null,
            longitude: null,
          }),
        ],
      }),
    });

    assert.equal(explore.data.location.label, 'Home - Makati');
    assert.equal(explore.data.location.state, 'needs_verification');
    assert.equal(explore.data.location.statusLabel, 'Verify pin once');
    assert.equal(
      explore.data.location.accessibilityLabel,
      'Home - Makati, verify pin once',
    );
  });

  it('uses loading-safe context labels while profile context is loading', () => {
    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      profile: customerProfile({
        customerAddresses: [
          customerAddress({
            id: 'address-home',
            label: 'Home',
            city: 'Manila',
            isDefault: true,
          }),
        ],
      }),
      isProfileLoading: true,
    });

    assert.equal(explore.data.customerName, 'You');
    assert.equal(explore.data.locationLabel, 'Loading location...');
    assert.equal(explore.data.location.state, 'loading');
    assert.equal(explore.data.location.statusLabel, 'Checking saved address');
    assert.equal(explore.data.avatar.initial, 'Y');
  });

  it('selects the highest-priority present booking deterministically', () => {
    const confirmedSooner = booking('booking-b', 'confirmed', '2026-06-04T09:00:00.000Z');
    const activeLater = booking('booking-a', 'in_progress', '2026-06-05T09:00:00.000Z');
    const pending = booking('booking-c', 'pending', '2026-06-03T09:00:00.000Z');

    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      bookings: [confirmedSooner, pending, activeLater],
    });

    assert.equal(explore.data.hasPresentBooking, true);
    assert.equal(explore.data.presentBooking?.id, activeLater.id);
    assert.equal(explore.data.presentBooking?.statusLabel, 'On the way');
    assert.equal(explore.data.presentBooking?.actionLabel, 'Track');
  });

  it('does not surface past scheduled bookings as present bookings', () => {
    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      bookings: [
        booking('past-confirmed', 'confirmed', '2026-05-28T02:00:00.000Z'),
        booking('past-pending', 'pending', '2026-05-29T02:00:00.000Z'),
        booking('future-confirmed', 'confirmed', '2026-06-03T02:00:00.000Z'),
      ],
    });

    assert.equal(explore.data.presentBooking?.id, 'future-confirmed');
    assert.equal(explore.data.presentBooking?.statusLabel, 'Scheduled');
  });

  it('falls back to no-booking state when all scheduled bookings are stale', () => {
    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      bookings: [
        booking('past-confirmed', 'confirmed', '2026-05-28T02:00:00.000Z'),
        booking('past-pending', 'pending', '2026-05-29T02:00:00.000Z'),
      ],
    });

    assert.equal(explore.data.hasPresentBooking, false);
    assert.equal(explore.data.presentBooking, null);
  });

  it('uses no-booking display state when only closed bookings exist', () => {
    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      bookings: [
        booking('completed-booking', 'completed', '2026-06-01T09:00:00.000Z'),
        booking('cancelled-booking', 'cancelled', '2026-06-02T09:00:00.000Z'),
      ],
    });

    assert.equal(explore.data.hasPresentBooking, false);
    assert.equal(explore.data.presentBooking, null);
    assert.equal(explore.data.noBooking.title, 'No booking right now');
    assert.equal(explore.data.noBooking.primaryActionLabel, 'Book a service');
  });

  it('builds compact dashboard rows from existing catalog props', () => {
    const providers = [
      provider('low-rating', 'quiet-service', 4.1, 100),
      provider('verified-best', 'busy-service', 4.9, 12),
      {
        ...provider('unverified-high', 'premium-service', 5, 50),
        verificationStatus: 'pending' as const,
      },
    ];

    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      bookings: [
        booking('deep-cleaning', 'completed', '2026-05-01T09:00:00.000Z'),
        booking('ac-repair', 'completed', '2026-05-02T09:00:00.000Z'),
        booking('third-completed', 'completed', '2026-05-03T09:00:00.000Z'),
      ],
      providers,
    });

    assert.equal(explore.data.compactBookAgainRows.length, 2);
    assert.equal(explore.data.quickCategoryRows.length, 4);
    assert.deepEqual(
      explore.data.popularProviderRows.map((row) => row.id),
      ['verified-best', 'low-rating'],
    );
    assert.equal(explore.data.popularServiceRows.length, 2);
  });

  it('builds reference category tiles without routing unavailable placeholders', () => {
    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      categories: [
        {
          id: 'cleaning',
          name: 'Home Cleaning',
          description: null,
          icon: null,
        },
        {
          id: 'electrical',
          name: 'Electrical Repairs',
          description: null,
          icon: null,
        },
      ],
      selectedCategoryId: 'electrical',
    });

    assert.deepEqual(
      explore.data.referenceCategoryRows.map((row) => row.label),
      ['Cleaning', 'Repairs', 'Plumbing', 'Electrical', 'Home Care'],
    );
    assert.equal(explore.data.referenceCategoryRows[0]?.category?.id, 'cleaning');
    assert.equal(explore.data.referenceCategoryRows[0]?.isAvailable, true);
    assert.equal(explore.data.referenceCategoryRows[1]?.category, null);
    assert.equal(explore.data.referenceCategoryRows[1]?.isAvailable, false);
    assert.equal(explore.data.referenceCategoryRows[3]?.category?.id, 'electrical');
    assert.equal(explore.data.referenceCategoryRows[3]?.isSelected, true);
  });

  it('keeps the visible reference category rail in default order', () => {
    const filterCategories: CatalogCategory[] = [
      {
        id: 'cleaning',
        name: 'Home Cleaning',
        description: null,
        icon: null,
      },
      {
        id: 'plumbing',
        name: 'Plumbing',
        description: null,
        icon: null,
      },
      {
        id: 'electrical',
        name: 'Electrical',
        description: null,
        icon: null,
      },
    ];
    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      categories: filterCategories,
      services: [
        service('cleaning-service', 'cleaning'),
        service('plumbing-service', 'plumbing'),
        service('electrical-service', 'electrical'),
      ],
      providers: [
        provider('plumbing-provider-1', 'plumbing-service', 4.2, 3),
        provider('plumbing-provider-2', 'plumbing-service', 4.1, 4),
        provider('electrical-provider', 'electrical-service', 4.95, 25),
      ],
    });

    assert.deepEqual(
      explore.data.referenceCategoryRows.map((row) => row.label),
      ['Cleaning', 'Repairs', 'Plumbing', 'Electrical', 'Home Care'],
    );
  });

  it('builds recommendation card fallbacks that match the reference copy', () => {
    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      services: [],
      providers: [],
    });

    assert.deepEqual(
      explore.data.recommendedServiceRows.map((row) => ({
        imageKey: row.imageKey,
        priceLabel: row.priceLabel,
        providerLabel: row.providerLabel,
        ratingLabel: row.ratingLabel,
        service: row.service,
        title: row.title,
      })),
      [
        {
          imageKey: 'cleaning',
          priceLabel: '\u20b1550',
          providerLabel: 'Sparkle Cleaners',
          ratingLabel: '4.8',
          service: null,
          title: 'Home Cleaning',
        },
        {
          imageKey: 'repairs',
          priceLabel: '\u20b1450',
          providerLabel: 'FixIt Handyman',
          ratingLabel: '4.9',
          service: null,
          title: 'Minor Repairs',
        },
        {
          imageKey: 'aircon',
          priceLabel: '\u20b1650',
          providerLabel: 'CoolPro Services',
          ratingLabel: '4.7',
          service: null,
          title: 'Aircon Cleaning',
        },
      ],
    );
  });

  it('keeps reference recommendation copy while connecting matching live services', () => {
    const cleaningService: CatalogServiceItem = {
      id: 'live-cleaning',
      categoryId: 'cleaning',
      name: 'Premium Home Cleaning',
      description: 'Deep clean package',
      price: 900,
      pricingMode: 'flat',
    };
    const repairsService: CatalogServiceItem = {
      id: 'live-repair',
      categoryId: 'repair',
      name: 'Minor Repairs Visit',
      description: 'Fixture tune up',
      price: 475,
      pricingMode: 'flat',
    };

    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      services: [cleaningService, repairsService],
      providers: [
        provider('cleaning-provider', 'live-cleaning', 4.6, 8),
        provider('repair-provider', 'live-repair', 5, 14),
      ],
      selectedServiceId: 'live-repair',
    });

    assert.equal(explore.data.recommendedServiceRows[0]?.service?.id, 'live-cleaning');
    assert.equal(explore.data.recommendedServiceRows[0]?.title, 'Home Cleaning');
    assert.equal(explore.data.recommendedServiceRows[0]?.providerLabel, 'Sparkle Cleaners');
    assert.equal(explore.data.recommendedServiceRows[0]?.priceLabel, '\u20b1550');
    assert.equal(explore.data.recommendedServiceRows[1]?.service?.id, 'live-repair');
    assert.equal(explore.data.recommendedServiceRows[1]?.isSelected, true);
    assert.equal(explore.data.recommendedServiceRows[1]?.ratingLabel, '4.9');
  });

  it('builds the upcoming booking card and no-booking fallback', () => {
    const exploreWithBooking = buildCustomerExploreViewModel({
      ...baseInput(),
      bookings: [booking('home-cleaning', 'confirmed', '2026-06-04T09:00:00.000Z')],
    });
    const exploreWithoutBooking = buildCustomerExploreViewModel({
      ...baseInput(),
      bookings: [],
    });

    assert.equal(exploreWithBooking.data.upcomingBookingCard.booking?.id, 'home-cleaning');
    assert.equal(exploreWithBooking.data.upcomingBookingCard.statusLabel, 'Upcoming booking');
    assert.equal(exploreWithBooking.data.upcomingBookingCard.title, 'Home Cleaning');
    assert.equal(exploreWithBooking.data.upcomingBookingCard.meta, 'Jun 4, 2026 - 5:00 PM');
    assert.equal(exploreWithoutBooking.data.upcomingBookingCard.booking, null);
    assert.equal(exploreWithoutBooking.data.upcomingBookingCard.statusLabel, 'Ready to book');
    assert.equal(exploreWithoutBooking.data.upcomingBookingCard.title, 'Book a service');
  });

  it('cleans seed labels before exposing dashboard copy', () => {
    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      bookings: [
        {
          ...booking(
            'seed-booking',
            'in_progress',
            '2026-06-02T02:00:00.000Z',
          ),
          providerBusinessName: '[lkr_seed_2026_05_23] GreenFix Home Services',
          serviceTitle: '[lkr_seed_2026_05_23] Minor Repair Visit',
        },
      ],
      categories: [
        {
          id: 'seed-category',
          name: '[lkr_seed_2026_05_23]',
          description: null,
          icon: null,
        },
      ],
      services: [
        {
          id: 'seed-service',
          categoryId: 'seed-category',
          name: '[lkr_seed_2026_05_23] Aircon Cleaning',
          description: '[lkr_seed_2026_05_23] Cooling tune up',
          price: 550,
          pricingMode: 'flat',
        },
      ],
    });

    assert.equal(explore.data.presentBooking?.title, 'Minor Repair Visit');
    assert.equal(explore.data.presentBooking?.providerLabel, 'GreenFix Home Services');
    assert.equal(explore.data.quickCategoryRows[0]?.label, 'Home Care');
    assert.equal(explore.data.popularServiceRows[0]?.title, 'Aircon Cleaning');
    assert.equal(explore.data.popularServiceRows[0]?.description, 'Cooling Tune Up');
  });
});

function baseInput() {
  return {
    bookings: [],
    categories,
    customerGuideDismissed: true,
    customerGuideStep: 0,
    profile: null,
    providers: [],
    selectedCategoryId: null,
    selectedProviderId: null,
    selectedServiceId: null,
    services,
    isProfileLoading: false,
    now: Date.parse('2026-06-02T00:00:00.000Z'),
    unreadCount: 0,
  };
}

function service(id: string, categoryId: string): CatalogServiceItem {
  return {
    id,
    categoryId,
    name: id,
    description: null,
    price: 1000,
    pricingMode: 'flat',
  };
}

function provider(
  id: string,
  serviceId: string,
  averageRating: number,
  reviewCount: number,
): ProviderListing {
  return {
    id,
    providerId: id,
    providerBusinessName: id,
    serviceId,
    title: id,
    description: null,
    price: 1000,
    pricingMode: 'flat',
    averageRating,
    reviewCount,
    verificationStatus: 'approved',
  };
}

function booking(
  id: string,
  status: BookingSummary['status'],
  scheduledAt: string,
): BookingSummary {
  return {
    id,
    bookingReference: `SRV-${id}`,
    customerId: 'customer-1',
    providerId: `provider-${id}`,
    providerBusinessName: `${id} Provider`,
    serviceId: `service-${id}`,
    serviceTitle: id,
    serviceAddress: '123 Manila St',
    scheduledAt,
    status,
    totalAmount: 1200,
  };
}

function customerProfile(overrides: {
  avatarUrl?: string | null;
  customerAddresses?: CustomerAddressSummary[];
  userEmail?: string;
  userFullName?: string | null;
} = {}): CurrentUserProfile {
  return {
    user: {
      id: 'customer-1',
      email: overrides.userEmail ?? 'customer@example.com',
      fullName: overrides.userFullName ?? 'Customer One',
      contactNumber: '+1 234 567 8900',
      avatarUrl: overrides.avatarUrl ?? null,
      avatarStoragePath: overrides.avatarUrl ? 'avatar/customer-1/avatar.jpg' : null,
      role: 'customer',
      status: 'active',
    },
    customerProfile: {
      id: 'customer-profile-1',
      address: 'Manila',
    },
    customerAddresses:
      overrides.customerAddresses ??
      [
        customerAddress({
          id: 'address-1',
          label: 'Home',
          city: 'Manila',
          isDefault: true,
        }),
      ],
    providerProfile: null,
  };
}

function customerAddress(
  overrides: {
    id: string;
    label?: string;
    city?: string | null;
    barangay?: string | null;
    isDefault?: boolean;
    latitude?: number | null;
    longitude?: number | null;
  } = {
    id: 'address-1',
  },
): CustomerAddressSummary {
  return {
    id: overrides.id,
    userId: 'customer-1',
    label: overrides.label ?? 'Home',
    address: 'Home Unit',
    barangay: overrides.barangay ?? null,
    city: overrides.city ?? 'Manila',
    province: 'Metro Manila',
    region: 'NCR',
    latitude: overrides.latitude === undefined ? 14.5995 : overrides.latitude,
    longitude: overrides.longitude === undefined ? 120.9842 : overrides.longitude,
    isDefault: Boolean(overrides.isDefault),
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}
