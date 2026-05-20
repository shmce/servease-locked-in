import { useMemo } from 'react';
import {
  BookingSummary,
  CatalogCategory,
  CatalogServiceItem,
  CurrentUserProfile,
  ProviderListing,
} from '../../../shared/models/types';
import { formatDateTime, formatMoney } from '../../../shared/utils/booking';

export type CategoryFilter = 'all' | 'popular' | 'top-rated';

type CustomerExploreViewModelInput = {
  bookings: BookingSummary[];
  categories: CatalogCategory[];
  categoryFilter?: CategoryFilter;
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
  categoryFilter,
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
    categoryFilter,
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
    categoryFilter,
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
  categoryFilter = 'all',
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
  const serviceCountsByCategory = buildServiceCountsByCategory(categories, services);
  const providerScoresByCategory = buildProviderScoresByCategory(categories, services, providers);
  const popularCategoryId = highestScoredKey(serviceCountsByCategory);
  const bookAgainRows = completedRebookOptions(bookings)
    .slice(0, 5)
    .map((booking) => ({
      booking,
      id: booking.id,
      initial: (booking.serviceTitle ?? 'S').slice(0, 1),
      subtitle: booking.providerBusinessName ?? formatDateTime(booking.scheduledAt),
      title: booking.serviceTitle ?? 'Service booking',
    }));

  const baseRows = categories.map((category) => ({
    category,
    id: category.id,
    isPopular: category.id === popularCategoryId,
    isSelected: category.id === selectedCategoryId,
    subtitle: category.description ?? 'Tap to view services',
    title: category.name,
  }));

  const categoryRows = sortCategoryRows(
    baseRows,
    categoryFilter,
    serviceCountsByCategory,
    providerScoresByCategory,
  );

  return {
    data: {
      bookAgainRows,
      categoryRows,
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

function buildServiceCountsByCategory(
  categories: CatalogCategory[],
  services: CatalogServiceItem[],
): Map<string, number> {
  const categoryIds = new Set(categories.map((c) => c.id));
  const counts = new Map<string, number>();
  services.forEach((service) => {
    if (!service.categoryId || !categoryIds.has(service.categoryId)) return;
    counts.set(service.categoryId, (counts.get(service.categoryId) ?? 0) + 1);
  });
  return counts;
}

function buildProviderScoresByCategory(
  categories: CatalogCategory[],
  services: CatalogServiceItem[],
  providers: ProviderListing[],
): Map<string, number> {
  const categoryIds = new Set(categories.map((c) => c.id));
  const serviceCategoryById = new Map<string, string>();
  services.forEach((service) => {
    if (!service.categoryId || !categoryIds.has(service.categoryId)) return;
    serviceCategoryById.set(service.id, service.categoryId);
  });
  const scores = new Map<string, number>();
  providers.forEach((provider) => {
    if (!provider.serviceId) return;
    const categoryId = serviceCategoryById.get(provider.serviceId);
    if (!categoryId) return;
    const score = provider.averageRating * Math.max(provider.reviewCount, 1);
    scores.set(categoryId, (scores.get(categoryId) ?? 0) + score);
  });
  return scores;
}

function sortCategoryRows<T extends { id: string }>(
  rows: T[],
  filter: CategoryFilter,
  serviceCountsByCategory: Map<string, number>,
  providerScoresByCategory: Map<string, number>,
): T[] {
  if (filter === 'popular') {
    return [...rows].sort(
      (a, b) =>
        (serviceCountsByCategory.get(b.id) ?? 0) - (serviceCountsByCategory.get(a.id) ?? 0),
    );
  }
  if (filter === 'top-rated') {
    return [...rows].sort(
      (a, b) =>
        (providerScoresByCategory.get(b.id) ?? 0) - (providerScoresByCategory.get(a.id) ?? 0),
    );
  }
  return rows;
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
    if (booking.status !== 'completed') return false;
    const key = `${booking.serviceId ?? booking.serviceTitle ?? booking.id}:${booking.providerId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
