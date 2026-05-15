import { useState, useEffect, useRef } from "react";
import {
  X,
  Share2,
  Download,
  CheckCircle2,
} from "lucide-react";
import type { ServiceHistory } from "../data/customer-service-history";

// ─── Helpers ───────────────────────────────────────────────────
const formatPeso = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const computeBreakdown = (total: number) => {
  const vatRate = 0.12;
  const serviceFee = +(total / (1 + vatRate)).toFixed(2);
  const tax = +(total - serviceFee).toFixed(2);
  return { serviceFee, tax, total };
};

// ─── ServEase Vector Logo ──────────────────────────────────────
function ServEaseLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield shape */}
      <path
        d="M20 2L4 10V20C4 30 20 38 20 38C20 38 36 30 36 20V10L20 2Z"
        fill="#56C490"
      />
      {/* Checkmark */}
      <path
        d="M14 20L18.5 24.5L27 15"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Circular Progress ─────────────────────────────────────────
function CircularProgress({ progress }: { progress: number }) {
  const radius = 36;
  const stroke = 5;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-[80px] h-[80px] flex items-center justify-center">
      <svg width={radius * 2} height={radius * 2} className="-rotate-90">
        {/* Track */}
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="white"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.15s ease-out" }}
        />
      </svg>
      {/* Percentage */}
      <span className="absolute font-['Nunito',sans-serif] text-[16px] text-white">
        {Math.round(progress)}%
      </span>
    </div>
  );
}

