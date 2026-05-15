import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, Camera, Upload, X, Plus, Send, Image as ImageIcon } from "lucide-react";

interface UploadedPhoto {
  id: string;
  url: string;
  caption: string;
  uploading: boolean;
  progress: number;
}

export default function ProviderProgressPhotoUpload() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, source: 'camera' | 'gallery') => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos: UploadedPhoto[] = Array.from(files).map((file, index) => ({
      id: `photo-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      caption: "",
      uploading: true,
      progress: 0,
    }));

    setPhotos(prev => [...prev, ...newPhotos]);

    // Simulate upload progress for each photo
    newPhotos.forEach((photo, index) => {
      simulateUpload(photo.id);
    });
  };

  // Simulate upload progress
  const simulateUpload = (photoId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setPhotos(prev => prev.map(p => 
          p.id === photoId ? { ...p, uploading: false, progress: 100 } : p
        ));
      } else {
        setPhotos(prev => prev.map(p => 
          p.id === photoId ? { ...p, progress } : p
        ));
      }
    }, 200);
  };

  // Update caption for a photo
  const updateCaption = (photoId: string, caption: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId ? { ...p, caption } : p
    ));
  };

  // Delete a photo
  const deletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  // Submit all photos
  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      navigate(-1);
      // In a real app, you'd show a success message
    }, 1500);
  };

  const hasPhotos = photos.length > 0;
  const allPhotosUploaded = photos.every(p => !p.uploading);

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
            Upload Progress Photos
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px]">
        {/* Upload Instructions */}
        <div className="mt-[20px] mb-[24px]">
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-relaxed">
            Share progress photos with your customer to build trust and keep them updated on your work.
          </p>
        </div>

        {/* Upload Options - Only show if no photos */}
        {!hasPhotos && (
          <div className="space-y-[12px] mb-[24px]">
            {/* Camera Button */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full bg-gradient-to-r from-[#56C490] to-[#00a355] text-white font-['Nunito',sans-serif] text-[15px] py-[16px] rounded-[16px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] flex items-center justify-center gap-[10px]"
            >
              <Camera className="w-[22px] h-[22px]" />
              Take Photo with Camera
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => handleFileSelect(e, 'camera')}
              className="hidden"
            />

            {/* Gallery Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-white border-2 border-[#56C490] text-[#56C490] font-['Nunito',sans-serif] text-[15px] py-[16px] rounded-[16px] transition-all active:scale-95 flex items-center justify-center gap-[10px]"
            >
              <Upload className="w-[22px] h-[22px]" />
              Choose from Gallery
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e, 'gallery')}
              className="hidden"
            />
          </div>
        )}

        {/* Empty State */}
        {!hasPhotos && (
          <div className="border-2 border-dashed border-[#e5e5e5] rounded-[16px] p-[40px] text-center">
            <div className="w-[64px] h-[64px] bg-[#f5f5f5] rounded-full flex items-center justify-center mx-auto mb-[16px]">
              <ImageIcon className="w-[32px] h-[32px] text-[#9CA3AF]" />
            </div>
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[4px]">
              No photos uploaded yet
            </p>
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">
              Start by taking a photo or choosing from gallery
            </p>
          </div>
        )}

        {/* Uploaded Photos Section */}
        {hasPhotos && (
          <>
            <div className="mb-[16px] flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[15px] text-[#111827]">
                Photos ({photos.length})
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-[6px] px-[12px] py-[6px] bg-[#56C490]/10 text-[#56C490] font-['Nunito',sans-serif] text-[13px] rounded-[8px] transition-all active:scale-95"
              >
                <Plus className="w-[16px] h-[16px]" />
                Add More
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e, 'gallery')}
                className="hidden"
              />
            </div>

            {/* Photo Cards */}
            <div className="space-y-[16px] mb-[24px]">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white border-2 border-[#e5e5e5] rounded-[16px] overflow-hidden shadow-sm"
                >
                  {/* Photo Preview */}
                  <div className="relative">
                    <img
                      src={photo.url}
                      alt="Progress"
                      className="w-full h-[200px] object-cover"
                    />
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="absolute top-[12px] right-[12px] w-[32px] h-[32px] bg-[#EF4444] rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90"
                    >
                      <X className="w-[18px] h-[18px] text-white" />
                    </button>

                    {/* Upload Progress Overlay */}
                    {photo.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center mx-auto mb-[8px]">
                            <p className="font-['Nunito',sans-serif] text-[16px] text-[#56C490]">
                              {Math.round(photo.progress)}%
                            </p>
                          </div>
                          <p className="font-['Nunito',sans-serif] text-[12px] text-white">
                            Uploading...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Caption Field */}
                  <div className="p-[16px]">
                    <label className="block mb-[8px]">
                      <span className="font-['Nunito',sans-serif] text-[13px] text-[#374151]">
                        Add Caption (Optional)
                      </span>
                    </label>
                    <textarea
                      value={photo.caption}
                      onChange={(e) => updateCaption(photo.id, e.target.value)}
                      placeholder="Describe what's shown in this photo..."
                      rows={2}
                      disabled={photo.uploading}
                      className="w-full px-[12px] py-[10px] bg-[#f9fafb] border border-[#e5e5e5] rounded-[10px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] resize-none disabled:opacity-50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Tips Section */}
        {hasPhotos && (
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[12px] p-[16px] mb-[24px]">
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#56C490] mb-[8px]">
              💡 Photo Tips
            </p>
            <ul className="space-y-[4px]">
              <li className="font-['Nunito',sans-serif] text-[12px] text-[#374151] leading-relaxed">
                • Take clear, well-lit photos
              </li>
              <li className="font-['Nunito',sans-serif] text-[12px] text-[#374151] leading-relaxed">
                • Show different angles of your work
              </li>
              <li className="font-['Nunito',sans-serif] text-[12px] text-[#374151] leading-relaxed">
                • Include before and after shots when possible
              </li>
            </ul>
          </div>
        )}

        {/* Spacer */}
        <div className="h-[100px]" />
      </div>

      {/* Fixed Bottom Button */}
      {hasPhotos && (
        <div className="px-[24px] py-[16px] bg-white border-t border-[#e5e5e5] flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={!allPhotosUploaded || isSubmitting}
            className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] flex items-center justify-center gap-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-[20px] h-[20px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-[20px] h-[20px]" />
                Submit Update to Customer
              </>
            )}
          </button>
        </div>
      )}

      {/* Home Indicator — iOS Safe Area */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}
