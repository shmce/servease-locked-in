import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Star, MapPin, Calendar, Clock, Upload, X, ChevronDown, Plus } from "lucide-react";
import { ServiceHeader } from "../components/ServiceHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { formatPesoShort } from "../utils/formatPeso";

export default function BookingForm() {
  const navigate = useNavigate();
  const { providerId } = useParams<{ providerId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedService, setSelectedService] = useState("");
  const [serviceType, setServiceType] = useState<"mobile" | "in-location">("mobile");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  // Mock provider data
  const providerData = {
    name: "Carlos Mendoza",
    rating: 4.9,
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
  };

  // Mock services
  const services = [
    { id: "1", name: "Electrical Installation", basePrice: 2500 },
    { id: "2", name: "Circuit Breaker Repair", basePrice: 1200 },
    { id: "3", name: "Lighting Installation", basePrice: 800 },
    { id: "4", name: "Electrical Troubleshooting", basePrice: 1000 }
  ];

  // Mock addresses
  const addresses = [
    { id: "1", label: "Home", address: "123 Mabini St, Malate, Manila" },
    { id: "2", label: "Office", address: "456 Ayala Ave, Makati City" },
    { id: "3", label: "Parent's House", address: "789 Rizal St, Pasig City" }
  ];

  // Time slots
  const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos: string[] = [];
      Array.from(files).forEach((file) => {
        if (uploadedPhotos.length + newPhotos.length < 5) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setUploadedPhotos((prev) => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const applyPromoCode = () => {
    if (promoCode.trim()) {
      setIsPromoApplied(true);
    }
  };

  const selectedServiceData = services.find(s => s.id === selectedService);
  const basePrice = selectedServiceData?.basePrice || 0;
  const calloutFee = serviceType === "mobile" ? 200 : 0;
  const discount = isPromoApplied ? 250 : 0;
  const estimatedTotal = basePrice + calloutFee - discount;

  const handleReviewBooking = () => {
    // Validate required fields
    if (!selectedService || !selectedDate || !selectedTime || (serviceType === "mobile" && !selectedAddress)) {
      alert("Please fill in all required fields");
      return;
    }
    navigate(`/customer/project-review/${providerId}`);
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* Service Header */}
      <ServiceHeader title="Book Service" />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[120px]">
        {/* Provider Info Card */}
        <div className="mx-[24px] mt-[20px] mb-[24px] bg-[#f9fafb] rounded-[16px] p-[16px]">
          <div className="flex items-center gap-[12px]">
            <div className="w-[56px] h-[56px] rounded-full overflow-hidden bg-white">
              <img 
                src={providerData.photo} 
                alt={providerData.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[16px] text-[#111827] mb-[4px]">
                {providerData.name}
              </h3>
              <div className="flex items-center gap-[4px]">
                <Star className="w-[14px] h-[14px] text-[#f59e0b] fill-[#f59e0b]" />
                <span className="font-medium text-[14px] text-[#374151]">
                  {providerData.rating}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-[24px] space-y-[20px]">
          {/* Service Type Dropdown */}
          <div>
            <label className="block mb-[8px]">
              <span className="text-[14px] font-medium text-[#374151]">
                Service Type <span className="text-[#ef4444]">*</span>
              </span>
            </label>
            <div className="relative">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-[16px] py-[14px] bg-white border border-[#d1d5db] rounded-[12px] text-[14px] text-[#111827] appearance-none pr-[40px] focus:outline-none focus:border-[#56C490]"
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#6b7280] pointer-events-none" />
            </div>
          </div>

          {/* Mobile / In-Location Toggle */}
          <div>
            <label className="block mb-[8px]">
              <span className="text-[14px] font-medium text-[#374151]">
                Service Location <span className="text-[#ef4444]">*</span>
              </span>
            </label>
            <div className="grid grid-cols-2 gap-[12px]">
              <button
                onClick={() => setServiceType("mobile")}
                className={`px-[16px] py-[14px] rounded-[12px] border-2 transition-all ${
                  serviceType === "mobile"
                    ? "border-[#56C490] bg-[#56C490]/5"
                    : "border-[#d1d5db] bg-white"
                }`}
              >
                <span className={`text-[14px] font-medium ${
                  serviceType === "mobile" ? "text-[#56C490]" : "text-[#6b7280]"
                }`}>
                  Mobile Service
                </span>
              </button>
              <button
                onClick={() => setServiceType("in-location")}
                className={`px-[16px] py-[14px] rounded-[12px] border-2 transition-all ${
                  serviceType === "in-location"
                    ? "border-[#56C490] bg-[#56C490]/5"
                    : "border-[#d1d5db] bg-white"
                }`}
              >
                <span className={`text-[14px] font-medium ${
                  serviceType === "in-location" ? "text-[#56C490]" : "text-[#6b7280]"
                }`}>
                  In-Location
                </span>
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block mb-[8px]">
              <span className="text-[14px] font-medium text-[#374151]">
                Preferred Date <span className="text-[#ef4444]">*</span>
              </span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-[16px] py-[14px] bg-white border border-[#d1d5db] rounded-[12px] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490]"
              />
              <Calendar className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#6b7280] pointer-events-none" />
            </div>
          </div>

          {/* Time Slot Selector */}
          <div>
            <label className="block mb-[8px]">
              <span className="text-[14px] font-medium text-[#374151]">
                Preferred Time <span className="text-[#ef4444]">*</span>
              </span>
            </label>
            <div className="grid grid-cols-3 gap-[8px]">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-[12px] py-[10px] rounded-[8px] border transition-all ${
                    selectedTime === time
                      ? "border-[#56C490] bg-[#56C490] text-white"
                      : "border-[#d1d5db] bg-white text-[#374151]"
                  }`}
                >
                  <span className="text-[13px] font-medium">{time}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location Section (only for mobile service) */}
          {serviceType === "mobile" && (
            <>
              <div>
                <label className="block mb-[8px]">
                  <span className="text-[14px] font-medium text-[#374151]">
                    Service Address <span className="text-[#ef4444]">*</span>
                  </span>
                </label>
                <div className="space-y-[8px]">
                  {addresses.map((address) => (
                    <button
                      key={address.id}
                      onClick={() => setSelectedAddress(address.id)}
                      className={`w-full text-left px-[16px] py-[14px] rounded-[12px] border-2 transition-all ${
                        selectedAddress === address.id
                          ? "border-[#56C490] bg-[#56C490]/5"
                          : "border-[#d1d5db] bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-[12px]">
                        <MapPin className={`w-[18px] h-[18px] flex-shrink-0 mt-[2px] ${
                          selectedAddress === address.id ? "text-[#56C490]" : "text-[#6b7280]"
                        }`} />
                        <div className="flex-1">
                          <p className={`text-[14px] font-medium mb-[2px] ${
                            selectedAddress === address.id ? "text-[#56C490]" : "text-[#111827]"
                          }`}>
                            {address.label}
                          </p>
                          <p className="text-[12px] font-normal text-[#6b7280]">
                            {address.address}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  <button className="w-full px-[16px] py-[14px] border-2 border-dashed border-[#d1d5db] rounded-[12px] transition-all active:scale-95">
                    <div className="flex items-center justify-center gap-[8px]">
                      <Plus className="w-[18px] h-[18px] text-[#56C490]" />
                      <span className="text-[14px] font-semibold text-[#56C490]">
                        Add New Address
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Map Preview */}
              {selectedAddress && (
                <div className="bg-[#f3f4f6] rounded-[12px] h-[180px] overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-[48px] h-[48px] text-[#56C490] mx-auto mb-[8px]" />
                      <p className="text-[14px] font-normal text-[#6b7280]">Map Preview</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Service Description */}
          <div>
            <label className="block mb-[8px]">
              <span className="text-[14px] font-medium text-[#374151]">
                Service Description
              </span>
            </label>
            <textarea
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="Describe the service you need in detail..."
              rows={4}
              className="w-full px-[16px] py-[14px] bg-white border border-[#d1d5db] rounded-[12px] text-[14px] text-[#111827] placeholder:text-[#9ca3af] resize-none focus:outline-none focus:border-[#56C490]"
            />
            <p className="text-[12px] font-normal text-[#9ca3af] mt-[6px]">
              Provide as much detail as possible to help the provider understand your needs
            </p>
          </div>

          {/* Upload Photos */}
          <div>
            <label className="block mb-[8px]">
              <span className="text-[14px] font-medium text-[#374151]">
                Upload Photos (Max 5)
              </span>
            </label>
            <div className="grid grid-cols-3 gap-[8px]">
              {uploadedPhotos.map((photo, index) => (
                <div key={index} className="relative aspect-square bg-[#f3f4f6] rounded-[12px] overflow-hidden">
                  <img src={photo} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-[4px] right-[4px] w-[24px] h-[24px] bg-black/60 rounded-full flex items-center justify-center transition-all active:scale-90"
                  >
                    <X className="w-[14px] h-[14px] text-white" />
                  </button>
                </div>
              ))}
              
              {uploadedPhotos.length < 5 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-[#d1d5db] rounded-[12px] flex flex-col items-center justify-center gap-[8px] transition-all active:scale-95"
                >
                  <Upload className="w-[24px] h-[24px] text-[#56C490]" />
                  <span className="text-[12px] font-medium text-[#6b7280]">Upload</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <p className="text-[12px] font-normal text-[#9ca3af] mt-[6px]">
              Upload photos that show the area or issue that needs service
            </p>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block mb-[8px]">
              <span className="text-[14px] font-medium text-[#374151]">
                Special Instructions
              </span>
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requirements or instructions..."
              rows={3}
              className="w-full px-[16px] py-[14px] bg-white border border-[#d1d5db] rounded-[12px] text-[14px] text-[#111827] placeholder:text-[#9ca3af] resize-none focus:outline-none focus:border-[#56C490]"
            />
          </div>

          {/* Booking Summary */}
          <div className="bg-[#f9fafb] rounded-[16px] p-[16px]">
            <h3 className="font-semibold text-[16px] text-[#111827] mb-[16px]">Booking Summary</h3>
            
            <div className="space-y-[12px] mb-[16px]">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-normal text-[#6b7280]">Base Price</span>
                <span className="text-[14px] font-normal text-[#111827]">
                  ₱{basePrice.toLocaleString()}
                </span>
              </div>
              
              {serviceType === "mobile" && (
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-normal text-[#6b7280]">Callout Fee</span>
                  <span className="text-[14px] font-normal text-[#111827]">
                    ₱{calloutFee.toLocaleString()}
                  </span>
                </div>
              )}

              {isPromoApplied && (
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-normal text-[#56C490]">Discount Applied</span>
                  <span className="text-[14px] font-normal text-[#56C490]">
                    -₱{discount.toLocaleString()}
                  </span>
                </div>
              )}

              {selectedTime && (
                <div className="flex items-center gap-[8px]">
                  <Clock className="w-[16px] h-[16px] text-[#6b7280]" />
                  <span className="text-[14px] font-normal text-[#6b7280]">Estimated Duration: 2-4 hours</span>
                </div>
              )}
            </div>

            <div className="border-t border-[#e5e7eb] pt-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-bold text-[#111827]">Estimated Total</span>
                <span className="text-[20px] font-bold text-[#56C490]">
                  ₱{estimatedTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Promo Code */}
          <div>
            <label className="block mb-[8px]">
              <span className="text-[14px] font-medium text-[#374151]">
                Promo Code
              </span>
            </label>
            <div className="flex gap-[8px]">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                disabled={isPromoApplied}
                className="flex-1 px-[16px] py-[14px] bg-white border border-[#d1d5db] rounded-[12px] text-[14px] text-[#111827] placeholder:text-[#9ca3af] uppercase focus:outline-none focus:border-[#56C490] disabled:bg-[#f3f4f6] disabled:text-[#6b7280]"
              />
              <button
                onClick={applyPromoCode}
                disabled={isPromoApplied || !promoCode.trim()}
                className="px-[24px] py-[14px] bg-[#56C490] rounded-[12px] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-semibold text-[16px] text-white">
                  {isPromoApplied ? "Applied" : "Apply"}
                </span>
              </button>
            </div>
            {isPromoApplied && (
              <div className="mt-[8px] flex items-center gap-[6px]">
                <div className="w-[16px] h-[16px] bg-[#56C490] rounded-full flex items-center justify-center">
                  <svg className="w-[10px] h-[10px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[12px] font-medium text-[#56C490]">
                  Promo code applied successfully!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] px-[24px] py-[8px] pb-[16px]">
        <PrimaryButton fullWidth size="lg" onClick={handleReviewBooking}>
          Review Booking
        </PrimaryButton>
      </div>
    </div>
  );
}