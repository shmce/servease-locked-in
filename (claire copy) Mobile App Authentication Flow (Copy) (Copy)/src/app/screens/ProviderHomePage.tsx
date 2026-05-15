import { useState, startTransition } from "react";
import { useNavigate, useLocation } from "react-router";
import { Home, Calendar, MessageCircle, User, Bell, Clock, DollarSign, TrendingUp, CheckCircle, Star, ChevronRight, MapPin, MoreHorizontal, Settings, HelpCircle, LogOut, History, Wallet } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { bookingsData } from "../data/bookings";

export default function ProviderHomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const initialTab = location.state?.activeTab || "home";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Count pending bookings in upcoming tab
  const pendingBookingsCount = bookingsData.upcoming.filter(b => b.status === "Pending").length;

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/auth-gate", { replace: true });
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="bg-[#F5F7FA] w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        {activeTab === "home" && (
          <>
            {/* Green Header Section */}
            <div className="bg-[#56C490] pt-[16px] pb-[80px] px-[24px]">
              <div className="flex items-center justify-between mb-[4px]">
                <div>
                  <p className="font-['Nunito',sans-serif] text-[14px] text-white opacity-90">
                    Welcome back,
                  </p>
                  <h1 className="font-['Nunito',sans-serif] text-[24px] text-white">
                    Service Provider
                  </h1>
                </div>
                <button className="w-[40px] h-[40px] rounded-full bg-white/20 flex items-center justify-center">
                  <Bell className="w-[20px] h-[20px] text-white" />
                </button>
              </div>
            </div>

            {/* Stats Cards - Overlapping the green header */}
            <div className="px-[24px] -mt-[64px] mb-[24px]">
              {/* Total Earnings - Large Featured Card */}
              <div className="bg-white p-[20px] rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.10)] mb-[12px]">
                <div className="flex items-center justify-between mb-[8px]">
                  <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280]">
                    Total Earnings
                  </p>
                  <div className="w-[36px] h-[36px] rounded-full bg-[#56C490]/10 flex items-center justify-center">
                    <Wallet className="w-[18px] h-[18px] text-[#56C490]" />
                  </div>
                </div>
                <p className="font-['Nunito',sans-serif] text-[36px] text-[#56C490] leading-[1.1] mb-[4px]">
                  ₱24,850.00
                </p>
                <div className="flex items-center gap-[6px]">
                  <TrendingUp className="w-[14px] h-[14px] text-[#56C490]" />
                  <p className="font-['Nunito',sans-serif] text-[12px] text-[#56C490]">
                    +12.5% from last month
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-[10px]">
                {/* New Requests */}
                <div className="bg-white p-[14px] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                  <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280] mb-[6px]">
                    New Requests
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[24px] text-[#111827]">
                    5
                  </p>
                </div>

                {/* Today's Bookings */}
                <div className="bg-white p-[14px] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                  <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280] mb-[6px]">
                    Today
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[24px] text-[#111827]">
                    3
                  </p>
                </div>

                {/* Overall Rating */}
                <div className="bg-white p-[14px] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                  <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280] mb-[6px]">
                    Rating
                  </p>
                  <div className="flex items-center gap-[4px]">
                    <p className="font-['Nunito',sans-serif] text-[24px] text-[#111827]">
                      4.9
                    </p>
                    <Star className="w-[14px] h-[14px] text-[#FFA500] fill-[#FFA500] mt-[4px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* New Booking Requests Banner */}
            <div className="px-[24px] mb-[24px]">
              <button
                onClick={() => navigate("/provider/my-bookings", { state: { activeTab: "upcoming" } })}
                className="w-full bg-gradient-to-r from-[#56C490] to-[#00a055] p-[16px] rounded-[12px] flex items-center justify-between transition-all active:scale-95"
              >
                <div className="flex-1">
                  <p className="font-['Nunito',sans-serif] text-[15px] text-white mb-[4px]">
                    {pendingBookingsCount} New Booking Request{pendingBookingsCount !== 1 ? 's' : ''}
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[12px] text-white/80">
                    Tap to review and accept
                  </p>
                </div>
                <ChevronRight className="w-[24px] h-[24px] text-white" />
              </button>
            </div>

            {/* Active Bookings Table */}
            <div className="px-[24px] mb-[24px]">
              <div className="flex items-center justify-between mb-[12px]">
                <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
                  Active Bookings
                </h2>
                <button
                  onClick={() => navigate("/provider/my-bookings")}
                  className="font-['Nunito',sans-serif] text-[13px] text-[#56C490] transition-all active:opacity-70"
                >
                  View All
                </button>
              </div>

              {/* Table Header */}
              <div className="bg-[#56C490]/5 rounded-t-[12px] px-[14px] py-[10px] flex items-center border border-[#E5E7EB] border-b-0">
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#374151] w-[30%]">Customer</p>
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#374151] w-[28%]">Service</p>
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#374151] w-[22%]">Amount</p>
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#374151] w-[20%] text-right">Status</p>
              </div>

              {/* Table Rows */}
              <div className="bg-white rounded-b-[12px] border border-[#E5E7EB] border-t-0 divide-y divide-[#F3F4F6] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                {[...bookingsData.upcoming, ...bookingsData.inProgress].map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => navigate(`/provider/booking-details/${booking.id}`)}
                    className="w-full px-[14px] py-[12px] flex items-center transition-all active:bg-[#f9fafb]"
                  >
                    <div className="w-[30%] flex items-center gap-[8px]">
                      <img src={booking.customerPhoto} alt={booking.customerName} className="w-[28px] h-[28px] rounded-full object-cover flex-shrink-0" />
                      <p className="font-['Nunito',sans-serif] text-[12px] text-[#111827] truncate">
                        {booking.customerName.split(" ")[0]}
                      </p>
                    </div>
                    <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280] w-[28%] truncate">
                      {booking.serviceType}
                    </p>
                    <p className="font-['Nunito',sans-serif] text-[12px] text-[#56C490] w-[22%]">
                      ₱{booking.amount}
                    </p>
                    <div className="w-[20%] flex justify-end">
                      <span
                        className="px-[8px] py-[3px] rounded-[4px] font-['Nunito',sans-serif] text-[10px]"
                        style={{
                          backgroundColor: `${booking.statusColor}15`,
                          color: booking.statusColor
                        }}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-[24px] mb-[24px]">
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[12px]">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-[12px]">
                <button
                  onClick={() => navigate("/provider/set-availability")}
                  className="bg-white p-[16px] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col items-start transition-all active:scale-95"
                >
                  <div className="w-[40px] h-[40px] rounded-full bg-[#56C490]/10 flex items-center justify-center mb-[8px]">
                    <Clock className="w-[20px] h-[20px] text-[#56C490]" />
                  </div>
                  <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                    Set Availability
                  </p>
                </button>

                <button
                  onClick={() => navigate("/provider/calendar")}
                  className="bg-white p-[16px] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col items-start transition-all active:scale-95"
                >
                  <div className="w-[40px] h-[40px] rounded-full bg-[#56C490]/10 flex items-center justify-center mb-[8px]">
                    <Calendar className="w-[20px] h-[20px] text-[#56C490]" />
                  </div>
                  <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                    View Calendar
                  </p>
                </button>

                <button className="bg-white p-[16px] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col items-start transition-all active:scale-95">
                  <div className="w-[40px] h-[40px] rounded-full bg-[#56C490]/10 flex items-center justify-center mb-[8px]">
                    <DollarSign className="w-[20px] h-[20px] text-[#56C490]" />
                  </div>
                  <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                    Update Pricing
                  </p>
                </button>

                <button
                  onClick={() => navigate("/provider/earnings")}
                  className="bg-white p-[16px] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col items-start transition-all active:scale-95"
                >
                  <div className="w-[40px] h-[40px] rounded-full bg-[#56C490]/10 flex items-center justify-center mb-[8px]">
                    <TrendingUp className="w-[20px] h-[20px] text-[#56C490]" />
                  </div>
                  <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                    View Earnings
                  </p>
                </button>
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="px-[24px] mb-[24px]">
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[12px]">
                Upcoming Bookings
              </h2>
              <div className="space-y-[12px]">
                {bookingsData.upcoming.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white p-[16px] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  >
                    <div className="flex items-start justify-between mb-[12px]">
                      <div className="flex-1">
                        <p className="font-['Nunito',sans-serif] text-[13px] text-[#56C490] mb-[4px]">
                          {booking.date} at {booking.time}
                        </p>
                        <h3 className="font-['Nunito',sans-serif] text-[15px] text-[#111827] mb-[4px]">
                          {booking.customerName}
                        </h3>
                        <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] mb-[6px]">
                          {booking.serviceType}
                        </p>
                        <div className="flex items-start gap-[6px]">
                          <MapPin className="w-[14px] h-[14px] text-[#9CA3AF] mt-[2px] flex-shrink-0" />
                          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
                            {booking.location}
                          </p>
                        </div>
                      </div>
                      <span
                        className="px-[10px] py-[4px] rounded-[6px] font-['Nunito',sans-serif] text-[11px]"
                        style={{ 
                          backgroundColor: `${booking.statusColor}15`,
                          color: booking.statusColor
                        }}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <button 
                      onClick={() => navigate(`/provider/booking-details/${booking.id}`)}
                      className="w-full h-[36px] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-[8px] font-['Nunito',sans-serif] text-[13px] text-[#374151] transition-all active:scale-95"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="px-[24px] mb-[24px]">
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[12px]">
                Performance Metrics
              </h2>
              <div className="bg-white p-[16px] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-[16px]">
                {/* Acceptance Rate */}
                <div>
                  <div className="flex items-center justify-between mb-[8px]">
                    <p className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
                      Acceptance Rate
                    </p>
                    <p className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
                      92%
                    </p>
                  </div>
                  <div className="h-[6px] bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#56C490] rounded-full" style={{ width: "92%" }} />
                  </div>
                </div>

                {/* Completion Rate */}
                <div>
                  <div className="flex items-center justify-between mb-[8px]">
                    <p className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
                      Completion Rate
                    </p>
                    <p className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
                      98%
                    </p>
                  </div>
                  <div className="h-[6px] bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#56C490] rounded-full" style={{ width: "98%" }} />
                  </div>
                </div>

                {/* Response Time */}
                <div>
                  <div className="flex items-center justify-between mb-[8px]">
                    <p className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
                      Response Time
                    </p>
                    <p className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
                      &lt; 5 min
                    </p>
                  </div>
                  <div className="h-[6px] bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#56C490] rounded-full" style={{ width: "95%" }} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "requests" && (
          <div className="px-[24px] pt-[24px] flex items-center justify-center h-[400px]">
            <p className="font-['Nunito',sans-serif] text-[15px] text-[#6B7280]">
              Requests content coming soon
            </p>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="px-[24px] pt-[24px]">
            <h2 className="font-['Nunito',sans-serif] text-[24px] text-[#111827] mb-[20px]">
              Messages
            </h2>
            
            {/* Messages List */}
            <div className="space-y-[12px]">
              {[
                {
                  id: 1,
                  name: "John Smith",
                  message: "Hi! What time will you arrive today?",
                  time: "2 min ago",
                  unread: 2,
                  avatar: "JS",
                },
                {
                  id: 2,
                  name: "Sarah Johnson",
                  message: "Thank you for the great service!",
                  time: "1 hour ago",
                  unread: 0,
                  avatar: "SJ",
                },
                {
                  id: 3,
                  name: "Mike Davis",
                  message: "Can you bring extra tools?",
                  time: "3 hours ago",
                  unread: 1,
                  avatar: "MD",
                },
                {
                  id: 4,
                  name: "Anna Reyes",
                  message: "Perfect! See you tomorrow.",
                  time: "Yesterday",
                  unread: 0,
                  avatar: "AR",
                },
                {
                  id: 5,
                  name: "Pedro Garcia",
                  message: "How much will the materials cost?",
                  time: "2 days ago",
                  unread: 0,
                  avatar: "PG",
                },
              ].map((chat) => (
                <button
                  key={chat.id}
                  className="w-full bg-white p-[16px] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-start gap-[12px] transition-all active:scale-95"
                  onClick={() => navigate(`/provider/conversation/${chat.name.toLowerCase().replace(/ /g, "-")}`)}
                >
                  {/* Avatar */}
                  <div className="w-[48px] h-[48px] rounded-full bg-[#56C490]/10 flex items-center justify-center flex-shrink-0">
                    <p className="font-['Nunito',sans-serif] text-[16px] text-[#56C490]">
                      {chat.avatar}
                    </p>
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-[4px]">
                      <h3 className="font-['Nunito',sans-serif] text-[15px] text-[#111827]">
                        {chat.name}
                      </h3>
                      <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF]">
                        {chat.time}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-[8px]">
                      <p
                        className={`font-['Nunito',sans-serif] text-[13px] truncate ${
                          chat.unread > 0 ? "text-[#111827]" : "text-[#6B7280]"
                        }`}
                      >
                        {chat.message}
                      </p>
                      {chat.unread > 0 && (
                        <span className="w-[20px] h-[20px] rounded-full bg-[#56C490] flex items-center justify-center flex-shrink-0">
                          <p className="font-['Nunito',sans-serif] text-[11px] text-white">
                            {chat.unread}
                          </p>
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="px-[24px] pt-[24px] flex items-center justify-center h-[400px]">
            <p className="font-['Nunito',sans-serif] text-[15px] text-[#6B7280]">
              Calendar content coming soon
            </p>
          </div>
        )}

        {activeTab === "earnings" && (
          <div className="px-[24px] pt-[24px]">
            <h2 className="font-['Nunito',sans-serif] text-[24px] text-[#111827] mb-[16px]">
              Earnings
            </h2>
            <p className="font-['Nunito',sans-serif] text-[15px] text-[#6B7280]">
              Redirecting to full earnings page...
            </p>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="px-[24px] pt-[24px] flex items-center justify-center h-[400px]">
            <p className="font-['Nunito',sans-serif] text-[15px] text-[#6B7280]">
              Profile content coming soon
            </p>
          </div>
        )}

        {activeTab === "more" && (
          <div className="pt-[24px] px-[24px]">
            <h2 className="font-['Nunito',sans-serif] text-[24px] text-[#111827] mb-[24px]">
              More
            </h2>

            {/* Menu Items */}
            <div className="space-y-[4px]">
              {/* My Profile */}
              <button 
                onClick={() => startTransition(() => navigate("/provider/edit-profile"))}
                className="w-full flex items-center gap-[16px] p-[16px] rounded-[12px] transition-all active:scale-95 hover:bg-[#f5f5f5]"
              >
                <div className="w-[40px] h-[40px] rounded-full bg-[#56C490]/10 flex items-center justify-center">
                  <User className="w-[20px] h-[20px] text-[#56C490]" />
                </div>
                <p className="font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] flex-1 text-left">
                  My Profile
                </p>
                <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
              </button>

              {/* Settings */}
              <button 
                onClick={() => navigate("/provider/settings")}
                className="w-full flex items-center gap-[16px] p-[16px] rounded-[12px] transition-all active:scale-95 hover:bg-[#f5f5f5]"
              >
                <div className="w-[40px] h-[40px] rounded-full bg-[#56C490]/10 flex items-center justify-center">
                  <Settings className="w-[20px] h-[20px] text-[#56C490]" />
                </div>
                <p className="font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] flex-1 text-left">
                  Settings
                </p>
                <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
              </button>

              {/* View Schedule */}
              <button 
                onClick={() => navigate("/provider/set-availability")}
                className="w-full flex items-center gap-[16px] p-[16px] rounded-[12px] transition-all active:scale-95 hover:bg-[#f5f5f5]"
              >
                <div className="w-[40px] h-[40px] rounded-full bg-[#56C490]/10 flex items-center justify-center">
                  <Clock className="w-[20px] h-[20px] text-[#56C490]" />
                </div>
                <p className="font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] flex-1 text-left">
                  View Schedule
                </p>
                <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
              </button>

              {/* Help & Support */}
              <button 
                onClick={() => navigate("/provider/help-support")}
                className="w-full flex items-center gap-[16px] p-[16px] rounded-[12px] transition-all active:scale-95 hover:bg-[#f5f5f5]"
              >
                <div className="w-[40px] h-[40px] rounded-full bg-[#56C490]/10 flex items-center justify-center">
                  <HelpCircle className="w-[20px] h-[20px] text-[#56C490]" />
                </div>
                <p className="font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] flex-1 text-left">
                  Help & Support
                </p>
                <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
              </button>

              {/* Service History */}
              <button 
                onClick={() => navigate("/provider/service-history")}
                className="w-full flex items-center gap-[16px] p-[16px] rounded-[12px] transition-all active:scale-95 hover:bg-[#f5f5f5]"
              >
                <div className="w-[40px] h-[40px] rounded-full bg-[#56C490]/10 flex items-center justify-center">
                  <History className="w-[20px] h-[20px] text-[#56C490]" />
                </div>
                <p className="font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] flex-1 text-left">
                  Service History
                </p>
                <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
              </button>

              {/* Divider */}
              <div className="h-[1px] bg-[#e5e5e5] my-[12px]" />

              {/* Log Out */}
              <button 
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center gap-[16px] p-[16px] rounded-[12px] transition-all active:scale-95 hover:bg-[#fee]"
              >
                <div className="w-[40px] h-[40px] rounded-full bg-[#D32F2F]/10 flex items-center justify-center">
                  <LogOut className="w-[20px] h-[20px] text-[#D32F2F]" />
                </div>
                <p className="font-['Nunito',sans-serif] text-[15px] text-[#D32F2F] flex-1 text-left">
                  Log Out
                </p>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] flex-shrink-0">
        <div className="flex justify-around items-center px-[24px] pt-[12px]">
          <button
            onClick={() => setActiveTab("home")}
            className="flex flex-col items-center gap-[4px] py-[8px] flex-1 transition-all active:scale-90"
          >
            <Home
              className={`w-[24px] h-[24px] ${
                activeTab === "home" ? "text-[#56C490]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`font-['Nunito',sans-serif] text-[10px] ${
                activeTab === "home" ? "text-[#56C490]" : "text-[#9CA3AF]"
              }`}
            >
              Home
            </span>
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className="flex flex-col items-center gap-[4px] py-[8px] flex-1 transition-all active:scale-90"
          >
            <MessageCircle
              className={`w-[24px] h-[24px] ${
                activeTab === "messages" ? "text-[#56C490]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`font-['Nunito',sans-serif] text-[10px] ${
                activeTab === "messages" ? "text-[#56C490]" : "text-[#9CA3AF]"
              }`}
            >
              Messages
            </span>
          </button>

          <button
            onClick={() => setActiveTab("more")}
            className="flex flex-col items-center gap-[4px] py-[8px] flex-1 transition-all active:scale-90"
          >
            <MoreHorizontal
              className={`w-[24px] h-[24px] ${
                activeTab === "more" ? "text-[#56C490]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`font-['Nunito',sans-serif] text-[10px] ${
                activeTab === "more" ? "text-[#56C490]" : "text-[#9CA3AF]"
              }`}
            >
              More
            </span>
          </button>
        </div>

        {/* Home Indicator */}
        <div className="h-[34px] bg-white relative">
          <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-[24px] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] w-[300px]">
            <h2 className="font-['Nunito',sans-serif] text-[20px] text-[#111827] mb-[16px]">
              Logout
            </h2>
            <p className="font-['Nunito',sans-serif] text-[15px] text-[#6B7280] mb-[24px]">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-[12px]">
              <button
                onClick={handleCancelLogout}
                className="bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-[8px] font-['Nunito',sans-serif] text-[13px] text-[#374151] transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="bg-[#56C490] hover:bg-[#00a055] rounded-[8px] font-['Nunito',sans-serif] text-[13px] text-white transition-all active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}