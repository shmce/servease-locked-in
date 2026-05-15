import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Eye, EyeOff, Check, Circle, Phone, X } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { StickyFooterButton } from "../components/StickyFooterButton";
import { useOnboarding } from "../contexts/OnboardingContext";

export default function CustomerRegistration() {
  const navigate = useNavigate();
  const { setUserProfile } = useOnboarding();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    contactNumber: false,
    password: false,
    confirmPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [emailExistsError, setEmailExistsError] = useState(false);
  const [securityError, setSecurityError] = useState(false);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  const allPasswordRequirementsMet =
    passwordRequirements.minLength &&
    passwordRequirements.hasUppercase &&
    passwordRequirements.hasLowercase &&
    passwordRequirements.hasNumber;

  const contactNumberStartError =
    formData.contactNumber.length > 0 &&
    !formData.contactNumber.startsWith("9");

  const errors = {
    fullName:
      touched.fullName && formData.fullName && (formData.fullName.length < 2 || formData.fullName.length > 100)
        ? "Full name must be 2–100 characters."
        : touched.fullName && !formData.fullName
        ? "This field is required"
        : "",
    email:
      touched.email && formData.email && !isValidEmail(formData.email)
        ? "Please enter a valid email address (e.g. name@email.com)"
        : "",
    contactNumber:
      touched.contactNumber && formData.contactNumber && formData.contactNumber.length !== 10
        ? "Please enter exactly 10 digits (e.g. 9171234567)."
        : touched.contactNumber && !formData.contactNumber
        ? "This field is required"
        : contactNumberStartError
        ? "Contact number must start with 9"
        : "",
    password:
      touched.password && formData.password && !allPasswordRequirementsMet
        ? "Password does not meet requirements"
        : "",
    confirmPassword:
      touched.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword
        ? "Passwords do not match"
        : "",
  };

  const isFormValid =
    formData.fullName.length >= 2 &&
    formData.fullName.length <= 100 &&
    formData.email &&
    isValidEmail(formData.email) &&
    formData.contactNumber.length === 10 &&
    formData.contactNumber.startsWith("9") &&
    formData.password &&
    allPasswordRequirementsMet &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });
    if (field === "email") {
      setEmailExistsError(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "contactNumber") {
      // Only allow digits, max 10, auto-strip leading "0"
      let digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.startsWith("0")) {
        digitsOnly = digitsOnly.slice(1);
      }
      digitsOnly = digitsOnly.slice(0, 10);
      setFormData({ ...formData, [field]: digitsOnly });
    } else {
      setFormData({ ...formData, [field]: value });
    }
    if (field === "email" && emailExistsError) {
      setEmailExistsError(false);
    }
  };

  const handleContinue = () => {
    setTouched({
      fullName: true,
      email: true,
      contactNumber: true,
      password: true,
      confirmPassword: true,
    });

    if (isFormValid) {
      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);

        if (formData.email.toLowerCase() === "test@test.com") {
          setEmailExistsError(true);
          return;
        }

        if (Math.random() < 0.1) {
          setSecurityError(true);
          setTimeout(() => setSecurityError(false), 5000);
          return;
        }

        setUserProfile({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.contactNumber,
        });

        navigate("/customer/login");
      }, 800);
    }
  };

  const handleGoogleAuth = () => {
    navigate("/customer/auth/google?return=registration");
  };

  const handlePhoneAuth = () => {
    navigate("/auth/phone?type=customer&return=registration");
  };

  return (
    <div className="bg-[#FAF8F5] w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Fixed Top Navigation Bar */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0 border-b border-[#e5e5e5]">
        <button
          onClick={() => navigate("/signup-role-selection")}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Customer Registration
          </h2>
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
            Step 1 of 2
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-[4px] bg-[#e5e5e5] flex-shrink-0">
        <div className="h-full bg-[#56C490] transition-all duration-300" style={{ width: "50%" }} />
      </div>

      {/* Security Error Banner */}
      {securityError && (
        <div className="bg-[#FFEBEE] border-l-4 border-[#D32F2F] px-[16px] py-[12px] flex items-start justify-between gap-[12px] animate-[slideDown_200ms_ease-out]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#C62828] flex-1">
            Security verification failed. Please try again.
          </p>
          <button
            onClick={() => setSecurityError(false)}
            className="flex-shrink-0 transition-all active:scale-90"
          >
            <X className="w-[16px] h-[16px] text-[#C62828]" />
          </button>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[120px]">
        <div className="mt-[24px] mb-[24px]">
          <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] leading-[1.2] mb-[8px]">
            Create your account
          </h1>
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.5]">
            Fill in your details to get started
          </p>
        </div>

        <div className="space-y-[20px]">
          {/* Full Name */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              onBlur={() => handleBlur("fullName")}
              className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[16px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all ${
                errors.fullName ? "border-[#ff4444]" : "border-transparent"
              }`}
            />
            {errors.fullName && (
              <p className="font-['Nunito',sans-serif] text-[12px] text-red-500 mt-[6px]">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[16px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:bg-white transition-all ${
                errors.email || emailExistsError
                  ? "border-[#D32F2F]"
                  : "border-transparent focus:border-[#56C490]"
              }`}
            />
            {errors.email && (
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#D32F2F] mt-[6px] animate-[fadeIn_150ms_ease-out]">
                {errors.email}
              </p>
            )}
            {emailExistsError && !errors.email && (
              <div className="mt-[6px] animate-[fadeIn_150ms_ease-out]">
                <p className="font-['Nunito',sans-serif] text-[12px] text-[#D32F2F]">
                  This email is already registered.{" "}
                  <button
                    onClick={() => navigate("/customer/login")}
                    className="text-[#56C490] font-['Nunito',sans-serif] text-[14px] underline transition-all active:scale-95"
                  >
                    Log In instead
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Contact Number */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <div
              className={`flex items-center w-full bg-[#f5f5f5] border-2 rounded-[16px] transition-all ${
                contactNumberStartError || errors.contactNumber
                  ? "border-[#EF4444]"
                  : "border-transparent focus-within:border-[#56C490] focus-within:bg-white"
              }`}
            >
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#9CA3AF] pl-[16px] pr-[12px] select-none pointer-events-none">
                +63
              </span>
              <div className="w-[1px] h-[24px] bg-[#ccc] flex-shrink-0" />
              <input
                type="tel"
                inputMode="numeric"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                onBlur={() => handleBlur("contactNumber")}
                placeholder="9XX XXX XXXX"
                className="flex-1 px-[12px] py-[14px] bg-transparent font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none"
              />
            </div>
            {contactNumberStartError ? (
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#EF4444] mt-[6px]">
                Mobile number must start with 9
              </p>
            ) : errors.contactNumber ? (
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#EF4444] mt-[6px]">
                {errors.contactNumber}
              </p>
            ) : (
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mt-[6px]">
                Philippine mobile number (e.g. 9171234567)
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                className={`w-full px-[16px] py-[14px] pr-[48px] bg-[#f5f5f5] border-2 rounded-[16px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:bg-white transition-all ${
                  allPasswordRequirementsMet
                    ? "border-[#56C490]"
                    : touched.password && formData.password && !allPasswordRequirementsMet
                    ? "border-red-500"
                    : "border-transparent focus:border-[#56C490]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[12px] top-1/2 -translate-y-1/2 p-[8px] transition-all active:scale-90"
              >
                {showPassword ? (
                  <EyeOff className="w-[20px] h-[20px] text-[#999]" />
                ) : (
                  <Eye className="w-[20px] h-[20px] text-[#999]" />
                )}
              </button>
            </div>

            {/* Password Requirements Checklist */}
            <div className="mt-[12px] space-y-[6px]">
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#757575] mb-[8px]">
                Password must contain:
              </p>

              <div className="flex items-center gap-[8px]">
                {passwordRequirements.minLength ? (
                  <Check className="w-[16px] h-[16px] text-[#56C490]" strokeWidth={2.5} />
                ) : (
                  <Circle className="w-[16px] h-[16px] text-[#757575]" strokeWidth={2} />
                )}
                <p
                  className={`font-['Nunito',sans-serif] text-[13px] ${
                    passwordRequirements.minLength ? "text-[#56C490]" : "text-[#757575]"
                  }`}
                >
                  At least 8 characters
                </p>
              </div>

              <div className="flex items-center gap-[8px]">
                {passwordRequirements.hasUppercase ? (
                  <Check className="w-[16px] h-[16px] text-[#56C490]" strokeWidth={2.5} />
                ) : (
                  <Circle className="w-[16px] h-[16px] text-[#757575]" strokeWidth={2} />
                )}
                <p
                  className={`font-['Nunito',sans-serif] text-[13px] ${
                    passwordRequirements.hasUppercase ? "text-[#56C490]" : "text-[#757575]"
                  }`}
                >
                  One uppercase letter (A–Z)
                </p>
              </div>

              <div className="flex items-center gap-[8px]">
                {passwordRequirements.hasLowercase ? (
                  <Check className="w-[16px] h-[16px] text-[#56C490]" strokeWidth={2.5} />
                ) : (
                  <Circle className="w-[16px] h-[16px] text-[#757575]" strokeWidth={2} />
                )}
                <p
                  className={`font-['Nunito',sans-serif] text-[13px] ${
                    passwordRequirements.hasLowercase ? "text-[#56C490]" : "text-[#757575]"
                  }`}
                >
                  One lowercase letter (a–z)
                </p>
              </div>

              <div className="flex items-center gap-[8px]">
                {passwordRequirements.hasNumber ? (
                  <Check className="w-[16px] h-[16px] text-[#56C490]" strokeWidth={2.5} />
                ) : (
                  <Circle className="w-[16px] h-[16px] text-[#757575]" strokeWidth={2} />
                )}
                <p
                  className={`font-['Nunito',sans-serif] text-[13px] ${
                    passwordRequirements.hasNumber ? "text-[#56C490]" : "text-[#757575]"
                  }`}
                >
                  One number (0–9)
                </p>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                className="w-full px-[16px] py-[14px] pr-[48px] bg-[#f5f5f5] border-2 border-transparent rounded-[16px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-[12px] top-1/2 -translate-y-1/2 p-[8px] transition-all active:scale-90"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-[20px] h-[20px] text-[#999]" />
                ) : (
                  <Eye className="w-[20px] h-[20px] text-[#999]" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="font-['Nunito',sans-serif] text-[12px] text-red-500 mt-[6px]">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-[16px] my-[24px]">
          <div className="flex-1 h-[1px] bg-[#e5e5e5]" />
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#999]">
            or continue with
          </p>
          <div className="flex-1 h-[1px] bg-[#e5e5e5]" />
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-[12px] mb-[24px]">
          <button
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-[12px] px-[16px] py-[14px] bg-white border-2 border-[#e5e5e5] rounded-[16px] font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] transition-all active:scale-95"
          >
            <svg className="w-[20px] h-[20px]" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Continue with Google
          </button>
          <button
            onClick={handlePhoneAuth}
            className="w-full flex items-center justify-center gap-[12px] px-[16px] py-[14px] bg-white border-2 border-[#e5e5e5] rounded-[16px] font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] transition-all active:scale-95"
          >
            <Phone className="w-[20px] h-[20px]" />
            Continue with Phone Number
          </button>
        </div>
      </div>

      {/* Sticky Footer Button */}
      <StickyFooterButton
        label={isLoading ? "Validating..." : "Next Step"}
        onClick={handleContinue}
        disabled={isLoading}
      />

      <style>{`
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