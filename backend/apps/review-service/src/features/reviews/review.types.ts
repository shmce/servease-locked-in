export interface ReviewSummary {
  id: string;
  bookingId: string;
  providerId: string;
  reviewerId: string;
  reviewerFullName: string | null;
  rating: number;
  reviewText: string | null;
  isFlagged: boolean;
  createdAt: string | null;
}

export interface ReviewResponseSummary {
  id: string;
  reviewId: string;
  responderId: string;
  responseText: string;
  createdAt: string | null;
}

export interface CreateReviewInput {
  bookingId: string;
  providerId: string;
  reviewerId: string;
  rating: number;
  reviewText?: string | null;
}

export interface CreateReviewResponseInput {
  reviewId: string;
  providerId: string;
  responseText: string;
}

export interface FlagReviewInput {
  reviewId: string;
  reporterId: string;
  reason: string;
}

export interface ListAdminReviewsFilters {
  providerId?: string | null;
  flaggedOnly?: boolean;
  limit?: number;
}

export interface SetReviewFlaggedInput {
  reviewId: string;
  isFlagged: boolean;
  reason?: string | null;
  adminId?: string | null;
}
