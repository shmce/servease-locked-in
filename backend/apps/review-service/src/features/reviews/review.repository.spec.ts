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

  it('lists flagged reviews for admin moderation from the service-owned schema', async () => {
    const result = {
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
    };
    const query = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn((resolve) => Promise.resolve(resolve(result))),
    };
    const from = jest.fn().mockReturnValue(query);
    const schema = jest.fn().mockReturnValue({ from });
    const repository = new SupabaseReviewRepository({
      rpc: jest.fn(),
      schema,
    });

    const reviews = await repository.listForAdmin({
      providerId: 'provider-1',
      flaggedOnly: true,
      limit: 25,
    });

    expect(schema).toHaveBeenCalledWith('trust_and_reputation');
    expect(from).toHaveBeenCalledWith('reviews');
    expect(query.eq).toHaveBeenCalledWith('is_flagged', true);
    expect(query.eq).toHaveBeenCalledWith('provider_id', 'provider-1');
    expect(query.limit).toHaveBeenCalledWith(25);
    expect(reviews[0]).toEqual(
      expect.objectContaining({
        id: 'review-1',
        reviewerFullName: 'Casey Customer',
        isFlagged: true,
      }),
    );
  });

  it('updates review flagged state for admin moderation', async () => {
    const single = jest.fn().mockResolvedValue({
      data: {
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
      error: null,
    });
    const query = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single,
    };
    const repository = new SupabaseReviewRepository({
      rpc: jest.fn(),
      schema: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue(query),
      }),
    });

    const review = await repository.setFlagged({
      reviewId: 'review-1',
      isFlagged: false,
      reason: 'Restored by admin',
      adminId: 'admin-1',
    });

    expect(query.update).toHaveBeenCalledWith({ is_flagged: false });
    expect(query.eq).toHaveBeenCalledWith('id', 'review-1');
    expect(review.isFlagged).toBe(false);
  });
});
