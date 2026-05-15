import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, ChevronDown, Upload, X, CheckCircle } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function ProviderReportIssue() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock booking data
  const bookingData = {
    referenceNumber: "BK-2026-03-001",
    serviceType: "Plumbing Repair",
    customerName: "Juan Dela Cruz",
    date: "March 15, 2026",
    time: "2:00 PM"
  };

  const issueTypes = [
    "Customer unavailable",
    "Incorrect service details",
    "Safety concern",
    "Payment issue",
    "Property access problem",
    "Other"
  ];

  const handleFileUpload = () => {
    // Simulate file upload with placeholder images
    const mockFiles = [
      "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=200",
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=200"
    ];
    setUploadedFiles([...uploadedFiles, mockFiles[uploadedFiles.length % mockFiles.length]]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!issueType || !description.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessMessage(true);
      
      // Auto-redirect after showing success message
      setTimeout(() => {
        navigate("/provider/my-bookings");
      }, 2000);
    }, 1000);
  };

  const isFormValid = issueType && description.trim();

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Fixed Header */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0 border-b border-[#f2f2f2]">
        <button
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Report Issue
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[16px]">
        {/* Booking Reference Card */}
        <div className="mt-[24px] mb-[20px] border-2 border-[#e5e5e5] rounded-[16px] p-[16px] bg-[#f9fafb]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[8px]">
            Booking Reference
          </p>
          <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#1a1a1a] mb-[4px]">
            {bookingData.serviceType}
          </h3>
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[6px]">
            {bookingData.referenceNumber}
          </p>
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280]">
            {bookingData.date} at {bookingData.time}
          </p>
        </div>

        {/* Issue Type Dropdown */}
        <div className="mb-[20px]">
          <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
            Issue Type <span className="text-[#ff4444]">*</span>
          </label>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-left flex items-center justify-between focus:outline-none transition-all ${
                isDropdownOpen ? "border-[#56C490] bg-white" : "border-transparent"
              }`}
            >
              <span className={issueType ? "text-[#1a1a1a]" : "text-[#9CA3AF]"}>
                {issueType || "Select issue type"}
              </span>
              <ChevronDown
                className={`w-[20px] h-[20px] text-[#6B7280] transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-[8px] bg-white rounded-[12px] border-2 border-[#e5e5e5] overflow-hidden shadow-lg">
                {issueTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setIssueType(type);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-[16px] py-[14px] text-left font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] hover:bg-[#f9fafb] transition-colors active:bg-[#f5f5f5]"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description Text Area */}
        <div className="mb-[20px]">
          <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
            Describe the Issue <span className="text-[#ff4444]">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide detailed information about the issue you're experiencing..."
            rows={6}
            className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all resize-none"
          />
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mt-[6px]">
            {description.length}/500 characters
          </p>
        </div>

        {/* Optional Evidence Upload */}
        <div className="mb-[24px]">
          <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
            Upload Evidence <span className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">(Optional)</span>
          </label>
          
          {/* Upload Button */}
          <button
            onClick={handleFileUpload}
            className="w-full py-[32px] rounded-[12px] border-2 border-dashed border-[#e5e5e5] bg-[#f9fafb] flex flex-col items-center gap-[8px] transition-all active:scale-98 hover:border-[#56C490] hover:bg-[#56C490]/5"
          >
            <Upload className="w-[32px] h-[32px] text-[#9CA3AF]" />
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
              Upload photos or screenshots
            </p>
            <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
              PNG, JPG up to 10MB
            </p>
          </button>

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mt-[12px] grid grid-cols-3 gap-[8px]">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={file}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-[80px] object-cover rounded-[8px] border-2 border-[#e5e5e5]"
                  />
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="absolute -top-[6px] -right-[6px] w-[24px] h-[24px] bg-[#EF4444] rounded-full flex items-center justify-center transition-all active:scale-90 shadow-md"
                  >
                    <X className="w-[14px] h-[14px] text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="px-[24px] py-[16px] bg-white border-t border-[#f2f2f2] flex-shrink-0 space-y-[8px]">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-[8px]"
        >
          {isSubmitting ? (
            <>
              <div className="w-[20px] h-[20px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting Report...
            </>
          ) : (
            "Submit Report"
          )}
        </button>
        <button
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
          className="w-full bg-white border-2 border-[#e5e5e5] text-[#1a1a1a] font-['Nunito',sans-serif] text-[14px] py-[14px] rounded-[12px] transition-all active:scale-95 disabled:opacity-40"
        >
          Cancel
        </button>
      </div>

      {/* Success Message Modal */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-[24px]">
          <div className="bg-white rounded-[20px] p-[32px] max-w-[320px] w-full transform transition-all scale-100 animate-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-[64px] h-[64px] bg-[#56C490]/10 rounded-full flex items-center justify-center mb-[16px]">
                <CheckCircle className="w-[36px] h-[36px] text-[#56C490]" />
              </div>
              <h3 className="font-['Nunito',sans-serif] text-[20px] text-[#1a1a1a] mb-[8px]">
                Report Submitted
              </h3>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-relaxed">
                Your issue report has been submitted to ServEase support.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Home Indicator */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}
