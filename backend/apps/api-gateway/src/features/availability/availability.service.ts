import { Injectable } from '@nestjs/common';
import {
  AddProviderTimeOffWindowInput,
  AvailabilityWindowInput,
  ProviderAvailabilitySchedule,
} from './availability.types';
import { AvailabilityServiceClient } from './clients/availability-service.client';

@Injectable()
export class AvailabilityGatewayService {
  constructor(private readonly availabilityServiceClient: AvailabilityServiceClient) {}

  getSchedule(providerId: string): Promise<ProviderAvailabilitySchedule> {
    return this.availabilityServiceClient.getSchedule(providerId);
  }

  replaceWindows(
    providerId: string,
    windows: AvailabilityWindowInput[],
  ): Promise<ProviderAvailabilitySchedule> {
    return this.availabilityServiceClient.replaceWindows(providerId, windows);
  }

  addDayOff(
    providerId: string,
    offDate: string,
    reason?: string | null,
  ): Promise<ProviderAvailabilitySchedule> {
    return this.availabilityServiceClient.addDayOff(providerId, offDate, reason);
  }

  removeDayOff(
    providerId: string,
    offDate: string,
  ): Promise<ProviderAvailabilitySchedule> {
    return this.availabilityServiceClient.removeDayOff(providerId, offDate);
  }

  addTimeOffWindow(
    providerId: string,
    input: AddProviderTimeOffWindowInput,
  ): Promise<ProviderAvailabilitySchedule> {
    return this.availabilityServiceClient.addTimeOffWindow(providerId, input);
  }

  removeTimeOffWindow(
    providerId: string,
    id: string,
  ): Promise<ProviderAvailabilitySchedule> {
    return this.availabilityServiceClient.removeTimeOffWindow(providerId, id);
  }
}
