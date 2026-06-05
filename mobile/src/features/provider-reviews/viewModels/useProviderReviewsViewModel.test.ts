import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ReviewSummary } from '../../../shared/models/types';
import { buildProviderReviewsViewModel } from './useProviderReviewsViewModel';

describe('buildProviderReviewsViewModel', () => {
  it('shows seven reviews per page', () => {
    const firstPage = buildProviderReviewsViewModel({
      busyAction: null,
      ownReviews: Array.from({ length: 9 }, (_, index) => review(`review-${index + 1}`)),
      page: 1,
      replyingToReviewId: null,
    });
    const secondPage = buildProviderReviewsViewModel({
      busyAction: null,
      ownReviews: Array.from({ length: 9 }, (_, index) => review(`review-${index + 1}`)),
      page: 2,
      replyingToReviewId: null,
    });

    assert.deepEqual(
      firstPage.data.reviewCards.map((row) => row.id),
      [
        'review-1',
        'review-2',
        'review-3',
        'review-4',
        'review-5',
        'review-6',
        'review-7',
      ],
    );
    assert.deepEqual(
      secondPage.data.reviewCards.map((row) => row.id),
      ['review-8', 'review-9'],
    );
    assert.equal(firstPage.data.pagination.pageLabel, 'Page 1 of 2');
    assert.equal(firstPage.data.pagination.hasNextPage, true);
    assert.equal(secondPage.data.pagination.hasPreviousPage, true);
  });

  it('marks the active reply row and sending label', () => {
    const viewModel = buildProviderReviewsViewModel({
      busyAction: 'review-reply',
      ownReviews: [review('review-1'), review('review-2')],
      replyingToReviewId: 'review-2',
    });

    assert.equal(viewModel.data.reviewCards[0]?.isReplying, false);
    assert.equal(viewModel.data.reviewCards[1]?.isReplying, true);
    assert.equal(viewModel.data.reviewCards[1]?.replyButtonLabel, 'Sending...');
  });

  it('resets review pagination when review count changes', () => {
    const source = readFileSync(
      join(
        process.cwd(),
        'src/features/provider-reviews/viewModels/useProviderReviewsViewModel.ts',
      ),
      'utf8',
    );

    assert.match(source, /setCurrentPage\(1\);/);
    assert.match(source, /\[ownReviews\.length\]/);
  });
});

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
