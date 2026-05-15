import { useState, useMemo, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface MiniCalendarProps {
  selectedDate: Date | null;
  onSet: (date: Date) => void;
  onCancel: () => void;
  maxDate?: Date;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function MiniCalendar({ selectedDate, onSet, onCancel, maxDate }: MiniCalendarProps) {
  const today = new Date();
  const initialDate = selectedDate || today;
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [pickedDate, setPickedDate] = useState<Date | null>(selectedDate);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const yearListRef = useRef<HTMLDivElement>(null);

  // Generate year list (100 years back)
  const maxYear = maxDate ? maxDate.getFullYear() : today.getFullYear();
  const yearList = useMemo(() => {
    const years: number[] = [];
    for (let y = maxYear; y >= maxYear - 100; y--) {
      years.push(y);
    }
    return years;
  }, [maxYear]);

  // Scroll to selected year when year picker opens
  useEffect(() => {
    if (showYearPicker && yearListRef.current) {
      const idx = yearList.indexOf(viewYear);
      if (idx >= 0) {
        const rowHeight = 40;
        const containerHeight = yearListRef.current.clientHeight;
        yearListRef.current.scrollTop = idx * rowHeight - containerHeight / 2 + rowHeight / 2;
      }
    }
  }, [showYearPicker, viewYear, yearList]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({ day: d, month: m, year: y, isCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true });
    }

    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({ day: d, month: m, year: y, isCurrentMonth: false });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isSelected = (day: number, month: number, year: number) => {
    if (!pickedDate) return false;
    return (
      pickedDate.getDate() === day &&
      pickedDate.getMonth() === month &&
      pickedDate.getFullYear() === year
    );
  };

  const isFutureDate = (day: number, month: number, year: number) => {
    if (!maxDate) return false;
    const cellDate = new Date(year, month, day);
    cellDate.setHours(0, 0, 0, 0);
    const max = new Date(maxDate);
    max.setHours(0, 0, 0, 0);
    return cellDate > max;
  };

  const isToday = (day: number, month: number, year: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const handleDayTap = (day: number, month: number, year: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    if (isFutureDate(day, month, year)) return;
    setPickedDate(new Date(year, month, day));
  };

  const handleSet = () => {
    if (pickedDate) {
      onSet(pickedDate);
    }
  };

  const handleYearSelect = (year: number) => {
    setViewYear(year);
    if (maxDate && year === maxDate.getFullYear() && viewMonth > maxDate.getMonth()) {
      setViewMonth(maxDate.getMonth());
    }
    setShowYearPicker(false);
  };

  const isNextMonthDisabled = maxDate
    ? viewYear > maxDate.getFullYear() ||
      (viewYear === maxDate.getFullYear() && viewMonth >= maxDate.getMonth())
    : false;

  return (
    <>
      {/* Invisible backdrop to catch outside taps */}
      <div
        className="fixed inset-0 z-[50]"
        onClick={onCancel}
      />

      {/* Compact inline calendar overlay */}
      <div
        className="absolute left-0 right-0 top-full mt-[6px] z-[51] bg-white rounded-[16px]"
        style={{
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06)",
          maxWidth: 320,
        }}
      >
        {/* Header — Month/Year Navigation */}
        <div className="flex items-center justify-between px-[12px] pt-[12px] pb-[6px]">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-full transition-all active:scale-90 active:bg-[#f5f5f5]"
          >
            <ChevronLeft className="w-[18px] h-[18px] text-[#374151]" />
          </button>

          <div className="flex items-center gap-[3px]">
            <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
              {MONTH_NAMES[viewMonth]}
            </span>
            <button
              type="button"
              onClick={() => setShowYearPicker(!showYearPicker)}
              className="flex items-center gap-[1px] px-[6px] py-[2px] rounded-[6px] transition-all active:bg-[#f5f5f5]"
            >
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
                {viewYear}
              </span>
              <ChevronDown
                className={`w-[14px] h-[14px] text-[#56C490] transition-transform duration-200 ${
                  showYearPicker ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={goToNextMonth}
            disabled={isNextMonthDisabled}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-full transition-all active:scale-90 active:bg-[#f5f5f5] disabled:opacity-30 disabled:active:scale-100"
          >
            <ChevronRight className="w-[18px] h-[18px] text-[#374151]" />
          </button>
        </div>

        {/* Year Picker (replaces calendar grid when open) */}
        {showYearPicker && (
          <div className="px-[10px] pb-[6px]">
            <div
              ref={yearListRef}
              className="max-h-[200px] overflow-y-auto rounded-[10px] border border-[#E5E7EB] bg-[#FAFAFA]"
            >
              {yearList.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleYearSelect(year)}
                  className={`w-full px-[12px] font-['Nunito',sans-serif] text-[13px] text-center transition-all ${
                    year === viewYear
                      ? "bg-[#56C490]/10 text-[#56C490] font-['Nunito',sans-serif]"
                      : "text-[#374151] active:bg-[#f0f0f0]"
                  }`}
                  style={{ height: 40 }}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        {!showYearPicker && (
          <>
            {/* Day Labels */}
            <div className="grid grid-cols-7 px-[6px]">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={`label-${i}`}
                  className="flex items-center justify-center h-[28px]"
                >
                  <span className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF]">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-7 px-[6px] pb-[4px]">
              {calendarDays.map((cell, i) => {
                const selected = isSelected(cell.day, cell.month, cell.year);
                const future = cell.isCurrentMonth && isFutureDate(cell.day, cell.month, cell.year);
                const todayCell = isToday(cell.day, cell.month, cell.year) && cell.isCurrentMonth;
                const notCurrentMonth = !cell.isCurrentMonth;

                return (
                  <div key={`day-${i}`} className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleDayTap(cell.day, cell.month, cell.year, cell.isCurrentMonth)}
                      disabled={notCurrentMonth || future}
                      className={`flex items-center justify-center rounded-full transition-all ${
                        selected
                          ? "bg-[#56C490]"
                          : todayCell && !selected
                          ? "border-[1.5px] border-[#56C490]/30"
                          : ""
                      } ${notCurrentMonth ? "invisible" : ""} ${
                        future ? "opacity-25 cursor-not-allowed" : "active:scale-90"
                      }`}
                      style={{ width: 36, height: 36 }}
                    >
                      <span
                        className={`font-['Nunito',sans-serif] text-[13px] ${
                          selected
                            ? "text-white font-['Nunito',sans-serif]"
                            : future
                            ? "text-[#D1D5DB]"
                            : "text-[#111827]"
                        }`}
                      >
                        {cell.day}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Compact Footer Actions */}
        <div className="flex items-center justify-between px-[14px] pt-[6px] pb-[12px] border-t border-[#F3F4F6]">
          <button
            type="button"
            onClick={onCancel}
            className="px-[14px] py-[8px] font-['Nunito',sans-serif] text-[13px] text-[#6B7280] transition-all active:scale-95 rounded-[8px] active:bg-[#f5f5f5]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSet}
            disabled={!pickedDate}
            className="px-[14px] py-[8px] font-['Nunito',sans-serif] text-[13px] text-[#56C490] transition-all active:scale-95 rounded-[8px] active:bg-[#56C490]/5 disabled:opacity-40"
          >
            Set Date
          </button>
        </div>
      </div>
    </>
  );
}
