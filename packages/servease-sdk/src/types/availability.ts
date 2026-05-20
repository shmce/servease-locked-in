export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface AvailabilityWindowInput {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface AvailabilityWindow extends AvailabilityWindowInput {
  id: string;
}

export interface ProviderDayOff {
  id: string;
  offDate: string;
  reason?: string | null;
}

export interface ProviderTimeOffWindow {
  id: string;
  offDate: string;
  startTime: string;
  endTime: string;
  reason?: string | null;
}

export interface ProviderAvailabilitySchedule {
  providerId: string;
  windows: AvailabilityWindow[];
  daysOff: ProviderDayOff[];
  timeOffWindows: ProviderTimeOffWindow[];
}

export interface ReplaceAvailabilityWindowsInput {
  windows: AvailabilityWindowInput[];
}

export interface AddProviderDayOffInput {
  offDate: string;
  reason?: string;
}

export interface AddProviderTimeOffInput {
  offDate: string;
  startTime: string;
  endTime: string;
  reason?: string;
}
