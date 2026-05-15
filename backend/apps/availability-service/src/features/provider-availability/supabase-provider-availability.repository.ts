import { Injectable, Optional } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { InvalidAvailabilityRequestError } from './provider-availability.errors';
import {
  AvailabilityWindowInput,
  ProviderAvailabilitySchedule,
} from './provider-availability.types';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<string, unknown>,
  ): PromiseLike<{
    data: ProviderAvailabilitySchedule | null;
    error: { message: string } | null;
  }>;
}

@Injectable()
export class SupabaseProviderAvailabilityRepository {
  private readonly client: SupabaseRpcClient;

  constructor(@Optional() client?: SupabaseRpcClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  getSchedule(providerId: string): Promise<ProviderAvailabilitySchedule> {
    return this.scheduleRpc('servease_get_provider_availability', {
      p_provider_id: providerId,
    });
  }

  replaceWindows(
    providerId: string,
    windows: AvailabilityWindowInput[],
  ): Promise<ProviderAvailabilitySchedule> {
    return this.scheduleRpc('servease_replace_provider_availability_windows', {
      p_provider_id: providerId,
      p_windows: windows,
    });
  }

  addDayOff(
    providerId: string,
    offDate: string,
    reason?: string | null,
  ): Promise<ProviderAvailabilitySchedule> {
    return this.scheduleRpc('servease_add_provider_day_off', {
      p_provider_id: providerId,
      p_off_date: offDate,
      p_reason: reason ?? null,
    });
  }

  removeDayOff(
    providerId: string,
    offDate: string,
  ): Promise<ProviderAvailabilitySchedule> {
    return this.scheduleRpc('servease_remove_provider_day_off', {
      p_provider_id: providerId,
      p_off_date: offDate,
    });
  }

  private async scheduleRpc(
    functionName: string,
    args: Record<string, unknown>,
  ): Promise<ProviderAvailabilitySchedule> {
    const { data, error } = await this.client.rpc(functionName, args);

    if (error) {
      if (error.message.includes('invalid_availability_request')) {
        throw new InvalidAvailabilityRequestError();
      }
      throw new Error(`Availability RPC failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('Availability RPC returned no schedule');
    }

    return data;
  }
}
