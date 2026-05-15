import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ChevronDown,
  X,
  Plus,
  Pencil,
  Trash2,
  Search,
  FileText,
  Clock,
  Wrench,
  Sparkles,
  GraduationCap,
  Home,
  PawPrint,
  PartyPopper,
  Car,
} from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { StickyFooterButton } from "../components/StickyFooterButton";

// ─── Types ────────────────────────────────────────────────────
interface ServiceConfig {
  id: string;
  serviceName: string;
  basePrice: string;
  priceUnit: "per hour" | "per project" | "per sqm";
  estimatedDuration: string;
  durationUnit: "minutes" | "hours" | "days";
  // Extended details (edited via modal)
  description: string;
  inclusions: string;
  exclusions: string;
}

// ─── Constants ────────────────────────────────────────────────
const AVAILABLE_SERVICES = [
  {
    category: "Home Maintenance and Repair",
    icon: Wrench,
    services: ["Plumbing", "Electrical", "Carpentry", "Painting", "Other"],
  },
  {
    category: "Beauty, Wellness & Personal Care",
    icon: Sparkles,
    services: ["Hair Styling", "Makeup Artist", "Massage Therapy", "Nails", "Other"],
  },
  {
    category: "Education & Professional Services",
    icon: GraduationCap,
    services: ["Academic Tutor", "Language Teacher", "Music Lessons", "Other"],
  },
  {
    category: "Domestic & Cleaning Services",
    icon: Home,
    services: ["House Cleaning", "Laundry", "Ironing", "Deep Cleaning", "Other"],
  },
  {
    category: "Pet Services",
    icon: PawPrint,
    services: ["Pet Grooming", "Dog Walking", "Pet Sitting", "Other"],
  },
  {
    category: "Events & Entertainment",
    icon: PartyPopper,
    services: ["Photography", "Hosting/MC", "Catering", "DJ/Live Music", "Other"],
  },
  {
    category: "Automotive & Tech Support",
    icon: Car,
    services: ["Car Repair", "Car Wash", "IT/Gadget Repair", "Other"],
  },
];

const PRICE_UNITS: ServiceConfig["priceUnit"][] = ["per hour", "per project", "per sqm"];
const DURATION_UNITS: ServiceConfig["durationUnit"][] = ["minutes", "hours", "days"];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function createEmptyService(name: string): ServiceConfig {
  return {
    id: generateId(),
    serviceName: name,
    basePrice: "",
    priceUnit: "per hour",
    estimatedDuration: "",
    durationUnit: "hours",
    description: "",
    inclusions: "",
    exclusions: "",
  };
}

