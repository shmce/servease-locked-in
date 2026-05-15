import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { CheckCircle, Calendar, MapPin, Clock } from "lucide-react";
import { ProviderCard } from "../components/ProviderCard";
import { BottomNavigation } from "../components/BottomNavigation";

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const booking = {
    id: "#SERV-123456",
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
      location: "123 Bonifacio St, Makati City",
    },
    status: "Waiting for provider acceptance",
    estimatedResponse: "within 15 minutes",
  };

  return (
    <MobileContainer>
      <div className="h-full bg-[#F9FAFB] flex flex-col">
        {/* Status Bar */}
        <div className="bg-white flex-shrink-0">
          <StatusBar />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-[100px]">
          <div className="px-[24px] py-[40px] space-y-[24px]">
            {/* Success Icon */}
            <div className="flex flex-col items-center text-center">
              <div className="w-[80px] h-[80px] rounded-full bg-[#D1FAE5] flex items-center justify-center mb-[16px]">
                <CheckCircle className="w-[48px] h-[48px] text-[#56C490]" />
              </div>

              <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] mb-[8px]">
                Booking Confirmed!
              </h1>

              <p className="font-['Inter',sans-serif] text-[14px] text-[#6B7280] mb-[12px]">
                Your booking has been successfully created
              </p>

              <div className="bg-white rounded-[12px] px-[20px] py-[12px] inline-block" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
                <div className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] mb-[2px]">
                  Booking Reference
                </div>
                <div className="font-['Nunito',sans-serif] text-[18px] text-[#56C490]">
                  {booking.id}
                </div>
              </div>
            </div>

            {/* Provider Card */}
            <ProviderCard {...booking.provider} />

            {/* Service Summary */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
                Service Summary
              </h2>

              <div className="space-y-[12px]">
                <div className="flex gap-[12px]">
                  <Calendar className="w-[20px] h-[20px] text-[#6B7280] flex-shrink-0 mt-[2px]" />
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
                  <Clock className="w-[20px] h-[20px] text-[#6B7280] flex-shrink-0 mt-[2px]" />
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
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-[#FEF3C7] rounded-[16px] p-[16px] border border-[#FDE68A]">
              <div className="flex items-start gap-[12px]">
                <div className="w-[8px] h-[8px] rounded-full bg-[#F59E0B] flex-shrink-0 mt-[6px] animate-pulse" />
                <div>
                  <div className="font-['Nunito',sans-serif] text-[14px] text-[#92400E] mb-[4px]">
                    {booking.status}
                  </div>
                  <div className="font-['Inter',sans-serif] text-[12px] text-[#78350F]">
                    Estimated response time: {booking.estimatedResponse}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-[12px]">
              <button
                onClick={() => navigate(`/customer/booking/${bookingId}`)}
                className="w-full py-[16px] rounded-[50px] bg-[#56C490] font-['Nunito',sans-serif] text-[16px] text-white active:scale-[0.97] transition-transform shadow-[0_4px_16px_rgba(86,196,144,0.25)]"
              >
                View Booking Details
              </button>

              <button
                onClick={() => navigate("/customer/home")}
                className="w-full py-[16px] rounded-[50px] border-2 border-[#56C490] font-['Nunito',sans-serif] text-[16px] text-[#56C490] active:scale-[0.97] transition-transform"
              >
                Book Another Service
              </button>

              <button
                onClick={() => navigate("/customer/projects")}
                className="w-full py-[16px] rounded-[50px] border border-[#E5E7EB] font-['Nunito',sans-serif] text-[16px] text-[#374151] active:scale-[0.97] transition-transform"
              >
                View All Projects
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </MobileContainer>
  );
}