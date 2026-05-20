import { useMemo } from 'react';
import { ReviewSummary } from '../../../shared/models/types';

type CustomerBookingReviewPanelViewModelInput = {
  selectedReview: ReviewSummary | null;
  busyAction: string | null;
};

export function useCustomerBookingReviewPanelViewModel({
  selectedReview,
  busyAction,
}: CustomerBookingReviewPanelViewModelInput) {
  return useMemo(
    () =>
      buildCustomerBookingReviewPanelViewModel({
        selectedReview,
        busyAction,
      }),
    [busyAction, selectedReview],
  );
}

export function buildCustomerBookingReviewPanelViewModel({
  selectedReview,
  busyAction,
}: CustomerBookingReviewPanelViewModelInput) {
  return {
    data: {
      hasExistingReview: Boolean(selectedReview),
      isSubmitDisabled: busyAction === 'review',
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