// ─── Edit Service Details Modal ───────────────────────────────
function EditServiceModal({
  service,
  onSave,
  onClose,
}: {
  service: ServiceConfig;
  onSave: (updated: ServiceConfig) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<ServiceConfig>({ ...service });
  const overlayRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/50 flex flex-col justify-end"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="bg-white rounded-t-[24px] max-h-[90vh] flex flex-col animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="px-[24px] pt-[20px] pb-[16px] flex items-center justify-between border-b border-[#e5e5e5] flex-shrink-0">
          <div>
            <h3 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
              Edit Service Details
            </h3>
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">
              {draft.serviceName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-[36px] h-[36px] rounded-full bg-[#f5f5f5] flex items-center justify-center transition-all active:scale-90 hover:bg-[#e5e5e5]"
          >
            <X className="w-[18px] h-[18px] text-[#666]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-[24px] py-[24px] space-y-[28px]">
          {/* Description */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] flex items-center gap-[6px]">
              <FileText className="w-[16px] h-[16px] text-[#56C490]" />
              Service Description
            </label>
            <textarea
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value.slice(0, 500) })
              }
              placeholder="Describe what's included in your service, your process, and what customers can expect..."
              rows={4}
              className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all resize-none"
            />
            <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mt-[4px] text-right">
              {draft.description.length}/500
            </p>
          </div>

          {/* What's Included */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] flex items-center gap-[6px]">
              <span className="w-[16px] h-[16px] rounded-full bg-[#56C490]/15 flex items-center justify-center text-[#56C490] text-[11px]">✓</span>
              What's Included
            </label>
            <textarea
              value={draft.inclusions}
              onChange={(e) =>
                setDraft({ ...draft, inclusions: e.target.value })
              }
              placeholder={"List what's included in your base rate (one per line)\ne.g., Basic tools and equipment\nTravel within service area"}
              rows={3}
              className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all resize-none"
            />
          </div>

          {/* What's Not Included */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] flex items-center gap-[6px]">
              <span className="w-[16px] h-[16px] rounded-full bg-[#EF4444]/15 flex items-center justify-center text-[#EF4444] text-[11px]">✕</span>
              What's Not Included
            </label>
            <textarea
              value={draft.exclusions}
              onChange={(e) =>
                setDraft({ ...draft, exclusions: e.target.value })
              }
              placeholder={"List what's NOT included or has extra charges\ne.g., Replacement parts and materials\nWeekend or holiday surcharges"}
              rows={3}
              className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-[24px] py-[16px] border-t border-[#e5e5e5] flex-shrink-0 flex gap-[12px]">
          <button
            onClick={onClose}
            className="flex-1 py-[14px] border-2 border-[#e5e5e5] rounded-[50px] font-['Nunito',sans-serif] text-[14px] text-[#666] transition-all active:scale-95 hover:border-[#ccc]"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            className="flex-1 py-[14px] bg-[#56C490] rounded-[50px] font-['Nunito',sans-serif] text-[14px] text-white transition-all active:scale-95 shadow-[0_2px_12px_rgba(86,196,144,0.25)]"
          >
            Save Changes
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Add New Service Modal ────────────────────────────────────
function AddServiceModal({
  existingServiceNames,
  onAdd,
  onClose,
}: {
  existingServiceNames: string[];
  onAdd: (serviceName: string) => void;
  onClose: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const filteredCategories = AVAILABLE_SERVICES.map((cat) => ({
    ...cat,
    services: cat.services.filter(
      (s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !existingServiceNames.includes(s)
    ),
  })).filter((cat) => cat.services.length > 0);

  const totalAvailable = filteredCategories.reduce(
    (sum, cat) => sum + cat.services.length,
    0
  );

  const isSearching = searchQuery.length > 0;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/50 flex flex-col justify-end"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="bg-white rounded-t-[24px] max-h-[85vh] flex flex-col animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="px-[24px] pt-[20px] pb-[16px] border-b border-[#f0f0f0] flex-shrink-0">
          <div className="flex items-center justify-between mb-[16px]">
            <div>
              <h3 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
                Add New Service
              </h3>
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">
                {totalAvailable} services available
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-[36px] h-[36px] rounded-full bg-[#f5f5f5] flex items-center justify-center transition-all active:scale-90 hover:bg-[#e5e5e5]"
            >
              <X className="w-[18px] h-[18px] text-[#666]" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-[40px] pr-[40px] py-[12px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[24px] h-[24px] rounded-full bg-[#d1d5db] flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-[12px] h-[12px] text-white" />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-[24px] py-[12px]">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-[40px]">
              <Search className="w-[32px] h-[32px] text-[#d1d5db] mx-auto mb-[12px]" />
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                No matching services found
              </p>
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mt-[4px]">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="space-y-[6px]">
              {filteredCategories.map((cat) => {
                const isExpanded = expandedCategory === cat.category || isSearching;
                const IconComponent = cat.icon;
                return (
                  <div key={cat.category} className="rounded-[14px] overflow-hidden">
                    {/* Category Header */}
                    <button
                      onClick={() =>
                        setExpandedCategory(
                          expandedCategory === cat.category ? null : cat.category
                        )
                      }
                      className={`w-full flex items-center justify-between px-[14px] py-[14px] rounded-[14px] transition-all active:scale-[0.98] ${
                        isExpanded
                          ? "bg-[#56C490]/8"
                          : "bg-[#f9fafb] hover:bg-[#f3f4f6]"
                      }`}
                    >
                      <div className="flex items-center gap-[12px] min-w-0 flex-1">
                        <div
                          className={`w-[36px] h-[36px] rounded-[10px] flex items-center justify-center flex-shrink-0 transition-colors ${
                            isExpanded
                              ? "bg-[#56C490] shadow-[0_2px_8px_rgba(86,196,144,0.3)]"
                              : "bg-[#56C490]/10"
                          }`}
                        >
                          <IconComponent
                            className={`w-[18px] h-[18px] transition-colors ${
                              isExpanded ? "text-white" : "text-[#56C490]"
                            }`}
                          />
                        </div>
                        <div className="text-left min-w-0">
                          <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827] block truncate">
                            {cat.category}
                          </span>
                          <span className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF]">
                            {cat.services.length} {cat.services.length === 1 ? "service" : "services"}
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-[18px] h-[18px] flex-shrink-0 transition-all duration-200 ${
                          isExpanded ? "rotate-180 text-[#56C490]" : "text-[#9CA3AF]"
                        }`}
                      />
                    </button>

                    {/* Sub-categories */}
                    {isExpanded && (
                      <div className="ml-[18px] border-l-2 border-[#56C490]/20 pl-[14px] py-[6px] space-y-[2px]">
                        {cat.services.map((svc) => (
                          <button
                            key={svc}
                            onClick={() => onAdd(svc)}
                            className="w-full flex items-center justify-between px-[12px] py-[11px] rounded-[10px] transition-all active:scale-[0.97] hover:bg-[#56C490]/5 group"
                          >
                            <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151] group-hover:text-[#56C490] transition-colors">
                              {svc}
                            </span>
                            <div className="w-[28px] h-[28px] rounded-full bg-[#f5f5f5] flex items-center justify-center group-hover:bg-[#56C490] transition-all flex-shrink-0">
                              <Plus className="w-[14px] h-[14px] text-[#56C490] group-hover:text-white transition-colors" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────
function DeleteConfirmModal({
  serviceName,
  onConfirm,
  onCancel,
}: {
  serviceName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-[32px]"
      onClick={(e) => e.target === overlayRef.current && onCancel()}
    >
      <div className="bg-white rounded-[20px] p-[24px] w-full max-w-[340px] animate-[scaleIn_0.2s_ease-out]">
        <div className="w-[48px] h-[48px] rounded-full bg-[#FEE2E2] mx-auto mb-[16px] flex items-center justify-center">
          <Trash2 className="w-[22px] h-[22px] text-[#EF4444]" />
        </div>
        <h3 className="font-['Nunito',sans-serif] text-[18px] text-[#111827] text-center mb-[8px]">
          Remove Service?
        </h3>
        <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] text-center leading-[1.5] mb-[24px]">
          Are you sure you want to remove{" "}
          <span className="font-['Nunito',sans-serif] text-[#111827]">
            {serviceName}
          </span>{" "}
          from your offerings?
        </p>
        <div className="flex gap-[12px]">
          <button
            onClick={onCancel}
            className="flex-1 py-[12px] border-2 border-[#e5e5e5] rounded-[50px] font-['Nunito',sans-serif] text-[14px] text-[#666] transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-[12px] bg-[#EF4444] rounded-[50px] font-['Nunito',sans-serif] text-[14px] text-white transition-all active:scale-95"
          >
            Remove
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function ProviderServiceConfig() {
  const navigate = useNavigate();

  const [services, setServices] = useState<ServiceConfig[]>([
    createEmptyService("Plumbing"),
  ]);

  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [showAddService, setShowAddService] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [addedFlash, setAddedFlash] = useState<string | null>(null);

  const handleInputChange = (
    index: number,
    field: keyof ServiceConfig,
    value: string
  ) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const toggleDropdown = (key: string) => {
    setOpenDropdowns((prev) => {
      // Close all other dropdowns when opening a new one
      const next: Record<string, boolean> = {};
      next[key] = !prev[key];
      return next;
    });
  };

  const handleContinue = () => {
    navigate("/provider/service-area-setup");
  };

  const handleSaveDetails = (updated: ServiceConfig) => {
    setServices((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
    setEditingServiceId(null);
  };

  const handleAddService = (serviceName: string) => {
    const newService = createEmptyService(serviceName);
    setServices((prev) => [...prev, newService]);
    setShowAddService(false);
    setAddedFlash(newService.id);
    setTimeout(() => setAddedFlash(null), 1500);
  };

  const handleDeleteService = () => {
    if (deleteServiceId) {
      setServices((prev) => prev.filter((s) => s.id !== deleteServiceId));
      setDeleteServiceId(null);
    }
  };

  const isFormValid =
    services.length > 0 &&
    services.every(
      (service) =>
        service.basePrice !== "" && service.estimatedDuration !== ""
    );

  const editingService = services.find((s) => s.id === editingServiceId);
  const deletingService = services.find((s) => s.id === deleteServiceId);

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
            Service Configuration
          </h2>
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
            2 of 4
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-[4px] bg-[#e5e5e5] flex-shrink-0">
        <div
          className="h-full bg-[#56C490] transition-all duration-300"
          style={{ width: "50%" }}
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[120px]">
        <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] leading-[1.2] mt-[28px] mb-[8px]">
          Configure Your Services
        </h1>
        <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.5] mb-[36px]">
          Set your pricing and estimated duration for each service you offer.
        </p>

        {/* Service Cards */}
        <div className="space-y-[20px]">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`border-2 rounded-[16px] bg-white transition-all duration-500 ${
                addedFlash === service.id
                  ? "border-[#56C490] shadow-[0_0_0_4px_rgba(86,196,144,0.12)]"
                  : "border-[#e5e5e5]"
              }`}
            >
              {/* Card Body */}
              <div className="p-[20px]">
                {/* Service Name + Delete */}
                <div className="flex items-center justify-between mb-[24px]">
                  <div className="flex items-center gap-[12px] flex-1 min-w-0">
                    <div className="w-[40px] h-[40px] rounded-[10px] bg-[#56C490]/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-[20px] h-[20px] text-[#56C490]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-['Nunito',sans-serif] text-[16px] text-[#111827] truncate">
                        {service.serviceName}
                      </p>
                      {service.description && (
                        <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] truncate mt-[1px]">
                          Details added
                        </p>
                      )}
                    </div>
                  </div>
                  {services.length > 1 && (
                    <button
                      onClick={() => setDeleteServiceId(service.id)}
                      className="w-[36px] h-[36px] rounded-[10px] bg-[#FEF2F2] flex items-center justify-center transition-all active:scale-90 hover:bg-[#FEE2E2] flex-shrink-0 ml-[8px]"
                      aria-label="Remove service"
                    >
                      <Trash2 className="w-[16px] h-[16px] text-[#EF4444]" />
                    </button>
                  )}
                </div>

                {/* Fields */}
                <div className="space-y-[20px]">
                  {/* Base Rate */}
                  <div>
                    <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                      Base Rate <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-[16px] top-1/2 -translate-y-1/2 font-['Nunito',sans-serif] text-[15px] text-[#56C490]">
                        ₱
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={service.basePrice}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          handleInputChange(index, "basePrice", val);
                        }}
                        placeholder="0.00"
                        className="w-full pl-[38px] pr-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Price Unit */}
                  <div className="relative">
                    <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                      Price Unit <span className="text-[#EF4444]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleDropdown(`priceUnit-${index}`)}
                      className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[15px] text-left flex items-center justify-between transition-all ${
                        openDropdowns[`priceUnit-${index}`]
                          ? "border-[#56C490] bg-white"
                          : "border-transparent"
                      }`}
                    >
                      <span className="text-[#1a1a1a] capitalize">
                        {service.priceUnit}
                      </span>
                      <ChevronDown
                        className={`w-[20px] h-[20px] text-[#666] transition-transform ${
                          openDropdowns[`priceUnit-${index}`]
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                    {openDropdowns[`priceUnit-${index}`] && (
                      <div className="absolute top-full left-0 right-0 mt-[8px] bg-white border-2 border-[#56C490] rounded-[12px] shadow-lg z-10 overflow-hidden">
                        {PRICE_UNITS.map((unit) => (
                          <button
                            key={unit}
                            onClick={() => {
                              handleInputChange(index, "priceUnit", unit);
                              toggleDropdown(`priceUnit-${index}`);
                            }}
                            className={`w-full px-[16px] py-[12px] font-['Nunito',sans-serif] text-[14px] text-left transition-all capitalize ${
                              service.priceUnit === unit
                                ? "bg-[#56C490]/10 text-[#56C490]"
                                : "text-[#1a1a1a] hover:bg-[#f5f5f5]"
                            }`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Est. Duration — value + unit side by side */}
                  <div className="relative">
                    <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                      Est. Duration <span className="text-[#EF4444]">*</span>
                    </label>
                    <div
                      className={`flex items-center w-full bg-[#f5f5f5] border-2 rounded-[12px] transition-all ${
                        openDropdowns[`durationUnit-${index}`]
                          ? "border-[#56C490] bg-white"
                          : "border-transparent"
                      } focus-within:border-[#56C490] focus-within:bg-white`}
                    >
                      <input
                        type="text"
                        inputMode="numeric"
                        value={service.estimatedDuration}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          handleInputChange(index, "estimatedDuration", val);
                        }}
                        placeholder="0"
                        className="flex-1 min-w-0 pl-[16px] pr-[12px] py-[14px] bg-transparent font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none"
                      />
                      <div className="w-[1px] h-[24px] bg-[#d4d4d4] flex-shrink-0" />
                      <button
                        type="button"
                        onClick={() =>
                          toggleDropdown(`durationUnit-${index}`)
                        }
                        className="flex items-center gap-[6px] pl-[12px] pr-[14px] py-[14px] flex-shrink-0"
                      >
                        <span className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] capitalize whitespace-nowrap">
                          {service.durationUnit}
                        </span>
                        <ChevronDown
                          className={`w-[18px] h-[18px] text-[#666] transition-transform ${
                            openDropdowns[`durationUnit-${index}`]
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>
                    </div>
                    {openDropdowns[`durationUnit-${index}`] && (
                      <div className="absolute top-full left-0 right-0 mt-[8px] bg-white border-2 border-[#56C490] rounded-[12px] shadow-lg z-20 overflow-hidden">
                        {DURATION_UNITS.map((unit) => (
                          <button
                            key={unit}
                            onClick={() => {
                              handleInputChange(
                                index,
                                "durationUnit",
                                unit
                              );
                              toggleDropdown(`durationUnit-${index}`);
                            }}
                            className={`w-full px-[16px] py-[12px] font-['Nunito',sans-serif] text-[14px] text-left transition-all capitalize ${
                              service.durationUnit === unit
                                ? "bg-[#56C490]/10 text-[#56C490]"
                                : "text-[#1a1a1a] hover:bg-[#f5f5f5]"
                            }`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer — Edit Details */}
              <div className="border-t border-[#f0f0f0] px-[20px] py-[14px]">
                <button
                  onClick={() => setEditingServiceId(service.id)}
                  className="w-full flex items-center justify-center gap-[8px] py-[10px] rounded-[10px] font-['Nunito',sans-serif] text-[14px] text-[#56C490] transition-all active:scale-[0.97] hover:bg-[#56C490]/5"
                >
                  <Pencil className="w-[15px] h-[15px]" />
                  Edit Service Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Service — simple text button */}
        <button
          onClick={() => setShowAddService(true)}
          className="mt-[28px] w-full flex items-center justify-center gap-[8px] py-[16px] font-['Nunito',sans-serif] text-[15px] text-[#56C490] transition-all active:scale-[0.97] hover:bg-[#56C490]/5 rounded-[14px]"
        >
          <Plus className="w-[18px] h-[18px]" />
          Add New Service
        </button>

        {/* Helper text */}
        <p className="text-center font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mt-[8px] mb-[16px]">
          You can add more services or update details later.
        </p>
      </div>

      {/* Sticky Footer Button */}
      <StickyFooterButton
        label="Continue"
        onClick={handleContinue}
        disabled={!isFormValid}
      />

      {/* Edit Modal */}
      {editingService && (
        <EditServiceModal
          service={editingService}
          onSave={handleSaveDetails}
          onClose={() => setEditingServiceId(null)}
        />
      )}

      {/* Add Modal */}
      {showAddService && (
        <AddServiceModal
          existingServiceNames={services.map((s) => s.serviceName)}
          onAdd={handleAddService}
          onClose={() => setShowAddService(false)}
        />
      )}

      {/* Delete Modal */}
      {deletingService && (
        <DeleteConfirmModal
          serviceName={deletingService.serviceName}
          onConfirm={handleDeleteService}
          onCancel={() => setDeleteServiceId(null)}
        />
      )}
    </div>
  );
}