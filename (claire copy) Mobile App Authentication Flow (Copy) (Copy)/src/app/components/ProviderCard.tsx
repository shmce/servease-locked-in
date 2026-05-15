import {
  MessageCircle,
  Phone,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { getProviderPriceDisplay } from "../utils/formatPeso";

interface ProviderCardProps {
  /** Provider unique ID */
  id?: string;
  name: string;
  photo?: string;
  rating: number;
  reviewCount: number;
  /** Verified badge */
  isVerified?: boolean;
  /** Green dot availability indicator */
  isAvailable?: boolean;
  /** e.g. "within 30 mins" */
  responseTime?: string;
  /** e.g. "Makati City" */
  location?: string;
  /** Number of completed jobs */
  completedJobs?: number;
  /** Short description or specialty */
  description?: string;
  /** Pricing info */
  hourlyRate?: number;
  flatRate?: number;
  priceRange?: { min: number; max: number };
  /** Layout variant */
  variant?: "compact" | "detailed";
  /** Show call/message action buttons */
  showActions?: boolean;
  /** Card click → navigate to provider profile */
  onViewProfile?: () => void;
  onMessage?: () => void;
  onCall?: () => void;
}

/** Generate avatar initials from full name */
function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

/**
 * Reusable Provider Card component.
 *
 * Two variants:
 * - **compact** (default) — small horizontal card (for carousels, lists)
 * - **detailed** — rich card with description, pricing, badges, location
 */
export function ProviderCard({
  name,
  photo,
  rating,
  reviewCount,
  isVerified = false,
  isAvailable,
  responseTime,
  location,
  completedJobs,
  description,
  hourlyRate,
  flatRate,
  priceRange,
  variant = "compact",
  showActions = false,
  onViewProfile,
  onMessage,
  onCall,
}: ProviderCardProps) {
  const priceText = getProviderPriceDisplay({ hourlyRate, flatRate, priceRange });

  // ─── Compact Variant ─────────────────────────────────────────
  if (variant === "compact") {
    return (
      <button
        onClick={onViewProfile}
        className="w-full bg-white rounded-[16px] p-[16px] text-left transition-all active:scale-[0.98]"
        style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}
      >
        <div className="flex items-center gap-[12px]">
          {/* Avatar */}
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="w-[52px] h-[52px] rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#56C490] to-[#00A050] flex items-center justify-center flex-shrink-0">
              <span className="font-['Nunito',sans-serif] text-[18px] text-white">
                {getInitials(name)}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[6px] mb-[2px]">
              <span className="font-['Nunito',sans-serif] text-[15px] text-[#111827] truncate">
                {name}
              </span>
              {isVerified && (
                <CheckCircle className="w-[14px] h-[14px] text-[#56C490] flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-[6px]">
              <Star className="w-[13px] h-[13px] text-[#F59E0B] fill-[#F59E0B] flex-shrink-0" />
              <span className="font-['Nunito',sans-serif] text-[13px] text-[#374151]">
                {rating.toFixed(1)}
              </span>
              <span className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
                ({reviewCount})
              </span>
            </div>
          </div>

          <ChevronRight className="w-[18px] h-[18px] text-[#D1D5DB] flex-shrink-0" />
        </div>
      </button>
    );
  }

  // ─── Detailed Variant ────────────────────────────────────────
  return (
    <div
      className="bg-white rounded-[16px] p-[16px] transition-all"
      style={{ boxShadow: "0 2px 12px rgba(0, 0, 0, 0.07)" }}
    >
      {/* Top Row */}
      <div className="flex items-start gap-[12px]">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="w-[56px] h-[56px] rounded-full object-cover"
            />
          ) : (
            <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-[#56C490] to-[#00A050] flex items-center justify-center">
              <span className="font-['Nunito',sans-serif] text-[20px] text-white">
                {getInitials(name)}
              </span>
            </div>
          )}
          {/* Availability dot */}
          {isAvailable !== undefined && (
            <span
              className={`absolute bottom-0 right-0 w-[14px] h-[14px] rounded-full border-2 border-white ${
                isAvailable ? "bg-[#56C490]" : "bg-[#9CA3AF]"
              }`}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[6px] mb-[3px]">
            <span className="font-['Nunito',sans-serif] text-[16px] text-[#111827] truncate">
              {name}
            </span>
            {isVerified && (
              <CheckCircle className="w-[15px] h-[15px] text-[#56C490] flex-shrink-0" />
            )}
          </div>

          {/* Rating Row */}
          <div className="flex items-center gap-[8px] mb-[6px]">
            <div className="flex items-center gap-[3px]">
              <Star className="w-[14px] h-[14px] text-[#F59E0B] fill-[#F59E0B]" />
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
                {rating.toFixed(1)}
              </span>
              <span className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
                ({reviewCount})
              </span>
            </div>
            {completedJobs !== undefined && (
              <div className="flex items-center gap-[3px]">
                <Briefcase className="w-[12px] h-[12px] text-[#9CA3AF]" />
                <span className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
                  {completedJobs.toLocaleString()} jobs
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <span className="font-['Nunito',sans-serif] text-[15px] text-[#56C490]">
            {priceText}
          </span>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5] mt-[12px] line-clamp-2">
          {description}
        </p>
      )}

      {/* Meta Row */}
      {(location || responseTime) && (
        <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[6px] mt-[10px]">
          {location && (
            <div className="flex items-center gap-[4px]">
              <MapPin className="w-[13px] h-[13px] text-[#9CA3AF]" />
              <span className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
                {location}
              </span>
            </div>
          )}
          {responseTime && (
            <div className="flex items-center gap-[4px]">
              <Clock className="w-[13px] h-[13px] text-[#9CA3AF]" />
              <span className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
                Responds {responseTime}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Availability status badge */}
      {isAvailable !== undefined && (
        <div className="mt-[10px]">
          <span
            className={`inline-flex items-center gap-[5px] px-[10px] py-[4px] rounded-[20px] font-['Nunito',sans-serif] text-[11px] ${
              isAvailable
                ? "bg-[#56C490]/10 text-[#56C490]"
                : "bg-[#F3F4F6] text-[#9CA3AF]"
            }`}
          >
            <span
              className={`w-[6px] h-[6px] rounded-full ${
                isAvailable ? "bg-[#56C490]" : "bg-[#9CA3AF]"
              }`}
            />
            {isAvailable ? "Available Now" : "Currently Unavailable"}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-[10px] mt-[14px] pt-[14px] border-t border-[#F2F2F2]">
          {onMessage && (
            <button
              onClick={onMessage}
              className="flex-1 flex items-center justify-center gap-[6px] py-[11px] rounded-[12px] border border-[#E5E7EB] font-['Nunito',sans-serif] text-[13px] text-[#374151] active:scale-[0.97] transition-transform"
            >
              <MessageCircle className="w-[16px] h-[16px]" />
              Message
            </button>
          )}
          {onCall && (
            <button
              onClick={onCall}
              className="flex-1 flex items-center justify-center gap-[6px] py-[11px] rounded-[12px] bg-[#56C490] font-['Nunito',sans-serif] text-[13px] text-white active:scale-[0.97] transition-transform"
            >
              <Phone className="w-[16px] h-[16px]" />
              Call
            </button>
          )}
          {onViewProfile && (
            <button
              onClick={onViewProfile}
              className="flex-1 flex items-center justify-center gap-[6px] py-[11px] rounded-[12px] bg-[#56C490] font-['Nunito',sans-serif] text-[13px] text-white active:scale-[0.97] transition-transform"
            >
              View Profile
              <ChevronRight className="w-[14px] h-[14px]" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
