import { Injectable, Optional } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { ReviewNotFoundError } from './review.errors';
import { CreateReviewInput, ReviewSummary } from './review.types';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<string, string | number | null>,
  ): PromiseLike<{
    data: ReviewRow[] | null;
    error: { message: string; code?: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data: ReviewRow | null;
      error: { message: string; code?: string } | null;
    }>;
  };
}

interface ReviewRow {
  id: string;
  booking_id: string;
  provider_id: string;
  reviewer_id: string;
  rating: number;
  review_text: string | null;
  is_flagged: boolean | null;
  created_at: string | null;
}

@Injectable()
export class SupabaseReviewRepository {
  private readonly client: SupabaseRpcClient;

  constructor(@Optional() client?: SupabaseRpcClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  async createReview(input: CreateReviewInput): Promise<ReviewSummary> {
    const { data, error } = await this.client
      .rpc('servease_create_review', {
        p_booking_id: input.bookingId,
        p_provider_id: input.providerId,
        p_reviewer_id: input.reviewerId,
        p_rating: input.rating,
        p_review_text: input.reviewText ?? null,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to create review: ${error.message}`);
    }

    if (!data) {
      throw new ReviewNotFoundError();
    }

    return this.mapReview(data);
  }

  async listProviderReviews(providerId: string): Promise<ReviewSummary[]> {
    const { data, error } = await this.client.rpc('servease_list_provider_reviews', {
      p_provider_id: providerId,
    });

    if (error) {
      throw new Error(`Failed to list reviews: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapReview(row));
  }

  private mapReview(row: ReviewRow): ReviewSummary {
    return {
      id: row.id,
      bookingId: row.booking_id,
      providerId: row.provider_id,
      reviewerId: row.reviewer_id,
      rating: row.rating,
      reviewText: row.review_text,
      isFlagged: row.is_flagged ?? false,
      createdAt: row.created_at,
    };
  }
}
