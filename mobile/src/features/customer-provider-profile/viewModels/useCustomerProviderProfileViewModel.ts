import { useMemo } from 'react';
import { dayLabels, providerProfileTabs } from '../../../constants/appContent';
import { formatMoney } from '../../../shared/utils/booking';
import {
  CatalogServiceItem,
  ProviderAvailabilitySchedule,
  ProviderListing,
  ProviderPortfolioMediaSummary,
  ReviewSummary,
} from '../../../shared/models/types';

export type CustomerProviderProfileTab = (typeof providerProfileTabs)[number];

type CustomerProviderProfileViewModelInput = {
  provider: ProviderListing;
  availability: ProviderAvailabilitySchedule | null;
  portfolioMedia: ProviderPortfolioMediaSummary[];
  reviews: ReviewSummary[];
  selectedTab: CustomerProviderProfileTab;
  isAuthenticated: boolean;
  busyAction: string | null;
};

export function useCustomerProviderProfileViewModel({
  provider,
  availability,
  portfolioMedia,
  reviews,
  selectedTab,
  isAuthenticated,
  busyAction,
}: CustomerProviderProfileViewModelInput) {
  return useMemo(
    () =>
      buildCustomerProviderProfileViewModel({
        provider,
        availability,
        portfolioMedia,
        reviews,
        selectedTab,
        isAuthenticated,
        busyAction,
      }),
    [
      availability,
      busyAction,
      isAuthenticated,
      portfolioMedia,
      provider,
      reviews,
      selectedTab,
    ],
  );
}

export function buildCustomerProviderProfileViewModel({
  provider,
  availability,
  portfolioMedia,
  reviews,
  selectedTab,
  isAuthenticated,
  busyAction,
}: CustomerProviderProfileViewModelInput) {
  const displayName = provider.providerBusinessName ?? provider.title;
  const activeAvailabilityWindows =
    availability?.windows
      .filter((window) => window.isActive)
      .map((window) => ({
        id: window.id,
        label: dayLabels[window.dayOfWeek],
        value: `${window.startTime} - ${window.endTime}`,
      })) ?? [];
  const daysOff =
    availability?.daysOff.map((dayOff) => ({
      id: dayOff.id,
      label: dayOff.offDate,
      value: dayOff.reason ?? 'Unavailable',
    })) ?? [];
  const serviceItem: CatalogServiceItem = {
    id: provider.serviceId ?? provider.id,
    categoryId: null,
    name: provider.title,
    description: provider.description,
    price: provider.price,
    pricingMode: provider.pricingMode,
  };
  const reviewCards = reviews.slice(0, 5).map((review) => ({
    id: review.id,
    ratingLabel: review.rating.toFixed(1),
    reviewText: review.reviewText ?? 'No review text provided.',
    canFlag: isAuthenticated,
    flagLabel: busyAction === `flag-review-${review.id}` ? 'Flagging...' : 'Flag',
  }));
  const verificationTone: 'success' | 'warning' =
    provider.verificationStatus === 'approved' ? 'success' : 'warning';

  return {
    data: {
      activeTab: selectedTab,
      tabs: providerProfileTabs,
      displayName,
      avatarInitial: displayName.slice(0, 1),
      verificationStatus: provider.verificationStatus,
      verificationTone,
      ratingLabel: provider.averageRating.toFixed(1),
      reviewCountLabel: provider.reviewCount,
      servicePriceLabel: formatMoney(provider.price),
      serviceItem,
      description:
        provider.description ??
        'Professional service provider available through ServEase.',
      aboutRows: [
        {
          key: 'service',
          label: 'Service',
          value: provider.title,
        },
        {
          key: 'pricing',
          label: 'Pricing',
          value: formatMoney(provider.price),
        },
        {
          key: 'verification',
          label: 'Verification',
          value: provider.verificationStatus,
        },
      ],
      activeAvailabilityWindows,
      daysOff,
      portfolioItems: portfolioMedia.map((item) => ({
        id: item.id,
        fileUrl: item.fileUrl,
        caption: item.caption,
      })),
      reviewCards,
      hasPortfolioItems: portfolioMedia.length > 0,
      hasReviews: reviews.length > 0,
      hasActiveAvailabilityWindows: activeAvailabilityWindows.length > 0,
      hasDaysOff: daysOff.length > 0,
    },
    isLoading: false,
    error: null,
  };
}
