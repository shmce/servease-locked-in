import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { palette, radius, spacing, type } from '../theme/serveaseDesign';
import {
  buildMonthCalendarCells,
  dateFromMonthInput,
  formatApiDate,
} from './MonthCalendarModel';

export {
  buildMonthCalendarCells,
  dateFromMonthInput,
  formatApiDate,
  type MonthCalendarCell,
} from './MonthCalendarModel';

export type MonthCalendarMarkerKind = 'full' | 'partial' | 'booking';

export type MonthCalendarMarkers = Record<
  string,
  MonthCalendarMarkerKind | MonthCalendarMarkerKind[]
>;

export interface MonthCalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  disabledDates?: Set<string>;
  markers?: MonthCalendarMarkers;
  initialMonth?: string;
}

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const markerColors: Record<MonthCalendarMarkerKind, string> = {
  full: palette.red,
  partial: palette.amber,
  booking: palette.blue,
};

export function MonthCalendar({
  selectedDate,
  onSelectDate,
  minDate,
  maxDate,
  disabledDates,
  markers = {},
  initialMonth,
}: MonthCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() =>
    normalizeMonth(initialMonth ?? selectedDate ?? formatApiDate(new Date())),
  );
  const cells = useMemo(
    () =>
      buildMonthCalendarCells(visibleMonth, {
        minDate,
        maxDate,
        disabledDates,
      }),
    [disabledDates, maxDate, minDate, visibleMonth],
  );
  const visibleMonthDate = dateFromMonthInput(visibleMonth);

  return (
    <View>
      <View style={styles.monthHeader}>
        <Text style={styles.monthTitle}>
          {visibleMonthDate.toLocaleDateString('en-PH', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <View style={styles.monthActions}>
          <Pressable
            style={styles.iconButton}
            onPress={() => setVisibleMonth(addMonths(visibleMonth, -1))}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
          >
            <ChevronLeft color={palette.ink} size={18} />
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={() => setVisibleMonth(addMonths(visibleMonth, 1))}
            accessibilityRole="button"
            accessibilityLabel="Next month"
          >
            <ChevronRight color={palette.ink} size={18} />
          </Pressable>
        </View>
      </View>
      <View style={styles.calendarShell}>
        <View style={styles.weekHeader}>
          {weekdayLabels.map((day) => (
            <Text key={day} style={styles.weekday}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.monthGrid}>
          {cells.map((cell, index) => {
            if (!cell.date) {
              return <View key={`empty-${index}`} style={styles.emptyDayCell} />;
            }

            const isDisabled = cell.isDisabled;
            const date = cell.date;
            const isSelected = selectedDate === date;
            const cellMarkers = normalizeMarkers(markers[date]);

            return (
              <Pressable
                key={date}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  isDisabled && styles.dayCellDisabled,
                ]}
                onPress={() => onSelectDate(date)}
                disabled={isDisabled}
                accessibilityRole="button"
                accessibilityLabel={`Select ${date}`}
                accessibilityState={{ selected: isSelected, disabled: isDisabled }}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    isSelected && styles.dayNumberSelected,
                    isDisabled && styles.dayNumberDisabled,
                  ]}
                >
                  {Number(date.slice(-2))}
                </Text>
                <View style={styles.dotRow}>
                  {cellMarkers.map((marker) => (
                    <View
                      key={marker}
                      style={[
                        styles.markerDot,
                        { backgroundColor: markerColors[marker] },
                      ]}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function normalizeMonth(value: string): string {
  return value.slice(0, 7);
}

function addMonths(month: string, amount: number): string {
  const date = dateFromMonthInput(month);
  return formatApiDate(new Date(date.getFullYear(), date.getMonth() + amount, 1)).slice(
    0,
    7,
  );
}

function normalizeMarkers(
  marker: MonthCalendarMarkerKind | MonthCalendarMarkerKind[] | undefined,
): MonthCalendarMarkerKind[] {
  if (!marker) {
    return [];
  }

  return Array.isArray(marker) ? marker : [marker];
}

const styles = StyleSheet.create({
  monthHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  monthTitle: {
    ...type.section,
    color: palette.ink,
  },
  monthActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  calendarShell: {
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: spacing.sm,
  },
  weekHeader: {
    flexDirection: 'row',
  },
  weekday: {
    color: palette.faint,
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    alignItems: 'center',
    aspectRatio: 1,
    justifyContent: 'center',
    width: `${100 / 7}%`,
  },
  dayCellSelected: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.sm,
  },
  dayCellDisabled: {
    opacity: 0.45,
  },
  emptyDayCell: {
    aspectRatio: 1,
    width: `${100 / 7}%`,
  },
  dayNumber: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  dayNumberSelected: {
    color: palette.mintDeep,
  },
  dayNumberDisabled: {
    color: palette.faint,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 3,
    height: 8,
    marginTop: 4,
  },
  markerDot: {
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
});
