import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function AuthPhone() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  // Get user type from search params (customer or provider)
  const userType = searchParams.get("type") || "customer";
  
  // Remove all non-numeric characters to check length
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  
  // Philippine mobile validation: exactly 10 digits starting with 9
  const isValidPhone = cleanPhone.length === 10 && cleanPhone.startsWith("9");
  
  const showError = touched && cleanPhone.length > 0 && !isValidPhone;

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    
    // Limit to 10 digits
    const limited = digits.slice(0, 10);
    
    // Format as: 9XX XXX XXXX
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
    if (!touched) setTouched(true);
  };

  const handleSendCode = () => {
    if (isValidPhone) {
      setIsLoading(true);
      // Store phone number and user type for the verify screen
      sessionStorage.setItem("phoneNumber", `+63${cleanPhone}`);
      sessionStorage.setItem("userType", userType);
      
      setTimeout(() => {
        setIsLoading(false);
        navigate(`/auth/phone/verify?type=${userType}`);
      }, 500);
    }
  };

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
        <h2 className="font-['Nunito',sans-serif] text-[17px] text-[#1a1a1a]">
          Phone Sign In
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px]">
        <div className="mt-[24px] mb-[24px]">
          <h1 className="font-['Nunito',sans-serif] text-[26px] text-[#1a1a1a] leading-[1.2] mb-[8px]">
            Continue with Phone
          </h1>
          <p className="font-['Nunito',sans-serif] text-[15px] text-[#666] leading-[1.5]">
            We'll send you a verification code
          </p>
        </div>

        <div className="mb-[32px]">
          {/* Phone Number Label */}
          <label className="font-['Nunito',sans-serif] text-[13px] text-[#1a1a1a] mb-[8px] block">
            Phone Number
          </label>

          {/* Combined Phone Input Row */}
          <div className="flex gap-[12px]">
            {/* Fixed Country Code (Philippines) */}
            <div className="flex items-center gap-[8px] px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-[#e5e5e5] rounded-[12px] font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a]">
              <span className="text-[18px]">🇵🇭</span>
              <span>+63</span>
            </div>

            {/* Phone Number Input */}
            <input
              type="tel"
              placeholder="9XX XXX XXXX"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={() => setTouched(true)}
              className={`flex-1 px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] placeholder:text-[#999] focus:outline-none focus:bg-white transition-all ${
                showError 
                  ? 'border-red-500' 
                  : isValidPhone
                  ? 'border-[#56C490]'
                  : 'border-transparent focus:border-[#56C490]'
              }`}
            />
          </div>

          {/* Error Message */}
          {showError && (
            <p className="font-['Nunito',sans-serif] text-[12px] text-red-500 mt-[6px]">
              {cleanPhone.length > 0 && !cleanPhone.startsWith("9")
                ? "Philippine mobile numbers must start with 9"
                : "Please enter a valid Philippine mobile number (10 digits)"}
            </p>
          )}

          {/* Helper Text */}
          {!showError && cleanPhone.length === 0 && (
            <p className="font-['Nunito',sans-serif] text-[12px] text-[#999] mt-[6px]">
              Enter your 10-digit mobile number (e.g., 917 123 4567)
            </p>
          )}
        </div>

        {/* Send Code Button */}
        <button
          onClick={handleSendCode}
          disabled={!isValidPhone || isLoading}
          className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[15px] py-[16px] rounded-[50px] transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 shadow-[0_2px_12px_rgba(86,196,144,0.2)]"
        >
          {isLoading ? "Sending..." : "Send Code"}
        </button>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}