import { useMemo } from 'react';
import { ReviewSummary } from '../../../shared/models/types';

type CustomerBookingReviewPanelViewModelInput = {
  selectedReview: ReviewSummary | null;
  busyAction: string | null;
  rating: string;
};

export function useCustomerBookingReviewPanelViewModel({
  selectedReview,
  busyAction,
  rating,
}: CustomerBookingReviewPanelViewModelInput) {
  return useMemo(
    () =>
      buildCustomerBookingReviewPanelViewModel({
        selectedReview,
        busyAction,
        rating,
      }),
    [busyAction, rating, selectedReview],
  );
}

export function buildCustomerBookingReviewPanelViewModel({
  selectedReview,
  busyAction,
  rating,
}: CustomerBookingReviewPanelViewModelInput) {
  const parsedRating = Number(rating);
  const hasValidRating =
    Number.isInteger(parsedRating) && parsedRating >= 1 && parsedRating <= 5;
  return {
    data: {
      hasExistingReview: Boolean(selectedReview),
      isSubmitDisabled: busyAction === 'review' || !hasValidRating,
      reviewTextLabel: selectedReview?.reviewText ?? 'No review text',
      ratingLabel:
        typeof selectedReview?.rating === 'number'
          ? `${selectedReview.rating}/5 rating`
          : '',
    },
    isLoading: false,
    error: null,
  };
}
