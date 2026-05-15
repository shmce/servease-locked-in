import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, Download, Share2, CheckCircle, Calendar, Clock, MapPin, User } from "lucide-react";

export default function ProviderServiceReceipt() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Receipt data
  const receipt = {
    receiptNumber: "RCP-2026-003145",
    serviceDate: "March 15, 2026",
    serviceTime: "10:00 AM - 12:45 PM",
    completedDate: "March 15, 2026, 12:45 PM",
    customer: {
      name: "Juan Dela Cruz",
      phone: "+63 917 123 4567",
      address: "123 Mabini Street, Quezon City, Metro Manila",
    },
    service: {
      type: "Plumbing Repair",
      description: "Fixed leaking kitchen sink and replaced worn-out pipes",
      duration: "2h 45m",
    },
    payment: {
      serviceCharge: 2500,
      additionalCharges: [
        { description: "Replacement Parts", amount: 300 },
        { description: "Emergency Service Fee", amount: 200 },
      ],
      subtotal: 3000,
      platformFee: 300,
      providerEarnings: 2700,
      paymentMethod: "GCash",
      paymentStatus: "Paid",
    },
  };

  const totalAdditional = receipt.payment.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);

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
            Service Receipt
          </h2>
        </div>
        <button className="w-[40px] h-[40px] flex items-center justify-center rounded-[10px] bg-[#f5f5f5] transition-all active:scale-95">
          <Share2 className="w-[18px] h-[18px] text-[#6B7280]" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px]">
        {/* Success Badge */}
        <div className="flex justify-center py-[24px]">
          <div className="flex items-center gap-[8px] px-[16px] py-[8px] bg-[#56C490]/10 rounded-[12px]">
            <CheckCircle className="w-[20px] h-[20px] text-[#56C490]" />
            <span className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
              Payment Received
            </span>
          </div>
        </div>

        {/* Receipt Number */}
        <div className="text-center mb-[24px]">
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mb-[4px]">
            Receipt No.
          </p>
          <p className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
            {receipt.receiptNumber}
          </p>
        </div>

        {/* Service Information Card */}
        <div className="bg-gradient-to-br from-[#56C490] to-[#00a055] rounded-[16px] p-[20px] mb-[16px] shadow-[0_4px_12px_rgba(86,196,144,0.2)]">
          <h3 className="font-['Nunito',sans-serif] text-[18px] text-white mb-[16px]">
            {receipt.service.type}
          </h3>
          
          <div className="space-y-[12px]">
            <div className="flex items-start gap-[12px]">
              <Calendar className="w-[18px] h-[18px] text-white/90 flex-shrink-0 mt-[2px]" />
              <div className="flex-1">
                <p className="font-['Nunito',sans-serif] text-[13px] text-white/80">
                  Service Date
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-white">
                  {receipt.serviceDate}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-[12px]">
              <Clock className="w-[18px] h-[18px] text-white/90 flex-shrink-0 mt-[2px]" />
              <div className="flex-1">
                <p className="font-['Nunito',sans-serif] text-[13px] text-white/80">
                  Time & Duration
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-white">
                  {receipt.serviceTime} ({receipt.service.duration})
                </p>
              </div>
            </div>

            <div className="flex items-start gap-[12px]">
              <User className="w-[18px] h-[18px] text-white/90 flex-shrink-0 mt-[2px]" />
              <div className="flex-1">
                <p className="font-['Nunito',sans-serif] text-[13px] text-white/80">
                  Customer
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-white">
                  {receipt.customer.name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-[12px]">
              <MapPin className="w-[18px] h-[18px] text-white/90 flex-shrink-0 mt-[2px]" />
              <div className="flex-1">
                <p className="font-['Nunito',sans-serif] text-[13px] text-white/80">
                  Service Location
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-white">
                  {receipt.customer.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Description */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[16px]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[8px]">
            Service Description
          </p>
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#374151] leading-relaxed">
            {receipt.service.description}
          </p>
        </div>

        {/* Payment Breakdown */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[16px]">
          <p className="font-['Nunito',sans-serif] text-[15px] text-[#111827] mb-[16px]">
            Payment Breakdown
          </p>

          <div className="space-y-[12px]">
            {/* Service Charge */}
            <div className="flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                Service Charge
              </p>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                ₱{receipt.payment.serviceCharge.toLocaleString()}
              </p>
            </div>

            {/* Additional Charges */}
            {receipt.payment.additionalCharges.map((charge, index) => (
              <div key={index} className="flex items-center justify-between">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                  {charge.description}
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                  ₱{charge.amount.toLocaleString()}
                </p>
              </div>
            ))}

            {/* Divider */}
            <div className="border-t border-[#e5e5e5] pt-[12px]">
              <div className="flex items-center justify-between mb-[8px]">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                  Subtotal
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                  ₱{receipt.payment.subtotal.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                  Platform Fee (10%)
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#EF4444]">
                  -₱{receipt.payment.platformFee.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Your Earnings */}
            <div className="bg-[#56C490]/5 rounded-[12px] p-[16px] border-2 border-[#56C490]">
              <div className="flex items-center justify-between">
                <p className="font-['Nunito',sans-serif] text-[16px] text-[#56C490]">
                  Your Earnings
                </p>
                <p className="font-['Nunito',sans-serif] text-[20px] text-[#56C490]">
                  ₱{receipt.payment.providerEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method & Status */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[16px]">
          <div className="flex items-center justify-between mb-[12px]">
            <div>
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[4px]">
                Payment Method
              </p>
              <p className="font-['Nunito',sans-serif] text-[15px] text-[#111827]">
                {receipt.payment.paymentMethod}
              </p>
            </div>
            <div className="flex items-center gap-[6px] px-[12px] py-[6px] bg-[#56C490]/10 rounded-[8px]">
              <div className="w-[6px] h-[6px] rounded-full bg-[#56C490]"></div>
              <span className="font-['Nunito',sans-serif] text-[12px] text-[#56C490]">
                {receipt.payment.paymentStatus}
              </span>
            </div>
          </div>

          <div className="pt-[12px] border-t border-[#e5e5e5]">
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[4px]">
              Completed On
            </p>
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
              {receipt.completedDate}
            </p>
          </div>
        </div>

        {/* Download Button */}
        <button className="w-full bg-white border-2 border-[#56C490] text-[#56C490] font-['Nunito',sans-serif] text-[15px] py-[14px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[8px] mb-[16px]">
          <Download className="w-[18px] h-[18px]" />
          Download PDF Receipt
        </button>

        {/* Footer Note */}
        <div className="bg-[#f9fafb] rounded-[12px] p-[16px] border border-[#e5e5e5]">
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280] text-center leading-relaxed">
            This is a digital receipt issued by ServEase. For any questions or concerns, please contact our support team.
          </p>
        </div>

        {/* Spacer */}
        <div className="h-[40px]" />
      </div>

      {/* Home Indicator — iOS Safe Area */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}
