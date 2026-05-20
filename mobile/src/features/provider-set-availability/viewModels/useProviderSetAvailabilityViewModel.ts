import { useMemo, useState } from 'react';
import {
  ApiOptions,
  ProviderAvailabilitySchedule,
} from '../../../shared/models/types';
import {
  addProviderDayOff,
  addProviderTimeOffWindow,
  removeProviderDayOff,
  removeProviderTimeOffWindow,
} from '../../../shared/models/apiService';
import { bookingTimeSlots } from '../../../constants/appContent';
import { buildTimeOffEndSlots } from '../../../domain/providerAvailability';

export type BlockMode = 'whole-day' | 'specific-time';

export type ProviderSetAvailabilityViewModelInput = {
  selectedDate: string;
  availability: ProviderAvailabilitySchedule | null;
  apiOptions: ApiOptions;
  onScheduleUpdated: (schedule: ProviderAvailabilitySchedule) => void;
};

export const leadTimeMessage = 'You can only block dates at least 2 days from today.';
export const timeOffEndSlots = buildTimeOffEndSlots(bookingTimeSlots);

export function useProviderSetAvailabilityViewModel({
  selectedDate,
  availability,
  apiOptions,
  onScheduleUpdated,
}: ProviderSetAvailabilityViewModelInput) {
  const [mode, setMode] = useState<BlockMode>('whole-day');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('17:00');
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const minBlockDate = useMemo(() => addManilaDays(2), []);
  const isTooSoon = selectedDate < minBlockDate;
  const selectedDayOff = availability?.daysOff.find(
    (dayOff) => dayOff.offDate === selectedDate,
  );
  const selectedTimeOffWindows =
    (availability?.timeOffWindows ?? []).filter(
      (window) => window.offDate === selectedDate,
    );
  const endOptions = timeOffEndSlots.filter((slot) => slot > startTime);
  const canSubmit =
    !isTooSoon &&
    !busyAction &&
    (mode === 'whole-day' || (endTime > startTime && endOptions.includes(endTime)));

  async function saveBlock() {
    if (!canSubmit) {
      return;
    }

    setBusyAction('save');
    setNotice(null);
    try {
      const schedule =
        mode === 'whole-day'
          ? await addProviderDayOff(
              {
                offDate: selectedDate,
                reason: reason.trim() || null,
              },
              apiOptions,
            )
          : await addProviderTimeOffWindow(
              {
                offDate: selectedDate,
                startTime,
                endTime,
                reason: reason.trim() || null,
              },
              apiOptions,
            );
      onScheduleUpdated(schedule);
      setReason('');
      setNotice('Availability block saved.');
    } catch (error) {
      setNotice(mapAvailabilityError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function deleteDayOff() {
    setBusyAction('delete-day-off');
    setNotice(null);
    try {
      onScheduleUpdated(await removeProviderDayOff(selectedDate, apiOptions));
      setNotice('Availability block removed.');
    } catch (error) {
      setNotice(mapAvailabilityError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function deleteTimeOffWindow(id: string) {
    setBusyAction(`delete-${id}`);
    setNotice(null);
    try {
      onScheduleUpdated(await removeProviderTimeOffWindow(id, apiOptions));
      setNotice('Availability block removed.');
    } catch (error) {
      setNotice(mapAvailabilityError(error));
    } finally {
      setBusyAction(null);
    }
  }

  return {
    data: {
      mode,
      startTime,
      endTime,
      reason,
      notice,
      busyAction,
      isTooSoon,
      selectedDayOff,
      selectedTimeOffWindows,
      endOptions,
      canSubmit,
      timeOffEndSlots,
      bookingTimeSlots,
      leadTimeMessage,
    },
    isLoading: Boolean(busyAction),
    error: notice,
    actions: {
      setMode,
      setStartTime,
      setEndTime,
      setReason,
      saveBlock,
      deleteDayOff,
      deleteTimeOffWindow,
    },
  };
}

export function mapAvailabilityError(error: unknown): string {
  const message = error instanceof Error ? error.message : '';

  if (
    message.includes('time_off_too_soon') ||
    message.toLowerCase().includes('at least 2 days')
  ) {
    return leadTimeMessage;
  }
  if (
    message.includes('time_off_conflicts_booking') ||
    message.toLowerCase().includes('conflict')
  ) {
    return 'You have a booking on this date or time. Cancel or reschedule it first.';
  }
  if (
    message.includes('invalid_availability_request') ||
    message.toLowerCase().includes('invalid')
  ) {
    return 'Please check the date and time.';
  }

  return "Couldn't save. Please try again.";
}

function addManilaDays(days: number): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);
  const date = new Date(Date.UTC(year, month - 1, day + days));

  return `${date.getUTCFullYear()}-${`${date.getUTCMonth() + 1}`.padStart(
    2,
    '0',
  )}-${`${date.getUTCDate()}`.padStart(2, '0')}`;
}
