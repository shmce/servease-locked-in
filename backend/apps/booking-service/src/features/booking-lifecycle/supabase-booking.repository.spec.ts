import { SupabaseBookingRepository } from './supabase-booking.repository';
import {
  BookingNotFoundError,
  InvalidBookingTransitionError,
  ProviderUnavailableError,
} from './booking.errors';

describe('SupabaseBookingRepository', () => {
  it('creates a booking through the booking RPC and maps the response', async () => {
    const rpc = jest.fn().mockReturnValue({
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
          booking_reference: 'SE-ABC123',
          customer_id: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
          provider_id: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
          service_id: '14e09a89-b7ad-483b-bfb6-6c49d8923197',
          service_title: 'Deep Clean',
          service_address: '123 Test St',
          scheduled_at: '2026-05-20T08:00:00.000Z',
          status: 'pending',
          total_amount: '1200',
        },
        error: null,
      }),
    });
    const repository = new SupabaseBookingRepository({ rpc });

    await expect(
      repository.createBooking({
        customerId: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        serviceId: '14e09a89-b7ad-483b-bfb6-6c49d8923197',
        serviceTitle: 'Deep Clean',
        serviceName: 'Deep Clean',
        serviceDescription: 'Detailed cleaning',
        serviceAddress: '123 Test St',
        scheduledAt: '2026-05-20T08:00:00.000Z',
        hoursRequired: 1,
        serviceAmount: 1200,
        pricingMode: 'flat',
        paymentMethod: 'cash_on_service',
        customerNotes: null,
      }),
    ).resolves.toEqual({
      id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      bookingReference: 'SE-ABC123',
      customerId: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      serviceId: '14e09a89-b7ad-483b-bfb6-6c49d8923197',
      serviceTitle: 'Deep Clean',
      serviceAddress: '123 Test St',
      scheduledAt: '2026-05-20T08:00:00.000Z',
      status: 'pending',
      totalAmount: 1200,
    });
    expect(rpc).toHaveBeenCalledWith('servease_create_booking', {
      p_customer_id: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      p_provider_id: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      p_service_id: '14e09a89-b7ad-483b-bfb6-6c49d8923197',
      p_service_title: 'Deep Clean',
      p_service_name: 'Deep Clean',
      p_service_description: 'Detailed cleaning',
      p_service_address: '123 Test St',
      p_scheduled_at: '2026-05-20T08:00:00.000Z',
      p_hours_required: 1,
      p_service_amount: 1200,
      p_pricing_mode: 'flat',
      p_payment_method: 'cash_on_service',
      p_customer_notes: null,
    });
  });

  it('maps Supabase invalid transition errors to the domain error', async () => {
    const rpc = jest.fn().mockReturnValue({
      maybeSingle: jest.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'invalid_booking_transition',
        },
      }),
    });
    const repository = new SupabaseBookingRepository({ rpc });

    await expect(
      repository.transitionStatus(
        '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        'completed',
      ),
    ).rejects.toBeInstanceOf(InvalidBookingTransitionError);
  });

  it('maps Supabase provider availability errors to the domain error', async () => {
    const rpc = jest.fn().mockReturnValue({
      maybeSingle: jest.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'provider_unavailable',
        },
      }),
    });
    const repository = new SupabaseBookingRepository({ rpc });

    await expect(
      repository.createBooking({
        customerId: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        serviceAddress: '123 Test St',
        scheduledAt: '2026-05-20T08:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(ProviderUnavailableError);
  });

  it('lists visible bookings through the read RPC', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
          booking_reference: 'SE-ABC123',
          customer_id: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
          provider_id: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
          service_id: null,
          service_title: 'Deep Clean',
          service_address: '123 Test St',
          scheduled_at: '2026-05-20T08:00:00.000Z',
          status: 'pending',
          total_amount: '1200',
        },
      ],
      error: null,
    });
    const repository = new SupabaseBookingRepository({ rpc });

    await expect(
      repository.listVisibleBookings(
        '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        null,
      ),
    ).resolves.toEqual([
      {
        id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        bookingReference: 'SE-ABC123',
        customerId: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        serviceId: null,
        serviceTitle: 'Deep Clean',
        serviceAddress: '123 Test St',
        scheduledAt: '2026-05-20T08:00:00.000Z',
        status: 'pending',
        totalAmount: 1200,
      },
    ]);
    expect(rpc).toHaveBeenCalledWith('servease_list_visible_bookings', {
      p_customer_id: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      p_provider_id: null,
    });
  });

  it('throws not found when a visible booking detail is missing', async () => {
    const rpc = jest.fn().mockReturnValue({
      maybeSingle: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });
    const repository = new SupabaseBookingRepository({ rpc });

    await expect(
      repository.findVisibleBooking(
        '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        null,
      ),
    ).rejects.toBeInstanceOf(BookingNotFoundError);
  });
});
