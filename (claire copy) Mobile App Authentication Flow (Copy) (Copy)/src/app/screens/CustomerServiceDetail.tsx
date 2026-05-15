import { useNavigate, useParams } from "react-router";
import { Star, MapPin, Clock, CheckCircle, Briefcase } from "lucide-react";
import { ServiceHeader } from "../components/ServiceHeader";
import { providersByService, serviceDetails } from "../data/providers-by-service";
import { getProviderPriceDisplay } from "../utils/formatPeso";

// Generate avatar initials
const getInitials = (name: string) => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function CustomerServiceDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const serviceId = parseInt(id || "0");
  const service = serviceDetails[serviceId];
  const providers = providersByService[serviceId] || [];

  if (!service) {
    return (
      <div className="bg-white w-full h-screen flex items-center justify-center">
        <p className="font-['Nunito',sans-serif] text-[16px] text-[#666]">
          Service not found
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] w-full h-screen flex flex-col">
      {/* Service Header */}
      <ServiceHeader
        title={service.title}
        subtitle={`${providers.length} ${providers.length === 1 ? "provider" : "providers"} available`}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] py-[20px]">
        {/* Service Info Banner */}
        <div className="bg-white rounded-[16px] p-[16px] mb-[20px] border border-[#E5E7EB] shadow-sm">
          <div className="flex items-center gap-[10px] mb-[8px]">
            <div className="w-[40px] h-[40px] rounded-[10px] bg-[#56C490]/10 flex items-center justify-center">
              <Briefcase className="w-[20px] h-[20px] text-[#56C490]" />
            </div>
            <div className="flex-1">
              <h3 className="font-['Nunito',sans-serif] text-[15px] text-[#111827]">
                {service.title}
              </h3>
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
                {service.category}
              </p>
            </div>
          </div>
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
            Browse through our verified service providers and choose the one that best fits your needs.
          </p>
        </div>

        {/* Provider List */}
        {providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px]">
            <div className="w-[80px] h-[80px] rounded-full bg-[#F3F4F6] flex items-center justify-center mb-[16px]">
              <Briefcase className="w-[36px] h-[36px] text-[#9CA3AF]" />
            </div>
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[8px]">
              No providers yet
            </h3>
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] text-center max-w-[280px]">
              We're working on bringing service providers for this service. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-[12px] pb-[20px]">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => navigate(`/provider/profile/${provider.id}`)}
                className="w-full bg-white rounded-[16px] p-[16px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all active:scale-[0.98] active:shadow-[0_1px_2px_rgba(0,0,0,0.06)] text-left"
              >
                {/* Provider Header */}
                <div className="flex items-start gap-[12px] mb-[12px]">
                  {/* Avatar */}
                  <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-[#56C490] to-[#00A050] flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="font-['Nunito',sans-serif] text-[20px] text-white">
                      {getInitials(provider.name)}
                    </span>
                  </div>

                  {/* Provider Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-[8px] mb-[4px]">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-['Nunito',sans-serif] text-[15px] text-[#111827] truncate">
                          {provider.businessName || provider.name}
                        </h3>
                        {provider.businessName && (
                          <p className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280] truncate">
                            {provider.name}
                          </p>
                        )}
                      </div>
                      {/* Verification Badge */}
                      {provider.isVerified && (
                        <div className="flex-shrink-0">
                          <CheckCircle className="w-[18px] h-[18px] text-[#56C490]" fill="#56C490" />
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-[6px]">
                      <Star className="w-[14px] h-[14px] text-[#F59E0B]" fill="#F59E0B" />
                      <span className="font-['Nunito',sans-serif] text-[13px] text-[#111827]">
                        {provider.rating.toFixed(1)}
                      </span>
                      <span className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
                        ({provider.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-[12px]">
                  <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5] line-clamp-2">
                    {provider.description}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-[8px] mb-[12px]">
                  {/* Completed Jobs */}
                  <div className="bg-[#F9FAFB] rounded-[8px] px-[8px] py-[6px]">
                    <p className="font-['Nunito',sans-serif] text-[10px] text-[#9CA3AF] mb-[2px]">
                      Completed
                    </p>
                    <p className="font-['Nunito',sans-serif] text-[13px] text-[#111827]">
                      {provider.completedJobs}
                    </p>
                  </div>

                  {/* Response Time */}
                  <div className="bg-[#F9FAFB] rounded-[8px] px-[8px] py-[6px]">
                    <p className="font-['Nunito',sans-serif] text-[10px] text-[#9CA3AF] mb-[2px]">
                      Response
                    </p>
                    <p className="font-['Nunito',sans-serif] text-[13px] text-[#111827]">
                      {provider.responseTime}
                    </p>
                  </div>

                  {/* Availability */}
                  <div className="bg-[#F9FAFB] rounded-[8px] px-[8px] py-[6px]">
                    <p className="font-['Nunito',sans-serif] text-[10px] text-[#9CA3AF] mb-[2px]">
                      Status
                    </p>
                    <p
                      className={`font-['Nunito',sans-serif] text-[13px] ${
                        provider.isAvailable ? "text-[#56C490]" : "text-[#EF4444]"
                      }`}
                    >
                      {provider.isAvailable ? "Available" : "Busy"}
                    </p>
                  </div>
                </div>

                {/* Location & Price */}
                <div className="flex items-center justify-between gap-[12px] pt-[12px] border-t border-[#F3F4F6]">
                  <div className="flex items-center gap-[6px] flex-1 min-w-0">
                    <MapPin className="w-[14px] h-[14px] text-[#9CA3AF] flex-shrink-0" />
                    <span className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280] truncate">
                      {provider.location}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="font-['Nunito',sans-serif] text-[15px] text-[#56C490]">
                      {getProviderPriceDisplay(provider)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-[#F9FAFB] flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}