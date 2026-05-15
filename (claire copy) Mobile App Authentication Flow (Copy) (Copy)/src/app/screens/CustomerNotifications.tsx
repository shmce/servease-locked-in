import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, Bell, Gift, Star, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

// Notification types and data
const notifications = [
  {
    id: 1,
    type: "promo",
    icon: "gift",
    title: "Special Promo: 20% Off House Cleaning",
    description: "Get 20% discount on your next house cleaning service. Valid until March 20.",
    timestamp: "5 min ago",
    isRead: false
  },
  {
    id: 2,
    type: "booking",
    icon: "calendar",
    title: "Booking Confirmed",
    description: "Your plumbing repair service is confirmed for March 16, 2026 at 2:00 PM.",
    timestamp: "1 hour ago",
    isRead: false
  },
  {
    id: 3,
    type: "new_service",
    icon: "star",
    title: "New Service Available in Your Area",
    description: "Pool Maintenance is now available in Makati City. Book your first service today!",
    timestamp: "3 hours ago",
    isRead: false
  },
  {
    id: 4,
    type: "announcement",
    icon: "bell",
    title: "Platform Update",
    description: "We've added new payment options and improved booking experience. Update your app now!",
    timestamp: "Yesterday",
    isRead: true
  },
  {
    id: 5,
    type: "booking",
    icon: "calendar",
    title: "Service Provider is on the Way",
    description: "John Martinez is heading to your location. ETA: 15 minutes.",
    timestamp: "Yesterday",
    isRead: true
  },
  {
    id: 6,
    type: "promo",
    icon: "gift",
    title: "Refer a Friend, Get ₱200 Credit",
    description: "Share ServEase with friends and earn credits for each successful referral.",
    timestamp: "2 days ago",
    isRead: true
  },
  {
    id: 7,
    type: "booking",
    icon: "check",
    title: "Service Completed Successfully",
    description: "Your electrical repair service has been completed. Please rate your experience.",
    timestamp: "3 days ago",
    isRead: true
  },
  {
    id: 8,
    type: "alert",
    icon: "alert",
    title: "Payment Method Expiring Soon",
    description: "Your credit card ending in 4532 will expire next month. Update your payment info.",
    timestamp: "4 days ago",
    isRead: true
  },
  {
    id: 9,
    type: "new_service",
    icon: "star",
    title: "Top-rated Provider in Your Area",
    description: "Sarah Chen, a 5-star cleaning provider, is now accepting bookings near you.",
    timestamp: "5 days ago",
    isRead: true
  },
  {
    id: 10,
    type: "announcement",
    icon: "bell",
    title: "Weekend Flash Sale",
    description: "Get up to 30% off on selected services this weekend only!",
    timestamp: "1 week ago",
    isRead: true
  }
];

const getNotificationIcon = (iconType: string) => {
  switch (iconType) {
    case "gift":
      return <Gift className="w-[20px] h-[20px] text-white" />;
    case "calendar":
      return <Calendar className="w-[20px] h-[20px] text-white" />;
    case "star":
      return <Star className="w-[20px] h-[20px] text-white" />;
    case "alert":
      return <AlertCircle className="w-[20px] h-[20px] text-white" />;
    case "check":
      return <CheckCircle className="w-[20px] h-[20px] text-white" />;
    default:
      return <Bell className="w-[20px] h-[20px] text-white" />;
  }
};

const getIconBackgroundColor = (type: string) => {
  switch (type) {
    case "promo":
      return "bg-[#FF6B6B]";
    case "booking":
      return "bg-[#4ECDC4]";
    case "new_service":
      return "bg-[#56C490]";
    case "alert":
      return "bg-[#FFA500]";
    default:
      return "bg-[#6C63FF]";
  }
};

export default function CustomerNotifications() {
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] py-[12px] flex items-center justify-between border-b border-[#F2F2F2] flex-shrink-0">
        <div className="flex items-center gap-[16px]">
          <button
            onClick={() => navigate("/customer/home")}
            className="w-[40px] h-[40px] flex items-center justify-center -ml-[8px] transition-all active:scale-90"
          >
            <ArrowLeft className="w-[24px] h-[24px] text-[#111827]" />
          </button>
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Notifications
          </h1>
        </div>
        {unreadCount > 0 && (
          <div className="bg-[#56C490] px-[10px] py-[4px] rounded-[12px]">
            <span className="font-['Nunito',sans-serif] text-[12px] text-white">
              {unreadCount} new
            </span>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        <div className="px-[24px] py-[16px]">
          {notifications.length === 0 ? (
            <div className="text-center py-[80px]">
              <div className="w-[80px] h-[80px] bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-[16px]">
                <Bell className="w-[40px] h-[40px] text-[#9CA3AF]" />
              </div>
              <p className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[8px]">
                No notifications yet
              </p>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
                We'll notify you when something arrives
              </p>
            </div>
          ) : (
            <div className="space-y-[12px]">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative bg-white rounded-[16px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-2 transition-all active:scale-[0.98] ${
                    notification.isRead ? "border-transparent" : "border-[#56C490]/20 bg-[#F0FFF4]"
                  }`}
                >
                  {!notification.isRead && (
                    <div className="absolute top-[16px] right-[16px] w-[8px] h-[8px] bg-[#56C490] rounded-full" />
                  )}

                  <div className="flex gap-[12px]">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-[44px] h-[44px] rounded-full ${getIconBackgroundColor(notification.type)} flex items-center justify-center`}>
                      {getNotificationIcon(notification.icon)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[4px] leading-[1.4]">
                        {notification.title}
                      </h3>
                      <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] mb-[8px] leading-[1.4]">
                        {notification.description}
                      </p>
                      <span className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
                        {notification.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
