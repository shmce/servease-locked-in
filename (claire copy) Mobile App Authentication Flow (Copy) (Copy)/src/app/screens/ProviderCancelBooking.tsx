import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Calendar, AlertTriangle, XCircle } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function ProviderCancelBooking() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [cancellationReason, setCancellationReason] = useState("");
  const [detailedExplanation, setDetailedExplanation] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const bookingDetails = {
    customer: "Juan Dela Cruz",
    serviceType: "Plumbing Repair",
    date: "March 15, 2026",
    time: "2:00 PM",
    location: "123 Rizal Street, Brgy. Poblacion, Makati City",
    bookingAmount: 2500
  };

  const cancellationPolicy = {
    hoursUntilBooking: 8,
    penalty: 250,
    ratingImpact: "May receive negative review"
  };

  const cancellationReasons = [
    "Personal Emergency",
    "Health/Medical Issue",
    "Vehicle Breakdown",
    "Double Booking Error",
    "Unable to Complete Service",
    "Weather/Natural Disaster",
    "Family Emergency",
    "Other"
  ];

  const handleConfirmCancellation = () => {
    if (!cancellationReason || !detailedExplanation.trim()) return;

    setIsCancelling(true);

    // Simulate API call to cancel booking
    setTimeout(() => {
      setIsCancelling(false);
      
      // Show success message (in a real app, use a toast/notification library)
      alert("Booking successfully cancelled.");
      
      // Redirect to pending bookings page
      navigate("/provider/my-bookings");
    }, 1500);
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Fixed Header */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0 border-b border-[#f2f2f2]">
        <button
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Cancel Booking
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[16px]">
        {/* Booking Details */}
        <div className="mt-[24px] mb-[20px] border-2 border-[#e5e5e5] rounded-[16px] p-[16px] bg-[#f9fafb]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[12px]">
            Booking Details
          </p>
          
          <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#1a1a1a] mb-[8px]">
            {bookingDetails.serviceType}
          </h3>

          <div className="space-y-[6px] mb-[10px]">
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
              Customer: {bookingDetails.customer}
            </p>
            <div className="flex items-center gap-[6px]">
              <Calendar className="w-[14px] h-[14px] text-[#666]" />
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                {bookingDetails.date} at {bookingDetails.time}
              </p>
            </div>
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280]">
              {bookingDetails.location}
            </p>
          </div>

          <div className="border-t border-[#e5e5e5] pt-[8px]">
            <div className="flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">
                Booking Amount
              </p>
              <p className="font-['Nunito',sans-serif] text-[15px] text-[#111827]">
                ₱{bookingDetails.bookingAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation Policy Summary */}
        <div className="border-2 border-[#FEF3C7] rounded-[16px] p-[16px] mb-[20px] bg-[#FFFBEB]">
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#92400E] mb-[12px]">
            Cancellation Policy
          </p>
          
          <div className="space-y-[8px]">
            <div className="flex items-start gap-[8px]">
              <div className="w-[4px] h-[4px] rounded-full bg-[#F59E0B] mt-[7px] flex-shrink-0" />
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#92400E] flex-1">
                Time until booking: <span className="font-['Nunito',sans-serif]">{cancellationPolicy.hoursUntilBooking} hours</span>
              </p>
            </div>

            <div className="flex items-start gap-[8px]">
              <div className="w-[4px] h-[4px] rounded-full bg-[#F59E0B] mt-[7px] flex-shrink-0" />
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#92400E] flex-1">
                Cancellation penalty: <span className="font-['Nunito',sans-serif]">₱{cancellationPolicy.penalty.toLocaleString()}</span>
              </p>
            </div>

            <div className="flex items-start gap-[8px]">
              <div className="w-[4px] h-[4px] rounded-full bg-[#F59E0B] mt-[7px] flex-shrink-0" />
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#92400E] flex-1">
                Impact on rating: <span className="font-['Nunito',sans-serif]">{cancellationPolicy.ratingImpact}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation Reason */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[16px]">
          <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
            Cancellation Reason <span className="text-[#EF4444]">*</span>
          </label>
          <select
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            className="w-full px-[12px] py-[10px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-[10px] font-['Nunito',sans-serif] text-[14px] appearance-none"
            style={{
              color: cancellationReason ? "#1a1a1a" : "#9CA3AF",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center"
            }}
          >
            <option value="">Select a reason</option>
            {cancellationReasons.map((reason) => (
              <option key={reason} value={reason}>{reason}</option>
            ))}
          </select>
        </div>

        {/* Detailed Explanation */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[16px]">
          <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
            Detailed Explanation <span className="text-[#EF4444]">*</span>
          </label>
          <textarea
            value={detailedExplanation}
            onChange={(e) => setDetailedExplanation(e.target.value)}
            placeholder="Please provide details about why you need to cancel..."
            rows={4}
            className="w-full px-[12px] py-[10px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-[10px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] resize-none"
          />
        </div>

        {/* Warning */}
        <div className="flex items-start gap-[10px] bg-[#FEE2E2] border border-[#FCA5A5] rounded-[12px] p-[12px] mb-[24px]">
          <AlertTriangle className="w-[18px] h-[18px] text-[#DC2626] flex-shrink-0 mt-[1px]" />
          <div>
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#991B1B] mb-[4px]">
              Warning
            </p>
            <p className="font-['Nunito',sans-serif] text-[12px] text-[#991B1B]">
              High cancellation rate affects your account standing and may result in suspension
            </p>
          </div>
        </div>

        {/* Spacer for fixed button */}
        <div className="h-[80px]" />
      </div>

      {/* Fixed Bottom Button */}
      <div className="px-[24px] py-[16px] bg-white border-t border-[#f2f2f2] flex-shrink-0">
        <button
          disabled={!cancellationReason || !detailedExplanation.trim() || isCancelling}
          className="w-full bg-[#EF4444] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(239,68,68,0.25)] disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-[8px]"
          onClick={handleConfirmCancellation}
        >
          {isCancelling ? (
            <>
              <div className="w-[20px] h-[20px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Cancelling Booking...
            </>
          ) : (
            <>
              <XCircle className="w-[20px] h-[20px]" />
              Confirm Cancellation
            </>
          )}
        </button>
      </div>

      {/* Home Indicator — iOS Safe Area */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}