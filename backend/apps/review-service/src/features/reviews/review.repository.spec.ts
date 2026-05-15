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
});
