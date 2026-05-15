import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { BottomNavigation } from "../components/BottomNavigation";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  Star,
  RotateCcw,
  X,
  ChevronRight,
  Home as HomeIcon,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────
type BookingStatus =
  | "confirmed"
  | "on-the-way"
  | "arrived"
  | "in-progress"
  | "completed";

interface Booking {
  id: string;
  referenceId: string;
  serviceName: string;
  providerName: string;
  providerPhoto: string;
  providerRating: number;
  date: string;
  time: string;
  address: string;
  amount: number;
  status: BookingStatus;
  eta?: string;
  isVerified?: boolean;
}

// ─── Mock Data ─────────────────────────────────────────────────
const inProgressBookings: Booking[] = [
  {
    id: "1",
    referenceId: "BK-2026-03-012",
    serviceName: "House Cleaning",
    providerName: "Maria Santos",
    providerPhoto: "https://i.pravatar.cc/150?img=5",
    providerRating: 4.8,
    date: "March 14, 2026",
    time: "10:00 AM",
    address: "123 Rizal St, Makati City",
    amount: 1500,
    status: "on-the-way",
    eta: "12 mins",
    isVerified: true,
  },
  {
    id: "2",
    referenceId: "BK-2026-03-011",
    serviceName: "Plumbing Repair",
    providerName: "Juan Dela Cruz",
    providerPhoto: "https://i.pravatar.cc/150?img=12",
    providerRating: 4.9,
    date: "March 17, 2026",
    time: "2:00 PM",
    address: "45 Mabini Ave, Pasig City",
    amount: 2200,
    status: "confirmed",
    isVerified: true,
  },
  {
    id: "3",
    referenceId: "BK-2026-03-010",
    serviceName: "Aircon Cleaning",
    providerName: "Anna Reyes",
    providerPhoto: "https://i.pravatar.cc/150?img=25",
    providerRating: 5.0,
    date: "March 18, 2026",
    time: "9:00 AM",
    address: "78 Aurora Blvd, Quezon City",
    amount: 800,
    status: "confirmed",
    isVerified: true,
  },
];

const completedBookings: Booking[] = [
  {
    id: "4",
    referenceId: "BK-2026-03-005",
    serviceName: "Painting Service",
    providerName: "Carlos Fernandez",
    providerPhoto: "https://i.pravatar.cc/150?img=13",
    providerRating: 4.7,
    date: "March 10, 2026",
    time: "11:00 AM",
    address: "123 Rizal St, Makati City",
    amount: 3500,
    status: "completed",
  },
  {
    id: "5",
    referenceId: "BK-2026-03-006",
    serviceName: "Plumbing Repair",
    providerName: "Lisa Martinez",
    providerPhoto: "https://i.pravatar.cc/150?img=10",
    providerRating: 4.9,
    date: "March 8, 2026",
    time: "8:00 AM",
    address: "45 Mabini Ave, Pasig City",
    amount: 1800,
    status: "completed",
  },
  {
    id: "6",
    referenceId: "BK-2026-03-004",
    serviceName: "Deep House Cleaning",
    providerName: "Maria Santos",
    providerPhoto: "https://i.pravatar.cc/150?img=5",
    providerRating: 4.8,
    date: "March 5, 2026",
    time: "9:30 AM",
    address: "22 Bonifacio St, Taguig City",
    amount: 2200,
    status: "completed",
  },
];

// ─── Helpers ───────────────────────────────────────────────────
const formatPeso = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const getStatusLabel = (status: BookingStatus) => {
  switch (status) {
    case "confirmed":
      return "Confirmed";
    case "on-the-way":
      return "On the Way";
    case "arrived":
      return "Provider Arrived";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
  }
};

const getStatusChipStyle = (status: BookingStatus) => {
  switch (status) {
    case "confirmed":
      return { bg: "bg-[#EEF9F3]", text: "text-[#2C6E49]" };
    case "on-the-way":
      return { bg: "bg-[#FFF0EE]", text: "text-[#C44830]" };
    case "arrived":
      return { bg: "bg-[#EFF4FE]", text: "text-[#2D52B8]" };
    case "in-progress":
      return { bg: "bg-[#FEF5E8]", text: "text-[#8A5200]" };
    case "completed":
      return { bg: "bg-[#EEF9F3]", text: "text-[#2C6E49]" };
  }
};

const isActiveTracking = (status: BookingStatus) =>
  status === "on-the-way" || status === "arrived";

/** Parse "March 17, 2026" → Date */
function parseBookingDate(dateStr: string, timeStr: string): Date {
  const d = new Date(`${dateStr} ${timeStr}`);
  return isNaN(d.getTime()) ? new Date(dateStr) : d;
}

/** Get countdown parts between now and target */
function getCountdown(target: Date) {
  const now = new Date("March 14, 2026 09:41:00"); // Simulated "now"
  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, mins, total: diff };
}

