import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ReviewSummary } from '../../../shared/models/types';

type ProviderReviewsViewModelInput = {
  ownReviews: ReviewSummary[];
  replyingToReviewId: string | null;
  busyAction: string | null;
  page?: number;
};

const reviewsPageSize = 7;

export function useProviderReviewsViewModel({
  ownReviews,
  replyingToReviewId,
  busyAction,
}: ProviderReviewsViewModelInput) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [ownReviews.length]);

  const viewModel = useMemo(
    () =>
      buildProviderReviewsViewModel({
        busyAction,
        ownReviews,
        page: currentPage,
        replyingToReviewId,
      }),
    [busyAction, currentPage, ownReviews, replyingToReviewId],
  );

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((page) => Math.max(1, page - 1));
  }, []);

  const goToNextPage = useCallback(
    () => {
      setCurrentPage((page) => Math.min(viewModel.data.pagination.totalPages, page + 1));
    },
    [viewModel.data.pagination.totalPages],
  );

  return {
    ...viewModel,
    actions: {
      goToNextPage,
      goToPreviousPage,
    },
  };
}

export function buildProviderReviewsViewModel({
  ownReviews,
  replyingToReviewId,
  busyAction,
  page = 1,
}: ProviderReviewsViewModelInput) {
  const pagination = buildPagination(ownReviews.length, page, reviewsPageSize);
  const pageReviews = ownReviews.slice(pagination.startIndex, pagination.endIndex);

  return {
    data: {
      hasReviews: ownReviews.length > 0,
      pagination: {
        currentPage: pagination.currentPage,
        hasNextPage: pagination.currentPage < pagination.totalPages,
        hasPreviousPage: pagination.currentPage > 1,
        pageLabel:
          pagination.totalItems > 0
            ? `Page ${pagination.currentPage} of ${pagination.totalPages}`
            : 'No reviews',
        totalItems: pagination.totalItems,
        totalPages: pagination.totalPages,
      },
      reviewCards: pageReviews.map((review) => ({
        id: review.id,
        isReplying: replyingToReviewId === review.id,
        ratingLabel: review.rating.toFixed(1),
        replyButtonLabel:
          busyAction === 'review-reply' && replyingToReviewId === review.id
            ? 'Sending...'
            : 'Submit Reply',
        reviewerName: review.reviewerFullName ?? 'Customer',
        reviewText: review.reviewText ?? 'No review text.',
      })),
    },
    isLoading: false,
    error: null,
  };
}

function buildPagination(totalItems: number, requestedPage: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, Math.trunc(requestedPage) || 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    currentPage,
    endIndex: startIndex + pageSize,
    startIndex,
    totalItems,
    totalPages,
  };
}
