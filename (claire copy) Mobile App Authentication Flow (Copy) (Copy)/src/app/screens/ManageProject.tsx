import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

export default function ManageProject() {
  const navigate = useNavigate();
  const { id } = useParams();

  const options = [
    {
      label: "Cancel Booking",
      onClick: () => navigate(`/customer/project/${id}/cancel`),
    },
    {
      label: "Change booking date or time",
      onClick: () => navigate(`/customer/project/${id}/change-datetime`),
    },
  ];

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
            Manage Project
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-[100px]">
          <div className="px-[24px] py-[20px]">
            <p className="font-['Inter',sans-serif] text-[14px] text-[#6B7280] mb-[20px]">
              Make changes to your project...
            </p>

            <div className="space-y-[2px]">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={option.onClick}
                  className="w-full flex items-center justify-between p-[16px] bg-white border-b border-[#F2F2F2] active:bg-[#F9FAFB] transition-colors"
                >
                  <span className="font-['Inter',sans-serif] text-[16px] text-[#111827]">
                    {option.label}
                  </span>
                  <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </MobileContainer>
  );
}