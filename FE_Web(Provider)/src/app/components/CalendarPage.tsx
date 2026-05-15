import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, X, DollarSign, Users, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { useProviderData } from "../context/ProviderDataContext";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #F9FAFB, rgba(16, 185, 129, 0.05))",
    padding: "32px",
  },
  maxWidthContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  pageHeader: {
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "12px",
    letterSpacing: "-0.025em",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "24px",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  primaryButton: {
    backgroundColor: "#00BF63",
    color: "white",
    boxShadow: "0 4px 16px rgba(0, 191, 99, 0.25)",
  },
  secondaryButton: {
    backgroundColor: "#F9FAFB",
    color: "#6B7280",
    border: "1px solid #E5E7EB",
  },
};

interface Booking {
  id: number;
  time: string;
  service: string;
  customer: string;
}

export function CalendarPage() {
  const navigate = useNavigate();
  const { blockedDates, providerData } = useProviderData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"Month" | "Week" | "Day">("Month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("");

  // Sample data
  const bookings: { [key: string]: Booking[] } = {
    "2026-03-20": [
      { id: 1, time: "9:00 AM", service: "House Cleaning", customer: "John D." },
      { id: 2, time: "2:00 PM", service: "Plumbing", customer: "Sarah M." },
    ],
    "2026-03-22": [
      { id: 3, time: "10:00 AM", service: "Electrical", customer: "Mike R." },
    ],
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getWeekDays = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const sunday = new Date(date.getFullYear(), date.getMonth(), diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(sunday);
      currentDay.setDate(sunday.getDate() + i);
      days.push(currentDay);
    }
    return days;
  };

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isTodayDate = (date: Date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const hasBooking = (day: number) => {
    const dateStr = formatDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
    return bookings[dateStr] && bookings[dateStr].length > 0;
  };

  const hasBookingDate = (date: Date) => {
    const dateStr = formatDate(date);
    return bookings[dateStr] && bookings[dateStr].length > 0;
  };

  const isBlocked = (day: number) => {
    const dateStr = formatDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
    return blockedDates.includes(dateStr);
  };

  const isBlockedDate = (date: Date) => {
    const dateStr = formatDate(date);
    return blockedDates.includes(dateStr);
  };

const isAvailable = (day: number) => {
  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  
  // Only return false if user explicitly set this day as unavailable
  if (
    providerData?.availability &&
    providerData.availability[dayName] &&
    providerData.availability[dayName].available === false
  ) {
    return false;
  }

  // Default: ALL days including Saturday and Sunday are green
  return true;
};
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(selected);
  };

  const handleAddEvent = () => {
    // Handle event creation
    setShowEventModal(false);
    setEventTitle("");
    setEventTime("");
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const selectedDateStr = selectedDate ? formatDate(selectedDate) : "";
  const selectedBookings = selectedDateStr ? bookings[selectedDateStr] || [] : [];

  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM",
  ];

  const weekDays = getWeekDays(currentDate);

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Calendar</h1>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>
            Manage your bookings and availability
          </p>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          {/* View Switcher */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              backgroundColor: "#F3F4F6",
              padding: "4px",
              borderRadius: "12px",
            }}
          >
            {(["Month", "Week", "Day"] as const).map((viewOption) => (
              <button
                key={viewOption}
                onClick={() => setView(viewOption)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: view === viewOption ? "white" : "transparent",
                  color: view === viewOption ? "#00BF63" : "#6B7280",
                  boxShadow:
                    view === viewOption
                      ? "0 1px 3px rgba(0, 0, 0, 0.1)"
                      : "none",
                  transition: "all 0.3s ease",
                }}
              >
                {viewOption}
              </button>
            ))}
          </div>

          {/* Today Button */}
          <button
            onClick={goToToday}
            style={{
              ...styles.button,
              ...styles.secondaryButton,
            }}
          >
            <CalendarIcon style={{ width: "16px", height: "16px" }} />
            Today
          </button>
        </div>

        {/* Main Layout */}
        <div style={{ display: "flex", gap: "24px" }}>
          {/* Calendar Section */}
          <div style={{ flex: 1 }}>
            <div style={styles.card}>
              {/* Navigation Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                }}
              >
                <button
                  onClick={view === "Month" ? goToPreviousMonth : view === "Week" ? goToPreviousWeek : goToPreviousDay}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                    backgroundColor: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F9FAFB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  <ChevronLeft style={{ width: "20px", height: "20px" }} />
                </button>

                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#111827",
                  }}
                >
                  {view === "Month" && `${monthName} ${year}`}
                  {view === "Week" && `Week of ${weekDays[0].toLocaleDateString("default", { month: "short", day: "numeric" })} - ${weekDays[6].toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}`}
                  {view === "Day" && currentDate.toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </h2>

                <button
                  onClick={view === "Month" ? goToNextMonth : view === "Week" ? goToNextWeek : goToNextDay}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                    backgroundColor: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F9FAFB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  <ChevronRight style={{ width: "20px", height: "20px" }} />
                </button>
              </div>

              {/* Month View */}
              {view === "Month" && (
                <div>
                  {/* Day Headers */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          style={{
                            textAlign: "center",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#6B7280",
                            padding: "8px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  {/* Calendar Days */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: "8px",
                    }}
                  >
                    {/* Empty cells for days before the start of the month */}
                    {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                      <div key={`empty-${index}`} />
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const day = index + 1;
                      const today = isToday(day);
                      const dateStr = formatDate(
                        new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                      );
                      const dayBookings = bookings[dateStr] || [];
                      const hasBookingToday = dayBookings.length > 0;
                      const bookingCount = dayBookings.length;
                      const dayEarnings = dayBookings.length * 1500; // Mock earnings
                      const isBlockedToday = isBlocked(day);
                      const isAvailableToday = isAvailable(day);
                      const isSelected =
                        selectedDate &&
                        selectedDate.getDate() === day &&
                        selectedDate.getMonth() === currentDate.getMonth() &&
                        selectedDate.getFullYear() === currentDate.getFullYear();

                      return (
                        <div
                          key={day}
                          onClick={() => handleDateClick(day)}
                          style={{
                            aspectRatio: "1",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "10px",
                            cursor: "pointer",
                            border: today ? "2px solid #00BF63" : "1px solid #F3F4F6",
                            backgroundColor: isBlockedToday
                              ? "#FEE2E2"
                              : isSelected
                              ? "#E0F2FE"
                              : isAvailableToday && !hasBookingToday
                              ? "#F0FDF8"
                              : "white",
                            transition: "all 0.3s ease",
                            position: "relative",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = "#F9FAFB";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = isBlockedToday
                                ? "#FEE2E2"
                                : isAvailableToday && !hasBookingToday
                                ? "#F0FDF8"
                                : "white";
                            }
                          }}
                        >
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: today ? "700" : "600",
                              color: today ? "#00BF63" : "#111827",
                            }}
                          >
                            {day}
                          </span>
                          {hasBookingToday && (
                            <>
                              <div
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  backgroundColor: "#3B82F6",
                                  marginTop: "4px",
                                }}
                              />
                              <div
                                style={{
                                  fontSize: "9px",
                                  color: "#6B7280",
                                  fontWeight: "600",
                                  marginTop: "2px",
                                }}
                              >
                                {bookingCount} booking{bookingCount > 1 ? "s" : ""}
                              </div>
                              <div
                                style={{
                                  fontSize: "8px",
                                  color: "#059669",
                                  fontWeight: "600",
                                }}
                              >
                                ₱{dayEarnings}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div
                    style={{
                      display: "flex",
                      gap: "24px",
                      marginTop: "24px",
                      paddingTop: "24px",
                      borderTop: "1px solid #F3F4F6",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: "#3B82F6",
                        }}
                      />
                      <span style={{ fontSize: "13px", color: "#6B7280" }}>
                        Has Bookings
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "4px",
                          backgroundColor: "#FEE2E2",
                          border: "1px solid #FCA5A5",
                        }}
                      />
                      <span style={{ fontSize: "13px", color: "#6B7280" }}>
                        Blocked
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "4px",
                          backgroundColor: "#F0FDF8",
                          border: "1px solid #A7F3D0",
                        }}
                      />
                      <span style={{ fontSize: "13px", color: "#6B7280" }}>
                        Available
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Week View */}
              {view === "Week" && (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px repeat(7, 1fr)",
                      gap: "8px",
                    }}
                  >
                    {/* Time column header (empty) */}
                    <div />
                    
                    {/* Day headers */}
                    {weekDays.map((day) => {
                      const isDayBlocked = isBlockedDate(day);
                      return (
                        <div
                          key={day.toISOString()}
                          style={{
                            textAlign: "center",
                            padding: "8px",
                            borderRadius: "8px",
                            backgroundColor: isDayBlocked 
                              ? "#FEE2E2" 
                              : isTodayDate(day) 
                              ? "#D1FAE5" 
                              : "#F9FAFB",
                            border: isDayBlocked ? "1px solid #FCA5A5" : "none",
                          }}
                        >
                          <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: "600", textTransform: "uppercase" }}>
                            {day.toLocaleDateString("default", { weekday: "short" })}
                          </div>
                          <div style={{ fontSize: "16px", fontWeight: "bold", color: isDayBlocked ? "#DC2626" : isTodayDate(day) ? "#00BF63" : "#111827", marginTop: "4px" }}>
                            {day.getDate()}
                          </div>
                          {isDayBlocked && (
                            <div style={{ fontSize: "9px", color: "#DC2626", fontWeight: "600", marginTop: "2px" }}>
                              BLOCKED
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Time slots */}
                  <div style={{ marginTop: "16px", maxHeight: "500px", overflowY: "auto" }}>
                    {timeSlots.map((slot) => (
                      <div
                        key={slot}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "60px repeat(7, 1fr)",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        <div style={{ fontSize: "12px", color: "#6B7280", textAlign: "right", paddingTop: "8px" }}>
                          {slot}
                        </div>
                        {weekDays.map((day) => {
                          const dateStr = formatDate(day);
                          const dayBookings = bookings[dateStr] || [];
                          const slotBooking = dayBookings.find(b => b.time === slot);
                          
                          return (
                            <div
                              key={day.toISOString()}
                              onClick={() => setSelectedDate(day)}
                              style={{
                                minHeight: "60px",
                                border: "1px solid #E5E7EB",
                                borderRadius: "8px",
                                backgroundColor: slotBooking ? "#DBEAFE" : "white",
                                cursor: "pointer",
                                padding: "4px",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (!slotBooking) e.currentTarget.style.backgroundColor = "#F9FAFB";
                              }}
                              onMouseLeave={(e) => {
                                if (!slotBooking) e.currentTarget.style.backgroundColor = "white";
                              }}
                            >
                              {slotBooking && (
                                <div style={{ fontSize: "11px", fontWeight: "600", color: "#1E40AF" }}>
                                  {slotBooking.service}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Day View */}
              {view === "Day" && (
                <div>
                  {/* Blocked Date Banner */}
                  {isBlockedDate(currentDate) && (
                    <div
                      style={{
                        backgroundColor: "#FEE2E2",
                        border: "1px solid #FCA5A5",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "#DC2626",
                        }}
                      />
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#DC2626" }}>
                        This day is blocked - No bookings available
                      </span>
                    </div>
                  )}
                  
                  <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                    {timeSlots.map((slot) => {
                      const dateStr = formatDate(currentDate);
                      const dayBookings = bookings[dateStr] || [];
                      const slotBooking = dayBookings.find(b => b.time === slot);

                      return (
                        <div
                          key={slot}
                          style={{
                            display: "flex",
                            gap: "16px",
                            marginBottom: "12px",
                            alignItems: "flex-start",
                          }}
                        >
                          <div style={{ width: "80px", fontSize: "14px", color: "#6B7280", fontWeight: "600", paddingTop: "8px" }}>
                            {slot}
                          </div>
                          <div
                            onClick={() => setSelectedDate(currentDate)}
                            style={{
                              flex: 1,
                              minHeight: "80px",
                              border: slotBooking ? "2px solid #3B82F6" : "1px solid #E5E7EB",
                              borderRadius: "12px",
                              backgroundColor: slotBooking ? "#EFF6FF" : "white",
                              cursor: "pointer",
                              padding: "12px",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (!slotBooking) e.currentTarget.style.backgroundColor = "#F9FAFB";
                            }}
                            onMouseLeave={(e) => {
                              if (!slotBooking) e.currentTarget.style.backgroundColor = "white";
                            }}
                          >
                            {slotBooking ? (
                              <div>
                                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#111827", marginBottom: "4px" }}>
                                  {slotBooking.service}
                                </div>
                                <div style={{ fontSize: "14px", color: "#6B7280" }}>
                                  Customer: {slotBooking.customer}
                                </div>
                              </div>
                            ) : (
                              <div style={{ fontSize: "13px", color: "#9CA3AF", textAlign: "center", paddingTop: "20px" }}>
                                Available
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Day View Panel */}
          {selectedDate && (
            <div style={{ width: "400px" }}>
              <div style={styles.card}>
                {/* Panel Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#111827",
                    }}
                  >
                    {selectedDate.toLocaleDateString("default", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <button
                    onClick={() => setSelectedDate(null)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      backgroundColor: "#F3F4F6",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X style={{ width: "16px", height: "16px", color: "#6B7280" }} />
                  </button>
                </div>

                {/* Summary Stats */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    backgroundColor: "#F9FAFB",
                    borderRadius: "10px",
                    marginBottom: "20px",
                    fontSize: "12px",
                    color: "#6B7280",
                    fontWeight: "600",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <CalendarIcon size={14} color="#00BF63" />
                    {selectedBookings.length} Booking{selectedBookings.length !== 1 ? "s" : ""}
                  </div>
                  <span>•</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <DollarSign size={14} color="#00BF63" />
                    ₱{selectedBookings.length * 1500}
                  </div>
                  <span>•</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={14} color="#00BF63" />
                    {timeSlots.length - selectedBookings.length} Available
                  </div>
                </div>

                {/* Bookings for the day */}
                {selectedBookings.length > 0 ? (
                  <div style={{ marginBottom: "20px" }}>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6B7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "12px",
                      }}
                    >
                      Bookings
                    </p>
                    {selectedBookings.map((booking) => (
                      <div
                        key={booking.id}
                        style={{
                          backgroundColor: "#F0FDF8",
                          border: "1px solid #A7F3D0",
                          borderRadius: "12px",
                          padding: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "4px",
                          }}
                        >
                          <Clock
                            style={{ width: "14px", height: "14px", color: "#00BF63" }}
                          />
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#00BF63",
                            }}
                          >
                            {booking.time}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#111827",
                            marginBottom: "2px",
                          }}
                        >
                          {booking.service}
                        </p>
                        <p style={{ fontSize: "13px", color: "#6B7280" }}>
                          {booking.customer}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      marginBottom: "20px",
                      backgroundColor: "#F0FDF8",
                      borderRadius: "12px",
                      border: "1px solid #D1FAE5",
                    }}
                  >
                    <CheckCircle size={32} color="#00BF63" style={{ margin: "0 auto 12px" }} />
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#065F46", marginBottom: "4px" }}>
                      No bookings for this day
                    </p>
                    <p style={{ fontSize: "12px", color: "#6B7280" }}>
                      You're fully available. You can accept new bookings.
                    </p>
                  </div>
                )}

                {/* Working Hours Info */}
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#F9FAFB",
                    borderRadius: "10px",
                    marginBottom: "12px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Clock size={14} color="#6B7280" />
                    <p style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>
                      Working Hours
                    </p>
                  </div>
                  <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "4px" }}>
                    8:00 AM – 5:00 PM
                  </p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF" }}>
                    Break: 12:00 PM – 1:00 PM
                  </p>
                </div>

                {/* Available Time Slots */}
                <div style={{ marginBottom: "20px" }}>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "12px",
                    }}
                  >
                    Time Slots
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "8px",
                    }}
                  >
                    {timeSlots.slice(0, 8).map((slot, idx) => {
                      const isBooked = selectedBookings.some(b => b.time === slot);
                      const isBreak = slot === "12:00 PM";
                      const StatusIcon = isBooked ? XCircle : isBreak ? MinusCircle : CheckCircle;
                      const status = isBooked ? "Booked" : isBreak ? "Blocked" : "Available";
                      const bgColor = isBooked ? "#EFF6FF" : isBreak ? "#FEE2E2" : "#F0FDF8";
                      const borderColor = isBooked ? "#3B82F6" : isBreak ? "#FCA5A5" : "#A7F3D0";
                      const textColor = isBooked ? "#1E40AF" : isBreak ? "#DC2626" : "#065F46";
                      
                      return (
                        <div
                          key={slot}
                          style={{
                            padding: "10px",
                            backgroundColor: bgColor,
                            border: `2px solid ${borderColor}`,
                            borderRadius: "10px",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: textColor,
                            textAlign: "center",
                            transition: "all 0.2s ease",
                            cursor: !isBooked ? "pointer" : "default",
                          }}
                          onMouseEnter={(e) => {
                            if (!isBooked && !isBreak) {
                              e.currentTarget.style.transform = "translateY(-2px)";
                              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 191, 99, 0.2)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginBottom: "4px" }}>
                            <StatusIcon size={12} />
                            <span>{slot}</span>
                          </div>
                          <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {status}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    paddingTop: "20px",
                    borderTop: "1px solid #F3F4F6",
                  }}
                >
                  <button
                    onClick={() => navigate(`/provider/availability?day=${selectedDate.getDay()}`)}
                    style={{
                      ...styles.button,
                      ...styles.primaryButton,
                      width: "100%",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#059669";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 191, 99, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#00BF63";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 191, 99, 0.25)";
                    }}
                  >
                    <Clock size={16} />
                    Set working hours
                  </button>
                  <button
                    onClick={() => setShowEventModal(true)}
                    style={{
                      ...styles.button,
                      ...styles.secondaryButton,
                      width: "100%",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F3F4F6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#F9FAFB";
                    }}
                  >
                    <CalendarIcon size={16} />
                    Add personal event
                  </button>
                  <button
                    onClick={() => navigate(`/provider/block-time?date=${selectedDateStr}`)}
                    style={{
                      ...styles.button,
                      width: "100%",
                      backgroundColor: "white",
                      color: "#DC2626",
                      border: "2px solid #FCA5A5",
                      boxShadow: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#FEF2F2";
                      e.currentTarget.style.borderColor = "#DC2626";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                      e.currentTarget.style.borderColor = "#FCA5A5";
                    }}
                  >
                    <XCircle size={16} />
                    Block this day
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowEventModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "24px",
              width: "400px",
              maxWidth: "90%",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "16px",
              }}
            >
              Add Personal Event
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px", display: "block" }}>
                  Event Title
                </label>
                <input
                  type="text"
                  placeholder="Event Title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #E5E7EB",
                    fontSize: "14px",
                    color: "#111827",
                    width: "100%",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#00BF63";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px", display: "block" }}>
                  Time
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Clock
                    style={{ width: "16px", height: "16px", color: "#00BF63" }}
                  />
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "2px solid #E5E7EB",
                      fontSize: "14px",
                      color: "#111827",
                      flex: 1,
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#00BF63";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                    }}
                  />
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <button
                style={{
                  ...styles.button,
                  ...styles.secondaryButton,
                }}
                onClick={() => setShowEventModal(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                }}
                onClick={handleAddEvent}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#059669";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#00BF63";
                }}
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}