import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft, ChevronDown, Image as ImageIcon, X, Info } from "lucide-react";
import { StickyFooterButton } from "../components/StickyFooterButton";

export default function DisputeBooking() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [selectedIssueType, setSelectedIssueType] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [selectedResolution, setSelectedResolution] = useState("");
  const [isIssueDropdownOpen, setIsIssueDropdownOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const booking = {
    id: "#SERV-123456",
    service: "House Cleaning",
    date: "March 15, 2026",
  };

  const issueTypes = [
    "Service not completed",
    "Poor quality work",
    "Damage/Loss",
    "Safety concern",
    "Provider misconduct",
    "Overcharge",
    "Other",
  ];

  const resolutionOptions = [
    "Full refund",
    "Partial refund",
    "Apology",
    "Provider warning",
    "Other",
  ];

  const handleSubmit = () => {
    // Handle dispute submission
    navigate("/customer/projects");
  };

  const handleFileUpload = () => {
    // Mock file upload
    if (uploadedFiles.length < 5) {
      setUploadedFiles([...uploadedFiles, `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400`]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  return (
    <MobileContainer>
      <div className="h-full bg-[#F9FAFB] flex flex-col">
        {/* Status Bar */}
        <div className="bg-[#EF4444] flex-shrink-0">
          <StatusBar />
        </div>

        {/* Header */}
        <div className="bg-[#EF4444] px-[24px] py-[16px] flex items-center gap-[16px] flex-shrink-0">
          <button onClick={() => navigate(-1)} className="active:scale-90 transition-transform">
            <ArrowLeft className="w-[24px] h-[24px] text-white" />
          </button>
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-white">
            Report an Issue
          </h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-[120px]">
          <div className="px-[24px] py-[20px] space-y-[16px]">
            {/* Booking Reference */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <div className="font-['Inter',sans-serif] text-[12px] text-[#9CA3AF] mb-[4px]">
                Booking Reference
              </div>
              <div className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[12px]">
                {booking.id}
              </div>

              <div className="flex justify-between pt-[12px] border-t border-[#F2F2F2]">
                <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">
                  Service
                </span>
                <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                  {booking.service}
                </span>
              </div>

              <div className="flex justify-between pt-[8px]">
                <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">
                  Date
                </span>
                <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                  {booking.date}
                </span>
              </div>
            </div>

            {/* Issue Type */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
                Issue Type
              </h2>

              <div className="relative">
                <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                  What went wrong? <span className="text-[#EF4444]">*</span>
                </label>

                <button
                  onClick={() => setIsIssueDropdownOpen(!isIssueDropdownOpen)}
                  className="w-full px-[16px] py-[14px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-left flex items-center justify-between focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                >
                  <span className={selectedIssueType ? "text-[#111827]" : "text-[#9CA3AF]"}>
                    {selectedIssueType || "Select issue type"}
                  </span>
                  <ChevronDown
                    className={`w-[20px] h-[20px] text-[#6B7280] transition-transform ${
                      isIssueDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isIssueDropdownOpen && (
                  <div
                    className="absolute z-10 w-full mt-[8px] bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden"
                    style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                  >
                    {issueTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedIssueType(type);
                          setIsIssueDropdownOpen(false);
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

            {/* Issue Description */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
                Issue Description
              </h2>

              <div>
                <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                  Please describe the issue in detail <span className="text-[#EF4444]">*</span>
                </label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Provide as much detail as possible to help us understand the issue..."
                  rows={6}
                  className="w-full px-[16px] py-[12px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20 resize-none"
                />
                <p className="font-['Inter',sans-serif] text-[12px] text-[#9CA3AF] mt-[8px]">
                  Minimum 20 characters
                </p>
              </div>
            </div>

            {/* Evidence Upload */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[8px]">
                Evidence Upload
              </h2>
              <p className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] mb-[16px]">
                Add photos or videos to support your claim (up to 5 files)
              </p>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-[12px] mb-[12px]">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={file}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-full object-cover rounded-[12px]"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-[6px] -right-[6px] w-[24px] h-[24px] rounded-full bg-[#EF4444] flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <X className="w-[14px] h-[14px] text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {uploadedFiles.length < 5 && (
                <button
                  onClick={handleFileUpload}
                  className="w-full py-[40px] rounded-[12px] border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] flex flex-col items-center justify-center gap-[8px] active:scale-[0.98] transition-transform"
                >
                  <ImageIcon className="w-[32px] h-[32px] text-[#9CA3AF]" />
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                    Add photos or videos
                  </span>
                  <span className="font-['Inter',sans-serif] text-[12px] text-[#9CA3AF]">
                    {uploadedFiles.length}/5 uploaded
                  </span>
                </button>
              )}
            </div>

            {/* Desired Resolution */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
                Desired Resolution
              </h2>

              <div className="space-y-[12px]">
                {resolutionOptions.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-[12px] cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="resolution"
                      value={option}
                      checked={selectedResolution === option}
                      onChange={(e) => setSelectedResolution(e.target.value)}
                      className="w-[20px] h-[20px] text-[#56C490] focus:ring-[#56C490] focus:ring-2"
                    />
                    <span className="font-['Inter',sans-serif] text-[14px] text-[#111827]">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Information Notice */}
            <div className="bg-[#DBEAFE] rounded-[16px] p-[16px] border border-[#93C5FD]">
              <div className="flex gap-[12px]">
                <Info className="w-[20px] h-[20px] text-[#1E40AF] flex-shrink-0 mt-[2px]" />
                <div>
                  <div className="font-['Nunito',sans-serif] text-[14px] text-[#1E40AF] mb-[4px]">
                    Review Timeline
                  </div>
                  <div className="font-['Inter',sans-serif] text-[12px] text-[#1E3A8A]">
                    Our support team will review your dispute and respond within 48 hours. You'll receive an email notification once we've made a decision.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <StickyFooterButton
          label="Submit Dispute"
          onClick={handleSubmit}
          disabled={!selectedIssueType || !issueDescription || issueDescription.length < 20 || !selectedResolution}
        />
      </div>
    </MobileContainer>
  );
}