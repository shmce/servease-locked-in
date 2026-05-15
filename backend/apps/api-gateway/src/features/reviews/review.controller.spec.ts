import { BookingGatewayService } from '../booking/booking.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { ReviewController } from './review.controller';
import { ReviewGatewayService } from './review.service';

describe('ReviewController', () => {
  it('creates a review only for the authenticated customer completed booking', async () => {
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('customer-1'),
    } as unknown as AuthTokenService;
    const bookingGatewayService = {
      findBooking: jest.fn().mockResolvedValue({
        id: 'booking-1',
        customerId: 'customer-1',
        providerId: 'provider-1',
        status: 'completed',
      }),
    } as unknown as BookingGatewayService;
    const reviewGatewayService = {
      createReview: jest.fn().mockResolvedValue({
        id: 'review-1',
      }),
    } as unknown as ReviewGatewayService;
    const controller = new ReviewController(
      reviewGatewayService,
      bookingGatewayService,
      authTokenService,
    );

    const response = await controller.create('Bearer token', {
      bookingId: 'booking-1',
      rating: 5,
      reviewText: 'Great service',
    });

    expect(bookingGatewayService.findBooking).toHaveBeenCalledWith(
      'booking-1',
      'customer-1',
      null,
    );
    expect(reviewGatewayService.createReview).toHaveBeenCalledWith({
      bookingId: 'booking-1',
      providerId: 'provider-1',
      reviewerId: 'customer-1',
      rating: 5,
      reviewText: 'Great service',
    });
    expect(response.data.id).toBe('review-1');
  });
});
