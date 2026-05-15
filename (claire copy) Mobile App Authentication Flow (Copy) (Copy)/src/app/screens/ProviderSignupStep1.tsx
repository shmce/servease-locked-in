import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Eye, EyeOff, Check, Circle, Calendar } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { MiniCalendar } from "../components/MiniCalendar";
import { StickyFooterButton } from "../components/StickyFooterButton";

export default function ProviderSignupStep1() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [contactNumberTouched, setContactNumberTouched] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

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

  const confirmPasswordMismatch =
    confirmPasswordTouched &&
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

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
    if (field === "confirmPassword") {
      setConfirmPasswordTouched(true);
    }
    if (field === "contactNumber") {
      setContactNumberTouched(true);
    }
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const calculateAge = (dob: string): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob + "T00:00:00");
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(formData.dateOfBirth);

  const formatDisplayDate = (isoDate: string): string => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${month}/${day}/${year}`;
  };

  const parseSelectedDate = (): Date | null => {
    if (!formData.dateOfBirth) return null;
    const [year, month, day] = formData.dateOfBirth.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName || formData.fullName.length < 2 || formData.fullName.length > 100) {
      newErrors.fullName = "Full name must be 2–100 characters.";
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.contactNumber || formData.contactNumber.length !== 10) {
      newErrors.contactNumber = "Please enter exactly 10 digits (e.g. 9171234567).";
    } else if (!formData.contactNumber.startsWith("9")) {
      newErrors.contactNumber = "Must start with 9";
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required.";
    } else if (age !== null && age < 18) {
      newErrors.dateOfBirth = "You must be 18 or older to register as a provider";
    }
    if (!formData.password || !allPasswordRequirementsMet) {
      newErrors.password = "Password does not meet requirements.";
    }
    if (!formData.confirmPassword || formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      navigate("/provider/signup/step2", { state: { ...formData } });
    }
  };

  const isFormValid =
    formData.fullName.length >= 2 &&
    formData.email.includes("@") &&
    formData.contactNumber.length === 10 &&
    formData.contactNumber.startsWith("9") &&
    formData.dateOfBirth !== "" &&
    (age !== null && age >= 18) &&
    allPasswordRequirementsMet &&
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

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
            Personal Information
          </h2>
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
            Step 1 of 5
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-[4px] bg-[#e5e5e5] flex-shrink-0">
        <div className="h-full bg-[#56C490] transition-all duration-300" style={{ width: "20%" }} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[120px]">
        <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] leading-[1.2] mt-[24px] mb-[8px]">
          Create your account
        </h1>
        <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.5] mb-[32px]">
          Fill in your personal details to get started.
        </p>

        {/* Form Fields */}
        <div className="space-y-[20px]">
          {/* Full Name */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Full Name <span className="text-[#ff4444]">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder="Enter your full name"
              className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all ${
                errors.fullName ? "border-[#ff4444]" : "border-transparent"
              }`}
            />
            {errors.fullName && (
              <p className="font-['Nunito',sans-serif] text-[11px] text-[#ff4444] mt-[6px]">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Email Address <span className="text-[#ff4444]">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email address"
              className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all ${
                errors.email ? "border-[#ff4444]" : "border-transparent"
              }`}
            />
            <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mt-[6px]">
              Required for account creation
            </p>
            {errors.email && (
              <p className="font-['Nunito',sans-serif] text-[11px] text-[#ff4444] mt-[2px]">
                {errors.email}
              </p>
            )}
          </div>

          {/* Contact Number */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Contact Number <span className="text-[#ff4444]">*</span>
            </label>
            <div
              className={`flex items-center w-full bg-[#f5f5f5] border-2 rounded-[12px] transition-all ${
                errors.contactNumber || contactNumberStartError
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

          {/* Date of Birth */}
          <div className="relative">
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Date of Birth <span className="text-[#ff4444]">*</span>
              {formData.dateOfBirth && age !== null && age >= 0 && (
                <span className={`font-['Nunito',sans-serif] text-[12px] ml-[6px] ${
                  age < 18 ? "text-[#EF4444]" : "text-[#9CA3AF]"
                }`}>
                  ({age} years old)
                </span>
              )}
            </label>
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className={`w-full px-[16px] py-[14px] pr-[48px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-left focus:outline-none transition-all ${
                showCalendar
                  ? "border-[#56C490] bg-white"
                  : errors.dateOfBirth
                  ? "border-[#EF4444]"
                  : "border-transparent"
              }`}
            >
              <span className={formData.dateOfBirth ? "text-[#1a1a1a]" : "text-[#9CA3AF]"}>
                {formData.dateOfBirth ? formatDisplayDate(formData.dateOfBirth) : "MM/DD/YYYY"}
              </span>
            </button>
            <Calendar
              className={`absolute right-[16px] top-[46px] w-[20px] h-[20px] pointer-events-none transition-colors ${
                showCalendar ? "text-[#56C490]" : "text-[#9CA3AF]"
              }`}
            />

            {showCalendar && (
              <MiniCalendar
                selectedDate={parseSelectedDate()}
                maxDate={new Date()}
                onSet={(date) => {
                  const y = date.getFullYear();
                  const m = String(date.getMonth() + 1).padStart(2, "0");
                  const d = String(date.getDate()).padStart(2, "0");
                  handleInputChange("dateOfBirth", `${y}-${m}-${d}`);
                  setShowCalendar(false);
                }}
                onCancel={() => setShowCalendar(false)}
              />
            )}
            {errors.dateOfBirth && (
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#EF4444] mt-[6px]">
                {errors.dateOfBirth}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Password <span className="text-[#ff4444]">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full px-[16px] py-[14px] pr-[48px] bg-[#F9FAFB] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:bg-white transition-all ${
                  allPasswordRequirementsMet
                    ? "border-[#56C490]"
                    : errors.password
                    ? "border-[#ff4444]"
                    : "border-transparent focus:border-[#56C490]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[12px] top-1/2 -translate-y-1/2 p-[8px] transition-all active:scale-90"
              >
                {showPassword ? (
                  <EyeOff className="w-[20px] h-[20px] text-[#9CA3AF]" />
                ) : (
                  <Eye className="w-[20px] h-[20px] text-[#9CA3AF]" />
                )}
              </button>
            </div>

            {/* Password Requirements Checklist */}
            <div className="mt-[12px] space-y-[6px]">
              <div className="flex items-center gap-[8px]">
                {passwordRequirements.minLength ? (
                  <Check className="w-[16px] h-[16px] text-[#56C490]" strokeWidth={2.5} />
                ) : (
                  <Circle className="w-[16px] h-[16px] text-[#9CA3AF]" strokeWidth={2} />
                )}
                <p
                  className={`font-['Nunito',sans-serif] text-[12px] ${
                    passwordRequirements.minLength ? "text-[#56C490]" : "text-[#9CA3AF]"
                  }`}
                >
                  At least 8 characters
                </p>
              </div>

              <div className="flex items-center gap-[8px]">
                {passwordRequirements.hasUppercase ? (
                  <Check className="w-[16px] h-[16px] text-[#56C490]" strokeWidth={2.5} />
                ) : (
                  <Circle className="w-[16px] h-[16px] text-[#9CA3AF]" strokeWidth={2} />
                )}
                <p
                  className={`font-['Nunito',sans-serif] text-[12px] ${
                    passwordRequirements.hasUppercase ? "text-[#56C490]" : "text-[#9CA3AF]"
                  }`}
                >
                  One uppercase letter (A–Z)
                </p>
              </div>

              <div className="flex items-center gap-[8px]">
                {passwordRequirements.hasLowercase ? (
                  <Check className="w-[16px] h-[16px] text-[#56C490]" strokeWidth={2.5} />
                ) : (
                  <Circle className="w-[16px] h-[16px] text-[#9CA3AF]" strokeWidth={2} />
                )}
                <p
                  className={`font-['Nunito',sans-serif] text-[12px] ${
                    passwordRequirements.hasLowercase ? "text-[#56C490]" : "text-[#9CA3AF]"
                  }`}
                >
                  One lowercase letter (a–z)
                </p>
              </div>

              <div className="flex items-center gap-[8px]">
                {passwordRequirements.hasNumber ? (
                  <Check className="w-[16px] h-[16px] text-[#56C490]" strokeWidth={2.5} />
                ) : (
                  <Circle className="w-[16px] h-[16px] text-[#9CA3AF]" strokeWidth={2} />
                )}
                <p
                  className={`font-['Nunito',sans-serif] text-[12px] ${
                    passwordRequirements.hasNumber ? "text-[#56C490]" : "text-[#9CA3AF]"
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
              Confirm Password <span className="text-[#ff4444]">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                onBlur={() => setConfirmPasswordTouched(true)}
                className={`w-full px-[16px] py-[14px] pr-[48px] bg-[#F9FAFB] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:bg-white transition-all ${
                  confirmPasswordMismatch || errors.confirmPassword ? "border-[#EF4444]" : "border-transparent focus:border-[#56C490]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-[12px] top-1/2 -translate-y-1/2 p-[8px] transition-all active:scale-90"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-[20px] h-[20px] text-[#9CA3AF]" />
                ) : (
                  <Eye className="w-[20px] h-[20px] text-[#9CA3AF]" />
                )}
              </button>
            </div>
            {(confirmPasswordMismatch || errors.confirmPassword) && (
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#EF4444] mt-[6px]">
                Passwords do not match
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Footer Button */}
      <StickyFooterButton
        label="Next Step"
        onClick={handleContinue}
        disabled={!isFormValid}
      />
    </div>
  );
}