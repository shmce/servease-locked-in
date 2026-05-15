import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

export default function CancelProject() {
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState("");

  const reasons = [
    "Don't need the service anymore",
    "Not available at this time",
    "Found a better rate elsewhere",
    "Placed the request by mistake",
    "Other",
  ];

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
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Cancel Booking
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-[160px]">
          <div className="px-[24px] py-[32px]">
            <p className="font-['Inter',sans-serif] text-[14px] text-[#6B7280] text-center mb-[32px]">
              Please let us know why you're canceling your booking. We would really appreciate your feedback.
            </p>

            {/* Radio button group */}
            <div className="space-y-[16px]">
              {reasons.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-[12px] cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-[20px] h-[20px] text-[#56C490] focus:ring-[#56C490]"
                  />
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#111827]">
                    {reason}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="bg-white px-[24px] pt-[12px] pb-[12px] border-t border-[#F2F2F2] flex-shrink-0">
          <div className="flex gap-[12px]">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-[14px] rounded-[12px] border-2 border-[#56C490] font-['Nunito',sans-serif] text-[14px] text-[#56C490] active:scale-[0.97] transition-transform"
            >
              Don't Cancel
            </button>
            <button
              onClick={() => navigate("/customer/projects")}
              disabled={!selectedReason}
              className="flex-1 py-[14px] rounded-[12px] bg-[#EF4444] font-['Nunito',sans-serif] text-[14px] text-white active:scale-[0.97] transition-transform disabled:opacity-40 disabled:active:scale-100"
            >
              Cancel Booking
            </button>
          </div>

          {/* Bottom Navigation */}
          <BottomNavigation />
        </div>
      </div>
    </MobileContainer>
  );
}