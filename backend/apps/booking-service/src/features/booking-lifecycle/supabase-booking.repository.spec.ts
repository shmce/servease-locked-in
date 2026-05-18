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
      serviceDescription: null,
      serviceAddress: '123 Test St',
      scheduledAt: '2026-05-20T08:00:00.000Z',
      hoursRequired: null,
      serviceAmount: null,
      pricingMode: null,
      acceptedQuoteId: null,
      quoteFairnessStatus: null,
      quoteConfidence: null,
      customerNotes: null,
      status: 'pending',
      totalAmount: 1200,
      attachments: [],
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
      p_accepted_quote_id: null,
      p_quote_fairness_status: null,
      p_quote_confidence: null,
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
        serviceDescription: null,
        serviceAddress: '123 Test St',
        scheduledAt: '2026-05-20T08:00:00.000Z',
        hoursRequired: null,
        serviceAmount: null,
        pricingMode: null,
        acceptedQuoteId: null,
        quoteFairnessStatus: null,
        quoteConfidence: null,
        customerNotes: null,
        status: 'pending',
        totalAmount: 1200,
        attachments: [],
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

  it('loads a visible booking live location through the tracking RPC', async () => {
    const rpc = jest.fn().mockReturnValue({
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          booking_id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
          provider_id: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
          latitude: 14.5995,
          longitude: 120.9842,
          accuracy_meters: 8,
          heading_degrees: 90,
          speed_mps: 4,
          updated_at: '2026-05-16T00:00:05.000Z',
        },
        error: null,
      }),
    });
    const repository = new SupabaseBookingRepository({ rpc });

    await expect(
      repository.getLiveLocation(
        '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        null,
      ),
    ).resolves.toEqual({
      latitude: 14.5995,
      longitude: 120.9842,
      accuracyMeters: 8,
      headingDegrees: 90,
      speedMps: 4,
      updatedAt: '2026-05-16T00:00:05.000Z',
    });
    expect(rpc).toHaveBeenCalledWith('servease_get_booking_live_location', {
      p_booking_id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      p_customer_id: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      p_provider_id: null,
    });
  });

  it('upserts a provider live location through the tracking RPC', async () => {
    const rpc = jest.fn().mockReturnValue({
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          booking_id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
          provider_id: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
          latitude: 14.5995,
          longitude: 120.9842,
          accuracy_meters: 8,
          heading_degrees: 90,
          speed_mps: 4,
          updated_at: '2026-05-16T00:00:05.000Z',
        },
        error: null,
      }),
    });
    const repository = new SupabaseBookingRepository({ rpc });

    await expect(
      repository.upsertLiveLocation({
        bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        latitude: 14.5995,
        longitude: 120.9842,
        accuracyMeters: 8,
        headingDegrees: 90,
        speedMps: 4,
      }),
    ).resolves.toEqual({
      latitude: 14.5995,
      longitude: 120.9842,
      accuracyMeters: 8,
      headingDegrees: 90,
      speedMps: 4,
      updatedAt: '2026-05-16T00:00:05.000Z',
    });
    expect(rpc).toHaveBeenCalledWith('servease_upsert_booking_live_location', {
      p_booking_id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      p_provider_id: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      p_latitude: 14.5995,
      p_longitude: 120.9842,
      p_accuracy_meters: 8,
      p_heading_degrees: 90,
      p_speed_mps: 4,
    });
  });

  it('adds booking attachments with booking visibility ids', async () => {
    const rpc = jest.fn().mockReturnValue({
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          id: 'attachment-1',
          booking_id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
          uploaded_by: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
          media_kind: 'booking_reference',
          file_url: 'https://storage.test/photo.jpg',
          file_name: 'photo.jpg',
          mime_type: 'image/jpeg',
          storage_path: 'booking_reference/user/photo.jpg',
          file_size: 120,
          caption: null,
          created_at: '2026-05-16T00:00:00.000Z',
        },
        error: null,
      }),
    });
    const repository = new SupabaseBookingRepository({ rpc });

    await expect(
      repository.addAttachment({
        bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        actorId: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        customerId: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        providerId: null,
        mediaKind: 'booking_reference',
        fileUrl: 'https://storage.test/photo.jpg',
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        storagePath: 'booking_reference/user/photo.jpg',
        fileSize: 120,
      }),
    ).resolves.toEqual({
      id: 'attachment-1',
      bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      uploadedBy: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      mediaKind: 'booking_reference',
      fileUrl: 'https://storage.test/photo.jpg',
      fileName: 'photo.jpg',
      mimeType: 'image/jpeg',
      storagePath: 'booking_reference/user/photo.jpg',
      fileSize: 120,
      caption: null,
      createdAt: '2026-05-16T00:00:00.000Z',
    });
    expect(rpc).toHaveBeenCalledWith('servease_add_booking_attachment', {
      p_booking_id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      p_customer_id: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      p_provider_id: null,
      p_uploaded_by: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      p_media_kind: 'booking_reference',
      p_file_url: 'https://storage.test/photo.jpg',
      p_file_name: 'photo.jpg',
      p_mime_type: 'image/jpeg',
      p_storage_path: 'booking_reference/user/photo.jpg',
      p_file_size: 120,
      p_caption: null,
    });
  });

  it('deletes booking attachments and maps the soft-deleted row', async () => {
    const rpc = jest.fn().mockReturnValue({
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          id: 'attachment-1',
          booking_id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
          uploaded_by: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
          media_kind: 'booking_reference',
          file_url: 'https://storage.test/photo.jpg',
          file_name: 'photo.jpg',
          mime_type: 'image/jpeg',
          storage_path: 'booking_reference/user/photo.jpg',
          file_size: 120,
          caption: null,
          created_at: '2026-05-16T00:00:00.000Z',
        },
        error: null,
      }),
    });
    const repository = new SupabaseBookingRepository({ rpc });

    const attachment = await repository.deleteAttachment(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'attachment-1',
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
    );

    expect(attachment.id).toBe('attachment-1');
    expect(rpc).toHaveBeenCalledWith('servease_delete_booking_attachment', {
      p_booking_id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      p_attachment_id: 'attachment-1',
      p_actor_id: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
    });
  });

  it('raises booking disputes through the dispute RPC', async () => {
    const rpc = jest.fn().mockReturnValue({
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          id: 'dispute-1',
          booking_id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
          raised_by: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
          category: 'damage',
          reason: 'Incorrect work',
          description: null,
          status: 'open',
          resolved_at: null,
          resolved_by: null,
          created_at: '2026-05-16T00:00:00.000Z',
        },
        error: null,
      }),
    });
    const repository = new SupabaseBookingRepository({ rpc });

    await expect(
      repository.raiseDispute({
        bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        actorId: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        category: 'damage',
        reason: 'Incorrect work',
      }),
    ).resolves.toEqual({
      id: 'dispute-1',
      bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      raisedBy: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      category: 'damage',
      reason: 'Incorrect work',
      description: null,
      status: 'open',
      resolvedAt: null,
      resolvedBy: null,
      createdAt: '2026-05-16T00:00:00.000Z',
    });
    expect(rpc).toHaveBeenCalledWith('servease_raise_booking_dispute', {
      p_booking_id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      p_actor_id: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      p_category: 'damage',
      p_reason: 'Incorrect work',
      p_description: null,
    });
  });

  it('creates and lists provider service updates through booking RPCs', async () => {
    const rpc = jest
      .fn()
      .mockReturnValueOnce({
        maybeSingle: jest.fn().mockResolvedValue({
          data: {
            id: 'update-1',
            booking_id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
            actor_id: 'provider-user-1',
            update_type: 'progress',
            message: 'Halfway done.',
            checklist: null,
            attachment_id: null,
            created_at: '2026-05-16T00:00:00.000Z',
          },
          error: null,
        }),
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'update-1',
            booking_id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
            actor_id: 'provider-user-1',
            update_type: 'progress',
            message: 'Halfway done.',
            checklist: null,
            attachment_id: null,
            created_at: '2026-05-16T00:00:00.000Z',
          },
        ],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'timeline-1',
            booking_id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
            event_type: 'created',
            label: 'Booking requested',
            icon: 'calendar',
            created_at: '2026-05-16T00:00:00.000Z',
          },
        ],
        error: null,
      });
    const repository = new SupabaseBookingRepository({ rpc });

    const update = await repository.createServiceUpdate({
      bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      actorId: 'provider-user-1',
      providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      updateType: 'progress',
      message: 'Halfway done.',
    });
    const updates = await repository.listServiceUpdates(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      null,
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );
    const timeline = await repository.listTimelineEvents(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      null,
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );

    expect(update).toEqual({
      id: 'update-1',
      bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      actorId: 'provider-user-1',
      updateType: 'progress',
      message: 'Halfway done.',
      checklist: null,
      attachmentId: null,
      createdAt: '2026-05-16T00:00:00.000Z',
    });
    expect(updates).toEqual([update]);
    expect(rpc).toHaveBeenNthCalledWith(1, 'servease_add_booking_service_update', {
      p_booking_id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      p_actor_id: 'provider-user-1',
      p_provider_id: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      p_update_type: 'progress',
      p_message: 'Halfway done.',
      p_checklist: null,
      p_attachment_id: null,
    });
    expect(rpc).toHaveBeenNthCalledWith(2, 'servease_list_booking_service_updates', {
      p_booking_id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      p_customer_id: null,
      p_provider_id: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    });
    expect(timeline).toEqual([
      {
        id: 'timeline-1',
        bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        eventType: 'created',
        label: 'Booking requested',
        icon: 'calendar',
        createdAt: '2026-05-16T00:00:00.000Z',
      },
    ]);
    expect(rpc).toHaveBeenNthCalledWith(3, 'servease_list_booking_timeline_events', {
      p_booking_id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      p_customer_id: null,
      p_provider_id: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    });
  });
});
