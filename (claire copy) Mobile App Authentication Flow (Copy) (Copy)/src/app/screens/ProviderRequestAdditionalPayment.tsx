import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, DollarSign, FileText, Image as ImageIcon, X, Send, AlertCircle, Receipt } from "lucide-react";

export default function ProviderRequestAdditionalPayment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Job details
  const jobDetails = {
    reference: "SR-2026-001234",
    title: "Plumbing Repair",
    customer: "Juan Dela Cruz",
    originalPrice: 2500,
  };

  // Handle photo selection
  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachedPhoto(url);
    }
  };

  // Remove attached photo
  const removePhoto = () => {
    setAttachedPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format currency input
  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    
    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) return;
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) return;
    
    setAmount(numericValue);
  };

  // Send payment request
  const handleSendRequest = () => {
    if (!amount || !reason.trim()) return;

    setIsSending(true);

    // Simulate sending
    setTimeout(() => {
      setIsSending(false);
      navigate(-1);
      // In a real app, you'd show a success message
    }, 1500);
  };

  const additionalAmount = parseFloat(amount) || 0;
  const totalPrice = jobDetails.originalPrice + additionalAmount;
  const canSend = amount && parseFloat(amount) > 0 && reason.trim().length > 0;

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Top Navigation Bar */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0 border-b border-[#e5e5e5]">
        <button
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Request Additional Payment
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px]">
        {/* Job Reference Card */}
        <div className="mt-[20px] mb-[24px] bg-gradient-to-br from-[#56C490] to-[#00a355] rounded-[16px] p-[16px] shadow-[0_4px_12px_rgba(86,196,144,0.2)]">
          <div className="flex items-center gap-[10px] mb-[12px]">
            <Receipt className="w-[20px] h-[20px] text-white" />
            <p className="font-['Nunito',sans-serif] text-[14px] text-white/80">
              Job Reference
            </p>
          </div>
          <p className="font-['Nunito',sans-serif] text-[18px] text-white mb-[4px]">
            {jobDetails.reference}
          </p>
          <p className="font-['Nunito',sans-serif] text-[14px] text-white/90">
            {jobDetails.title}
          </p>
          <p className="font-['Nunito',sans-serif] text-[13px] text-white/80 mt-[4px]">
            Customer: {jobDetails.customer}
          </p>
        </div>

        {/* Info Alert */}
        <div className="mb-[24px] bg-[#eff6ff] border border-[#bfdbfe] rounded-[12px] p-[16px] flex gap-[12px]">
          <AlertCircle className="w-[20px] h-[20px] text-[#3b82f6] flex-shrink-0 mt-[2px]" />
          <div className="flex-1">
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#1e40af] mb-[4px]">
              Additional Payment Request
            </p>
            <p className="font-['Nunito',sans-serif] text-[12px] text-[#3b82f6] leading-relaxed">
              Request additional payment for unexpected costs, extra materials, or additional work required. The customer will review and approve your request.
            </p>
          </div>
        </div>

        {/* Amount Field */}
        <div className="mb-[20px]">
          <label className="block mb-[8px]">
            <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
              Additional Amount <span className="text-[#EF4444]">*</span>
            </span>
          </label>
          <div className="relative">
            <div className="absolute left-[16px] top-1/2 -translate-y-1/2 flex items-center gap-[6px]">
              <DollarSign className="w-[18px] h-[18px] text-[#9CA3AF]" />
              <span className="font-['Nunito',sans-serif] text-[16px] text-[#6B7280]">₱</span>
            </div>
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full pl-[60px] pr-[16px] py-[14px] bg-[#f9fafb] border-2 border-[#e5e5e5] rounded-[12px] font-['Nunito',sans-serif] text-[18px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] transition-colors"
            />
          </div>
          {amount && parseFloat(amount) > 0 && (
            <p className="mt-[6px] font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
              Additional: ₱{parseFloat(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Reason Field */}
        <div className="mb-[20px]">
          <label className="block mb-[8px]">
            <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
              Reason for Additional Payment <span className="text-[#EF4444]">*</span>
            </span>
          </label>
          <div className="relative">
            <div className="absolute left-[16px] top-[16px]">
              <FileText className="w-[18px] h-[18px] text-[#9CA3AF]" />
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why additional payment is needed (e.g., extra parts required, additional work, extended service time)..."
              rows={5}
              className="w-full pl-[50px] pr-[16px] py-[14px] bg-[#f9fafb] border-2 border-[#e5e5e5] rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] resize-none focus:outline-none focus:border-[#56C490] transition-colors"
            />
          </div>
          <p className="mt-[6px] font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
            {reason.length} characters
          </p>
        </div>

        {/* Photo Upload Section */}
        <div className="mb-[24px]">
          <label className="block mb-[8px]">
            <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
              Attach Photo (Optional)
            </span>
          </label>
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280] mb-[12px]">
            Upload a photo to support your request (e.g., damaged parts, extra materials used)
          </p>

          {attachedPhoto ? (
            <div className="relative inline-block">
              <img
                src={attachedPhoto}
                alt="Attached proof"
                className="w-full max-w-[200px] h-[200px] object-cover rounded-[12px] border-2 border-[#e5e5e5]"
              />
              <button
                onClick={removePhoto}
                className="absolute -top-[8px] -right-[8px] w-[32px] h-[32px] bg-[#EF4444] rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90"
              >
                <X className="w-[18px] h-[18px] text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-[#e5e5e5] rounded-[12px] p-[24px] text-center transition-all active:scale-98 hover:border-[#56C490]"
            >
              <div className="w-[56px] h-[56px] bg-[#f5f5f5] rounded-full flex items-center justify-center mx-auto mb-[12px]">
                <ImageIcon className="w-[28px] h-[28px] text-[#9CA3AF]" />
              </div>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[4px]">
                Upload Photo
              </p>
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
                Tap to select image
              </p>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>

        {/* Payment Summary Card */}
        <div className="border-2 border-[#56C490] rounded-[16px] p-[20px] mb-[24px] bg-gradient-to-br from-[#f0fdf4] to-white shadow-sm">
          <div className="flex items-center gap-[8px] mb-[16px]">
            <Receipt className="w-[20px] h-[20px] text-[#56C490]" />
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
              Payment Summary
            </h3>
          </div>

          <div className="space-y-[12px]">
            {/* Original Price */}
            <div className="flex items-center justify-between pb-[12px]">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                Original Service Price
              </p>
              <p className="font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a]">
                ₱{jobDetails.originalPrice.toLocaleString()}
              </p>
            </div>

            {/* Additional Amount */}
            <div className="flex items-center justify-between pb-[12px] border-t border-[#e5e5e5] pt-[12px]">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
                Additional Payment
              </p>
              <p className="font-['Nunito',sans-serif] text-[15px] text-[#56C490]">
                + ₱{additionalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-[12px] border-t-2 border-[#56C490]">
              <p className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
                New Total Price
              </p>
              <p className="font-['Nunito',sans-serif] text-[20px] text-[#56C490]">
                ₱{totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-[#fef3c7] border border-[#fbbf24] rounded-[12px] p-[16px] mb-[24px] flex gap-[12px]">
          <AlertCircle className="w-[20px] h-[20px] text-[#d97706] flex-shrink-0 mt-[2px]" />
          <div className="flex-1">
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#92400e] mb-[4px]">
              Important
            </p>
            <p className="font-['Nunito',sans-serif] text-[12px] text-[#b45309] leading-relaxed">
              The customer must approve this additional payment request before you can proceed. They will receive a notification and can accept or decline.
            </p>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-[100px]" />
      </div>

      {/* Fixed Bottom Button */}
      <div className="px-[24px] py-[16px] bg-white border-t border-[#e5e5e5] flex-shrink-0">
        <button
          onClick={handleSendRequest}
          disabled={!canSend || isSending}
          className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] flex items-center justify-center gap-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <div className="w-[20px] h-[20px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending Request...
            </>
          ) : (
            <>
              <Send className="w-[20px] h-[20px]" />
              Send Payment Request
            </>
          )}
        </button>
      </div>

      {/* Home Indicator — iOS Safe Area */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}
