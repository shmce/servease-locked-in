import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ChevronDown, FolderKanban } from "lucide-react";
import { ProjectCard } from "../components/ProjectCard";
import { BottomNavigation } from "../components/BottomNavigation";

type TabType = "inProgress" | "completed";

export default function MyProjects() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("inProgress");
  const [filterOpen, setFilterOpen] = useState(false);

  const inProgressProjects = [
    {
      id: "1",
      serviceType: "House Cleaning",
      scheduledDate: "March 15, 2026",
      frequency: "One-time service",
      serviceProviderName: "Maria Santos",
    },
    {
      id: "2",
      serviceType: "Plumbing Repair",
      scheduledDate: "March 18, 2026",
      frequency: "Emergency service",
      serviceProviderName: "Juan Dela Cruz",
    },
  ];

  const completedProjects = [
    {
      id: "3",
      serviceType: "Aircon Cleaning",
      scheduledDate: "March 10, 2026",
      frequency: "Monthly service",
      serviceProviderName: "Anna Reyes",
    },
  ];

  const projects =
    activeTab === "inProgress"
      ? inProgressProjects
      : completedProjects;

  return (
    <MobileContainer>
      <div className="h-full bg-white flex flex-col">
        {/* Status Bar */}
        <div className="bg-white flex-shrink-0">
          <StatusBar />
        </div>

        {/* Header */}
        <div className="bg-white px-[24px] py-[16px] flex items-center justify-between flex-shrink-0 border-b border-[#F2F2F2]">
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Projects
          </h1>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-[4px] font-['Nunito',sans-serif] text-[14px] text-[#6B7280] active:scale-95 transition-transform"
          >
            Filter
            <ChevronDown className={`w-[16px] h-[16px] transition-transform ${filterOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white px-[24px] pb-[16px] flex gap-[8px] flex-shrink-0 border-b border-[#F2F2F2]">
          <button
            onClick={() => setActiveTab("inProgress")}
            className={`flex-1 py-[12px] rounded-[12px] font-['Nunito',sans-serif] text-[14px] transition-all ${
              activeTab === "inProgress"
                ? "bg-[#56C490] text-white"
                : "bg-white text-[#6B7280] border border-[#F2F2F2]"
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-[12px] rounded-[12px] font-['Nunito',sans-serif] text-[14px] transition-all ${
              activeTab === "completed"
                ? "bg-[#56C490] text-white"
                : "bg-white text-[#6B7280] border border-[#F2F2F2]"
            }`}
          >
            Completed
          </button>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto pb-[100px]">
          {projects.length > 0 ? (
            <div className="px-[24px] py-[20px] space-y-[16px]">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  serviceType={project.serviceType}
                  scheduledDate={project.scheduledDate}
                  frequency={project.frequency}
                  serviceProviderName={project.serviceProviderName}
                  actionLabel={
                    activeTab === "inProgress"
                      ? "Track"
                      : "Review"
                  }
                  onCardClick={() => navigate(`/customer/project/${project.id}`)}
                  onActionClick={() => navigate(`/customer/project/${project.id}`)}
                  showDispute={activeTab === "completed"}
                  onDisputeClick={() => navigate(`/customer/project/${project.id}/report-issue`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-[24px] text-center">
              <div className="w-[120px] h-[120px] rounded-full bg-[#F3F4F6] flex items-center justify-center mb-[24px]">
                <FolderKanban className="w-[56px] h-[56px] text-[#9CA3AF]" />
              </div>
              <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827] mb-[8px]">
                No projects yet
              </h2>
              <p className="font-['Inter',sans-serif] text-[14px] text-[#6B7280] mb-[24px]">
                Start booking services to see them here
              </p>
              <button
                onClick={() => navigate("/customer/home")}
                className="px-[32px] py-[14px] rounded-[12px] bg-[#56C490] font-['Nunito',sans-serif] text-[14px] text-white active:scale-[0.97] transition-transform"
              >
                Browse Services
              </button>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </MobileContainer>
  );
}