import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { SearchableDropdown } from "../components/SearchableDropdown";
import { PH_CITIES, PH_PROVINCES } from "../components/ph-locations";
import { StickyFooterButton } from "../components/StickyFooterButton";

export default function ProviderSignupStep3() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    streetAddress: "",
    city: "",
    province: "",
    zipCode: "",
  });
  const [serviceRadius, setServiceRadius] = useState(10);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [zipCodeTouched, setZipCodeTouched] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    if (field === "zipCode") {
      // Only allow digits, max 4 characters
      const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
      setFormData({ ...formData, [field]: digitsOnly });
    } else {
      setFormData({ ...formData, [field]: value });
    }
    if (field === "zipCode") {
      setZipCodeTouched(true);
    }
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const zipCodeError =
    zipCodeTouched &&
    formData.zipCode.length > 0 &&
    formData.zipCode.length !== 4;

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
    if (!formData.zipCode.trim() || formData.zipCode.length !== 4) {
      newErrors.zipCode = "ZIP code must be exactly 4 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      navigate("/provider/signup/step4");
    }
  };

  const isFormValid =
    formData.streetAddress.trim() !== "" &&
    formData.city.trim() !== "" &&
    formData.province.trim() !== "" &&
    formData.zipCode.length === 4;

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
            Service Location
          </h2>
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
            Step 3 of 5
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-[4px] bg-[#e5e5e5] flex-shrink-0">
        <div className="h-full bg-[#56C490] transition-all duration-300" style={{ width: "60%" }} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[16px]">
        <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] leading-[1.2] mt-[24px] mb-[8px]">
          Where do you work?
        </h1>
        <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.5] mb-[32px]">
          Set your service area so customers can find you.
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
              onChange={(e) => handleInputChange("zipCode", e.target.value)}
              onBlur={() => setZipCodeTouched(true)}
              placeholder="e.g. 1000"
              maxLength={4}
              className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all ${
                errors.zipCode || zipCodeError ? "border-[#EF4444]" : "border-transparent"
              }`}
            />
            {(zipCodeError || errors.zipCode) && (
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#EF4444] mt-[6px]">
                ZIP code must be exactly 4 digits
              </p>
            )}
          </div>

          {/* Max Service Radius Slider */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Maximum Service Radius <span className="text-[#ff4444]">*</span>
            </label>
            <div className="flex items-center gap-[16px] mb-[8px]">
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={serviceRadius}
                  onChange={(e) => setServiceRadius(Number(e.target.value))}
                  className="w-full h-[6px] bg-[#e5e5e5] rounded-[50px] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[24px] [&::-webkit-slider-thumb]:h-[24px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#56C490] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                  style={{
                    background: `linear-gradient(to right, #56C490 0%, #56C490 ${
                      ((serviceRadius - 1) / 49) * 100
                    }%, #e5e5e5 ${((serviceRadius - 1) / 49) * 100}%, #e5e5e5 100%)`,
                  }}
                />
              </div>
              <div className="w-[70px] text-right">
                <span className="font-['Nunito',sans-serif] text-[18px] text-[#56C490]">
                  {serviceRadius}
                </span>
                <span className="font-['Nunito',sans-serif] text-[13px] text-[#666] ml-[4px]">
                  km
                </span>
              </div>
            </div>
            <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
              How far are you willing to travel for service calls?
            </p>
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