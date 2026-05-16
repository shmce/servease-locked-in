import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { ReviewServiceClient } from '../reviews/clients/review-service.client';
import { AdminReviewController } from './admin-review.controller';

describe('AdminReviewController', () => {
  it('lists reviews only after confirming the caller is an admin', async () => {
    const reviewServiceClient = {
      listForAdmin: jest.fn().mockResolvedValue([
        {
          id: 'review-1',
          bookingId: 'booking-1',
          providerId: 'provider-1',
          reviewerId: 'customer-1',
          reviewerFullName: 'Casey Customer',
          rating: 2,
          reviewText: 'Abusive comment',
          isFlagged: true,
          createdAt: '2026-05-16T00:00:00.000Z',
        },
      ]),
    } as unknown as ReviewServiceClient;
    const controller = new AdminReviewController(
      reviewServiceClient,
      {
        authenticate: jest.fn().mockResolvedValue('admin-1'),
      } as unknown as AuthTokenService,
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: {
            id: 'admin-1',
            role: 'admin',
          },
        }),
      } as unknown as CurrentUserService,
    );

    const response = await controller.list(
      'Bearer token',
      'provider-1',
      'true',
      '50',
    );

    expect(reviewServiceClient.listForAdmin).toHaveBeenCalledWith({
      providerId: 'provider-1',
      flaggedOnly: true,
      limit: 50,
    });
    expect(response.data).toHaveLength(1);
  });

  it('rejects non-admin callers before review data is loaded', async () => {
    const reviewServiceClient = {
      listForAdmin: jest.fn(),
    } as unknown as ReviewServiceClient;
    const controller = new AdminReviewController(
      reviewServiceClient,
      {
        authenticate: jest.fn().mockResolvedValue('customer-1'),
      } as unknown as AuthTokenService,
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: {
            id: 'customer-1',
            role: 'customer',
          },
        }),
      } as unknown as CurrentUserService,
    );

    await expect(
      controller.list('Bearer token', undefined, undefined, undefined),
    ).rejects.toMatchObject({
      getStatus: expect.any(Function),
    });
    expect(reviewServiceClient.listForAdmin).not.toHaveBeenCalled();
  });

  it('passes admin id when hiding a review', async () => {
    const reviewServiceClient = {
      setReviewFlagged: jest.fn().mockResolvedValue({
        id: 'review-1',
        bookingId: 'booking-1',
        providerId: 'provider-1',
        reviewerId: 'customer-1',
        reviewerFullName: null,
        rating: 2,
        reviewText: 'Abusive comment',
        isFlagged: true,
        createdAt: '2026-05-16T00:00:00.000Z',
      }),
    } as unknown as ReviewServiceClient;
    const controller = new AdminReviewController(
      reviewServiceClient,
      {
        authenticate: jest.fn().mockResolvedValue('admin-1'),
      } as unknown as AuthTokenService,
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: {
            id: 'admin-1',
            role: 'admin',
          },
        }),
      } as unknown as CurrentUserService,
    );

    const response = await controller.setFlagged('Bearer token', 'review-1', {
      isFlagged: true,
      reason: 'Abusive content',
    });

    expect(reviewServiceClient.setReviewFlagged).toHaveBeenCalledWith(
      'review-1',
      {
        isFlagged: true,
        reason: 'Abusive content',
        adminId: 'admin-1',
      },
    );
    expect(response.data.isFlagged).toBe(true);
  });
});
