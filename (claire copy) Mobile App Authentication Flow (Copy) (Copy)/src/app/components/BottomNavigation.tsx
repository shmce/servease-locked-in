import { useState, startTransition } from "react";
import { useNavigate, useLocation } from "react-router";
import { Home, Calendar, MessageCircle, MoreHorizontal } from "lucide-react";

const MINT = "#56C490";
const CORAL = "#FF8C7A";
const INACTIVE = "#B0A89E";

interface BottomNavigationProps {
  /** Number of unread messages – drives the badge on the Messages tab */
  unreadMessages?: number;
}

export function BottomNavigation({ unreadMessages = 1 }: BottomNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const activeTab = (() => {
    if (path.includes("/customer/messages")) return "messages";
    if (
      path.includes("/customer/bookings") ||
      path.includes("/customer/projects") ||
      path.includes("/customer/project/")
    )
      return "bookings";
    if (
      path.includes("/customer/more") ||
      path.includes("/customer/profile") ||
      path.includes("/customer/settings") ||
      path.includes("/customer/help") ||
      path.includes("/customer/service-history") ||
      path.includes("/customer/referral") ||
      path.includes("/customer/terms")
    )
      return "more";
    return "home";
  })();

  const tabs = [
    { key: "home", label: "Home", Icon: Home, route: "/customer/home" },
    { key: "bookings", label: "Bookings", Icon: Calendar, route: "/customer/bookings" },
    { key: "messages", label: "Messages", Icon: MessageCircle, route: "/customer/messages" },
    { key: "more", label: "More", Icon: MoreHorizontal, route: "/customer/more" },
  ] as const;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 max-w-[393px] mx-auto"
      style={{
        backgroundColor: "white",
        borderTop: "1px solid rgba(44, 42, 40, 0.07)",
        boxShadow: "0 -8px 32px rgba(44, 42, 40, 0.08)",
      }}
    >
      <div
        className="flex items-center justify-around"
        style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 6 }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => startTransition(() => navigate(tab.route))}
              className="flex flex-col items-center gap-[4px] flex-1 transition-transform active:scale-90"
              style={{ paddingTop: 4, paddingBottom: 4 }}
            >
              <div className="relative">
                {isActive ? (
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 44,
                      height: 32,
                      borderRadius: 100,
                      backgroundColor: "#EEF9F3",
                    }}
                  >
                    <tab.Icon
                      style={{ width: 20, height: 20, color: MINT }}
                      strokeWidth={2.5}
                    />
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center"
                    style={{ width: 44, height: 32 }}
                  >
                    <tab.Icon
                      style={{ width: 20, height: 20, color: INACTIVE }}
                      strokeWidth={1.8}
                    />
                  </div>
                )}

                {/* Unread dot – Messages tab */}
                {tab.key === "messages" && unreadMessages > 0 && (
                  <span
                    className="absolute rounded-full"
                    style={{
                      top: 2,
                      right: 6,
                      width: 9,
                      height: 9,
                      backgroundColor: CORAL,
                      border: "2px solid white",
                    }}
                  />
                )}
              </div>

              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 10,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? MINT : INACTIVE,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* iOS Home Indicator */}
      <div style={{ height: 34, backgroundColor: "white", position: "relative" }}>
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: 8,
            width: 134,
            height: 5,
            borderRadius: 100,
            backgroundColor: "rgba(44, 42, 40, 0.2)",
          }}
        />
      </div>
    </div>
  );
}
