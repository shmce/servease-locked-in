import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Calendar, Clock, AlertCircle, AlertTriangle } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function ProviderRescheduleRequest() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [reason, setReason] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [explanation, setExplanation] = useState("");

  const bookingDetails = {
    customer: "Juan Dela Cruz",
    serviceType: "Plumbing Repair",
    currentDate: "March 15, 2026",
    currentTime: "2:00 PM",
    location: "123 Rizal Street, Brgy. Poblacion, Makati City"
  };

  const rescheduleReasons = [
    "Emergency/Urgent Personal Matter",
    "Vehicle/Transportation Issue",
    "Previous Job Delayed",
    "Health/Medical Issue",
    "Weather Conditions",
    "Tool/Equipment Problem",
    "Other"
  ];

  // Generate time options in 30-minute intervals from 6:00 AM to 9:00 PM
  const timeOptions = [];
  for (let hour = 6; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const displayMinute = minute === 0 ? '00' : minute;
      timeOptions.push(`${displayHour}:${displayMinute} ${period}`);
    }
  }

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
            Reschedule Request
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[16px]">
        {/* Current Booking Details */}
        <div className="mt-[24px] mb-[20px] border-2 border-[#e5e5e5] rounded-[16px] p-[16px] bg-[#f9fafb]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[12px]">
            Current Booking Details
          </p>
          
          <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#1a1a1a] mb-[8px]">
            {bookingDetails.serviceType}
          </h3>

          <div className="space-y-[6px]">
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
              Customer: {bookingDetails.customer}
            </p>
            <div className="flex items-center gap-[6px]">
              <Calendar className="w-[14px] h-[14px] text-[#666]" />
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                {bookingDetails.currentDate} at {bookingDetails.currentTime}
              </p>
            </div>
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280]">
              {bookingDetails.location}
            </p>
          </div>
        </div>

        {/* Reason for Reschedule */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[16px]">
          <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
            Reason for Reschedule <span className="text-[#EF4444]">*</span>
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-[12px] py-[10px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-[10px] font-['Nunito',sans-serif] text-[14px] appearance-none"
            style={{
              color: reason ? "#1a1a1a" : "#9CA3AF",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center"
            }}
          >
            <option value="">Select a reason</option>
            {rescheduleReasons.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Proposed New Date */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[16px]">
          <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
            Proposed New Date <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="date"
            value={proposedDate}
            onChange={(e) => setProposedDate(e.target.value)}
            className="w-full px-[12px] py-[10px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-[10px] font-['Nunito',sans-serif] text-[14px]"
            style={{
              color: proposedDate ? "#1a1a1a" : "#9CA3AF"
            }}
          />
        </div>

        {/* Proposed New Time */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[16px]">
          <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
            Proposed New Time <span className="text-[#EF4444]">*</span>
          </label>
          <select
            value={proposedTime}
            onChange={(e) => setProposedTime(e.target.value)}
            className="w-full px-[12px] py-[10px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-[10px] font-['Nunito',sans-serif] text-[14px] appearance-none"
            style={{
              color: proposedTime ? "#1a1a1a" : "#9CA3AF",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center"
            }}
          >
            <option value="">Select a time</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        {/* Explanation */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[16px]">
          <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
            Explanation <span className="text-[#EF4444]">*</span>
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain the situation to the customer..."
            rows={4}
            className="w-full px-[12px] py-[10px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-[10px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] resize-none"
          />
        </div>

        {/* Customer Approval Notice */}
        <div className="flex items-start gap-[10px] bg-[#DBEAFE] border border-[#93C5FD] rounded-[12px] p-[12px] mb-[16px]">
          <AlertCircle className="w-[18px] h-[18px] text-[#1D4ED8] flex-shrink-0 mt-[1px]" />
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#1E3A8A]">
            Customer must approve this reschedule request
          </p>
        </div>

        {/* Rating Impact Warning */}
        <div className="flex items-start gap-[10px] bg-[#FEF3C7] border border-[#FCD34D] rounded-[12px] p-[12px] mb-[24px]">
          <AlertTriangle className="w-[18px] h-[18px] text-[#F59E0B] flex-shrink-0 mt-[1px]" />
          <div>
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#92400E] mb-[4px]">
              Impact on Rating
            </p>
            <p className="font-['Nunito',sans-serif] text-[12px] text-[#92400E]">
              Rescheduling may affect your reliability score and customer satisfaction rating
            </p>
          </div>
        </div>

        {/* Spacer for fixed button */}
        <div className="h-[80px]" />
      </div>

      {/* Fixed Bottom Button */}
      <div className="px-[24px] py-[16px] bg-white border-t border-[#f2f2f2] flex-shrink-0">
        <button
          disabled={!reason || !proposedDate || !proposedTime || !explanation.trim()}
          className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] disabled:opacity-40 disabled:active:scale-100"
        >
          Send Reschedule Request
        </button>
      </div>

      {/* Home Indicator — iOS Safe Area */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}