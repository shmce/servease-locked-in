import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { BottomNavigation } from "../components/BottomNavigation";
import {
  Search,
  Plus,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

const MINT = "#56C490";
const MINT_DARK = "#3DAE76";
const CORAL = "#FF8C7A";
const CREAM = "#FAF8F5";

interface Conversation {
  id: number;
  providerId: number;
  providerName: string;
  providerPhoto: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

export default function CustomerMessagesScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const conversations: Conversation[] = [
    {
      id: 1,
      providerId: 101,
      providerName: "Maria Santos",
      providerPhoto: "https://i.pravatar.cc/150?img=5",
      lastMessage: "I'll be there at 2:00 PM today. See you!",
      timestamp: "10:30 AM",
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: 2,
      providerId: 102,
      providerName: "Juan Dela Cruz",
      providerPhoto: "https://i.pravatar.cc/150?img=12",
      lastMessage: "The plumbing work is complete. Thank you!",
      timestamp: "Yesterday",
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: 3,
      providerId: 103,
      providerName: "Ana Reyes",
      providerPhoto: "https://i.pravatar.cc/150?img=9",
      lastMessage: "Can we reschedule to tomorrow?",
      timestamp: "Yesterday",
      unreadCount: 1,
      isOnline: true,
    },
    {
      id: 4,
      providerId: 104,
      providerName: "Carlos Mendoza",
      providerPhoto: "https://i.pravatar.cc/150?img=13",
      lastMessage: "Your aircon is now working perfectly!",
      timestamp: "Mar 10",
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: 5,
      providerId: 105,
      providerName: "Sofia Garcia",
      providerPhoto: "https://i.pravatar.cc/150?img=10",
      lastMessage: "I'm on my way to your location.",
      timestamp: "Mar 9",
      unreadCount: 0,
      isOnline: false,
    },
  ];

  const filteredConversations = conversations.filter((conv) =>
    conv.providerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: CREAM }} className="w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div style={{ height: 47, backgroundColor: CREAM }} className="flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div
        className="flex-shrink-0"
        style={{
          backgroundColor: CREAM,
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 8,
          paddingBottom: 16,
          borderBottom: "1px solid rgba(44, 42, 40, 0.07)",
        }}
      >
        <div className="flex items-center justify-between mb-[16px]">
          <h1
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 24,
              fontWeight: 800,
              color: "#2C2A28",
            }}
          >
            Messages
          </h1>
          <button
            onClick={() => navigate("/customer/search")}
            className="flex items-center justify-center transition-transform active:scale-90"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: `linear-gradient(145deg, ${MINT}, ${MINT_DARK})`,
              boxShadow: "0 6px 18px rgba(86,196,144,0.38)",
            }}
          >
            <Plus className="w-[20px] h-[20px] text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: 14, width: 18, height: 18, color: "#9B8E84" }}
            strokeWidth={2.2}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              paddingLeft: 44,
              paddingRight: 16,
              paddingTop: 12,
              paddingBottom: 12,
              backgroundColor: "white",
              borderRadius: 16,
              fontFamily: "'Nunito', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: "#2C2A28",
              border: "none",
              outline: "none",
              boxShadow: "0 4px 16px rgba(44, 42, 40, 0.06)",
            }}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 100 }}>
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-[24px]">
            <div
              className="flex items-center justify-center mb-[18px]"
              style={{
                width: 88,
                height: 88,
                borderRadius: 28,
                backgroundColor: "#F2EDE8",
              }}
            >
              <MessageCircle
                style={{ width: 38, height: 38, color: "#9B8E84" }}
                strokeWidth={1.8}
              />
            </div>
            <h3
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 17,
                fontWeight: 700,
                color: "#2C2A28",
                marginBottom: 8,
              }}
            >
              No conversations found
            </h3>
            <p
              className="text-center"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                color: "#9B8E84",
              }}
            >
              {searchQuery
                ? "Try searching with a different keyword"
                : "Start a conversation with a service provider"}
            </p>
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation, idx) => (
              <button
                key={conversation.id}
                onClick={() =>
                  navigate(`/customer/conversation/${conversation.providerId}`)
                }
                className="w-full flex items-start gap-[14px] transition-colors active:bg-white/60"
                style={{
                  paddingLeft: 24,
                  paddingRight: 24,
                  paddingTop: 14,
                  paddingBottom: 14,
                  borderBottom: idx < filteredConversations.length - 1
                    ? "1px solid rgba(44, 42, 40, 0.06)"
                    : "none",
                  backgroundColor:
                    conversation.unreadCount > 0 ? "rgba(255,255,255,0.7)" : "transparent",
                }}
              >
                {/* Provider Photo */}
                <div className="relative flex-shrink-0">
                  <img
                    src={conversation.providerPhoto}
                    alt={conversation.providerName}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      objectFit: "cover",
                      boxShadow: "0 4px 12px rgba(44, 42, 40, 0.1)",
                    }}
                  />
                  {conversation.isOnline && (
                    <div
                      className="absolute"
                      style={{
                        bottom: 2,
                        right: 2,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        backgroundColor: MINT,
                        border: "2.5px solid white",
                        boxShadow: "0 2px 6px rgba(86,196,144,0.4)",
                      }}
                    />
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-[4px]">
                    <h3
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: 15,
                        fontWeight: conversation.unreadCount > 0 ? 800 : 700,
                        color: "#2C2A28",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {conversation.providerName}
                    </h3>
                    <span
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#9B8E84",
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      {conversation.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: 13,
                        fontWeight: conversation.unreadCount > 0 ? 600 : 500,
                        color: conversation.unreadCount > 0 ? "#2C2A28" : "#9B8E84",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <div
                        className="flex items-center justify-center flex-shrink-0 ml-[8px]"
                        style={{
                          minWidth: 24,
                          height: 24,
                          borderRadius: 100,
                          backgroundColor: CORAL,
                          paddingLeft: 6,
                          paddingRight: 6,
                          boxShadow: "0 3px 8px rgba(255,140,122,0.4)",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Nunito', sans-serif",
                            fontSize: 11,
                            fontWeight: 800,
                            color: "white",
                          }}
                        >
                          {conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                <ChevronRight
                  style={{ width: 18, height: 18, color: "#C8C0BA", flexShrink: 0, marginTop: 16 }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation unreadMessages={conversations.filter((c) => c.unreadCount > 0).length} />
    </div>
  );
}
