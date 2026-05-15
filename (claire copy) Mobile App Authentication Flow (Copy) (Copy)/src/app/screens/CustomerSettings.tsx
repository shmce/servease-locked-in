import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft, Bell, Lock, Globe, Moon, ChevronRight } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

export default function CustomerSettings() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const settingSections = [
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Push Notifications",
          type: "toggle" as const,
          value: notifications,
          onChange: setNotifications,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: Lock,
          label: "Change Password",
          type: "link" as const,
          action: () => navigate("/customer/change-password"),
        },
        {
          icon: Globe,
          label: "Language",
          type: "link" as const,
          value: "English",
          action: () => navigate("/customer/language"),
        },
      ],
    },
    {
      title: "Appearance",
      items: [
        {
          icon: Moon,
          label: "Dark Mode",
          type: "toggle" as const,
          value: darkMode,
          onChange: setDarkMode,
        },
      ],
    },
  ];

  return (
    <MobileContainer>
      <div className="h-full bg-white flex flex-col">
        {/* Status Bar */}
        <div className="bg-white flex-shrink-0">
          <StatusBar />
        </div>

        {/* Header */}
        <div className="bg-white px-[24px] py-[16px] flex items-center gap-[16px] flex-shrink-0 border-b border-[#F2F2F2]">
          <button onClick={() => navigate(-1)} className="active:scale-90 transition-transform">
            <ArrowLeft className="w-[24px] h-[24px] text-[#111827]" />
          </button>
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Settings
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-[100px]">
          <div className="px-[24px] py-[20px] space-y-[32px]">
            {settingSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h2 className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[12px] uppercase tracking-wide">
                  {section.title}
                </h2>
                <div className="space-y-[2px]">
                  {section.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    const Wrapper = item.type === "link" ? "button" : "div";
                    return (
                      <Wrapper
                        key={itemIndex}
                        onClick={() => item.type === "link" && item.action?.()}
                        className={`w-full flex items-center justify-between p-[16px] bg-white border-b border-[#F2F2F2] ${
                          item.type === "link" ? "transition-all active:bg-[#F9FAFB]" : ""
                        }`}
                      >
                        <div className="flex items-center gap-[12px]">
                          <Icon className="w-[20px] h-[20px] text-[#6B7280]" />
                          <span className="font-['Inter',sans-serif] text-[16px] text-[#111827]">
                            {item.label}
                          </span>
                        </div>
                        {item.type === "toggle" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              item.onChange?.(!item.value);
                            }}
                            className={`w-[48px] h-[28px] rounded-full transition-colors ${
                              item.value ? "bg-[#56C490]" : "bg-[#E5E7EB]"
                            }`}
                          >
                            <div
                              className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${
                                item.value ? "translate-x-[22px]" : "translate-x-[2px]"
                              }`}
                            />
                          </button>
                        )}
                        {item.type === "link" && (
                          <div className="flex items-center gap-[8px]">
                            {item.value && (
                              <span className="font-['Inter',sans-serif] text-[14px] text-[#6B7280]">
                                {item.value}
                              </span>
                            )}
                            <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
                          </div>
                        )}
                      </Wrapper>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </MobileContainer>
  );
}