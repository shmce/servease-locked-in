import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MonthCalendar } from '../../../components/MonthCalendar';
import { Section } from '../../../components/DesignKit';
import { ProviderAvailabilitySchedule } from '../../../shared/models/types';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
import { useCustomerBookingViewModel } from '../viewModels/useCustomerBookingViewModel';

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
};

export function CustomerBookingSchedulePicker({
  providerAvailability,
  scheduledAt,
  hoursRequired,
  timeSlots,
  bookingSlotError,
  defaultScheduledAt,
  onScheduledAtChange,
  onBookingSlotErrorChange,
  onUnavailableSlotPress,
}: CustomerBookingSchedulePickerProps) {
  const schedule = useCustomerBookingViewModel({
    providerAvailability,
    scheduledAt,
    hoursRequired,
    timeSlots,
    bookingSlotError,
  });
  const { data } = schedule;

  return (
    <>
      <Section title="Pick a date">
        <MonthCalendar
          selectedDate={data.dateOnly}
          onSelectDate={(date) => {
            onBookingSlotErrorChange('');
            onScheduledAtChange(`${date}T${data.timeOnly || '09:00'}`);
          }}
          minDate={data.customerCalendarMinDate}
          disabledDates={data.calendarDisabledDates}
          markers={data.calendarMarkers}
          initialMonth={data.dateOnly}
        />
        <View style={styles.calendarLegendRow}>
          <View style={styles.calendarLegendItem}>
            <View style={styles.calendarPartialDot} />
            <Text style={styles.calendarLegendLabel}>Partial availability</Text>
          </View>
          <Text style={styles.cardMeta}>Grey dates are unavailable for this provider.</Text>
        </View>
      </Section>

      <Section title="Pick a time">
        <View style={styles.timeGrid}>
          {data.customerAvailability.timeOptions.map(
            ({ time, isAvailable, unavailableLabel }) => {
              const isSelected = data.timeOnly === time;

              return (
                <Pressable
                  key={time}
                  style={[
                    styles.timeTile,
                    isSelected && styles.timeTileSelected,
                    !isAvailable && styles.timeTileDisabled,
                  ]}
                  onPress={() => {
                    if (!isAvailable) {
                      onUnavailableSlotPress();
                      return;
                    }

                    onBookingSlotErrorChange('');
                    onScheduledAtChange(
                      `${data.dateOnly || defaultScheduledAt.slice(0, 10)}T${time}`,
                    );
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
                  disabled={!isAvailable}
                >
                  <Text
                    style={[
                      styles.timeTileText,
                      isSelected && styles.timeTileTextSelected,
                      !isAvailable && styles.timeTileTextDisabled,
                    ]}
                  >
                    {time}
                  </Text>
                  {!isAvailable ? (
                    <Text style={styles.timeTileUnavailableText}>
                      {unavailableLabel ?? 'Provider unavailable'}
                    </Text>
                  ) : null}
                </Pressable>
              );
            },
          )}
        </View>
        {data.slotPickerMessage ? (
          <Text style={styles.noticeText}>{data.slotPickerMessage}</Text>
        ) : null}
        <Text style={styles.cardMeta}>
          Greyed times are blocked or outside this provider&apos;s posted availability.
        </Text>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  calendarLegendRow: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  calendarLegendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  calendarPartialDot: {
    backgroundColor: palette.amber,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  calendarLegendLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeTile: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '31%',
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  timeTileSelected: {
    backgroundColor: palette.mint,
    borderColor: palette.mint,
  },
  timeTileDisabled: {
    backgroundColor: palette.lineSoft,
    borderColor: palette.lineSoft,
  },
  timeTileText: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  timeTileTextSelected: {
    color: palette.white,
  },
  timeTileTextDisabled: {
    color: palette.faint,
  },
  timeTileUnavailableText: {
    color: palette.faint,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  noticeText: {
    ...type.caption,
    color: palette.muted,
    textAlign: 'center',
  },
});
