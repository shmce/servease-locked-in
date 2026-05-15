import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ChevronLeft, Lock, Shield, FileText, Key, Eye, Smartphone, Home, Calendar, MessageCircle, MoreHorizontal, ChevronRight } from "lucide-react";

export default function ProviderPrivacySecurity() {
  const navigate = useNavigate();
  const [activeTab] = useState("more");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  return (
    <div className="bg-[#F8F8F8] w-full min-h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#00C16A] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] pt-[16px] pb-[16px] flex items-center gap-[16px] border-b border-[#E5E7EB] flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all active:scale-90"
        >
          <ChevronLeft className="w-[24px] h-[24px] text-[#111827]" />
        </button>
        <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
          Privacy & Security
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[16px]">
        <div className="pt-[8px]">
          {/* Security Settings */}
          <div className="bg-white mb-[8px] px-[24px] py-[20px]">
            <h2 className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[16px] uppercase tracking-[0.5px]">
              Security Settings
            </h2>

            {/* Change Password */}
            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB] mb-[4px]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#00C16A]/10 flex items-center justify-center flex-shrink-0">
                <Lock className="w-[20px] h-[20px] text-[#00C16A]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                  Change Password
                </p>
                <p className="font-['Poppins',sans-serif] text-[12px] text-[#6B7280] mt-[2px]">
                  Update your password regularly
                </p>
              </div>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            {/* Two-Factor Authentication */}
            <div className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] mb-[4px]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#00C16A]/10 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-[20px] h-[20px] text-[#00C16A]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                  Two-Factor Authentication
                </p>
                <p className="font-['Poppins',sans-serif] text-[12px] text-[#6B7280] mt-[2px]">
                  {twoFactorEnabled ? "Enabled via SMS" : "Add extra security"}
                </p>
              </div>
              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative w-[48px] h-[28px] rounded-full transition-all ${
                  twoFactorEnabled ? "bg-[#00C16A]" : "bg-[#E5E7EB]"
                }`}
              >
                <div
                  className={`absolute top-[2px] w-[24px] h-[24px] rounded-full bg-white shadow-sm transition-all ${
                    twoFactorEnabled ? "right-[2px]" : "left-[2px]"
                  }`}
                />
              </button>
            </div>

            {/* Login Activity */}
            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#00C16A]/10 flex items-center justify-center flex-shrink-0">
                <Eye className="w-[20px] h-[20px] text-[#00C16A]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                  Login Activity
                </p>
                <p className="font-['Poppins',sans-serif] text-[12px] text-[#6B7280] mt-[2px]">
                  Review recent login sessions
                </p>
              </div>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>
          </div>

          {/* Privacy Controls */}
          <div className="bg-white mb-[8px] px-[24px] py-[20px]">
            <h2 className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[16px] uppercase tracking-[0.5px]">
              Privacy Controls
            </h2>

            {/* Profile Visibility */}
            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB] mb-[4px]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#00C16A]/10 flex items-center justify-center flex-shrink-0">
                <Eye className="w-[20px] h-[20px] text-[#00C16A]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                  Profile Visibility
                </p>
                <p className="font-['Poppins',sans-serif] text-[12px] text-[#6B7280] mt-[2px]">
                  Manage who can see your profile
                </p>
              </div>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            {/* Data & Privacy */}
            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB] mb-[4px]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#00C16A]/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-[20px] h-[20px] text-[#00C16A]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                  Data & Privacy
                </p>
                <p className="font-['Poppins',sans-serif] text-[12px] text-[#6B7280] mt-[2px]">
                  Manage your personal data
                </p>
              </div>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            {/* Download My Data */}
            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#00C16A]/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-[20px] h-[20px] text-[#00C16A]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                  Download My Data
                </p>
                <p className="font-['Poppins',sans-serif] text-[12px] text-[#6B7280] mt-[2px]">
                  Request a copy of your data
                </p>
              </div>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>
          </div>

          {/* Legal Documents */}
          <div className="bg-white mb-[8px] px-[24px] py-[20px]">
            <h2 className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[16px] uppercase tracking-[0.5px]">
              Legal & Policies
            </h2>

            {/* Terms & Conditions */}
            <button
              onClick={() => navigate("/terms-and-conditions")}
              className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB] mb-[4px]"
            >
              <div className="w-[40px] h-[40px] rounded-full bg-[#00C16A]/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-[20px] h-[20px] text-[#00C16A]" />
              </div>
              <span className="flex-1 text-left font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                Terms & Conditions
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            {/* Privacy Policy */}
            <button
              onClick={() => navigate("/privacy-policy")}
              className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB] mb-[4px]"
            >
              <div className="w-[40px] h-[40px] rounded-full bg-[#00C16A]/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-[20px] h-[20px] text-[#00C16A]" />
              </div>
              <span className="flex-1 text-left font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                Privacy Policy
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            {/* Provider Agreement */}
            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB] mb-[4px]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#00C16A]/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-[20px] h-[20px] text-[#00C16A]" />
              </div>
              <span className="flex-1 text-left font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                Provider Agreement
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            {/* Community Guidelines */}
            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#00C16A]/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-[20px] h-[20px] text-[#00C16A]" />
              </div>
              <span className="flex-1 text-left font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                Community Guidelines
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>
          </div>

          {/* Security Info */}
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] mx-[24px] p-[16px] rounded-[12px] mb-[16px]">
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#1E40AF] leading-[1.6]">
              🔒 Your data is encrypted and stored securely. We never share your personal information with third parties without your consent.
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e5e5] flex-shrink-0">
        <div className="flex justify-around items-center px-[24px] pt-[12px]">
          <button
            onClick={() => navigate("/provider/home")}
            className={`flex flex-col items-center gap-[4px] py-[8px] flex-1 transition-all active:scale-90`}
          >
            <Home className={`w-[24px] h-[24px] text-[#5d5d5d]`} />
            <span className={`font-['Nunito',sans-serif] text-[10px] tracking-[-0.2px] text-[#5d5d5d]`}>
              Home
            </span>
          </button>

          <button
            className={`flex flex-col items-center gap-[4px] py-[8px] flex-1 transition-all active:scale-90`}
          >
            <Calendar className={`w-[24px] h-[24px] text-[#5d5d5d]`} />
            <span className={`font-['Nunito',sans-serif] text-[10px] tracking-[-0.2px] text-[#5d5d5d]`}>
              Jobs
            </span>
          </button>

          <button
            className={`flex flex-col items-center gap-[4px] py-[8px] flex-1 transition-all active:scale-90`}
          >
            <MessageCircle className={`w-[24px] h-[24px] text-[#5d5d5d]`} />
            <span className={`font-['Nunito',sans-serif] text-[10px] tracking-[-0.2px] text-[#5d5d5d]`}>
              Messages
            </span>
          </button>

          <button
            onClick={() => navigate("/provider/home", { state: { activeTab: "more" } })}
            className={`flex flex-col items-center gap-[4px] py-[8px] flex-1 transition-all active:scale-90`}
          >
            <MoreHorizontal className={`w-[24px] h-[24px] text-[#00C16A]`} />
            <span className={`font-['Nunito',sans-serif] text-[10px] tracking-[-0.2px] text-[#00C16A]`}>
              More
            </span>
          </button>
        </div>
        
        {/* Home Indicator */}
        <div className="h-[34px] bg-white relative">
          <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
        </div>
      </div>
    </div>
  );
}