// ─── Cancellation Reason Modal ─────────────────────────────────
const CANCEL_REASONS = [
  "Don't need the service anymore",
  "Not available at this time",
  "Found a better rate elsewhere",
  "Placed the request by mistake",
  "Provider asked me to cancel",
  "Other",
];

function CancellationModal({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit =
    selectedReason !== null &&
    (selectedReason !== "Other" || otherText.trim().length > 0);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(onClose, 1800);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal Sheet */}
      <div className="relative w-full max-w-[393px] bg-white rounded-t-[28px] z-10 animate-[slideUp_0.3s_ease-out]">
        {/* Drag Handle */}
        <div className="flex justify-center pt-[12px] pb-[6px]">
          <div className="w-[36px] h-[4px] rounded-full bg-[#D1D5DB]" />
        </div>

        {submitted ? (
          /* ── Success State ── */
          <div className="px-[24px] pt-[24px] pb-[40px] text-center">
            <div className="w-[64px] h-[64px] rounded-full bg-[#EEF9F3] flex items-center justify-center mx-auto mb-[16px]">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#56C490"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-['Nunito',sans-serif] text-[18px] text-[#111827] mb-[6px]">
              Booking Cancelled
            </h3>
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
              Your booking for {booking.serviceName} has been cancelled. A
              refund will be processed within 3–5 business days.
            </p>
          </div>
        ) : (
          /* ── Reason Selection ── */
          <div className="px-[24px] pt-[10px] pb-[36px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-[4px]">
              <h3 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
                Cancel Booking
              </h3>
              <button
                onClick={onClose}
                className="w-[32px] h-[32px] rounded-full bg-[#F3F4F6] flex items-center justify-center active:scale-90 transition-all"
              >
                <X className="w-[16px] h-[16px] text-[#6B7280]" />
              </button>
            </div>
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[20px]">
              Please tell us why you'd like to cancel.
            </p>

            {/* Reason List */}
            <div className="space-y-[8px] mb-[16px] max-h-[260px] overflow-y-auto">
              {CANCEL_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full flex items-center gap-[12px] px-[16px] py-[14px] rounded-[16px] border-[1.5px] text-left transition-all active:scale-[0.98] ${
                    selectedReason === reason
                      ? "border-[#56C490] bg-[#EEF9F3]"
                      : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  {/* Radio Dot */}
                  <div
                    className={`w-[20px] h-[20px] rounded-full border-[2px] flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedReason === reason
                        ? "border-[#56C490]"
                        : "border-[#D1D5DB]"
                    }`}
                  >
                    {selectedReason === reason && (
                      <div className="w-[10px] h-[10px] rounded-full bg-[#56C490]" />
                    )}
                  </div>
                  <span className="font-['Nunito',sans-serif] text-[13px] text-[#111827]">
                    {reason}
                  </span>
                </button>
              ))}
            </div>

            {/* Other reason text area */}
            {selectedReason === "Other" && (
              <textarea
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="Tell us more..."
                rows={3}
                className="w-full border-[1.5px] border-[#E5E7EB] rounded-[16px] p-[14px] mb-[16px] font-['Nunito',sans-serif] text-[13px] text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#56C490] resize-none transition-colors"
              />
            )}

            {/* Warning */}
            <div className="flex items-start gap-[10px] bg-[#FEF2F2] rounded-[16px] px-[14px] py-[12px] mb-[20px]">
              <AlertCircle className="w-[16px] h-[16px] text-[#DC2626] flex-shrink-0 mt-[1px]" />
              <p className="font-['Nunito',sans-serif] text-[11px] text-[#991B1B] leading-[1.5]">
                Cancellations within 24 hours of the schedule may incur a
                cancellation fee.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-[10px]">
              <button
                onClick={onClose}
                className="flex-1 h-[48px] rounded-[50px] border-[1.5px] border-[#D1D5DB] bg-white flex items-center justify-center transition-all active:scale-[0.97]"
              >
                <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
                  Keep Booking
                </span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`flex-1 h-[48px] rounded-[50px] flex items-center justify-center transition-all active:scale-[0.97] ${
                  canSubmit
                    ? "bg-[#DC2626] shadow-[0_4px_14px_rgba(220,38,38,0.3)]"
                    : "bg-[#D1D5DB]"
                }`}
              >
                <span className="font-['Nunito',sans-serif] text-[14px] text-white">
                  Cancel Booking
                </span>
              </button>
            </div>
          </div>
        )}
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

