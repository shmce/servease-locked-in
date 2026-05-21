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

const TOP_RATED_MIN_REVIEWS = 10;
const DEFAULT_PLATFORM_AVERAGE_RATING = 4.5;

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
  sheetCategoryId?: string | null;
  sheetSearchQuery?: string;
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
  sheetCategoryId,
  sheetSearchQuery,
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
    sheetCategoryId,
    sheetSearchQuery,
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
    sheetCategoryId,
    sheetSearchQuery,
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
  sheetCategoryId,
  sheetSearchQuery,
  unreadCount,
}: CustomerExploreViewModelInput) {
  const safeGuideStep = customerGuideStep % guideSteps.length;
  const guideStep = guideSteps[safeGuideStep];
  const popularityScoresByCategory = buildPopularityScoresByCategory(
    categories,
    services,
    providers,
  );
  const ratingScoresByCategory = buildBayesianRatingScoresByCategory(
    categories,
    services,
    providers,
  );
  const popularCategoryId = highestScoredKey(popularityScoresByCategory);
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
    subtitle: category.description ?? 'Tap to browse services',
    title: category.name,
  }));

  const categoryRows = sortCategoryRows(
    baseRows,
    categoryFilter,
    popularityScoresByCategory,
    ratingScoresByCategory,
  );

  // Sheet — services for the tapped category, with search applied
  const sheetCategoryServices = sheetCategoryId
    ? services.filter(s => s.categoryId === sheetCategoryId)
    : [];
  const sheetQuery = (sheetSearchQuery ?? '').trim().toLowerCase();
  const filteredSheetServices = sheetQuery
    ? sheetCategoryServices.filter(s =>
        [s.name, s.description ?? ''].some(v => v.toLowerCase().includes(sheetQuery)),
      )
    : sheetCategoryServices;

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
      serviceRows: services.map((service) => ({
        description: service.description ?? 'Bookable service',
        id: service.id,
        isSelected: service.id === selectedServiceId,
        priceLabel: formatMoney(service.price),
        service,
        title: service.name,
      })),
      providerRows: providers.map((provider) => ({
        id: provider.id,
        isSelected: provider.id === selectedProviderId,
        priceLabel: formatMoney(provider.price),
        provider,
        ratingLabel: provider.averageRating.toFixed(1),
        title: provider.providerBusinessName ?? provider.title,
      })),
      sheetServiceRows: filteredSheetServices.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description ?? 'Bookable service',
        priceLabel: formatMoney(service.price),
        service,
      })),
      sheetTotalServiceCount: sheetCategoryServices.length,
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

function buildPopularityScoresByCategory(
  categories: CatalogCategory[],
  services: CatalogServiceItem[],
  providers: ProviderListing[],
): Map<string, number> {
  const categoryIds = new Set(categories.map((c) => c.id));
  const serviceCategoryById = new Map<string, string>();
  const serviceCounts = buildServiceCountsByCategory(categories, services);
  const providerListingCounts = new Map<string, number>();
  services.forEach((service) => {
    if (!service.categoryId || !categoryIds.has(service.categoryId)) return;
    serviceCategoryById.set(service.id, service.categoryId);
  });

  providers.forEach((provider) => {
    if (!provider.serviceId) return;
    const categoryId = serviceCategoryById.get(provider.serviceId);
    if (!categoryId) return;
    providerListingCounts.set(categoryId, (providerListingCounts.get(categoryId) ?? 0) + 1);
  });

  const scores = new Map<string, number>();
  categories.forEach((category) => {
    const serviceVolume = serviceCounts.get(category.id) ?? 0;
    const providerListingVolume = providerListingCounts.get(category.id) ?? 0;
    scores.set(category.id, Math.log1p(serviceVolume) + Math.log1p(providerListingVolume));
  });
  return scores;
}

function buildBayesianRatingScoresByCategory(
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

  const categoryRatingStats = new Map<string, { totalReviews: number; weightedSum: number }>();
  let platformReviewCount = 0;
  let platformWeightedSum = 0;
  providers.forEach((provider) => {
    if (!provider.serviceId || provider.reviewCount <= 0) return;
    const categoryId = serviceCategoryById.get(provider.serviceId);
    if (!categoryId) return;
    const entry = categoryRatingStats.get(categoryId) ?? {
      totalReviews: 0,
      weightedSum: 0,
    };
    categoryRatingStats.set(categoryId, {
      totalReviews: entry.totalReviews + provider.reviewCount,
      weightedSum: entry.weightedSum + provider.averageRating * provider.reviewCount,
    });
    platformReviewCount += provider.reviewCount;
    platformWeightedSum += provider.averageRating * provider.reviewCount;
  });

  const observedPlatformAverage =
    platformReviewCount > 0
      ? platformWeightedSum / platformReviewCount
      : DEFAULT_PLATFORM_AVERAGE_RATING;
  const platformAverage = Math.min(observedPlatformAverage, DEFAULT_PLATFORM_AVERAGE_RATING);
  const scores = new Map<string, number>();
  categories.forEach((category) => {
    const stats = categoryRatingStats.get(category.id);
    if (!stats || stats.totalReviews <= 0) {
      scores.set(category.id, 0);
      return;
    }
    const averageRating = stats.weightedSum / stats.totalReviews;
    const confidenceWeight = stats.totalReviews / (stats.totalReviews + TOP_RATED_MIN_REVIEWS);
    const priorWeight = TOP_RATED_MIN_REVIEWS / (stats.totalReviews + TOP_RATED_MIN_REVIEWS);
    scores.set(category.id, confidenceWeight * averageRating + priorWeight * platformAverage);
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
