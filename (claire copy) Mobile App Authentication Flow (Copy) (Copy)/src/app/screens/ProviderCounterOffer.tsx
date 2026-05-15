import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ChevronDown, Calendar, Clock } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function ProviderCounterOffer() {
  const navigate = useNavigate();

  // Mock booking data (would come from route params/state)
  const booking = {
    referenceNumber: "BK-2026-03-001",
    serviceType: "Plumbing Repair",
    customerName: "Juan Dela Cruz",
    dateTime: "March 15, 2026 at 2:00 PM",
    price: "1,500.00",
    location: "123 Rizal Street, Makati City"
  };

  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState<"minutes" | "hours" | "days">("hours");
  const [reason, setReason] = useState("");
  const [validityPeriod, setValidityPeriod] = useState<"24" | "48" | "72">("24");

  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});

  const toggleDropdown = (key: string) => {
    setOpenDropdowns({ ...openDropdowns, [key]: !openDropdowns[key] });
  };

  const handleSendOffer = () => {
    // Handle counter offer submission
    navigate(-1);
  };

  const isFormValid = proposedDate !== "" && proposedTime !== "" && proposedPrice !== "" && estimatedDuration !== "" && reason.trim() !== "";

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
            Counter Offer
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[16px]">
        {/* Current Booking Details (Read-only) */}
        <div className="mt-[24px] mb-[32px]">
          <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[12px]">
            Current Booking Details
          </h3>
          <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[20px] bg-[#f9f9f9]">
            <div className="space-y-[12px]">
              <div>
                <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mb-[4px]">
                  Reference Number
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                  {booking.referenceNumber}
                </p>
              </div>
              <div>
                <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mb-[4px]">
                  Service Type
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                  {booking.serviceType}
                </p>
              </div>
              <div>
                <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mb-[4px]">
                  Customer
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                  {booking.customerName}
                </p>
              </div>
              <div>
                <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mb-[4px]">
                  Requested Date & Time
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                  {booking.dateTime}
                </p>
              </div>
              <div>
                <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mb-[4px]">
                  Original Price
                </p>
                <p className="font-['Nunito',sans-serif] text-[16px] text-[#56C490]">
                  ₱{booking.price}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Counter Offer Form */}
        <div className="mb-[32px]">
          <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[12px]">
            Your Proposed Changes
          </h3>

          <div className="space-y-[20px]">
            {/* Proposed Date & Time */}
            <div className="grid grid-cols-2 gap-[16px]">
              {/* Date Picker */}
              <div>
                <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                  Proposed Date <span className="text-[#EF4444]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
                  />
                  <Calendar className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#666] pointer-events-none" />
                </div>
              </div>

              {/* Time Selector */}
              <div className="relative">
                <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                  Proposed Time <span className="text-[#EF4444]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => toggleDropdown("proposedTime")}
                  className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-left flex items-center justify-between transition-all ${
                    openDropdowns["proposedTime"] ? "border-[#56C490] bg-white" : "border-transparent"
                  }`}
                >
                  <span className={proposedTime ? "text-[#1a1a1a]" : "text-[#9CA3AF]"}>
                    {proposedTime || "Select time"}
                  </span>
                  <Clock className="w-[18px] h-[18px] text-[#666]" />
                </button>
                {openDropdowns["proposedTime"] && (
                  <div className="absolute top-full left-0 right-0 mt-[8px] bg-white border-2 border-[#56C490] rounded-[12px] shadow-lg z-20 max-h-[200px] overflow-y-auto">
                    {TIME_OPTIONS.map((time) => (
                      <button
                        key={time}
                        onClick={() => {
                          setProposedTime(time);
                          toggleDropdown("proposedTime");
                        }}
                        className={`w-full px-[16px] py-[10px] font-['Nunito',sans-serif] text-[14px] text-left transition-all ${
                          proposedTime === time
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

            {/* Proposed Price */}
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Proposed Price <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-[16px] top-1/2 -translate-y-1/2 font-['Nunito',sans-serif] text-[14px] text-[#666]">
                  ₱
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-[36px] pr-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Estimated Duration */}
            <div className="grid grid-cols-2 gap-[16px]">
              <div>
                <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                  Est. Duration <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="0"
                  className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="relative">
                <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                  Unit <span className="text-[#EF4444]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => toggleDropdown("durationUnit")}
                  className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-left flex items-center justify-between transition-all ${
                    openDropdowns["durationUnit"] ? "border-[#56C490] bg-white" : "border-transparent"
                  }`}
                >
                  <span className="text-[#1a1a1a]">{durationUnit}</span>
                  <ChevronDown
                    className={`w-[20px] h-[20px] text-[#666] transition-transform ${
                      openDropdowns["durationUnit"] ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openDropdowns["durationUnit"] && (
                  <div className="absolute top-full left-0 right-0 mt-[8px] bg-white border-2 border-[#56C490] rounded-[12px] shadow-lg z-10 overflow-hidden">
                    {["minutes", "hours", "days"].map((unit) => (
                      <button
                        key={unit}
                        onClick={() => {
                          setDurationUnit(unit as "minutes" | "hours" | "days");
                          toggleDropdown("durationUnit");
                        }}
                        className={`w-full px-[16px] py-[12px] font-['Nunito',sans-serif] text-[14px] text-left transition-all ${
                          durationUnit === unit
                            ? "bg-[#56C490]/10 text-[#56C490]"
                            : "text-[#1a1a1a] hover:bg-[#f5f5f5]"
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reason for Counter Offer */}
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Reason for Counter Offer <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you're proposing these changes..."
                rows={4}
                className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Validity Period */}
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Validity Period <span className="text-[#EF4444]">*</span>
              </label>
              <div className="grid grid-cols-3 gap-[12px]">
                {(["24", "48", "72"] as const).map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setValidityPeriod(hours)}
                    className={`px-[16px] py-[14px] rounded-[12px] font-['Nunito',sans-serif] text-[14px] transition-all ${
                      validityPeriod === hours
                        ? "bg-[#56C490] text-white shadow-[0_4px_12px_rgba(86,196,144,0.25)]"
                        : "bg-[#f5f5f5] text-[#1a1a1a] border-2 border-transparent hover:border-[#56C490]"
                    }`}
                  >
                    {hours} hours
                  </button>
                ))}
              </div>
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mt-[6px]">
                Customer has this time to accept your counter offer
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer with Actions */}
      <div className="fixed left-0 right-0 bottom-0 z-40 bg-white border-t border-[#f2f2f2] px-[24px] pt-[12px] pb-[8px]">
        <div className="space-y-[12px]">
          <button
            onClick={handleSendOffer}
            disabled={!isFormValid}
            className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[12px] transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 shadow-[0_4px_16px_rgba(86,196,144,0.25)]"
          >
            Send Counter Offer
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-transparent border-2 border-[#e5e5e5] text-[#1a1a1a] font-['Nunito',sans-serif] text-[16px] py-[14px] rounded-[12px] transition-all active:scale-[0.97] hover:border-[#56C490]"
          >
            Cancel
          </button>
        </div>
        {/* Home Indicator — iOS Safe Area */}
        <div className="h-[34px] relative">
          <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
        </div>
      </div>
    </div>
  );
}