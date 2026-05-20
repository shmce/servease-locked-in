import { useMemo } from 'react';
import {
  BookingSummary,
  CatalogCategory,
  CatalogServiceItem,
  CurrentUserProfile,
  ProviderListing,
} from '../../../shared/models/types';
import { formatDateTime, formatMoney } from '../../../shared/utils/booking';

type CustomerExploreViewModelInput = {
  bookings: BookingSummary[];
  categories: CatalogCategory[];
  customerGuideDismissed: boolean;
  customerGuideStep: number;
  profile: CurrentUserProfile | null;
  providers: ProviderListing[];
  selectedCategoryId: string | null;
  selectedProviderId: string | null;
  selectedServiceId: string | null;
  services: CatalogServiceItem[];
  unreadCount: number;
};

type GuideIconKey = 'search' | 'star' | 'message';
type CategoryBadgeTone = 'success' | 'warning' | 'danger' | 'neutral';

type CategoryBadge = {
  label: string;
  tone: CategoryBadgeTone;
};

const guideSteps: {
  iconKey: GuideIconKey;
  title: string;
  body: string;
}[] = [
  {
    iconKey: 'search',
    title: 'Find a service',
    body: 'Search by task or browse categories when you are not sure where to start.',
  },
  {
    iconKey: 'star',
    title: 'Pick a trusted provider',
    body: 'Compare rating, price, availability, portfolio, and reviews before booking.',
  },
  {
    iconKey: 'message',
    title: 'Track every update',
    body: 'Follow booking status, chat with the provider, and review after completion.',
  },
];

export function useCustomerExploreViewModel({
  bookings,
  categories,
  customerGuideDismissed,
  customerGuideStep,
  profile,
  providers,
  selectedCategoryId,
  selectedProviderId,
  selectedServiceId,
  services,
  unreadCount,
}: CustomerExploreViewModelInput) {
  return useMemo(() => buildCustomerExploreViewModel({
    bookings,
    categories,
    customerGuideDismissed,
    customerGuideStep,
    profile,
    providers,
    selectedCategoryId,
    selectedProviderId,
    selectedServiceId,
    services,
    unreadCount,
  }), [
    bookings,
    categories,
    customerGuideDismissed,
    customerGuideStep,
    profile,
    providers,
    selectedCategoryId,
    selectedProviderId,
    selectedServiceId,
    services,
    unreadCount,
  ]);
}

export function buildCustomerExploreViewModel({
  bookings,
  categories,
  customerGuideDismissed,
  customerGuideStep,
  profile,
  providers,
  selectedCategoryId,
  selectedProviderId,
  selectedServiceId,
  services,
  unreadCount,
}: CustomerExploreViewModelInput) {
  const safeGuideStep = customerGuideStep % guideSteps.length;
  const guideStep = guideSteps[safeGuideStep];
  const categoryBadges = buildCategoryBadges(categories, services, providers);
  const bookAgainRows = completedRebookOptions(bookings)
    .slice(0, 5)
    .map((booking) => ({
      booking,
      id: booking.id,
      initial: (booking.serviceTitle ?? 'S').slice(0, 1),
      subtitle: booking.providerBusinessName ?? formatDateTime(booking.scheduledAt),
      title: booking.serviceTitle ?? 'Service booking',
    }));

  return {
    data: {
      bookAgainRows,
      categoryRows: categories.map((category) => ({
        badges: categoryBadges.get(category.id) ?? [],
        category,
        id: category.id,
        isSelected: category.id === selectedCategoryId,
        subtitle: category.description ?? 'Tap to view services',
        title: category.name,
      })),
      customerName: profile?.user.fullName ?? 'Kisshia',
      guide: {
        body: guideStep.body,
        currentStep: safeGuideStep,
        iconKey: guideStep.iconKey,
        isVisible: !customerGuideDismissed,
        nextLabel: safeGuideStep === guideSteps.length - 1 ? 'Replay' : 'Next tip',
        stepLabel: `Start here - ${safeGuideStep + 1} of ${guideSteps.length}`,
        title: guideStep.title,
        totalSteps: guideSteps.length,
      },
      hasBookAgainCue: bookAgainRows.length > 1,
      hasBookAgainRows: bookAgainRows.length > 0,
      notificationAccessibilityLabel:
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : 'Notifications',
      providerRows: providers.map((provider) => ({
        description: provider.description ?? 'Ready to book.',
        id: provider.id,
        isSelected: provider.providerId === selectedProviderId,
        priceLabel: formatMoney(provider.price),
        provider,
        providerBusinessName: provider.providerBusinessName ?? 'Service provider',
        ratingLabel: `${provider.averageRating.toFixed(1)} rating - ${
          provider.reviewCount
        } reviews`,
        title: provider.title,
        verificationStatus: provider.verificationStatus,
        verificationTone:
          provider.verificationStatus === 'approved' ? 'success' as const : 'warning' as const,
      })),
      serviceRows: services.map((service) => ({
        description: service.description ?? 'Bookable service',
        id: service.id,
        isSelected: service.id === selectedServiceId,
        priceLabel: formatMoney(service.price),
        service,
        title: service.name,
      })),
      unreadCount,
    },
    isLoading: false,
    error: null,
  };
}

