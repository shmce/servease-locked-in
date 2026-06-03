import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, Clock } from 'lucide-react-native';
import { MonthCalendar } from '../../../components/MonthCalendar';
import {
  CustomerCard,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import { ProviderAvailabilitySchedule } from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useCustomerBookingViewModel } from '../viewModels/useCustomerBookingViewModel';

// Constants
const WHEEL_ITEM_H = 48;
const WHEEL_SIDE = 2;
const WHEEL_H = WHEEL_ITEM_H * (WHEEL_SIDE * 2 + 1);

// Helpers
function parseHM(time: string): [number, number] {
  const [hourRaw, minuteRaw] = time.split(':');
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  return [
    Number.isFinite(hour) ? hour : 9,
    Number.isFinite(minute) ? minute : 0,
  ];
}

function fmt(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = parseHM(time);
  return h * 60 + m;
}

function addHour(time: string): string {
  const [h, m] = parseHM(time);
  return fmt(Math.min(h + 1, 20), m);
}

function addDuration(time: string, hours: string): string {
  const base = timeToMinutes(time);
  const parsedHours = Number(hours);
  const durationMinutes = Math.max(
    30,
    Math.round((Number.isFinite(parsedHours) ? parsedHours : 1) * 60),
  );
  const end = Math.min(base + durationMinutes, 20 * 60);

  return fmt(Math.floor(end / 60), end % 60);
}

function duration(start: string, end: string): string {
  const [sh, sm] = parseHM(start);
  const [eh, em] = parseHM(end);
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) return '1';
  const hrs = mins / 60;
  return hrs % 1 === 0 ? String(hrs) : hrs.toFixed(1);
}

function endTimes(startTime: string): string[] {
  const [sh, sm] = parseHM(startTime);
  const base = sh * 60 + sm;
  const result: string[] = [];
  for (let t = base + 30; t <= 20 * 60; t += 30) {
    result.push(fmt(Math.floor(t / 60), t % 60));
  }
  return result;
}

// Props
function normalizeTimeOption(time: string, options: string[], fallback: string): string {
  if (options.includes(time)) return time;

  const sortedOptions = [...options].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
  if (sortedOptions.length === 0) return fallback;

  const target = timeToMinutes(time);
  return sortedOptions.find((option) => timeToMinutes(option) >= target) ?? sortedOptions[0];
}

function uniqueHours(times: string[]): string[] {
  return [...new Set(times.map((time) => String(parseHM(time)[0]).padStart(2, '0')))].sort();
}

function minutesForHour(times: string[], hour: string): string[] {
  return [
    ...new Set(
      times
        .filter((time) => String(parseHM(time)[0]).padStart(2, '0') === hour)
        .map((time) => String(parseHM(time)[1]).padStart(2, '0')),
    ),
  ].sort();
}

type CustomerBookingSchedulePickerProps = {
  providerAvailability: ProviderAvailabilitySchedule | null;
  scheduledAt: string;
  hoursRequired: string;
  timeSlots: string[];
  bookingSlotError: string;
  defaultScheduledAt: string;
  onScheduledAtChange: (scheduledAt: string) => void;
  onBookingSlotErrorChange: (message: string) => void;
  onUnavailableSlotPress: () => void;
  onHoursRequiredChange: (value: string) => void;
};

