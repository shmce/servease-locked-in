import { useState, startTransition } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ChevronDown, X } from "lucide-react";
import { StatusBar } from "./StatusBar";

interface Country {
  name: string;
  code: string;
  flag: string;
}

const countries: Country[] = [
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Philippines", code: "+63", flag: "🇵🇭" },
  { name: "India", code: "+91", flag: "🇮🇳" },
];

interface PhoneAuthScreenProps {
  userType: "customer" | "provider";
}

export default function PhoneAuthScreen({ userType }: PhoneAuthScreenProps) {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Remove all non-numeric characters to check length
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  const isValidPhone = cleanPhone.length >= 10;

  const handlePhoneChange = (value: string) => {
    // Allow only digits and basic formatting characters
    const cleaned = value.replace(/[^\d\s()-]/g, "");
    setPhoneNumber(cleaned);
  };

  const handleSendCode = () => {
    if (isValidPhone) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        navigate(`/${userType}/auth/phone/verify`);
      }, 500);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  const backRoute = userType === "customer" ? "/customer/login" : "/provider/login";

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
            {/* Country Code Dropdown */}
            <button
              onClick={() => setShowCountryPicker(true)}
              className="flex items-center justify-between gap-[8px] px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] transition-all active:scale-95 hover:border-[#56C490] hover:bg-white min-w-[100px]"
            >
              <span className="flex items-center gap-[6px]">
                <span className="text-[18px]">{selectedCountry.flag}</span>
                <span>{selectedCountry.code}</span>
              </span>
              <ChevronDown className="w-[16px] h-[16px] text-[#666]" />
            </button>

            {/* Phone Number Input */}
            <input
              type="tel"
              placeholder="(555) 123-4567"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="flex-1 px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] placeholder:text-[#999] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
            />
          </div>
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

      {/* Country Picker Modal */}
      {showCountryPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-[20px] w-full max-h-[500px] animate-[slideUpFromBottom_0.3s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#e5e5e5]">
              <h3 className="font-['Nunito',sans-serif] text-[18px] text-[#1a1a1a]">
                Select Country
              </h3>
              <button
                onClick={() => setShowCountryPicker(false)}
                className="w-[32px] h-[32px] flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-[20px] h-[20px] text-[#666]" />
              </button>
            </div>

            {/* Country List */}
            <div className="overflow-y-auto max-h-[400px]">
              {countries.map((country) => (
                <button
                  key={country.code + country.name}
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full flex items-center justify-between px-[24px] py-[16px] transition-all active:scale-95 ${
                    selectedCountry.code === country.code && selectedCountry.name === country.name
                      ? "bg-[#f5f5f5]"
                      : "hover:bg-[#f9f9f9]"
                  }`}
                >
                  <div className="flex items-center gap-[12px]">
                    <span className="text-[24px]">{country.flag}</span>
                    <span className="font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a]">
                      {country.name}
                    </span>
                  </div>
                  <span className="font-['Nunito',sans-serif] text-[15px] text-[#666]">
                    {country.code}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}