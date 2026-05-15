import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ChevronDown, Upload, Camera, FileText, X, AlertTriangle } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { StickyFooterButton } from "../components/StickyFooterButton";

const ID_TYPES = [
  "UMID",
  "Driver's License",
  "Philippine National ID (PhilID)",
  "Passport",
  "Postal ID",
];

export default function ProviderSignupStep4() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [idType, setIdType] = useState("");
  const [showIdDropdown, setShowIdDropdown] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [uploadError, setUploadError] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only PNG, JPG, or PDF files are allowed.");
      return;
    }
    if (file.size > maxSize) {
      setUploadError("File size must not exceed 5MB.");
      return;
    }

    setUploadError("");
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setUploadedFile({ name: file.name, size: `${sizeMB} MB` });
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleContinue = () => {
    if (isFormValid) {
      navigate("/provider/signup/step5");
    }
  };

  const isFormValid = idType !== "" && uploadedFile !== null;

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Top Navigation Bar */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Document Upload
          </h2>
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
            Step 4 of 5
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-[4px] bg-[#e5e5e5] flex-shrink-0">
        <div className="h-full bg-[#56C490] transition-all duration-300" style={{ width: "80%" }} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[16px]">
        <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] leading-[1.2] mt-[24px] mb-[8px]">
          Verify your identity
        </h1>
        <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.5] mb-[24px]">
          Upload a valid Philippine government-issued ID.
        </p>

        {/* Info Banner */}
        <div className="flex items-start gap-[12px] bg-[#fff8e1] border border-[#ffcc02]/30 rounded-[12px] p-[14px] mb-[28px]">
          <AlertTriangle className="w-[20px] h-[20px] text-[#d4a017] flex-shrink-0 mt-[1px]" />
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#7a6a00] leading-[1.5]">
            Please ensure your ID is clear, valid, and all details are visible.
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-[24px]">
          {/* ID Type Dropdown */}
          <div className="relative">
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Select ID Type <span className="text-[#ff4444]">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowIdDropdown(!showIdDropdown)}
              className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-left flex items-center justify-between transition-all ${
                showIdDropdown ? "border-[#56C490] bg-white" : "border-transparent"
              }`}
            >
              <span className={idType ? "text-[#1a1a1a]" : "text-[#9CA3AF]"}>
                {idType || "Choose your ID type"}
              </span>
              <ChevronDown
                className={`w-[20px] h-[20px] text-[#666] transition-transform ${
                  showIdDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showIdDropdown && (
              <div className="absolute top-full left-0 right-0 mt-[8px] bg-white border-2 border-[#56C490] rounded-[12px] shadow-lg z-10 overflow-hidden">
                {ID_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setIdType(type);
                      setShowIdDropdown(false);
                    }}
                    className={`w-full px-[16px] py-[12px] font-['Nunito',sans-serif] text-[14px] text-left transition-all ${
                      idType === type
                        ? "bg-[#56C490]/10 text-[#56C490]"
                        : "text-[#1a1a1a] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ID Upload */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Upload your selected ID <span className="text-[#ff4444]">*</span>
            </label>

            {!uploadedFile ? (
              <div className="border-2 border-dashed border-[#56C490] rounded-[16px] p-[28px] flex flex-col items-center text-center">
                <div className="w-[56px] h-[56px] bg-[#56C490]/10 rounded-full flex items-center justify-center mb-[16px]">
                  <Upload className="w-[28px] h-[28px] text-[#56C490]" />
                </div>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] mb-[4px]">
                  Upload your selected ID
                </p>
                <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mb-[20px]">
                  PNG, JPG or PDF &bull; Max 5MB
                </p>

                {/* Upload Buttons */}
                <div className="flex gap-[12px] w-full">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-[8px] py-[12px] border-2 border-[#56C490] text-[#56C490] font-['Nunito',sans-serif] text-[14px] rounded-[50px] transition-all active:scale-95"
                  >
                    <FileText className="w-[18px] h-[18px]" />
                    Browse
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-[8px] py-[12px] bg-[#56C490] text-white font-['Nunito',sans-serif] text-[14px] rounded-[50px] transition-all active:scale-95 shadow-[0_2px_8px_rgba(86,196,144,0.25)]"
                  >
                    <Camera className="w-[18px] h-[18px]" />
                    Scan
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-[#56C490] rounded-[16px] p-[16px] flex items-center gap-[12px] bg-[#56C490]/5">
                <div className="w-[44px] h-[44px] bg-[#56C490]/10 rounded-[10px] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-[22px] h-[22px] text-[#56C490]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] truncate">
                    {uploadedFile.name}
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[12px] text-[#666]">
                    {uploadedFile.size}
                  </p>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="w-[32px] h-[32px] bg-[#ff4444]/10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                >
                  <X className="w-[16px] h-[16px] text-[#ff4444]" />
                </button>
              </div>
            )}

            {uploadError && (
              <p className="font-['Nunito',sans-serif] text-[11px] text-[#ff4444] mt-[8px]">
                {uploadError}
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Sticky Footer Button */}
      <StickyFooterButton
        label="Next Step"
        onClick={handleContinue}
        disabled={!isFormValid}
      />
    </div>
  );
}