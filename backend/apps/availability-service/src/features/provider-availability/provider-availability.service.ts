import { Inject, Injectable } from '@nestjs/common';
import { InvalidAvailabilityRequestError } from './provider-availability.errors';
import {
  AddProviderTimeOffWindowInput,
  AvailabilityWindowInput,
  DayOfWeek,
  ProviderAvailabilitySchedule,
} from './provider-availability.types';

export const PROVIDER_AVAILABILITY_REPOSITORY = Symbol(
  'PROVIDER_AVAILABILITY_REPOSITORY',
);

export interface ProviderAvailabilityRepository {
  getSchedule(providerId: string): Promise<ProviderAvailabilitySchedule>;
  replaceWindows(
    providerId: string,
    windows: AvailabilityWindowInput[],
  ): Promise<ProviderAvailabilitySchedule>;
  addDayOff(
    providerId: string,
    offDate: string,
    reason?: string | null,
  ): Promise<ProviderAvailabilitySchedule>;
  removeDayOff(
    providerId: string,
    offDate: string,
  ): Promise<ProviderAvailabilitySchedule>;
  addTimeOffWindow(
    providerId: string,
    input: AddProviderTimeOffWindowInput,
  ): Promise<ProviderAvailabilitySchedule>;
  removeTimeOffWindow(
    providerId: string,
    windowId: string,
  ): Promise<ProviderAvailabilitySchedule>;
}

const DAYS: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

@Injectable()
export class ProviderAvailabilityService {
  constructor(
    @Inject(PROVIDER_AVAILABILITY_REPOSITORY)
    private readonly repository: ProviderAvailabilityRepository,
  ) {}

  getSchedule(providerId: string): Promise<ProviderAvailabilitySchedule> {
    return this.repository.getSchedule(providerId);
  }

  async replaceWindows(
    providerId: string,
    windows: AvailabilityWindowInput[],
  ): Promise<ProviderAvailabilitySchedule> {
    if (!Array.isArray(windows)) {
      throw new InvalidAvailabilityRequestError();
    }

    for (const window of windows) {
      this.assertValidWindow(window);
    }

    return this.repository.replaceWindows(providerId, windows);
  }

  addDayOff(
    providerId: string,
    offDate: string,
    reason?: string | null,
  ): Promise<ProviderAvailabilitySchedule> {
    this.assertValidDate(offDate);
    return this.repository.addDayOff(providerId, offDate, reason);
  }

  removeDayOff(
    providerId: string,
    offDate: string,
  ): Promise<ProviderAvailabilitySchedule> {
    this.assertValidDate(offDate);
    return this.repository.removeDayOff(providerId, offDate);
  }

  addTimeOffWindow(
    providerId: string,
    input: AddProviderTimeOffWindowInput,
  ): Promise<ProviderAvailabilitySchedule> {
    this.assertValidDate(input.offDate);
    this.assertValidTimeRange(input.startTime, input.endTime);
    return this.repository.addTimeOffWindow(providerId, input);
  }

  removeTimeOffWindow(
    providerId: string,
    windowId: string,
  ): Promise<ProviderAvailabilitySchedule> {
    if (!windowId?.trim()) {
      throw new InvalidAvailabilityRequestError();
    }

    return this.repository.removeTimeOffWindow(providerId, windowId);
  }

  private assertValidWindow(window: AvailabilityWindowInput): void {
    if (!DAYS.includes(window.dayOfWeek)) {
      throw new InvalidAvailabilityRequestError();
    }

    this.assertValidTimeRange(window.startTime, window.endTime);
  }

  private assertValidDate(date: string): void {
    if (!DATE_PATTERN.test(date)) {
      throw new InvalidAvailabilityRequestError();
    }
  }

  private assertValidTimeRange(startTime: string, endTime: string): void {
    if (
      !TIME_PATTERN.test(startTime) ||
      !TIME_PATTERN.test(endTime) ||
      startTime >= endTime
    ) {
      throw new InvalidAvailabilityRequestError();
    }
  }
}
