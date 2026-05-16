import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminDisputeSummary } from '../admin-dispute.types';

@Injectable()
export class BookingServiceClient {
  constructor(private readonly configService: ConfigService) {}

  listDisputes(status?: string | null): Promise<AdminDisputeSummary[]> {
    const searchParams = new URLSearchParams();
    if (status) {
      searchParams.set('status', status);
    }
    return this.request<AdminDisputeSummary[]>(
      `/internal/admin/disputes?${searchParams.toString()}`,
    );
  }

  getDispute(disputeId: string): Promise<AdminDisputeSummary> {
    return this.request<AdminDisputeSummary>(
      `/internal/admin/disputes/${disputeId}`,
    );
  }

  resolveDispute(disputeId: string): Promise<AdminDisputeSummary> {
    return this.request<AdminDisputeSummary>(
      `/internal/admin/disputes/${disputeId}/resolve`,
      'POST',
    );
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST' = 'GET',
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'BOOKING_SERVICE_URL',
      'http://localhost:8504',
    );
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('booking_dependency_unavailable');
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