// ─── Simulated Map Background ──────────────────────────────────
function MapView() {
  return (
    <div className="absolute inset-0 bg-[#E8F4E8]">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#D1E7D1"
              strokeWidth="1"
            />
          </pattern>
          <pattern
            id="roads"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <rect x="55" y="0" width="10" height="120" fill="#FFFFFF" />
            <rect x="0" y="55" width="120" height="10" fill="#FFFFFF" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#EDF5ED" />
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#roads)" opacity="0.6" />
        <rect x="0" y="280" width="100%" height="14" fill="#FFFFFF" rx="2" />
        <rect x="170" y="0" width="14" height="100%" fill="#FFFFFF" rx="2" />
        <rect
          x="220"
          y="120"
          width="90"
          height="70"
          rx="12"
          fill="#C8E6C8"
          opacity="0.7"
        />
        <rect
          x="40"
          y="380"
          width="80"
          height="60"
          rx="10"
          fill="#C8E6C8"
          opacity="0.5"
        />
        <rect
          x="30"
          y="30"
          width="55"
          height="40"
          rx="4"
          fill="#D6DDD6"
          opacity="0.5"
        />
        <rect
          x="30"
          y="80"
          width="40"
          height="50"
          rx="4"
          fill="#D6DDD6"
          opacity="0.4"
        />
        <rect
          x="100"
          y="30"
          width="50"
          height="45"
          rx="4"
          fill="#D6DDD6"
          opacity="0.45"
        />
        <rect
          x="200"
          y="30"
          width="60"
          height="55"
          rx="4"
          fill="#D6DDD6"
          opacity="0.5"
        />
        <rect
          x="300"
          y="30"
          width="55"
          height="40"
          rx="4"
          fill="#D6DDD6"
          opacity="0.4"
        />
        <rect
          x="300"
          y="200"
          width="50"
          height="55"
          rx="4"
          fill="#D6DDD6"
          opacity="0.45"
        />
        <rect
          x="30"
          y="310"
          width="60"
          height="45"
          rx="4"
          fill="#D6DDD6"
          opacity="0.5"
        />
        <rect
          x="200"
          y="310"
          width="45"
          height="50"
          rx="4"
          fill="#D6DDD6"
          opacity="0.4"
        />
        <rect
          x="280"
          y="320"
          width="55"
          height="40"
          rx="4"
          fill="#D6DDD6"
          opacity="0.45"
        />
        <text
          x="55"
          y="276"
          fill="#9CA3AF"
          fontSize="7"
          fontFamily="Inter, sans-serif"
          opacity="0.7"
        >
          Rizal Street
        </text>
        <text
          x="186"
          y="150"
          fill="#9CA3AF"
          fontSize="7"
          fontFamily="Inter, sans-serif"
          transform="rotate(90, 186, 150)"
          opacity="0.7"
        >
          Mabini Ave
        </text>
      </svg>
    </div>
  );
}

