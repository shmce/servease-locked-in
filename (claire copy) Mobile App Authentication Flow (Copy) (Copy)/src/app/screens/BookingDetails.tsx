import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft, MoreVertical, MapPin, Calendar, FileText, Download, Flag, CheckCircle, Circle } from "lucide-react";
import { ProviderCard } from "../components/ProviderCard";

export default function BookingDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const booking = {
    id: "#SERV-123456",
    status: "in-progress",
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
      location: "123 Bonifacio St, Makati City, Metro Manila",
      description: "Deep cleaning of living room, kitchen, and 2 bedrooms",
    },
    pricing: {
      serviceFee: 800,
      calloutFee: 100,
      platformFee: 50,
      discount: 50,
      total: 900,
    },
    paymentMethod: "GCash",
    timeline: [
      { label: "Booked", completed: true },
      { label: "Provider accepted", completed: true },
      { label: "On the way", completed: true },
      { label: "Arrived", completed: true },
      { label: "Service started", completed: true },
      { label: "Service completed", completed: false },
      { label: "Payment completed", completed: false },
      { label: "Review submitted", completed: false },
    ],
  };

  return (
    <MobileContainer>
      <div className="h-full bg-[#F9FAFB] flex flex-col">
        {/* Status Bar */}
        <div className="bg-[#56C490] flex-shrink-0">
          <StatusBar />
        </div>

        {/* Header */}
        <div className="bg-[#56C490] px-[24px] py-[16px] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-[16px]">
            <button onClick={() => navigate(-1)} className="active:scale-90 transition-transform">
              <ArrowLeft className="w-[24px] h-[24px] text-white" />
            </button>
            <h1 className="font-['Nunito',sans-serif] text-[18px] text-white">
              Booking Details
            </h1>
          </div>
          <button className="active:scale-90 transition-transform">
            <MoreVertical className="w-[24px] h-[24px] text-white" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-[20px]">
          <div className="px-[24px] py-[20px] space-y-[16px]">
            {/* Booking ID & Status */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <div className="flex items-center justify-between mb-[12px]">
                <div className="font-['Inter',sans-serif] text-[12px] text-[#9CA3AF]">
                  Booking Reference
                </div>
                <div className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                  {booking.id}
                </div>
              </div>
              <div className="flex items-center justify-center py-[8px]">
                <div className="px-[20px] py-[8px] rounded-full bg-[#D1FAE5] font-['Nunito',sans-serif] text-[14px] text-[#065F46]">
                  In Progress
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
                Status Timeline
              </h2>

              <div className="space-y-[16px]">
                {booking.timeline.map((step, index) => (
                  <div key={index} className="flex items-start gap-[12px]">
                    <div className="relative">
                      {step.completed ? (
                        <div className="w-[24px] h-[24px] rounded-full bg-[#56C490] flex items-center justify-center">
                          <CheckCircle className="w-[16px] h-[16px] text-white" />
                        </div>
                      ) : (
                        <div className="w-[24px] h-[24px] rounded-full border-2 border-[#E5E7EB] bg-white flex items-center justify-center">
                          <Circle className="w-[12px] h-[12px] text-[#E5E7EB]" />
                        </div>
                      )}
                      {index < booking.timeline.length - 1 && (
                        <div
                          className={`absolute left-[11px] top-[24px] w-[2px] h-[32px] ${
                            step.completed ? "bg-[#56C490]" : "bg-[#E5E7EB]"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pt-[2px]">
                      <div
                        className={`font-['Nunito',sans-serif] text-[14px] ${
                          step.completed ? "text-[#111827]" : "text-[#9CA3AF]"
                        }`}
                      >
                        {step.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Provider Card */}
            <ProviderCard
              {...booking.provider}
              showActions
              onMessage={() => {}}
              onCall={() => {}}
            />

            {/* Service Details */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
                Service Details
              </h2>

              <div className="space-y-[12px]">
                <div className="flex gap-[12px]">
                  <FileText className="w-[20px] h-[20px] text-[#6B7280] flex-shrink-0 mt-[2px]" />
                  <div>
                    <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
                      Service Type
                    </div>
                    <div className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                      {booking.service.type}
                    </div>
                  </div>
                </div>

                <div className="flex gap-[12px]">
                  <Calendar className="w-[20px] h-[20px] text-[#6B7280] flex-shrink-0 mt-[2px]" />
                  <div>
                    <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
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
                  <div>
                    <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
                      Location
                    </div>
                    <div className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                      {booking.service.location}
                    </div>
                  </div>
                </div>

                {booking.service.description && (
                  <div className="pt-[12px] border-t border-[#F2F2F2]">
                    <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] mb-[4px]">
                      Description
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
                Payment Summary
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
                      Discount
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
                    ₱{booking.pricing.total}
                  </span>
                </div>

                <div className="pt-[8px] flex justify-between items-center">
                  <span className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
                    Payment Method
                  </span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                    {booking.paymentMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-[12px]">
              <button
                onClick={() => navigate(`/customer/booking/${id}/track`)}
                className="w-full py-[16px] rounded-[50px] bg-[#56C490] font-['Nunito',sans-serif] text-[16px] text-white active:scale-[0.97] transition-transform shadow-[0_4px_16px_rgba(86,196,144,0.25)]"
              >
                Track Provider
              </button>

              <div className="grid grid-cols-2 gap-[12px]">
                <button
                  onClick={() => navigate(`/customer/booking/${id}/modify`)}
                  className="py-[14px] rounded-[50px] border-2 border-[#56C490] font-['Nunito',sans-serif] text-[14px] text-[#56C490] active:scale-[0.97] transition-transform"
                >
                  Modify Booking
                </button>

                <button
                  onClick={() => navigate(`/customer/booking/${id}/cancel`)}
                  className="py-[14px] rounded-[50px] border border-[#EF4444] font-['Nunito',sans-serif] text-[14px] text-[#EF4444] active:scale-[0.97] transition-transform"
                >
                  Cancel Booking
                </button>
              </div>

              <div className="flex gap-[12px] pt-[8px]">
                <button className="flex-1 flex items-center justify-center gap-[8px] py-[12px] font-['Nunito',sans-serif] text-[14px] text-[#6B7280] active:scale-[0.97] transition-transform">
                  <Download className="w-[18px] h-[18px]" />
                  Download Receipt
                </button>
                <button
                  onClick={() => navigate(`/customer/booking/${id}/dispute`)}
                  className="flex-1 flex items-center justify-center gap-[8px] py-[12px] font-['Nunito',sans-serif] text-[14px] text-[#6B7280] active:scale-[0.97] transition-transform"
                >
                  <Flag className="w-[18px] h-[18px]" />
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="h-[34px] relative flex-shrink-0 bg-white">
          <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
        </div>
      </div>
    </MobileContainer>
  );
}
