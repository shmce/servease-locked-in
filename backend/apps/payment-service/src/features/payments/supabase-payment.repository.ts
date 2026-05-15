import { Injectable, Optional } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { PaymentNotFoundError } from './payment.errors';
import {
  CreatePaymentInput,
  PaymentSummary,
  PaymentVisibility,
  PaymentStatus,
} from './payment.types';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<string, string | number | null>,
  ): PromiseLike<{
    data: PaymentRow[] | null;
    error: { message: string; code?: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data: PaymentRow | null;
      error: { message: string; code?: string } | null;
    }>;
  };
}

interface PaymentRow {
  id: string;
  booking_id: string;
  customer_id: string | null;
  provider_id: string | null;
  amount: string | number | null;
  platform_fee: string | number | null;
  provider_payout: string | number | null;
  status: PaymentStatus;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string | null;
}

@Injectable()
export class SupabasePaymentRepository {
  private readonly client: SupabaseRpcClient;

  constructor(@Optional() client?: SupabaseRpcClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  async createPayment(input: CreatePaymentInput): Promise<PaymentSummary> {
    const { data, error } = await this.client
      .rpc('servease_create_payment', {
        p_booking_id: input.bookingId,
        p_customer_id: input.customerId,
        p_provider_id: input.providerId,
        p_amount: input.amount,
        p_payment_method: input.paymentMethod,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapPayment(data);
  }

  async listPayments(visibility: PaymentVisibility): Promise<PaymentSummary[]> {
    const { data, error } = await this.client.rpc('servease_list_visible_payments', {
      p_customer_id: visibility.customerId,
      p_provider_id: visibility.providerId,
    });

    if (error) {
      throw new Error(`Failed to list payments: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapPayment(row));
  }

  async listAllPayments(status: PaymentStatus | null): Promise<PaymentSummary[]> {
    const { data, error } = await this.client.rpc('servease_admin_list_payments', {
      p_status: status,
    });

    if (error) {
      throw new Error(`Failed to list admin payments: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapPayment(row));
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
  ): Promise<PaymentSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_update_payment_status', {
        p_payment_id: paymentId,
        p_status: status,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update payment: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapPayment(data);
  }

  private mapPayment(row: PaymentRow): PaymentSummary {
    return {
      id: row.id,
      bookingId: row.booking_id,
      customerId: row.customer_id,
      providerId: row.provider_id,
      amount: Number(row.amount ?? 0),
      platformFee: Number(row.platform_fee ?? 0),
      providerPayout: Number(row.provider_payout ?? 0),
      status: row.status,
      paymentMethod: row.payment_method,
      paidAt: row.paid_at,
      createdAt: row.created_at,
    };
  }
}
