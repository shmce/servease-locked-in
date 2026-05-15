import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft, MapPin, Calendar, Clock, FileText, ChevronRight } from "lucide-react";
import { ProviderCard } from "../components/ProviderCard";
import { StickyFooterButton } from "../components/StickyFooterButton";

export default function BookingReview() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock booking data
  const booking = {
    provider: {
      name: "Maria Santos",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      rating: 4.8,
      reviewCount: 124,
    },
    service: {
      type: "House Cleaning",
      date: "March 15, 2026",
      time: "10:00 AM - 12:00 PM",
      duration: "2 hours",
      location: "123 Bonifacio St, Makati City, Metro Manila",
      description: "Deep cleaning of living room, kitchen, and 2 bedrooms",
    },
    pricing: {
      serviceFee: 800,
      calloutFee: 100,
      platformFee: 50,
      discount: 50,
    },
    paymentMethod: "GCash",
  };

  const total = booking.pricing.serviceFee + booking.pricing.calloutFee + booking.pricing.platformFee - booking.pricing.discount;

  return (
    <MobileContainer>
      <div className="h-full bg-[#F9FAFB] flex flex-col">
        {/* Status Bar */}
        <div className="bg-[#56C490] flex-shrink-0">
          <StatusBar />
        </div>

        {/* Header */}
        <div className="bg-[#56C490] px-[24px] py-[16px] flex items-center gap-[16px] flex-shrink-0">
          <button onClick={() => navigate(-1)} className="active:scale-90 transition-transform">
            <ArrowLeft className="w-[24px] h-[24px] text-white" />
          </button>
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-white">
            Review Booking
          </h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-[120px]">
          <div className="px-[24px] py-[20px] space-y-[16px]">
            {/* Provider Card */}
            <ProviderCard
              {...booking.provider}
              onViewProfile={() => {}}
            />

            {/* Service Details */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
                Service Details
              </h2>

              <div className="space-y-[16px]">
                <div className="flex gap-[12px]">
                  <FileText className="w-[20px] h-[20px] text-[#6B7280] flex-shrink-0 mt-[2px]" />
                  <div className="flex-1">
                    <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] mb-[2px]">
                      Service Type
                    </div>
                    <div className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                      {booking.service.type}
                    </div>
                  </div>
                </div>

                <div className="flex gap-[12px]">
                  <Calendar className="w-[20px] h-[20px] text-[#6B7280] flex-shrink-0 mt-[2px]" />
                  <div className="flex-1">
                    <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] mb-[2px]">
                      Date & Time
                    </div>
                    <div className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                      {booking.service.date}
                    </div>
                    <div className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">
                      {booking.service.time}
                    </div>
                  </div>
                </div>

                <div className="flex gap-[12px]">
                  <MapPin className="w-[20px] h-[20px] text-[#6B7280] flex-shrink-0 mt-[2px]" />
                  <div className="flex-1">
                    <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] mb-[2px]">
                      Location
                    </div>
                    <div className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                      {booking.service.location}
                    </div>
                  </div>
                </div>

                <div className="flex gap-[12px]">
                  <Clock className="w-[20px] h-[20px] text-[#6B7280] flex-shrink-0 mt-[2px]" />
                  <div className="flex-1">
                    <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] mb-[2px]">
                      Duration
                    </div>
                    <div className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                      {booking.service.duration}
                    </div>
                  </div>
                </div>

                {booking.service.description && (
                  <div className="pt-[12px] border-t border-[#F2F2F2]">
                    <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] mb-[4px]">
                      Special Instructions
                    </div>
                    <div className="font-['Inter',sans-serif] text-[14px] text-[#374151]">
                      {booking.service.description}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
                Price Breakdown
              </h2>

              <div className="space-y-[12px]">
                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">
                    Service fee
                  </span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                    ₱{booking.pricing.serviceFee}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">
                    Callout fee
                  </span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                    ₱{booking.pricing.calloutFee}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">
                    Platform fee
                  </span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                    ₱{booking.pricing.platformFee}
                  </span>
                </div>

                {booking.pricing.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="font-['Inter',sans-serif] text-[14px] text-[#56C490]">
                      Promo discount
                    </span>
                    <span className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
                      -₱{booking.pricing.discount}
                    </span>
                  </div>
                )}

                <div className="pt-[12px] border-t border-[#F2F2F2] flex justify-between">
                  <span className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
                    Total
                  </span>
                  <span className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
                    ₱{total}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div
              className="bg-white rounded-[16px] p-[16px] flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
              style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}
              onClick={() => navigate(`/customer/payment/${id}`)}
            >
              <div>
                <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] mb-[2px]">
                  Payment Method
                </div>
                <div className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                  {booking.paymentMethod}
                </div>
              </div>
              <ChevronRight className="w-[20px] h-[20px] text-[#6B7280]" />
            </div>

            {/* Terms Agreement */}
            <div className="bg-[#F9FAFB] rounded-[12px] p-[16px]">
              <p className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] leading-[18px]">
                By confirming booking, I agree to the{" "}
                <span className="text-[#56C490] underline cursor-pointer">Service Policy</span>
                {" "}and{" "}
                <span className="text-[#56C490] underline cursor-pointer">Refund Policy</span>
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <StickyFooterButton
          label="Confirm & Pay"
          onClick={() => navigate(`/customer/payment/${id}`)}
        />
      </div>
    </MobileContainer>
  );
}
