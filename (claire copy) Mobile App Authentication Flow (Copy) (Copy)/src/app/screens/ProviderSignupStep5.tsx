import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { StickyFooterButton } from "../components/StickyFooterButton";

export default function ProviderSignupStep5() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isExpired, setIsExpired] = useState(false);
  const [isResendVisible, setIsResendVisible] = useState(false);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const userEmail = "user@example.com";

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      setIsResendVisible(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
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
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);
    const lastFilledIndex = Math.min(pasted.length, 6) - 1;
    if (lastFilledIndex >= 0) {
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  const handleResendOtp = () => {
    setTimeLeft(300);
    setIsExpired(false);
    setIsResendVisible(false);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleCompleteRegistration = () => {
    const code = otp.join("");
    if (code.length !== 6) return;

    if (isExpired) {
      setError("This code has expired. Please request a new one.");
      triggerShake();
      return;
    }

    if (code === "123456") {
      navigate("/provider/application-submitted", { replace: true });
    } else {
      setError("Invalid verification code. Please try again.");
      triggerShake();
    }
  };

  const isOtpComplete = otp.every((d) => d !== "");

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Top Navigation Bar */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Email Verification
          </h2>
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
            Step 5 of 5
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-[4px] bg-[#e5e5e5] flex-shrink-0">
        <div className="h-full bg-[#56C490] transition-all duration-300" style={{ width: "100%" }} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[16px]">
        <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] leading-[1.2] mt-[24px] mb-[8px]">
          Verify your email
        </h1>
        <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.5] mb-[36px]">
          We sent a 6-digit code to{" "}
          <span className="font-['Nunito',sans-serif] text-[#1a1a1a]">{userEmail}</span>.
          Enter it below to complete your registration.
        </p>

        {/* OTP Input Boxes */}
        <div
          className={`flex justify-center gap-[10px] mb-[24px] transition-transform ${
            shake ? "animate-pulse" : ""
          }`}
          onPaste={handlePaste}
        >
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
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-[50px] h-[56px] text-center font-['Nunito',sans-serif] text-[24px] bg-[#f5f5f5] border-2 rounded-[12px] focus:outline-none transition-all ${
                error
                  ? "border-[#ff4444] bg-[#fff5f5]"
                  : digit
                  ? "border-[#56C490] bg-white"
                  : "border-transparent"
              } focus:border-[#56C490] focus:bg-white`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#ff4444] text-center mb-[16px]">
            {error}
          </p>
        )}

        {/* Timer */}
        <div className="text-center mb-[20px]">
          {!isExpired ? (
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
              Code expires in {formatTime(timeLeft)}
            </p>
          ) : (
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#ff4444]">
              Code has expired
            </p>
          )}
        </div>

        {/* Resend Link */}
        {isResendVisible && (
          <div className="text-center mb-[24px]">
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#666]">
              Didn't receive a code?{" "}
              <button
                onClick={handleResendOtp}
                className="font-['Nunito',sans-serif] text-[#56C490] underline"
              >
                Resend OTP
              </button>
            </p>
          </div>
        )}

        {/* Validation Note */}
        <div className="bg-[#f5f5f5] rounded-[12px] p-[14px] mt-[8px]">
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] text-center leading-[1.5]">
            The code must be used within its 5-minute validity period.
          </p>
        </div>
      </div>

      {/* Sticky Footer Button */}
      <StickyFooterButton
        label="Complete Registration"
        onClick={handleCompleteRegistration}
        disabled={!isOtpComplete}
      />
    </div>
  );
}