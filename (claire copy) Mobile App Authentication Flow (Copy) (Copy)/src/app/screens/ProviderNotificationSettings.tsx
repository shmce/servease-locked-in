import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ChevronLeft, Bell, Mail, Smartphone, Home, Calendar, MessageCircle, MoreHorizontal } from "lucide-react";

export default function ProviderNotificationSettings() {
  const navigate = useNavigate();
  const [activeTab] = useState("more");

  const [settings, setSettings] = useState({
    // Push Notifications
    pushBookingUpdates: true,
    pushMessages: true,
    pushPayments: true,
    pushPromotions: false,
    
    // Email Notifications
    emailBookingSummary: true,
    emailWeeklyReport: true,
    emailNewFeatures: true,
    emailMarketing: false,
    
    // SMS Notifications
    smsBookingConfirm: true,
    smsPaymentReceived: false,
    smsUrgentAlerts: true,
    smsPromotions: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const notificationCategories = [
    {
      title: "Push Notifications",
      icon: Bell,
      color: "#00C16A",
      items: [
        { key: "pushBookingUpdates", label: "Booking Updates", description: "Get notified about new bookings and changes" },
        { key: "pushMessages", label: "Messages", description: "Customer messages and chat notifications" },
        { key: "pushPayments", label: "Payments", description: "Payment confirmations and earnings updates" },
        { key: "pushPromotions", label: "Promotions & Offers", description: "Special deals and platform updates" },
      ],
    },
    {
      title: "Email Notifications",
      icon: Mail,
      color: "#3B82F6",
      items: [
        { key: "emailBookingSummary", label: "Daily Booking Summary", description: "Summary of your bookings and schedule" },
        { key: "emailWeeklyReport", label: "Weekly Earnings Report", description: "Detailed report of your weekly earnings" },
        { key: "emailNewFeatures", label: "New Features", description: "Updates about new platform features" },
        { key: "emailMarketing", label: "Marketing Emails", description: "Tips, news, and promotional content" },
      ],
    },
    {
      title: "SMS Notifications",
      icon: Smartphone,
      color: "#8B5CF6",
      items: [
        { key: "smsBookingConfirm", label: "Booking Confirmations", description: "SMS alerts for confirmed bookings" },
        { key: "smsPaymentReceived", label: "Payment Received", description: "Instant alerts when you receive payment" },
        { key: "smsUrgentAlerts", label: "Urgent Alerts", description: "Critical updates requiring immediate attention" },
        { key: "smsPromotions", label: "SMS Promotions", description: "Promotional offers via SMS" },
      ],
    },
  ];

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
        <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
          Notification Settings
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[16px]">
        <div className="pt-[8px]">
          {notificationCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div key={index} className="bg-white mb-[8px] px-[24px] py-[20px]">
                <div className="flex items-center gap-[12px] mb-[20px]">
                  <div
                    className="w-[40px] h-[40px] rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <Icon className="w-[20px] h-[20px]" style={{ color: category.color }} />
                  </div>
                  <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
                    {category.title}
                  </h2>
                </div>

                <div className="space-y-[4px]">
                  {category.items.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between py-[12px] border-b border-[#F3F4F6] last:border-b-0"
                    >
                      <div className="flex-1 pr-[16px]">
                        <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[2px]">
                          {item.label}
                        </p>
                        <p className="font-['Poppins',sans-serif] text-[12px] text-[#6B7280] leading-[1.5]">
                          {item.description}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleSetting(item.key as keyof typeof settings)}
                        className={`relative w-[48px] h-[28px] rounded-full transition-all flex-shrink-0 ${
                          settings[item.key as keyof typeof settings]
                            ? "bg-[#00C16A]"
                            : "bg-[#E5E7EB]"
                        }`}
                      >
                        <div
                          className={`absolute top-[2px] w-[24px] h-[24px] rounded-full bg-white shadow-sm transition-all ${
                            settings[item.key as keyof typeof settings]
                              ? "right-[2px]"
                              : "left-[2px]"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Do Not Disturb */}
          <div className="bg-white px-[24px] py-[20px]">
            <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
              Do Not Disturb
            </h2>
            <p className="font-['Poppins',sans-serif] text-[13px] text-[#6B7280] leading-[1.6] mb-[16px]">
              Set quiet hours when you won't receive non-urgent notifications
            </p>
            <button className="w-full h-[48px] rounded-[12px] border-2 border-[#E5E7EB] bg-white font-['Nunito',sans-serif] text-[14px] text-[#374151] transition-all active:scale-95">
              Configure Quiet Hours
            </button>
          </div>
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
        <div className="h-[34px] bg-white relative flex-shrink-0">
          <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
        </div>
      </div>
    </div>
  );
}