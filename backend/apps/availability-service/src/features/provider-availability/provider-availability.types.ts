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
  isActive?: boolean | null;
}

export interface AvailabilityWindow {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ProviderDayOff {
  id: string;
  offDate: string;
  reason: string | null;
}

export interface ProviderAvailabilitySchedule {
  providerId: string;
  windows: AvailabilityWindow[];
  daysOff: ProviderDayOff[];
}
