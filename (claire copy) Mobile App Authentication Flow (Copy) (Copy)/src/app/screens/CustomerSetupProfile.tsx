import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Calendar, ChevronDown } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { StickyFooterButton } from "../components/StickyFooterButton";
import { useOnboarding } from "../contexts/OnboardingContext";

// ─── Floating Label Input ──────────────────────────────────────
function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative w-full">
      <label
        className={`absolute left-[16px] transition-all duration-200 pointer-events-none ${
          active
            ? "top-[8px] text-[11px] text-[#56C490]"
            : "top-[18px] text-[15px] text-[#9CA3AF]"
        } font-['Nunito',sans-serif]`}
      >
        {label}
        {required && <span className="text-[#EF4444] ml-[2px]">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={maxLength}
        className={`w-full h-[58px] pt-[22px] pb-[8px] px-[16px] rounded-[14px] bg-[#F9FAFB] border-2 outline-none font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] transition-colors ${
          focused ? "border-[#56C490] bg-white" : "border-[#E5E7EB]"
        }`}
      />
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────
export default function CustomerSetupProfile() {
  const navigate = useNavigate();
  const { setUserProfile } = useOnboarding();

  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // Validation
  const isFullNameValid = fullName.trim().length >= 2;
  const isMobileValid = /^9\d{9}$/.test(mobileNumber.replace(/\s/g, ""));

  const canContinue = isFullNameValid && isMobileValid;

  const handleContinue = () => {
    setUserProfile({
      fullName: fullName.trim(),
      phone: `+63${mobileNumber.replace(/\s/g, "")}`,
    });
    navigate("/customer/add-address");
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* ── Progress Header ── */}
      <div className="px-[24px] pt-[8px] pb-[20px] flex-shrink-0">
        {/* Top Row: Back + Title */}
        <div className="flex items-center justify-between mb-[20px]">
          <button
            onClick={() => navigate("/customer/login")}
            className="w-[40px] h-[40px] rounded-full bg-[#F3F4F6] flex items-center justify-center transition-all active:scale-90"
          >
            <ArrowLeft className="w-[20px] h-[20px] text-[#374151]" />
          </button>
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#56C490] tracking-[-0.3px]">
            ServEase
          </h1>
          <div className="w-[40px]" /> {/* spacer */}
        </div>

        {/* Progress Bar – 3 segments */}
        <div className="flex gap-[6px] mb-[10px]">
          <div className="flex-1 h-[4px] rounded-full bg-[#56C490]" />
          <div className="flex-1 h-[4px] rounded-full bg-[#E5E7EB]" />
          <div className="flex-1 h-[4px] rounded-full bg-[#E5E7EB]" />
        </div>

        <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] text-right">
          Step 1 of 3
        </p>
      </div>

      {/* ── Scrollable Content ── */}
      <div
        className="flex-1 overflow-y-auto px-[24px] pb-[180px]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Headline */}
        <h2 className="font-['Nunito',sans-serif] text-[26px] text-[#111827] leading-[1.2] mb-[8px]">
          Tell us about yourself
        </h2>
        <p className="font-['Nunito',sans-serif] text-[15px] text-[#6B7280] leading-[1.5] mb-[28px]">
          This helps our independent providers know who they are serving.
        </p>

        {/* ── Form Fields ── */}
        <div className="space-y-[16px]">
          {/* Full Name */}
          <FloatingInput
            label="Full Name"
            value={fullName}
            onChange={setFullName}
            required
          />

          {/* Mobile Number with PH prefix */}
          <div className="relative w-full">
            <label
              className={`absolute left-[16px] transition-all duration-200 pointer-events-none z-10 ${
                mobileNumber.length > 0
                  ? "top-[8px] text-[11px] text-[#56C490]"
                  : "top-[8px] text-[11px] text-[#9CA3AF]"
              } font-['Nunito',sans-serif]`}
            >
              Mobile Number<span className="text-[#EF4444] ml-[2px]">*</span>
            </label>
            <div className="flex items-end w-full h-[58px] rounded-[14px] bg-[#F9FAFB] border-2 border-[#E5E7EB] focus-within:border-[#56C490] focus-within:bg-white transition-colors overflow-hidden">
              {/* PH Flag + Prefix */}
              <div className="flex items-center gap-[6px] pl-[16px] pb-[10px] pt-[22px] flex-shrink-0">
                <span className="text-[20px] leading-none">🇵🇭</span>
                <span className="font-['Nunito',sans-serif] text-[15px] text-[#374151]">
                  +63
                </span>
                <div className="w-[1px] h-[20px] bg-[#D1D5DB] mx-[4px]" />
              </div>
              <input
                type="tel"
                inputMode="numeric"
                value={mobileNumber}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setMobileNumber(v);
                }}
                placeholder="9XX XXX XXXX"
                className="flex-1 h-full pt-[22px] pb-[10px] pr-[16px] bg-transparent outline-none font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] placeholder:text-[#C4C4C4]"
              />
            </div>
          </div>

          {/* Referral Code (Optional) */}
          <div className="relative w-full">
            <label
              className={`absolute left-[16px] transition-all duration-200 pointer-events-none ${
                referralCode.length > 0
                  ? "top-[8px] text-[11px] text-[#56C490]"
                  : "top-[16px] text-[14px] text-[#9CA3AF]"
              } font-['Nunito',sans-serif]`}
            >
              Referral Code{" "}
              <span className="text-[#C4C4C4] font-['Nunito',sans-serif]">
                (Optional)
              </span>
            </label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) =>
                setReferralCode(e.target.value.toUpperCase().slice(0, 10))
              }
              className={`w-full h-[52px] pt-[20px] pb-[6px] px-[16px] rounded-[12px] bg-[#F9FAFB] border border-dashed outline-none font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] transition-colors ${
                referralCode
                  ? "border-[#56C490] bg-[#F0FFF6]"
                  : "border-[#D1D5DB]"
              } focus:border-[#56C490]`}
              maxLength={10}
            />
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom CTA ── */}
      <StickyFooterButton
        label="Continue to Address"
        onClick={handleContinue}
        disabled={!canContinue}
      />
    </div>
  );
}