import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, X } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  hasBreak: boolean;
}

interface TimeOffDate {
  date: string;
  reason: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ProviderSetAvailability() {
  const navigate = useNavigate();
  const [copyToAll, setCopyToAll] = useState(false);
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({
    Monday: { enabled: true, startTime: "08:00", endTime: "17:00", breakStart: "", breakEnd: "", hasBreak: false },
    Tuesday: { enabled: true, startTime: "08:00", endTime: "17:00", breakStart: "", breakEnd: "", hasBreak: false },
    Wednesday: { enabled: true, startTime: "08:00", endTime: "17:00", breakStart: "", breakEnd: "", hasBreak: false },
    Thursday: { enabled: true, startTime: "08:00", endTime: "17:00", breakStart: "", breakEnd: "", hasBreak: false },
    Friday: { enabled: true, startTime: "08:00", endTime: "17:00", breakStart: "", breakEnd: "", hasBreak: false },
    Saturday: { enabled: false, startTime: "08:00", endTime: "17:00", breakStart: "", breakEnd: "", hasBreak: false },
    Sunday: { enabled: false, startTime: "08:00", endTime: "17:00", breakStart: "", breakEnd: "", hasBreak: false },
  });

  const [timeOffDates, setTimeOffDates] = useState<TimeOffDate[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [timeOffReason, setTimeOffReason] = useState("");

  const toggleDay = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], enabled: !schedule[day].enabled },
    });
  };

  const updateTime = (day: string, field: keyof DaySchedule, value: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], [field]: value },
    });
  };

  const toggleBreak = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], hasBreak: !schedule[day].hasBreak },
    });
  };

  const handleCopyToAll = () => {
    if (!copyToAll) {
      const mondaySchedule = schedule.Monday;
      const newSchedule = { ...schedule };
      DAYS.forEach((day) => {
        if (day !== "Monday") {
          newSchedule[day] = { ...mondaySchedule };
        }
      });
      setSchedule(newSchedule);
    }
    setCopyToAll(!copyToAll);
  };

  const addTimeOff = () => {
    if (selectedDate) {
      setTimeOffDates([...timeOffDates, { date: selectedDate, reason: timeOffReason }]);
      setSelectedDate("");
      setTimeOffReason("");
    }
  };

  const removeTimeOff = (index: number) => {
    setTimeOffDates(timeOffDates.filter((_, i) => i !== index));
  };

  const formatTime = (time24: string): string => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleSave = () => {
    // Save logic here
    navigate(-1);
  };

  return (
    <div className="bg-[#F5F7FA] w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] pt-[16px] pb-[16px] flex items-center gap-[16px] border-b border-[#E5E7EB] flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all active:scale-90"
        >
          <ArrowLeft className="w-[24px] h-[24px] text-[#111827]" />
        </button>
        <h1 className="font-['Inter',sans-serif] font-semibold text-[18px] text-[#111827]">
          Work Availability
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[140px]">
        <div className="px-[24px] pt-[24px]">
          {/* Weekly Schedule Section */}
          <div className="mb-[32px]">
            <h2 className="font-['Inter',sans-serif] font-semibold text-[16px] text-[#111827] mb-[16px]">
              Weekly Schedule
            </h2>

            <div className="space-y-[12px]">
              {DAYS.map((day, index) => (
                <div key={day}>
                  <div className="bg-white rounded-[12px] p-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                    {/* Day Header */}
                    <div className="flex items-center justify-between mb-[12px]">
                      <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[#111827]">
                        {day}
                      </span>
                      <button
                        onClick={() => toggleDay(day)}
                        className={`relative w-[48px] h-[24px] rounded-[12px] transition-all ${
                          schedule[day].enabled ? "bg-[#56C490]" : "bg-[#E5E7EB]"
                        }`}
                      >
                        <div
                          className={`absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white transition-all ${
                            schedule[day].enabled ? "right-[2px]" : "left-[2px]"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Time Pickers */}
                    {schedule[day].enabled && (
                      <div className="space-y-[12px]">
                        <div className="flex items-center gap-[12px]">
                          <div className="flex-1">
                            <label className="block font-['Inter',sans-serif] text-[12px] text-[#6B7280] mb-[6px]">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={schedule[day].startTime}
                              onChange={(e) => updateTime(day, "startTime", e.target.value)}
                              className="w-full px-[12px] py-[10px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] font-['Inter',sans-serif] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] focus:ring-1 focus:ring-[#56C490]"
                            />
                            <p className="mt-[4px] font-['Inter',sans-serif] text-[11px] text-[#9CA3AF]">
                              {formatTime(schedule[day].startTime)}
                            </p>
                          </div>

                          <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280] mt-[20px]">
                            to
                          </span>

                          <div className="flex-1">
                            <label className="block font-['Inter',sans-serif] text-[12px] text-[#6B7280] mb-[6px]">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={schedule[day].endTime}
                              onChange={(e) => updateTime(day, "endTime", e.target.value)}
                              className="w-full px-[12px] py-[10px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] font-['Inter',sans-serif] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] focus:ring-1 focus:ring-[#56C490]"
                            />
                            <p className="mt-[4px] font-['Inter',sans-serif] text-[11px] text-[#9CA3AF]">
                              {formatTime(schedule[day].endTime)}
                            </p>
                          </div>
                        </div>

                        {/* Break Time */}
                        {!schedule[day].hasBreak ? (
                          <button
                            onClick={() => toggleBreak(day)}
                            className="font-['Inter',sans-serif] text-[13px] text-[#56C490] font-medium hover:underline"
                          >
                            + Add a Break
                          </button>
                        ) : (
                          <div className="bg-[#F9FAFB] p-[12px] rounded-[8px]">
                            <div className="flex items-center justify-between mb-[8px]">
                              <span className="font-['Inter',sans-serif] text-[12px] font-medium text-[#6B7280]">
                                Break Time
                              </span>
                              <button
                                onClick={() => toggleBreak(day)}
                                className="text-[#EF4444] hover:text-[#DC2626]"
                              >
                                <X className="w-[16px] h-[16px]" />
                              </button>
                            </div>
                            <div className="flex items-center gap-[8px]">
                              <input
                                type="time"
                                value={schedule[day].breakStart}
                                onChange={(e) => updateTime(day, "breakStart", e.target.value)}
                                className="flex-1 px-[10px] py-[8px] bg-white border border-[#E5E7EB] rounded-[6px] font-['Inter',sans-serif] text-[13px] text-[#111827] focus:outline-none focus:border-[#56C490]"
                              />
                              <span className="text-[12px] text-[#6B7280]">to</span>
                              <input
                                type="time"
                                value={schedule[day].breakEnd}
                                onChange={(e) => updateTime(day, "breakEnd", e.target.value)}
                                className="flex-1 px-[10px] py-[8px] bg-white border border-[#E5E7EB] rounded-[6px] font-['Inter',sans-serif] text-[13px] text-[#111827] focus:outline-none focus:border-[#56C490]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Copy to All Days - Show after Monday */}
                  {index === 0 && (
                    <div className="mt-[12px] mb-[4px]">
                      <label className="flex items-center gap-[10px] cursor-pointer py-[6px]">
                        <div
                          onClick={handleCopyToAll}
                          className={`w-[20px] h-[20px] rounded-[5px] border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                            copyToAll
                              ? "bg-[#56C490] border-[#56C490]"
                              : "bg-white border-[#D1D5DB]"
                          }`}
                        >
                          {copyToAll && (
                            <svg className="w-[12px] h-[12px] text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="2 6 5 9 10 3" />
                            </svg>
                          )}
                        </div>
                        <span className="font-['Inter',sans-serif] text-[13px] text-[#374151]">
                          Copy Monday's schedule to all days
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Time Off & Recurring Breaks */}
          <div className="mb-[24px]">
            <h2 className="font-['Inter',sans-serif] font-semibold text-[16px] text-[#111827] mb-[16px]">
              Recurring Days Off
            </h2>

            <div className="bg-white rounded-[12px] p-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] mb-[12px]">
              <div className="space-y-[12px]">
                <div>
                  <label className="block font-['Inter',sans-serif] text-[12px] text-[#6B7280] mb-[6px]">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-[12px] py-[10px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] font-['Inter',sans-serif] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] focus:ring-1 focus:ring-[#56C490]"
                  />
                </div>

                <div>
                  <label className="block font-['Inter',sans-serif] text-[12px] text-[#6B7280] mb-[6px]">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={timeOffReason}
                    onChange={(e) => setTimeOffReason(e.target.value)}
                    placeholder="e.g., Public Holiday, Vacation"
                    className="w-full px-[12px] py-[10px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] font-['Inter',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-1 focus:ring-[#56C490]"
                  />
                </div>

                <button
                  onClick={addTimeOff}
                  disabled={!selectedDate}
                  className="w-full h-[40px] bg-[#F3F4F6] hover:bg-[#E5E7EB] disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] rounded-[8px] font-['Inter',sans-serif] text-[14px] font-medium text-[#374151] transition-all flex items-center justify-center gap-[6px]"
                >
                  <Plus className="w-[16px] h-[16px]" />
                  Add Day Off
                </button>
              </div>
            </div>

            {/* List of Time Off Dates */}
            {timeOffDates.length > 0 && (
              <div className="space-y-[8px]">
                {timeOffDates.map((timeOff, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-[12px] p-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-between"
                  >
                    <div>
                      <p className="font-['Inter',sans-serif] text-[14px] font-medium text-[#111827]">
                        {new Date(timeOff.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      {timeOff.reason && (
                        <p className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] mt-[2px]">
                          {timeOff.reason}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeTimeOff(index)}
                      className="w-[32px] h-[32px] rounded-[8px] bg-[#FEE2E2] hover:bg-[#FECACA] flex items-center justify-center transition-all"
                    >
                      <X className="w-[16px] h-[16px] text-[#EF4444]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-[24px] pt-[12px] pb-[8px] z-10" style={{ boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.05)" }}>
        <button
          onClick={handleSave}
          className="w-full py-[18px] bg-[#56C490] rounded-[50px] font-['Inter',sans-serif] text-[16px] font-semibold text-white shadow-[0_4px_16px_rgba(86,196,144,0.25)] transition-all active:scale-[0.97]"
        >
          Save Changes
        </button>
        {/* Home Indicator */}
        <div className="h-[34px] relative">
          <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
        </div>
      </div>
    </div>
  );
}