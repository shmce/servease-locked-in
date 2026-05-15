import { Link } from "react-router";
import { CheckCircle2, Mail } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function ProviderApplicationSubmitted() {
  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden">
      {/* Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col justify-between px-[24px]">
        {/* Centered Content Group */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Large Green Checkmark */}
          <div className="mb-[12px] relative">
            <div className="w-[120px] h-[120px] bg-[#56C490]/8 rounded-full flex items-center justify-center relative">
              <div className="w-[96px] h-[96px] bg-[#56C490]/15 rounded-full flex items-center justify-center">
                <div className="w-[72px] h-[72px] bg-[#56C490]/25 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-[48px] h-[48px] text-[#56C490]" strokeWidth={2.5} />
                </div>
              </div>
            </div>
            {/* Animated Success Ring */}
            <div className="absolute inset-0 w-[120px] h-[120px] border-4 border-[#56C490] rounded-full animate-ping opacity-20" />
          </div>

          {/* Heading */}
          <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] leading-[1.2] mb-[8px] text-center">
            Application Submitted!
          </h1>

          {/* Body Text */}
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.6] mb-[20px] text-center max-w-[340px]">
            Thank you for signing up as a service provider. Your application is now under review. You
            will receive an email notification once your account has been approved and activated.
          </p>

          {/* Info Card */}
          <div className="w-full bg-[#e8f5e9] border border-[#56C490]/20 rounded-[16px] px-[16px] py-[16px]">
            <div className="flex items-start gap-[14px]">
              <div className="w-[40px] h-[40px] bg-[#56C490]/15 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <div className="flex-1">
                <h3 className="font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] mb-[6px]">
                  Check your email
                </h3>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#666] leading-[1.6]">
                  We will send you an account activation link once your application has been reviewed
                  and approved. This process may take 1–3 business days.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Button Group */}
        <div className="pb-[20px] pt-[20px] flex-shrink-0">
          <Link
            to="/provider/login"
            className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[50px] transition-all active:scale-95 text-center block shadow-[0_4px_16px_rgba(86,196,144,0.25)]"
          >
            Back to Login
          </Link>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}