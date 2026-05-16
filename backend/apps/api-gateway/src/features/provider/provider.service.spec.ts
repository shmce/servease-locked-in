import { CatalogGatewayService } from '../catalog/catalog.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { BookingGatewayService } from '../booking/booking.service';
import { PaymentGatewayService } from '../payments/payment.service';
import { ProviderProfileRequiredError } from './provider.errors';
import { ProviderGatewayService } from './provider.service';

describe('ProviderGatewayService', () => {
  it('aggregates provider profile, services, and portfolio', async () => {
    const currentUserService = {
      getCurrentUser: jest.fn().mockResolvedValue({
        user: {
          id: 'c5246383-cdd6-4639-a7ff-bf3e290e9838',
          email: 'provider@example.com',
          fullName: 'Provider User',
          contactNumber: null,
          role: 'provider',
          status: 'active',
        },
        customerProfile: null,
        providerProfile: {
          id: '9d02cb22-c44a-4634-9fd1-cfa14abc34e5',
          businessName: 'Reliable Services',
          bio: 'Experienced home services.',
          serviceArea: 'Metro Manila',
          serviceDescription: 'Cleaning and repair services.',
          yearsExperience: 5,
          verificationStatus: 'approved',
          averageRating: 4.8,
          reviewCount: 12,
        },
      }),
    } as unknown as CurrentUserService;
    const catalogGatewayService = {
      listProviderListings: jest.fn().mockResolvedValue([
        {
          id: '4c53d535-352e-4ff2-993f-3f6b2990747e',
          providerId: '9d02cb22-c44a-4634-9fd1-cfa14abc34e5',
          providerBusinessName: 'Reliable Services',
          serviceId: null,
          title: 'Deep Cleaning',
          description: null,
          price: 1500,
          pricingMode: 'flat',
          averageRating: 4.8,
          reviewCount: 12,
          verificationStatus: 'approved',
        },
      ]),
      listProviderPortfolio: jest.fn().mockResolvedValue([]),
    } as unknown as CatalogGatewayService;
    const service = new ProviderGatewayService(
      currentUserService,
      catalogGatewayService,
      {} as BookingGatewayService,
      {} as PaymentGatewayService,
    );

    await expect(
      service.getProviderProfile('c5246383-cdd6-4639-a7ff-bf3e290e9838'),
    ).resolves.toMatchObject({
      provider: {
        id: '9d02cb22-c44a-4634-9fd1-cfa14abc34e5',
      },
      services: [
        {
          title: 'Deep Cleaning',
        },
      ],
      portfolio: [],
    });
    expect(catalogGatewayService.listProviderListings).toHaveBeenCalledWith(
      undefined,
      '9d02cb22-c44a-4634-9fd1-cfa14abc34e5',
    );
    expect(catalogGatewayService.listProviderPortfolio).toHaveBeenCalledWith(
      '9d02cb22-c44a-4634-9fd1-cfa14abc34e5',
    );
  });

  it('rejects non-provider users', async () => {
    const service = new ProviderGatewayService(
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: {
            role: 'customer',
          },
          providerProfile: null,
        }),
      } as unknown as CurrentUserService,
      {} as CatalogGatewayService,
      {} as BookingGatewayService,
      {} as PaymentGatewayService,
    );

    await expect(service.getProviderProfile('user-id')).rejects.toBeInstanceOf(
      ProviderProfileRequiredError,
    );
  });

  it('builds dashboard summaries from provider bookings and payments', async () => {
    const service = new ProviderGatewayService(
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: {
            id: 'c5246383-cdd6-4639-a7ff-bf3e290e9838',
            role: 'provider',
          },
          providerProfile: {
            id: '9d02cb22-c44a-4634-9fd1-cfa14abc34e5',
            averageRating: 4.7,
            reviewCount: 10,
          },
        }),
      } as unknown as CurrentUserService,
      {} as CatalogGatewayService,
      {
        listBookings: jest.fn().mockResolvedValue([
          {
            id: 'booking-1',
            customerFullName: 'Customer One',
            serviceTitle: 'Deep Cleaning',
            serviceAddress: 'Makati',
            scheduledAt: new Date().toISOString(),
            status: 'completed',
          },
          {
            id: 'booking-2',
            customerFullName: 'Customer Two',
            serviceTitle: 'Repair',
            serviceAddress: 'Pasig',
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            status: 'pending',
          },
        ]),
      } as unknown as BookingGatewayService,
      {
        listPayments: jest.fn().mockResolvedValue([
          {
            providerPayout: 900,
            status: 'paid',
            paidAt: new Date().toISOString(),
            createdAt: null,
          },
        ]),
      } as unknown as PaymentGatewayService,
    );

    await expect(
      service.getProviderDashboard('c5246383-cdd6-4639-a7ff-bf3e290e9838'),
    ).resolves.toMatchObject({
      summary: {
        newRequests: 1,
        todayBookings: 1,
        todayCompleted: 1,
        todayEarnings: 900,
        totalEarnings: 900,
        overallRating: 4.7,
        reviewCount: 10,
      },
      upcomingBookings: [
        {
          id: 'booking-2',
          customerName: 'Customer Two',
        },
      ],
    });
  });
});
