import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Search, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  serviceProviderName: string;
  serviceType: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  avatar?: string;
}

export default function CustomerMessages() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock messages data
  const messages: Message[] = [
    {
      id: "1",
      serviceProviderName: "Maria Santos",
      serviceType: "House Cleaning",
      lastMessage: "I'll arrive at 2 PM tomorrow. Thank you!",
      timestamp: "2m ago",
      unread: true,
    },
    {
      id: "2",
      serviceProviderName: "Juan Dela Cruz",
      serviceType: "Plumbing Repair",
      lastMessage: "The parts have been ordered. I'll update you once they arrive.",
      timestamp: "1h ago",
      unread: false,
    },
    {
      id: "3",
      serviceProviderName: "Anna Reyes",
      serviceType: "Aircon Cleaning",
      lastMessage: "Thank you for your feedback!",
      timestamp: "2d ago",
      unread: false,
    },
  ];

  const filteredMessages = messages.filter(
    (msg) =>
      msg.serviceProviderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Status Bar */}
      <div className="bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] py-[16px] flex-shrink-0 border-b border-[#F2F2F2]">
        <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
          Messages
        </h1>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-[24px] py-[12px] flex-shrink-0 border-b border-[#F2F2F2]">
        <div className="relative">
          <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[44px] pl-[48px] pr-[16px] rounded-[12px] bg-[#F3F4F6] font-['Inter',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] border-none outline-none focus:ring-2 focus:ring-[#56C490]"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        {filteredMessages.length > 0 ? (
          <div className="divide-y divide-[#F2F2F2]">
            {filteredMessages.map((message) => (
              <button
                key={message.id}
                onClick={() => navigate(`/customer/messages/${message.id}`)}
                className="w-full px-[24px] py-[16px] flex gap-[12px] items-start hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors text-left"
              >
                {/* Avatar */}
                <div className="w-[48px] h-[48px] rounded-full bg-[#56C490] flex items-center justify-center flex-shrink-0">
                  <span className="font-['Nunito',sans-serif] text-[18px] text-white">
                    {message.serviceProviderName.charAt(0)}
                  </span>
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-[4px]">
                    <h3 className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                      {message.serviceProviderName}
                    </h3>
                    <span className="font-['Inter',sans-serif] text-[12px] text-[#9CA3AF] ml-[8px] flex-shrink-0">
                      {message.timestamp}
                    </span>
                  </div>
                  <p className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] mb-[4px]">
                    {message.serviceType}
                  </p>
                  <p
                    className={`font-['Inter',sans-serif] text-[14px] truncate ${
                      message.unread
                        ? "text-[#111827] font-medium"
                        : "text-[#9CA3AF]"
                    }`}
                  >
                    {message.lastMessage}
                  </p>
                </div>

                {/* Unread Indicator */}
                {message.unread && (
                  <div className="w-[8px] h-[8px] rounded-full bg-[#56C490] flex-shrink-0 mt-[4px]" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-[24px] text-center">
            <div className="w-[120px] h-[120px] rounded-full bg-[#F3F4F6] flex items-center justify-center mb-[24px]">
              <MessageCircle className="w-[56px] h-[56px] text-[#9CA3AF]" />
            </div>
            <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827] mb-[8px]">
              {searchQuery ? "No messages found" : "No messages yet"}
            </h2>
            <p className="font-['Inter',sans-serif] text-[14px] text-[#6B7280] mb-[24px]">
              {searchQuery
                ? "Try searching with different keywords"
                : "Start booking services to chat with Service Providers"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate("/customer/home")}
                className="px-[32px] py-[14px] rounded-[12px] bg-[#56C490] font-['Nunito',sans-serif] text-[14px] text-white active:scale-[0.97] transition-transform"
              >
                Browse Services
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}