import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import ReceiptPdfPreview from "../components/ReceiptPdfPreview";
import {
  ArrowLeft,
  Search,
  Calendar,
  Wrench,
  Paintbrush,
  Droplets,
  Zap,
  Leaf,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  X,
  MapPin,
  StickyNote,
  Hash,
  ClipboardList,
  Receipt,
  Download,
} from "lucide-react";
import {
  customerServiceHistory,
  serviceCategories,
  type ServiceHistory,
} from "../data/customer-service-history";

// ─── Category Icon Map ─────────────────────────────────────────
const getCategoryIcon = (category: string): ReactNode => {
  const cls = "w-[22px] h-[22px] text-[#56C490]";
  switch (category) {
    case "Plumbing":
      return <Droplets className={cls} />;
    case "Electrical":
      return <Zap className={cls} />;
    case "Home Improvement":
      return <Paintbrush className={cls} />;
    case "Gardening":
      return <Leaf className={cls} />;
    case "Cleaning":
      return <Sparkles className={cls} />;
    case "Repair":
      return <Wrench className={cls} />;
    default:
      return <Wrench className={cls} />;
  }
};

// ─── Helpers ───────────────────────────────────────────────────
const formatPeso = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const computeBreakdown = (total: number) => {
  // 12 % VAT is inclusive for Philippine services
  const vatRate = 0.12;
  const serviceFee = +(total / (1 + vatRate)).toFixed(2);
  const tax = +(total - serviceFee).toFixed(2);
  return { serviceFee, tax, total };
};

