import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MapPin } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { StickyFooterButton } from "../components/StickyFooterButton";

// Metro Manila cities
const METRO_MANILA_CITIES = [
  "Manila",
  "Quezon City",
  "Caloocan",
  "Las Piñas",
  "Makati",
  "Malabon",
  "Mandaluyong",
  "Marikina",
  "Muntinlupa",
  "Navotas",
  "Parañaque",
  "Pasay",
  "Pasig",
  "Pateros",
  "San Juan",
  "Taguig",
  "Valenzuela",
];

// Nearby areas (CALABARZON cities)
const NEARBY_AREAS = [
  "Bacoor",
  "Cavite City",
  "Dasmariñas",
  "General Trias",
  "Imus",
  "Tagaytay",
  "Biñan",
  "Cabuyao",
  "Calamba",
  "San Pedro",
  "Santa Rosa",
  "Antipolo",
  "Cainta",
  "Taytay",
  "Rodriguez (Montalban)",
];

export default function ProviderServiceAreaSetup() {
  const navigate = useNavigate();
  const [serviceAreaMode, setServiceAreaMode] = useState<"radius" | "specific">("radius");
  const [baseAddress, setBaseAddress] = useState("");
  const [serviceRadius, setServiceRadius] = useState(10);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [maxTravelDistance, setMaxTravelDistance] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCityToggle = (city: string) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter((c) => c !== city));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const handleMaxTravelDistanceChange = (value: string) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, "");
    setMaxTravelDistance(digitsOnly);
    if (errors.maxTravelDistance) {
      setErrors({ ...errors, maxTravelDistance: "" });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!baseAddress.trim()) {
      newErrors.baseAddress = "Base address is required.";
    }
    
    if (serviceAreaMode === "specific" && selectedCities.length === 0) {
      newErrors.selectedCities = "Please select at least one city or area.";
    }
    
    if (!maxTravelDistance.trim()) {
      newErrors.maxTravelDistance = "Maximum travel distance is required.";
    } else if (parseInt(maxTravelDistance) < 0) {
      newErrors.maxTravelDistance = "Distance must be 0 or greater.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      // Navigate to Availability Calendar page
      navigate("/provider/availability");
    }
  };

  const isFormValid =
    baseAddress.trim() !== "" &&
    maxTravelDistance.trim() !== "" &&
    parseInt(maxTravelDistance) >= 0 &&
    (serviceAreaMode === "radius" || selectedCities.length > 0);

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
            Service Area
          </h2>
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
            3 of 4
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-[4px] bg-[#e5e5e5] flex-shrink-0">
        <div className="h-full bg-[#56C490] transition-all duration-300" style={{ width: "75%" }} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-scroll">
        <div className="px-[24px] pt-[24px] pb-[120px]">
          {/* Service Area Mode Toggle */}
          <div className="mb-[24px]">
            <label className="block mb-[12px]">
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
                Service Area Type
              </span>
            </label>
            <div className="flex gap-[8px] p-[4px] bg-[#F3F4F6] rounded-[12px]">
              <button
                type="button"
                onClick={() => setServiceAreaMode("radius")}
                className={`flex-1 py-[10px] rounded-[8px] font-['Nunito',sans-serif] text-[14px] transition-all ${
                  serviceAreaMode === "radius"
                    ? "bg-[#56C490] text-white shadow-sm"
                    : "bg-transparent text-[#6B7280]"
                }`}
              >
                Set radius from location
              </button>
              <button
                type="button"
                onClick={() => setServiceAreaMode("specific")}
                className={`flex-1 py-[10px] rounded-[8px] font-['Nunito',sans-serif] text-[14px] transition-all ${
                  serviceAreaMode === "specific"
                    ? "bg-[#56C490] text-white shadow-sm"
                    : "bg-transparent text-[#6B7280]"
                }`}
              >
                Select specific areas
              </button>
            </div>
          </div>

          {/* Base Location Section */}
          <div className="mb-[24px]">
            <label className="block mb-[8px]">
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
                Base Location <span className="text-[#EF4444]">*</span>
              </span>
            </label>
            <input
              type="text"
              value={baseAddress}
              onChange={(e) => {
                setBaseAddress(e.target.value);
                if (errors.baseAddress) {
                  setErrors({ ...errors, baseAddress: "" });
                }
              }}
              placeholder="Enter your base address"
              className={`w-full h-[48px] px-[16px] rounded-[12px] border-2 font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] placeholder:text-[#9CA3AF] transition-all ${
                errors.baseAddress
                  ? "border-[#EF4444] focus:border-[#EF4444]"
                  : "border-[#E5E7EB] focus:border-[#56C490]"
              } focus:outline-none`}
            />
            {errors.baseAddress && (
              <p className="mt-[6px] font-['Nunito',sans-serif] text-[12px] text-[#EF4444]">
                {errors.baseAddress}
              </p>
            )}
          </div>

          {/* Map Placeholder */}
          <div className="mb-[24px]">
            <div className="w-full h-[200px] bg-[#F3F4F6] rounded-[12px] border-2 border-[#E5E7EB] flex items-center justify-center relative overflow-hidden">
              {/* Map grid pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-[#9CA3AF]" />
                  ))}
                </div>
              </div>
              {/* Draggable pin indicator */}
              <div className="relative z-10 flex flex-col items-center">
                <MapPin className="w-[40px] h-[40px] text-[#56C490] fill-[#56C490]/20" />
                <p className="mt-[8px] font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
                  Drag pin to set location
                </p>
              </div>
            </div>
          </div>

          {/* Service Radius Section */}
          {serviceAreaMode === "radius" && (
            <div className="mb-[24px]">
              <label className="block mb-[12px]">
                <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
                  Service Radius
                </span>
              </label>
              <div className="bg-[#F9FAFB] rounded-[12px] border border-[#E5E7EB] p-[16px]">
                <div className="flex items-center justify-between mb-[12px]">
                  <span className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280]">
                    5 km
                  </span>
                  <span className="font-['Nunito',sans-serif] text-[16px] text-[#56C490]">
                    {serviceRadius} km
                  </span>
                  <span className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280]">
                    50 km
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={serviceRadius}
                  onChange={(e) => setServiceRadius(parseInt(e.target.value))}
                  className="w-full h-[6px] bg-[#E5E7EB] rounded-[3px] appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #56C490 0%, #56C490 ${
                      ((serviceRadius - 5) / 45) * 100
                    }%, #E5E7EB ${((serviceRadius - 5) / 45) * 100}%, #E5E7EB 100%)`,
                  }}
                />
              </div>
            </div>
          )}

          {/* City/Municipality Selection */}
          {serviceAreaMode === "specific" && (
            <div className="mb-[24px]">
              <label className="block mb-[12px]">
                <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
                  Select Service Areas <span className="text-[#EF4444]">*</span>
                </span>
              </label>
              
              {/* Metro Manila */}
              <div className="mb-[16px]">
                <h3 className="font-['Nunito',sans-serif] text-[13px] text-[#111827] mb-[10px]">
                  Metro Manila
                </h3>
                <div className="grid grid-cols-2 gap-[8px]">
                  {METRO_MANILA_CITIES.map((city) => (
                    <label
                      key={city}
                      className={`flex items-center gap-[10px] p-[12px] rounded-[10px] border-2 cursor-pointer transition-all ${
                        selectedCities.includes(city)
                          ? "border-[#56C490] bg-[#56C490]/5"
                          : "border-[#E5E7EB] bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCities.includes(city)}
                        onChange={() => handleCityToggle(city)}
                        className="appearance-none w-[20px] h-[20px] rounded-[6px] border-2 border-[#56C490] bg-white checked:bg-[#56C490] cursor-pointer relative flex-shrink-0 transition-all"
                        style={{
                          backgroundImage: selectedCities.includes(city)
                            ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E")`
                            : "none",
                          backgroundSize: "16px 16px",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                        }}
                      />
                      <span className="font-['Nunito',sans-serif] text-[13px] text-[#374151]">
                        {city}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Nearby Areas */}
              <div className="mb-[16px]">
                <h3 className="font-['Nunito',sans-serif] text-[13px] text-[#111827] mb-[10px]">
                  Nearby Areas (CALABARZON)
                </h3>
                <div className="grid grid-cols-2 gap-[8px]">
                  {NEARBY_AREAS.map((city) => (
                    <label
                      key={city}
                      className={`flex items-center gap-[10px] p-[12px] rounded-[10px] border-2 cursor-pointer transition-all ${
                        selectedCities.includes(city)
                          ? "border-[#56C490] bg-[#56C490]/5"
                          : "border-[#E5E7EB] bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCities.includes(city)}
                        onChange={() => handleCityToggle(city)}
                        className="appearance-none w-[20px] h-[20px] rounded-[6px] border-2 border-[#56C490] bg-white checked:bg-[#56C490] cursor-pointer relative flex-shrink-0 transition-all"
                        style={{
                          backgroundImage: selectedCities.includes(city)
                            ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E")`
                            : "none",
                          backgroundSize: "16px 16px",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                        }}
                      />
                      <span className="font-['Nunito',sans-serif] text-[13px] text-[#374151]">
                        {city}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {errors.selectedCities && (
                <p className="mt-[6px] font-['Nunito',sans-serif] text-[12px] text-[#EF4444]">
                  {errors.selectedCities}
                </p>
              )}
            </div>
          )}

          {/* Maximum Travel Distance */}
          <div className="mb-[24px]">
            <label className="block mb-[8px]">
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
                Maximum Travel Distance <span className="text-[#EF4444]">*</span>
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={maxTravelDistance}
                onChange={(e) => handleMaxTravelDistanceChange(e.target.value)}
                placeholder="0"
                className={`w-full h-[48px] pl-[16px] pr-[48px] rounded-[12px] border-2 font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] placeholder:text-[#9CA3AF] transition-all ${
                  errors.maxTravelDistance
                    ? "border-[#EF4444] focus:border-[#EF4444]"
                    : "border-[#E5E7EB] focus:border-[#56C490]"
                } focus:outline-none`}
              />
              <span className="absolute right-[16px] top-1/2 -translate-y-1/2 font-['Nunito',sans-serif] text-[14px] text-[#9CA3AF]">
                km
              </span>
            </div>
            {errors.maxTravelDistance && (
              <p className="mt-[6px] font-['Nunito',sans-serif] text-[12px] text-[#EF4444]">
                {errors.maxTravelDistance}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Footer Button */}
      <StickyFooterButton
        label="Continue"
        onClick={handleContinue}
        disabled={!isFormValid}
      />
    </div>
  );
}