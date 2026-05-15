import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, Send, Image as ImageIcon, X, Clock } from "lucide-react";

interface UpdateMessage {
  id: string;
  message: string;
  photo?: string;
  timestamp: Date;
  sender: "provider";
}

export default function ProviderJobUpdateMessage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState("");
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Job details
  const jobDetails = {
    title: "Plumbing Repair",
    reference: "SR-2026-001234",
    customer: "Juan Dela Cruz",
    location: "123 Rizal Street, Makati City",
  };

  // Previous updates (mock data)
  const [previousUpdates, setPreviousUpdates] = useState<UpdateMessage[]>([
    {
      id: "1",
      message: "I've arrived at the location and started inspecting the kitchen sink. The issue seems to be with the pipe connection underneath.",
      timestamp: new Date(2026, 2, 15, 14, 30),
      sender: "provider",
    },
    {
      id: "2",
      message: "Found the problem - the pipe coupling is worn out and needs replacement. I have the parts needed in my kit.",
      photo: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400",
      timestamp: new Date(2026, 2, 15, 15, 0),
      sender: "provider",
    },
  ]);

  const CHARACTER_LIMIT = 500;
  const remainingChars = CHARACTER_LIMIT - message.length;

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

  // Send update
  const handleSendUpdate = () => {
    if (!message.trim() && !attachedPhoto) return;

    setIsSending(true);

    // Simulate sending
    setTimeout(() => {
      const newUpdate: UpdateMessage = {
        id: `${Date.now()}`,
        message: message.trim(),
        photo: attachedPhoto || undefined,
        timestamp: new Date(),
        sender: "provider",
      };

      setPreviousUpdates([...previousUpdates, newUpdate]);
      setMessage("");
      setAttachedPhoto(null);
      setIsSending(false);

      // Scroll to bottom
      setTimeout(() => {
        const messagesContainer = document.getElementById("messages-container");
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    }, 1000);
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return "Today";
    }
    
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

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
            Send Job Update
          </h2>
        </div>
      </div>

      {/* Job Info Header */}
      <div className="px-[24px] py-[16px] bg-gradient-to-br from-[#56C490] to-[#00a355] flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-['Nunito',sans-serif] text-[16px] text-white mb-[4px]">
              {jobDetails.title}
            </p>
            <p className="font-['Nunito',sans-serif] text-[12px] text-white/80 mb-[2px]">
              Ref: {jobDetails.reference}
            </p>
            <p className="font-['Nunito',sans-serif] text-[12px] text-white/80">
              Customer: {jobDetails.customer}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Thread */}
      <div 
        id="messages-container"
        className="flex-1 overflow-y-auto px-[24px] py-[16px] bg-[#f9fafb]"
      >
        {previousUpdates.length === 0 ? (
          <div className="text-center py-[40px]">
            <div className="w-[64px] h-[64px] bg-white rounded-full flex items-center justify-center mx-auto mb-[16px] shadow-sm">
              <Send className="w-[28px] h-[28px] text-[#9CA3AF]" />
            </div>
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[4px]">
              No updates sent yet
            </p>
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">
              Send your first update to keep the customer informed
            </p>
          </div>
        ) : (
          <div className="space-y-[16px]">
            {previousUpdates.map((update, index) => {
              const showDateHeader = index === 0 || 
                formatDate(update.timestamp) !== formatDate(previousUpdates[index - 1].timestamp);

              return (
                <div key={update.id}>
                  {/* Date Header */}
                  {showDateHeader && (
                    <div className="flex items-center justify-center mb-[16px]">
                      <div className="px-[12px] py-[4px] bg-white/80 rounded-[8px] shadow-sm">
                        <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280]">
                          {formatDate(update.timestamp)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[280px]">
                      <div className="bg-[#56C490] rounded-[16px] rounded-tr-[4px] p-[12px] shadow-sm">
                        {/* Photo if attached */}
                        {update.photo && (
                          <img
                            src={update.photo}
                            alt="Update"
                            className="w-full rounded-[8px] mb-[8px]"
                          />
                        )}
                        
                        {/* Message text */}
                        {update.message && (
                          <p className="font-['Nunito',sans-serif] text-[14px] text-white leading-relaxed">
                            {update.message}
                          </p>
                        )}
                      </div>
                      
                      {/* Timestamp */}
                      <div className="flex items-center justify-end gap-[4px] mt-[4px] px-[4px]">
                        <Clock className="w-[12px] h-[12px] text-[#9CA3AF]" />
                        <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF]">
                          {formatTime(update.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Spacer for input area */}
        <div className="h-[20px]" />
      </div>

      {/* Message Input Area */}
      <div className="px-[24px] py-[16px] bg-white border-t border-[#e5e5e5] flex-shrink-0">
        {/* Attached Photo Preview */}
        {attachedPhoto && (
          <div className="mb-[12px] relative inline-block">
            <img
              src={attachedPhoto}
              alt="Attached"
              className="w-[100px] h-[100px] object-cover rounded-[12px] border-2 border-[#e5e5e5]"
            />
            <button
              onClick={removePhoto}
              className="absolute -top-[6px] -right-[6px] w-[24px] h-[24px] bg-[#EF4444] rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90"
            >
              <X className="w-[14px] h-[14px] text-white" />
            </button>
          </div>
        )}

        {/* Input Box */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[12px] mb-[12px] focus-within:border-[#56C490] transition-colors">
          <textarea
            value={message}
            onChange={(e) => {
              if (e.target.value.length <= CHARACTER_LIMIT) {
                setMessage(e.target.value);
              }
            }}
            placeholder="Type your update message to the customer..."
            rows={3}
            className="w-full font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] resize-none outline-none"
          />
          
          {/* Character Count */}
          <div className="flex items-center justify-between mt-[8px] pt-[8px] border-t border-[#f2f2f2]">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-[6px] px-[10px] py-[6px] bg-[#f5f5f5] text-[#6B7280] font-['Nunito',sans-serif] text-[12px] rounded-[8px] transition-all active:scale-95"
            >
              <ImageIcon className="w-[16px] h-[16px]" />
              Attach Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            
            <p className={`font-['Nunito',sans-serif] text-[12px] ${
              remainingChars < 50 ? "text-[#EF4444]" : "text-[#9CA3AF]"
            }`}>
              {remainingChars}/{CHARACTER_LIMIT}
            </p>
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendUpdate}
          disabled={(!message.trim() && !attachedPhoto) || isSending}
          className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[14px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] flex items-center justify-center gap-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <div className="w-[20px] h-[20px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending Update...
            </>
          ) : (
            <>
              <Send className="w-[20px] h-[20px]" />
              Send Update to Customer
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
