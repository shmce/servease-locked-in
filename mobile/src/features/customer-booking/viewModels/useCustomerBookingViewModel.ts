import { useMemo } from 'react';
import { MonthCalendarMarkers } from '../../../components/MonthCalendar';
import { ProviderAvailabilitySchedule } from '../../../shared/models/types';
import {
  buildCustomerBookingAvailability,
  buildCustomerBookingCalendarState,
  formatManilaDateInput,
} from '../../../shared/utils/booking';

export type CustomerBookingViewModelInput = {
  providerAvailability: ProviderAvailabilitySchedule | null;
  scheduledAt: string;
  hoursRequired: string;
  timeSlots: string[];
  bookingSlotError: string;
  now?: Date;
};

export function useCustomerBookingViewModel(input: CustomerBookingViewModelInput) {
  const {
    providerAvailability,
    scheduledAt,
    hoursRequired,
    timeSlots,
    bookingSlotError,
    now,
  } = input;

  return useMemo(
    () =>
      buildCustomerBookingViewModel({
        providerAvailability,
        scheduledAt,
        hoursRequired,
        timeSlots,
        bookingSlotError,
        now,
      }),
    [
      providerAvailability,
      scheduledAt,
      hoursRequired,
      timeSlots,
      bookingSlotError,
      now,
    ],
  );
}

export function buildCustomerBookingViewModel({
  providerAvailability,
  scheduledAt,
  hoursRequired,
  timeSlots,
  bookingSlotError,
  now = new Date(),
}: CustomerBookingViewModelInput) {
  const dateOnly = scheduledAt.slice(0, 10);
  const timeOnly = scheduledAt.slice(11, 16);
  const customerCalendarMinDate = formatManilaDateInput(now);
  const today = new Date(`${customerCalendarMinDate}T00:00:00`);
  const duration = Number(hoursRequired) || 1;
  const customerAvailability = buildCustomerBookingAvailability(
    providerAvailability,
    duration,
    timeSlots,
    today,
    dateOnly,
  );
  const selectedDateOption = customerAvailability.dateOptions.find(
    (date) => date.value === dateOnly,
  );
  const selectedTimeOption = customerAvailability.timeOptions.find(
    (slot) => slot.time === timeOnly,
  );
  const selectedSlotAvailable =
    selectedDateOption?.isAvailable === true && selectedTimeOption?.isAvailable === true;
  const slotPickerMessage =
    bookingSlotError ||
    (!providerAvailability
      ? 'Provider availability is loading.'
      : !selectedSlotAvailable
        ? selectedTimeOption?.unavailableLabel ?? selectedDateOption?.unavailableLabel
        : null);
  const calendarDisabledDates = new Set<string>();
  const calendarMarkers: MonthCalendarMarkers = {};
  const calendarStartMonth = customerCalendarMinDate.slice(0, 7);

  for (let offset = 0; offset < 12; offset += 1) {
    const calendarMonth = addMonthsToInputMonth(calendarStartMonth, offset);
    const calendarState = buildCustomerBookingCalendarState(
      providerAvailability,
      duration,
      timeSlots,
      calendarMonth,
    );
    calendarState.disabledDates.forEach((date) => calendarDisabledDates.add(date));
    Object.assign(calendarMarkers, calendarState.markers);
  }

  return {
    data: {
      dateOnly,
      timeOnly,
      duration,
      customerCalendarMinDate,
      customerAvailability,
      selectedSlotAvailable,
      slotPickerMessage,
      calendarDisabledDates,
      calendarMarkers,
    },
    isLoading: !providerAvailability,
    error: slotPickerMessage,
  };
}

function addMonthsToInputMonth(month: string, offset: number): string {
  const [rawYear, rawMonth] = month.split('-');
  const year = Number(rawYear);
  const monthIndex = Number(rawMonth) - 1;
  const date = new Date(year, monthIndex + offset, 1);
  const nextYear = date.getFullYear();
  const nextMonth = `${date.getMonth() + 1}`.padStart(2, '0');

  return `${nextYear}-${nextMonth}`;
}
