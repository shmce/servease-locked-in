import { SupabaseAdminDisputeRepository } from './supabase-admin-dispute.repository';

describe('SupabaseAdminDisputeRepository', () => {
  it('lists admin disputes through the booking RPC and maps rows', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'dispute-1',
          booking_id: 'booking-1',
          booking_reference: 'SE-ABC123',
          customer_id: 'customer-1',
          provider_id: 'provider-1',
          raised_by: 'customer-1',
          reason: 'Provider did not arrive',
          status: 'open',
          amount: '1500',
          created_at: '2026-05-16T00:00:00.000Z',
        },
      ],
      error: null,
    });
    const repository = new SupabaseAdminDisputeRepository({ rpc });

    await expect(repository.listDisputes('open')).resolves.toEqual([
      {
        id: 'dispute-1',
        bookingId: 'booking-1',
        bookingReference: 'SE-ABC123',
        customerId: 'customer-1',
        providerId: 'provider-1',
        raisedBy: 'customer-1',
        reason: 'Provider did not arrive',
        status: 'open',
        amount: 1500,
        createdAt: '2026-05-16T00:00:00.000Z',
      },
    ]);
    expect(rpc).toHaveBeenCalledWith('servease_admin_list_disputes', {
      p_status: 'open',
    });
  });

  it('resolves disputes through the admin status RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'dispute-1',
        booking_id: 'booking-1',
        booking_reference: 'SE-ABC123',
        customer_id: 'customer-1',
        provider_id: 'provider-1',
        raised_by: 'customer-1',
        reason: 'Provider did not arrive',
        status: 'resolved',
        amount: '1500',
        created_at: '2026-05-16T00:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabaseAdminDisputeRepository({ rpc });

    await expect(
      repository.updateDisputeStatus('dispute-1', 'resolved'),
    ).resolves.toMatchObject({
      id: 'dispute-1',
      status: 'resolved',
    });
    expect(rpc).toHaveBeenCalledWith('servease_admin_update_dispute_status', {
      p_dispute_id: 'dispute-1',
      p_status: 'resolved',
    });
  });
});
