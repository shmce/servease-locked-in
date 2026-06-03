import { useMemo } from 'react';
import {
  CurrentUserProfile,
  ProviderPortfolioMediaSummary,
  ReviewSummary,
} from '../../../shared/models/types';

type ProviderProfileViewModelInput = {
  profile: CurrentUserProfile | null;
  providerPortfolioMedia: ProviderPortfolioMediaSummary[];
  ownReviews: ReviewSummary[];
};

const reviewPreviewLimit = 3;

export function useProviderProfileViewModel({
  profile,
  providerPortfolioMedia,
  ownReviews,
}: ProviderProfileViewModelInput) {
  return useMemo(
    () =>
      buildProviderProfileViewModel({
        profile,
        providerPortfolioMedia,
        ownReviews,
      }),
    [ownReviews, profile, providerPortfolioMedia],
  );
}

export function buildProviderProfileViewModel({
  profile,
  providerPortfolioMedia,
  ownReviews,
}: ProviderProfileViewModelInput) {
  const businessDisplayName =
    profile?.providerProfile?.businessName ??
    profile?.user.fullName ??
    'Service Provider';
  const avatarInitial = businessDisplayName.slice(0, 1).toUpperCase();
  const verificationStatus = profile?.providerProfile?.verificationStatus ?? 'pending';
  const ratingLabel = (profile?.providerProfile?.averageRating ?? 0).toFixed(1);
  const reviewCount = profile?.providerProfile?.reviewCount ?? 0;
  const profileSummary = `${verificationStatus} · ${ratingLabel} rating · ${reviewCount} reviews`;
  const portfolioPreview = providerPortfolioMedia.slice(0, 4);
  const reviewCards = ownReviews.slice(0, reviewPreviewLimit).map((review) => ({
    id: review.id,
    ratingLabel: review.rating.toFixed(1),
    reviewerName: review.reviewerFullName ?? 'Customer',
    reviewText: review.reviewText ?? 'No review text.',
  }));

  return {
    data: {
      businessDisplayName,
      avatarInitial,
      profileSummary,
      accountRows: [
        {
          key: 'name',
          label: 'Name',
          value: profile?.user.fullName ?? 'N/A',
        },
        {
          key: 'email',
          label: 'Email',
          value: profile?.user.email ?? 'N/A',
        },
        {
          key: 'phone',
          label: 'Phone',
          value: profile?.user.contactNumber ?? 'N/A',
        },
      ],
      portfolioPreview,
      reviewCards,
      hasMoreReviews: ownReviews.length > reviewPreviewLimit,
      hasPortfolioMedia: providerPortfolioMedia.length > 0,
      hasReviews: ownReviews.length > 0,
    },
    isLoading: false,
    error: null,
  };
}
