import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import {
  ApiOptions,
  ProviderAvailabilitySchedule,
  addProviderDayOff,
  addProviderTimeOffWindow,
  removeProviderDayOff,
  removeProviderTimeOffWindow,
} from '../../services/serveaseApi';
import { Card, Field, PrimaryButton, Section, TopBar } from '../components/DesignKit';
import { bookingTimeSlots } from '../constants/appContent';
import { buildTimeOffEndSlots } from '../domain/providerAvailability';
import { palette, radius, spacing } from '../theme/serveaseDesign';

type BlockMode = 'whole-day' | 'specific-time';

type ProviderSetAvailabilityScreenProps = {
  selectedDate: string;
  availability: ProviderAvailabilitySchedule | null;
  apiOptions: ApiOptions;
  onScheduleUpdated: (schedule: ProviderAvailabilitySchedule) => void;
  onBack: () => void;
};

const leadTimeMessage = 'You can only block dates at least 2 days from today.';
const timeOffEndSlots = buildTimeOffEndSlots(bookingTimeSlots);

export function ProviderSetAvailabilityScreen({
  selectedDate,
  availability,
  apiOptions,
  onScheduleUpdated,
  onBack,
}: ProviderSetAvailabilityScreenProps) {
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

  return (
    <>
      <TopBar
        title={selectedDate}
        subtitle="Block availability for this date"
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Section title="Block time">
            {isTooSoon ? <Text style={styles.warningText}>{leadTimeMessage}</Text> : null}
            <View style={styles.segmentedControl}>
              <ModeButton
                label="Block whole day"
                selected={mode === 'whole-day'}
                onPress={() => setMode('whole-day')}
              />
              <ModeButton
                label="Block specific time"
                selected={mode === 'specific-time'}
                onPress={() => setMode('specific-time')}
              />
            </View>

            {mode === 'specific-time' ? (
              <>
                <Text style={styles.label}>Start time</Text>
                <View style={styles.slotGrid}>
                  {bookingTimeSlots.map((slot) => (
                    <SlotButton
                      key={slot}
                      label={slot}
                      selected={slot === startTime}
                      onPress={() => {
                        setStartTime(slot);
                        const nextEnd = timeOffEndSlots.find((option) => option > slot);
                        setEndTime(nextEnd ?? slot);
                      }}
                    />
                  ))}
                </View>
                <Text style={styles.label}>End time</Text>
                <View style={styles.slotGrid}>
                  {timeOffEndSlots.map((slot) => (
                    <SlotButton
                      key={slot}
                      label={slot}
                      selected={slot === endTime}
                      disabled={slot <= startTime}
                      onPress={() => setEndTime(slot)}
                    />
                  ))}
                </View>
              </>
            ) : null}

            <Field
              label="Reason"
              value={reason}
              onChangeText={setReason}
              placeholder="Optional"
            />
            <PrimaryButton
              label="Save block"
              onPress={() => void saveBlock()}
              disabled={!canSubmit}
            />
            {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}
          </Section>

          <Section title="Existing blocks">
            {selectedDayOff ? (
              <Card>
                <BlockRow
                  title="Whole day off"
                  subtitle={selectedDayOff.reason ?? 'No reason added'}
                  disabled={Boolean(busyAction)}
                  onDelete={() => void deleteDayOff()}
                />
              </Card>
            ) : null}
            {selectedTimeOffWindows.map((window) => (
              <Card key={window.id}>
                <BlockRow
                  title={`${window.startTime} to ${window.endTime}`}
                  subtitle={window.reason ?? 'Partial time block'}
                  disabled={Boolean(busyAction)}
                  onDelete={() => void deleteTimeOffWindow(window.id)}
                />
              </Card>
            ))}
            {!selectedDayOff && !selectedTimeOffWindows.length ? (
              <Text style={styles.emptyText}>No blocks for this date.</Text>
            ) : null}
          </Section>
        </View>
      </ScrollView>
    </>
  );
}

function ModeButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.segment, selected && styles.segmentSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SlotButton({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.slotButton,
        selected && styles.slotButtonSelected,
        disabled && styles.slotButtonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
    >
      <Text
        style={[
          styles.slotText,
          selected && styles.slotTextSelected,
          disabled && styles.slotTextDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function BlockRow({
  title,
  subtitle,
  disabled,
  onDelete,
}: {
  title: string;
  subtitle: string;
  disabled: boolean;
  onDelete: () => void;
}) {
  return (
    <View style={styles.blockRow}>
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardMeta}>{subtitle}</Text>
      </View>
      <Pressable
        style={styles.deleteButton}
        onPress={onDelete}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${title}`}
      >
        <X color={palette.red} size={18} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

function mapAvailabilityError(error: unknown): string {
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

const styles = StyleSheet.create({
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  warningText: {
    backgroundColor: '#FEF2F2',
    borderRadius: radius.sm,
    color: palette.red,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    padding: spacing.md,
  },
  segmentedControl: {
    backgroundColor: palette.surface,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  segment: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  segmentSelected: {
    backgroundColor: palette.white,
  },
  segmentText: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  segmentTextSelected: {
    color: palette.ink,
  },
  label: {
    color: palette.body,
    fontSize: 13,
    fontWeight: '900',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.sm,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: 'center',
    width: 72,
  },
  slotButtonSelected: {
    backgroundColor: palette.mint,
    borderColor: palette.mint,
  },
  slotButtonDisabled: {
    opacity: 0.42,
  },
  slotText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  slotTextSelected: {
    color: palette.white,
  },
  slotTextDisabled: {
    color: palette.faint,
  },
  noticeText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  emptyText: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  blockRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  cardMeta: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
