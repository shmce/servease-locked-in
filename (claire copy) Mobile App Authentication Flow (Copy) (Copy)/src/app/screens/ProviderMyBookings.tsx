import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search, Filter, MapPin, Clock, User, Phone, Navigation } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { useBooking } from "../contexts/BookingContext";
import { bookingsData, type Booking, type TabType } from "../data/bookings";

export default function ProviderMyBookings() {
  const navigate = useNavigate();
  const { updateBookingStatus, bookingStatuses: globalBookingStatuses } = useBooking();
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterServiceType, setFilterServiceType] = useState("");
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});
  const [bookingStatuses, setBookingStatuses] = useState<{ [key: string]: { status: string; statusColor: string } }>({});

  const getTabCount = (tab: TabType) => bookingsData[tab].length;

  const handleConfirmBooking = (bookingId: string) => {
    setBookingStatuses({
      ...bookingStatuses,
      [bookingId]: { status: "Confirmed", statusColor: "#56C490" }
    });
    updateBookingStatus(bookingId, "confirmed", "#56C490");
  };

  const currentBookings = bookingsData[activeTab].filter((booking) =>
    booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  ).map((booking) => {
    // Apply status override if exists
    if (bookingStatuses[booking.id]) {
      return {
        ...booking,
        status: bookingStatuses[booking.id].status,
        statusColor: bookingStatuses[booking.id].statusColor
      };
    }
    return booking;
  });

  const renderActionButtons = (booking: Booking) => {
    const isPending = booking.status === "Pending";
    
    switch (activeTab) {
      case "upcoming":
        if (isPending) {
          return (
            <div className="space-y-[8px] mt-[12px]">
              <button 
                onClick={() => handleConfirmBooking(booking.id)}
                className="w-full px-[12px] py-[10px] bg-[#56C490] text-white font-['Nunito',sans-serif] text-[13px] rounded-[8px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.15)]"
              >
                Confirm
              </button>
              <button 
                onClick={() => navigate(`/provider/booking-details/${booking.id}`)}
                className="w-full px-[12px] py-[10px] border-2 border-[#e5e5e5] text-[#1a1a1a] font-['Nunito',sans-serif] text-[13px] rounded-[8px] transition-all active:scale-95"
              >
                View Details
              </button>
            </div>
          );
        }
        return (
          <div className="grid grid-cols-2 gap-[8px] mt-[12px]">
            <button 
              onClick={() => navigate(`/provider/booking-details/${booking.id}`)}
              className="px-[12px] py-[10px] bg-[#56C490] text-white font-['Nunito',sans-serif] text-[13px] rounded-[8px] transition-all active:scale-95"
            >
              View Details
            </button>
            <button className="px-[12px] py-[10px] border-2 border-[#56C490] text-[#56C490] font-['Nunito',sans-serif] text-[13px] rounded-[8px] transition-all active:scale-95 flex items-center justify-center gap-[4px]">
              <Navigation className="w-[14px] h-[14px]" />
              Directions
            </button>
          </div>
        );
      case "inProgress":
        return (
          <div className="mt-[12px]">
            <button 
              onClick={() => navigate(`/provider/booking-details/${booking.id}`)}
              className="w-full px-[12px] py-[10px] bg-[#56C490] text-white font-['Nunito',sans-serif] text-[13px] rounded-[8px] transition-all active:scale-95"
            >
              Continue Service
            </button>
          </div>
        );
      case "completed":
        return (
          <div className="mt-[12px]">
            <button 
              onClick={() => navigate(`/provider/booking-details/${booking.id}`)}
              className="w-full px-[12px] py-[10px] border-2 border-[#e5e5e5] text-[#1a1a1a] font-['Nunito',sans-serif] text-[13px] rounded-[8px] transition-all active:scale-95"
            >
              View Details
            </button>
          </div>
        );
      case "cancelled":
        return (
          <div className="mt-[12px]">
            <button 
              onClick={() => navigate(`/provider/booking-details/${booking.id}`)}
              className="w-full px-[12px] py-[10px] border-2 border-[#e5e5e5] text-[#1a1a1a] font-['Nunito',sans-serif] text-[13px] rounded-[8px] transition-all active:scale-95"
            >
              View Details
            </button>
          </div>
        );
      default:
        return null;
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
            My Bookings
          </h2>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex-shrink-0 bg-white border-b border-[#f2f2f2]">
        <div className="flex px-[24px] overflow-x-auto">
          {([
            { key: "upcoming" as TabType, label: "Upcoming", showBadge: true },
            { key: "inProgress" as TabType, label: "In Progress", showBadge: true },
            { key: "completed" as TabType, label: "Completed", showBadge: false },
            { key: "cancelled" as TabType, label: "Cancelled", showBadge: false }
          ]).map(({ key, label, showBadge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 min-w-0 py-[16px] relative font-['Nunito',sans-serif] text-[12px] transition-all whitespace-nowrap ${
                activeTab === key ? "text-[#56C490]" : "text-[#9CA3AF]"
              }`}
            >
              <div className="flex items-center justify-center gap-[2px]">
                <span>{label}</span>
                {showBadge && (
                  <div
                    className={`relative -top-[6px] min-w-[16px] h-[16px] rounded-full px-[4px] flex items-center justify-center font-['Nunito',sans-serif] text-[10px] ${
                      activeTab === key
                        ? "bg-[#56C490] text-white"
                        : "bg-[#f5f5f5] text-[#9CA3AF]"
                    }`}
                  >
                    {getTabCount(key)}
                  </div>
                )}
              </div>
              {activeTab === key && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#56C490]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex-shrink-0 px-[24px] py-[16px] bg-white">
        <div className="flex gap-[12px]">
          <div className="flex-1 relative">
            <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookings"
              className="w-full pl-[44px] pr-[16px] py-[12px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
            />
          </div>
          <button
            className="w-[48px] h-[48px] bg-[#f5f5f5] rounded-[12px] flex items-center justify-center transition-all active:scale-95 hover:bg-[#56C490]/10"
            onClick={() => setShowFilterModal(true)}
          >
            <Filter className="w-[20px] h-[20px] text-[#1a1a1a]" />
          </button>
        </div>
      </div>

      {/* Scrollable Booking Cards */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[24px]">
        {currentBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px]">
            <div className="w-[80px] h-[80px] bg-[#f5f5f5] rounded-full flex items-center justify-center mb-[16px]">
              <Clock className="w-[40px] h-[40px] text-[#9CA3AF]" />
            </div>
            <p className="font-['Nunito',sans-serif] text-[16px] text-[#1a1a1a] mb-[8px]">
              No bookings found
            </p>
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#9CA3AF] text-center px-[40px]">
              {searchQuery
                ? "Try adjusting your search"
                : `You don't have any ${activeTab} bookings yet`}
            </p>
          </div>
        ) : (
          <div className="space-y-[16px]">
            {currentBookings.map((booking) => (
              <div
                key={booking.id}
                className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] bg-white"
              >
                {/* Reference Number */}
                <div className="flex items-center justify-between mb-[12px]">
                  <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
                    {booking.referenceNumber}
                  </p>
                  <div
                    className="px-[10px] py-[4px] rounded-[6px]"
                    style={{ backgroundColor: `${booking.statusColor}15` }}
                  >
                    <p
                      className="font-['Nunito',sans-serif] text-[11px]"
                      style={{ color: booking.statusColor }}
                    >
                      {booking.status}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="flex items-center gap-[12px] mb-[12px]">
                  <img
                    src={booking.customerPhoto}
                    alt={booking.customerName}
                    className="w-[48px] h-[48px] rounded-full object-cover border-2 border-[#f5f5f5]"
                  />
                  <div className="flex-1">
                    <h3 className="font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] mb-[2px]">
                      {booking.customerName}
                    </h3>
                    <p className="font-['Nunito',sans-serif] text-[13px] text-[#56C490]">
                      {booking.serviceType}
                    </p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-[8px] mb-[8px]">
                  <Clock className="w-[16px] h-[16px] text-[#666]" />
                  <p className="font-['Nunito',sans-serif] text-[13px] text-[#666]">
                    {booking.date} at {booking.time}
                  </p>
                </div>

                {/* Location */}
                <div className="flex items-center gap-[8px] mb-[12px]">
                  <MapPin className="w-[16px] h-[16px] text-[#666] flex-shrink-0" />
                  <p className="font-['Nunito',sans-serif] text-[13px] text-[#666] flex-1">
                    {booking.location}
                    {booking.distance && (
                      <span className="font-['Nunito',sans-serif] text-[#56C490] ml-[4px]">
                        ({booking.distance} away)
                      </span>
                    )}
                  </p>
                </div>

                {/* Amount */}
                <div className="border-t border-[#f2f2f2] pt-[12px] mb-[12px]">
                  <div className="flex items-center justify-between">
                    <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">
                      Total Amount
                    </p>
                    <p className="font-['Nunito',sans-serif] text-[18px] text-[#1a1a1a]">
                      ₱{booking.amount}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {renderActionButtons(booking)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 px-[24px]">
          <div className="bg-white w-full max-w-[360px] rounded-[16px] p-[24px]">
            <h3 className="font-['Nunito',sans-serif] text-[18px] text-[#111827] mb-[20px]">
              Filter Bookings
            </h3>
            
            <div className="space-y-[16px]">
              {/* Date From */}
              <div>
                <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                  Date From
                </label>
                <input
                  type="date"
                  id="dateFrom"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all [color-scheme:light] [&::-webkit-datetime-edit]:text-[#9CA3AF] [&::-webkit-calendar-picker-indicator]:opacity-50"
                  style={{ colorScheme: 'light' }}
                />
              </div>

              {/* Date To */}
              <div>
                <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                  Date To
                </label>
                <input
                  type="date"
                  id="dateTo"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all [color-scheme:light] [&::-webkit-datetime-edit]:text-[#9CA3AF] [&::-webkit-calendar-picker-indicator]:opacity-50"
                  style={{ colorScheme: 'light' }}
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                  Service Type
                </label>
                <input
                  type="text"
                  id="serviceType"
                  value={filterServiceType}
                  onChange={(e) => setFilterServiceType(e.target.value)}
                  placeholder="e.g., Plumbing, Electrical"
                  className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-[12px] mt-[24px]">
              <button
                className="flex-1 px-[16px] py-[12px] bg-transparent border-2 border-[#e5e5e5] text-[#1a1a1a] font-['Nunito',sans-serif] text-[14px] rounded-[12px] transition-all active:scale-95 hover:border-[#56C490]"
                onClick={() => {
                  setFilterDateFrom("");
                  setFilterDateTo("");
                  setFilterServiceType("");
                  setShowFilterModal(false);
                }}
              >
                Clear
              </button>
              <button
                className="flex-1 px-[16px] py-[12px] bg-[#56C490] text-white font-['Nunito',sans-serif] text-[14px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)]"
                onClick={() => setShowFilterModal(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}