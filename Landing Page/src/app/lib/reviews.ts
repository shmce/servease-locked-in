export interface ReviewSummary {
  id: string;
  bookingId: string;
  providerId: string;
  reviewerId: string;
  rating: number;
  reviewText: string | null;
  isFlagged: boolean;
  createdAt: string | null;
}
