import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

type TimeSlot = "morning" | "afternoon" | "evening";

export default function ChangeBookingDateTime() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [currentMonth] = useState("March 2026");

  // Current booking details
  const currentBooking = {
    date: "March 15, 2026",
    time: "10:00 AM",
  };

  // Mock calendar data for March 2026
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const startDay = 5; // March 1, 2026 starts on Saturday (0=Sun, 6=Sat)
  const emptyDays = Array.from({ length: startDay }, (_, i) => i);

  // Available dates (mock data - in real app would come from API)
  const availableDates = [15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 29, 30, 31];

  const timeSlots = [
    { id: "morning" as TimeSlot, label: "Morning 9–11 AM" },
    { id: "afternoon" as TimeSlot, label: "Afternoon 12–3 PM" },
    { id: "evening" as TimeSlot, label: "Evening 4–6 PM" },
  ];

  const handleRequestChange = () => {
    // In a real app, this would submit the change request to the API
    navigate(`/customer/project/${id}`);
  };

  const isDateAvailable = (day: number) => availableDates.includes(day);
  const isDateSelected = (day: number) => selectedDate === day;

  return (
    <MobileContainer>
      <div className="h-full bg-white flex flex-col">
        {/* Status Bar */}
        <div className="bg-white flex-shrink-0">
          <StatusBar />
        </div>

        {/* Header */}
        <div className="bg-white px-[24px] py-[16px] flex items-center gap-[16px] flex-shrink-0 border-b border-[#F2F2F2]">
          <button onClick={() => navigate(-1)} className="active:scale-90 transition-transform">
            <ArrowLeft className="w-[24px] h-[24px] text-[#111827]" />
          </button>
          <h1 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#111827]">
            Change booking date or time
          </h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-[180px]">
          <div className="px-[24px] py-[20px] space-y-[24px]">
            {/* Current Booking Details */}
            <div className="bg-[#F5F5F5] rounded-[12px] p-[16px]">
              <h2 className="font-['Poppins',sans-serif] font-semibold text-[14px] text-[#111827] mb-[12px]">
                Current booking
              </h2>
              <div className="space-y-[8px]">
                <div className="flex justify-between">
                  <span className="font-['Poppins',sans-serif] text-[14px] text-[#666]">
                    Current date:
                  </span>
                  <span className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#111827]">
                    {currentBooking.date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-['Poppins',sans-serif] text-[14px] text-[#666]">
                    Current time:
                  </span>
                  <span className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#111827]">
                    {currentBooking.time}
                  </span>
                </div>
              </div>
            </div>

            {/* Select New Date */}
            <div>
              <h2 className="font-['Poppins',sans-serif] font-semibold text-[14px] text-[#111827] mb-[16px]">
                Select new date
              </h2>

              {/* Month Header */}
              <div className="flex items-center justify-between mb-[16px]">
                <button className="p-[8px] active:scale-90 transition-transform">
                  <ChevronLeft className="w-[20px] h-[20px] text-[#6B7280]" />
                </button>
                <span className="font-['Poppins',sans-serif] font-semibold text-[16px] text-[#111827]">
                  {currentMonth}
                </span>
                <button className="p-[8px] active:scale-90 transition-transform">
                  <ChevronRight className="w-[20px] h-[20px] text-[#6B7280]" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-[16px]">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-[8px] mb-[12px]">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div
                      key={day}
                      className="text-center font-['Poppins',sans-serif] font-medium text-[12px] text-[#777]"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-[8px]">
                  {emptyDays.map((_, index) => (
                    <div key={`empty-${index}`} />
                  ))}
                  {daysInMonth.map((day) => {
                    const available = isDateAvailable(day);
                    const selected = isDateSelected(day);

                    return (
                      <button
                        key={day}
                        onClick={() => available && setSelectedDate(day)}
                        disabled={!available}
                        className={`aspect-square rounded-[8px] flex items-center justify-center font-['Poppins',sans-serif] text-[14px] transition-all ${
                          selected
                            ? "bg-[#56C490] text-white font-semibold"
                            : available
                            ? "bg-white text-[#111827] border border-[#E5E5E5] hover:border-[#56C490] active:scale-95"
                            : "bg-[#E5E5E5] text-[#9CA3AF] cursor-not-allowed"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Select New Time */}
            <div>
              <h2 className="font-['Poppins',sans-serif] font-semibold text-[14px] text-[#111827] mb-[16px]">
                Select new time
              </h2>
              <div className="space-y-[12px]">
                {timeSlots.map((slot) => {
                  const selected = selectedTimeSlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedTimeSlot(slot.id)}
                      className={`w-full py-[14px] rounded-[50px] font-['Poppins',sans-serif] font-semibold text-[14px] transition-all ${
                        selected
                          ? "bg-[#56C490] text-white"
                          : "border-2 border-[#E5E5E5] text-[#111827] active:scale-[0.98]"
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-[#F9FAFB] rounded-[8px] p-[12px]">
              <p className="font-['Poppins',sans-serif] text-[12px] text-[#6B7280] text-center">
                Provider must approve date/time changes
              </p>
            </div>

            {/* Request Change Button */}
            <button
              onClick={handleRequestChange}
              disabled={!selectedDate || !selectedTimeSlot}
              className="w-full py-[16px] rounded-[50px] bg-[#56C490] font-['Poppins',sans-serif] font-bold text-[16px] text-white active:scale-[0.97] transition-transform shadow-[0_4px_16px_rgba(86,196,144,0.25)] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:shadow-none"
            >
              Request Change
            </button>

            {/* Cancel Link */}
            <button
              onClick={() => navigate(-1)}
              className="w-full text-center font-['Poppins',sans-serif] font-medium text-[14px] text-[#777] active:opacity-60 transition-opacity"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </MobileContainer>
  );
}