function buildCategoryBadges(
  categories: CatalogCategory[],
  services: CatalogServiceItem[],
  providers: ProviderListing[],
): Map<string, CategoryBadge[]> {
  const badgesByCategory = new Map<string, CategoryBadge[]>();
  const categoryIds = new Set(categories.map((category) => category.id));
  const serviceCategoryById = new Map<string, string>();
  const serviceCountsByCategory = new Map<string, number>();

  services.forEach((service) => {
    if (!service.categoryId || !categoryIds.has(service.categoryId)) {
      return;
    }

    serviceCategoryById.set(service.id, service.categoryId);
    serviceCountsByCategory.set(
      service.categoryId,
      (serviceCountsByCategory.get(service.categoryId) ?? 0) + 1,
    );
  });

  const popularCategoryId = highestScoredKey(serviceCountsByCategory);
  if (popularCategoryId) {
    addCategoryBadge(badgesByCategory, popularCategoryId, {
      label: 'Popular',
      tone: 'success',
    });
  }

  const providerScoresByCategory = new Map<string, number>();
  providers.forEach((provider) => {
    if (!provider.serviceId) {
      return;
    }

    const categoryId = serviceCategoryById.get(provider.serviceId);
    if (!categoryId) {
      return;
    }

    const reviewWeight = Math.max(provider.reviewCount, 1);
    const score = provider.averageRating * reviewWeight;
    providerScoresByCategory.set(
      categoryId,
      (providerScoresByCategory.get(categoryId) ?? 0) + score,
    );
  });

  const topProviderCategoryId = highestScoredKey(providerScoresByCategory);
  if (topProviderCategoryId) {
    addCategoryBadge(badgesByCategory, topProviderCategoryId, {
      label: 'Top Providers',
      tone: 'neutral',
    });
  }

  return badgesByCategory;
}

function addCategoryBadge(
  badgesByCategory: Map<string, CategoryBadge[]>,
  categoryId: string,
  badge: CategoryBadge,
) {
  badgesByCategory.set(categoryId, [
    ...(badgesByCategory.get(categoryId) ?? []),
    badge,
  ]);
}

function highestScoredKey(scores: Map<string, number>): string | null {
  let bestKey: string | null = null;
  let bestScore = 0;

  scores.forEach((score, key) => {
    if (score > bestScore) {
      bestKey = key;
      bestScore = score;
    }
  });

  return bestKey;
}

function completedRebookOptions(bookings: BookingSummary[]): BookingSummary[] {
  const seen = new Set<string>();

  return bookings.filter((booking) => {
    if (booking.status !== 'completed') {
      return false;
    }

    const key = `${booking.serviceId ?? booking.serviceTitle ?? booking.id}:${
      booking.providerId
    }`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
