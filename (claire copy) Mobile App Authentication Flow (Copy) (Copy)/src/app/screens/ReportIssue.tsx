import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft, ChevronDown, Upload } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

export default function ReportIssue() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [resolution, setResolution] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const projectId = "#SERV-123456";

  const issueTypes = [
    "Service not completed",
    "Poor quality of work",
    "Damage to property",
    "Safety concern",
    "Service Provider misconduct",
    "Overcharge",
    "Late arrival",
    "No-show",
    "Other",
  ];

  const desiredOutcomes = [
    "Full refund",
    "Partial refund",
    "Service redo",
    "Apology",
    "Service Provider warning",
    "Other",
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
            Report an Issue
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-[180px]">
          <div className="px-[24px] py-[20px] space-y-[24px]">
            {/* Project ID */}
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Project ID
              </label>
              <div className="px-[16px] py-[12px] rounded-[12px] bg-[#F9FAFB] border border-[#F2F2F2]">
                <span className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                  {projectId}
                </span>
              </div>
            </div>

            {/* Issue Type Dropdown */}
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Issue type
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-[16px] py-[12px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-left flex items-center justify-between focus:outline-none focus:border-[#56C490]"
                >
                  <span className={issueType ? "text-[#111827]" : "text-[#9CA3AF]"}>
                    {issueType || "Select issue type"}
                  </span>
                  <ChevronDown className={`w-[20px] h-[20px] text-[#6B7280] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-[8px] bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden shadow-lg">
                    {issueTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setIssueType(type);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-[16px] py-[12px] text-left font-['Inter',sans-serif] text-[14px] text-[#111827] hover:bg-[#F9FAFB] transition-colors"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Describe the issue...
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide details about what happened..."
                rows={6}
                className="w-full px-[16px] py-[12px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20 resize-none"
              />
            </div>

            {/* Upload Evidence */}
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Upload evidence
              </label>
              <button className="w-full py-[32px] rounded-[12px] border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] flex flex-col items-center gap-[8px] active:scale-[0.98] transition-transform">
                <Upload className="w-[32px] h-[32px] text-[#9CA3AF]" />
                <span className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                  Upload photos or videos
                </span>
              </button>
            </div>

            {/* Desired Resolution */}
            <div className="pt-[20px] border-t border-[#F2F2F2]">
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[16px] block">
                Desired resolution
              </label>
              <div className="space-y-[16px]">
                {desiredOutcomes.map((res) => (
                  <label key={res} className="flex items-center gap-[12px] cursor-pointer">
                    <input
                      type="radio"
                      name="resolution"
                      value={res}
                      checked={resolution === res}
                      onChange={(e) => setResolution(e.target.value)}
                      className="w-[20px] h-[20px] text-[#56C490] focus:ring-[#56C490]"
                    />
                    <span className="font-['Inter',sans-serif] text-[14px] text-[#111827]">
                      {res}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Area */}
        <div className="flex-shrink-0 bg-white border-t border-[#F2F2F2]">
          {/* Submit Button */}
          <div className="px-[24px] pt-[16px] pb-[12px]">
            <button
              onClick={() => navigate("/customer/projects")}
              disabled={!issueType || !description || !resolution}
              className="w-full py-[16px] rounded-[50px] bg-[#56C490] font-['Nunito',sans-serif] text-[16px] text-white active:scale-[0.97] transition-transform shadow-[0_4px_16px_rgba(86,196,144,0.25)] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:shadow-none"
            >
              Submit
            </button>
          </div>
          
          {/* Bottom Navigation */}
          <BottomNavigation />
        </div>
      </div>
    </MobileContainer>
  );
}