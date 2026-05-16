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

export interface CreateReviewRequest {
  bookingId: string;
  providerId: string;
  reviewerId: string;
  rating: number;
  reviewText?: string | null;
}
