import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, Check, CreditCard, Smartphone, Wallet, Banknote } from "lucide-react";

type PaymentMethod = "gcash" | "paymaya" | "card" | "cash" | null;

export default function CustomerAddPayment() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash");
  const [mobileNumber, setMobileNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isDefault, setIsDefault] = useState(true);

  const handleComplete = () => {
    navigate("/customer/onboarding-complete");
  };

  const handleSkip = () => {
    navigate("/customer/onboarding-complete");
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="px-[24px] py-[16px] border-b border-[#F3F4F6] flex-shrink-0">
        <div className="flex items-center gap-[16px] mb-[12px]">
          <button
            onClick={() => navigate("/customer/add-address")}
            className="w-[40px] h-[40px] rounded-full flex items-center justify-center -ml-[8px] transition-all active:scale-90"
          >
            <ArrowLeft className="w-[22px] h-[22px] text-[#111827]" />
          </button>
          <div className="flex-1 text-center -ml-[40px]">
            <h1 className="font-bold text-[20px] text-[#111827] tracking-tight">ServeEase</h1>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-[8px]">
          <div className="flex-1 h-[4px] bg-[#56C490] rounded-full" />
          <div className="flex-1 h-[4px] bg-[#56C490] rounded-full" />
          <div className="flex-1 h-[4px] bg-[#56C490] rounded-full" />
        </div>
        <p className="text-center text-[12px] text-[#535353] mt-[8px]">Step 3 of 3</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[24px]">
        <div className="mt-[24px]">
          <h2 className="font-bold text-[24px] text-[#111827] mb-[8px]">Add Payment Method</h2>
          <p className="text-[14px] text-[#535353] mb-[24px]">
            Choose how you'd like to pay for services
          </p>

          {/* Payment Method Selection */}
          <div className="mb-[24px] space-y-[12px]">
            {/* GCash */}
            <button
              onClick={() => setSelectedMethod("gcash")}
              className={`w-full flex items-center gap-[12px] p-[14px] rounded-[10px] border-2 transition-all ${
                selectedMethod === "gcash"
                  ? "bg-[#56C490]/5 border-[#56C490]"
                  : "bg-white border-[#E5E7EB]"
              }`}
            >
              <div
                className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedMethod === "gcash" ? "border-[#56C490]" : "border-[#D1D5DB]"
                }`}
              >
                {selectedMethod === "gcash" && (
                  <div className="w-[10px] h-[10px] rounded-full bg-[#56C490]" />
                )}
              </div>
              <Smartphone className="w-[20px] h-[20px] text-[#007DFF]" />
              <span className="font-medium text-[14px] text-[#111827]">GCash</span>
            </button>

            {/* PayMaya */}
            <button
              onClick={() => setSelectedMethod("paymaya")}
              className={`w-full flex items-center gap-[12px] p-[14px] rounded-[10px] border-2 transition-all ${
                selectedMethod === "paymaya"
                  ? "bg-[#56C490]/5 border-[#56C490]"
                  : "bg-white border-[#E5E7EB]"
              }`}
            >
              <div
                className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedMethod === "paymaya" ? "border-[#56C490]" : "border-[#D1D5DB]"
                }`}
              >
                {selectedMethod === "paymaya" && (
                  <div className="w-[10px] h-[10px] rounded-full bg-[#56C490]" />
                )}
              </div>
              <Wallet className="w-[20px] h-[20px] text-[#00C853]" />
              <span className="font-medium text-[14px] text-[#111827]">PayMaya</span>
            </button>

            {/* Credit/Debit Card */}
            <button
              onClick={() => setSelectedMethod("card")}
              className={`w-full flex items-center gap-[12px] p-[14px] rounded-[10px] border-2 transition-all ${
                selectedMethod === "card"
                  ? "bg-[#56C490]/5 border-[#56C490]"
                  : "bg-white border-[#E5E7EB]"
              }`}
            >
              <div
                className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedMethod === "card" ? "border-[#56C490]" : "border-[#D1D5DB]"
                }`}
              >
                {selectedMethod === "card" && (
                  <div className="w-[10px] h-[10px] rounded-full bg-[#56C490]" />
                )}
              </div>
              <CreditCard className="w-[20px] h-[20px] text-[#535353]" />
              <span className="font-medium text-[14px] text-[#111827]">Credit/Debit Card</span>
            </button>

            {/* Cash */}
            <button
              onClick={() => setSelectedMethod("cash")}
              className={`w-full flex items-center gap-[12px] p-[14px] rounded-[10px] border-2 transition-all ${
                selectedMethod === "cash"
                  ? "bg-[#56C490]/5 border-[#56C490]"
                  : "bg-white border-[#E5E7EB]"
              }`}
            >
              <div
                className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedMethod === "cash" ? "border-[#56C490]" : "border-[#D1D5DB]"
                }`}
              >
                {selectedMethod === "cash" && (
                  <div className="w-[10px] h-[10px] rounded-full bg-[#56C490]" />
                )}
              </div>
              <Banknote className="w-[20px] h-[20px] text-[#56C490]" />
              <span className="font-medium text-[14px] text-[#111827]">Cash</span>
            </button>
          </div>

          {/* Payment Details Forms */}
          {(selectedMethod === "gcash" || selectedMethod === "paymaya") && (
            <div className="mb-[24px] space-y-[16px]">
              <div>
                <label className="block font-medium text-[14px] text-[#111827] mb-[8px]">
                  Mobile Number <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+63 912 345 6789"
                  className="w-full px-[14px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                />
              </div>
            </div>
          )}

          {selectedMethod === "card" && (
            <div className="mb-[24px] space-y-[16px]">
              <div>
                <label className="block font-medium text-[14px] text-[#111827] mb-[8px]">
                  Card Number <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-[14px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                <div>
                  <label className="block font-medium text-[14px] text-[#111827] mb-[8px]">
                    Expiry <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-[14px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[14px] text-[#111827] mb-[8px]">
                    CVV <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    maxLength={3}
                    className="w-full px-[14px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedMethod !== "cash" && (
            <label className="flex items-center gap-[10px] mb-[24px] cursor-pointer">
              <button
                onClick={() => setIsDefault(!isDefault)}
                className={`w-[20px] h-[20px] rounded-[6px] border-2 flex items-center justify-center transition-all ${
                  isDefault ? "bg-[#56C490] border-[#56C490]" : "bg-white border-[#D1D5DB]"
                }`}
              >
                {isDefault && <Check className="w-[14px] h-[14px] text-white" strokeWidth={3} />}
              </button>
              <span className="font-medium text-[14px] text-[#111827]">
                Set as default payment method
              </span>
            </label>
          )}

          {/* Skip for Now Link */}
          <button
            onClick={handleSkip}
            className="w-full mb-[16px] text-center text-[14px] font-semibold text-[#535353] transition-all active:opacity-70"
          >
            Skip for now
          </button>

          {/* Complete Registration Button */}
          <button
            onClick={handleComplete}
            className="w-full bg-[#56C490] py-[14px] rounded-[8px] font-semibold text-[16px] text-white shadow-[0_2px_8px_rgba(86,196,144,0.25)] transition-all active:scale-95"
          >
            Complete Registration
          </button>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}