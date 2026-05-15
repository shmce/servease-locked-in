import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft, CreditCard, Wallet, Banknote, Check } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

type PaymentMethod = "gcash" | "paymaya" | "card" | "cash";

export default function Payment() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("gcash");
  const [mobileNumber, setMobileNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const amount = 900; // Mock total amount

  const paymentMethods = [
    { id: "gcash" as PaymentMethod, name: "GCash", icon: Wallet },
    { id: "paymaya" as PaymentMethod, name: "PayMaya", icon: Wallet },
    { id: "card" as PaymentMethod, name: "Credit/Debit Card", icon: CreditCard },
    { id: "cash" as PaymentMethod, name: "Cash on Service", icon: Banknote },
  ];

  const handlePayment = () => {
    navigate(`/customer/booking-confirmation/${bookingId}`);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <MobileContainer>
      <div className="h-full bg-[#F9FAFB] flex flex-col">
        {/* Status Bar */}
        <div className="bg-[#56C490] flex-shrink-0">
          <StatusBar />
        </div>

        {/* Header */}
        <div className="bg-[#56C490] px-[24px] py-[16px] flex items-center gap-[16px] flex-shrink-0">
          <button onClick={() => navigate(-1)} className="active:scale-90 transition-transform">
            <ArrowLeft className="w-[24px] h-[24px] text-white" />
          </button>
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-white">
            Payment
          </h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-[120px]">
          <div className="px-[24px] py-[20px] space-y-[20px]">
            {/* Amount Display */}
            <div className="text-center py-[24px]">
              <div className="font-['Inter',sans-serif] text-[14px] text-[#6B7280] mb-[8px]">
                Total Amount
              </div>
              <div className="font-['Nunito',sans-serif] text-[36px] text-[#111827]">
                ₱{amount}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
                Select Payment Method
              </h2>

              <div className="space-y-[12px]">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;

                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-center gap-[12px] p-[16px] rounded-[12px] border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#56C490] bg-[#F0FDF4]"
                          : "border-[#E5E7EB] bg-white"
                      }`}
                    >
                      <div
                        className={`w-[40px] h-[40px] rounded-full flex items-center justify-center ${
                          isSelected ? "bg-[#56C490]" : "bg-[#F3F4F6]"
                        }`}
                      >
                        <Icon className={`w-[20px] h-[20px] ${isSelected ? "text-white" : "text-[#6B7280]"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                          {method.name}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-[20px] h-[20px] rounded-full bg-[#56C490] flex items-center justify-center">
                          <Check className="w-[12px] h-[12px] text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Details Form */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              {(selectedMethod === "gcash" || selectedMethod === "paymaya") && (
                <div>
                  <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
                    {selectedMethod === "gcash" ? "GCash" : "PayMaya"} Details
                  </h2>
                  <div>
                    <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+63 9XX XXX XXXX"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full px-[16px] py-[14px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                    />
                    <p className="font-['Inter',sans-serif] text-[12px] text-[#9CA3AF] mt-[8px]">
                      You will be redirected to {selectedMethod === "gcash" ? "GCash" : "PayMaya"} to complete the payment
                    </p>
                  </div>
                </div>
              )}

              {selectedMethod === "card" && (
                <div>
                  <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
                    Card Details
                  </h2>
                  <div className="space-y-[16px]">
                    <div>
                      <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, "");
                          if (value.length <= 16) {
                            setCardNumber(formatCardNumber(value));
                          }
                        }}
                        className="w-full px-[16px] py-[14px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-[12px]">
                      <div>
                        <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                          Expiry
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 4) {
                              setExpiry(formatExpiry(value));
                            }
                          }}
                          className="w-full px-[16px] py-[14px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                        />
                      </div>

                      <div>
                        <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 3) {
                              setCvv(value);
                            }
                          }}
                          className="w-full px-[16px] py-[14px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                        />
                      </div>
                    </div>

                    <div className="bg-[#F9FAFB] rounded-[12px] p-[12px]">
                      <p className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
                        🔒 Your payment is secured with 3D Secure authentication
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === "cash" && (
                <div>
                  <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
                    Cash Payment
                  </h2>
                  <div className="bg-[#F9FAFB] rounded-[12px] p-[16px] space-y-[12px]">
                    <p className="font-['Inter',sans-serif] text-[14px] text-[#374151]">
                      You will pay cash directly to the service provider after the service is completed.
                    </p>
                    <div className="space-y-[8px]">
                      <div className="flex items-start gap-[8px]">
                        <div className="w-[20px] h-[20px] rounded-full bg-[#56C490] flex items-center justify-center flex-shrink-0 mt-[2px]">
                          <Check className="w-[12px] h-[12px] text-white" />
                        </div>
                        <p className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
                          Prepare exact amount if possible
                        </p>
                      </div>
                      <div className="flex items-start gap-[8px]">
                        <div className="w-[20px] h-[20px] rounded-full bg-[#56C490] flex items-center justify-center flex-shrink-0 mt-[2px]">
                          <Check className="w-[12px] h-[12px] text-white" />
                        </div>
                        <p className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
                          Get a receipt after payment
                        </p>
                      </div>
                      <div className="flex items-start gap-[8px]">
                        <div className="w-[20px] h-[20px] rounded-full bg-[#56C490] flex items-center justify-center flex-shrink-0 mt-[2px]">
                          <Check className="w-[12px] h-[12px] text-white" />
                        </div>
                        <p className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
                          No booking fee required
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Area */}
        <div className="flex-shrink-0 bg-white border-t border-[#F2F2F2]">
          {/* Confirm Button */}
          <div className="px-[24px] pt-[16px] pb-[12px]">
            <button
              onClick={handlePayment}
              className="w-full py-[16px] rounded-[50px] bg-[#56C490] font-['Nunito',sans-serif] text-[16px] text-white active:scale-[0.97] transition-transform shadow-[0_4px_16px_rgba(86,196,144,0.25)]"
            >
              {selectedMethod === "cash" ? "Confirm Booking" : "Proceed to Payment"}
            </button>
          </div>
          
          {/* Bottom Navigation */}
          <BottomNavigation />
        </div>
      </div>
    </MobileContainer>
  );
}