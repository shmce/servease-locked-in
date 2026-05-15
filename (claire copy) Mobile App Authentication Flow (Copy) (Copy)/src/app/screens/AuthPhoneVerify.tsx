import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, X } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

type ErrorType = null | "invalid" | "expired";

export default function AuthPhoneVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResendToast, setShowResendToast] = useState(false);
  const [error, setError] = useState<ErrorType>(null);
  const [shake, setShake] = useState(false);
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get user type from search params or session storage
  const userType = searchParams.get("type") || sessionStorage.getItem("userType") || "customer";
  const phoneNumber = sessionStorage.getItem("phoneNumber") || "+63 9XX XXX XXXX";

  const isComplete = otp.every((digit) => digit !== "");
  const isExpired = timer === 0;

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timerActive && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            setError("expired");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive, timer]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }

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

    // Clear error when pasting
    if (error) {
      setError(null);
    }

    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = () => {
    if (!isComplete) return;
    
    // Check if expired
    if (isExpired) {
      setError("expired");
      return;
    }

    setIsLoading(true);
    
    // Simulate verification (mock: random success/failure for demo)
    setTimeout(() => {
      setIsLoading(false);
      
      // Mock: 20% chance of invalid code for demonstration
      const isValidCode = Math.random() > 0.2;
      
      if (isValidCode) {
        // Success: Navigate to home based on user type
        const homeRoute = userType === "customer" ? "/customer/home" : "/provider/home";
        navigate(homeRoute);
        // Clear session storage
        sessionStorage.removeItem("phoneNumber");
        sessionStorage.removeItem("userType");
      } else {
        // Invalid code error
        setError("invalid");
        setShake(true);
        
        // Clear OTP after shake animation
        setTimeout(() => {
          setOtp(["", "", "", "", "", ""]);
          setShake(false);
          inputRefs.current[0]?.focus();
        }, 300);
      }
    }, 500);
  };

  const handleResendCode = () => {
    // Reset everything
    setTimer(60);
    setTimerActive(true);
    setError(null);
    setOtp(["", "", "", "", "", ""]);
    
    // Show success toast
    setShowResendToast(true);
    setTimeout(() => {
      setShowResendToast(false);
    }, 3000);
    
    // Focus first input
    inputRefs.current[0]?.focus();
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Format phone number for display (add spaces)
  const formatPhoneDisplay = (phone: string) => {
    // Remove +63 prefix if present
    const digits = phone.replace("+63", "").replace(/\D/g, "");
    if (digits.length === 10) {
      return `+63 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    return phone;
  };

  // Format timer display
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Determine border color based on error state
  const getBorderColor = () => {
    if (error === "invalid") return "border-[#D32F2F]";
    if (error === "expired") return "border-[#F57C00]";
    return "";
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
        <h2 className="font-['Nunito',sans-serif] text-[17px] text-[#1a1a1a]">
          Verify phone
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px]">
        <div className="mt-[24px] mb-[16px]">
          <h1 className="font-['Nunito',sans-serif] text-[26px] text-[#1a1a1a] leading-[1.2] mb-[8px]">
            Enter verification code
          </h1>
          <p className="font-['Nunito',sans-serif] text-[15px] text-[#666] leading-[1.5] mb-[8px]">
            Enter the 6-digit code we sent to {formatPhoneDisplay(phoneNumber)}
          </p>
          
          {/* Timer */}
          <p className={`font-['Nunito',sans-serif] text-[13px] ${
            isExpired ? "text-[#D32F2F]" : "text-[#999]"
          }`}>
            {isExpired ? "Code expired" : `Code expires in ${formatTimer(timer)}`}
          </p>
        </div>

        {/* OTP Input Boxes */}
        <div className="flex flex-col items-center mb-[16px]">
          <div className={`flex gap-[8px] ${shake ? "animate-[shake_300ms_ease-in-out]" : ""}`}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isExpired}
                className={`w-[48px] h-[56px] text-center bg-white border-2 rounded-[12px] font-['Nunito',sans-serif] text-[26px] text-[#1a1a1a] focus:outline-none transition-all ${
                  error 
                    ? getBorderColor()
                    : digit 
                    ? 'border-[#56C490] bg-[#56C490]/5' 
                    : 'border-[#e0e0e0] focus:border-[#56C490] focus:bg-white'
                } ${isExpired ? 'opacity-50' : ''}`}
              />
            ))}
          </div>
          
          {/* Error Message */}
          {error && (
            <p className={`font-['Nunito',sans-serif] text-[13px] mt-[12px] text-center animate-[fadeIn_150ms_ease-out] ${
              error === "invalid" ? "text-[#D32F2F]" : "text-[#F57C00]"
            }`}>
              {error === "invalid" 
                ? "Invalid code. Please try again."
                : "Your code has expired. Please request a new one."}
            </p>
          )}
        </div>

        {/* Resend Code Link */}
        <div className="text-center mb-[32px]">
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#666] mb-[8px]">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResendCode}
            className={`font-['Nunito',sans-serif] text-[14px] transition-all active:scale-95 ${
              isExpired 
                ? "text-[#56C490] font-['Nunito',sans-serif]" 
                : "text-[#56C490]"
            }`}
          >
            Resend code
          </button>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!isComplete || isLoading || isExpired}
          className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[15px] py-[16px] rounded-[50px] transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 shadow-[0_2px_12px_rgba(86,196,144,0.2)]"
        >
          {isLoading ? "Verifying..." : "Verify"}
        </button>
      </div>

      {/* Success Toast for Resend */}
      {showResendToast && (
        <div className="fixed top-[80px] left-[24px] right-[24px] bg-[#E8F5E9] border-l-4 border-[#2E7D32] px-[16px] py-[12px] rounded-[8px] shadow-lg z-50 animate-[slideDown_200ms_ease-out]">
          <div className="flex items-start justify-between gap-[12px]">
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#2E7D32] flex-1">
              A new code has been sent to your number
            </p>
            <button
              onClick={() => setShowResendToast(false)}
              className="flex-shrink-0 transition-all active:scale-90"
            >
              <X className="w-[16px] h-[16px] text-[#2E7D32]" />
            </button>
          </div>
        </div>
      )}

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}