// Main component
export function CustomerBookingSchedulePicker({
  providerAvailability,
  scheduledAt,
  hoursRequired,
  timeSlots,
  bookingSlotError,
  defaultScheduledAt,
  onScheduledAtChange,
  onBookingSlotErrorChange,
  onHoursRequiredChange,
}: CustomerBookingSchedulePickerProps) {
  const schedule = useCustomerBookingViewModel({
    providerAvailability,
    scheduledAt,
    hoursRequired,
    timeSlots,
    bookingSlotError,
  });
  const { data } = schedule;

  const startTime = data.timeOnly || '09:00';
  const dateOnly = data.dateOnly || defaultScheduledAt.slice(0, 10);

  const [endTime, setEndTime] = useState(() => addDuration(startTime, hoursRequired));
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      const adjusted = addDuration(startTime, hoursRequired);
      setEndTime(adjusted);
      return;
    }

    const nextHoursRequired = duration(startTime, endTime);
    if (nextHoursRequired !== hoursRequired) {
      onHoursRequiredChange(nextHoursRequired);
    }
  }, [endTime, hoursRequired, onHoursRequiredChange, startTime]);

  const availableStartTimes = data.customerAvailability.timeOptions
    .filter((o) => o.isAvailable)
    .map((o) => o.time);

  const availableEndTimes = endTimes(startTime);

  const handleStartConfirm = (time: string) => {
    const normalizedTime = normalizeTimeOption(time, availableStartTimes, startTime);
    const nextEndTime =
      timeToMinutes(endTime) > timeToMinutes(normalizedTime)
        ? endTime
        : addDuration(normalizedTime, hoursRequired);

    setEndTime(nextEndTime);
    onBookingSlotErrorChange('');
    onHoursRequiredChange(duration(normalizedTime, nextEndTime));
    onScheduledAtChange(`${dateOnly}T${normalizedTime}`);
    setActivePicker(null);
  };

  const handleEndConfirm = (time: string) => {
    const normalizedTime = normalizeTimeOption(time, availableEndTimes, addHour(startTime));
    setEndTime(normalizedTime);
    onHoursRequiredChange(duration(startTime, normalizedTime));
    setActivePicker(null);
  };

  const pickerConfig =
    activePicker === 'start'
      ? {
          title: 'Arrives at',
          times: availableStartTimes,
          current: startTime,
          onConfirm: handleStartConfirm,
        }
      : {
          title: 'Finishes at',
          times: availableEndTimes,
          current: endTime,
          onConfirm: handleEndConfirm,
        };

  return (
    <>
      <CustomerSection title="Pick a date">
        <CustomerCard style={styles.calendarCard}>
          <MonthCalendar
            selectedDate={data.dateOnly}
            onSelectDate={(date) => {
              onBookingSlotErrorChange('');
              onScheduledAtChange(`${date}T${startTime}`);
            }}
            minDate={data.customerCalendarMinDate}
            disabledDates={data.calendarDisabledDates}
            markers={data.calendarMarkers}
            initialMonth={data.dateOnly}
          />
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={styles.legendDot} />
              <Text style={styles.legendLabel}>Partial availability</Text>
            </View>
            <Text style={styles.cardMeta}>
              Grey dates are unavailable for this provider.
            </Text>
          </View>
        </CustomerCard>
      </CustomerSection>

      <CustomerSection title="Pick a time">
        <CustomerCard>
          <TimeRow
            label="Arrives at"
            time={startTime}
            onPress={() => setActivePicker('start')}
          />
          <View style={styles.rowDivider} />
          <TimeRow
            label="Finishes at"
            time={endTime}
            onPress={() => setActivePicker('end')}
          />
        </CustomerCard>
        {data.slotPickerMessage ? (
          <Text style={styles.noticeText}>{data.slotPickerMessage}</Text>
        ) : null}
      </CustomerSection>

      <TimePickerModal
        visible={activePicker !== null}
        title={pickerConfig.title}
        times={pickerConfig.times}
        initialTime={pickerConfig.current}
        onConfirm={pickerConfig.onConfirm}
        onDismiss={() => setActivePicker(null)}
      />
    </>
  );
}

// Time row
function TimeRow({
  label,
  time,
  onPress,
}: {
  label: string;
  time: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.timeRow} onPress={onPress} accessibilityRole="button">
      <Clock color={palette.mint} size={16} strokeWidth={2.2} />
      <Text style={styles.timeRowLabel}>{label}</Text>
      <Text style={styles.timeRowValue}>{time}</Text>
      <ChevronRight color={palette.faint} size={16} />
    </Pressable>
  );
}

