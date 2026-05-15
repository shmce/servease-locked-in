import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { BackButton } from "../components/BackButton";
import { Plus, Star, Edit2, Trash2, Upload } from "lucide-react";
import { Switch } from "../components/ui/switch";

interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  isFeatured: boolean;
  beforePhoto: string | null;
  afterPhoto: string | null;
}

export default function ProviderPortfolioManagement() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<PortfolioProject[]>([
    {
      id: "1",
      title: "Complete office deep cleaning and sanitization",
      category: "Commercial Cleaning",
      categoryColor: "#56C490",
      isFeatured: true,
      beforePhoto: null,
      afterPhoto: null,
    },
    {
      id: "2",
      title: "3-bedroom house complete cleaning service",
      category: "Residential Cleaning",
      categoryColor: "#06B6D4",
      isFeatured: false,
      beforePhoto: null,
      afterPhoto: null,
    },
  ]);

  const toggleFeatured = (id: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id
          ? { ...project, isFeatured: !project.isFeatured }
          : project
      )
    );
  };

  const deleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects((prev) => prev.filter((project) => project.id !== id));
    }
  };

  return (
    <div className="bg-[#F9FAFB] w-full min-h-screen flex flex-col max-w-[430px] mx-auto">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] py-[12px] border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
        <BackButton />
        <h1 className="font-semibold text-[18px] text-[#111827]">
          Portfolio Management
        </h1>
        <div className="w-[24px]" /> {/* Spacer for center alignment */}
      </div>

      {/* Subtitle */}
      <div className="bg-white px-[24px] pb-[16px] border-b border-[#E5E7EB]">
        <p className="text-[#6B7280] text-[14px]">
          Showcase your best work with before and after photos
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[24px]">
        {/* Add New Project Button */}
        <div className="px-[24px] py-[16px]">
          <button className="w-full bg-[#56C490] text-white rounded-[12px] py-[14px] font-semibold text-[16px] flex items-center justify-center gap-[8px] transition-all active:scale-[0.98] shadow-sm">
            <Plus className="w-[20px] h-[20px]" />
            Add New Project
          </button>
        </div>

        {/* Projects List */}
        <div className="px-[24px] space-y-[16px]">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-[16px] border border-[#E5E7EB] p-[16px] shadow-sm"
            >
              {/* Project Header */}
              <div className="flex items-start gap-[12px] mb-[12px]">
                <div className="flex-1">
                  <h3 className="text-[#111827] text-[15px] font-semibold mb-[6px] leading-[20px]">
                    {project.title}
                  </h3>
                  <span
                    className="inline-block px-[10px] py-[4px] rounded-[6px] text-[12px] font-medium"
                    style={{
                      backgroundColor: `${project.categoryColor}15`,
                      color: project.categoryColor,
                    }}
                  >
                    {project.category}
                  </span>
                </div>

                {/* Featured Toggle & Actions */}
                <div className="flex flex-col items-end gap-[8px]">
                  <div className="flex items-center gap-[6px]">
                    <Star
                      className={`w-[16px] h-[16px] ${
                        project.isFeatured
                          ? "text-[#FBBF24] fill-[#FBBF24]"
                          : "text-[#D1D5DB]"
                      }`}
                    />
                    <span className="text-[10px] text-[#9CA3AF] font-medium">
                      Featured
                    </span>
                    <Switch
                      checked={project.isFeatured}
                      onCheckedChange={() => toggleFeatured(project.id)}
                    />
                  </div>
                </div>
              </div>

              {/* Before & After Photos */}
              <div className="grid grid-cols-2 gap-[12px] mb-[12px]">
                {/* BEFORE */}
                <div>
                  <p className="text-[#9CA3AF] text-[11px] font-semibold uppercase tracking-wide mb-[8px]">
                    Before
                  </p>
                  <div className="aspect-square rounded-[10px] bg-[#F9FAFB] border-2 border-dashed border-[#D1D5DB] flex flex-col items-center justify-center gap-[8px] transition-all hover:border-[#56C490] cursor-pointer">
                    <div className="w-[40px] h-[40px] rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center">
                      <Upload className="w-[18px] h-[18px] text-[#9CA3AF]" />
                    </div>
                    <span className="text-[12px] text-[#9CA3AF] font-medium">
                      Upload
                    </span>
                  </div>
                </div>

                {/* AFTER */}
                <div>
                  <p className="text-[#9CA3AF] text-[11px] font-semibold uppercase tracking-wide mb-[8px]">
                    After
                  </p>
                  <div className="aspect-square rounded-[10px] bg-[#F9FAFB] border-2 border-dashed border-[#D1D5DB] flex flex-col items-center justify-center gap-[8px] transition-all hover:border-[#56C490] cursor-pointer">
                    <div className="w-[40px] h-[40px] rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center">
                      <Upload className="w-[18px] h-[18px] text-[#9CA3AF]" />
                    </div>
                    <span className="text-[12px] text-[#9CA3AF] font-medium">
                      Upload
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-[8px] pt-[12px] border-t border-[#E5E7EB]">
                <button className="flex-1 bg-[#F3F4F6] text-[#374151] rounded-[10px] py-[10px] font-semibold text-[14px] flex items-center justify-center gap-[6px] transition-all active:scale-[0.98]">
                  <Edit2 className="w-[16px] h-[16px]" />
                  Edit
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="px-[16px] bg-[#FEE2E2] text-[#DC2626] rounded-[10px] py-[10px] font-semibold text-[14px] flex items-center justify-center gap-[6px] transition-all active:scale-[0.98]"
                >
                  <Trash2 className="w-[16px] h-[16px]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}
