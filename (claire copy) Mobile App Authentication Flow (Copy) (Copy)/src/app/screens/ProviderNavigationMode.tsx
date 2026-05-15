import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Navigation, Phone, MessageCircle, MapPin, Clock, X } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function ProviderNavigationMode() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [eta, setEta] = useState("12 mins");
  const [distance, setDistance] = useState("3.2 km");
  const [currentInstruction, setCurrentInstruction] = useState("Turn right onto Ayala Avenue");
  const [nextDistance, setNextDistance] = useState("500 m");
  const [trafficCondition, setTrafficCondition] = useState("Light traffic");

  const customerLocation = {
    name: "Juan Dela Cruz",
    address: "123 Rizal Street, Brgy. Poblacion, Makati City, Metro Manila"
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Map Placeholder - Full Screen */}
      <div className="flex-1 relative bg-[#e5f5e5]">
        {/* Map Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#e5f5e5] to-[#d4e9d4] flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-[80px] h-[80px] text-[#56C490] mx-auto mb-[12px] opacity-40" />
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
              Navigation Map
            </p>
            <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mt-[4px]">
              Route to customer location
            </p>
          </div>
        </div>

        {/* Close Navigation Button */}
        <button
          onClick={() => navigate(`/provider/booking-details/${id}`)}
          className="absolute top-[16px] right-[16px] w-[44px] h-[44px] bg-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-90"
        >
          <X className="w-[24px] h-[24px] text-[#1a1a1a]" />
        </button>

        {/* Turn-by-Turn Directions Card - Top */}
        <div className="absolute top-[16px] left-[16px] right-[70px] bg-white rounded-[16px] shadow-xl p-[16px]">
          <div className="flex items-center gap-[12px] mb-[12px]">
            <div className="w-[48px] h-[48px] bg-[#56C490] rounded-full flex items-center justify-center">
              <Navigation className="w-[24px] h-[24px] text-white" />
            </div>
            <div className="flex-1">
              <p className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[2px]">
                {currentInstruction}
              </p>
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280]">
                in {nextDistance}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#f2f2f2] pt-[12px]">
            <div>
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mb-[2px]">
                ETA
              </p>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                {eta}
              </p>
            </div>
            <div className="text-center">
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mb-[2px]">
                Distance
              </p>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                {distance}
              </p>
            </div>
            <div className="text-right">
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mb-[2px]">
                Traffic
              </p>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
                {trafficCondition}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Action Sheet */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-2xl p-[24px] pb-[calc(24px+34px)]">
          <div className="w-[40px] h-[4px] bg-[#e5e5e5] rounded-full mx-auto mb-[20px]" />
          
          <div className="mb-[16px]">
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[6px]">
              Destination
            </p>
            <div className="flex items-start gap-[8px]">
              <MapPin className="w-[16px] h-[16px] text-[#56C490] flex-shrink-0 mt-[2px]" />
              <div>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[2px]">
                  {customerLocation.name}
                </p>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280]">
                  {customerLocation.address}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[8px]">
            <button
              onClick={() => navigate(`/provider/start-service/${id}`)}
              className="col-span-2 w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[15px] py-[14px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] flex items-center justify-center gap-[8px]"
            >
              <MapPin className="w-[18px] h-[18px]" />
              I've Arrived
            </button>
            
            <button className="px-[12px] py-[12px] bg-white border-2 border-[#56C490] text-[#56C490] font-['Nunito',sans-serif] text-[14px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[6px]">
              <Phone className="w-[16px] h-[16px]" />
              Call
            </button>
            
            <button 
              onClick={() => navigate(`/provider/messages/${id}`)}
              className="px-[12px] py-[12px] bg-white border-2 border-[#56C490] text-[#56C490] font-['Nunito',sans-serif] text-[14px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[6px]"
            >
              <MessageCircle className="w-[16px] h-[16px]" />
              Message
            </button>

            <button
              onClick={() => navigate(`/provider/booking-details/${id}`)}
              className="col-span-2 w-full bg-white border-2 border-[#e5e5e5] text-[#1a1a1a] font-['Nunito',sans-serif] text-[14px] py-[12px] rounded-[12px] transition-all active:scale-95"
            >
              End Navigation
            </button>
          </div>
        </div>
      </div>

      {/* Home Indicator — iOS Safe Area */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}