import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, Coffee, Clock, Play, Square, AlertCircle } from "lucide-react";

export default function ProviderBreakStatus() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [breakDuration, setBreakDuration] = useState(0); // in seconds
  const [isOnBreak, setIsOnBreak] = useState(true);

  // Break details
  const breakStartTime = new Date(2026, 2, 14, 15, 30); // Mock start time
  const breakReason = "Lunch break"; // Optional reason

  // Job details
  const jobDetails = {
    title: "Plumbing Repair",
    reference: "SR-2026-001234",
    customer: "Juan Dela Cruz",
  };

  // Timer effect
  useEffect(() => {
    if (!isOnBreak) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - breakStartTime.getTime()) / 1000);
      setBreakDuration(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOnBreak]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Format time
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  // Resume work
  const handleResumeWork = () => {
    setIsOnBreak(false);
    setTimeout(() => {
      navigate(`/provider/service-in-progress/${id}`);
    }, 500);
  };

  // End break
  const handleEndBreak = () => {
    setIsOnBreak(false);
    setTimeout(() => {
      navigate(`/provider/service-in-progress/${id}`);
    }, 500);
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Top Navigation Bar */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0 border-b border-[#e5e5e5]">
        <button
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Break Status
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-[24px] py-[24px] bg-[#f9fafb]">
        {/* Job Info Card */}
        <div className="mb-[24px] bg-white rounded-[16px] p-[16px] shadow-sm border border-[#e5e5e5]">
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280] mb-[4px]">
            Current Job
          </p>
          <p className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[2px]">
            {jobDetails.title}
          </p>
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280]">
            Ref: {jobDetails.reference}
          </p>
        </div>

        {/* Break Status Card */}
        <div className="mb-[24px] bg-gradient-to-br from-[#fef3c7] to-[#fde68a] rounded-[20px] p-[24px] shadow-lg border-2 border-[#fbbf24]">
          {/* Status Badge */}
          <div className="flex items-center justify-center mb-[20px]">
            <div className="inline-flex items-center gap-[8px] px-[16px] py-[8px] bg-white/90 rounded-full shadow-sm">
              <div className="w-[8px] h-[8px] bg-[#f59e0b] rounded-full animate-pulse" />
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#92400e]">
                {isOnBreak ? "On Break" : "Break Ended"}
              </p>
            </div>
          </div>

          {/* Coffee Icon */}
          <div className="flex items-center justify-center mb-[16px]">
            <div className="w-[80px] h-[80px] bg-white rounded-full flex items-center justify-center shadow-md">
              <Coffee className="w-[40px] h-[40px] text-[#f59e0b]" />
            </div>
          </div>

          {/* Break Duration Timer */}
          <div className="text-center mb-[16px]">
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#92400e] mb-[8px]">
              Break Duration
            </p>
            <p className="font-['Nunito',sans-serif] text-[48px] text-[#92400e] leading-none tracking-tight">
              {formatDuration(breakDuration)}
            </p>
          </div>

          {/* Break Start Time */}
          <div className="flex items-center justify-center gap-[6px] mb-[12px]">
            <Clock className="w-[16px] h-[16px] text-[#b45309]" />
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#b45309]">
              Break started at {formatTime(breakStartTime)}
            </p>
          </div>

          {/* Break Reason */}
          {breakReason && (
            <div className="text-center">
              <div className="inline-block bg-white/80 rounded-[10px] px-[16px] py-[8px]">
                <p className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280] mb-[2px]">
                  Reason
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                  {breakReason}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Alert */}
        <div className="mb-[24px] bg-[#eff6ff] border border-[#bfdbfe] rounded-[12px] p-[16px] flex gap-[12px]">
          <AlertCircle className="w-[20px] h-[20px] text-[#3b82f6] flex-shrink-0 mt-[2px]" />
          <div className="flex-1">
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#1e40af] mb-[4px]">
              Break Time Reminder
            </p>
            <p className="font-['Nunito',sans-serif] text-[12px] text-[#3b82f6] leading-relaxed">
              Your break time is being tracked. Remember to resume work when you're ready to continue the service.
            </p>
          </div>
        </div>

        {/* Break Statistics */}
        <div className="grid grid-cols-2 gap-[12px] mb-[24px]">
          {/* Total Break Time Today */}
          <div className="bg-white rounded-[12px] p-[16px] shadow-sm border border-[#e5e5e5]">
            <div className="flex items-center gap-[8px] mb-[8px]">
              <Clock className="w-[16px] h-[16px] text-[#6B7280]" />
              <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280]">
                Today's Breaks
              </p>
            </div>
            <p className="font-['Nunito',sans-serif] text-[20px] text-[#1a1a1a]">
              45 min
            </p>
          </div>

          {/* Number of Breaks */}
          <div className="bg-white rounded-[12px] p-[16px] shadow-sm border border-[#e5e5e5]">
            <div className="flex items-center gap-[8px] mb-[8px]">
              <Coffee className="w-[16px] h-[16px] text-[#6B7280]" />
              <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280]">
                Break Count
              </p>
            </div>
            <p className="font-['Nunito',sans-serif] text-[20px] text-[#1a1a1a]">
              3
            </p>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-[120px]" />
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="px-[24px] py-[16px] bg-white border-t border-[#e5e5e5] flex-shrink-0">
        <div className="flex gap-[12px] mb-[12px]">
          {/* Resume Work Button */}
          <button
            onClick={handleResumeWork}
            disabled={!isOnBreak}
            className="flex-1 bg-[#56C490] text-white font-['Nunito',sans-serif] text-[15px] py-[14px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] flex items-center justify-center gap-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-[18px] h-[18px]" />
            Resume Work
          </button>

          {/* End Break Button */}
          <button
            onClick={handleEndBreak}
            disabled={!isOnBreak}
            className="flex-1 bg-white border-2 border-[#e5e5e5] text-[#1a1a1a] font-['Nunito',sans-serif] text-[15px] py-[14px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Square className="w-[18px] h-[18px]" />
            End Break
          </button>
        </div>

        <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF] text-center">
          Both buttons will return you to the active service screen
        </p>
      </div>

      {/* Home Indicator — iOS Safe Area */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}
