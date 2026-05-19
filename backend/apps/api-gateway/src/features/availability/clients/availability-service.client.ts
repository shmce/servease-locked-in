import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AvailabilityDependencyUnavailableError,
  InvalidAvailabilityRequestError,
  TimeOffConflictsBookingError,
  TimeOffTooSoonError,
} from '../availability.errors';
import {
  AddProviderTimeOffWindowInput,
  AvailabilityWindowInput,
  ProviderAvailabilitySchedule,
} from '../availability.types';

@Injectable()
export class AvailabilityServiceClient {
  constructor(private readonly configService: ConfigService) {}

  getSchedule(providerId: string): Promise<ProviderAvailabilitySchedule> {
    return this.request<ProviderAvailabilitySchedule>(
      `/internal/providers/${providerId}/availability`,
      'GET',
    );
  }

  replaceWindows(
    providerId: string,
    windows: AvailabilityWindowInput[],
  ): Promise<ProviderAvailabilitySchedule> {
    return this.request<ProviderAvailabilitySchedule>(
      `/internal/providers/${providerId}/availability/windows`,
      'PUT',
      { windows },
    );
  }

  addDayOff(
    providerId: string,
    offDate: string,
    reason?: string | null,
  ): Promise<ProviderAvailabilitySchedule> {
    return this.request<ProviderAvailabilitySchedule>(
      `/internal/providers/${providerId}/availability/days-off`,
      'POST',
      { offDate, reason },
    );
  }

  removeDayOff(
    providerId: string,
    offDate: string,
  ): Promise<ProviderAvailabilitySchedule> {
    return this.request<ProviderAvailabilitySchedule>(
      `/internal/providers/${providerId}/availability/days-off/${offDate}`,
      'DELETE',
    );
  }

  addTimeOffWindow(
    providerId: string,
    input: AddProviderTimeOffWindowInput,
  ): Promise<ProviderAvailabilitySchedule> {
    return this.request<ProviderAvailabilitySchedule>(
      `/internal/providers/${providerId}/availability/time-off`,
      'POST',
      input,
    );
  }

  removeTimeOffWindow(
    providerId: string,
    id: string,
  ): Promise<ProviderAvailabilitySchedule> {
    return this.request<ProviderAvailabilitySchedule>(
      `/internal/providers/${providerId}/availability/time-off/${id}`,
      'DELETE',
    );
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'PUT' | 'POST' | 'DELETE',
    body?: unknown,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'AVAILABILITY_SERVICE_URL',
      'http://localhost:8505',
    );
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      const code = await this.readErrorCode(response);
      if (code === 'invalid_availability_request') {
        throw new InvalidAvailabilityRequestError();
      }
      if (code === 'time_off_too_soon') {
        throw new TimeOffTooSoonError();
      }
      if (code === 'time_off_conflicts_booking') {
        throw new TimeOffConflictsBookingError();
      }
      throw new AvailabilityDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }

  private async readErrorCode(response: Response): Promise<string | null> {
    try {
      const payload = (await response.json()) as {
        error?: {
          code?: string;
        };
      };
      return payload.error?.code ?? null;
    } catch {
      return null;
    }
  }
}
