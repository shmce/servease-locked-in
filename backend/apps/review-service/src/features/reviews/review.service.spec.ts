import { InvalidReviewRequestError } from './review.errors';
import { ReviewService } from './review.service';
import { SupabaseReviewRepository } from './supabase-review.repository';

describe('ReviewService', () => {
  it('rejects ratings outside the allowed range', async () => {
    const repository = {
      createReview: jest.fn(),
    } as unknown as SupabaseReviewRepository;
    const service = new ReviewService(repository);

    await expect(
      service.createReview({
        bookingId: 'booking-1',
        providerId: 'provider-1',
        reviewerId: 'customer-1',
        rating: 6,
        reviewText: 'Too high',
      }),
    ).rejects.toBeInstanceOf(InvalidReviewRequestError);
    expect(repository.createReview).not.toHaveBeenCalled();
  });
});
