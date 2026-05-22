"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tag, Award, ArrowRight, ArrowLeft, Briefcase } from "lucide-react";
import { resolvePublicGatewayBaseUrl } from "../lib/gateway-base-url";

interface CatalogCategory {
  id: string;
  name: string;
}

interface CatalogServiceItem {
  id: string;
  categoryId: string | null;
  name: string;
}

const experienceLevels = [
  "Less than 1 year",
  "1–2 years",
  "3–5 years",
  "6–10 years",
  "10+ years",
];

export function ProviderRegStep2() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: "",
    primaryCategory: "",
    primaryCategoryId: "",
    subCategory: "",
    serviceId: "",
    experienceYears: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>([]);
  const [catalogServices, setCatalogServices] = useState<CatalogServiceItem[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  
  // Autocomplete states
  const [categoryInput, setCategoryInput] = useState("");
  const [experienceInput, setExperienceInput] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const experienceInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const experienceDropdownRef = useRef<HTMLDivElement>(null);

  // Filter categories based on input
  const filteredCategories = catalogCategories.filter(category =>
    category.name.toLowerCase().includes(categoryInput.toLowerCase())
  );
  const filteredServices = catalogServices.filter(
    (service) => service.categoryId === formData.primaryCategoryId
  );

  // Filter experience levels based on input
  const filteredExperience = experienceLevels.filter(level =>
    level.toLowerCase().includes(experienceInput.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryInputRef.current &&
        categoryDropdownRef.current &&
        !categoryInputRef.current.contains(event.target as Node) &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        experienceInputRef.current &&
        experienceDropdownRef.current &&
        !experienceInputRef.current.contains(event.target as Node) &&
        !experienceDropdownRef.current.contains(event.target as Node)
      ) {
        setShowExperienceDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        const baseUrl = resolvePublicGatewayBaseUrl();
        const [categoryResponse, serviceResponse] = await Promise.all([
          fetch(`${baseUrl}/v1/catalog/categories`, {
            headers: { accept: "application/json" },
          }),
          fetch(`${baseUrl}/v1/catalog/services`, {
            headers: { accept: "application/json" },
          }),
        ]);

        if (!categoryResponse.ok || !serviceResponse.ok) {
          throw new Error("Catalog unavailable");
        }

        const [categoryPayload, servicePayload] = await Promise.all([
          categoryResponse.json(),
          serviceResponse.json(),
        ]);

        if (!isMounted) {
          return;
        }

        setCatalogCategories(categoryPayload.data ?? []);
        setCatalogServices(servicePayload.data ?? []);
        setCatalogError(null);
      } catch {
        if (isMounted) {
          setCatalogError("Unable to load catalog services. Please try again.");
        }
      }
    }

    void loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.businessName.trim().length < 2) {
      newErrors.businessName = "Business or display name must be at least 2 characters";
    }

    // Category validation
    if (!formData.primaryCategoryId) {
      newErrors.primaryCategory = "Please select a service category";
    }
    if (!formData.serviceId) {
      newErrors.subCategory = "Please select a catalog service";
    }

    // Experience validation
    if (!formData.experienceYears) {
      newErrors.experienceYears = "Please select your experience level";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      sessionStorage.setItem("providerRegStep2", JSON.stringify(formData));
      router.push("/provider-registration/step-3");
    }
  };

  const handleBack = () => {
    router.push("/provider-registration/step-1");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCategorySelect = (category: CatalogCategory) => {
    setFormData((prev) => ({
      ...prev,
      primaryCategory: category.name,
      primaryCategoryId: category.id,
      subCategory: "",
      serviceId: "",
    }));
    setCategoryInput(category.name);
    setShowCategoryDropdown(false);
  };

  const handleServiceSelect = (serviceId: string) => {
    const service = catalogServices.find((item) => item.id === serviceId);
    setFormData((prev) => ({
      ...prev,
      serviceId,
      subCategory: service?.name ?? "",
    }));
    if (errors.subCategory) {
      setErrors((prev) => ({ ...prev, subCategory: "" }));
    }
  };

  const handleExperienceSelect = (level: string) => {
    setFormData((prev) => ({ ...prev, experienceYears: level }));
    setExperienceInput(level);
    setShowExperienceDropdown(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-['Poppins',sans-serif] text-3xl md:text-4xl text-gray-900 mb-3">
            Join ServEase as a Service Worker
          </h1>
          <p className="font-['Poppins',sans-serif] text-base text-gray-600">
            Complete your registration to start offering your services
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-['Poppins',sans-serif] text-sm text-gray-600">Step 2 of 4</span>
            <span className="font-['Poppins',sans-serif] text-sm text-[#00BF63] font-semibold">50%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#00BF63] h-2 rounded-full transition-all duration-300" style={{ width: "50%" }}></div>
          </div>
          <div className="flex justify-between mt-3">
            <span className="font-['Poppins',sans-serif] text-xs text-gray-400">Personal Info</span>
            <span className="font-['Poppins',sans-serif] text-xs text-[#00BF63] font-semibold">Profile</span>
            <span className="font-['Poppins',sans-serif] text-xs text-gray-400">Location</span>
            <span className="font-['Poppins',sans-serif] text-xs text-gray-400">Documents</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="font-['Poppins',sans-serif] text-2xl text-gray-900 mb-6">
            Service Provider Profile
          </h2>

          <form onSubmit={handleNext} className="space-y-5">
            <div>
              <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
                Business or Display Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-4 py-3 border ${errors.businessName ? 'border-red-500' : 'border-gray-300'} rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BF63]/50 focus:border-[#00BF63]`}
                  placeholder="e.g. Maria Home Cleaning or HandyFix Services"
                  required
                />
              </div>
              {errors.businessName && (
                <p className="font-['Poppins',sans-serif] text-xs text-red-500 mt-1">{errors.businessName}</p>
              )}
            </div>

            {/* Primary Category */}
            <div>
              <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
                Primary Service Category <span className="text-red-500">*</span>
              </label>
              {catalogError && (
                <p className="font-['Poppins',sans-serif] text-xs text-red-500 mb-2">{catalogError}</p>
              )}
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
                <input
                  type="text"
                  name="primaryCategory"
                  value={categoryInput}
                  onChange={(e) => {
                    setCategoryInput(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      primaryCategory: e.target.value,
                      primaryCategoryId: "",
                      subCategory: "",
                      serviceId: "",
                    }));
                    setShowCategoryDropdown(true);
                    if (errors.primaryCategory) {
                      setErrors((prev) => ({ ...prev, primaryCategory: "" }));
                    }
                  }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  className={`w-full pl-11 pr-4 py-3 border ${errors.primaryCategory ? 'border-red-500' : 'border-gray-300'} rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BF63]/50 focus:border-[#00BF63]`}
                  placeholder="Select a service category"
                  ref={categoryInputRef}
                  required
                />
                {showCategoryDropdown && (
                  <div
                    className="absolute left-0 top-full w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-20"
                    ref={categoryDropdownRef}
                  >
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <div
                          key={category.id}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 font-['Poppins',sans-serif] text-sm text-gray-700 transition-colors"
                          onClick={() => handleCategorySelect(category)}
                        >
                          {category.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 font-['Poppins',sans-serif]">
                        No results found
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.primaryCategory && (
                <p className="font-['Poppins',sans-serif] text-xs text-red-500 mt-1">{errors.primaryCategory}</p>
              )}
            </div>

            {/* Sub Category Dropdown */}
            {formData.primaryCategoryId && (
              <div>
                <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
                  Specific Service <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
                  <select
                    name="subCategory"
                    value={formData.serviceId}
                    onChange={(event) => handleServiceSelect(event.target.value)}
                    className={`w-full pl-11 pr-4 py-3 border ${errors.subCategory ? 'border-red-500' : 'border-gray-300'} rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BF63]/50 focus:border-[#00BF63] appearance-none bg-white cursor-pointer`}
                    required
                  >
                    <option value="">Select a specific service</option>
                    {filteredServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.subCategory && (
                  <p className="font-['Poppins',sans-serif] text-xs text-red-500 mt-1">{errors.subCategory}</p>
                )}
              </div>
            )}

            {/* Experience Level */}
            <div>
              <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
                Experience Level <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
                <input
                  type="text"
                  name="experienceYears"
                  value={experienceInput}
                  onChange={(e) => {
                    setExperienceInput(e.target.value);
                    setFormData((prev) => ({ ...prev, experienceYears: e.target.value }));
                    setShowExperienceDropdown(true);
                    if (errors.experienceYears) {
                      setErrors((prev) => ({ ...prev, experienceYears: "" }));
                    }
                  }}
                  onFocus={() => setShowExperienceDropdown(true)}
                  className={`w-full pl-11 pr-4 py-3 border ${errors.experienceYears ? 'border-red-500' : 'border-gray-300'} rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BF63]/50 focus:border-[#00BF63]`}
                  placeholder="Select years of experience"
                  ref={experienceInputRef}
                  required
                />
                {showExperienceDropdown && (
                  <div
                    className="absolute left-0 top-full w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-20"
                    ref={experienceDropdownRef}
                  >
                    {filteredExperience.length > 0 ? (
                      filteredExperience.map((level) => (
                        <div
                          key={level}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 font-['Poppins',sans-serif] text-sm text-gray-700 transition-colors"
                          onClick={() => handleExperienceSelect(level)}
                        >
                          {level}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 font-['Poppins',sans-serif]">
                        No results found
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.experienceYears && (
                <p className="font-['Poppins',sans-serif] text-xs text-red-500 mt-1">{errors.experienceYears}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-['Poppins',sans-serif] font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#00BF63] hover:bg-[#00a855] text-white font-['Poppins',sans-serif] font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
