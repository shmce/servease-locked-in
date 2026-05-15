import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft, FileText, Shield } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

export default function CustomerTerms() {
  const navigate = useNavigate();

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
            Terms & Privacy
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-[100px]">
          <div className="px-[24px] py-[20px] space-y-[16px]">
            <button
              onClick={() => navigate("/terms-and-conditions")}
              className="w-full flex items-center gap-[16px] p-[16px] rounded-[12px] bg-white border border-[#F2F2F2] active:scale-[0.98] transition-transform"
            >
              <div className="w-[48px] h-[48px] rounded-full bg-[#F0FDF4] flex items-center justify-center flex-shrink-0">
                <FileText className="w-[24px] h-[24px] text-[#56C490]" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[2px]">
                  Terms and Conditions
                </div>
                <div className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">
                  Read our terms of service
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/privacy-policy")}
              className="w-full flex items-center gap-[16px] p-[16px] rounded-[12px] bg-white border border-[#F2F2F2] active:scale-[0.98] transition-transform"
            >
              <div className="w-[48px] h-[48px] rounded-full bg-[#F0FDF4] flex items-center justify-center flex-shrink-0">
                <Shield className="w-[24px] h-[24px] text-[#56C490]" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[2px]">
                  Privacy Policy
                </div>
                <div className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">
                  Learn how we protect your data
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </MobileContainer>
  );
}
