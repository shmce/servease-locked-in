import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { StickyFooterButton } from "../components/StickyFooterButton";

const SERVICE_CATEGORIES = [
  "Home Maintenance & Repair",
  "Beauty, Wellness & Personal Care",
  "Education & Professional Services",
  "Domestic & Cleaning Services",
  "Pet Services",
  "Events & Entertainment",
  "Automotive & Tech Support",
];

const SUB_CATEGORY_MAP: Record<string, string[]> = {
  "Home Maintenance & Repair": ["Plumbing", "Electrical", "Carpentry", "Painting", "Other"],
  "Beauty, Wellness & Personal Care": ["Hair Styling", "Makeup Artist", "Massage Therapy", "Nails", "Other"],
  "Education & Professional Services": ["Academic Tutor", "Language Teacher", "Music Lessons", "Other"],
  "Domestic & Cleaning Services": ["House Cleaning", "Laundry", "Ironing", "Deep Cleaning", "Other"],
  "Pet Services": ["Pet Grooming", "Dog Walking", "Pet Sitting", "Other"],
  "Events & Entertainment": ["Photography", "Hosting/MC", "Catering", "DJ/Live Music", "Other"],
  "Automotive & Tech Support": ["Car Repair", "Car Wash", "IT/Gadget Repair", "Other"],
};

const EXPERIENCE_LEVELS = [
  "Less than 1 year",
  "1–2 years",
  "3–5 years",
  "6–10 years",
  "10+ years",
];

export default function ProviderSignupStep2() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    primaryCategory: "",
    subCategory: "",
    experienceLevel: "",
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    if (field === "primaryCategory") {
      // Reset sub-category when primary category changes
      setFormData({ ...formData, primaryCategory: value, subCategory: "" });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const closeAllDropdowns = () => {
    setShowCategoryDropdown(false);
    setShowSubCategoryDropdown(false);
    setShowExperienceDropdown(false);
  };

  const handleContinue = () => {
    if (isFormValid) {
      navigate("/provider/signup/step3");
    }
  };

  const isFormValid =
    formData.primaryCategory !== "" &&
    formData.subCategory !== "" &&
    formData.experienceLevel !== "";

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
            Provider Profile
          </h2>
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
            Step 2 of 5
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-[4px] bg-[#e5e5e5] flex-shrink-0">
        <div className="h-full bg-[#56C490] transition-all duration-300" style={{ width: "40%" }} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[120px]">
        <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] leading-[1.2] mt-[24px] mb-[8px]">
          Your Service Profile
        </h1>
        <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.5] mb-[32px]">
          Tell us what type of service you offer and your experience level. You can complete your full profile after approval.
        </p>

        {/* Form Fields */}
        <div className="space-y-[20px]">
          {/* Primary Category Dropdown */}
          <div className="relative">
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Primary Category <span className="text-[#ff4444]">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowSubCategoryDropdown(false);
                setShowExperienceDropdown(false);
              }}
              className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-left flex items-center justify-between transition-all ${
                showCategoryDropdown ? "border-[#56C490] bg-white" : "border-transparent"
              }`}
            >
              <span className={formData.primaryCategory ? "text-[#1a1a1a]" : "text-[#9CA3AF]"}>
                {formData.primaryCategory || "Select your service category"}
              </span>
              <ChevronDown
                className={`w-[20px] h-[20px] text-[#666] transition-transform ${
                  showCategoryDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showCategoryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-[8px] bg-white border-2 border-[#56C490] rounded-[12px] shadow-lg z-10 overflow-hidden max-h-[280px] overflow-y-auto">
                {SERVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      handleInputChange("primaryCategory", cat);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full px-[16px] py-[12px] font-['Nunito',sans-serif] text-[14px] text-left transition-all ${
                      formData.primaryCategory === cat
                        ? "bg-[#56C490]/10 text-[#56C490]"
                        : "text-[#1a1a1a] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sub-category Dropdown */}
          <div className={`relative transition-all ${!formData.primaryCategory ? "opacity-40 pointer-events-none" : ""}`}>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Sub-category <span className="text-[#ff4444]">*</span>
            </label>
            <button
              type="button"
              disabled={!formData.primaryCategory}
              onClick={() => {
                setShowSubCategoryDropdown(!showSubCategoryDropdown);
                setShowCategoryDropdown(false);
                setShowExperienceDropdown(false);
              }}
              className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-left flex items-center justify-between transition-all ${
                showSubCategoryDropdown ? "border-[#56C490] bg-white" : "border-transparent"
              }`}
            >
              <span className={formData.subCategory ? "text-[#1a1a1a]" : "text-[#9CA3AF]"}>
                {formData.subCategory || "Select a sub-category"}
              </span>
              <ChevronDown
                className={`w-[20px] h-[20px] text-[#666] transition-transform ${
                  showSubCategoryDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showSubCategoryDropdown && formData.primaryCategory && (
              <div className="absolute top-full left-0 right-0 mt-[8px] bg-white border-2 border-[#56C490] rounded-[12px] shadow-lg z-10 overflow-hidden max-h-[280px] overflow-y-auto">
                {(SUB_CATEGORY_MAP[formData.primaryCategory] || []).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => {
                      handleInputChange("subCategory", sub);
                      setShowSubCategoryDropdown(false);
                    }}
                    className={`w-full px-[16px] py-[12px] font-['Nunito',sans-serif] text-[14px] text-left transition-all ${
                      formData.subCategory === sub
                        ? "bg-[#56C490]/10 text-[#56C490]"
                        : "text-[#1a1a1a] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Experience Level Dropdown */}
          <div className="relative">
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Experience Level <span className="text-[#ff4444]">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setShowExperienceDropdown(!showExperienceDropdown);
                setShowCategoryDropdown(false);
                setShowSubCategoryDropdown(false);
              }}
              className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-left flex items-center justify-between transition-all ${
                showExperienceDropdown ? "border-[#56C490] bg-white" : "border-transparent"
              }`}
            >
              <span className={formData.experienceLevel ? "text-[#1a1a1a]" : "text-[#9CA3AF]"}>
                {formData.experienceLevel || "Select years of experience"}
              </span>
              <ChevronDown
                className={`w-[20px] h-[20px] text-[#666] transition-transform ${
                  showExperienceDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showExperienceDropdown && (
              <div className="absolute top-full left-0 right-0 mt-[8px] bg-white border-2 border-[#56C490] rounded-[12px] shadow-lg z-10 overflow-hidden">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      handleInputChange("experienceLevel", level);
                      setShowExperienceDropdown(false);
                    }}
                    className={`w-full px-[16px] py-[12px] font-['Nunito',sans-serif] text-[14px] text-left transition-all ${
                      formData.experienceLevel === level
                        ? "bg-[#56C490]/10 text-[#56C490]"
                        : "text-[#1a1a1a] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
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