// Modal
function TimePickerModal({
  visible,
  title,
  times,
  initialTime,
  onConfirm,
  onDismiss,
}: {
  visible: boolean;
  title: string;
  times: string[];
  initialTime: string;
  onConfirm: (time: string) => void;
  onDismiss: () => void;
}) {
  const sortedTimes = useMemo(
    () => [...times].sort((a, b) => timeToMinutes(a) - timeToMinutes(b)),
    [times],
  );
  const [pendingTime, setPendingTime] = useState(() =>
    normalizeTimeOption(initialTime, sortedTimes, initialTime),
  );

  useEffect(() => {
    if (visible) {
      setPendingTime(normalizeTimeOption(initialTime, sortedTimes, initialTime));
    }
  }, [initialTime, sortedTimes, visible]);

  const normalizedPendingTime = normalizeTimeOption(pendingTime, sortedTimes, pendingTime);
  const [selectedHour, selectedMinute] = parseHM(normalizedPendingTime);
  const selectedHourLabel = String(selectedHour).padStart(2, '0');
  const selectedMinuteLabel = String(selectedMinute).padStart(2, '0');
  const hourItems = uniqueHours(sortedTimes);
  const minuteItems = minutesForHour(sortedTimes, selectedHourLabel);
  const canSetTime = sortedTimes.length > 0;
  const isAvailable = canSetTime;

  const handleHourSelect = (hour: string) => {
    const minutes = minutesForHour(sortedTimes, hour);
    const nextMinute = minutes.includes(selectedMinuteLabel)
      ? selectedMinuteLabel
      : minutes[0] ?? '00';
    setPendingTime(normalizeTimeOption(`${hour}:${nextMinute}`, sortedTimes, pendingTime));
  };

  const handleMinuteSelect = (minute: string) => {
    setPendingTime(
      normalizeTimeOption(`${selectedHourLabel}:${minute}`, sortedTimes, pendingTime),
    );
  };

  const handleConfirm = () => {
    if (!isAvailable) return;
    onConfirm(normalizeTimeOption(pendingTime, sortedTimes, pendingTime));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.modalBackdrop} onPress={onDismiss}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{title}</Text>

          <View style={styles.wheelsRow}>
            <View style={styles.wheelColumn}>
              <Text style={styles.wheelLabel}>Hour</Text>
              <WheelPicker
                items={hourItems}
                selected={selectedHourLabel}
                onSelect={handleHourSelect}
              />
            </View>

            <Text style={styles.colonSep}>:</Text>

            <View style={styles.wheelColumn}>
              <Text style={styles.wheelLabel}>Min</Text>
              <WheelPicker
                key={selectedHourLabel}
                items={minuteItems}
                selected={selectedMinuteLabel}
                onSelect={handleMinuteSelect}
              />
            </View>
          </View>

          {!isAvailable ? (
            <Text style={styles.noticeText}>Provider unavailable</Text>
          ) : null}
          <Pressable
            style={[styles.modalButton, !isAvailable && styles.modalButtonDisabled]}
            onPress={handleConfirm}
            disabled={!isAvailable}
            accessibilityRole="button"
          >
            <Text style={styles.modalButtonText}>Set time</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Wheel picker
function WheelPicker({
  items,
  selected,
  onSelect,
}: {
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const idx = Math.max(0, items.indexOf(selected));
    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: idx * WHEEL_ITEM_H, animated: false });
    });

    return () => cancelAnimationFrame(frame);
  }, [items, selected]);

  const settle = (y: number) => {
    const idx = Math.round(y / WHEEL_ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    const item = items[clamped];
    if (item && item !== selected) onSelect(item);
  };

  if (items.length === 0) return <View style={styles.emptyWheel} />;

  return (
    <View style={styles.wheelShell}>
      <ScrollView
        ref={scrollRef}
        snapToInterval={WHEEL_ITEM_H}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.wheelContent}
        onMomentumScrollEnd={(e) => settle(e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(e) => settle(e.nativeEvent.contentOffset.y)}
        style={styles.wheelScroll}
      >
        {items.map((item) => (
          <Pressable key={item} style={styles.wheelItem} onPress={() => onSelect(item)}>
            <Text
              style={[styles.wheelItemText, item === selected && styles.wheelItemTextSelected]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.wheelRail} pointerEvents="none" />
      <View style={styles.wheelFadeTop} pointerEvents="none" />
      <View style={styles.wheelFadeBottom} pointerEvents="none" />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  calendarCard: {
    padding: spacing.base,
  },
  legendRow: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  legendDot: {
    backgroundColor: palette.amber,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  legendLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  cardMeta: {
    ...customerText.meta,
  },
  noticeText: {
    ...customerText.meta,
    textAlign: 'center',
  },

  // Time row
  rowDivider: {
    backgroundColor: '#EEF0F2',
    height: 1,
    marginVertical: spacing.xs,
  },
  timeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
  },
  timeRowLabel: {
    color: '#202733',
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0,
  },
  timeRowValue: {
    color: palette.mintDeep,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
  },

  // Modal
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: 36,
  },
  modalHandle: {
    alignSelf: 'center',
    backgroundColor: palette.line,
    borderRadius: radius.pill,
    height: 4,
    width: 40,
  },
  modalTitle: {
    color: '#202733',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0,
    textAlign: 'center',
  },
  wheelsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  wheelColumn: {
    alignItems: 'center',
    flexBasis: 108,
    flexGrow: 0,
    flexShrink: 1,
    gap: spacing.xs,
  },
  wheelLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  colonSep: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
  },

  // Wheel picker
  wheelShell: {
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    height: WHEEL_H,
    overflow: 'hidden',
    width: 108,
  },
  emptyWheel: {
    height: WHEEL_H,
    width: 108,
  },
  wheelScroll: {
    flex: 1,
  },
  wheelContent: {
    paddingVertical: WHEEL_ITEM_H * WHEEL_SIDE,
  },
  wheelItem: {
    alignItems: 'center',
    height: WHEEL_ITEM_H,
    justifyContent: 'center',
  },
  wheelItemText: {
    color: palette.muted,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: WHEEL_ITEM_H,
    textAlign: 'center',
  },
  wheelItemTextSelected: {
    color: '#202733',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: WHEEL_ITEM_H,
  },
  wheelRail: {
    borderBottomColor: palette.mintDeep,
    borderBottomWidth: 1.5,
    borderTopColor: palette.mintDeep,
    borderTopWidth: 1.5,
    bottom: WHEEL_ITEM_H * WHEEL_SIDE,
    left: spacing.base,
    position: 'absolute',
    right: spacing.base,
    top: WHEEL_ITEM_H * WHEEL_SIDE,
  },
  wheelFadeTop: {
    backgroundColor: 'rgba(255,255,255,0.80)',
    height: WHEEL_ITEM_H * WHEEL_SIDE,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  wheelFadeBottom: {
    backgroundColor: 'rgba(255,255,255,0.80)',
    bottom: 0,
    height: WHEEL_ITEM_H * WHEEL_SIDE,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  modalButton: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 48,
  },
  modalButtonDisabled: {
    backgroundColor: palette.line,
  },
  modalButtonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
  },
});
