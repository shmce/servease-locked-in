import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import {
  ArrowLeft,
  Bell,
  Calendar,
  CreditCard,
  MessageSquare,
  DollarSign,
  Gift,
  Info,
  Clock,
  Home,
  FileText,
  User,
} from "lucide-react";

interface NotificationSetting {
  id: string;
  label: string;
  enabled: boolean;
}

export default function ProviderNotificationPreferences() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // Booking Notifications
  const [bookingNotifications, setBookingNotifications] = useState<NotificationSetting[]>([
    { id: "new-booking", label: "New Booking Requests", enabled: true },
    { id: "booking-confirm", label: "Booking Confirmations", enabled: true },
    { id: "booking-cancel", label: "Booking Cancellations", enabled: true },
    { id: "booking-modify", label: "Booking Modifications", enabled: true },
    { id: "customer-messages", label: "Customer Messages", enabled: true },
  ]);

  // Payment Notifications
  const [paymentNotifications, setPaymentNotifications] = useState<NotificationSetting[]>([
    { id: "payment-received", label: "Payment Received", enabled: true },
    { id: "payout-processed", label: "Payout Processed", enabled: true },
  ]);

  // Other Alerts
  const [otherAlerts, setOtherAlerts] = useState<NotificationSetting[]>([
    { id: "promo-offers", label: "Promotional Offers", enabled: false },
    { id: "platform-updates", label: "Platform Updates", enabled: true },
    { id: "daily-summary", label: "Daily Summary", enabled: true },
  ]);

  const [preferredTime, setPreferredTime] = useState("08:00 AM");

  const toggleNotification = (
    id: string,
    type: "booking" | "payment" | "other"
  ) => {
    if (type === "booking") {
      setBookingNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, enabled: !item.enabled } : item
        )
      );
    } else if (type === "payment") {
      setPaymentNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, enabled: !item.enabled } : item
        )
      );
    } else {
      setOtherAlerts((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, enabled: !item.enabled } : item
        )
      );
    }
  };

  const handleSave = () => {
    // Simulate saving preferences
    alert("Notification preferences saved successfully!");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === "home") {
      navigate("/provider/home");
    } else if (tab === "requests") {
      navigate("/provider/bookings");
    } else if (tab === "calendar") {
      navigate("/provider/schedule");
    } else if (tab === "earnings") {
      navigate("/provider/earnings");
    } else if (tab === "profile") {
      navigate("/provider/profile");
    }
  };

  return (
    <div className="bg-[#F5F7FA] w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] py-[16px] border-b border-[#E5E7EB] flex-shrink-0">
        <div className="flex items-center gap-[16px]">
          <button
            onClick={() => navigate(-1)}
            className="w-[40px] h-[40px] rounded-full flex items-center justify-center -ml-[8px] transition-all active:scale-90"
          >
            <ArrowLeft className="w-[22px] h-[22px] text-[#111827]" />
          </button>
          <h1 className="text-[#111827] text-[18px] font-semibold font-['Inter',sans-serif]">
            Notification Preferences
          </h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        {/* Booking Notifications Group */}
        <div className="px-[24px] pt-[20px] pb-[12px]">
          <div className="flex items-center gap-[12px] mb-[12px]">
            <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center">
              <Bell className="w-[20px] h-[20px] text-[#2E7D32]" />
            </div>
            <h2 className="text-[#111827] text-[16px] font-semibold font-['Inter',sans-serif]">
              Booking Notifications
            </h2>
          </div>
          <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
            {bookingNotifications.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between px-[16px] py-[14px] ${
                  index !== bookingNotifications.length - 1 ? "border-b border-[#F3F4F6]" : ""
                }`}
              >
                <span className="text-[#374151] text-[14px] font-['Inter',sans-serif]">
                  {item.label}
                </span>
                <button
                  onClick={() => toggleNotification(item.id, "booking")}
                  className={`relative w-[48px] h-[28px] rounded-full transition-all ${
                    item.enabled ? "bg-[#2E7D32]" : "bg-[#D1D5DB]"
                  }`}
                >
                  <div
                    className={`absolute top-[2px] w-[24px] h-[24px] rounded-full bg-white shadow-sm transition-all ${
                      item.enabled ? "left-[22px]" : "left-[2px]"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Notifications Group */}
        <div className="px-[24px] pt-[12px] pb-[12px]">
          <div className="flex items-center gap-[12px] mb-[12px]">
            <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center">
              <DollarSign className="w-[20px] h-[20px] text-[#2E7D32]" />
            </div>
            <h2 className="text-[#111827] text-[16px] font-semibold font-['Inter',sans-serif]">
              Payment Notifications
            </h2>
          </div>
          <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
            {paymentNotifications.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between px-[16px] py-[14px] ${
                  index !== paymentNotifications.length - 1 ? "border-b border-[#F3F4F6]" : ""
                }`}
              >
                <span className="text-[#374151] text-[14px] font-['Inter',sans-serif]">
                  {item.label}
                </span>
                <button
                  onClick={() => toggleNotification(item.id, "payment")}
                  className={`relative w-[48px] h-[28px] rounded-full transition-all ${
                    item.enabled ? "bg-[#2E7D32]" : "bg-[#D1D5DB]"
                  }`}
                >
                  <div
                    className={`absolute top-[2px] w-[24px] h-[24px] rounded-full bg-white shadow-sm transition-all ${
                      item.enabled ? "left-[22px]" : "left-[2px]"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Other Alerts Group */}
        <div className="px-[24px] pt-[12px] pb-[12px]">
          <div className="flex items-center gap-[12px] mb-[12px]">
            <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center">
              <Info className="w-[20px] h-[20px] text-[#2E7D32]" />
            </div>
            <h2 className="text-[#111827] text-[16px] font-semibold font-['Inter',sans-serif]">
              Other Alerts
            </h2>
          </div>
          <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
            {otherAlerts.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between px-[16px] py-[14px] ${
                  index !== otherAlerts.length - 1 ? "border-b border-[#F3F4F6]" : ""
                }`}
              >
                <span className="text-[#374151] text-[14px] font-['Inter',sans-serif]">
                  {item.label}
                </span>
                <button
                  onClick={() => toggleNotification(item.id, "other")}
                  className={`relative w-[48px] h-[28px] rounded-full transition-all ${
                    item.enabled ? "bg-[#2E7D32]" : "bg-[#D1D5DB]"
                  }`}
                >
                  <div
                    className={`absolute top-[2px] w-[24px] h-[24px] rounded-full bg-white shadow-sm transition-all ${
                      item.enabled ? "left-[22px]" : "left-[2px]"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Timing */}
        <div className="px-[24px] pt-[12px] pb-[20px]">
          <div className="flex items-center gap-[12px] mb-[12px]">
            <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center">
              <Clock className="w-[20px] h-[20px] text-[#2E7D32]" />
            </div>
            <h2 className="text-[#111827] text-[16px] font-semibold font-['Inter',sans-serif]">
              Notification Timing
            </h2>
          </div>
          <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-[16px]">
            <label className="block mb-[8px]">
              <span className="text-[#6B7280] text-[12px] font-['Inter',sans-serif]">
                Preferred Notification Time (Daily Summary)
              </span>
            </label>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full px-[14px] py-[12px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] text-[#111827] text-[14px] font-['Inter',sans-serif] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
            >
              <option value="06:00 AM">06:00 AM</option>
              <option value="07:00 AM">07:00 AM</option>
              <option value="08:00 AM">08:00 AM</option>
              <option value="09:00 AM">09:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="06:00 PM">06:00 PM</option>
              <option value="07:00 PM">07:00 PM</option>
              <option value="08:00 PM">08:00 PM</option>
              <option value="09:00 PM">09:00 PM</option>
            </select>
          </div>
        </div>

        {/* Save Preferences Button */}
        <div className="px-[24px] pb-[24px]">
          <button
            onClick={handleSave}
            className="w-full bg-[#2E7D32] py-[14px] rounded-[10px] text-white text-[16px] font-semibold font-['Inter',sans-serif] shadow-[0_2px_8px_rgba(46,125,50,0.25)] transition-all active:scale-95"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Bottom Navigation Bar - 5 Icons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-[20px] py-[8px] flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Home */}
          <button
            onClick={() => handleTabChange("home")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <Home
              className={`w-[24px] h-[24px] ${
                activeTab === "home" ? "text-[#2E7D32]" : "text-[#9CA3AF]"
              }`}
              fill={activeTab === "home" ? "#2E7D32" : "none"}
            />
            <span
              className={`text-[11px] font-['Inter',sans-serif] ${
                activeTab === "home" ? "text-[#2E7D32] font-semibold" : "text-[#9CA3AF]"
              }`}
            >
              Home
            </span>
          </button>

          {/* Requests */}
          <button
            onClick={() => handleTabChange("requests")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <FileText
              className={`w-[24px] h-[24px] ${
                activeTab === "requests" ? "text-[#2E7D32]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[11px] font-['Inter',sans-serif] ${
                activeTab === "requests" ? "text-[#2E7D32] font-semibold" : "text-[#9CA3AF]"
              }`}
            >
              Requests
            </span>
          </button>

          {/* Calendar */}
          <button
            onClick={() => handleTabChange("calendar")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <Calendar
              className={`w-[24px] h-[24px] ${
                activeTab === "calendar" ? "text-[#2E7D32]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[11px] font-['Inter',sans-serif] ${
                activeTab === "calendar" ? "text-[#2E7D32] font-semibold" : "text-[#9CA3AF]"
              }`}
            >
              Calendar
            </span>
          </button>

          {/* Earnings */}
          <button
            onClick={() => handleTabChange("earnings")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <DollarSign
              className={`w-[24px] h-[24px] ${
                activeTab === "earnings" ? "text-[#2E7D32]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[11px] font-['Inter',sans-serif] ${
                activeTab === "earnings" ? "text-[#2E7D32] font-semibold" : "text-[#9CA3AF]"
              }`}
            >
              Earnings
            </span>
          </button>

          {/* Profile */}
          <button
            onClick={() => handleTabChange("profile")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <User
              className={`w-[24px] h-[24px] ${
                activeTab === "profile" ? "text-[#2E7D32]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[11px] font-['Inter',sans-serif] ${
                activeTab === "profile" ? "text-[#2E7D32] font-semibold" : "text-[#9CA3AF]"
              }`}
            >
              Profile
            </span>
          </button>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="fixed bottom-0 left-0 right-0 h-[34px] bg-white flex-shrink-0 pointer-events-none">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}