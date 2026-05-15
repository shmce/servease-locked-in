import { useNavigate } from "react-router";
import { CheckCircle2, Sparkles } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function ProviderAccountApproved() {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    // Navigate to provider home
    navigate("/provider/home");
  };

  return (
    <div className="bg-white w-full h-full flex flex-col relative">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[20px] pb-[120px] flex flex-col items-center text-center pt-[32px]">
        {/* Large High-Quality Green Checkmark with Sparkle Effect */}
        <div className="mb-[32px] relative">
          <div className="w-[160px] h-[160px] bg-[#56C490]/10 rounded-full flex items-center justify-center relative">
            <div className="w-[140px] h-[140px] bg-[#56C490]/20 rounded-full flex items-center justify-center">
              <div className="w-[120px] h-[120px] bg-[#56C490] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-[72px] h-[72px] text-white" strokeWidth={3} />
              </div>
            </div>
          </div>
          {/* Animated Success Rings */}
          <div className="absolute inset-0 w-[160px] h-[160px] border-4 border-[#56C490] rounded-full animate-ping opacity-20" />
          <div className="absolute inset-0 w-[160px] h-[160px] border-4 border-[#56C490] rounded-full animate-ping opacity-10" style={{ animationDelay: '0.5s' }} />
          
          {/* Sparkle Icons */}
          <Sparkles className="absolute top-[10px] right-[20px] w-[24px] h-[24px] text-[#56C490] animate-pulse" />
          <Sparkles className="absolute bottom-[20px] left-[10px] w-[20px] h-[20px] text-[#56C490] animate-pulse" style={{ animationDelay: '0.3s' }} />
        </div>

        <h1 className="font-['Nunito',sans-serif] text-[32px] text-[#1a1a1a] leading-[1.2] mb-[12px]">
          Welcome to the team!
        </h1>
        
        <p className="font-['Nunito',sans-serif] text-[15px] text-[#666] leading-[1.6] mb-[32px] px-[12px] max-w-[340px]">
          Your account is now active. Use the email you registered with to log in and start accepting jobs.
        </p>

        {/* Account Details Card */}
        <div className="w-full max-w-[340px] bg-[#56C490]/5 border-2 border-[#56C490]/20 rounded-[16px] p-[20px] mb-[24px]">
          <h3 className="font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] mb-[16px]">
            Your ServEase Pro Account
          </h3>
          
          <div className="space-y-[12px]">
            <div className="flex items-start gap-[12px]">
              <div className="w-[6px] h-[6px] bg-[#56C490] rounded-full mt-[6px] flex-shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#666] leading-[1.5]">
                  Access your personalized dashboard to manage bookings, earnings, and customer reviews
                </p>
              </div>
            </div>

            <div className="flex items-start gap-[12px]">
              <div className="w-[6px] h-[6px] bg-[#56C490] rounded-full mt-[6px] flex-shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#666] leading-[1.5]">
                  Set your availability and accept job requests from verified customers in your area
                </p>
              </div>
            </div>

            <div className="flex items-start gap-[12px]">
              <div className="w-[6px] h-[6px] bg-[#56C490] rounded-full mt-[6px] flex-shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#666] leading-[1.5]">
                  Get paid directly through the app with secure, fast payment processing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Stats */}
        <div className="w-full max-w-[340px] grid grid-cols-3 gap-[12px] mb-[32px]">
          <div className="bg-white border-2 border-[#e5e5e5] rounded-[12px] p-[16px]">
            <p className="font-['Nunito',sans-serif] text-[24px] text-[#56C490] mb-[4px]">
              0
            </p>
            <p className="font-['Nunito',sans-serif] text-[11px] text-[#666]">
              Jobs
            </p>
          </div>
          <div className="bg-white border-2 border-[#e5e5e5] rounded-[12px] p-[16px]">
            <p className="font-['Nunito',sans-serif] text-[24px] text-[#56C490] mb-[4px]">
              5.0
            </p>
            <p className="font-['Nunito',sans-serif] text-[11px] text-[#666]">
              Rating
            </p>
          </div>
          <div className="bg-white border-2 border-[#e5e5e5] rounded-[12px] p-[16px]">
            <p className="font-['Nunito',sans-serif] text-[24px] text-[#56C490] mb-[4px]">
              ₱0
            </p>
            <p className="font-['Nunito',sans-serif] text-[11px] text-[#666]">
              Earned
            </p>
          </div>
        </div>

        {/* Next Steps Info */}
        <div className="w-full max-w-[340px] bg-[#e8f5e9] border-2 border-[#56C490]/20 rounded-[12px] p-[16px] mb-[24px]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#1a1a1a] mb-[6px]">
            Ready to get started?
          </p>
          <p className="font-['Nunito',sans-serif] text-[11px] text-[#666] leading-[1.5]">
            Log in with your email to complete your profile, add photos of your work, and start receiving job requests from customers near you.
          </p>
        </div>
      </div>

      {/* Fixed Bottom Button with Gradient */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="h-[24px] bg-gradient-to-t from-white to-transparent pointer-events-none" />
        <div className="px-[20px] pb-[20px] bg-white flex-shrink-0">
          <button
            onClick={handleGoToDashboard}
            className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[50px] transition-all active:scale-95 shadow-[0_2px_12px_rgba(86,196,144,0.2)] flex items-center justify-center gap-[8px]"
          >
            Go to Dashboard
            <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
        {/* Home Indicator */}
        <div className="h-[34px] bg-white flex-shrink-0 relative">
          <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
        </div>
      </div>
    </div>
  );
}