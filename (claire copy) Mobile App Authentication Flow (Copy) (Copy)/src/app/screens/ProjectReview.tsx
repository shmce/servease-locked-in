import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { StickyFooterButton } from "../components/StickyFooterButton";

export default function ProjectReview() {
  const navigate = useNavigate();
  const { id } = useParams();

  const project = {
    serviceProvider: {
      name: "Maria Santos",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      rating: 4.8,
    },
    service: {
      type: "House Cleaning",
      date: "March 15, 2026",
      time: "10:00 AM",
      duration: "2 hours",
      address: "123 Bonifacio St, Makati City, Metro Manila",
    },
    options: {
      serviceProviders: 1,
      hours: 2,
      addons: ["Deep cleaning", "Eco-friendly products"],
    },
    pricing: {
      subTotal: 800,
      processingFee: 50,
      promoCode: "CLEAN50",
      discount: 50,
    },
  };

  const bookingCost = project.pricing.subTotal + project.pricing.processingFee - project.pricing.discount;

  return (
    <MobileContainer>
      <div className="h-full bg-white flex flex-col">
        {/* Status Bar */}
        <div className="bg-white flex-shrink-0">
          <StatusBar />
        </div>

        {/* Header */}
        <div className="bg-white px-[24px] py-[16px] flex items-center gap-[16px] flex-shrink-0 border-b border-[#F2F2F2]">
          <button onClick={() => navigate(-1)} className="active:scale-90 transition-transform">
            <ArrowLeft className="w-[24px] h-[24px] text-[#111827]" />
          </button>
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Review booking
          </h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-[120px]">
          <div className="px-[24px] py-[20px] space-y-[24px]">
            {/* Service Provider Info */}
            <div>
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

            {/* Service Details */}
            <div className="pt-[20px] border-t border-[#F2F2F2]">
              <h2 className="font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[16px]">
                Service details
              </h2>
              <div className="space-y-[12px]">
                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">Service type</span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">{project.service.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">Date</span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">{project.service.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">Time</span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">{project.service.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">Duration</span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">{project.service.duration}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">Address</span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827] text-right max-w-[200px]">
                    {project.service.address}
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Options */}
            <div className="pt-[20px] border-t border-[#F2F2F2]">
              <h2 className="font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[16px]">
                Selected options
              </h2>
              <div className="space-y-[12px]">
                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">Number of Service Providers</span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">{project.options.serviceProviders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">Hours</span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">{project.options.hours}</span>
                </div>
                {project.options.addons.length > 0 && (
                  <div className="flex justify-between items-start">
                    <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">Add-ons</span>
                    <div className="text-right">
                      {project.options.addons.map((addon, i) => (
                        <div key={i} className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                          {addon}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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

            {/* Edit Link */}
            <div className="text-center">
              <button className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] active:scale-95 transition-transform">
                Edit booking
              </button>
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