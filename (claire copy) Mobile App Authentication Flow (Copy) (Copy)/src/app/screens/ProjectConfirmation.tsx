import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { CheckCircle, ChevronRight, Calendar, Plus } from "lucide-react";
import { StatusTimeline } from "../components/StatusTimeline";
import { BottomNavigation } from "../components/BottomNavigation";

export default function ProjectConfirmation() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const project = {
    id: "#SERV-123456",
    serviceProvider: {
      name: "Maria Santos",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      rating: 4.8,
    },
    service: {
      date: "March 15, 2026",
      time: "10:00 AM",
      location: "123 Bonifacio St, Makati City",
    },
    bookingDate: "March 13, 2026",
    serviceDate: "March 15, 2026",
  };

  const timelineSteps = [
    { label: "Booked", completed: true },
    { label: "On the way", completed: false },
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-[100px]">
          <div className="px-[24px] py-[40px] space-y-[24px]">
            {/* Success Icon */}
            <div className="flex flex-col items-center text-center">
              <div className="w-[80px] h-[80px] rounded-full bg-[#D1FAE5] flex items-center justify-center mb-[16px]">
                <CheckCircle className="w-[48px] h-[48px] text-[#56C490]" />
              </div>

              <h1 className="font-['Nunito',sans-serif] text-[24px] text-[#111827] mb-[12px]">
                Your project has been booked!
              </h1>

              <div className="inline-block bg-white rounded-[12px] px-[20px] py-[12px] border border-[#F2F2F2]">
                <div className="font-['Inter',sans-serif] text-[12px] text-[#9CA3AF] mb-[2px]">
                  Project ID
                </div>
                <div className="font-['Nunito',sans-serif] text-[16px] text-[#56C490]">
                  {project.id}
                </div>
              </div>
            </div>

            {/* Service Provider Card */}
            <div className="pt-[20px]">
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

            {/* Service Summary */}
            <div className="pt-[20px] border-t border-[#F2F2F2]">
              <div className="space-y-[12px]">
                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">Date</span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">{project.service.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">Time</span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">{project.service.time}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">Location</span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827] text-right max-w-[200px]">
                    {project.service.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="pt-[20px] border-t border-[#F2F2F2]">
              <StatusTimeline steps={timelineSteps} />
            </div>

            {/* Note */}
            <div className="text-center">
              <p className="font-['Inter',sans-serif] text-[12px] text-[#6B7280]">
                You booked this project on <span className="font-medium">{project.bookingDate}</span> for{" "}
                <span className="font-medium">{project.serviceDate}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-[12px]">
              <button
                onClick={() => navigate(`/customer/project/${projectId}`)}
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
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </MobileContainer>
  );
}