import { useState, startTransition } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { BackButton } from "../components/BackButton";
import { Plus, Star, Pencil, Trash2, GripVertical, Upload } from "lucide-react";

interface Project {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  description: string;
  serviceCategory: string;
  date: string;
  isFeatured: boolean;
  isActive: boolean;
  isExpanded: boolean;
  createdDate: string;
  beforeImage?: string;
  afterImage?: string;
}

export default function ProviderPortfolio() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "Complete office deep cleaning and sanitization",
      category: "Commercial Cleaning",
      categoryColor: "bg-[#D1FAE5] text-[#065F46]",
      description: "",
      serviceCategory: "",
      date: "",
      isFeatured: true,
      isActive: true,
      isExpanded: false,
      createdDate: "2025-03-31",
    },
    {
      id: "2",
      title: "3-bedroom house complete cleaning service",
      category: "Residential Cleaning",
      categoryColor: "bg-[#DBEAFE] text-[#1E40AF]",
      description: "",
      serviceCategory: "",
      date: "",
      isFeatured: true,
      isActive: true,
      isExpanded: false,
      createdDate: "2025-03-31",
    },
  ]);

  const addNewProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: "Untitled Project",
      category: "Uncategorized",
      categoryColor: "bg-[#E5E7EB] text-[#6B7280]",
      description: "",
      serviceCategory: "",
      date: new Date().toISOString().split("T")[0],
      isFeatured: false,
      isActive: true,
      isExpanded: true,
      createdDate: new Date().toISOString().split("T")[0],
    };
    setProjects([newProject, ...projects]);
  };

  const toggleFeatured = (id: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, isFeatured: !project.isFeatured } : project
      )
    );
  };

  const toggleActive = (id: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, isActive: !project.isActive } : project
      )
    );
  };

  const toggleExpanded = (id: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, isExpanded: !project.isExpanded } : project
      )
    );
  };

  const deleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects((prev) => prev.filter((project) => project.id !== id));
    }
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, [field]: value } : project
      )
    );
  };

  return (
    <div className="h-screen bg-[#F9FAFB] flex flex-col overflow-hidden">
      {/* iOS Status Bar */}
      <StatusBar />

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] shrink-0">
        <div className="flex items-center justify-between h-[56px] px-[24px]">
          <BackButton />
          <h1 className="font-bold text-[20px] text-[#111827]">
            Portfolio Management
          </h1>
          <div className="w-[40px]" /> {/* Spacer */}
        </div>
        <div className="px-[24px] pb-[16px] flex items-center justify-between">
          <p className="text-[#6B7280] text-[14px]">
            Showcase your best work with before and after photos
          </p>
          <button
            onClick={addNewProject}
            className="bg-[#56C490] text-white px-[16px] py-[8px] rounded-[8px] text-[14px] font-semibold flex items-center gap-[6px] transition-all active:scale-95 whitespace-nowrap ml-[16px]"
          >
            <Plus className="w-[16px] h-[16px]" />
            Add New Project
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] py-[20px]">
        <div className="space-y-[16px]">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm overflow-hidden"
            >
              {/* Project Header */}
              <div className="p-[20px]">
                <div className="flex items-start gap-[12px]">
                  {/* Drag Handle */}
                  <button className="mt-[4px] text-[#9CA3AF] cursor-move hover:text-[#6B7280] transition-colors">
                    <GripVertical className="w-[20px] h-[20px]" />
                  </button>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-[8px]">
                      <div className="flex-1">
                        <h3 className="text-[#111827] text-[16px] font-bold mb-[6px]">
                          {project.title}
                        </h3>
                        <span
                          className={`inline-block ${project.categoryColor} px-[10px] py-[3px] rounded-[5px] text-[11px] font-medium`}
                        >
                          {project.category}
                        </span>
                        {project.isExpanded && (
                          <p className="text-[#9CA3AF] text-[12px] mt-[4px]">
                            {project.createdDate}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-[8px] ml-[12px]">
                        {/* Featured Toggle */}
                        <button
                          onClick={() => toggleFeatured(project.id)}
                          className={`transition-all ${
                            project.isFeatured ? "text-[#FFA500]" : "text-[#D1D5DB]"
                          }`}
                        >
                          <Star
                            className={`w-[18px] h-[18px] ${
                              project.isFeatured ? "fill-[#FFA500]" : ""
                            }`}
                          />
                        </button>

                        {/* Featured Label */}
                        {!project.isExpanded && (
                          <span className="text-[11px] text-[#6B7280] font-medium mr-[4px]">
                            Featured
                          </span>
                        )}

                        {/* Active Toggle */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={project.isActive}
                            onChange={() => toggleActive(project.id)}
                            className="sr-only peer"
                          />
                          <div className="w-[44px] h-[24px] bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[20px] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-[#56C490] shadow-inner"></div>
                        </label>

                        {/* Edit Button */}
                        <button
                          onClick={() => toggleExpanded(project.id)}
                          className="w-[32px] h-[32px] rounded-[6px] bg-[#F3F4F6] flex items-center justify-center transition-all active:scale-90 hover:bg-[#E5E7EB]"
                        >
                          <Pencil className="w-[16px] h-[16px] text-[#6B7280]" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="w-[32px] h-[32px] rounded-[6px] bg-[#FEE2E2] flex items-center justify-center transition-all active:scale-90 hover:bg-[#FEE2E2]"
                        >
                          <Trash2 className="w-[16px] h-[16px] text-[#DC2626]" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {project.isExpanded && (
                      <div className="space-y-[20px] pt-[20px] border-t border-[#E5E7EB] mt-[16px]">
                        {/* Title Input */}
                        <div>
                          <label className="block text-[13px] font-semibold text-[#111827] mb-[8px]">
                            Project Title
                          </label>
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => updateProject(project.id, "title", e.target.value)}
                            className="w-full px-[14px] py-[12px] rounded-[8px] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                            placeholder="e.g., Complete office deep cleaning"
                          />
                        </div>

                        {/* Before and After Upload Section */}
                        <div className="grid grid-cols-2 gap-[16px]">
                          {/* Before */}
                          <div>
                            <label className="block text-[11px] font-semibold text-[#6B7280] mb-[8px] uppercase tracking-wide">
                              Before
                            </label>
                            <div className="aspect-[4/3] bg-[#F3F4F6] rounded-[8px] border-2 border-dashed border-[#D1D5DB] flex flex-col items-center justify-center cursor-pointer hover:bg-[#E5E7EB] transition-colors">
                              <Upload className="w-[24px] h-[24px] text-[#9CA3AF] mb-[8px]" />
                              <span className="text-[13px] text-[#6B7280] font-medium">
                                Upload
                              </span>
                            </div>
                          </div>

                          {/* After */}
                          <div>
                            <label className="block text-[11px] font-semibold text-[#6B7280] mb-[8px] uppercase tracking-wide">
                              After
                            </label>
                            <div className="aspect-[4/3] bg-[#F3F4F6] rounded-[8px] border-2 border-dashed border-[#D1D5DB] flex flex-col items-center justify-center cursor-pointer hover:bg-[#E5E7EB] transition-colors">
                              <Upload className="w-[24px] h-[24px] text-[#9CA3AF] mb-[8px]" />
                              <span className="text-[13px] text-[#6B7280] font-medium">
                                Upload
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-[13px] font-semibold text-[#111827] mb-[8px]">
                            Description
                          </label>
                          <textarea
                            value={project.description}
                            onChange={(e) =>
                              updateProject(project.id, "description", e.target.value)
                            }
                            rows={4}
                            className="w-full px-[14px] py-[12px] rounded-[8px] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all resize-none"
                            placeholder="Describe this project..."
                          />
                        </div>

                        {/* Service Category and Date */}
                        <div className="grid grid-cols-2 gap-[16px]">
                          <div>
                            <label className="block text-[13px] font-semibold text-[#111827] mb-[8px]">
                              Service Category
                            </label>
                            <input
                              type="text"
                              value={project.serviceCategory}
                              onChange={(e) =>
                                updateProject(project.id, "serviceCategory", e.target.value)
                              }
                              className="w-full px-[14px] py-[12px] rounded-[8px] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                              placeholder="e.g., Deep Cleaning"
                            />
                          </div>

                          <div>
                            <label className="block text-[13px] font-semibold text-[#111827] mb-[8px]">
                              Date
                            </label>
                            <input
                              type="date"
                              value={project.date}
                              onChange={(e) =>
                                updateProject(project.id, "date", e.target.value)
                              }
                              className="w-full px-[14px] py-[12px] rounded-[8px] border border-[#E5E7EB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/10 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}