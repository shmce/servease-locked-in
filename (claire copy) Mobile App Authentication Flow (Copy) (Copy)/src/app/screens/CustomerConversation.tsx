import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Flag,
  X,
  Phone,
  Video,
} from "lucide-react";

interface Message {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export default function CustomerConversation() {
  const navigate = useNavigate();
  const { providerId } = useParams();
  const [messageText, setMessageText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");

  // Mock provider data - mapped by ID
  const providersData: Record<number, { name: string; photo: string; isOnline: boolean; service: string; messages: Message[] }> = {
    101: {
      name: "Maria Santos",
      photo: "https://i.pravatar.cc/150?img=5",
      isOnline: true,
      service: "House Cleaning",
      messages: [
        {
          id: 1,
          senderId: 101,
          text: "Hi! Thank you for booking my service.",
          timestamp: "10:15 AM",
          isMe: false,
        },
        {
          id: 2,
          senderId: 1,
          text: "Hello! What time can you come today?",
          timestamp: "10:20 AM",
          isMe: true,
        },
        {
          id: 3,
          senderId: 101,
          text: "I can be there at 2:00 PM. Is that okay?",
          timestamp: "10:25 AM",
          isMe: false,
        },
        {
          id: 4,
          senderId: 1,
          text: "Perfect! See you then.",
          timestamp: "10:28 AM",
          isMe: true,
        },
        {
          id: 5,
          senderId: 101,
          text: "I'll be there at 2:00 PM today. See you!",
          timestamp: "10:30 AM",
          isMe: false,
        },
      ],
    },
    102: {
      name: "Juan Dela Cruz",
      photo: "https://i.pravatar.cc/150?img=12",
      isOnline: false,
      service: "Plumbing",
      messages: [
        {
          id: 1,
          senderId: 102,
          text: "Hello! I've completed the plumbing work.",
          timestamp: "Yesterday",
          isMe: false,
        },
        {
          id: 2,
          senderId: 1,
          text: "Great! Thank you so much!",
          timestamp: "Yesterday",
          isMe: true,
        },
        {
          id: 3,
          senderId: 102,
          text: "The plumbing work is complete. Thank you!",
          timestamp: "Yesterday",
          isMe: false,
        },
      ],
    },
    103: {
      name: "Ana Reyes",
      photo: "https://i.pravatar.cc/150?img=9",
      isOnline: true,
      service: "Electrical Work",
      messages: [
        {
          id: 1,
          senderId: 103,
          text: "Hi! I need to reschedule our appointment.",
          timestamp: "Yesterday",
          isMe: false,
        },
        {
          id: 2,
          senderId: 1,
          text: "Sure, what time works for you?",
          timestamp: "Yesterday",
          isMe: true,
        },
        {
          id: 3,
          senderId: 103,
          text: "Can we reschedule to tomorrow?",
          timestamp: "Yesterday",
          isMe: false,
        },
      ],
    },
    104: {
      name: "Carlos Mendoza",
      photo: "https://i.pravatar.cc/150?img=13",
      isOnline: false,
      service: "Aircon Repair",
      messages: [
        {
          id: 1,
          senderId: 104,
          text: "I've finished servicing your aircon.",
          timestamp: "Mar 10",
          isMe: false,
        },
        {
          id: 2,
          senderId: 1,
          text: "Perfect! How much do I owe you?",
          timestamp: "Mar 10",
          isMe: true,
        },
        {
          id: 3,
          senderId: 104,
          text: "Your aircon is now working perfectly!",
          timestamp: "Mar 10",
          isMe: false,
        },
      ],
    },
    105: {
      name: "Sofia Garcia",
      photo: "https://i.pravatar.cc/150?img=10",
      isOnline: false,
      service: "Carpentry",
      messages: [
        {
          id: 1,
          senderId: 105,
          text: "Good morning! I'm heading to your location now.",
          timestamp: "Mar 9",
          isMe: false,
        },
        {
          id: 2,
          senderId: 1,
          text: "Thanks for the update!",
          timestamp: "Mar 9",
          isMe: true,
        },
        {
          id: 3,
          senderId: 105,
          text: "I'm on my way to your location.",
          timestamp: "Mar 9",
          isMe: false,
        },
      ],
    },
  };

  const currentProviderId = parseInt(providerId || "101");
  const providerData = providersData[currentProviderId] || providersData[101];
  
  const provider = {
    id: currentProviderId,
    name: providerData.name,
    photo: providerData.photo,
    isOnline: providerData.isOnline,
    service: providerData.service,
  };

  // Mock messages
  const [messages, setMessages] = useState<Message[]>(providerData.messages);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        senderId: 1,
        text: messageText,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        isMe: true,
      };
      setMessages([...messages, newMessage]);
      setMessageText("");
    }
  };

  const handleReport = () => {
    if (reportReason) {
      alert(`Report submitted: ${reportReason}`);
      setShowReportModal(false);
      setReportReason("");
    }
  };

  const reportReasons = [
    "Inappropriate behavior",
    "Spam or scam",
    "Harassment",
    "No-show without notice",
    "Poor service quality",
    "Other",
  ];

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] py-[12px] border-b border-[#E5E7EB] flex-shrink-0">
        <div className="flex items-center gap-[12px]">
          <button
            onClick={() => navigate(-1)}
            className="w-[40px] h-[40px] rounded-full flex items-center justify-center -ml-[8px] transition-all active:scale-90"
          >
            <ArrowLeft className="w-[22px] h-[22px] text-[#111827]" />
          </button>

          {/* Provider Info */}
          <div className="flex-1 flex items-center gap-[12px] min-w-0">
            <div className="relative">
              <img
                src={provider.photo}
                alt={provider.name}
                className="w-[44px] h-[44px] rounded-full object-cover"
              />
              {provider.isOnline && (
                <div className="absolute bottom-[0px] right-[0px] w-[12px] h-[12px] bg-[#56C490] rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[#111827] text-[16px] font-semibold truncate">
                {provider.name}
              </h2>
              <p className="text-[#6B7280] text-[13px] truncate">
                {provider.service}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-[4px]">
            <button className="w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all active:scale-90 hover:bg-[#F3F4F6]">
              <Phone className="w-[20px] h-[20px] text-[#56C490]" />
            </button>
            <button className="w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all active:scale-90 hover:bg-[#F3F4F6]">
              <Video className="w-[20px] h-[20px] text-[#56C490]" />
            </button>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all active:scale-90 hover:bg-[#F3F4F6] relative"
            >
              <MoreVertical className="w-[20px] h-[20px] text-[#111827]" />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-[24px] top-[68px] bg-white rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.15)] z-50 overflow-hidden min-w-[180px]">
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate(`/customer/provider/${provider.id}`);
                }}
                className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#111827] hover:bg-[#F9FAFB] transition-all active:bg-[#F3F4F6]"
              >
                View Profile
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowReportModal(true);
                }}
                className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#DC2626] hover:bg-[#FEE2E2] transition-all active:bg-[#FECACA] flex items-center gap-[8px]"
              >
                <Flag className="w-[16px] h-[16px]" />
                Report Profile
              </button>
            </div>
          </>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-[24px] py-[16px] bg-[#F5F7FA]">
        <div className="space-y-[12px]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] ${
                  message.isMe
                    ? "bg-[#56C490] text-white"
                    : "bg-white text-[#111827]"
                } px-[14px] py-[10px] rounded-[16px] ${
                  message.isMe
                    ? "rounded-br-[4px]"
                    : "rounded-bl-[4px]"
                } shadow-sm`}
              >
                <p className="text-[14px] leading-[1.5] break-words">
                  {message.text}
                </p>
                <p
                  className={`text-[11px] mt-[4px] ${
                    message.isMe ? "text-white/80" : "text-[#9CA3AF]"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white px-[24px] py-[12px] border-t border-[#E5E7EB] flex-shrink-0">
        <div className="flex items-end gap-[12px]">
          <input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            className="flex-1 px-[16px] py-[10px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[20px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all active:scale-90 ${
              messageText.trim()
                ? "bg-[#56C490] shadow-[0_2px_8px_rgba(86,196,144,0.25)]"
                : "bg-[#E5E7EB]"
            }`}
          >
            <Send
              className={`w-[20px] h-[20px] ${
                messageText.trim() ? "text-white" : "text-[#9CA3AF]"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-[24px]">
          <div className="bg-white rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-full max-w-[400px] max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-[24px] py-[16px] border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-[#111827] text-[18px] font-semibold">
                Report Profile
              </h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                }}
                className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all active:scale-90 hover:bg-[#F3F4F6]"
              >
                <X className="w-[20px] h-[20px] text-[#6B7280]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-[24px] py-[20px] max-h-[50vh] overflow-y-auto">
              <p className="text-[#6B7280] text-[14px] mb-[16px]">
                Help us understand what's happening. Your report is anonymous.
              </p>

              <div className="space-y-[8px]">
                {reportReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setReportReason(reason)}
                    className={`w-full px-[16px] py-[12px] rounded-[10px] text-left text-[14px] transition-all ${
                      reportReason === reason
                        ? "bg-[#56C490] text-white"
                        : "bg-[#F9FAFB] text-[#111827] hover:bg-[#F3F4F6]"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              {reportReason === "Other" && (
                <textarea
                  placeholder="Please provide more details..."
                  className="w-full mt-[12px] px-[14px] py-[10px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20 resize-none"
                  rows={3}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-[24px] py-[16px] border-t border-[#E5E7EB] flex gap-[12px]">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                }}
                className="flex-1 bg-white border-2 border-[#E5E7EB] text-[#111827] font-semibold text-[14px] py-[12px] rounded-[10px] transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason}
                className={`flex-1 font-semibold text-[14px] py-[12px] rounded-[10px] transition-all active:scale-95 ${
                  reportReason
                    ? "bg-[#DC2626] text-white shadow-[0_2px_8px_rgba(220,38,38,0.2)]"
                    : "bg-[#E5E7EB] text-[#9CA3AF]"
                }`}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}