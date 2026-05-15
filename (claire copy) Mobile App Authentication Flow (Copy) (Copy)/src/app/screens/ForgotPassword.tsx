import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email) {
      setSubmitted(true);
    }
  };

  // This is the provider forgot password page
  const handleBack = () => {
    navigate(-1);
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
          onClick={handleBack}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
          Forgot Password
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px]">
        {!submitted ? (
          <>
            <div className="mt-[24px] mb-[24px]">
              <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] leading-[1.2] mb-[8px]">
                Reset your password
              </h1>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.5]">
                Enter your email and we'll send you a link to reset your password
              </p>
            </div>

            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!email}
              className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[50px] transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 mt-[32px] shadow-[0_2px_12px_rgba(86,196,144,0.2)]"
            >
              Send Reset Link
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-[20px] mt-[80px]">
            <div className="bg-[#56C490]/10 rounded-full p-[20px] mb-[24px]">
              <CheckCircle2 className="w-[64px] h-[64px] text-[#56C490]" />
            </div>
            <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] leading-[1.2] mb-[12px]">
              Check your email
            </h1>
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.5] mb-[12px]">
              We've sent a password reset link to
            </p>
            <p className="font-['Nunito',sans-serif] text-[15px] text-[#56C490] mb-[32px]">
              {email}
            </p>
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setSubmitted(false)}
                className="text-[#56C490] font-['Nunito',sans-serif] text-[14px]"
              >
                try again
              </button>
            </p>
            <button
              onClick={() => navigate("/customer/login")}
              className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[50px] transition-all active:scale-95 mt-[40px] shadow-[0_2px_12px_rgba(86,196,144,0.2)]"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}