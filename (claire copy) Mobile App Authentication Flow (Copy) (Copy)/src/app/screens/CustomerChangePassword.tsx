import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, Eye, EyeOff, Check } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

type Step = "phone" | "otp" | "password" | "success";

export default function CustomerChangePassword() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("+63");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handle phone number input
  const handlePhoneChange = (value: string) => {
    // Ensure +63 prefix remains
    if (!value.startsWith("+63")) {
      setPhoneNumber("+63");
      return;
    }
    
    // Only allow numbers after +63
    const phoneDigits = value.slice(3).replace(/\D/g, "");
    setPhoneNumber(`+63${phoneDigits}`);
  };

  // Send OTP
  const handleSendOTP = () => {
    setErrors({});
    
    // Validate phone number (Philippine format: +63 followed by 10 digits)
    const phoneDigits = phoneNumber.slice(3);
    if (phoneDigits.length !== 10) {
      setErrors({ phone: "Please enter a valid 10-digit phone number" });
      return;
    }
    
    // Simulate sending OTP
    console.log("Sending OTP to:", phoneNumber);
    setCurrentStep("otp");
  };

  // Handle OTP input
  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector<HTMLInputElement>(
        `input[name=otp-${index + 1}]`
      );
      nextInput?.focus();
    }
  };

  // Handle OTP paste
  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const digits = pastedData.split("").filter((char) => /^\d$/.test(char));
    
    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });
    setOtp(newOtp);
  };

  // Verify OTP
  const handleVerifyOTP = () => {
    setErrors({});
    
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setErrors({ otp: "Please enter the complete 6-digit code" });
      return;
    }

    // Simulate OTP verification
    console.log("Verifying OTP:", otpCode);
    setCurrentStep("password");
  };

  // Validate password
  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push("at least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("one uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("one lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("one number");
    
    return errors;
  };

  // Submit new password
  const handleSubmitPassword = () => {
    setErrors({});
    
    // Validate new password
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setErrors({ newPassword: `Password must contain ${passwordErrors.join(", ")}` });
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    // Simulate password update
    console.log("Updating password...");
    setCurrentStep("success");
  };

  // Resend OTP
  const handleResendOTP = () => {
    setOtp(["", "", "", "", "", ""]);
    console.log("Resending OTP to:", phoneNumber);
    // In production, this would trigger another OTP send
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] py-[12px] flex items-center gap-[16px] border-b border-[#F2F2F2] flex-shrink-0">
        <button
          onClick={() => currentStep === "success" ? navigate("/customer/settings") : navigate(-1)}
          className="w-[40px] h-[40px] flex items-center justify-center -ml-[8px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-[24px] h-[24px] text-[#111827]" />
        </button>
        <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
          Change Password
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        <div className="px-[24px] py-[32px]">
          {/* Step 1: Phone Number Verification */}
          {currentStep === "phone" && (
            <div className="space-y-[24px]">
              <div>
                <h2 className="font-['Nunito',sans-serif] text-[20px] text-[#111827] mb-[8px]">
                  Verify Your Phone Number
                </h2>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                  We'll send a verification code to your registered phone number
                </p>
              </div>

              <div>
                <label className="block font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[8px]">
                  Phone Number <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+63 XXX XXX XXXX"
                  className={`w-full px-[16px] py-[12px] rounded-[12px] border-2 ${
                    errors.phone ? "border-[#EF4444]" : "border-[#E5E7EB]"
                  } font-['Nunito',sans-serif] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] transition-all`}
                />
                {errors.phone && (
                  <p className="mt-[8px] font-['Nunito',sans-serif] text-[12px] text-[#EF4444]">
                    {errors.phone}
                  </p>
                )}
              </div>

              <button
                onClick={handleSendOTP}
                className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[14px] rounded-[12px] transition-all active:scale-95 hover:bg-[#00a055]"
              >
                Send Verification Code
              </button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === "otp" && (
            <div className="space-y-[24px]">
              <div>
                <h2 className="font-['Nunito',sans-serif] text-[20px] text-[#111827] mb-[8px]">
                  Enter Verification Code
                </h2>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                  We sent a 6-digit code to{" "}
                  <span className="font-['Nunito',sans-serif] text-[#111827]">
                    {phoneNumber}
                  </span>
                </p>
              </div>

              <div>
                <label className="block font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[12px]">
                  Verification Code
                </label>
                <div className="flex gap-[8px] justify-between">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      name={`otp-${index}`}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onPaste={index === 0 ? handleOTPPaste : undefined}
                      maxLength={1}
                      className={`w-[48px] h-[56px] text-center rounded-[12px] border-2 ${
                        errors.otp ? "border-[#EF4444]" : "border-[#E5E7EB]"
                      } font-['Nunito',sans-serif] text-[20px] text-[#111827] focus:outline-none focus:border-[#56C490] transition-all`}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="mt-[8px] font-['Nunito',sans-serif] text-[12px] text-[#EF4444]">
                    {errors.otp}
                  </p>
                )}
              </div>

              <div className="text-center">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[8px]">
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResendOTP}
                  className="font-['Nunito',sans-serif] text-[14px] text-[#56C490] transition-all active:scale-95"
                >
                  Resend Code
                </button>
              </div>

              <button
                onClick={handleVerifyOTP}
                className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[14px] rounded-[12px] transition-all active:scale-95 hover:bg-[#00a055]"
              >
                Verify Code
              </button>
            </div>
          )}

          {/* Step 3: New Password */}
          {currentStep === "password" && (
            <div className="space-y-[24px]">
              <div>
                <h2 className="font-['Nunito',sans-serif] text-[20px] text-[#111827] mb-[8px]">
                  Create New Password
                </h2>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                  Your password must be at least 8 characters and include uppercase, lowercase, and numbers
                </p>
              </div>

              <div>
                <label className="block font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[8px]">
                  New Password <span className="text-[#EF4444]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={`w-full px-[16px] py-[12px] pr-[48px] rounded-[12px] border-2 ${
                      errors.newPassword ? "border-[#EF4444]" : "border-[#E5E7EB]"
                    } font-['Nunito',sans-serif] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-[16px] top-1/2 -translate-y-1/2 transition-all active:scale-90"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-[20px] h-[20px] text-[#9CA3AF]" />
                    ) : (
                      <Eye className="w-[20px] h-[20px] text-[#9CA3AF]" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-[8px] font-['Nunito',sans-serif] text-[12px] text-[#EF4444]">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[8px]">
                  Confirm Password <span className="text-[#EF4444]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className={`w-full px-[16px] py-[12px] pr-[48px] rounded-[12px] border-2 ${
                      errors.confirmPassword ? "border-[#EF4444]" : "border-[#E5E7EB]"
                    } font-['Nunito',sans-serif] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-[16px] top-1/2 -translate-y-1/2 transition-all active:scale-90"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-[20px] h-[20px] text-[#9CA3AF]" />
                    ) : (
                      <Eye className="w-[20px] h-[20px] text-[#9CA3AF]" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-[8px] font-['Nunito',sans-serif] text-[12px] text-[#EF4444]">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                onClick={handleSubmitPassword}
                className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[14px] rounded-[12px] transition-all active:scale-95 hover:bg-[#00a055]"
              >
                Update Password
              </button>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === "success" && (
            <div className="flex flex-col items-center justify-center py-[60px]">
              <div className="w-[100px] h-[100px] bg-[#56C490]/10 rounded-full flex items-center justify-center mb-[24px]">
                <div className="w-[80px] h-[80px] bg-[#56C490] rounded-full flex items-center justify-center">
                  <Check className="w-[48px] h-[48px] text-white" strokeWidth={3} />
                </div>
              </div>
              
              <h2 className="font-['Nunito',sans-serif] text-[24px] text-[#111827] mb-[12px] text-center">
                Password Successfully Updated
              </h2>
              
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] text-center mb-[32px]">
                Your password has been changed successfully. You can now use your new password to log in.
              </p>

              <button
                onClick={() => navigate("/customer/settings")}
                className="bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] px-[48px] py-[14px] rounded-[12px] transition-all active:scale-95 hover:bg-[#00a055]"
              >
                Return to Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
