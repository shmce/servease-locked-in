import { useMemo } from 'react';
import {
  BookingStatus,
  BookingSummary,
  CatalogCategory,
  CatalogServiceItem,
  CurrentUserProfile,
  CustomerAddressSummary,
  ProviderListing,
} from '../../../shared/models/types';
import { formatDateTime, formatMoney, statusLabel } from '../../../shared/utils/booking';

export type CategoryFilter = 'all' | 'popular' | 'top-rated';

const TOP_RATED_MIN_REVIEWS = 10;
const DEFAULT_PLATFORM_AVERAGE_RATING = 4.5;
const PRESENT_BOOKING_STATUS_PRIORITY: Partial<Record<BookingStatus, number>> = {
  in_progress: 0,
  confirmed: 1,
  pending: 2,
};

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
  now?: number;
  isProfileLoading?: boolean;
  unreadCount: number;
};

type GuideIconKey = 'search' | 'star' | 'message';
type ReferenceCategoryKey = 'cleaning' | 'repairs' | 'plumbing' | 'electrical' | 'home-care';
type RecommendationImageKey = 'cleaning' | 'repairs' | 'aircon';
type TrustValueIconKey = 'shield' | 'tag' | 'headphones';

type ReferenceCategoryConfig = {
  key: ReferenceCategoryKey;
  label: string;
  keywords: string[];
};

type RecommendationConfig = {
  imageKey: RecommendationImageKey;
  keywords: string[];
  providerLabel: string;
  price: number;
  ratingLabel: string;
  title: string;
};

const REFERENCE_CATEGORY_CONFIGS: ReferenceCategoryConfig[] = [
  { key: 'cleaning', label: 'Cleaning', keywords: ['clean', 'maid', 'housekeep'] },
  { key: 'repairs', label: 'Repairs', keywords: ['repair', 'handyman', 'maintenance', 'fix'] },
  { key: 'plumbing', label: 'Plumbing', keywords: ['plumb', 'pipe', 'faucet', 'water'] },
  { key: 'electrical', label: 'Electrical', keywords: ['electric', 'wiring', 'lighting'] },
  { key: 'home-care', label: 'Home Care', keywords: ['home care', 'care', 'wellness'] },
];

const REFERENCE_RECOMMENDATION_CONFIGS: RecommendationConfig[] = [
  {
    imageKey: 'cleaning',
    keywords: ['home cleaning', 'cleaning', 'deep clean', 'house cleaning'],
    providerLabel: 'Sparkle Cleaners',
    price: 550,
    ratingLabel: '4.8',
    title: 'Home Cleaning',
  },
  {
    imageKey: 'repairs',
    keywords: ['minor repairs', 'repair', 'handyman', 'fixture'],
    providerLabel: 'FixIt Handyman',
    price: 450,
    ratingLabel: '4.9',
    title: 'Minor Repairs',
  },
  {
    imageKey: 'aircon',
    keywords: ['aircon', 'air conditioner', 'ac cleaning', 'cooling'],
    providerLabel: 'CoolPro Services',
    price: 650,
    ratingLabel: '4.7',
    title: 'Aircon Cleaning',
  },
];

