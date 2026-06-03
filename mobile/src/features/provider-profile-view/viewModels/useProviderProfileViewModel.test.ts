import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CurrentUserProfile,
  ReviewSummary,
} from '../../../shared/models/types';
import { buildProviderProfileViewModel } from './useProviderProfileViewModel';

describe('buildProviderProfileViewModel', () => {
  it('shows three review preview cards when more reviews exist', () => {
    const viewModel = buildProviderProfileViewModel({
      profile: profile(),
      providerPortfolioMedia: [],
      ownReviews: Array.from({ length: 5 }, (_, index) => review(`review-${index + 1}`)),
    });

    assert.deepEqual(
      viewModel.data.reviewCards.map((row) => row.id),
      ['review-1', 'review-2', 'review-3'],
    );
    assert.equal(viewModel.data.hasMoreReviews, true);
  });

  it('does not show view-all state for three or fewer reviews', () => {
    const viewModel = buildProviderProfileViewModel({
      profile: profile(),
      providerPortfolioMedia: [],
      ownReviews: Array.from({ length: 3 }, (_, index) => review(`review-${index + 1}`)),
    });

    assert.equal(viewModel.data.reviewCards.length, 3);
    assert.equal(viewModel.data.hasMoreReviews, false);
  });
});

function profile(): CurrentUserProfile {
  return {
    user: {
      id: 'user-1',
      email: 'provider@example.com',
      fullName: 'Casey Provider',
      contactNumber: null,
      role: 'provider',
      status: 'active',
    },
    customerProfile: null,
    customerAddresses: [],
    providerProfile: {
      id: 'provider-profile-1',
      businessName: 'Sparkle Cleaners',
      verificationStatus: 'approved',
      averageRating: 4.8,
      reviewCount: 5,
    },
  };
}

function review(id: string): ReviewSummary {
  return {
    id,
    bookingId: `booking-${id}`,
    providerId: 'provider-1',
    reviewerId: `customer-${id}`,
    reviewerFullName: 'Customer',
    rating: 5,
    reviewText: 'Great service.',
    isFlagged: false,
    createdAt: null,
  };
}
