import { ChevronRight } from "lucide-react";

interface BookingCardProps {
  bookingId: string;
  providerName: string;
  providerPhoto: string;
  rating: number;
  reviewCount: number;
  serviceType: string;
  date: string;
  time: string;
  status: "pending" | "accepted" | "in-progress" | "completed" | "cancelled";
  onCardClick: () => void;
  actionLabel?: string;
}

export function BookingCard({
  bookingId,
  providerName,
  providerPhoto,
  rating,
  reviewCount,
  serviceType,
  date,
  time,
  status,
  onCardClick,
  actionLabel = "View Details",
}: BookingCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "bg-[#FEF3C7] text-[#92400E]";
      case "accepted":
        return "bg-[#DBEAFE] text-[#1E40AF]";
      case "in-progress":
        return "bg-[#D1FAE5] text-[#065F46]";
      case "completed":
        return "bg-[#E5E7EB] text-[#374151]";
      case "cancelled":
        return "bg-[#FEE2E2] text-[#991B1B]";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "pending":
        return "Pending";
      case "accepted":
        return "Accepted";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
    }
  };

  return (
    <div
      onClick={onCardClick}
      className="bg-white rounded-[16px] p-[16px] cursor-pointer active:scale-[0.98] transition-transform"
      style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}
    >
      {/* Booking ID */}
      <div className="font-['Inter',sans-serif] text-[12px] text-[#9CA3AF] mb-[12px]">
        {bookingId}
      </div>

      {/* Provider Info */}
      <div className="flex items-center gap-[12px] mb-[12px]">
        <img
          src={providerPhoto}
          alt={providerName}
          className="w-[48px] h-[48px] rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
            {providerName}
          </div>
          <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
            ★ {rating.toFixed(1)} ({reviewCount})
          </div>
        </div>
        <div
          className={`px-[12px] py-[4px] rounded-full font-['Nunito',sans-serif] text-[12px] ${getStatusColor()}`}
        >
          {getStatusLabel()}
        </div>
      </div>

      {/* Service Details */}
      <div className="mb-[12px]">
        <div className="font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[4px]">
          {serviceType}
        </div>
        <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
          {date} • {time}
        </div>
      </div>

      {/* Action */}
      <div className="flex items-center justify-between pt-[12px] border-t border-[#F2F2F2]">
        <span className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
          {actionLabel}
        </span>
        <ChevronRight className="w-[16px] h-[16px] text-[#56C490]" />
      </div>
    </div>
  );
}