const REFERENCE_TRUST_VALUE_ROWS: {
  body: string;
  iconKey: TrustValueIconKey;
  title: string;
}[] = [
  {
    body: 'Background checked',
    iconKey: 'shield',
    title: 'Verified Pros',
  },
  {
    body: 'No hidden fees',
    iconKey: 'tag',
    title: 'Upfront Pricing',
  },
  {
    body: "We're here to help",
    iconKey: 'headphones',
    title: '24/7 Support',
  },
];

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
  now,
  isProfileLoading,
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
    isProfileLoading,
    now,
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
    isProfileLoading,
    now,
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
  isProfileLoading = false,
  now = Date.now(),
  unreadCount,
}: CustomerExploreViewModelInput) {
  const { customerName, locationLabel } = buildCustomerContext({
    isProfileLoading,
    profile,
  });
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
  const presentBooking = selectPresentBooking(bookings, now);
  const compactBookAgainRows = completedRebookOptions(bookings)
    .slice(0, 2)
    .map(compactBookingRow);
  const bookAgainRows = completedRebookOptions(bookings)
    .slice(0, 5)
    .map(bookAgainRow);

  const baseRows = categories.map((category) => ({
    category,
    id: category.id,
    isPopular: category.id === popularCategoryId,
    isSelected: category.id === selectedCategoryId,
    subtitle: displayText(category.description, 'Tap to browse services'),
    title: categoryTitle(category),
  }));

  const categoryRows = sortCategoryRows(
    baseRows,
    categoryFilter,
    popularityScoresByCategory,
    ratingScoresByCategory,
  );
  const quickCategoryRows = categoryRows.slice(0, 4).map((row) => ({
    category: row.category,
    id: row.id,
    isSelected: row.isSelected,
    label: row.title,
  }));

  const popularProviderRows = sortProviderRows(providers)
    .slice(0, 2)
    .map((provider) => ({
      id: provider.id,
      isSelected: provider.id === selectedProviderId,
      isVerified: provider.verificationStatus === 'approved',
      priceLabel: formatMoney(provider.price),
      provider,
      ratingLabel: provider.averageRating.toFixed(1),
      subtitle: displayText(provider.title, 'Service provider'),
      title: providerTitle(provider),
    }));

  const popularServiceRows = services.slice(0, 2).map((service) => ({
    description: displayText(service.description, 'Bookable service'),
    id: service.id,
    isSelected: service.id === selectedServiceId,
    priceLabel: formatMoney(service.price),
    service,
    title: serviceTitle(service),
  }));

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
      compactBookAgainRows,
      customerInitial: customerName.slice(0, 1).toUpperCase(),
      customerName,
      locationLabel,
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
      hasPresentBooking: presentBooking !== null,
      noBooking: {
        body: 'Find a trusted provider when you need help at home.',
        primaryActionLabel: 'Book a service',
        secondaryActionLabel: 'View past bookings',
        title: 'No booking right now',
      },
      notificationAccessibilityLabel:
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : 'Notifications',
      popularProviderRows,
      popularServiceRows,
      recommendedServiceRows: buildRecommendedServiceRows({
        selectedServiceId,
        services,
      }),
      presentBooking: presentBooking
        ? {
            actionLabel: presentBooking.status === 'in_progress' ? 'Track' : 'View',
            booking: presentBooking,
            id: presentBooking.id,
            meta: presentBookingMeta(presentBooking),
            providerLabel:
              optionalDisplayText(presentBooking.providerBusinessName) ??
              presentBooking.bookingReference,
            status: presentBooking.status,
            statusLabel: presentBookingStatusLabel(presentBooking.status),
            title: bookingTitle(presentBooking),
        }
        : null,
      quickCategoryRows,
      referenceCategoryRows: buildReferenceCategoryRows({
        categories,
        selectedCategoryId,
      }),
      referenceTrustRows: REFERENCE_TRUST_VALUE_ROWS,
      upcomingBookingCard: buildUpcomingBookingCard(presentBooking),
      serviceRows: services.map((service) => ({
        description: displayText(service.description, 'Bookable service'),
        id: service.id,
        isSelected: service.id === selectedServiceId,
        priceLabel: formatMoney(service.price),
        service,
        title: serviceTitle(service),
      })),
      providerRows: providers.map((provider) => ({
        id: provider.id,
        isSelected: provider.id === selectedProviderId,
        priceLabel: formatMoney(provider.price),
        provider,
        ratingLabel: provider.averageRating.toFixed(1),
        title: providerTitle(provider),
      })),
      sheetServiceRows: filteredSheetServices.map((service) => ({
        id: service.id,
        name: serviceTitle(service),
        description: displayText(service.description, 'Bookable service'),
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

function buildReferenceCategoryRows({
  categories,
  selectedCategoryId,
}: {
  categories: CatalogCategory[];
  selectedCategoryId: string | null;
}) {
  const usedCategoryIds = new Set<string>();

  return REFERENCE_CATEGORY_CONFIGS.map((config) => {
    const category = findMatchingCategory(categories, config, usedCategoryIds);
    if (category) {
      usedCategoryIds.add(category.id);
    }

    return {
      category,
      iconKey: config.key,
      id: category?.id ?? config.key,
      isAvailable: Boolean(category),
      isSelected: category?.id === selectedCategoryId,
      label: config.label,
    };
  });
}

function buildRecommendedServiceRows({
  selectedServiceId,
  services,
}: {
  selectedServiceId: string | null;
  services: CatalogServiceItem[];
}) {
  const usedServiceIds = new Set<string>();

  return REFERENCE_RECOMMENDATION_CONFIGS.map((config) => {
    const service = findMatchingService(services, config.keywords, usedServiceIds);
    if (service) {
      usedServiceIds.add(service.id);
    }
    return {
      id: service?.id ?? config.imageKey,
      imageKey: config.imageKey,
      isSelected: service?.id === selectedServiceId,
      pillLabel: 'Verified - Fast response',
      priceLabel: formatPesoShort(config.price),
      providerLabel: config.providerLabel,
      ratingLabel: config.ratingLabel,
      service,
      title: config.title,
    };
  });
}

function buildUpcomingBookingCard(booking: BookingSummary | null) {
  if (!booking) {
    return {
      booking: null,
      meta: 'Find trusted help at home',
      statusLabel: 'Ready to book',
      title: 'Book a service',
    };
  }

  return {
    booking,
    meta: formatReferenceDateTime(booking.scheduledAt),
    statusLabel: 'Upcoming booking',
    title: bookingTitle(booking),
  };
}

function findMatchingCategory(
  categories: CatalogCategory[],
  config: ReferenceCategoryConfig,
  usedCategoryIds: Set<string>,
): CatalogCategory | null {
  const candidates = categories
    .filter((category) => !usedCategoryIds.has(category.id))
    .map((category) => ({
      category,
      score: categoryMatchScore(categorySearchText(category), config),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.category.id.localeCompare(b.category.id));

  return candidates[0]?.category ?? null;
}

function findMatchingService(
  services: CatalogServiceItem[],
  keywords: string[],
  usedServiceIds: Set<string>,
): CatalogServiceItem | null {
  return services.find((service) => {
    if (usedServiceIds.has(service.id)) {
      return false;
    }

    return keywords.some((keyword) => textMatchesKeyword(serviceSearchText(service), keyword));
  }) ?? null;
}

function categorySearchText(category: CatalogCategory): string {
  return [category.name, category.description].filter(Boolean).join(' ').toLowerCase();
}

function serviceSearchText(service: CatalogServiceItem): string {
  return [service.name, service.description].filter(Boolean).join(' ').toLowerCase();
}

function textMatchesKeyword(value: string, keyword: string): boolean {
  return value.includes(keyword.toLowerCase());
}

function categoryMatchScore(value: string, config: ReferenceCategoryConfig): number {
  if (config.key === 'repairs' && concreteCategoryMentioned(value)) {
    return 0;
  }

  const label = config.label.toLowerCase();
  const labelScore = value.includes(label) ? 4 : 0;
  const keywordScore = config.keywords.reduce(
    (score, keyword) => score + Number(textMatchesKeyword(value, keyword)),
    0,
  );

  return labelScore + keywordScore;
}

function concreteCategoryMentioned(value: string): boolean {
  return ['cleaning', 'plumbing', 'electrical', 'home care'].some((label) =>
    value.includes(label),
  );
}

function formatPesoShort(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return '\u20b10';
  }

  return `\u20b1${value.toLocaleString('en-PH')}`;
}

function formatReferenceDateTime(value: string | null): string {
  if (!value) {
    return 'Schedule pending';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Schedule pending';
  }

  const dateLabel = date.toLocaleDateString('en-PH', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Manila',
    year: 'numeric',
  });
  const timeLabel = date.toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Manila',
  });

  return `${dateLabel} - ${timeLabel}`;
}

function selectPresentBooking(bookings: BookingSummary[], now: number): BookingSummary | null {
  const presentBookings = bookings.filter((booking) => isPresentBooking(booking, now));

  if (presentBookings.length === 0) {
    return null;
  }

  return [...presentBookings].sort((a, b) => {
    const priorityDelta =
      (PRESENT_BOOKING_STATUS_PRIORITY[a.status] ?? 99) -
      (PRESENT_BOOKING_STATUS_PRIORITY[b.status] ?? 99);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    const aTime = Date.parse(a.scheduledAt);
    const bTime = Date.parse(b.scheduledAt);
    const timeDelta = safeSortTime(aTime) - safeSortTime(bTime);
    if (timeDelta !== 0) {
      return timeDelta;
    }

    return a.id.localeCompare(b.id);
  })[0];
}

function isPresentBooking(booking: BookingSummary, now: number): boolean {
  if (booking.status === 'in_progress') {
    return true;
  }

  if (booking.status !== 'confirmed' && booking.status !== 'pending') {
    return false;
  }

  const scheduledAt = Date.parse(booking.scheduledAt);
  return !Number.isNaN(scheduledAt) && scheduledAt >= now;
}

function safeSortTime(value: number): number {
  return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value;
}

function presentBookingStatusLabel(status: BookingStatus): string {
  if (status === 'in_progress') {
    return 'On the way';
  }
  if (status === 'confirmed') {
    return 'Scheduled';
  }
  if (status === 'pending') {
    return 'Pending';
  }
  return statusLabel(status);
}

function presentBookingMeta(booking: BookingSummary): string {
  if (booking.status === 'in_progress') {
    return 'Track live status';
  }
  if (booking.status === 'pending') {
    return 'Waiting for provider confirmation';
  }
  return formatDateTime(booking.scheduledAt);
}

function compactBookingRow(booking: BookingSummary) {
  const title = bookingTitle(booking);

  return {
    booking,
    id: booking.id,
    initial: title.slice(0, 1),
    meta: optionalDisplayText(booking.providerBusinessName) ?? formatDateTime(booking.scheduledAt),
    title,
  };
}

function bookAgainRow(booking: BookingSummary) {
  const title = bookingTitle(booking);

  return {
    booking,
    id: booking.id,
    initial: title.slice(0, 1),
    subtitle: optionalDisplayText(booking.providerBusinessName) ?? formatDateTime(booking.scheduledAt),
    title,
  };
}

function bookingTitle(booking: BookingSummary): string {
  return displayText(booking.serviceTitle, 'Service booking');
}

function serviceTitle(service: CatalogServiceItem): string {
  return displayText(service.name, 'Service');
}

function providerTitle(provider: ProviderListing): string {
  return optionalDisplayText(provider.providerBusinessName) ??
    displayText(provider.title, 'Service provider');
}

function categoryTitle(category: CatalogCategory): string {
  const cleanedName = optionalDisplayText(category.name);
  if (cleanedName) {
    return cleanedName;
  }

  const fallback = optionalDisplayText(category.description);
  if (fallback) {
    return fallback;
  }

  return 'Home Care';
}

function buildCustomerContext({
  isProfileLoading,
  profile,
}: {
  isProfileLoading: boolean;
  profile: CurrentUserProfile | null;
}): {
  customerName: string;
  locationLabel: string;
} {
  if (isProfileLoading) {
    return {
      customerName: 'You',
      locationLabel: 'Loading location...',
    };
  }

  const customerName = optionalDisplayText(profile?.user.fullName) ?? 'You';
  const defaultAddress = selectDefaultAddress(profile?.customerAddresses ?? []);

  return {
    customerName,
    locationLabel: formatAddressLabel(defaultAddress),
  };
}

function selectDefaultAddress(
  addresses: CustomerAddressSummary[],
): CustomerAddressSummary | null {
  return addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
}

function formatAddressLabel(address: CustomerAddressSummary | null): string {
  if (!address) {
    return 'Home location';
  }

  const label = optionalDisplayText(address.label);
  const city = optionalDisplayText(address.city);
  const barangay = optionalDisplayText(address.barangay);

  if (label && city) {
    return `${label} - ${city}`;
  }

  if (label) {
    return label;
  }

  if (city) {
    return city;
  }

  if (barangay) {
    return barangay;
  }

  return optionalDisplayText(address.address) ?? 'Home location';
}

function displayText(value: string | null | undefined, fallback: string | null): string {
  const cleaned = cleanDisplayText(value);
  return cleaned || fallback || '';
}

function optionalDisplayText(value: string | null | undefined): string | null {
  return cleanDisplayText(value) || null;
}

function cleanDisplayText(value: string | null | undefined): string {
  const raw = value?.trim();
  if (!raw) {
    return '';
  }

  const withoutSeedPrefix = raw
    .replace(/\[[^\]]*(?:lkr|seed)[^\]]*\]\s*/gi, '')
    .replace(/\blkr[_-]?seed[_-]?\d{4}[_-]?\d{2}[_-]?\d{2}\b/gi, '')
    .replace(/\bseed[_-]?\d{4}[_-]?\d{2}[_-]?\d{2}\b/gi, '');
  const normalized = withoutSeedPrefix
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized || /^[\W\d]+$/.test(normalized)) {
    return '';
  }

  return titleCase(normalized);
}

function titleCase(value: string): string {
  return value.replace(/\w\S*/g, (word) => {
    if (/^[A-Z]{2,}$/.test(word) || /[a-z][A-Z]/.test(word)) {
      return word;
    }

    return `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`;
  });
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

function sortProviderRows(providers: ProviderListing[]): ProviderListing[] {
  return [...providers].sort((a, b) => {
    const verificationDelta =
      Number(b.verificationStatus === 'approved') - Number(a.verificationStatus === 'approved');
    if (verificationDelta !== 0) {
      return verificationDelta;
    }

    const ratingDelta = b.averageRating - a.averageRating;
    if (ratingDelta !== 0) {
      return ratingDelta;
    }

    const reviewDelta = b.reviewCount - a.reviewCount;
    if (reviewDelta !== 0) {
      return reviewDelta;
    }

    return a.id.localeCompare(b.id);
  });
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
