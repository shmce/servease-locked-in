import { BookingGatewayService } from '../booking/booking.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';
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
      {} as CatalogServiceClient,
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

  it('creates provider replies with the provider profile id, not the user id', async () => {
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('provider-user-1'),
    } as unknown as AuthTokenService;
    const bookingGatewayService = {} as unknown as BookingGatewayService;
    const catalogServiceClient = {
      findProviderProfileByUserId: jest.fn().mockResolvedValue({
        id: 'provider-1',
      }),
    } as unknown as CatalogServiceClient;
    const reviewGatewayService = {
      createReviewResponse: jest.fn().mockResolvedValue({
        id: 'response-1',
      }),
    } as unknown as ReviewGatewayService;
    const controller = new ReviewController(
      reviewGatewayService,
      bookingGatewayService,
      authTokenService,
      catalogServiceClient,
    );

    const response = await controller.reply('review-1', 'Bearer token', {
      responseText: 'Thank you for the feedback.',
    });

    expect(catalogServiceClient.findProviderProfileByUserId).toHaveBeenCalledWith(
      'provider-user-1',
    );
    expect(reviewGatewayService.createReviewResponse).toHaveBeenCalledWith(
      'review-1',
      'provider-1',
      'Thank you for the feedback.',
    );
    expect(response.data.id).toBe('response-1');
  });

  it('notifies the provider owner when a customer creates a review', async () => {
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
    const catalogServiceClient = {
      findProviderOwnerByProviderId: jest.fn().mockResolvedValue({
        userId: 'provider-user-1',
      }),
    } as unknown as CatalogServiceClient;
    const reviewGatewayService = {
      createReview: jest.fn().mockResolvedValue({
        id: 'review-1',
        bookingId: 'booking-1',
        providerId: 'provider-1',
        reviewerId: 'customer-1',
        rating: 5,
      }),
    } as unknown as ReviewGatewayService;
    const notificationServiceClient = {
      createNotification: jest.fn().mockResolvedValue({ id: 'notification-1' }),
    } as unknown as NotificationServiceClient;
    const controller = new ReviewController(
      reviewGatewayService,
      bookingGatewayService,
      authTokenService,
      catalogServiceClient,
      notificationServiceClient,
    );

    await controller.create('Bearer token', {
      bookingId: 'booking-1',
      rating: 5,
      reviewText: 'Great service',
    });

    expect(catalogServiceClient.findProviderOwnerByProviderId).toHaveBeenCalledWith(
      'provider-1',
    );
    expect(notificationServiceClient.createNotification).toHaveBeenCalledWith({
      userId: 'provider-user-1',
      type: 'review_created',
      title: 'New customer review',
      body: 'A customer left a 5-star review.',
      metadata: {
        bookingId: 'booking-1',
        providerId: 'provider-1',
        reviewId: 'review-1',
        rating: '5',
      },
    });
  });

  it('keeps review creation successful when provider notification dispatch fails', async () => {
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
    const catalogServiceClient = {
      findProviderOwnerByProviderId: jest.fn().mockResolvedValue({
        userId: 'provider-user-1',
      }),
    } as unknown as CatalogServiceClient;
    const reviewGatewayService = {
      createReview: jest.fn().mockResolvedValue({
        id: 'review-1',
        bookingId: 'booking-1',
        providerId: 'provider-1',
        reviewerId: 'customer-1',
        rating: 5,
      }),
    } as unknown as ReviewGatewayService;
    const notificationServiceClient = {
      createNotification: jest.fn().mockRejectedValue(new Error('notification down')),
    } as unknown as NotificationServiceClient;
    const controller = new ReviewController(
      reviewGatewayService,
      bookingGatewayService,
      authTokenService,
      catalogServiceClient,
      notificationServiceClient,
    );

    await expect(
      controller.create('Bearer token', {
        bookingId: 'booking-1',
        rating: 5,
        reviewText: 'Great service',
      }),
    ).resolves.toMatchObject({
      data: {
        id: 'review-1',
      },
    });
  });
});
