import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { ArrowLeft, Camera, Clock, X, CheckCircle, CreditCard, Banknote } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

interface Photo {
  id: number;
  url: string;
  caption: string;
  type: "after";
}

export default function ProviderCompleteService() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  // Get elapsed seconds from navigation state
  const elapsedSeconds = (location.state as { elapsedSeconds?: number })?.elapsedSeconds || 0;
  
  // Format elapsed seconds to human-readable duration
  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };
  
  const serviceDuration = formatDuration(elapsedSeconds);
  const serviceDurationDisplay = elapsedSeconds > 0 ? serviceDuration : "0m";

  const [afterPhotos, setAfterPhotos] = useState<Photo[]>([]);
  const [photoCaption, setPhotoCaption] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"digital" | "cash">("digital");

  const [qualityChecklist, setQualityChecklist] = useState({
    workCompleted: false,
    customerSatisfied: false,
    areaCleaned: false,
    toolsRemoved: false
  });

  const estimatedDuration = "2 hours";
  const basePrice = 2500;
  const additionalCharges = 500;
  const totalPrice = basePrice + additionalCharges;

  const handleAddPhoto = () => {
    if (photoCaption.trim()) {
      const newPhoto: Photo = {
        id: Date.now(),
        url: `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&t=${Date.now()}`,
        caption: photoCaption,
        type: "after"
      };
      setAfterPhotos([...afterPhotos, newPhoto]);
      setPhotoCaption("");
    }
  };

  const handleRemovePhoto = (photoId: number) => {
    setAfterPhotos(afterPhotos.filter(photo => photo.id !== photoId));
  };

  const handleChecklistChange = (field: keyof typeof qualityChecklist) => {
    setQualityChecklist(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const allChecklistComplete = 
    qualityChecklist.workCompleted && 
    qualityChecklist.customerSatisfied && 
    qualityChecklist.areaCleaned && 
    qualityChecklist.toolsRemoved;

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
            Complete Service
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px]">
        {/* Heading */}
        <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] mt-[24px] mb-[20px]">
          Service Completed?
        </h1>

        {/* Total Service Duration */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[20px] bg-[#f9fafb]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[8px]">
            Total Service Duration
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[8px]">
              <Clock className="w-[20px] h-[20px] text-[#56C490]" />
              <p className="font-['Nunito',sans-serif] text-[24px] text-[#111827]">
                {serviceDurationDisplay}
              </p>
            </div>
            <div className="text-right">
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
                Estimated: {estimatedDuration}
              </p>
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#F59E0B]">
                45m over estimate
              </p>
            </div>
          </div>
        </div>

        {/* Take After Photos */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[20px]">
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[12px]">
            Take After Photos
          </p>

          {/* Existing Photos */}
          {afterPhotos.length > 0 && (
            <div className="space-y-[12px] mb-[12px]">
              {afterPhotos.map((photo) => (
                <div key={photo.id} className="relative border border-[#e5e5e5] rounded-[12px] overflow-hidden">
                  <img
                    src={photo.url}
                    alt="After photo"
                    className="w-full h-[150px] object-cover"
                  />
                  <div className="p-[8px] bg-white border-t border-[#e5e5e5]">
                    <p className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
                      {photo.caption}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-[8px] right-[8px] w-[28px] h-[28px] bg-white/90 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90"
                  >
                    <X className="w-[16px] h-[16px] text-[#EF4444]" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Section */}
          <div className="space-y-[8px]">
            <input
              type="text"
              placeholder="Add caption for photo"
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
              className="w-full px-[12px] py-[10px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-[10px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF]"
            />
            <button
              onClick={handleAddPhoto}
              disabled={!photoCaption.trim()}
              className="w-full bg-white border-2 border-[#56C490] text-[#56C490] font-['Nunito',sans-serif] text-[14px] py-[12px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[8px] disabled:opacity-40 disabled:active:scale-100"
            >
              <Camera className="w-[18px] h-[18px]" />
              Upload Photo
            </button>
          </div>
        </div>

        {/* Service Completion Notes */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[20px]">
          <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
            Service Completion Notes
          </label>
          <textarea
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Describe what was done, any issues encountered, recommendations..."
            rows={4}
            className="w-full px-[12px] py-[10px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-[10px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] resize-none"
          />
        </div>

        {/* Quality Checklist */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[20px]">
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[16px]">
            Quality Checklist <span className="text-[#EF4444]">*</span>
          </p>
          
          <div className="space-y-[12px]">
            <label className="flex items-start gap-[12px] cursor-pointer">
              <input
                type="checkbox"
                checked={qualityChecklist.workCompleted}
                onChange={() => handleChecklistChange('workCompleted')}
                className="w-[20px] h-[20px] rounded-[6px] border-2 border-[#56C490] bg-white text-[#56C490] focus:ring-2 focus:ring-[#56C490] focus:ring-offset-0 mt-[2px] cursor-pointer accent-[#56C490]"
              />
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151] flex-1">
                Work completed as agreed
              </span>
            </label>

            <label className="flex items-start gap-[12px] cursor-pointer">
              <input
                type="checkbox"
                checked={qualityChecklist.customerSatisfied}
                onChange={() => handleChecklistChange('customerSatisfied')}
                className="w-[20px] h-[20px] rounded-[6px] border-2 border-[#56C490] bg-white text-[#56C490] focus:ring-2 focus:ring-[#56C490] focus:ring-offset-0 mt-[2px] cursor-pointer accent-[#56C490]"
              />
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151] flex-1">
                Customer satisfied
              </span>
            </label>

            <label className="flex items-start gap-[12px] cursor-pointer">
              <input
                type="checkbox"
                checked={qualityChecklist.areaCleaned}
                onChange={() => handleChecklistChange('areaCleaned')}
                className="w-[20px] h-[20px] rounded-[6px] border-2 border-[#56C490] bg-white text-[#56C490] focus:ring-2 focus:ring-[#56C490] focus:ring-offset-0 mt-[2px] cursor-pointer accent-[#56C490]"
              />
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151] flex-1">
                Area cleaned up
              </span>
            </label>

            <label className="flex items-start gap-[12px] cursor-pointer">
              <input
                type="checkbox"
                checked={qualityChecklist.toolsRemoved}
                onChange={() => handleChecklistChange('toolsRemoved')}
                className="w-[20px] h-[20px] rounded-[6px] border-2 border-[#56C490] bg-white text-[#56C490] focus:ring-2 focus:ring-[#56C490] focus:ring-offset-0 mt-[2px] cursor-pointer accent-[#56C490]"
              />
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151] flex-1">
                Tools/materials removed
              </span>
            </label>
          </div>
        </div>

        {/* Final Price Confirmation */}
        <div className="border-2 border-[#56C490] rounded-[16px] p-[16px] mb-[20px] bg-[#56C490]/5">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[12px]">
            Final Price Confirmation
          </p>

          <div className="space-y-[8px]">
            <div className="flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                Base Price
              </p>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                ₱{basePrice.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                Additional Charges
              </p>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
                +₱{additionalCharges.toLocaleString()}
              </p>
            </div>

            <div className="border-t border-[#e5e5e5] pt-[8px]">
              <div className="flex items-center justify-between">
                <p className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
                  Total
                </p>
                <p className="font-['Nunito',sans-serif] text-[18px] text-[#56C490]">
                  ₱{totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Collection Selector */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[24px]">
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[12px]">
            Payment Collection <span className="text-[#EF4444]">*</span>
          </p>

          <div className="space-y-[8px]">
            <label className="flex items-center gap-[12px] cursor-pointer border-2 border-[#e5e5e5] rounded-[12px] p-[12px] transition-all"
              style={{
                borderColor: paymentMethod === "digital" ? "#56C490" : "#e5e5e5",
                backgroundColor: paymentMethod === "digital" ? "#56C490/5" : "transparent"
              }}
            >
              <input
                type="radio"
                name="payment"
                value="digital"
                checked={paymentMethod === "digital"}
                onChange={() => setPaymentMethod("digital")}
                className="w-[18px] h-[18px] text-[#56C490] focus:ring-[#56C490] cursor-pointer"
              />
              <CreditCard className="w-[20px] h-[20px] text-[#56C490]" />
              <div className="flex-1">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                  Digital (auto-charged)
                </p>
                <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
                  Automatically charged to customer
                </p>
              </div>
            </label>

            <label className="flex items-center gap-[12px] cursor-pointer border-2 border-[#e5e5e5] rounded-[12px] p-[12px] transition-all"
              style={{
                borderColor: paymentMethod === "cash" ? "#56C490" : "#e5e5e5",
                backgroundColor: paymentMethod === "cash" ? "#56C490/5" : "transparent"
              }}
            >
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
                className="w-[18px] h-[18px] text-[#56C490] focus:ring-[#56C490] cursor-pointer"
              />
              <Banknote className="w-[20px] h-[20px] text-[#56C490]" />
              <div className="flex-1">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                  Cash (confirm amount received)
                </p>
                <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
                  Confirm you received cash payment
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Spacer for fixed button */}
        <div className="h-[80px]" />
      </div>

      {/* Fixed Bottom Button */}
      <div className="px-[24px] py-[16px] bg-white border-t border-[#f2f2f2] flex-shrink-0">
        <button
          onClick={() => navigate(`/provider/service-completed/${id}`)}
          disabled={!allChecklistComplete || afterPhotos.length === 0}
          className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-[8px]"
        >
          <CheckCircle className="w-[20px] h-[20px]" />
          Mark as Complete
        </button>
      </div>

      {/* Home Indicator — iOS Safe Area */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}