// ─── Receipt Bottom Sheet ──────────────────────────────────────
function ReceiptSheet({
  service,
  onClose,
}: {
  service: ServiceHistory;
  onClose: () => void;
}) {
  const { serviceFee, tax, total } = computeBreakdown(service.amountPaid);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // If PDF preview is active, render it instead
  if (showPdfPreview) {
    return (
      <ReceiptPdfPreview
        service={service}
        onClose={() => {
          setShowPdfPreview(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 transition-opacity" />

      {/* Sheet */}
      <div
        className="relative w-full bg-white rounded-t-[28px] animate-[slideUpFromBottom_0.35s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-[14px] pb-[6px]">
          <div className="w-[36px] h-[5px] rounded-full bg-[#D1D5DB]" />
        </div>

        <div className="px-[24px] pt-[4px] pb-[40px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-[24px]">
            <div className="flex items-center gap-[10px]">
              <div className="w-[36px] h-[36px] rounded-full bg-[#56C490]/10 flex items-center justify-center">
                <Receipt className="w-[18px] h-[18px] text-[#56C490]" />
              </div>
              <h3 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
                Service Receipt
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-[34px] h-[34px] rounded-full bg-[#F3F4F6] flex items-center justify-center transition-all active:scale-90"
            >
              <X className="w-[18px] h-[18px] text-[#6B7280]" />
            </button>
          </div>

          {/* Service Info */}
          <div className="bg-[#F9FAFB] rounded-[16px] p-[20px] mb-[16px]">
            <div className="flex justify-between items-center mb-[12px]">
              <span className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">
                Reference No.
              </span>
              <span className="font-['Nunito',sans-serif] text-[13px] text-[#111827] tracking-wide">
                {service.referenceNumber}
              </span>
            </div>
            <div className="flex justify-between items-center mb-[12px]">
              <span className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">
                Service
              </span>
              <span className="font-['Nunito',sans-serif] text-[13px] text-[#111827]">
                {service.serviceType}
              </span>
            </div>
            <div className="flex justify-between items-center mb-[12px]">
              <span className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">
                Provider
              </span>
              <span className="font-['Nunito',sans-serif] text-[13px] text-[#111827]">
                {service.providerName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">
                Date
              </span>
              <span className="font-['Nunito',sans-serif] text-[13px] text-[#111827]">
                {service.dateCompleted}
              </span>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-[#F9FAFB] rounded-[16px] p-[20px]">
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#374151] mb-[14px]">
              Payment Breakdown
            </p>
            <div className="flex justify-between items-center mb-[10px]">
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                Service Fee
              </span>
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
                {formatPeso(serviceFee)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-[14px]">
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                VAT (12%)
              </span>
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
                {formatPeso(tax)}
              </span>
            </div>
            <div className="h-[1px] bg-[#E5E7EB] mb-[14px]" />
            <div className="flex justify-between items-center">
              <span className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
                Total Paid
              </span>
              <span className="font-['Nunito',sans-serif] text-[22px] text-[#56C490]">
                {formatPeso(total)}
              </span>
            </div>
          </div>

          {/* Download CTA */}
          <button
            onClick={() => setShowPdfPreview(true)}
            className="w-full h-[52px] mt-[24px] bg-[#56C490] rounded-[50px] flex items-center justify-center gap-[8px] transition-all active:scale-[0.98] shadow-[0_6px_20px_rgba(86,196,144,0.3)]"
          >
            <Download className="w-[18px] h-[18px] text-white" />
            <span className="font-['Nunito',sans-serif] text-[15px] text-white">
              Download Receipt
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Service Card ──────────────────────────────────────────────
function ServiceCard({
  service,
  onReceipt,
}: {
  service: ServiceHistory;
  onReceipt: (s: ServiceHistory) => void;
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-[16px] shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden transition-shadow">
      <div className="p-[18px]">
        {/* ── Row 1: Service Title + Status Badge ── */}
        <div className="flex items-start justify-between gap-[12px] mb-[12px]">
          <div className="flex items-center gap-[12px] flex-1 min-w-0">
            <div className="w-[42px] h-[42px] rounded-[12px] bg-[#56C490]/8 flex items-center justify-center flex-shrink-0">
              {getCategoryIcon(service.category)}
            </div>
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] leading-[1.25] truncate">
              {service.serviceType}
            </h3>
          </div>

          <div
            className={`px-[10px] py-[4px] rounded-[8px] flex-shrink-0 ${
              service.status === "completed"
                ? "bg-[#ECFDF5]"
                : "bg-[#FEF2F2]"
            }`}
          >
            <span
              className={`font-['Nunito',sans-serif] text-[11px] ${
                service.status === "completed"
                  ? "text-[#047857]"
                  : "text-[#DC2626]"
              }`}
            >
              {service.status === "completed" ? "Completed" : "Cancelled"}
            </span>
          </div>
        </div>

        {/* ── Row 2: Provider + Date ── */}
        <div className="flex items-center justify-between mb-[14px] pl-[54px]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] truncate">
            {service.providerName}
          </p>
          <div className="flex items-center gap-[5px] flex-shrink-0">
            <Calendar className="w-[13px] h-[13px] text-[#9CA3AF]" />
            <span className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
              {service.dateCompleted}
            </span>
          </div>
        </div>

        {/* ── Row 3: Price (right-aligned) ── */}
        <div className="flex items-end justify-end mb-[2px]">
          <p className="font-['Nunito',sans-serif] text-[20px] text-[#56C490] leading-[1]">
            {formatPeso(service.amountPaid)}
          </p>
        </div>

        {/* ── Expanded Details Section ── */}
        {expanded && (
          <div className="mt-[16px] pt-[16px] border-t border-[#F3F4F6] space-y-[12px] animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-start gap-[10px]">
              <MapPin className="w-[16px] h-[16px] text-[#56C490] mt-[2px] flex-shrink-0" />
              <div>
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-[3px]">
                  Service Address
                </p>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#374151] leading-[1.5]">
                  {service.address}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-[10px]">
              <StickyNote className="w-[16px] h-[16px] text-[#56C490] mt-[2px] flex-shrink-0" />
              <div>
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-[3px]">
                  Provider Notes
                </p>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#374151] leading-[1.5]">
                  {service.notes}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-[10px]">
              <Hash className="w-[16px] h-[16px] text-[#56C490] mt-[2px] flex-shrink-0" />
              <div>
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-[3px]">
                  Reference
                </p>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#374151] tracking-wide">
                  {service.referenceNumber}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Action Pills ── */}
      <div className="px-[18px] pb-[16px] pt-[2px] flex gap-[8px]">
        {/* Receipt */}
        <button
          onClick={() => onReceipt(service)}
          className="flex-1 h-[38px] rounded-[50px] border-[1.5px] border-[#56C490] bg-white flex items-center justify-center gap-[6px] transition-all active:scale-[0.96] active:bg-[#56C490]/5"
        >
          <FileText className="w-[14px] h-[14px] text-[#56C490]" />
          <span className="font-['Nunito',sans-serif] text-[12px] text-[#56C490]">
            Receipt
          </span>
        </button>

        {/* Details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex-1 h-[38px] rounded-[50px] border-[1.5px] bg-white flex items-center justify-center gap-[5px] transition-all active:scale-[0.96] ${
            expanded
              ? "border-[#56C490] bg-[#56C490]/5"
              : "border-[#D1D5DB]"
          }`}
        >
          {expanded ? (
            <ChevronUp className="w-[14px] h-[14px] text-[#6B7280]" />
          ) : (
            <ChevronDown className="w-[14px] h-[14px] text-[#6B7280]" />
          )}
          <span className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
            Details
          </span>
        </button>

        {/* Book Again */}
        <button
          onClick={() => navigate("/customer/all-services")}
          className="flex-1 h-[38px] rounded-[50px] bg-[#56C490] flex items-center justify-center gap-[5px] transition-all active:scale-[0.96] shadow-[0_3px_10px_rgba(86,196,144,0.3)]"
        >
          <RotateCcw className="w-[13px] h-[13px] text-white" />
          <span className="font-['Nunito',sans-serif] text-[12px] text-white">
            Book Again
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Screen ───────────────────────────────────────────────
export default function CustomerServiceHistory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Services");
  const [receiptService, setReceiptService] = useState<ServiceHistory | null>(null);

  // Filter logic
  const filteredHistory = customerServiceHistory.filter((service) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      service.serviceType.toLowerCase().includes(q) ||
      service.providerName.toLowerCase().includes(q) ||
      service.referenceNumber.toLowerCase().includes(q);
    const matchesCategory =
      activeCategory === "All Services" || service.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MobileContainer>
      <div className="h-full bg-[#F4F5F7] flex flex-col">
        {/* ── iOS Status Bar ── */}
        <div className="bg-[#56C490] flex-shrink-0">
          <StatusBar />
        </div>

        {/* ── Header ── */}
        <div className="bg-[#56C490] px-[24px] pt-[12px] pb-[28px] flex-shrink-0 rounded-b-[24px]">
          {/* Title Row — No export icon */}
          <div className="flex items-center gap-[14px] mb-[20px]">
            <button
              onClick={() => navigate(-1)}
              className="w-[38px] h-[38px] rounded-full bg-white/15 flex items-center justify-center transition-all active:scale-90"
              aria-label="Go back"
            >
              <ArrowLeft className="w-[20px] h-[20px] text-white" />
            </button>
            <h1 className="font-['Nunito',sans-serif] text-[22px] text-white tracking-[-0.3px]">
              Service History
            </h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services or providers..."
              className="w-full h-[46px] pl-[46px] pr-[44px] rounded-[14px] bg-white border-none outline-none font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#B0B5BE] shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-[14px] top-1/2 -translate-y-1/2 w-[24px] h-[24px] rounded-full bg-[#F3F4F6] flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-[14px] h-[14px] text-[#6B7280]" />
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Category Pills — horizontally scrollable */}
          <div
            className="flex gap-[8px] py-[18px] overflow-x-auto px-[24px] flex-shrink-0"
            style={{ scrollbarWidth: "none" }}
          >
            {serviceCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-[16px] py-[8px] rounded-[50px] font-['Nunito',sans-serif] text-[13px] whitespace-nowrap transition-all active:scale-95 flex-shrink-0 ${
                  activeCategory === cat
                    ? "bg-[#56C490] text-white shadow-[0_2px_10px_rgba(86,196,144,0.3)]"
                    : "bg-white text-[#6B7280] shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
                }`}
              >
                {cat === "All Services" ? "All" : cat}
              </button>
            ))}
          </div>

          {/* Result Count */}
          <div className="px-[24px] pb-[10px]">
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">
              {filteredHistory.length}{" "}
              {filteredHistory.length === 1 ? "service" : "services"} found
            </p>
          </div>

          {/* Cards or Empty State */}
          {filteredHistory.length > 0 ? (
            <div className="px-[24px] pb-[120px] space-y-[14px]">
              {filteredHistory.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onReceipt={setReceiptService}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-[24px] pt-[56px] pb-[120px]">
              {/* Illustration */}
              <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#56C490]/10 to-[#56C490]/5 flex items-center justify-center mb-[24px]">
                <ClipboardList className="w-[52px] h-[52px] text-[#56C490]/35" />
              </div>
              <h3 className="font-['Nunito',sans-serif] text-[20px] text-[#111827] mb-[8px]">
                No services yet
              </h3>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#9CA3AF] text-center leading-[1.6] mb-[32px] max-w-[250px]">
                Your completed services will show up here once you book your
                first provider.
              </p>
              <button
                onClick={() => navigate("/customer/all-services")}
                className="h-[50px] px-[36px] bg-[#56C490] rounded-[50px] flex items-center justify-center gap-[8px] transition-all active:scale-95 shadow-[0_6px_20px_rgba(86,196,144,0.3)]"
              >
                <Search className="w-[18px] h-[18px] text-white" />
                <span className="font-['Nunito',sans-serif] text-[15px] text-white">
                  Find a Service
                </span>
              </button>
            </div>
          )}
        </div>

        {/* ── Home Indicator ── */}
        <div className="h-[34px] bg-white relative flex-shrink-0">
          <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
        </div>

        {/* Receipt Bottom Sheet Overlay */}
        {receiptService && (
          <ReceiptSheet
            service={receiptService}
            onClose={() => setReceiptService(null)}
          />
        )}
      </div>
    </MobileContainer>
  );
}