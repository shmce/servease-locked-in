import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft, CreditCard, Smartphone, Wallet, Banknote } from "lucide-react";
import { StickyFooterButton } from "../components/StickyFooterButton";

type PaymentMethod = "gcash" | "paymaya" | "card" | "cash";

export default function ReservePayment() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card");
  const [mobileNumber, setMobileNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const totalAmount = 800;

  const handleProceed = () => {
    navigate(`/customer/project-confirmation/${bookingId}`);
  };

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
            Reserve payment
          </h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-[120px]">
          <div className="px-[24px] py-[20px] space-y-[24px]">
            {/* Info Note */}
            <div className="bg-[#F0FDF4] rounded-[12px] p-[16px] border border-[#D1FAE5]">
              <p className="font-['Inter',sans-serif] text-[14px] text-[#065F46]">
                Pay nothing for this job today. You will be charged until after the job is completed.
              </p>
            </div>

            {/* Total Amount */}
            <div className="text-center">
              <p className="font-['Inter',sans-serif] text-[14px] text-[#6B7280] mb-[8px]">
                Total amount
              </p>
              <p className="font-['Nunito',sans-serif] text-[32px] text-[#111827]">
                ₱{totalAmount}
              </p>
            </div>

            {/* Payment Methods */}
            <div>
              <h2 className="font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[16px]">
                Payment methods
              </h2>

              <div className="space-y-[12px]">
                <label
                  className={`flex items-center gap-[12px] p-[16px] rounded-[12px] border-2 cursor-pointer transition-all ${
                    selectedMethod === "gcash"
                      ? "border-[#56C490] bg-[#F0FDF4]"
                      : "border-[#F2F2F2] bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="gcash"
                    checked={selectedMethod === "gcash"}
                    onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
                    className="w-[20px] h-[20px] text-[#56C490] focus:ring-[#56C490]"
                  />
                  <div className="flex items-center gap-[12px] flex-1">
                    <div className="w-[40px] h-[28px] rounded-[6px] bg-[#F3F4F6] flex items-center justify-center">
                      <Smartphone className="w-[20px] h-[20px] text-[#6B7280]" />
                    </div>
                    <div>
                      <div className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                        GCash
                      </div>
                      <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
                        Enter your mobile number
                      </div>
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-[12px] p-[16px] rounded-[12px] border-2 cursor-pointer transition-all ${
                    selectedMethod === "paymaya"
                      ? "border-[#56C490] bg-[#F0FDF4]"
                      : "border-[#F2F2F2] bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paymaya"
                    checked={selectedMethod === "paymaya"}
                    onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
                    className="w-[20px] h-[20px] text-[#56C490] focus:ring-[#56C490]"
                  />
                  <div className="flex items-center gap-[12px] flex-1">
                    <div className="w-[40px] h-[28px] rounded-[6px] bg-[#F3F4F6] flex items-center justify-center">
                      <Wallet className="w-[20px] h-[20px] text-[#6B7280]" />
                    </div>
                    <div>
                      <div className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                        PayMaya
                      </div>
                      <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
                        Enter your mobile number
                      </div>
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-[12px] p-[16px] rounded-[12px] border-2 cursor-pointer transition-all ${
                    selectedMethod === "card"
                      ? "border-[#56C490] bg-[#F0FDF4]"
                      : "border-[#F2F2F2] bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={selectedMethod === "card"}
                    onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
                    className="w-[20px] h-[20px] text-[#56C490] focus:ring-[#56C490]"
                  />
                  <div className="flex items-center gap-[12px] flex-1">
                    <div className="w-[40px] h-[28px] rounded-[6px] bg-[#F3F4F6] flex items-center justify-center">
                      <CreditCard className="w-[20px] h-[20px] text-[#6B7280]" />
                    </div>
                    <div>
                      <div className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                        Credit or Debit Card
                      </div>
                      <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
                        Enter your card details
                      </div>
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-[12px] p-[16px] rounded-[12px] border-2 cursor-pointer transition-all ${
                    selectedMethod === "cash"
                      ? "border-[#56C490] bg-[#F0FDF4]"
                      : "border-[#F2F2F2] bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={selectedMethod === "cash"}
                    onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
                    className="w-[20px] h-[20px] text-[#56C490] focus:ring-[#56C490]"
                  />
                  <div className="flex items-center gap-[12px] flex-1">
                    <div className="w-[40px] h-[28px] rounded-[6px] bg-[#F3F4F6] flex items-center justify-center">
                      <Banknote className="w-[20px] h-[20px] text-[#6B7280]" />
                    </div>
                    <div>
                      <div className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                        Cash
                      </div>
                      <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
                        Pay in cash upon delivery
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Mobile Number Input */}
            {(selectedMethod === "gcash" || selectedMethod === "paymaya") && (
              <div className="space-y-[12px]">
                <input
                  type="text"
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-[16px] py-[12px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                />
                <p className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
                  You will be redirected to {selectedMethod === "gcash" ? "GCash" : "PayMaya"} to complete payment
                </p>
              </div>
            )}

            {/* Card Details Input */}
            {selectedMethod === "card" && (
              <div className="mt-[12px]">
                <input
                  type="text"
                  placeholder="Enter card number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-[16px] py-[12px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                />
                <div className="flex items-center gap-[12px] mt-[12px]">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-[100px] px-[16px] py-[12px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-[100px] px-[16px] py-[12px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                  />
                </div>
              </div>
            )}

            {/* Cash Payment Info */}
            {selectedMethod === "cash" && (
              <div className="bg-[#F9FAFB] rounded-[12px] p-[16px]">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[8px]">
                  Cash on service
                </p>
                <p className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">
                  Pay the Service Provider directly after service completion
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <StickyFooterButton
          label="Proceed"
          onClick={handleProceed}
        />
      </div>
    </MobileContainer>
  );
}