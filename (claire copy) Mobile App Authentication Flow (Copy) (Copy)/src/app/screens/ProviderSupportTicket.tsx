import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ChevronLeft, Send, Paperclip, Home, Calendar, MessageCircle, MoreHorizontal } from "lucide-react";

export default function ProviderSupportTicket() {
  const navigate = useNavigate();
  const [activeTab] = useState("more");
  const [message, setMessage] = useState("");

  const conversation = [
    {
      id: 1,
      sender: "support",
      name: "ServEase Support",
      message: "Hello! Thank you for contacting ServEase support. How can we help you today?",
      time: "10:30 AM",
      avatar: "SS",
    },
    {
      id: 2,
      sender: "user",
      message: "Hi! I'm having issues with receiving payment notifications. I completed a job yesterday but haven't received any confirmation.",
      time: "10:32 AM",
    },
    {
      id: 3,
      sender: "support",
      name: "ServEase Support",
      message: "I understand your concern. Let me look into this for you. Can you provide the booking reference number?",
      time: "10:33 AM",
      avatar: "SS",
    },
    {
      id: 4,
      sender: "user",
      message: "Sure, it's BK-45231",
      time: "10:34 AM",
    },
    {
      id: 5,
      sender: "support",
      name: "ServEase Support",
      message: "Thank you! I've checked your account and I can see the payment was processed successfully. The notification system had a temporary issue yesterday. Your payment of ₱2,325 has been credited to your account.",
      time: "10:36 AM",
      avatar: "SS",
    },
    {
      id: 6,
      sender: "support",
      name: "ServEase Support",
      message: "The notification issue has been resolved. You should now receive all future payment notifications. Is there anything else I can help you with?",
      time: "10:37 AM",
      avatar: "SS",
    },
  ];

  const handleSend = () => {
    if (message.trim()) {
      // In production, this would send the message
      setMessage("");
    }
  };

  return (
    <div className="bg-[#F8F8F8] w-full min-h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#00C16A] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] pt-[16px] pb-[16px] flex items-center gap-[16px] border-b border-[#E5E7EB] flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all active:scale-90"
        >
          <ChevronLeft className="w-[24px] h-[24px] text-[#111827]" />
        </button>
        <div className="flex-1">
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Support Ticket #12849
          </h1>
          <p className="font-['Poppins',sans-serif] text-[12px] text-[#6B7280]">
            Payment Notification Issue
          </p>
        </div>
        <div className="px-[12px] py-[4px] rounded-[6px] bg-[#00C16A]/10">
          <span className="font-['Nunito',sans-serif] text-[11px] text-[#00C16A]">
            Open
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[16px]">
        <div className="pt-[16px]">
          {conversation.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-[12px] ${
                msg.sender === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {msg.sender === "support" && (
                <div className="w-[36px] h-[36px] rounded-full bg-[#00C16A] flex items-center justify-center flex-shrink-0">
                  <span className="font-['Nunito',sans-serif] text-[12px] text-white">
                    {msg.avatar}
                  </span>
                </div>
              )}
              
              <div
                className={`max-w-[75%] ${
                  msg.sender === "user" ? "items-end" : "items-start"
                } flex flex-col gap-[4px]`}
              >
                {msg.sender === "support" && (
                  <p className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280] px-[4px]">
                    {msg.name}
                  </p>
                )}
                <div
                  className={`px-[16px] py-[12px] rounded-[16px] ${
                    msg.sender === "user"
                      ? "bg-[#00C16A] text-white rounded-tr-[4px]"
                      : "bg-white text-[#111827] rounded-tl-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  }`}
                >
                  <p className="font-['Poppins',sans-serif] text-[14px] leading-[1.6]">
                    {msg.message}
                  </p>
                </div>
                <p className="font-['Poppins',sans-serif] text-[11px] text-[#9CA3AF] px-[4px]">
                  {msg.time}
                </p>
              </div>

              {msg.sender === "user" && (
                <div className="w-[36px] h-[36px] rounded-full bg-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                  <span className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
                    JD
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="fixed bottom-[84px] left-0 right-0 bg-white border-t border-[#E5E7EB] px-[24px] py-[12px]">
        <div className="flex gap-[12px] items-end">
          <button className="w-[40px] h-[40px] rounded-full bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
            <Paperclip className="w-[20px] h-[20px] text-[#6B7280]" />
          </button>
          
          <div className="flex-1 bg-[#F3F4F6] rounded-[20px] px-[16px] py-[10px] min-h-[40px] max-h-[100px] overflow-y-auto">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={1}
              className="w-full bg-transparent font-['Poppins',sans-serif] text-[14px] text-[#111827] outline-none resize-none placeholder:text-[#9CA3AF]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`w-[40px] h-[40px] rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              message.trim()
                ? "bg-[#00C16A] active:scale-95"
                : "bg-[#E5E7EB]"
            }`}
          >
            <Send className={`w-[20px] h-[20px] ${
              message.trim() ? "text-white" : "text-[#9CA3AF]"
            }`} />
          </button>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e5e5] flex-shrink-0">
        <div className="flex justify-around items-center px-[24px] pt-[12px]">
          <button
            onClick={() => navigate("/provider/home")}
            className={`flex flex-col items-center gap-[4px] py-[8px] flex-1 transition-all active:scale-90`}
          >
            <Home className={`w-[24px] h-[24px] text-[#5d5d5d]`} />
            <span className={`font-['Nunito',sans-serif] text-[10px] tracking-[-0.2px] text-[#5d5d5d]`}>
              Home
            </span>
          </button>

          <button
            className={`flex flex-col items-center gap-[4px] py-[8px] flex-1 transition-all active:scale-90`}
          >
            <Calendar className={`w-[24px] h-[24px] text-[#5d5d5d]`} />
            <span className={`font-['Nunito',sans-serif] text-[10px] tracking-[-0.2px] text-[#5d5d5d]`}>
              Jobs
            </span>
          </button>

          <button
            className={`flex flex-col items-center gap-[4px] py-[8px] flex-1 transition-all active:scale-90`}
          >
            <MessageCircle className={`w-[24px] h-[24px] text-[#5d5d5d]`} />
            <span className={`font-['Nunito',sans-serif] text-[10px] tracking-[-0.2px] text-[#5d5d5d]`}>
              Messages
            </span>
          </button>

          <button
            onClick={() => navigate("/provider/home", { state: { activeTab: "more" } })}
            className={`flex flex-col items-center gap-[4px] py-[8px] flex-1 transition-all active:scale-90`}
          >
            <MoreHorizontal className={`w-[24px] h-[24px] text-[#00C16A]`} />
            <span className={`font-['Nunito',sans-serif] text-[10px] tracking-[-0.2px] text-[#00C16A]`}>
              More
            </span>
          </button>
        </div>
        
        {/* Home Indicator */}
        <div className="h-[34px] bg-white relative">
          <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
        </div>
      </div>
    </div>
  );
}