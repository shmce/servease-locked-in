import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Send, Paperclip, MoreVertical } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

// Mock conversation data
const conversationsData: Record<string, any> = {
  "john-smith": {
    id: 1,
    name: "John Smith",
    avatar: "JS",
    messages: [
      { id: 1, text: "Hi! I need help with cleaning my house.", sender: "customer", time: "10:30 AM" },
      { id: 2, text: "Hello! I'd be happy to help. When would you like to schedule the service?", sender: "provider", time: "10:32 AM" },
      { id: 3, text: "How about tomorrow at 2 PM?", sender: "customer", time: "10:35 AM" },
      { id: 4, text: "That works perfectly! I've confirmed your booking for tomorrow at 2:00 PM.", sender: "provider", time: "10:36 AM" },
      { id: 5, text: "Great! What should I prepare?", sender: "customer", time: "10:40 AM" },
      { id: 6, text: "Just make sure the area is accessible. I'll bring all the cleaning supplies.", sender: "provider", time: "10:42 AM" },
      { id: 7, text: "Hi! What time will you arrive today?", sender: "customer", time: "2:05 PM" },
    ],
  },
  "sarah-johnson": {
    id: 2,
    name: "Sarah Johnson",
    avatar: "SJ",
    messages: [
      { id: 1, text: "I need plumbing service ASAP!", sender: "customer", time: "9:00 AM" },
      { id: 2, text: "I can help you today. What's the issue?", sender: "provider", time: "9:02 AM" },
      { id: 3, text: "My kitchen sink is leaking badly.", sender: "customer", time: "9:05 AM" },
      { id: 4, text: "I can come by at 4:30 PM today. Does that work?", sender: "provider", time: "9:07 AM" },
      { id: 5, text: "Yes, perfect! See you then.", sender: "customer", time: "9:10 AM" },
      { id: 6, text: "Thank you for the great service!", sender: "customer", time: "6:15 PM" },
    ],
  },
  "mike-davis": {
    id: 3,
    name: "Mike Davis",
    avatar: "MD",
    messages: [
      { id: 1, text: "I need electrical work done tomorrow.", sender: "customer", time: "Yesterday" },
      { id: 2, text: "Sure! What kind of electrical work?", sender: "provider", time: "Yesterday" },
      { id: 3, text: "Need to install new outlets in my office.", sender: "customer", time: "Yesterday" },
      { id: 4, text: "I can do that! I'll be there at 10 AM tomorrow.", sender: "provider", time: "Yesterday" },
      { id: 5, text: "Can you bring extra tools?", sender: "customer", time: "8:30 AM" },
    ],
  },
  "anna-reyes": {
    id: 4,
    name: "Anna Reyes",
    avatar: "AR",
    messages: [
      { id: 1, text: "Hi! Can you do carpentry work?", sender: "customer", time: "2 days ago" },
      { id: 2, text: "Yes, I specialize in carpentry. What do you need?", sender: "provider", time: "2 days ago" },
      { id: 3, text: "I need custom shelves built in my bedroom.", sender: "customer", time: "2 days ago" },
      { id: 4, text: "I can do that! When would you like me to start?", sender: "provider", time: "2 days ago" },
      { id: 5, text: "How about tomorrow at 2 PM?", sender: "customer", time: "2 days ago" },
      { id: 6, text: "Perfect! See you tomorrow.", sender: "provider", time: "2 days ago" },
    ],
  },
  "pedro-garcia": {
    id: 5,
    name: "Pedro Garcia",
    avatar: "PG",
    messages: [
      { id: 1, text: "I need my house painted.", sender: "customer", time: "3 days ago" },
      { id: 2, text: "I can help with that! How many rooms?", sender: "provider", time: "3 days ago" },
      { id: 3, text: "3 bedrooms and the living room.", sender: "customer", time: "3 days ago" },
      { id: 4, text: "Great! I can start on March 15 at 9 AM.", sender: "provider", time: "3 days ago" },
      { id: 5, text: "How much will the materials cost?", sender: "customer", time: "2 days ago" },
    ],
  },
};

export default function ProviderConversation() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const [messageText, setMessageText] = useState("");

  const conversation = customerId ? conversationsData[customerId] : null;

  if (!conversation) {
    return (
      <div className="bg-[#F5F7FA] w-full h-screen flex items-center justify-center">
        <p className="font-['Nunito',sans-serif] text-[15px] text-[#6B7280]">
          Conversation not found
        </p>
      </div>
    );
  }

  const handleSend = () => {
    if (messageText.trim()) {
      // In a real app, send the message to the backend
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  return (
    <div className="bg-[#F5F7FA] w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-[24px] py-[16px] flex items-center gap-[16px] flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-[32px] h-[32px] flex items-center justify-center transition-all active:scale-90"
        >
          <ArrowLeft className="w-[24px] h-[24px] text-[#111827]" />
        </button>

        <div className="w-[40px] h-[40px] rounded-full bg-[#56C490]/10 flex items-center justify-center flex-shrink-0">
          <p className="font-['Nunito',sans-serif] text-[16px] text-[#56C490]">
            {conversation.avatar}
          </p>
        </div>

        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
            {conversation.name}
          </h2>
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#56C490]">
            Online
          </p>
        </div>

        <button className="w-[32px] h-[32px] flex items-center justify-center transition-all active:scale-90">
          <MoreVertical className="w-[20px] h-[20px] text-[#6B7280]" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-[24px] py-[16px] space-y-[16px]">
        {conversation.messages.map((message: any) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "provider" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] ${
                message.sender === "provider"
                  ? "bg-[#56C490] rounded-[16px] rounded-tr-[4px]"
                  : "bg-white rounded-[16px] rounded-tl-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
              } px-[16px] py-[12px]`}
            >
              <p
                className={`font-['Nunito',sans-serif] text-[14px] ${
                  message.sender === "provider" ? "text-white" : "text-[#111827]"
                } mb-[4px]`}
              >
                {message.text}
              </p>
              <p
                className={`font-['Nunito',sans-serif] text-[10px] ${
                  message.sender === "provider" ? "text-white/70" : "text-[#9CA3AF]"
                } text-right`}
              >
                {message.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-[#E5E7EB] px-[24px] py-[16px] flex items-center gap-[12px] flex-shrink-0">
        <button className="w-[40px] h-[40px] flex items-center justify-center transition-all active:scale-90">
          <Paperclip className="w-[20px] h-[20px] text-[#6B7280]" />
        </button>

        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 h-[44px] bg-[#F3F4F6] rounded-[22px] px-[20px] font-['Nunito',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] border-none outline-none focus:ring-2 focus:ring-[#56C490]/20"
        />

        <button
          onClick={handleSend}
          disabled={!messageText.trim()}
          className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all active:scale-90 ${
            messageText.trim()
              ? "bg-[#56C490] text-white"
              : "bg-[#E5E7EB] text-[#9CA3AF]"
          }`}
        >
          <Send className="w-[20px] h-[20px]" />
        </button>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}