// ─── Share Sheet Simulation ────────────────────────────────────
function ShareSheet({ onClose }: { onClose: () => void }) {
  const shareOptions = [
    { label: "Save to Files", icon: "folder" },
    { label: "AirDrop", icon: "airdrop" },
    { label: "Messages", icon: "messages" },
    { label: "Mail", icon: "mail" },
    { label: "More", icon: "more" },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full bg-[#F2F2F7] rounded-t-[14px] animate-[slideUpFromBottom_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-[10px] pb-[6px]">
          <div className="w-[36px] h-[4px] rounded-full bg-[#C7C7CC]" />
        </div>

        {/* Preview row */}
        <div className="px-[20px] py-[14px] flex items-center gap-[14px] border-b border-[#E5E5EA]">
          <div className="w-[48px] h-[48px] rounded-[10px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex items-center justify-center">
            <ServEaseLogo size={26} />
          </div>
          <div>
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
              ServEase_Receipt.pdf
            </p>
            <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
              PDF Document — 42 KB
            </p>
          </div>
        </div>

        {/* Share targets */}
        <div className="px-[12px] py-[18px]">
          <div className="flex gap-[4px] overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {shareOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={onClose}
                className="flex flex-col items-center gap-[6px] min-w-[72px] py-[8px] transition-all active:scale-95"
              >
                <div className="w-[52px] h-[52px] rounded-[12px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex items-center justify-center">
                  {opt.icon === "folder" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M3 7V17C3 18.1 3.9 19 5 19H19C20.1 19 21 18.1 21 17V9C21 7.9 20.1 7 19 7H12L10 5H5C3.9 5 3 5.9 3 7Z" fill="#3B82F6" />
                    </svg>
                  )}
                  {opt.icon === "airdrop" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" fill="#3B82F6" />
                      <path d="M12 5C8.13 5 5 8.13 5 12" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      <path d="M12 5C15.87 5 19 8.13 19 12" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      <path d="M12 1C6.48 1 2 5.48 2 11" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      <path d="M12 1C17.52 1 22 5.48 22 11" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    </svg>
                  )}
                  {opt.icon === "messages" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V16C22 17.1 21.1 18 20 18H6L2 22V6C2 4.9 2.9 4 4 4Z" fill="#34C759" />
                    </svg>
                  )}
                  {opt.icon === "mail" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="5" width="20" height="14" rx="2" fill="#3B82F6" />
                      <path d="M2 7L12 13L22 7" stroke="white" strokeWidth="1.5" />
                    </svg>
                  )}
                  {opt.icon === "more" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="6" cy="12" r="2" fill="#6B7280" />
                      <circle cx="12" cy="12" r="2" fill="#6B7280" />
                      <circle cx="18" cy="12" r="2" fill="#6B7280" />
                    </svg>
                  )}
                </div>
                <span className="font-['Nunito',sans-serif] text-[10px] text-[#374151] text-center leading-[1.2]">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-[20px] pb-[14px] space-y-[8px]">
          <button
            onClick={onClose}
            className="w-full h-[50px] bg-white rounded-[12px] flex items-center justify-center gap-[8px] transition-all active:bg-[#F3F4F6]"
          >
            <Download className="w-[18px] h-[18px] text-[#3B82F6]" />
            <span className="font-['Nunito',sans-serif] text-[15px] text-[#3B82F6]">
              Save to Files
            </span>
          </button>
        </div>

        {/* Cancel */}
        <div className="px-[20px] pb-[36px]">
          <button
            onClick={onClose}
            className="w-full h-[50px] bg-white rounded-[12px] flex items-center justify-center transition-all active:bg-[#F3F4F6]"
          >
            <span className="font-['Nunito',sans-serif] text-[15px] text-[#EF4444]">
              Cancel
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PDF A4 Preview ────────────────────────────────────────────
function PdfDocument({ service }: { service: ServiceHistory }) {
  const { serviceFee, tax, total } = computeBreakdown(service.amountPaid);

  return (
    <div
      className="bg-white mx-auto shadow-[0_4px_30px_rgba(0,0,0,0.12)] origin-top"
      style={{
        width: "345px",
        // A4 ratio ≈ 1:1.414
        height: "488px",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <div className="h-full flex flex-col p-[24px]">
        {/* ── PDF Header ── */}
        <div className="flex items-start justify-between mb-[20px]">
          {/* Logo + Brand */}
          <div className="flex items-center gap-[8px]">
            <ServEaseLogo size={30} />
            <div>
              <p className="font-['Nunito',sans-serif] text-[16px] text-[#111827] leading-[1]">
                ServEase
              </p>
              <p className="font-['Nunito',sans-serif] text-[8px] text-[#9CA3AF] mt-[2px]">
                Service Marketplace PH
              </p>
            </div>
          </div>

          {/* Official Receipt badge */}
          <div className="text-right">
            <p className="font-['Nunito',sans-serif] text-[11px] text-[#111827] tracking-[1px] uppercase">
              Official Receipt
            </p>
            <p className="font-['Nunito',sans-serif] text-[8px] text-[#9CA3AF] mt-[2px]">
              System-Generated
            </p>
          </div>
        </div>

        {/* Green accent line */}
        <div className="h-[2px] bg-gradient-to-r from-[#56C490] to-[#56C490]/20 rounded-full mb-[18px]" />

        {/* ── Receipt Details Table ── */}
        <div className="space-y-[10px] mb-[18px]">
          {[
            { label: "Reference No.", value: service.referenceNumber },
            { label: "Date Issued", value: "March 14, 2026" },
            { label: "Customer Name", value: "Kisshia" },
            { label: "Service Provider", value: service.providerName },
            { label: "Service Rendered", value: service.serviceType },
            { label: "Service Address", value: service.address },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-start gap-[12px]">
              <span className="font-['Nunito',sans-serif] text-[9px] text-[#9CA3AF] flex-shrink-0 w-[90px]">
                {row.label}
              </span>
              <span className="font-['Nunito',sans-serif] text-[9px] text-[#111827] text-right flex-1">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Financial Breakdown ── */}
        <div className="bg-[#F9FAFB] rounded-[8px] p-[14px] mb-[16px]">
          <p className="font-['Nunito',sans-serif] text-[9px] text-[#374151] uppercase tracking-[0.5px] mb-[10px]">
            Payment Summary
          </p>

          <div className="space-y-[8px]">
            <div className="flex justify-between items-center">
              <span className="font-['Nunito',sans-serif] text-[9px] text-[#6B7280]">
                Service Base Fee
              </span>
              <span className="font-['Nunito',sans-serif] text-[9px] text-[#374151]">
                {formatPeso(serviceFee)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-['Nunito',sans-serif] text-[9px] text-[#6B7280]">
                VAT (12%)
              </span>
              <span className="font-['Nunito',sans-serif] text-[9px] text-[#374151]">
                {formatPeso(tax)}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-[#D1D5DB] my-[4px]" />

            <div className="flex justify-between items-center">
              <span className="font-['Nunito',sans-serif] text-[11px] text-[#111827]">
                TOTAL PAID
              </span>
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
                {formatPeso(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Footer ── */}
        <div className="border-t border-[#E5E7EB] pt-[12px]">
          <div className="flex items-center gap-[6px] mb-[6px]">
            <CheckCircle2 className="w-[10px] h-[10px] text-[#56C490]" />
            <p className="font-['Nunito',sans-serif] text-[7px] text-[#6B7280]">
              Payment verified and confirmed
            </p>
          </div>
          <p className="font-['Nunito',sans-serif] text-[7px] text-[#9CA3AF] leading-[1.5]">
            Thank you for using ServEase! This is a system-generated receipt and does not
            require a signature. For concerns, contact support@servease.ph
          </p>
          <div className="flex items-center justify-between mt-[8px]">
            <p className="font-['Nunito',sans-serif] text-[6px] text-[#D1D5DB]">
              ServEase Technologies Inc. — Makati City, Philippines
            </p>
            <p className="font-['Nunito',sans-serif] text-[6px] text-[#D1D5DB]">
              Page 1 of 1
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export: PDF Preview Flow ─────────────────────────────
type FlowState = "generating" | "preview" | "sharing";

export default function ReceiptPdfPreview({
  service,
  onClose,
}: {
  service: ServiceHistory;
  onClose: () => void;
}) {
  const [state, setState] = useState<FlowState>("generating");
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate PDF generation progress
  useEffect(() => {
    if (state !== "generating") return;

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 100;
        }
        // Accelerate towards end
        const increment = prev < 60 ? 4 : prev < 85 ? 3 : 6;
        return Math.min(prev + increment, 100);
      });
    }, 60);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]);

  // Transition to preview when progress hits 100
  useEffect(() => {
    if (progress >= 100 && state === "generating") {
      const timeout = setTimeout(() => setState("preview"), 400);
      return () => clearTimeout(timeout);
    }
  }, [progress, state]);

  // ── Generating Overlay ──
  if (state === "generating") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#56C490]">
        <div className="flex flex-col items-center gap-[24px] animate-[fadeIn_0.3s_ease-out]">
          <CircularProgress progress={progress} />
          <div className="text-center">
            <p className="font-['Nunito',sans-serif] text-[18px] text-white mb-[4px]">
              Generating PDF...
            </p>
            <p className="font-['Nunito',sans-serif] text-[13px] text-white/70">
              Preparing your receipt
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── PDF Preview ──
  return (
    <>
      <div className="fixed inset-0 z-[100] bg-[#1A1A2E] flex flex-col animate-[fadeIn_0.3s_ease-out]">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-[20px] pt-[54px] pb-[16px] flex-shrink-0">
          <button
            onClick={onClose}
            className="w-[36px] h-[36px] rounded-full bg-white/10 flex items-center justify-center transition-all active:scale-90"
          >
            <X className="w-[18px] h-[18px] text-white" />
          </button>

          <p className="font-['Nunito',sans-serif] text-[15px] text-white">
            Receipt Preview
          </p>

          <button
            onClick={() => setState("sharing")}
            className="w-[36px] h-[36px] rounded-full bg-white/10 flex items-center justify-center transition-all active:scale-90"
          >
            <Share2 className="w-[18px] h-[18px] text-white" />
          </button>
        </div>

        {/* PDF Document — Scrollable */}
        <div
          className="flex-1 overflow-y-auto px-[24px] py-[20px] flex justify-center"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <PdfDocument service={service} />
        </div>

        {/* Bottom Action Bar */}
        <div className="px-[24px] pt-[14px] pb-[40px] bg-gradient-to-t from-[#1A1A2E] to-[#1A1A2E]/90 flex-shrink-0">
          <div className="flex gap-[12px]">
            {/* Save to Files */}
            <button
              onClick={() => setState("sharing")}
              className="flex-1 h-[50px] bg-white rounded-[14px] flex items-center justify-center gap-[8px] transition-all active:scale-[0.97]"
            >
              <Download className="w-[18px] h-[18px] text-[#111827]" />
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                Save
              </span>
            </button>

            {/* Share */}
            <button
              onClick={() => setState("sharing")}
              className="flex-1 h-[50px] bg-[#56C490] rounded-[14px] flex items-center justify-center gap-[8px] transition-all active:scale-[0.97] shadow-[0_4px_16px_rgba(86,196,144,0.35)]"
            >
              <Share2 className="w-[18px] h-[18px] text-white" />
              <span className="font-['Nunito',sans-serif] text-[14px] text-white">
                Share
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Share Sheet Overlay */}
      {state === "sharing" && (
        <ShareSheet onClose={() => setState("preview")} />
      )}
    </>
  );
}
