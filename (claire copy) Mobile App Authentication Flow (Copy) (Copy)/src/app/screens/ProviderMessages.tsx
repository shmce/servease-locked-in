import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Send } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

interface Message {
  id: number;
  sender: "provider" | "customer";
  text: string;
  timestamp: string;
}

export default function ProviderMessages() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "customer",
      text: "Hi! I have some questions about the plumbing repair.",
      timestamp: "10:30 AM"
    },
    {
      id: 2,
      sender: "provider",
      text: "Hello! Sure, I'd be happy to help. What would you like to know?",
      timestamp: "10:32 AM"
    },
    {
      id: 3,
      sender: "customer",
      text: "Will you need to shut off the water main?",
      timestamp: "10:35 AM"
    },
    {
      id: 4,
      sender: "provider",
      text: "Yes, I'll need to shut it off temporarily while I work on the pipe. It should only be for about 30 minutes.",
      timestamp: "10:37 AM"
    },
    {
      id: 5,
      sender: "customer",
      text: "Okay, that sounds good. See you tomorrow!",
      timestamp: "10:40 AM"
    }
  ]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: "provider",
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setMessageText("");
    }
  };

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
            Messages
          </h2>
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
            Booking #{id}
          </p>
        </div>
      </div>

      {/* Scrollable Chat Thread */}
      <div className="flex-1 overflow-y-auto px-[24px] py-[20px]">
        <div className="space-y-[16px]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "provider" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-[16px] px-[16px] py-[12px] ${
                  message.sender === "provider"
                    ? "bg-[#56C490] text-white rounded-br-[4px]"
                    : "bg-[#f5f5f5] text-[#1a1a1a] rounded-bl-[4px]"
                }`}
              >
                <p className="font-['Nunito',sans-serif] text-[14px] mb-[4px]">
                  {message.text}
                </p>
                <p
                  className={`font-['Nunito',sans-serif] text-[11px] ${
                    message.sender === "provider" ? "text-white/70" : "text-[#9CA3AF]"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Input */}
      <div className="px-[24px] py-[16px] bg-white border-t border-[#f2f2f2] flex-shrink-0">
        <div className="flex items-center gap-[12px]">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-[16px] py-[12px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-[24px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF]"
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="w-[48px] h-[48px] bg-[#56C490] rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 disabled:active:scale-100 shadow-[0_4px_12px_rgba(86,196,144,0.25)]"
          >
            <Send className="w-[20px] h-[20px] text-white" />
          </button>
        </div>
      </div>

      {/* Home Indicator — iOS Safe Area */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}
