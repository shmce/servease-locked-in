import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Camera, Clock, Upload, X } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

interface BeforePhoto {
  id: number;
  url: string;
  caption: string;
}

export default function ProviderStartService() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [checklist, setChecklist] = useState({
    scopeConfirmed: false,
    toolsReady: false,
    instructionsReviewed: false
  });

  const [beforePhotos, setBeforePhotos] = useState<BeforePhoto[]>([]);
  const [photoCaption, setPhotoCaption] = useState("");

  const customer = {
    name: "Juan Dela Cruz",
    photo: "https://i.pravatar.cc/150?img=12",
    serviceType: "Plumbing Repair"
  };

  const handleChecklistChange = (field: keyof typeof checklist) => {
    setChecklist(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleAddPhoto = () => {
    // Mock photo upload
    const newPhoto: BeforePhoto = {
      id: Date.now(),
      url: `https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&t=${Date.now()}`,
      caption: photoCaption
    };
    setBeforePhotos([...beforePhotos, newPhoto]);
    setPhotoCaption("");
  };

  const handleRemovePhoto = (photoId: number) => {
    setBeforePhotos(beforePhotos.filter(photo => photo.id !== photoId));
  };

  const allChecklistComplete = checklist.scopeConfirmed && checklist.toolsReady && checklist.instructionsReviewed;

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
            Start Service
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px]">
        {/* Heading */}
        <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] mt-[24px] mb-[20px]">
          Ready to Start Service?
        </h1>

        {/* Customer Info Card */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[24px]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[12px]">
            Customer
          </p>
          <div className="flex items-center gap-[12px]">
            <img
              src={customer.photo}
              alt={customer.name}
              className="w-[56px] h-[56px] rounded-full object-cover border-2 border-[#f5f5f5]"
            />
            <div className="flex-1">
              <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#1a1a1a] mb-[2px]">
                {customer.name}
              </h3>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                {customer.serviceType}
              </p>
            </div>
          </div>
        </div>

        {/* Service Checklist */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[24px]">
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[16px]">
            Service Checklist
          </p>
          
          <div className="space-y-[12px]">
            <label className="flex items-start gap-[12px] cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.scopeConfirmed}
                onChange={() => handleChecklistChange('scopeConfirmed')}
                className="w-[20px] h-[20px] rounded-[6px] border-2 border-[#56C490] bg-white text-[#56C490] focus:ring-2 focus:ring-[#56C490] focus:ring-offset-0 mt-[2px] cursor-pointer accent-[#56C490]"
              />
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151] flex-1">
                Service scope confirmed with customer
              </span>
            </label>

            <label className="flex items-start gap-[12px] cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.toolsReady}
                onChange={() => handleChecklistChange('toolsReady')}
                className="w-[20px] h-[20px] rounded-[6px] border-2 border-[#56C490] bg-white text-[#56C490] focus:ring-2 focus:ring-[#56C490] focus:ring-offset-0 mt-[2px] cursor-pointer accent-[#56C490]"
              />
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151] flex-1">
                All necessary tools and materials ready
              </span>
            </label>

            <label className="flex items-start gap-[12px] cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.instructionsReviewed}
                onChange={() => handleChecklistChange('instructionsReviewed')}
                className="w-[20px] h-[20px] rounded-[6px] border-2 border-[#56C490] bg-white text-[#56C490] focus:ring-2 focus:ring-[#56C490] focus:ring-offset-0 mt-[2px] cursor-pointer accent-[#56C490]"
              />
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151] flex-1">
                Special instructions reviewed
              </span>
            </label>
          </div>
        </div>

        {/* Take Before Photos */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[24px]">
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[12px]">
            Take Before Photos
          </p>

          {/* Existing Photos */}
          {beforePhotos.length > 0 && (
            <div className="space-y-[12px] mb-[12px]">
              {beforePhotos.map((photo) => (
                <div key={photo.id} className="relative border border-[#e5e5e5] rounded-[12px] overflow-hidden">
                  <img
                    src={photo.url}
                    alt="Before photo"
                    className="w-full h-[150px] object-cover"
                  />
                  {photo.caption && (
                    <div className="p-[8px] bg-white border-t border-[#e5e5e5]">
                      <p className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
                        {photo.caption}
                      </p>
                    </div>
                  )}
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
              placeholder="Add caption (optional)"
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
              className="w-full px-[12px] py-[10px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-[10px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF]"
            />
            <button
              onClick={handleAddPhoto}
              className="w-full bg-white border-2 border-[#56C490] text-[#56C490] font-['Nunito',sans-serif] text-[14px] py-[12px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[8px]"
            >
              <Camera className="w-[18px] h-[18px]" />
              Upload Photo
            </button>
          </div>
        </div>

        {/* Service Timer Display */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[20px] mb-[24px] text-center bg-[#f9fafb]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[8px]">
            Service Timer
          </p>
          <div className="flex items-center justify-center gap-[8px] mb-[8px]">
            <Clock className="w-[32px] h-[32px] text-[#6B7280]" />
            <p className="font-['Nunito',sans-serif] text-[48px] text-[#111827] leading-none">
              00:00:00
            </p>
          </div>
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
            Ready to start
          </p>
        </div>

        {/* Start Button - Spacer for fixed button */}
        <div className="h-[80px]" />
      </div>

      {/* Fixed Bottom Button */}
      <div className="px-[24px] py-[16px] bg-white border-t border-[#f2f2f2] flex-shrink-0">
        <button
          onClick={() => navigate(`/provider/service-in-progress/${id}`)}
          disabled={!allChecklistComplete}
          className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-[8px]"
        >
          <Clock className="w-[20px] h-[20px]" />
          Start Service Timer
        </button>
      </div>

      {/* Home Indicator — iOS Safe Area */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}