// ─── Dotted Route Path ─────────────────────────────────────────
function RoutePath({
  providerPos,
}: {
  providerPos: { x: number; y: number };
}) {
  const customerX = 300;
  const customerY = 520;
  const midX = (providerPos.x + customerX) / 2;
  const midY = (providerPos.y + customerY) / 2 - 40;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
      <path
        d={`M ${providerPos.x} ${providerPos.y} Q ${midX} ${midY} ${customerX} ${customerY}`}
        fill="none"
        stroke="#56C490"
        strokeWidth="3"
        strokeDasharray="8 6"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

// ─── Scheduled Booking View (Calendar Card) ────────────────────
function ScheduledBookingView({
  booking,
  onClose,
  onCancel,
}: {
  booking: Booking;
  onClose: () => void;
  onCancel: () => void;
}) {
  const navigate = useNavigate();
  const countdown = getCountdown(parseBookingDate(booking.date, booking.time));

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Status Bar */}
      <div className="bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Top Bar */}
      <div className="flex items-center justify-between px-[20px] py-[12px] flex-shrink-0 bg-white z-20">
        <button
          onClick={onClose}
          className="w-[38px] h-[38px] rounded-full bg-[#F3F4F6] flex items-center justify-center transition-all active:scale-90"
        >
          <X className="w-[18px] h-[18px] text-[#374151]" />
        </button>
        <div className="text-center">
          <p className="font-['Nunito',sans-serif] text-[15px] text-[#111827]">
            Booking Details
          </p>
          <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF]">
            {booking.referenceId}
          </p>
        </div>
        <div className="w-[38px]" />
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* ── Hero: Upcoming Service ── */}
        <div className="bg-gradient-to-b from-[#EEF9F3] to-white px-[24px] pt-[28px] pb-[20px] text-center">
          <div className="inline-flex items-center gap-[6px] bg-[#EEF9F3] px-[14px] py-[6px] rounded-[50px] mb-[20px]">
            <div className="w-[6px] h-[6px] rounded-full bg-[#56C490] animate-pulse" />
            <span className="font-['Nunito',sans-serif] text-[12px] text-[#047857]">
              Upcoming Service
            </span>
          </div>

          <h2 className="font-['Nunito',sans-serif] text-[22px] text-[#111827] tracking-[-0.3px] mb-[6px]">
            {booking.serviceName}
          </h2>
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">
            {booking.address}
          </p>
        </div>

        {/* ── Large Calendar & Clock Card ── */}
        <div className="px-[24px] pb-[16px]">
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#F3F4F6] overflow-hidden">
            {/* Date & Time display */}
            <div className="flex items-stretch">
              {/* Calendar side */}
              <div className="flex-1 p-[20px] flex flex-col items-center justify-center border-r border-[#F3F4F6]">
                <Calendar className="w-[28px] h-[28px] text-[#56C490] mb-[8px]" />
                <p className="font-['Nunito',sans-serif] text-[15px] text-[#111827]">
                  {booking.date.split(",")[0]}
                </p>
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF] mt-[2px]">
                  {booking.date.split(",").slice(1).join(",").trim()}
                </p>
              </div>
              {/* Clock side */}
              <div className="flex-1 p-[20px] flex flex-col items-center justify-center">
                <Clock className="w-[28px] h-[28px] text-[#56C490] mb-[8px]" />
                <p className="font-['Nunito',sans-serif] text-[15px] text-[#111827]">
                  {booking.time}
                </p>
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF] mt-[2px]">
                  Scheduled
                </p>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="bg-[#FAF8F5] px-[20px] py-[16px]">
              <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF] text-center mb-[10px]">
                SERVICE STARTS IN
              </p>
              <div className="flex items-center justify-center gap-[12px]">
                {/* Days */}
                <div className="flex flex-col items-center">
                  <div className="w-[52px] h-[52px] rounded-[18px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center justify-center">
                    <span className="font-['Nunito',sans-serif] text-[22px] text-[#56C490]">
                      {countdown.days}
                    </span>
                  </div>
                  <span className="font-['Nunito',sans-serif] text-[9px] text-[#9CA3AF] mt-[5px]">
                    DAYS
                  </span>
                </div>
                <span className="font-['Nunito',sans-serif] text-[20px] text-[#D1D5DB] mt-[-14px]">
                  :
                </span>
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <div className="w-[52px] h-[52px] rounded-[18px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center justify-center">
                    <span className="font-['Nunito',sans-serif] text-[22px] text-[#56C490]">
                      {countdown.hours}
                    </span>
                  </div>
                  <span className="font-['Nunito',sans-serif] text-[9px] text-[#9CA3AF] mt-[5px]">
                    HRS
                  </span>
                </div>
                <span className="font-['Nunito',sans-serif] text-[20px] text-[#D1D5DB] mt-[-14px]">
                  :
                </span>
                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <div className="w-[52px] h-[52px] rounded-[18px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center justify-center">
                    <span className="font-['Nunito',sans-serif] text-[22px] text-[#56C490]">
                      {countdown.mins}
                    </span>
                  </div>
                  <span className="font-['Nunito',sans-serif] text-[9px] text-[#9CA3AF] mt-[5px]">
                    MINS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Provider Assigned Card ── */}
        <div className="px-[24px] pb-[16px]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[10px]">
            PROVIDER ASSIGNED
          </p>
          <div className="bg-white rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.05)] p-[16px]">
            <div className="flex items-center gap-[14px]">
              <div className="relative">
                <img
                  src={booking.providerPhoto}
                  alt={booking.providerName}
                  className="w-[52px] h-[52px] rounded-full object-cover border-[2px] border-[#56C490]"
                />
                {booking.isVerified && (
                  <div className="absolute -bottom-[2px] -right-[2px] w-[20px] h-[20px] rounded-full bg-[#56C490] flex items-center justify-center border-[2px] border-white">
                    <ShieldCheck className="w-[10px] h-[10px] text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[6px]">
                  <p className="font-['Nunito',sans-serif] text-[15px] text-[#111827]">
                    {booking.providerName}
                  </p>
                  {booking.isVerified && (
                    <div className="flex items-center gap-[3px] bg-[#EEF9F3] px-[7px] py-[2px] rounded-[6px]">
                      <ShieldCheck className="w-[10px] h-[10px] text-[#047857]" />
                      <span className="font-['Nunito',sans-serif] text-[9px] text-[#047857]">
                        Verified
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-[4px] mt-[3px]">
                  <Star className="w-[12px] h-[12px] text-[#F59E0B] fill-[#F59E0B]" />
                  <span className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
                    {booking.providerRating} · {booking.serviceName}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="flex gap-[10px] mt-[14px]">
              <button
                onClick={() => {}}
                className="flex-1 h-[42px] rounded-[16px] border-[1.5px] border-[#E5E7EB] bg-white flex items-center justify-center gap-[6px] transition-all active:scale-[0.97]"
              >
                <Phone className="w-[16px] h-[16px] text-[#374151]" />
                <span className="font-['Nunito',sans-serif] text-[13px] text-[#374151]">
                  Call
                </span>
              </button>
              <button
                onClick={() => navigate("/customer/messages")}
                className="flex-1 h-[42px] rounded-[16px] border-[1.5px] border-[#E5E7EB] bg-white flex items-center justify-center gap-[6px] transition-all active:scale-[0.97]"
              >
                <MessageCircle className="w-[16px] h-[16px] text-[#374151]" />
                <span className="font-['Nunito',sans-serif] text-[13px] text-[#374151]">
                  Message
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Booking Details Card ── */}
        <div className="px-[24px] pb-[16px]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[10px]">
            BOOKING DETAILS
          </p>
          <div className="bg-white rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.05)] p-[16px] space-y-[12px]">
            <div className="flex items-start gap-[12px]">
              <MapPin className="w-[16px] h-[16px] text-[#9CA3AF] mt-[2px] flex-shrink-0" />
              <div>
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF]">
                  Service Address
                </p>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#111827] mt-[2px]">
                  {booking.address}
                </p>
              </div>
            </div>
            <div className="h-[1px] bg-[#F3F4F6]" />
            <div className="flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280]">
                Total Amount
              </p>
              <p className="font-['Nunito',sans-serif] text-[16px] text-[#56C490]">
                {formatPeso(booking.amount)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Cancel Booking Button (revealed on scroll) ── */}
        <div className="px-[24px] pt-[8px] pb-[36px]">
          <button
            onClick={onCancel}
            className="w-full h-[48px] rounded-[50px] border-[1.5px] border-[#FCA5A5] bg-[#FEF2F2] flex items-center justify-center gap-[8px] transition-all active:scale-[0.97]"
          >
            <X className="w-[16px] h-[16px] text-[#DC2626]" />
            <span className="font-['Nunito',sans-serif] text-[14px] text-[#DC2626]">
              Cancel Booking
            </span>
          </button>
          <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF] text-center mt-[8px]">
            Free cancellation up to 24 hours before the service
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Live Tracking View (Active: On the Way / Arrived) ─────────
function LiveTrackingView({
  booking,
  onClose,
  onCancel,
}: {
  booking: Booking;
  onClose: () => void;
  onCancel: () => void;
}) {
  const navigate = useNavigate();
  const [providerPos, setProviderPos] = useState({ x: 80, y: 180 });
  const scrollRef = useRef<HTMLDivElement>(null);

  const getStepIndex = useCallback((status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return 0;
      case "on-the-way":
        return 1;
      case "arrived":
        return 2;
      case "in-progress":
        return 3;
      default:
        return 0;
    }
  }, []);

  const currentStep = getStepIndex(booking.status);
  const steps = ["Booked", "On the Way", "Arrived", "In Progress"];

  // Simulate provider movement
  useEffect(() => {
    if (booking.status !== "on-the-way") return;
    const interval = setInterval(() => {
      setProviderPos((prev) => {
        const targetX = 300;
        const targetY = 520;
        const dx = (targetX - prev.x) * 0.015;
        const dy = (targetY - prev.y) * 0.015;
        return {
          x: prev.x + dx + (Math.random() - 0.5) * 1.5,
          y: prev.y + dy + (Math.random() - 0.5) * 1.5,
        };
      });
    }, 800);
    return () => clearInterval(interval);
  }, [booking.status]);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Status Bar */}
      <div className="bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Top Bar + Contact Actions (sticky) */}
      <div className="flex-shrink-0 bg-white z-20 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-[20px] py-[12px]">
          <button
            onClick={onClose}
            className="w-[38px] h-[38px] rounded-full bg-[#F3F4F6] flex items-center justify-center transition-all active:scale-90"
          >
            <X className="w-[18px] h-[18px] text-[#374151]" />
          </button>
          <div className="text-center">
            <p className="font-['Nunito',sans-serif] text-[15px] text-[#111827]">
              Live Tracking
            </p>
            <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF]">
              {booking.referenceId}
            </p>
          </div>
          {/* Quick contact icons */}
          <div className="flex items-center gap-[8px]">
            <button
              onClick={() => {}}
              className="w-[38px] h-[38px] rounded-full bg-[#56C490] flex items-center justify-center transition-all active:scale-90 shadow-[0_2px_8px_rgba(86,196,144,0.3)]"
            >
              <Phone className="w-[16px] h-[16px] text-white" />
            </button>
            <button
              onClick={() => navigate("/customer/messages")}
              className="w-[38px] h-[38px] rounded-full bg-[#F3F4F6] flex items-center justify-center transition-all active:scale-90"
            >
              <MessageCircle className="w-[16px] h-[16px] text-[#374151]" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden">
        <MapView />
        <RoutePath providerPos={providerPos} />

        {/* Customer Location - Green House */}
        <div
          className="absolute z-20"
          style={{ left: "280px", top: "500px" }}
        >
          <div className="flex flex-col items-center">
            <div className="w-[44px] h-[44px] rounded-full bg-[#56C490] flex items-center justify-center shadow-[0_4px_16px_rgba(86,196,144,0.4)]">
              <HomeIcon className="w-[22px] h-[22px] text-white" />
            </div>
            <div className="mt-[4px] px-[8px] py-[3px] bg-white rounded-[6px] shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
              <p className="font-['Nunito',sans-serif] text-[9px] text-[#111827]">
                Your Location
              </p>
            </div>
            <div
              className="absolute w-[44px] h-[44px] rounded-full bg-[#56C490]/20 animate-ping"
              style={{ animationDuration: "2s" }}
            />
          </div>
        </div>

        {/* Provider - Moving Motorcycle */}
        <div
          className="absolute z-20 transition-all duration-700 ease-out"
          style={{
            left: `${providerPos.x - 22}px`,
            top: `${providerPos.y - 22}px`,
          }}
        >
          <div className="flex flex-col items-center">
            <div className="w-[44px] h-[44px] rounded-full bg-[#374151] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="5" cy="17" r="3" />
                <circle cx="19" cy="17" r="3" />
                <path d="M12 17H5" />
                <path d="M19 17h-2l-2-5h-4l-1.5 5" />
                <path d="M14 7h3l2 5" />
                <path d="M9 12l1-5h4" />
              </svg>
            </div>
            <div className="mt-[4px] px-[8px] py-[3px] bg-[#374151] rounded-[6px] shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
              <p className="font-['Nunito',sans-serif] text-[9px] text-white">
                {booking.providerName.split(" ")[0]}
              </p>
            </div>
          </div>
        </div>

        {/* ETA Badge */}
        {booking.eta && (
          <div className="absolute top-[16px] left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-[6px] bg-white px-[16px] py-[10px] rounded-[50px] shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
              <Navigation className="w-[14px] h-[14px] text-[#56C490]" />
              <span className="font-['Nunito',sans-serif] text-[13px] text-[#111827]">
                Estimated arrival: {booking.eta}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Card (Scrollable) */}
      <div
        ref={scrollRef}
        className="bg-white rounded-t-[28px] shadow-[0_-8px_30px_rgba(0,0,0,0.1)] z-30 max-h-[52%] overflow-y-auto"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="px-[24px] pt-[12px] pb-[36px]">
          {/* Drag Handle */}
          <div className="flex justify-center mb-[16px] sticky top-0 bg-white pt-[4px]">
            <div className="w-[36px] h-[4px] rounded-full bg-[#D1D5DB]" />
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-[20px] px-[4px]">
            {steps.map((step, idx) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-[28px] h-[28px] rounded-full flex items-center justify-center transition-all ${
                      idx <= currentStep
                        ? "bg-[#56C490] shadow-[0_2px_8px_rgba(86,196,144,0.3)]"
                        : "bg-[#E5E7EB]"
                    }`}
                  >
                    {idx < currentStep ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : idx === currentStep ? (
                      <div className="w-[10px] h-[10px] rounded-full bg-white" />
                    ) : (
                      <div className="w-[8px] h-[8px] rounded-full bg-[#9CA3AF]" />
                    )}
                  </div>
                  <p
                    className={`font-['Nunito',sans-serif] text-[9px] mt-[6px] text-center whitespace-nowrap ${
                      idx <= currentStep ? "text-[#56C490]" : "text-[#9CA3AF]"
                    }`}
                  >
                    {step}
                  </p>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 -mt-[18px] mx-[-4px] rounded-full ${
                      idx < currentStep ? "bg-[#56C490]" : "bg-[#E5E7EB]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Provider Info */}
          <div className="flex items-center gap-[12px] bg-[#FAF8F5] rounded-[18px] p-[14px] mb-[16px]">
            <img
              src={booking.providerPhoto}
              alt={booking.providerName}
              className="w-[46px] h-[46px] rounded-full object-cover border-[2px] border-[#56C490]"
            />
            <div className="flex-1 min-w-0">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                {booking.providerName}
              </p>
              <div className="flex items-center gap-[4px] mt-[2px]">
                <Star className="w-[12px] h-[12px] text-[#F59E0B] fill-[#F59E0B]" />
                <span className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
                  {booking.providerRating} · {booking.serviceName}
                </span>
              </div>
            </div>
            {booking.eta && (
              <div className="bg-[#56C490]/10 px-[10px] py-[6px] rounded-[14px]">
                <p className="font-['Nunito',sans-serif] text-[12px] text-[#56C490] leading-[1]">
                  {booking.eta}
                </p>
                <p className="font-['Nunito',sans-serif] text-[8px] text-[#56C490]/70 text-center mt-[1px]">
                  ETA
                </p>
              </div>
            )}
          </div>

          {/* Booking info */}
          <div className="bg-[#FAF8F5] rounded-[18px] p-[14px] mb-[16px] space-y-[10px]">
            <div className="flex items-center gap-[10px]">
              <MapPin className="w-[14px] h-[14px] text-[#9CA3AF] flex-shrink-0" />
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
                {booking.address}
              </p>
            </div>
            <div className="flex items-center gap-[10px]">
              <Calendar className="w-[14px] h-[14px] text-[#9CA3AF] flex-shrink-0" />
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
                {booking.date} · {booking.time}
              </p>
            </div>
            <div className="h-[1px] bg-[#E5E7EB]" />
            <div className="flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
                Total
              </p>
              <p className="font-['Nunito',sans-serif] text-[15px] text-[#56C490]">
                {formatPeso(booking.amount)}
              </p>
            </div>
          </div>

          {/* Cancel Booking (revealed on scroll) */}
          <div className="pt-[8px]">
            <button
              onClick={onCancel}
              className="w-full h-[46px] rounded-[50px] border-[1.5px] border-[#FCA5A5] bg-[#FEF2F2] flex items-center justify-center gap-[8px] transition-all active:scale-[0.97]"
            >
              <X className="w-[15px] h-[15px] text-[#DC2626]" />
              <span className="font-['Nunito',sans-serif] text-[13px] text-[#DC2626]">
                Cancel Booking
              </span>
            </button>
            <p className="font-['Nunito',sans-serif] text-[10px] text-[#9CA3AF] text-center mt-[6px]">
              Free cancellation up to 24 hours before the service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Booking Card ──────────────────────────────────────────────
function BookingCard({
  booking,
  isCompleted,
  onTrack,
}: {
  booking: Booking;
  isCompleted: boolean;
  onTrack: (b: Booking) => void;
}) {
  const navigate = useNavigate();
  const chipStyle = getStatusChipStyle(booking.status);

  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden transition-all active:scale-[0.99]">
      <div className="p-[16px]">
        {/* Row 1: Service Name + Status Chip */}
        <div className="flex items-start justify-between gap-[10px] mb-[14px]">
          <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] leading-[1.25] flex-1">
            {booking.serviceName}
          </h3>
          <div
            className={`px-[10px] py-[4px] rounded-[8px] flex-shrink-0 ${chipStyle.bg}`}
          >
            <span
              className={`font-['Nunito',sans-serif] text-[11px] ${chipStyle.text} whitespace-nowrap`}
            >
              {getStatusLabel(booking.status)}
            </span>
          </div>
        </div>

        {/* Row 2: Provider Info */}
        <div className="flex items-center gap-[10px] mb-[12px]">
          <img
            src={booking.providerPhoto}
            alt={booking.providerName}
            className="w-[36px] h-[36px] rounded-full object-cover border-[1.5px] border-[#E5E7EB]"
          />
          <div className="flex-1 min-w-0">
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#111827]">
              {booking.providerName}
            </p>
            <div className="flex items-center gap-[3px]">
              <Star className="w-[11px] h-[11px] text-[#F59E0B] fill-[#F59E0B]" />
              <span className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF]">
                {booking.providerRating}
              </span>
            </div>
          </div>
          <p className="font-['Nunito',sans-serif] text-[17px] text-[#56C490]">
            {formatPeso(booking.amount)}
          </p>
        </div>

        {/* Row 3: Date & Time */}
        <div className="flex items-center gap-[16px] bg-[#FAF8F5] rounded-[14px] px-[12px] py-[10px]">
          <div className="flex items-center gap-[6px]">
            <Calendar className="w-[13px] h-[13px] text-[#9CA3AF]" />
            <span className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
              {booking.date}
            </span>
          </div>
          <div className="w-[1px] h-[14px] bg-[#E5E7EB]" />
          <div className="flex items-center gap-[6px]">
            <Clock className="w-[13px] h-[13px] text-[#9CA3AF]" />
            <span className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
              {booking.time}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="px-[16px] pb-[14px] pt-[4px]">
        {!isCompleted ? (
          <button
            onClick={() => onTrack(booking)}
            className="w-full h-[44px] bg-[#56C490] rounded-[50px] flex items-center justify-center gap-[8px] transition-all active:scale-[0.97] shadow-[0_4px_14px_rgba(86,196,144,0.25)]"
          >
            {isActiveTracking(booking.status) ? (
              <MapPin className="w-[16px] h-[16px] text-white" />
            ) : (
              <Calendar className="w-[16px] h-[16px] text-white" />
            )}
            <span className="font-['Nunito',sans-serif] text-[13px] text-white">
              {isActiveTracking(booking.status)
                ? "Track Order"
                : "View Details"}
            </span>
            <ChevronRight className="w-[14px] h-[14px] text-white/70" />
          </button>
        ) : (
          <div className="flex gap-[8px]">
            <button
              onClick={() => navigate("/customer/service-history")}
              className="flex-1 h-[40px] rounded-[50px] border-[1.5px] border-[#56C490] bg-white flex items-center justify-center gap-[6px] transition-all active:scale-[0.96]"
            >
              <Star className="w-[14px] h-[14px] text-[#56C490]" />
              <span className="font-['Nunito',sans-serif] text-[12px] text-[#56C490]">
                Review
              </span>
            </button>
            <button
              onClick={() => navigate("/customer/all-services")}
              className="flex-1 h-[40px] rounded-[50px] bg-[#56C490] flex items-center justify-center gap-[5px] transition-all active:scale-[0.96] shadow-[0_3px_10px_rgba(86,196,144,0.3)]"
            >
              <RotateCcw className="w-[13px] h-[13px] text-white" />
              <span className="font-['Nunito',sans-serif] text-[12px] text-white">
                Book Again
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Screen ───────────────────────────────────────────────
type Tab = "in-progress" | "completed";

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState<Tab>("in-progress");
  const [trackingBooking, setTrackingBooking] = useState<Booking | null>(null);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);

  const bookings =
    activeTab === "in-progress" ? inProgressBookings : completedBookings;

  // Determine which detail view to show based on booking status
  if (trackingBooking) {
    const showMap = isActiveTracking(trackingBooking.status);

    if (showMap) {
      return (
        <>
          <LiveTrackingView
            booking={trackingBooking}
            onClose={() => setTrackingBooking(null)}
            onCancel={() => setCancelBooking(trackingBooking)}
          />
          {cancelBooking && (
            <CancellationModal
              booking={cancelBooking}
              onClose={() => {
                setCancelBooking(null);
                setTrackingBooking(null);
              }}
            />
          )}
        </>
      );
    }

    return (
      <>
        <ScheduledBookingView
          booking={trackingBooking}
          onClose={() => setTrackingBooking(null)}
          onCancel={() => setCancelBooking(trackingBooking)}
        />
        {cancelBooking && (
          <CancellationModal
            booking={cancelBooking}
            onClose={() => {
              setCancelBooking(null);
              setTrackingBooking(null);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="bg-[#FAF8F5] w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* ── Header ── */}
      <div className="bg-white px-[24px] pt-[10px] pb-[18px] flex-shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <h1 className="font-['Nunito',sans-serif] text-[24px] text-[#111827] tracking-[-0.3px] mb-[16px]">
          My Bookings
        </h1>

        {/* ── Segmented Control ── */}
        <div className="relative bg-[#F3F4F6] rounded-[16px] p-[3px] flex">
          <div
            className="absolute top-[3px] bottom-[3px] bg-[#56C490] rounded-[14px] transition-all duration-300 ease-out shadow-[0_2px_8px_rgba(86,196,144,0.3)]"
            style={{
              left: activeTab === "in-progress" ? "3px" : "50%",
              width: "calc(50% - 3px)",
            }}
          />

          <button
            onClick={() => setActiveTab("in-progress")}
            className="flex-1 relative z-10 py-[10px] flex items-center justify-center gap-[6px] transition-colors duration-200"
          >
            <MapPin
              className={`w-[14px] h-[14px] transition-colors duration-200 ${
                activeTab === "in-progress" ? "text-white" : "text-[#6B7280]"
              }`}
            />
            <span
              className={`font-['Nunito',sans-serif] text-[13px] transition-colors duration-200 ${
                activeTab === "in-progress" ? "text-white" : "text-[#6B7280]"
              }`}
            >
              In Progress
            </span>
            {inProgressBookings.length > 0 && (
              <div
                className={`min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-[5px] transition-colors duration-200 ${
                  activeTab === "in-progress"
                    ? "bg-white/25"
                    : "bg-[#56C490]/10"
                }`}
              >
                <span
                  className={`font-['Nunito',sans-serif] text-[10px] transition-colors duration-200 ${
                    activeTab === "in-progress"
                      ? "text-white"
                      : "text-[#56C490]"
                  }`}
                >
                  {inProgressBookings.length}
                </span>
              </div>
            )}
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className="flex-1 relative z-10 py-[10px] flex items-center justify-center gap-[6px] transition-colors duration-200"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-colors duration-200 ${
                activeTab === "completed"
                  ? "stroke-white"
                  : "stroke-[#6B7280]"
              }`}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="9 12 11.5 14.5 16 9.5" />
            </svg>
            <span
              className={`font-['Nunito',sans-serif] text-[13px] transition-colors duration-200 ${
                activeTab === "completed" ? "text-white" : "text-[#6B7280]"
              }`}
            >
              Completed
            </span>
          </button>
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="px-[24px] pt-[16px] pb-[6px]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">
            {bookings.length}{" "}
            {bookings.length === 1 ? "booking" : "bookings"}
          </p>
        </div>

        {bookings.length > 0 ? (
          <div className="px-[24px] pb-[120px] space-y-[12px]">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isCompleted={activeTab === "completed"}
                onTrack={setTrackingBooking}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-[24px] pt-[80px]">
            <div className="w-[100px] h-[100px] rounded-full bg-[#56C490]/8 flex items-center justify-center mb-[20px]">
              <Calendar className="w-[44px] h-[44px] text-[#56C490]/30" />
            </div>
            <h3 className="font-['Nunito',sans-serif] text-[18px] text-[#111827] mb-[6px]">
              No bookings here
            </h3>
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] text-center leading-[1.5]">
              {activeTab === "in-progress"
                ? "You don't have any active bookings right now."
                : "Your completed bookings will show up here."}
            </p>
          </div>
        )}
      </div>

      {/* ── Bottom Navigation ── */}
      <BottomNavigation />
    </div>
  );
}
