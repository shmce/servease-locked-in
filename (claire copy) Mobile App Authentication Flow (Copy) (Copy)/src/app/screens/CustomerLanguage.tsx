import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, Check } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

export default function CustomerLanguage() {
  const navigate = useNavigate();

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] py-[12px] flex items-center gap-[16px] border-b border-[#F2F2F2] flex-shrink-0">
        <button
          onClick={() => navigate("/customer/settings")}
          className="w-[40px] h-[40px] flex items-center justify-center -ml-[8px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-[24px] h-[24px] text-[#111827]" />
        </button>
        <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
          Language
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        <div className="px-[24px] py-[20px]">
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[20px]">
            Select your preferred language for the app
          </p>

          {/* Language Option */}
          <div className="bg-white rounded-[12px] border-2 border-[#56C490] shadow-[0_2px_8px_rgba(86,196,144,0.15)]">
            <div className="flex items-center justify-between p-[16px]">
              <div className="flex items-center gap-[12px]">
                <div className="w-[40px] h-[40px] bg-[#F3F4F6] rounded-full flex items-center justify-center">
                  <span className="font-['Nunito',sans-serif] text-[18px]">🇺🇸</span>
                </div>
                <div>
                  <p className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
                    English
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[12px] text-[#56C490]">
                    Selected
                  </p>
                </div>
              </div>
              <div className="w-[24px] h-[24px] bg-[#56C490] rounded-full flex items-center justify-center">
                <Check className="w-[16px] h-[16px] text-white" strokeWidth={3} />
              </div>
            </div>
          </div>

          {/* Info message */}
          <div className="mt-[24px] p-[16px] bg-[#F9FAFB] rounded-[12px]">
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
              Currently, ServEase is available in English only. We're working on adding more language options in future updates.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
