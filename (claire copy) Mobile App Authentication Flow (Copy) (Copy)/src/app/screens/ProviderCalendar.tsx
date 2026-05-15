import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Clock, X } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

type ViewMode = "month" | "week" | "day";

interface DayData {
  date: number;
  bookings?: number;
  blocked?: boolean;
  available?: boolean;
  isToday?: boolean;
  isOtherMonth?: boolean;
}

interface Booking {
  id: number;
  time: string;
  endTime: string;
  customerName: string;
  serviceType: string;
  status: "confirmed" | "pending";
}

export default function ProviderCalendar() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentMonth, setCurrentMonth] = useState(2); // March (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState<number | null>(13); // March 13, 2026

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Mock calendar data
  const calendarData: Record<number, DayData> = {
    13: { date: 13, bookings: 3, isToday: true },
    14: { date: 14, bookings: 2 },
    15: { date: 15, blocked: true },
    16: { date: 16, available: true },
    17: { date: 17, bookings: 1 },
    18: { date: 18, available: true },
    19: { date: 19, available: true },
    20: { date: 20, bookings: 4 },
    21: { date: 21, bookings: 2 },
    22: { date: 22, blocked: true },
    23: { date: 23, available: true },
    24: { date: 24, bookings: 1 },
  };

  // Mock bookings for selected date
  const bookingsForDate: Booking[] = selectedDate === 13 ? [
    {
      id: 1,
      time: "9:00 AM",
      endTime: "10:00 AM",
      customerName: "John Smith",
      serviceType: "Home Cleaning",
      status: "confirmed",
    },
    {
      id: 2,
      time: "11:30 AM",
      endTime: "12:30 PM",
      customerName: "Sarah Johnson",
      serviceType: "Plumbing",
      status: "confirmed",
    },
    {
      id: 3,
      time: "2:00 PM",
      endTime: "4:00 PM",
      customerName: "Mike Davis",
      serviceType: "Electrical Work",
      status: "pending",
    },
  ] : selectedDate === 14 ? [
    {
      id: 4,
      time: "10:00 AM",
      endTime: "11:00 AM",
      customerName: "Anna Reyes",
      serviceType: "Carpentry",
      status: "confirmed",
    },
    {
      id: 5,
      time: "3:00 PM",
      endTime: "5:00 PM",
      customerName: "Pedro Garcia",
      serviceType: "Painting",
      status: "confirmed",
    },
  ] : [];

  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"
  ];

  // Generate calendar grid
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: DayData[] = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        isOtherMonth: true,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(calendarData[i] || { date: i });
    }

    // Next month days to fill grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isOtherMonth: true,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(2); // March
    setCurrentYear(2026);
    setSelectedDate(13);
  };

  const isSlotBooked = (time: string) => {
    return bookingsForDate.find(b => b.time === time);
  };

  return (
    <div className="bg-[#F5F7FA] w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-[24px] py-[16px] flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-[32px] h-[32px] flex items-center justify-center transition-all active:scale-90"
        >
          <ArrowLeft className="w-[24px] h-[24px] text-[#111827]" />
        </button>
        <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
          Calendar
        </h1>
        <button
          onClick={goToToday}
          className="px-[12px] py-[6px] rounded-[8px] bg-[#56C490] font-['Nunito',sans-serif] text-[12px] text-white transition-all active:scale-95"
        >
          Today
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[24px]">
        {/* View Switcher */}
        <div className="px-[24px] pt-[20px] pb-[16px]">
          <div className="bg-[#F3F4F6] rounded-[12px] p-[4px] flex">
            <button
              onClick={() => setViewMode("month")}
              className={`flex-1 py-[8px] rounded-[8px] font-['Nunito',sans-serif] text-[13px] transition-all ${
                viewMode === "month"
                  ? "bg-white text-[#56C490] shadow-sm"
                  : "text-[#6B7280]"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`flex-1 py-[8px] rounded-[8px] font-['Nunito',sans-serif] text-[13px] transition-all ${
                viewMode === "week"
                  ? "bg-white text-[#56C490] shadow-sm"
                  : "text-[#6B7280]"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`flex-1 py-[8px] rounded-[8px] font-['Nunito',sans-serif] text-[13px] transition-all ${
                viewMode === "day"
                  ? "bg-white text-[#56C490] shadow-sm"
                  : "text-[#6B7280]"
              }`}
            >
              Day
            </button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="px-[24px] pb-[16px] flex items-center justify-between">
          <h2 className="font-['Nunito',sans-serif] text-[20px] text-[#111827]">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <div className="flex items-center gap-[12px]">
            <button
              onClick={goToPreviousMonth}
              className="w-[32px] h-[32px] rounded-full bg-white shadow-sm flex items-center justify-center transition-all active:scale-90"
            >
              <ChevronLeft className="w-[20px] h-[20px] text-[#6B7280]" />
            </button>
            <button
              onClick={goToNextMonth}
              className="w-[32px] h-[32px] rounded-full bg-white shadow-sm flex items-center justify-center transition-all active:scale-90"
            >
              <ChevronRight className="w-[20px] h-[20px] text-[#6B7280]" />
            </button>
          </div>
        </div>

        {viewMode === "month" && (
          <div className="px-[24px]">
            {/* Calendar */}
            <div className="bg-white rounded-[16px] shadow-sm p-[16px]">
              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-[8px] mb-[8px]">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center">
                    <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF]">
                      {day}
                    </p>
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-[4px]">
                {calendarDays.map((day, index) => {
                  const isSelected = selectedDate === day.date && !day.isOtherMonth;
                  const hasBookings = day.bookings && day.bookings > 0;
                  const isBlocked = day.blocked;
                  const isAvailable = day.available;

                  return (
                    <button
                      key={index}
                      onClick={() => !day.isOtherMonth && setSelectedDate(day.date)}
                      disabled={day.isOtherMonth}
                      className={`aspect-square rounded-[8px] flex flex-col items-center justify-center transition-all ${
                        day.isOtherMonth
                          ? "opacity-30 cursor-not-allowed"
                          : "active:scale-95"
                      } ${
                        isSelected
                          ? "bg-[#56C490]/10 border-2 border-[#56C490]"
                          : day.isToday
                          ? "bg-[#FFF4E6] border border-[#FFA500]"
                          : "border border-transparent hover:bg-[#F9FAFB]"
                      }`}
                    >
                      <p
                        className={`font-['Nunito',sans-serif] text-[13px] ${
                          isSelected
                            ? "text-[#56C490]"
                            : day.isToday
                            ? "text-[#FFA500]"
                            : day.isOtherMonth
                            ? "text-[#D1D5DB]"
                            : "text-[#111827]"
                        }`}
                      >
                        {day.date}
                      </p>
                      {/* Indicators */}
                      {!day.isOtherMonth && (
                        <div className="flex gap-[2px] mt-[2px]">
                          {hasBookings && (
                            <div className="w-[4px] h-[4px] rounded-full bg-[#2196F3]" />
                          )}
                          {isBlocked && (
                            <div className="w-[4px] h-[4px] rounded-full bg-[#D32F2F]" />
                          )}
                          {isAvailable && !hasBookings && !isBlocked && (
                            <div className="w-[4px] h-[4px] rounded-full bg-[#56C490]" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-[16px] pt-[16px] border-t border-[#E5E7EB] flex items-center justify-center gap-[16px]">
                <div className="flex items-center gap-[6px]">
                  <div className="w-[8px] h-[8px] rounded-full bg-[#2196F3]" />
                  <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280]">
                    Bookings
                  </p>
                </div>
                <div className="flex items-center gap-[6px]">
                  <div className="w-[8px] h-[8px] rounded-full bg-[#D32F2F]" />
                  <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280]">
                    Blocked
                  </p>
                </div>
                <div className="flex items-center gap-[6px]">
                  <div className="w-[8px] h-[8px] rounded-full bg-[#56C490]" />
                  <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280]">
                    Available
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Day View Panel */}
        {selectedDate && viewMode === "month" && (
          <div className="px-[24px] mt-[20px]">
            <div className="bg-white rounded-[16px] shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-[20px] py-[16px] bg-[#56C490] flex items-center justify-between">
                <div>
                  <p className="font-['Nunito',sans-serif] text-[12px] text-white/80">
                    {monthNames[currentMonth]} {selectedDate}, {currentYear}
                  </p>
                  <h3 className="font-['Nunito',sans-serif] text-[18px] text-white">
                    {bookingsForDate.length} Booking{bookingsForDate.length !== 1 ? "s" : ""}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="w-[32px] h-[32px] rounded-full bg-white/20 flex items-center justify-center transition-all active:scale-90"
                >
                  <X className="w-[18px] h-[18px] text-white" />
                </button>
              </div>

              {/* Time Slots */}
              <div className="p-[20px] max-h-[400px] overflow-y-auto">
                <div className="space-y-[12px]">
                  {timeSlots.map((time) => {
                    const booking = isSlotBooked(time);

                    if (booking) {
                      return (
                        <div
                          key={time}
                          className="bg-[#2196F3]/10 border-l-4 border-[#2196F3] rounded-r-[8px] p-[12px]"
                        >
                          <div className="flex items-start justify-between mb-[4px]">
                            <p className="font-['Nunito',sans-serif] text-[13px] text-[#2196F3]">
                              {booking.time} - {booking.endTime}
                            </p>
                            <span
                              className={`px-[8px] py-[2px] rounded-[4px] font-['Nunito',sans-serif] text-[10px] ${
                                booking.status === "confirmed"
                                  ? "bg-[#56C490]/20 text-[#56C490]"
                                  : "bg-[#FFA500]/20 text-[#FFA500]"
                              }`}
                            >
                              {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                            </span>
                          </div>
                          <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[2px]">
                            {booking.customerName}
                          </p>
                          <p className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
                            {booking.serviceType}
                          </p>
                        </div>
                      );
                    } else {
                      return (
                        <button
                          key={time}
                          className="w-full bg-[#F9FAFB] border border-dashed border-[#D1D5DB] rounded-[8px] p-[12px] flex items-center gap-[12px] transition-all active:scale-95 hover:bg-[#F3F4F6]"
                        >
                          <div className="w-[32px] h-[32px] rounded-full bg-white flex items-center justify-center">
                            <Plus className="w-[16px] h-[16px] text-[#6B7280]" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280]">
                              {time} - Available
                            </p>
                          </div>
                        </button>
                      );
                    }
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-[20px] py-[16px] border-t border-[#E5E7EB] space-y-[8px]">
                <button className="w-full h-[44px] bg-white border-2 border-[#D32F2F] rounded-[10px] font-['Nunito',sans-serif] text-[14px] text-[#D32F2F] transition-all active:scale-95">
                  Block This Day
                </button>
                <button className="w-full h-[44px] bg-white border-2 border-[#56C490] rounded-[10px] font-['Nunito',sans-serif] text-[14px] text-[#56C490] transition-all active:scale-95">
                  Set Working Hours
                </button>
                <button className="w-full h-[44px] bg-white border-2 border-[#9CA3AF] rounded-[10px] font-['Nunito',sans-serif] text-[14px] text-[#6B7280] transition-all active:scale-95">
                  Add Personal Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-[#F5F7FA] relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}
