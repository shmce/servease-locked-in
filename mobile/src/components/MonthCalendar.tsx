import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { palette, radius, spacing, type } from '../theme/serveaseDesign';
import {
  buildMonthCalendarCells,
  buildMonthCalendarRows,
  dateFromMonthInput,
  formatApiDate,
} from './MonthCalendarModel';

export {
  buildMonthCalendarCells,
  buildMonthCalendarRows,
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
  showMonthYearPicker?: boolean;
}

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

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
  showMonthYearPicker = false,
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
  const rows = useMemo(() => buildMonthCalendarRows(cells), [cells]);
  const visibleMonthDate = dateFromMonthInput(visibleMonth);
  const visibleYear = visibleMonthDate.getFullYear();
  const visibleMonthNumber = visibleMonthDate.getMonth() + 1;

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
      {showMonthYearPicker ? (
        <View style={styles.jumpPanel}>
          <View style={styles.yearJumpRow}>
            <Pressable
              style={styles.yearJumpButton}
              onPress={() => setVisibleMonth(addYears(visibleMonth, -10, minDate, maxDate))}
              accessibilityRole="button"
              accessibilityLabel="Go back 10 years"
            >
              <Text style={styles.yearJumpText}>-10y</Text>
            </Pressable>
            <Pressable
              style={styles.yearJumpButton}
              onPress={() => setVisibleMonth(addYears(visibleMonth, -1, minDate, maxDate))}
              accessibilityRole="button"
              accessibilityLabel="Go back 1 year"
            >
              <Text style={styles.yearJumpText}>-1y</Text>
            </Pressable>
            <View style={styles.yearLabelWrap}>
              <Text style={styles.yearLabel}>{visibleYear}</Text>
            </View>
            <Pressable
              style={styles.yearJumpButton}
              onPress={() => setVisibleMonth(addYears(visibleMonth, 1, minDate, maxDate))}
              accessibilityRole="button"
              accessibilityLabel="Go forward 1 year"
            >
              <Text style={styles.yearJumpText}>+1y</Text>
            </Pressable>
            <Pressable
              style={styles.yearJumpButton}
              onPress={() => setVisibleMonth(addYears(visibleMonth, 10, minDate, maxDate))}
              accessibilityRole="button"
              accessibilityLabel="Go forward 10 years"
            >
              <Text style={styles.yearJumpText}>+10y</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthPickerRow}
          >
            {monthLabels.map((label, index) => {
              const monthNumber = index + 1;
              const month = formatMonth(visibleYear, monthNumber);
              const isSelectedMonth = visibleMonthNumber === monthNumber;
              const isDisabled = isMonthOutOfRange(month, minDate, maxDate);

              return (
                <Pressable
                  key={label}
                  style={[
                    styles.monthPickerButton,
                    isSelectedMonth && styles.monthPickerButtonSelected,
                    isDisabled && styles.monthPickerButtonDisabled,
                  ]}
                  onPress={() => setVisibleMonth(month)}
                  disabled={isDisabled}
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${label} ${visibleYear}`}
                  accessibilityState={{ selected: isSelectedMonth, disabled: isDisabled }}
                >
                  <Text
                    style={[
                      styles.monthPickerText,
                      isSelectedMonth && styles.monthPickerTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
      <View style={styles.calendarShell}>
        <View style={styles.weekHeader}>
          {weekdayLabels.map((day) => (
            <Text key={day} style={styles.weekday}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.monthGrid}>
          {rows.map((row, rowIndex) => (
            <View key={`week-${rowIndex}`} style={styles.weekRow}>
              {row.map((cell, columnIndex) => {
                if (!cell.date) {
                  return (
                    <View
                      key={`empty-${rowIndex}-${columnIndex}`}
                      style={styles.emptyDayCell}
                    />
                  );
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
          ))}
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

function addYears(
  month: string,
  amount: number,
  minDate?: string,
  maxDate?: string,
): string {
  const date = dateFromMonthInput(month);
  const nextMonth = formatMonth(date.getFullYear() + amount, date.getMonth() + 1);
  return clampMonth(nextMonth, minDate, maxDate);
}

function formatMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function clampMonth(month: string, minDate?: string, maxDate?: string): string {
  const minMonth = minDate?.slice(0, 7);
  const maxMonth = maxDate?.slice(0, 7);

  if (minMonth && month < minMonth) {
    return minMonth;
  }

  if (maxMonth && month > maxMonth) {
    return maxMonth;
  }

  return month;
}

function isMonthOutOfRange(month: string, minDate?: string, maxDate?: string): boolean {
  return Boolean(
    (minDate && month < minDate.slice(0, 7)) ||
      (maxDate && month > maxDate.slice(0, 7)),
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
    fontWeight: '700',
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
  jumpPanel: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  yearJumpRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  yearJumpButton: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.lineSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  yearJumpText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  yearLabelWrap: {
    alignItems: 'center',
    flex: 1.2,
    justifyContent: 'center',
    minHeight: 36,
  },
  yearLabel: {
    color: palette.mintDeep,
    fontSize: 16,
    fontWeight: '900',
  },
  monthPickerRow: {
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  monthPickerButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    minHeight: 34,
    minWidth: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  monthPickerButtonSelected: {
    backgroundColor: palette.mintSoft,
    borderColor: palette.mint,
  },
  monthPickerButtonDisabled: {
    opacity: 0.4,
  },
  monthPickerText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  monthPickerTextSelected: {
    color: palette.mintDeep,
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
    fontWeight: '700',
    textAlign: 'center',
  },
  monthGrid: {
    gap: 0,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    alignItems: 'center',
    aspectRatio: 1,
    flex: 1,
    justifyContent: 'center',
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
    flex: 1,
  },
  dayNumber: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
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
