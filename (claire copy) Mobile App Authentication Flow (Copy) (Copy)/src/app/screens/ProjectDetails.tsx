import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft, Calendar, Plus, ChevronRight } from "lucide-react";
import { StatusTimeline } from "../components/StatusTimeline";
import { BottomNavigation } from "../components/BottomNavigation";

export default function ProjectDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const project = {
    id: "#SERV-123456",
    address: "123 Bonifacio St, Makati City",
    startDate: "March 15, 2026",
    startTime: "10:00 AM",
    serviceType: "House Cleaning",
    bookingDate: "March 13, 2026",
    serviceDate: "March 15, 2026",
    serviceProvider: {
      name: "Maria Santos",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      rating: 4.8,
    },
    pricing: {
      subTotal: 800,
      processingFee: 50,
      promoCode: "CLEAN50",
      discount: 50,
    },
  };

  const bookingCost = project.pricing.subTotal + project.pricing.processingFee - project.pricing.discount;

  const timelineSteps = [
    { label: "Booked", completed: true },
    { label: "On the way", completed: true },
    { label: "Started", completed: false },
    { label: "Completed", completed: false },
  ];

  return (
    <MobileContainer>
      <div className="h-full bg-white flex flex-col">
        {/* Status Bar */}
        <div className="bg-white flex-shrink-0">
          <StatusBar />
        </div>

        {/* Header */}
        <div className="bg-white px-[24px] py-[16px] flex-shrink-0 border-b border-[#F2F2F2]">
          <button
            onClick={() => navigate(-1)}
            className="mb-[8px] active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-[24px] h-[24px] text-[#111827]" />
          </button>
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Project Information
          </h1>
          <p className="font-['Inter',sans-serif] text-[14px] text-[#6B7280] mt-[4px]">
            {project.address}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-[100px]">
          <div className="px-[24px] py-[20px] space-y-[24px]">
            {/* Project ID */}
            <div>
              <div className="font-['Inter',sans-serif] text-[12px] text-[#9CA3AF] mb-[4px]">
                Project ID
              </div>
              <div className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
                {project.id}
              </div>
            </div>

            {/* Start Info */}
            <div className="bg-[#F9FAFB] rounded-[12px] p-[16px]">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                The Service Provider will start - {project.startDate} @ {project.startTime}
              </p>
            </div>

            {/* Service Type */}
            <div className="pt-[20px] border-t border-[#F2F2F2]">
              <div className="font-['Inter',sans-serif] text-[12px] text-[#9CA3AF] mb-[4px]">
                Service type
              </div>
              <div className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
                {project.serviceType}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-[12px]">
              <button
                onClick={() => navigate(`/customer/project/${id}/manage`)}
                className="flex-1 flex items-center justify-center gap-[8px] py-[14px] rounded-[12px] bg-[#56C490] font-['Nunito',sans-serif] text-[14px] text-white active:scale-[0.97] transition-transform"
              >
                <Calendar className="w-[18px] h-[18px]" />
                Manage project
              </button>

              <button
                onClick={() => {}}
                className="flex-1 flex items-center justify-center gap-[8px] py-[14px] rounded-[12px] border-2 border-[#56C490] font-['Nunito',sans-serif] text-[14px] text-[#56C490] active:scale-[0.97] transition-transform"
              >
                <Plus className="w-[18px] h-[18px]" />
                Add to calendar
              </button>
            </div>

            {/* Status Timeline */}
            <div className="pt-[20px] border-t border-[#F2F2F2]">
              <StatusTimeline steps={timelineSteps} />
            </div>

            {/* Booking Note */}
            <div className="text-center">
              <p className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
                You booked this project on <span className="font-medium">{project.bookingDate}</span> for{" "}
                <span className="font-medium">{project.serviceDate}</span>
              </p>
            </div>

            {/* Service Provider Section */}
            <div className="pt-[20px] border-t border-[#F2F2F2]">
              <div className="flex items-center gap-[12px] mb-[8px]">
                <img
                  src={project.serviceProvider.photo}
                  alt={project.serviceProvider.name}
                  className="w-[48px] h-[48px] rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
                    {project.serviceProvider.name}
                  </div>
                  <div className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">
                    ★ {project.serviceProvider.rating.toFixed(1)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {}}
                className="font-['Nunito',sans-serif] text-[14px] text-[#56C490] flex items-center gap-[4px]"
              >
                View Profile
                <ChevronRight className="w-[16px] h-[16px]" />
              </button>
            </div>

            {/* Price Breakdown */}
            <div className="pt-[20px] border-t border-[#F2F2F2]">
              <h2 className="font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[16px]">
                Price breakdown
              </h2>
              <div className="space-y-[12px]">
                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">Sub Total</span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">₱{project.pricing.subTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">Processing fee</span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">₱{project.pricing.processingFee}</span>
                </div>
                {project.pricing.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="font-['Inter',sans-serif] text-[14px] text-[#56C490]">
                      Promo code ({project.pricing.promoCode})
                    </span>
                    <span className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">-₱{project.pricing.discount}</span>
                  </div>
                )}
                <div className="pt-[12px] border-t border-[#F2F2F2] flex justify-between">
                  <span className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">Booking Cost</span>
                  <span className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">₱{bookingCost}</span>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="bg-[#F9FAFB] rounded-[12px] p-[16px]">
              <p className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] text-center">
                You won't be charged until the job is completed.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </MobileContainer>
  );
}