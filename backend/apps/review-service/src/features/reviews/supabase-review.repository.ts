import { Injectable, Optional } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { ReviewNotFoundError } from './review.errors';
import {
  CreateReviewInput,
  CreateReviewResponseInput,
  FlagReviewInput,
  ListAdminReviewsFilters,
  ReviewResponseSummary,
  ReviewSummary,
  SetReviewFlaggedInput,
} from './review.types';

type SupabaseTableResult = {
  data: ReviewRow[] | null;
  error: { message: string; code?: string } | null;
};

type SupabaseSingleResult = {
  data: ReviewRow | null;
  error: { message: string; code?: string } | null;
};

interface SupabaseTableBuilder {
  select(columns: string): SupabaseTableBuilder;
  eq(column: string, value: string | boolean): SupabaseTableBuilder;
  order(
    column: string,
    options?: { ascending?: boolean; nullsFirst?: boolean },
  ): SupabaseTableBuilder;
  limit(count: number): SupabaseTableBuilder;
  update(values: Record<string, unknown>): SupabaseTableBuilder;
  single(): PromiseLike<SupabaseSingleResult>;
  then<TFulfilled>(
    onFulfilled: (result: SupabaseTableResult) => TFulfilled,
  ): PromiseLike<TFulfilled>;
}

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<string, string | number | null>,
  ): PromiseLike<{
    data: ReviewRow[] | ReviewResponseRow[] | null;
    error: { message: string; code?: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data: ReviewRow | ReviewResponseRow | null;
      error: { message: string; code?: string } | null;
    }>;
  };
  schema?(name: string): { from(table: string): SupabaseTableBuilder };
  from?(table: string): SupabaseTableBuilder;
}

interface ReviewRow {
  id: string;
  booking_id: string;
  provider_id: string;
  reviewer_id: string;
  reviewer_full_name: string | null;
  rating: number;
  review_text: string | null;
  is_flagged: boolean | null;
  created_at: string | null;
}

interface ReviewResponseRow {
  id: string;
  review_id: string;
  responder_id: string;
  response_text: string;
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

    return this.mapReview(data as ReviewRow);
  }

  async listProviderReviews(providerId: string): Promise<ReviewSummary[]> {
    const { data, error } = await this.client.rpc('servease_list_provider_reviews', {
      p_provider_id: providerId,
    });

    if (error) {
      throw new Error(`Failed to list reviews: ${error.message}`);
    }

    return ((data ?? []) as ReviewRow[]).map((row) => this.mapReview(row));
  }

  async createReviewResponse(
    input: CreateReviewResponseInput,
  ): Promise<ReviewResponseSummary> {
    const { data, error } = await this.client
      .rpc('servease_create_review_response', {
        p_review_id: input.reviewId,
        p_provider_id: input.providerId,
        p_response_text: input.responseText,
      })
      .maybeSingle();

    if (error) {
      if (error.code === 'P0002') {
        throw new ReviewNotFoundError();
      }
      throw new Error(`Failed to create review response: ${error.message}`);
    }

    if (!data) {
      throw new ReviewNotFoundError();
    }

    return this.mapReviewResponse(data as ReviewResponseRow);
  }

  async flagReview(input: FlagReviewInput): Promise<ReviewSummary> {
    const { data, error } = await this.client
      .rpc('servease_flag_review', {
        p_review_id: input.reviewId,
        p_reporter_id: input.reporterId,
        p_reason: input.reason,
      })
      .maybeSingle();

    if (error) {
      if (error.code === 'P0002') {
        throw new ReviewNotFoundError();
      }
      throw new Error(`Failed to flag review: ${error.message}`);
    }

    if (!data) {
      throw new ReviewNotFoundError();
    }

    return this.mapReview(data as ReviewRow);
  }

  async listForAdmin(filters: ListAdminReviewsFilters): Promise<ReviewSummary[]> {
    const table = this.adminTable();
    let query = table
      .select(
        'id, booking_id, provider_id, reviewer_id, reviewer_full_name, rating, review_text, is_flagged, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(filters.limit ?? 100);

    if (filters.flaggedOnly) {
      query = query.eq('is_flagged', true);
    }
    if (filters.providerId) {
      query = query.eq('provider_id', filters.providerId);
    }

    const result = await (query as unknown as PromiseLike<SupabaseTableResult>);
    if (result.error) {
      throw new Error(`Failed to list reviews for admin: ${result.error.message}`);
    }

    return ((result.data ?? []) as ReviewRow[]).map((row) => this.mapReview(row));
  }

  async setFlagged(input: SetReviewFlaggedInput): Promise<ReviewSummary> {
    const result = await this.adminTable()
      .update({ is_flagged: input.isFlagged })
      .eq('id', input.reviewId)
      .select(
        'id, booking_id, provider_id, reviewer_id, reviewer_full_name, rating, review_text, is_flagged, created_at',
      )
      .single();

    if (result.error) {
      throw new Error(`Failed to update review flag: ${result.error.message}`);
    }

    if (!result.data) {
      throw new ReviewNotFoundError();
    }

    return this.mapReview(result.data);
  }

  private adminTable(): SupabaseTableBuilder {
    const schema = this.client.schema?.('trust_and_reputation');
    if (schema) {
      return schema.from('reviews');
    }
    if (this.client.from) {
      return this.client.from('trust_and_reputation.reviews');
    }
    throw new Error('Supabase client does not expose table access for admin queries.');
  }

  private mapReview(row: ReviewRow): ReviewSummary {
    return {
      id: row.id,
      bookingId: row.booking_id,
      providerId: row.provider_id,
      reviewerId: row.reviewer_id,
      reviewerFullName: row.reviewer_full_name ?? null,
      rating: row.rating,
      reviewText: row.review_text,
      isFlagged: row.is_flagged ?? false,
      createdAt: row.created_at,
    };
  }

  private mapReviewResponse(row: ReviewResponseRow): ReviewResponseSummary {
    return {
      id: row.id,
      reviewId: row.review_id,
      responderId: row.responder_id,
      responseText: row.response_text,
      createdAt: row.created_at,
    };
  }
}
