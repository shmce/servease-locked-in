import { SupabaseReviewRepository } from './supabase-review.repository';

describe('SupabaseReviewRepository', () => {
  it('creates or returns a provider review through the service RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'review-1',
        booking_id: 'booking-1',
        provider_id: 'provider-1',
        reviewer_id: 'customer-1',
        rating: 5,
        review_text: 'Great service',
        is_flagged: false,
        created_at: '2026-05-15T10:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabaseReviewRepository({ rpc });

    const review = await repository.createReview({
      bookingId: 'booking-1',
      providerId: 'provider-1',
      reviewerId: 'customer-1',
      rating: 5,
      reviewText: 'Great service',
    });

    expect(rpc).toHaveBeenCalledWith('servease_create_review', {
      p_booking_id: 'booking-1',
      p_provider_id: 'provider-1',
      p_reviewer_id: 'customer-1',
      p_rating: 5,
      p_review_text: 'Great service',
    });
    expect(review.rating).toBe(5);
  });

  it('lists flagged reviews for admin via servease_admin_list_reviews RPC', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'review-1',
          booking_id: 'booking-1',
          provider_id: 'provider-1',
          reviewer_id: 'customer-1',
          reviewer_full_name: 'Casey Customer',
          rating: 2,
          review_text: 'Abusive comment',
          is_flagged: true,
          created_at: '2026-05-16T00:00:00.000Z',
        },
      ],
      error: null,
    });
    const repository = new SupabaseReviewRepository({ rpc });

    const reviews = await repository.listForAdmin({
      providerId: 'provider-1',
      flaggedOnly: true,
      limit: 25,
    });

    expect(rpc).toHaveBeenCalledWith('servease_admin_list_reviews', {
      p_provider_id: 'provider-1',
      p_flagged_only: true,
      p_limit: 25,
    });
    expect(reviews[0]).toEqual(
      expect.objectContaining({
        id: 'review-1',
        reviewerFullName: 'Casey Customer',
        isFlagged: true,
      }),
    );
  });

  it('updates review flagged state via servease_admin_set_review_flagged RPC', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'review-1',
          booking_id: 'booking-1',
          provider_id: 'provider-1',
          reviewer_id: 'customer-1',
          reviewer_full_name: null,
          rating: 2,
          review_text: 'Abusive comment',
          is_flagged: false,
          created_at: '2026-05-16T00:00:00.000Z',
        },
      ],
      error: null,
    });
    const repository = new SupabaseReviewRepository({ rpc });

    const review = await repository.setFlagged({
      reviewId: 'review-1',
      isFlagged: false,
      reason: 'Restored by admin',
      adminId: 'admin-1',
    });

    expect(rpc).toHaveBeenCalledWith('servease_admin_set_review_flagged', {
      p_review_id: 'review-1',
      p_is_flagged: false,
    });
    expect(review.isFlagged).toBe(false);
  });
});
