import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function CustomerForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = email.includes("@") && email.includes(".");

  const handleSendResetLink = () => {
    if (isValidEmail) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        navigate("/customer/forgot-password/check-email");
      }, 800);
    }
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
          Forgot Password
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px]">
        <div className="mt-[24px] mb-[24px]">
          <h1 className="font-['Nunito',sans-serif] text-[26px] text-[#1a1a1a] leading-[1.2] mb-[8px]">
            Forgot Password
          </h1>
          <p className="font-['Nunito',sans-serif] text-[15px] text-[#666] leading-[1.5]">
            Enter your email to receive a reset link.
          </p>
        </div>

        {/* Email Input */}
        <div className="mb-[32px]">
          <label className="font-['Nunito',sans-serif] text-[13px] text-[#1a1a1a] mb-[8px] block">
            Email Address
          </label>
          <input
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] placeholder:text-[#999] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
          />
        </div>

        {/* Send Reset Link Button */}
        <button
          onClick={handleSendResetLink}
          disabled={!isValidEmail || isLoading}
          className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[15px] py-[16px] rounded-[50px] transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 shadow-[0_2px_12px_rgba(86,196,144,0.2)]"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>

        {/* Back to Login Link */}
        <p className="text-center font-['Nunito',sans-serif] text-[13px] text-[#666] mt-[24px]">
          <button 
            onClick={() => navigate("/customer/login")}
            className="text-[#56C490] font-['Nunito',sans-serif]"
          >
            Back to Login
          </button>
        </p>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}