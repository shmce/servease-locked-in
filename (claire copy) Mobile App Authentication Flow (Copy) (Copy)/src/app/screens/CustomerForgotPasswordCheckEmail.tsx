import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Check } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function CustomerForgotPasswordCheckEmail() {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const handleResendEmail = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

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
        <h2 className="font-['Nunito',sans-serif] text-[17px] text-[#1a1a1a]">
          Check Email
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px] flex flex-col items-center justify-center">
        {/* Success Checkmark Circle */}
        <div className="w-[80px] h-[80px] bg-[#56C490] rounded-full flex items-center justify-center mb-[24px]">
          <Check className="w-[40px] h-[40px] text-white" strokeWidth={3} />
        </div>

        <h1 className="font-['Nunito',sans-serif] text-[26px] text-[#1a1a1a] leading-[1.2] mb-[12px] text-center">
          Check your email
        </h1>
        
        <p className="font-['Nunito',sans-serif] text-[15px] text-[#666] leading-[1.5] text-center mb-[32px] max-w-[320px]">
          We sent a password reset link to your email.
        </p>

        {/* Back to Login Button */}
        <button
          onClick={() => navigate("/customer/login")}
          className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[15px] py-[16px] rounded-[50px] transition-all active:scale-95 shadow-[0_2px_12px_rgba(86,196,144,0.2)] mb-[16px]"
        >
          Back to Login
        </button>

        {/* Resend Email Link */}
        <button 
          onClick={handleResendEmail}
          className="font-['Nunito',sans-serif] text-[13px] text-[#56C490]"
        >
          Resend email
        </button>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-[100px] left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white px-[24px] py-[12px] rounded-[12px] font-['Nunito',sans-serif] text-[13px] shadow-lg z-50 animate-[slideDown_0.3s_ease-out]">
          Reset email resent
        </div>
      )}

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}