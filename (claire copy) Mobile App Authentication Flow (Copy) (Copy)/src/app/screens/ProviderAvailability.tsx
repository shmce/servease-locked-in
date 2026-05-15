import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { StickyFooterButton } from "../components/StickyFooterButton";
import { Checkbox } from "../components/ui/checkbox";

interface DaySchedule {
  day: string;
  startTime: string;
  endTime: string;
  unavailable: boolean;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TIME_OPTIONS = [
  "12:00 AM", "12:30 AM", "01:00 AM", "01:30 AM", "02:00 AM", "02:30 AM",
  "03:00 AM", "03:30 AM", "04:00 AM", "04:30 AM", "05:00 AM", "05:30 AM",
  "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM",
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM",
  "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM",
];

export default function ProviderAvailability() {
  const navigate = useNavigate();
  
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS.map((day) => ({
      day,
      startTime: "09:00 AM",
      endTime: "05:00 PM",
      unavailable: false,
    }))
  );

  const [breakStart, setBreakStart] = useState("12:00 PM");
  const [breakEnd, setBreakEnd] = useState("01:00 PM");
  const [recurringDaysOff, setRecurringDaysOff] = useState("");
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState("5");
  const [advanceBookingDays, setAdvanceBookingDays] = useState("7");
  const [lastEditedDay, setLastEditedDay] = useState<string | null>(null);

  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});

  const handleDayChange = (index: number, field: keyof DaySchedule, value: any) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
    setSchedule(updatedSchedule);
    setLastEditedDay(updatedSchedule[index].day);
  };

  const toggleDropdown = (key: string) => {
    setOpenDropdowns({ ...openDropdowns, [key]: !openDropdowns[key] });
  };

  const copyToAllDays = () => {
    // Find the day to copy from based on last edited day
    const dayToCopy = lastEditedDay
      ? schedule.find((day) => day.day === lastEditedDay)
      : schedule[0];
    
    if (!dayToCopy) return;

    const updatedSchedule = schedule.map((day) => ({
      ...day,
      startTime: dayToCopy.startTime,
      endTime: dayToCopy.endTime,
      unavailable: dayToCopy.unavailable,
    }));
    setSchedule(updatedSchedule);
  };

  const handleContinue = () => {
    // Navigate to provider tutorial
    navigate("/provider/tutorial");
  };

  const isFormValid = schedule.some((day) => !day.unavailable);

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Top Navigation Bar */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Availability Calendar
          </h2>
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
            4 of 4
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-[4px] bg-[#e5e5e5] flex-shrink-0">
        <div className="h-full bg-[#56C490] transition-all duration-300" style={{ width: "100%" }} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[120px]">
        <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] leading-[1.2] mt-[24px] mb-[8px]">
          Set Your Availability
        </h1>
        <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.5] mb-[32px]">
          Configure your working hours and booking preferences to manage your schedule effectively.
        </p>

        {/* Weekly Schedule Section */}
        <div className="mb-[32px]">
          <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
            Weekly Schedule
          </h3>

          <div className="space-y-[12px]">
            {schedule.map((daySchedule, index) => (
              <div
                key={daySchedule.day}
                className={`border-2 border-[#e5e5e5] rounded-[12px] p-[16px] transition-all ${
                  daySchedule.unavailable ? "opacity-50 bg-[#f9f9f9]" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-[12px]">
                  <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
                    {daySchedule.day}
                  </label>
                  <div className="flex items-center gap-[8px]">
                    <Checkbox
                      checked={daySchedule.unavailable}
                      onCheckedChange={(checked) =>
                        handleDayChange(index, "unavailable", checked)
                      }
                      className="border-[#56C490] data-[state=checked]:bg-[#56C490]"
                    />
                    <span className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280]">
                      Unavailable
                    </span>
                  </div>
                </div>

                {!daySchedule.unavailable && (
                  <div className="grid grid-cols-2 gap-[12px]">
                    {/* Start Time */}
                    <div className="relative">
                      <label className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mb-[6px] block">
                        Start Time
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleDropdown(`start-${index}`)}
                        className={`w-full px-[12px] py-[10px] bg-[#f5f5f5] border-2 rounded-[10px] font-['Nunito',sans-serif] text-[13px] text-left flex items-center justify-between transition-all ${
                          openDropdowns[`start-${index}`] ? "border-[#56C490] bg-white" : "border-transparent"
                        }`}
                      >
                        <span className="text-[#1a1a1a]">{daySchedule.startTime}</span>
                        <ChevronDown
                          className={`w-[16px] h-[16px] text-[#666] transition-transform ${
                            openDropdowns[`start-${index}`] ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openDropdowns[`start-${index}`] && (
                        <div className="absolute top-full left-0 right-0 mt-[6px] bg-white border-2 border-[#56C490] rounded-[10px] shadow-lg z-20 max-h-[200px] overflow-y-auto">
                          {TIME_OPTIONS.map((time) => (
                            <button
                              key={time}
                              onClick={() => {
                                handleDayChange(index, "startTime", time);
                                toggleDropdown(`start-${index}`);
                              }}
                              className={`w-full px-[12px] py-[8px] font-['Nunito',sans-serif] text-[13px] text-left transition-all ${
                                daySchedule.startTime === time
                                  ? "bg-[#56C490]/10 text-[#56C490]"
                                  : "text-[#1a1a1a] hover:bg-[#f5f5f5]"
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* End Time */}
                    <div className="relative">
                      <label className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mb-[6px] block">
                        End Time
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleDropdown(`end-${index}`)}
                        className={`w-full px-[12px] py-[10px] bg-[#f5f5f5] border-2 rounded-[10px] font-['Nunito',sans-serif] text-[13px] text-left flex items-center justify-between transition-all ${
                          openDropdowns[`end-${index}`] ? "border-[#56C490] bg-white" : "border-transparent"
                        }`}
                      >
                        <span className="text-[#1a1a1a]">{daySchedule.endTime}</span>
                        <ChevronDown
                          className={`w-[16px] h-[16px] text-[#666] transition-transform ${
                            openDropdowns[`end-${index}`] ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openDropdowns[`end-${index}`] && (
                        <div className="absolute top-full left-0 right-0 mt-[6px] bg-white border-2 border-[#56C490] rounded-[10px] shadow-lg z-20 max-h-[200px] overflow-y-auto">
                          {TIME_OPTIONS.map((time) => (
                            <button
                              key={time}
                              onClick={() => {
                                handleDayChange(index, "endTime", time);
                                toggleDropdown(`end-${index}`);
                              }}
                              className={`w-full px-[12px] py-[8px] font-['Nunito',sans-serif] text-[13px] text-left transition-all ${
                                daySchedule.endTime === time
                                  ? "bg-[#56C490]/10 text-[#56C490]"
                                  : "text-[#1a1a1a] hover:bg-[#f5f5f5]"
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={copyToAllDays}
            className="mt-[16px] px-[16px] py-[10px] font-['Nunito',sans-serif] text-[14px] text-[#56C490] transition-all active:scale-95 hover:underline"
          >
            {lastEditedDay ? `Copy ${lastEditedDay} to all days` : "Copy to all days"}
          </button>
        </div>

        {/* Break Times Section */}
        <div className="mb-[32px]">
          <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
            Break Times
          </h3>

          <div className="grid grid-cols-2 gap-[16px]">
            {/* Break Start */}
            <div className="relative">
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Break Start
              </label>
              <button
                type="button"
                onClick={() => toggleDropdown("break-start")}
                className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-left flex items-center justify-between transition-all ${
                  openDropdowns["break-start"] ? "border-[#56C490] bg-white" : "border-transparent"
                }`}
              >
                <span className="text-[#1a1a1a]">{breakStart}</span>
                <ChevronDown
                  className={`w-[20px] h-[20px] text-[#666] transition-transform ${
                    openDropdowns["break-start"] ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openDropdowns["break-start"] && (
                <div className="absolute top-full left-0 right-0 mt-[8px] bg-white border-2 border-[#56C490] rounded-[12px] shadow-lg z-10 max-h-[250px] overflow-y-auto">
                  {TIME_OPTIONS.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setBreakStart(time);
                        toggleDropdown("break-start");
                      }}
                      className={`w-full px-[16px] py-[10px] font-['Nunito',sans-serif] text-[14px] text-left transition-all ${
                        breakStart === time
                          ? "bg-[#56C490]/10 text-[#56C490]"
                          : "text-[#1a1a1a] hover:bg-[#f5f5f5]"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Break End */}
            <div className="relative">
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Break End
              </label>
              <button
                type="button"
                onClick={() => toggleDropdown("break-end")}
                className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-left flex items-center justify-between transition-all ${
                  openDropdowns["break-end"] ? "border-[#56C490] bg-white" : "border-transparent"
                }`}
              >
                <span className="text-[#1a1a1a]">{breakEnd}</span>
                <ChevronDown
                  className={`w-[20px] h-[20px] text-[#666] transition-transform ${
                    openDropdowns["break-end"] ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openDropdowns["break-end"] && (
                <div className="absolute top-full left-0 right-0 mt-[8px] bg-white border-2 border-[#56C490] rounded-[12px] shadow-lg z-10 max-h-[250px] overflow-y-auto">
                  {TIME_OPTIONS.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setBreakEnd(time);
                        toggleDropdown("break-end");
                      }}
                      className={`w-full px-[16px] py-[10px] font-['Nunito',sans-serif] text-[14px] text-left transition-all ${
                        breakEnd === time
                          ? "bg-[#56C490]/10 text-[#56C490]"
                          : "text-[#1a1a1a] hover:bg-[#f5f5f5]"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Settings Section */}
        <div className="mb-[32px]">
          <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
            Additional Settings
          </h3>

          <div className="space-y-[20px]">
            {/* Recurring Days Off */}
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Recurring Days Off
              </label>
              <input
                type="text"
                value={recurringDaysOff}
                onChange={(e) => setRecurringDaysOff(e.target.value)}
                placeholder="e.g. Every 1st Sunday, Public holidays"
                className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
              />
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mt-[6px]">
                List any regular days you're unavailable
              </p>
            </div>

            {/* Maximum Bookings Per Day */}
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Maximum Bookings Per Day
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={maxBookingsPerDay}
                onChange={(e) => setMaxBookingsPerDay(e.target.value)}
                placeholder="5"
                className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
              />
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mt-[6px]">
                Limit the number of jobs you can accept per day
              </p>
            </div>

            {/* Advance Booking Window */}
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Advance Booking Window (days)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={advanceBookingDays}
                onChange={(e) => setAdvanceBookingDays(e.target.value)}
                placeholder="7"
                className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
              />
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mt-[6px]">
                How far in advance can customers book your services?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer Button */}
      <StickyFooterButton
        label="Continue"
        onClick={handleContinue}
        disabled={!isFormValid}
      />
    </div>
  );
}