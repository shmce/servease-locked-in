export interface MonthCalendarCell {
  date: string | null;
  isDisabled: boolean;
}

export function buildMonthCalendarCells(
  month: string,
  options: {
    minDate?: string;
    maxDate?: string;
    disabledDates?: Set<string>;
  } = {},
): MonthCalendarCell[] {
  const monthDate = dateFromMonthInput(month);
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate();
  const cells: MonthCalendarCell[] = Array.from(
    { length: firstDay.getDay() },
    () => ({ date: null, isDisabled: true }),
  );

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = formatApiDate(
      new Date(monthDate.getFullYear(), monthDate.getMonth(), day),
    );
    cells.push({
      date,
      isDisabled:
        Boolean(options.minDate && date < options.minDate) ||
        Boolean(options.maxDate && date > options.maxDate) ||
        Boolean(options.disabledDates?.has(date)),
    });
  }

  return cells;
}

export function formatApiDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function dateFromMonthInput(value: string): Date {
  const [rawYear, rawMonth] = value.slice(0, 7).split('-');
  const year = Number(rawYear);
  const month = Number(rawMonth);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  }

  return new Date(year, month - 1, 1);
}
