import { useState, useRef, useEffect, startTransition } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { StatusBar } from "./StatusBar";

interface PhoneVerifyScreenProps {
  userType: "customer" | "provider";
}

export default function PhoneVerifyScreen({ userType }: PhoneVerifyScreenProps) {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isComplete = otp.every((digit) => digit !== "");

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = () => {
    if (isComplete) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const homeRoute = userType === "customer" ? "/customer/home" : "/provider/home";
        navigate(homeRoute);
      }, 500);
    }
  };

  const handleResendCode = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const backRoute = `/${userType}/auth/phone`;

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>
      
      {/* Top Navigation Bar */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0 border-b border-[#e5e5e5]">
        <button
          onClick={() => startTransition(() => navigate(backRoute))}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <h2 className="font-['Nunito',sans-serif] text-[17px] text-[#1a1a1a]">
          Verify phone
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px]">
        <div className="mt-[24px] mb-[32px]">
          <h1 className="font-['Nunito',sans-serif] text-[26px] text-[#1a1a1a] leading-[1.2] mb-[8px]">
            Enter verification code
          </h1>
          <p className="font-['Nunito',sans-serif] text-[15px] text-[#666] leading-[1.5]">
            Enter the 6-digit code we sent to your phone.
          </p>
        </div>

        {/* OTP Input Boxes */}
        <div className="flex justify-center items-center mb-[24px]">
          <div className="flex gap-[8px]">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`w-[48px] h-[56px] text-center bg-white border-2 rounded-[12px] font-['Nunito',sans-serif] text-[26px] text-[#1a1a1a] focus:outline-none transition-all ${
                  digit 
                    ? 'border-[#56C490] bg-[#56C490]/5' 
                    : 'border-[#e0e0e0] focus:border-[#56C490] focus:bg-white'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Resend Code Link */}
        <div className="text-center mb-[32px]">
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#666] mb-[8px]">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResendCode}
            className="font-['Nunito',sans-serif] text-[14px] text-[#56C490] transition-all active:scale-95"
          >
            Resend code
          </button>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!isComplete || isLoading}
          className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[15px] py-[16px] rounded-[50px] transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 shadow-[0_2px_12px_rgba(86,196,144,0.2)]"
        >
          {isLoading ? "Verifying..." : "Verify"}
        </button>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-[100px] left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white px-[24px] py-[12px] rounded-[12px] font-['Nunito',sans-serif] text-[13px] shadow-lg z-50 animate-[slideDown_0.3s_ease-out]">
          Code resent
        </div>
      )}

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}