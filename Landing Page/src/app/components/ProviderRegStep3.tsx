"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Building2, ArrowRight, ArrowLeft } from "lucide-react";

const philippineCities = [
  "Manila", "Quezon City", "Caloocan", "Las Piñas", "Makati", "Malabon", "Mandaluyong", "Marikina", 
  "Muntinlupa", "Navotas", "Parañaque", "Pasay", "Pasig", "Pateros", "San Juan", "Taguig", "Valenzuela",
  "Cebu City", "Davao City", "Zamboanga City", "Cagayan de Oro", "Iloilo City", "Bacolod",
  "General Santos", "Butuan", "Iligan", "Baguio", "Angeles", "Antipolo", "Bacoor", "Cavite City",
  "Dasmariñas", "Imus", "Lipa", "Lucena", "Malolos", "San Fernando", "San Jose del Monte", "Tarlac City",
  "Cabanatuan", "Legazpi", "Naga", "Olongapo", "Puerto Princesa", "Tacloban", "Tagaytay", "Batangas City",
  "Biñan", "Cainta", "General Trias", "Lapu-Lapu", "Las Piñas", "Mandaue", "San Pedro", "Trece Martires"
];

const philippineProvinces = [
  "Metro Manila", "Abra", "Agusan del Norte", "Agusan del Sur", "Aklan", "Albay", "Antique",
  "Apayao", "Aurora", "Basilan", "Bataan", "Batanes", "Batangas", "Benguet", "Biliran", "Bohol",
  "Bukidnon", "Bulacan", "Cagayan", "Camarines Norte", "Camarines Sur", "Camiguin", "Capiz",
  "Catanduanes", "Cavite", "Cebu", "Cotabato", "Davao de Oro", "Davao del Norte", "Davao del Sur",
  "Davao Occidental", "Davao Oriental", "Dinagat Islands", "Eastern Samar", "Guimaras", "Ifugao",
  "Ilocos Norte", "Ilocos Sur", "Iloilo", "Isabela", "Kalinga", "La Union", "Laguna", "Lanao del Norte",
  "Lanao del Sur", "Leyte", "Maguindanao", "Marinduque", "Masbate", "Misamis Occidental", "Misamis Oriental",
  "Mountain Province", "Negros Occidental", "Negros Oriental", "Northern Samar", "Nueva Ecija", "Nueva Vizcaya",
  "Occidental Mindoro", "Oriental Mindoro", "Palawan", "Pampanga", "Pangasinan", "Quezon", "Quirino", "Rizal",
  "Romblon", "Samar", "Sarangani", "Siquijor", "Sorsogon", "South Cotabato", "Southern Leyte", "Sultan Kudarat",
  "Sulu", "Surigao del Norte", "Surigao del Sur", "Tarlac", "Tawi-Tawi", "Zambales", "Zamboanga del Norte",
  "Zamboanga del Sur", "Zamboanga Sibugay"
];

