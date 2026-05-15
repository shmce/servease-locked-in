import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft, Phone, MessageCircle, Navigation } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

export default function TrackServiceProvider() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [eta, setEta] = useState(12);

  const serviceProvider = {
    name: "Maria Santos",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    rating: 4.8,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setEta((prev) => Math.max(0, prev - 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MobileContainer>
      <div className="h-full bg-white flex flex-col relative">
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 z-[1000] bg-white">
          <StatusBar />
        </div>

        {/* Header */}
        <div className="absolute top-[47px] left-0 right-0 z-[1000] bg-white px-[24px] py-[16px] flex items-center gap-[16px] border-b border-[#F2F2F2]">
          <button onClick={() => navigate(-1)} className="active:scale-90 transition-transform">
            <ArrowLeft className="w-[24px] h-[24px] text-[#111827]" />
          </button>
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Track Service Provider
          </h1>
        </div>

        {/* Map Placeholder */}
        <div className="flex-1 relative bg-[#F3F4F6]">
          {/* Using iframe for OpenStreetMap */}
          <iframe
            title="Track Service Provider Map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=121.0144%2C14.5447%2C121.0408%2C14.5695&layer=mapnik&marker=14.5571%2C121.0276"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
          
          {/* Map overlay indicators */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="relative">
              {/* Service Provider marker */}
              <div className="absolute top-[-100px] left-[-20px] w-[40px] h-[40px] rounded-full bg-[#56C490] border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-[12px] h-[12px] rounded-full bg-white" />
              </div>
              
              {/* Customer marker */}
              <div className="absolute top-[60px] left-[20px] w-[40px] h-[40px] rounded-full bg-[#EF4444] border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-[12px] h-[12px] rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Card */}
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-[24px] px-[24px] pt-[20px] pb-[8px] border-t border-[#F2F2F2]">
          <div className="flex justify-center mb-[16px]">
            <div className="w-[40px] h-[4px] bg-[#E5E7EB] rounded-full" />
          </div>

          <div className="flex items-center gap-[12px] mb-[16px]">
            <img
              src={serviceProvider.photo}
              alt={serviceProvider.name}
              className="w-[48px] h-[48px] rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
                {serviceProvider.name}
              </div>
              <div className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">
                ★ {serviceProvider.rating.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="bg-[#F9FAFB] rounded-[12px] p-[16px] mb-[16px]">
            <div className="flex items-center gap-[8px] mb-[4px]">
              <Navigation className="w-[18px] h-[18px] text-[#56C490]" />
              <span className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
                ETA: {eta} min
              </span>
            </div>
          </div>

          <div className="flex gap-[12px] mb-[12px]">
            <button
              onClick={() => {}}
              className="flex-1 flex items-center justify-center gap-[8px] py-[14px] rounded-[12px] bg-[#56C490] font-['Nunito',sans-serif] text-[14px] text-white active:scale-[0.97] transition-transform"
            >
              <Phone className="w-[18px] h-[18px]" />
              Call
            </button>
            <button
              onClick={() => {}}
              className="flex-1 flex items-center justify-center gap-[8px] py-[14px] rounded-[12px] border-2 border-[#56C490] font-['Nunito',sans-serif] text-[14px] text-[#56C490] active:scale-[0.97] transition-transform"
            >
              <MessageCircle className="w-[18px] h-[18px]" />
              Message
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 z-[1001] bg-white">
          <BottomNavigation />
        </div>
      </div>
    </MobileContainer>
  );
}
