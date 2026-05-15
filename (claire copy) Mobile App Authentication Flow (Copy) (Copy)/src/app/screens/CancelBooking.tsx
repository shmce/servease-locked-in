import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft, AlertCircle, ChevronDown } from "lucide-react";

export default function CancelBooking() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [selectedReason, setSelectedReason] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const booking = {
    service: "House Cleaning",
    date: "March 15, 2026",
    provider: "Maria Santos",
    timeUntilBooking: "2 days",
    cancellationFee: 0,
    refundAmount: 900,
  };

  const reasons = [
    "Changed my mind",
    "Found another provider",
    "Emergency",
    "Wrong booking",
    "Provider issue",
    "Other",
  ];

  const handleConfirmCancellation = () => {
    // Handle cancellation
    navigate("/customer/projects");
  };

  return (
    <MobileContainer>
      <div className="h-full bg-[#F9FAFB] flex flex-col">
        {/* Status Bar */}
        <div className="bg-[#EF4444] flex-shrink-0">
          <StatusBar />
        </div>

        {/* Header */}
        <div className="bg-[#EF4444] px-[24px] py-[16px] flex items-center gap-[16px] flex-shrink-0">
          <button onClick={() => navigate(-1)} className="active:scale-90 transition-transform">
            <ArrowLeft className="w-[24px] h-[24px] text-white" />
          </button>
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-white">
            Cancel Booking
          </h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-[20px]">
          <div className="px-[24px] py-[20px] space-y-[16px]">
            {/* Booking Summary */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <h2 className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[12px]">
                Booking Summary
              </h2>

              <div className="space-y-[8px]">
                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">
                    Service
                  </span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                    {booking.service}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">
                    Date
                  </span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                    {booking.date}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">
                    Provider
                  </span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                    {booking.provider}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-[#FEF3C7] rounded-[16px] p-[16px] border border-[#FDE68A]">
              <div className="flex gap-[12px]">
                <AlertCircle className="w-[20px] h-[20px] text-[#92400E] flex-shrink-0 mt-[2px]" />
                <div className="flex-1">
                  <div className="font-['Nunito',sans-serif] text-[14px] text-[#92400E] mb-[8px]">
                    Cancellation Policy
                  </div>

                  <div className="space-y-[6px]">
                    <div className="flex justify-between">
                      <span className="font-['Inter',sans-serif] text-[12px] text-[#78350F]">
                        Time until booking
                      </span>
                      <span className="font-['Nunito',sans-serif] text-[12px] text-[#78350F]">
                        {booking.timeUntilBooking}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-['Inter',sans-serif] text-[12px] text-[#78350F]">
                        Cancellation fee
                      </span>
                      <span className="font-['Nunito',sans-serif] text-[12px] text-[#78350F]">
                        ₱{booking.cancellationFee}
                      </span>
                    </div>

                    <div className="flex justify-between pt-[6px] border-t border-[#FDE68A]">
                      <span className="font-['Nunito',sans-serif] text-[14px] text-[#92400E]">
                        Refund amount
                      </span>
                      <span className="font-['Nunito',sans-serif] text-[16px] text-[#92400E]">
                        ₱{booking.refundAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancellation Reason */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
                Cancellation Reason
              </h2>

              <div className="space-y-[16px]">
                {/* Reason Dropdown */}
                <div>
                  <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                    Why are you cancelling? <span className="text-[#EF4444]">*</span>
                  </label>

                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-[16px] py-[14px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-left flex items-center justify-between focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                    >
                      <span className={selectedReason ? "text-[#111827]" : "text-[#9CA3AF]"}>
                        {selectedReason || "Select a reason"}
                      </span>
                      <ChevronDown
                        className={`w-[20px] h-[20px] text-[#6B7280] transition-transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isDropdownOpen && (
                      <div
                        className="absolute z-10 w-full mt-[8px] bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden"
                        style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                      >
                        {reasons.map((reason) => (
                          <button
                            key={reason}
                            onClick={() => {
                              setSelectedReason(reason);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-[16px] py-[12px] text-left font-['Inter',sans-serif] text-[14px] text-[#111827] hover:bg-[#F9FAFB] transition-colors"
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    placeholder="Tell us more about why you're cancelling..."
                    rows={4}
                    className="w-full px-[16px] py-[12px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Refund Information */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[12px]">
                Refund Information
              </h2>

              <div className="space-y-[8px]">
                <p className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">
                  Your refund of{" "}
                  <span className="font-['Nunito',sans-serif] text-[#111827]">
                    ₱{booking.refundAmount}
                  </span>{" "}
                  will be processed within 5-7 business days.
                </p>

                <p className="font-['Inter',sans-serif] text-[12px] text-[#9CA3AF]">
                  The refund will be credited back to your original payment method.
                </p>
              </div>
            </div>

            {/* Keep Booking Suggestion */}
            <div className="bg-[#F0FDF4] rounded-[16px] p-[16px] border border-[#86EFAC]">
              <div className="font-['Nunito',sans-serif] text-[14px] text-[#065F46] mb-[8px]">
                Still unsure?
              </div>
              <p className="font-['Inter',sans-serif] text-[12px] text-[#047857] mb-[12px]">
                You can modify your booking instead of cancelling. Change the date, time, or location to better suit your needs.
              </p>
              <button
                onClick={() => navigate(`/customer/booking/${id}/modify`)}
                className="w-full py-[12px] rounded-[12px] border-2 border-[#56C490] font-['Nunito',sans-serif] text-[14px] text-[#56C490] active:scale-[0.97] transition-transform"
              >
                Modify Booking Instead
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-[12px] pt-[8px]">
              <button
                onClick={handleConfirmCancellation}
                disabled={!selectedReason}
                className="w-full py-[16px] rounded-[50px] bg-[#EF4444] font-['Nunito',sans-serif] text-[16px] text-white active:scale-[0.97] transition-transform disabled:opacity-40 disabled:active:scale-100 shadow-[0_4px_16px_rgba(239,68,68,0.25)]"
              >
                Confirm Cancellation
              </button>

              <button
                onClick={() => navigate(-1)}
                className="w-full py-[16px] rounded-[50px] border border-[#E5E7EB] font-['Nunito',sans-serif] text-[16px] text-[#374151] active:scale-[0.97] transition-transform"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="h-[34px] relative flex-shrink-0 bg-white">
          <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
        </div>
      </div>
    </MobileContainer>
  );
}