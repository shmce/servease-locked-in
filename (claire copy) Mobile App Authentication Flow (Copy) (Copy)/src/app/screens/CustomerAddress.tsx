import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { SearchableDropdown } from "../components/SearchableDropdown";
import { PH_CITIES, PH_PROVINCES } from "../components/ph-locations";
import { StickyFooterButton } from "../components/StickyFooterButton";

export default function CustomerAddress() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    streetAddress: "",
    city: "",
    province: "",
    zipCode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.streetAddress.trim() || formData.streetAddress.length > 255) {
      newErrors.streetAddress = "Street address is required (max 255 characters).";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }
    if (!formData.province.trim()) {
      newErrors.province = "Province is required.";
    }
    if (!formData.zipCode.trim() || !/^\d+$/.test(formData.zipCode.trim())) {
      newErrors.zipCode = "Please enter a valid ZIP code.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid =
    formData.streetAddress.trim() !== "" &&
    formData.city.trim() !== "" &&
    formData.province.trim() !== "" &&
    formData.zipCode.trim() !== "";

  const handleCreateAccount = () => {
    if (validate()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        navigate("/customer/registration-success");
      }, 800);
    }
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
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Your Address
          </h2>
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
            Step 2 of 2
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-[4px] bg-[#e5e5e5] flex-shrink-0">
        <div className="h-full bg-[#56C490] transition-all duration-300" style={{ width: "100%" }} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[120px]">
        <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] leading-[1.2] mt-[24px] mb-[8px]">
          Where are you located?
        </h1>
        <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.5] mb-[32px]">
          Help us match you with nearby service providers.
        </p>

        {/* Form Fields */}
        <div className="space-y-[20px]">
          {/* Street Address / Landmark */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Street Address / Landmark <span className="text-[#ff4444]">*</span>
            </label>
            <input
              type="text"
              value={formData.streetAddress}
              onChange={(e) => handleInputChange("streetAddress", e.target.value.slice(0, 255))}
              placeholder="e.g. 123 Rizal St., near SM"
              className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all ${
                errors.streetAddress ? "border-[#ff4444]" : "border-transparent"
              }`}
            />
            {errors.streetAddress && (
              <p className="font-['Nunito',sans-serif] text-[11px] text-[#ff4444] mt-[6px]">
                {errors.streetAddress}
              </p>
            )}
          </div>

          {/* City */}
          <SearchableDropdown
            label="City"
            required
            placeholder="Search your city"
            options={PH_CITIES}
            value={formData.city}
            onChange={(val) => handleInputChange("city", val)}
            error={errors.city}
          />

          {/* Province */}
          <SearchableDropdown
            label="Province"
            required
            placeholder="Search your province"
            options={PH_PROVINCES}
            value={formData.province}
            onChange={(val) => handleInputChange("province", val)}
            error={errors.province}
          />

          {/* ZIP Code */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              ZIP Code <span className="text-[#ff4444]">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.zipCode}
              onChange={(e) => handleInputChange("zipCode", e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 1000"
              className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all ${
                errors.zipCode ? "border-[#ff4444]" : "border-transparent"
              }`}
            />
            {errors.zipCode && (
              <p className="font-['Nunito',sans-serif] text-[11px] text-[#ff4444] mt-[6px]">
                {errors.zipCode}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Footer Button */}
      <StickyFooterButton
        label={isLoading ? "Creating account..." : "Create Account"}
        onClick={handleCreateAccount}
        disabled={!isFormValid || isLoading}
      />
    </div>
  );
}