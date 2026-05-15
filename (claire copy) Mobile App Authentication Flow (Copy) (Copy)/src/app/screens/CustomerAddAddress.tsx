import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, MapPin, Check } from "lucide-react";
import { getAllProvinces, getCitiesByProvince } from "../data/ph-locations";

export default function CustomerAddAddress() {
  const navigate = useNavigate();
  const [addressLabel, setAddressLabel] = useState("Home");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isDefault, setIsDefault] = useState(true);

  const provinces = getAllProvinces();
  const cities = selectedProvince ? getCitiesByProvince(selectedProvince) : [];

  const handleContinue = () => {
    navigate("/customer/add-payment-method");
  };

  const handleAddAnother = () => {
    // Clear form to add another address
    setStreet("");
    setBarangay("");
    setSelectedProvince("");
    setSelectedCity("");
    setPostalCode("");
    setIsDefault(false);
  };

  const handleUseCurrentLocation = () => {
    // Simulate getting current location
    setStreet("123 Main Street");
    setBarangay("Barangay Centro");
    setSelectedProvince("Metro Manila");
    setSelectedCity("Makati");
    setPostalCode("1200");
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="px-[24px] py-[16px] border-b border-[#F3F4F6] flex-shrink-0">
        <div className="flex items-center gap-[16px] mb-[12px]">
          <button
            onClick={() => navigate("/customer/setup-profile")}
            className="w-[40px] h-[40px] rounded-full flex items-center justify-center -ml-[8px] transition-all active:scale-90"
          >
            <ArrowLeft className="w-[22px] h-[22px] text-[#111827]" />
          </button>
          <div className="flex-1 text-center -ml-[40px]">
            <h1 className="font-bold text-[20px] text-[#111827] tracking-tight">ServeEase</h1>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-[8px]">
          <div className="flex-1 h-[4px] bg-[#56C490] rounded-full" />
          <div className="flex-1 h-[4px] bg-[#56C490] rounded-full" />
          <div className="flex-1 h-[4px] bg-[#E5E7EB] rounded-full" />
        </div>
        <p className="text-center text-[12px] text-[#535353] mt-[8px]">Step 2 of 3</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[24px]">
        <div className="mt-[24px]">
          <h2 className="font-bold text-[24px] text-[#111827] mb-[8px]">Add Your Address</h2>
          <p className="text-[14px] text-[#535353] mb-[24px]">
            We'll use this to find the best service providers near you
          </p>

          {/* Address Label */}
          <div className="mb-[20px]">
            <label className="block font-medium text-[14px] text-[#111827] mb-[8px]">
              Address Label
            </label>
            <div className="flex gap-[8px]">
              {["Home", "Work", "Other"].map((label) => (
                <button
                  key={label}
                  onClick={() => setAddressLabel(label)}
                  className={`flex-1 py-[10px] rounded-[8px] border-2 font-medium text-[14px] transition-all ${
                    addressLabel === label
                      ? "bg-[#56C490]/5 border-[#56C490] text-[#56C490]"
                      : "bg-white border-[#E5E7EB] text-[#535353]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Street Address */}
          <div className="mb-[20px]">
            <label className="block font-medium text-[14px] text-[#111827] mb-[8px]">
              Street Address <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="e.g., 123 Main Street, Building Name, Unit #"
              className="w-full px-[14px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
            />
          </div>

          {/* Barangay */}
          <div className="mb-[20px]">
            <label className="block font-medium text-[14px] text-[#111827] mb-[8px]">
              Barangay <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              placeholder="e.g., Barangay Centro"
              className="w-full px-[14px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
            />
          </div>

          {/* Province Dropdown */}
          <div className="mb-[20px]">
            <label className="block font-medium text-[14px] text-[#111827] mb-[8px]">
              Province <span className="text-[#EF4444]">*</span>
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedCity("");
              }}
              className="w-full px-[14px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div className="mb-[20px]">
            <label className="block font-medium text-[14px] text-[#111827] mb-[8px]">
              City <span className="text-[#EF4444]">*</span>
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedProvince}
              className="w-full px-[14px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20 disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF]"
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Postal Code */}
          <div className="mb-[20px]">
            <label className="block font-medium text-[14px] text-[#111827] mb-[8px]">
              Postal Code <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="e.g., 1200"
              className="w-full px-[14px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
            />
          </div>

          {/* Map View */}
          <div className="mb-[20px]">
            <label className="block font-medium text-[14px] text-[#111827] mb-[8px]">
              Location on Map
            </label>
            <div className="w-full h-[200px] bg-[#F3F4F6] rounded-[12px] border border-[#E5E7EB] flex items-center justify-center relative overflow-hidden">
              {/* Simple map placeholder with pin */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#E8F5E9] to-[#F3F4F6]" />
              <div className="relative z-10 flex flex-col items-center">
                <MapPin className="w-[40px] h-[40px] text-[#56C490]" fill="#56C490" />
                <p className="text-[12px] text-[#535353] mt-[8px]">
                  {selectedCity && selectedProvince
                    ? `${selectedCity}, ${selectedProvince}`
                    : "Select your location"}
                </p>
              </div>
            </div>
          </div>

          {/* Use Current Location Button */}
          <button
            onClick={handleUseCurrentLocation}
            className="w-full mb-[20px] bg-white border-2 border-[#56C490] py-[12px] rounded-[8px] flex items-center justify-center gap-[8px] text-[#56C490] font-semibold text-[14px] transition-all active:scale-95"
          >
            <MapPin className="w-[18px] h-[18px]" />
            Use Current Location
          </button>

          {/* Set as Default Checkbox */}
          <label className="flex items-center gap-[10px] mb-[20px] cursor-pointer">
            <button
              onClick={() => setIsDefault(!isDefault)}
              className={`w-[20px] h-[20px] rounded-[6px] border-2 flex items-center justify-center transition-all ${
                isDefault
                  ? "bg-[#56C490] border-[#56C490]"
                  : "bg-white border-[#D1D5DB]"
              }`}
            >
              {isDefault && <Check className="w-[14px] h-[14px] text-white" strokeWidth={3} />}
            </button>
            <span className="font-medium text-[14px] text-[#111827]">
              Set as default address
            </span>
          </label>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!street || !barangay || !selectedProvince || !selectedCity || !postalCode}
            className="w-full bg-[#56C490] py-[14px] rounded-[8px] font-semibold text-[16px] text-white shadow-[0_2px_8px_rgba(86,196,144,0.25)] transition-all active:scale-95 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:shadow-none"
          >
            Continue
          </button>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}