export function ProviderRegStep3() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    streetAddress: "",
    city: "",
    province: "",
    zipCode: "",
    maxServiceRadius: 10,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Autocomplete states
  const [cityInput, setCityInput] = useState("");
  const [provinceInput, setProvinceInput] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  
  const cityInputRef = useRef<HTMLInputElement>(null);
  const provinceInputRef = useRef<HTMLInputElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const provinceDropdownRef = useRef<HTMLDivElement>(null);

  // Filter cities based on input
  const filteredCities = philippineCities.filter(city =>
    city.toLowerCase().includes(cityInput.toLowerCase())
  );

  // Filter provinces based on input
  const filteredProvinces = philippineProvinces.filter(province =>
    province.toLowerCase().includes(provinceInput.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityInputRef.current &&
        cityDropdownRef.current &&
        !cityInputRef.current.contains(event.target as Node) &&
        !cityDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCityDropdown(false);
      }
      if (
        provinceInputRef.current &&
        provinceDropdownRef.current &&
        !provinceInputRef.current.contains(event.target as Node) &&
        !provinceDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProvinceDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Street Address validation (max 255 characters)
    if (formData.streetAddress.length === 0) {
      newErrors.streetAddress = "Street address or landmark is required";
    } else if (formData.streetAddress.length > 255) {
      newErrors.streetAddress = "Address must not exceed 255 characters";
    }

    // City validation
    if (!formData.city) {
      newErrors.city = "City is required";
    }

    // Province validation
    if (!formData.province) {
      newErrors.province = "Province is required";
    }

    // ZIP Code validation
    if (!formData.zipCode) {
      newErrors.zipCode = "ZIP code is required";
    } else if (!/^\d{4}$/.test(formData.zipCode)) {
      newErrors.zipCode = "ZIP code must be 4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      sessionStorage.setItem("providerRegStep3", JSON.stringify(formData));
      router.push("/provider-registration/step-4");
    }
  };

  const handleBack = () => {
    router.push("/provider-registration/step-2");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, maxServiceRadius: parseInt(e.target.value) }));
  };

  const handleCitySelect = (city: string) => {
    setFormData((prev) => ({ ...prev, city }));
    setCityInput(city);
    setShowCityDropdown(false);
  };

  const handleProvinceSelect = (province: string) => {
    setFormData((prev) => ({ ...prev, province }));
    setProvinceInput(province);
    setShowProvinceDropdown(false);
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
            <span className="font-['Poppins',sans-serif] text-sm text-gray-600">Step 3 of 4</span>
            <span className="font-['Poppins',sans-serif] text-sm text-[#00BF63] font-semibold">75%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#00BF63] h-2 rounded-full transition-all duration-300" style={{ width: "75%" }}></div>
          </div>
          <div className="flex justify-between mt-3">
            <span className="font-['Poppins',sans-serif] text-xs text-gray-400">Personal Info</span>
            <span className="font-['Poppins',sans-serif] text-xs text-gray-400">Profile</span>
            <span className="font-['Poppins',sans-serif] text-xs text-[#00BF63] font-semibold">Location</span>
            <span className="font-['Poppins',sans-serif] text-xs text-gray-400">Documents</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="font-['Poppins',sans-serif] text-2xl text-gray-900 mb-6">
            Service Location (Work Zone)
          </h2>

          <form onSubmit={handleNext} className="space-y-5">
            {/* Street Address */}
            <div>
              <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
                Street Address or Landmark <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-4 py-3 border ${errors.streetAddress ? 'border-red-500' : 'border-gray-300'} rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BF63]/50 focus:border-[#00BF63]`}
                  placeholder="e.g., 123 Main Street, near City Hall"
                  maxLength={255}
                  required
                />
              </div>
              {errors.streetAddress && (
                <p className="font-['Poppins',sans-serif] text-xs text-red-500 mt-1">{errors.streetAddress}</p>
              )}
            </div>

            {/* City, Province, ZIP Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City */}
              <div>
                <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
                  <input
                    type="text"
                    name="city"
                    value={cityInput}
                    onChange={(e) => {
                      setCityInput(e.target.value);
                      setFormData((prev) => ({ ...prev, city: e.target.value }));
                      setShowCityDropdown(true);
                      if (errors.city) {
                        setErrors((prev) => ({ ...prev, city: "" }));
                      }
                    }}
                    onFocus={() => setShowCityDropdown(true)}
                    className={`w-full pl-11 pr-4 py-3 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BF63]/50 focus:border-[#00BF63]`}
                    placeholder="Search your city"
                    ref={cityInputRef}
                    required
                  />
                  {showCityDropdown && (
                    <div
                      className="absolute left-0 top-full w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-20"
                      ref={cityDropdownRef}
                    >
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city) => (
                          <div
                            key={city}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 font-['Poppins',sans-serif] text-sm text-gray-700 transition-colors"
                            onClick={() => handleCitySelect(city)}
                          >
                            {city}
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
                {errors.city && (
                  <p className="font-['Poppins',sans-serif] text-xs text-red-500 mt-1">{errors.city}</p>
                )}
              </div>

              {/* Province */}
              <div>
                <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
                  Province <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="province"
                    value={provinceInput}
                    onChange={(e) => {
                      setProvinceInput(e.target.value);
                      setFormData((prev) => ({ ...prev, province: e.target.value }));
                      setShowProvinceDropdown(true);
                      if (errors.province) {
                        setErrors((prev) => ({ ...prev, province: "" }));
                      }
                    }}
                    onFocus={() => setShowProvinceDropdown(true)}
                    className={`w-full px-4 py-3 border ${errors.province ? 'border-red-500' : 'border-gray-300'} rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BF63]/50 focus:border-[#00BF63]`}
                    placeholder="Search your province"
                    ref={provinceInputRef}
                    required
                  />
                  {showProvinceDropdown && (
                    <div
                      className="absolute left-0 top-full w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-20"
                      ref={provinceDropdownRef}
                    >
                      {filteredProvinces.length > 0 ? (
                        filteredProvinces.map((province) => (
                          <div
                            key={province}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 font-['Poppins',sans-serif] text-sm text-gray-700 transition-colors"
                            onClick={() => handleProvinceSelect(province)}
                          >
                            {province}
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
                {errors.province && (
                  <p className="font-['Poppins',sans-serif] text-xs text-red-500 mt-1">{errors.province}</p>
                )}
              </div>

              {/* ZIP Code */}
              <div>
                <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BF63]/50 focus:border-[#00BF63]`}
                  placeholder="1000"
                  maxLength={4}
                  required
                />
                {errors.zipCode && (
                  <p className="font-['Poppins',sans-serif] text-xs text-red-500 mt-1">{errors.zipCode}</p>
                )}
              </div>
            </div>

            {/* Max Service Radius */}
            <div>
              <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
                Maximum Service Radius
              </label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-['Poppins',sans-serif] text-sm text-gray-600">
                    How far will you travel for services?
                  </span>
                  <span className="font-['Poppins',sans-serif] text-lg text-[#00BF63] font-semibold">
                    {formData.maxServiceRadius} km
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={formData.maxServiceRadius}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00BF63]"
                />
                <div className="flex justify-between mt-2">
                  <span className="font-['Poppins',sans-serif] text-xs text-gray-500">5 km</span>
                  <span className="font-['Poppins',sans-serif] text-xs text-gray-500">50 km</span>
                </div>
              </div>
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
