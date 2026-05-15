import { useState, startTransition } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { BackButton } from "../components/BackButton";
import { Plus, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: string;
  priceUnit: string;
  minPrice: string;
  maxPrice: string;
  estimatedDuration: string;
  unit: string;
  calloutFee: string;
  emergencyRate: string;
  materialsMarkup: string;
  isActive: boolean;
  isExpanded: boolean;
}

export default function ProviderEditServicesAndPricing() {
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "House Cleaning",
      category: "Residential",
      description: "Standard house cleaning service including all rooms",
      basePrice: "500",
      priceUnit: "per hour",
      minPrice: "0",
      maxPrice: "0",
      estimatedDuration: "0",
      unit: "hours",
      calloutFee: "0",
      emergencyRate: "1.0x",
      materialsMarkup: "0",
      isActive: true,
      isExpanded: true,
    },
    {
      id: "2",
      name: "Deep Cleaning",
      category: "Residential",
      description: "Thorough deep cleaning with sanitization",
      basePrice: "800",
      priceUnit: "per hour",
      minPrice: "0",
      maxPrice: "0",
      estimatedDuration: "0",
      unit: "hours",
      calloutFee: "0",
      emergencyRate: "1.0x",
      materialsMarkup: "0",
      isActive: true,
      isExpanded: false,
    },
    {
      id: "3",
      name: "Office Cleaning",
      category: "Commercial",
      description: "Professional office cleaning service",
      basePrice: "1200",
      priceUnit: "per hour",
      minPrice: "0",
      maxPrice: "0",
      estimatedDuration: "0",
      unit: "hours",
      calloutFee: "0",
      emergencyRate: "1.0x",
      materialsMarkup: "0",
      isActive: true,
      isExpanded: false,
    },
  ]);

  const addNewService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: "",
      category: "",
      description: "",
      basePrice: "0",
      priceUnit: "per hour",
      minPrice: "0",
      maxPrice: "0",
      estimatedDuration: "0",
      unit: "hours",
      calloutFee: "0",
      emergencyRate: "1.0x",
      materialsMarkup: "0",
      isActive: true,
      isExpanded: true,
    };
    setServices([newService, ...services]);
  };

  const toggleServiceActive = (id: string) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === id ? { ...service, isActive: !service.isActive } : service
      )
    );
  };

  const toggleServiceExpanded = (id: string) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === id ? { ...service, isExpanded: !service.isExpanded } : service
      )
    );
  };

  const deleteService = (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      setServices((prev) => prev.filter((service) => service.id !== id));
    }
  };

  const updateService = (id: string, field: keyof Service, value: string | boolean) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      )
    );
  };

  const handleCancel = () => {
    startTransition(() => {
      navigate(-1);
    });
  };

  const handleSaveAll = () => {
    // Show success message
    alert("Changes saved successfully!");
    startTransition(() => {
      navigate(-1);
    });
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* iOS Status Bar */}
      <StatusBar />

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] shrink-0">
        <div className="flex items-center justify-between h-[56px] px-[24px]">
          <BackButton />
          <h1 className="font-bold text-[20px] text-[#111827]">
            Edit Services & Pricing
          </h1>
          <button
            onClick={addNewService}
            className="inline-flex items-center gap-[6px] text-[#56C490] text-[14px] font-semibold transition-all active:opacity-70"
          >
            <Plus className="w-[18px] h-[18px]" />
            Add New Service
          </button>
        </div>
        <div className="px-[24px] pb-[12px]">
          <p className="text-[#6B7280] text-[13px]">
            Manage your service offerings and pricing structure
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] py-[20px] pb-[100px]">
        <div className="space-y-[16px]">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm overflow-hidden"
            >
              {/* Service Header */}
              <div className="p-[16px]">
                <div className="flex items-start justify-between mb-[12px]">
                  <div className="flex-1">
                    <h3 className="text-[#111827] text-[16px] font-bold mb-[6px]">
                      {service.name || "New Service"}
                    </h3>
                    <span className="inline-block bg-[#F3F4F6] text-[#6B7280] px-[10px] py-[3px] rounded-[5px] text-[11px] font-medium">
                      {service.category || "Uncategorized"}
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px] ml-[12px]">
                    <span className="text-[11px] text-[#6B7280] font-medium">
                      Active
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={service.isActive}
                        onChange={() => toggleServiceActive(service.id)}
                        className="sr-only peer"
                      />
                      <div className="w-[44px] h-[24px] bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[20px] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-[#56C490] shadow-inner"></div>
                    </label>
                    <button
                      onClick={() => toggleServiceExpanded(service.id)}
                      className="ml-[8px] w-[32px] h-[32px] rounded-[6px] bg-[#F3F4F6] flex items-center justify-center transition-all active:scale-90"
                    >
                      {service.isExpanded ? (
                        <ChevronUp className="w-[18px] h-[18px] text-[#6B7280]" />
                      ) : (
                        <ChevronDown className="w-[18px] h-[18px] text-[#6B7280]" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteService(service.id)}
                      className="w-[32px] h-[32px] rounded-[6px] bg-[#FEE2E2] flex items-center justify-center transition-all active:scale-90"
                    >
                      <Trash2 className="w-[16px] h-[16px] text-[#DC2626]" />
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {service.isExpanded && (
                  <div className="space-y-[16px] pt-[16px] border-t border-[#E5E7EB] mt-[12px]">
                    {/* Service Name & Category Row */}
                    <div className="grid grid-cols-2 gap-[12px]">
                      <div>
                        <label className="block text-[12px] font-semibold text-[#6B7280] mb-[6px]">
                          Service Name
                        </label>
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => updateService(service.id, "name", e.target.value)}
                          className="w-full px-[12px] py-[10px] rounded-[8px] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                          placeholder="e.g., House Cleaning"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#6B7280] mb-[6px]">
                          Category
                        </label>
                        <input
                          type="text"
                          value={service.category}
                          onChange={(e) => updateService(service.id, "category", e.target.value)}
                          className="w-full px-[12px] py-[10px] rounded-[8px] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                          placeholder="e.g., Cleaning"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[12px] font-semibold text-[#6B7280] mb-[6px]">
                        Description
                      </label>
                      <textarea
                        value={service.description}
                        onChange={(e) => updateService(service.id, "description", e.target.value)}
                        rows={3}
                        className="w-full px-[12px] py-[10px] rounded-[8px] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all resize-none"
                        placeholder="Describe your service..."
                      />
                    </div>

                    {/* Pricing Row 1 */}
                    <div className="grid grid-cols-4 gap-[12px]">
                      <div>
                        <label className="block text-[12px] font-semibold text-[#6B7280] mb-[6px]">
                          Base Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-[12px] top-[10px] text-[14px] text-[#6B7280]">
                            ₱
                          </span>
                          <input
                            type="number"
                            value={service.basePrice}
                            onChange={(e) => updateService(service.id, "basePrice", e.target.value)}
                            className="w-full pl-[28px] pr-[12px] py-[10px] rounded-[8px] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#6B7280] mb-[6px]">
                          Price Unit
                        </label>
                        <select
                          value={service.priceUnit}
                          onChange={(e) => updateService(service.id, "priceUnit", e.target.value)}
                          className="w-full px-[12px] py-[10px] rounded-[8px] border border-[#E5E7EB] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                        >
                          <option value="per hour">per hour</option>
                          <option value="per day">per day</option>
                          <option value="per project">per project</option>
                          <option value="per sqm">per sqm</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#6B7280] mb-[6px]">
                          Min Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-[12px] top-[10px] text-[14px] text-[#6B7280]">
                            ₱
                          </span>
                          <input
                            type="number"
                            value={service.minPrice}
                            onChange={(e) => updateService(service.id, "minPrice", e.target.value)}
                            className="w-full pl-[28px] pr-[12px] py-[10px] rounded-[8px] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#6B7280] mb-[6px]">
                          Max Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-[12px] top-[10px] text-[14px] text-[#6B7280]">
                            ₱
                          </span>
                          <input
                            type="number"
                            value={service.maxPrice}
                            onChange={(e) => updateService(service.id, "maxPrice", e.target.value)}
                            className="w-full pl-[28px] pr-[12px] py-[10px] rounded-[8px] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pricing Row 2 */}
                    <div className="grid grid-cols-5 gap-[12px]">
                      <div>
                        <label className="block text-[12px] font-semibold text-[#6B7280] mb-[6px]">
                          Estimated Duration
                        </label>
                        <input
                          type="number"
                          value={service.estimatedDuration}
                          onChange={(e) => updateService(service.id, "estimatedDuration", e.target.value)}
                          className="w-full px-[12px] py-[10px] rounded-[8px] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#6B7280] mb-[6px]">
                          Unit
                        </label>
                        <select
                          value={service.unit}
                          onChange={(e) => updateService(service.id, "unit", e.target.value)}
                          className="w-full px-[12px] py-[10px] rounded-[8px] border border-[#E5E7EB] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                        >
                          <option value="hours">hours</option>
                          <option value="days">days</option>
                          <option value="weeks">weeks</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#6B7280] mb-[6px]">
                          Callout Fee
                        </label>
                        <div className="relative">
                          <span className="absolute left-[12px] top-[10px] text-[14px] text-[#6B7280]">
                            ₱
                          </span>
                          <input
                            type="number"
                            value={service.calloutFee}
                            onChange={(e) => updateService(service.id, "calloutFee", e.target.value)}
                            className="w-full pl-[28px] pr-[12px] py-[10px] rounded-[8px] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#6B7280] mb-[6px]">
                          Emergency Rate
                        </label>
                        <select
                          value={service.emergencyRate}
                          onChange={(e) => updateService(service.id, "emergencyRate", e.target.value)}
                          className="w-full px-[12px] py-[10px] rounded-[8px] border border-[#E5E7EB] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                        >
                          <option value="1.0x">1.0x</option>
                          <option value="1.5x">1.5x</option>
                          <option value="2.0x">2.0x</option>
                          <option value="2.5x">2.5x</option>
                          <option value="3.0x">3.0x</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#6B7280] mb-[6px]">
                          Materials Markup
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={service.materialsMarkup}
                            onChange={(e) => updateService(service.id, "materialsMarkup", e.target.value)}
                            className="w-full pl-[12px] pr-[28px] py-[10px] rounded-[8px] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                            placeholder="0"
                          />
                          <span className="absolute right-[12px] top-[10px] text-[14px] text-[#6B7280]">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-[24px] py-[16px] pb-[calc(16px+env(safe-area-inset-bottom))] shrink-0">
        <div className="flex gap-[12px]">
          <button
            onClick={handleCancel}
            className="flex-1 bg-white border border-[#E5E7EB] text-[#6B7280] rounded-[12px] py-[14px] font-semibold text-[16px] transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAll}
            className="flex-1 bg-[#56C490] text-white rounded-[12px] py-[14px] font-semibold text-[16px] flex items-center justify-center gap-[8px] transition-all active:scale-[0.98] shadow-sm"
          >
            <svg
              className="w-[18px] h-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
}