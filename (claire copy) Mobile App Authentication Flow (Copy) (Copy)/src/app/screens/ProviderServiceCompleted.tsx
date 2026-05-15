import { useNavigate, useParams } from "react-router";
import { CheckCircle, Star, FileText, ArrowRight } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function ProviderServiceCompleted() {
  const navigate = useNavigate();
  const { id } = useParams();

  const serviceSummary = {
    customer: "Juan Dela Cruz",
    serviceType: "Plumbing Repair",
    date: "March 15, 2026",
    duration: "2h 45m"
  };

  const earnings = {
    totalCharged: 3000,
    platformFee: 300,
    yourEarnings: 2700,
    payoutDate: "March 18, 2026"
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-[24px] py-[40px]">
        {/* Large Success Checkmark */}
        <div className="flex justify-center mb-[24px]">
          <div className="w-[120px] h-[120px] bg-[#56C490] rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-[72px] h-[72px] text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] text-center mb-[8px]">
          Service Completed!
        </h1>
        <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] text-center mb-[32px]">
          Great job! Your service has been marked as complete.
        </p>

        {/* Service Summary Card */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[24px]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[12px]">
            Service Summary
          </p>
          
          <div className="space-y-[10px]">
            <div className="flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                Customer
              </p>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                {serviceSummary.customer}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                Service Type
              </p>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                {serviceSummary.serviceType}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                Date
              </p>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                {serviceSummary.date}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                Duration
              </p>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                {serviceSummary.duration}
              </p>
            </div>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="border-2 border-[#56C490] rounded-[16px] p-[16px] mb-[24px] bg-[#56C490]/5">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[12px]">
            Earnings Breakdown
          </p>
          
          <div className="space-y-[8px] mb-[12px]">
            <div className="flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                Total Charged
              </p>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                ₱{earnings.totalCharged.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                Platform Fee (10%)
              </p>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#EF4444]">
                -₱{earnings.platformFee.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="border-t border-[#e5e5e5] pt-[12px] mb-[12px]">
            <div className="flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[16px] text-[#56C490]">
                Your Earnings (90%)
              </p>
              <p className="font-['Nunito',sans-serif] text-[20px] text-[#56C490]">
                ₱{earnings.yourEarnings.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[10px] p-[12px]">
            <div className="flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280]">
                Estimated Payout Date
              </p>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                {earnings.payoutDate}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-[10px] mb-[24px]">
          <button 
            onClick={() => navigate('/provider/reviews')}
            className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[15px] py-[14px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] flex items-center justify-center gap-[8px]"
          >
            <Star className="w-[18px] h-[18px]" />
            Ask Customer for Review
          </button>

          <button 
            onClick={() => navigate(`/provider/service-receipt/${id}`)}
            className="w-full bg-white border-2 border-[#56C490] text-[#56C490] font-['Nunito',sans-serif] text-[15px] py-[14px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[8px]"
          >
            <FileText className="w-[18px] h-[18px]" />
            View Receipt
          </button>

          <button
            onClick={() => navigate('/provider/home')}
            className="w-full bg-white border-2 border-[#e5e5e5] text-[#1a1a1a] font-['Nunito',sans-serif] text-[14px] py-[12px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[8px]"
          >
            Done
            <ArrowRight className="w-[16px] h-[16px]" />
          </button>
        </div>

        {/* Spacer */}
        <div className="h-[60px]" />
      </div>

      {/* Home Indicator — iOS Safe Area */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}