import { useState } from "react";
import { Search, Filter, MapPin, Clock, Calendar, Phone, MessageCircle, Navigation, CheckCircle, X, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F9FAFB",
    padding: "32px",
  },
  maxWidthContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#111827",
    letterSpacing: "-0.025em",
  },
  searchBar: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  searchInput: {
    padding: "10px 14px 10px 40px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    outline: "none",
    width: "300px",
    transition: "border-color 0.3s ease",
  },
  searchWrapper: {
    position: "relative" as const,
  },
  searchIcon: {
    position: "absolute" as const,
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9CA3AF",
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
    backgroundColor: "white",
    color: "#6B7280",
    border: "1px solid #E5E7EB",
  },
  outlinedButton: {
    backgroundColor: "white",
    color: "#00BF63",
    border: "2px solid #00BF63",
  },
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    borderBottom: "2px solid #F3F4F6",
    paddingBottom: "0px",
  },
  tab: {
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    backgroundColor: "transparent",
    color: "#6B7280",
    borderBottom: "3px solid transparent",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tabActive: {
    color: "#00BF63",
    borderBottomColor: "#00BF63",
  },
  badge: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
  },
  badgeActive: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  bookingLeft: {
    flex: 1,
  },
  bookingRight: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  refNumber: {
    fontSize: "12px",
    color: "#9CA3AF",
    marginBottom: "8px",
    fontWeight: "500",
  },
  customerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#E5E7EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "600",
    color: "#6B7280",
  },
  customerName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "2px",
  },
  serviceType: {
    fontSize: "13px",
    color: "#6B7280",
  },
  bookingDetails: {
    display: "flex",
    gap: "24px",
    marginTop: "12px",
    flexWrap: "wrap" as const,
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#6B7280",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },
  amount: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
    marginRight: "16px",
  },
  modal: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "80vh",
    overflowY: "auto" as const,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#111827",
  },
  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6B7280",
    padding: "4px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
    display: "block",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    outline: "none",
    width: "100%",
    transition: "border-color 0.3s ease",
  },
  select: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    outline: "none",
    width: "100%",
    backgroundColor: "white",
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "64px 32px",
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #F3F4F6",
  },
  emptyStateIcon: {
    width: "64px",
    height: "64px",
    backgroundColor: "#F3F4F6",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  emptyStateTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "8px",
  },
  emptyStateText: {
    fontSize: "14px",
    color: "#6B7280",
  },
};

interface Booking {
  id: string;
  refNumber: string;
  customerName: string;
  customerPhoto?: string;
  serviceType: string;
  date: string;
  time: string;
  location: string;
  distance?: string;
  status: "upcoming" | "in-progress" | "completed" | "cancelled";
  amount: number;
}

export function MyBookingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "in-progress" | "completed" | "cancelled">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const bookings: Booking[] = [
    {
      id: "1",
      refNumber: "BK-2024-001234",
      customerName: "Maria Santos",
      serviceType: "Plumbing Repair",
      date: "March 25, 2024",
      time: "2:00 PM - 4:00 PM",
      location: "123 Quezon Ave, Quezon City",
      distance: "3.2 km",
      status: "upcoming",
      amount: 1500,
    },
    {
      id: "2",
      refNumber: "BK-2024-001235",
      customerName: "Juan dela Cruz",
      serviceType: "Pipe Installation",
      date: "March 24, 2024",
      time: "10:00 AM - 2:00 PM",
      location: "456 Taft Avenue, Manila",
      status: "in-progress",
      amount: 3500,
    },
    {
      id: "3",
      refNumber: "BK-2024-001236",
      customerName: "Anna Reyes",
      serviceType: "Toilet Repair",
      date: "March 23, 2024",
      time: "9:00 AM - 11:00 AM",
      location: "789 Rizal Street, Makati",
      status: "completed",
      amount: 800,
    },
    {
      id: "4",
      refNumber: "BK-2024-001237",
      customerName: "Carlos Mendoza",
      serviceType: "Water Heater Installation",
      date: "March 26, 2024",
      time: "1:00 PM - 5:00 PM",
      location: "321 EDSA, Pasig City",
      distance: "5.8 km",
      status: "upcoming",
      amount: 4200,
    },
    {
      id: "5",
      refNumber: "BK-2024-001238",
      customerName: "Sofia Garcia",
      serviceType: "Drain Cleaning",
      date: "March 22, 2024",
      time: "3:00 PM - 4:00 PM",
      location: "555 Aurora Blvd, San Juan",
      status: "completed",
      amount: 600,
    },
    {
      id: "6",
      refNumber: "BK-2024-001239",
      customerName: "Roberto Cruz",
      serviceType: "Pipe Leak Repair",
      date: "March 21, 2024",
      time: "11:00 AM - 12:00 PM",
      location: "888 Shaw Blvd, Mandaluyong",
      status: "cancelled",
      amount: 1000,
    },
  ];

  const filteredBookings = bookings.filter((booking) => {
    if (booking.status !== activeTab) return false;
    if (searchQuery && !booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !booking.refNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !booking.serviceType.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getStatusBadgeStyle = (status: string) => {
    const baseStyle = styles.statusBadge;
    switch (status) {
      case "upcoming":
        return { ...baseStyle, backgroundColor: "#DBEAFE", color: "#1E40AF" };
      case "in-progress":
        return { ...baseStyle, backgroundColor: "#FEF3C7", color: "#92400E" };
      case "completed":
        return { ...baseStyle, backgroundColor: "#D1FAE5", color: "#065F46" };
      case "cancelled":
        return { ...baseStyle, backgroundColor: "#FEE2E2", color: "#991B1B" };
      default:
        return baseStyle;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getTabCounts = () => {
    return {
      upcoming: bookings.filter((b) => b.status === "upcoming").length,
      inProgress: bookings.filter((b) => b.status === "in-progress").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
  };

  const counts = getTabCounts();

  const handleBookingClick = (bookingId: string) => {
    navigate(`/provider/booking-details/${bookingId}`);
  };

  const renderBookingCard = (booking: Booking) => {
    const initials = booking.customerName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    return (
      <div
        key={booking.id}
        style={styles.bookingCard}
        onClick={() => handleBookingClick(booking.id)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
        }}
      >
        <div style={styles.bookingLeft}>
          <div style={styles.refNumber}>{booking.refNumber}</div>
          <div style={styles.customerInfo}>
            <div style={styles.avatar}>{initials}</div>
            <div>
              <div style={styles.customerName}>{booking.customerName}</div>
              <div style={styles.serviceType}>{booking.serviceType}</div>
            </div>
          </div>
          <div style={styles.bookingDetails}>
            <div style={styles.detailItem}>
              <Calendar size={16} />
              {booking.date}
            </div>
            <div style={styles.detailItem}>
              <Clock size={16} />
              {booking.time}
            </div>
            <div style={styles.detailItem}>
              <MapPin size={16} />
              {booking.location}
              {booking.distance && ` (${booking.distance})`}
            </div>
          </div>
        </div>
        <div style={styles.bookingRight}>
          <div style={getStatusBadgeStyle(booking.status)}>
            {getStatusLabel(booking.status)}
          </div>
          <div style={styles.amount}>₱{booking.amount.toLocaleString()}</div>
          <ChevronRight size={20} color="#9CA3AF" />
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>My Bookings</h1>
          <div style={styles.searchBar}>
            <div style={styles.searchWrapper}>
              <div style={styles.searchIcon}>
                <Search size={18} />
              </div>
              <input
                type="text"
                style={styles.searchInput}
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "#00BF63")}
                onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
              />
            </div>
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={() => setShowFilterModal(true)}
            >
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "upcoming" ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
            <span
              style={{
                ...styles.badge,
                ...(activeTab === "upcoming" ? styles.badgeActive : {}),
              }}
            >
              {counts.upcoming}
            </span>
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "in-progress" ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab("in-progress")}
          >
            In Progress
            <span
              style={{
                ...styles.badge,
                ...(activeTab === "in-progress" ? styles.badgeActive : {}),
              }}
            >
              {counts.inProgress}
            </span>
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "completed" ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab("completed")}
          >
            Completed
            <span
              style={{
                ...styles.badge,
                ...(activeTab === "completed" ? styles.badgeActive : {}),
              }}
            >
              {counts.completed}
            </span>
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "cancelled" ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab("cancelled")}
          >
            Cancelled
            <span
              style={{
                ...styles.badge,
                ...(activeTab === "cancelled" ? styles.badgeActive : {}),
              }}
            >
              {counts.cancelled}
            </span>
          </button>
        </div>

        {filteredBookings.length > 0 ? (
          filteredBookings.map(renderBookingCard)
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>
              <Calendar size={32} color="#9CA3AF" />
            </div>
            <div style={styles.emptyStateTitle}>No bookings found</div>
            <div style={styles.emptyStateText}>
              {searchQuery
                ? "Try adjusting your search"
                : `You don't have any ${activeTab.replace("-", " ")} bookings at the moment`}
            </div>
          </div>
        )}

        {showFilterModal && (
          <div style={styles.modal} onClick={() => setShowFilterModal(false)}>
            <div
              style={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Filter Bookings</h2>
                <button
                  style={styles.closeButton}
                  onClick={() => setShowFilterModal(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date Range</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <input
                    type="date"
                    style={styles.input}
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                  />
                  <input
                    type="date"
                    style={styles.input}
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Service Type</label>
                <select
                  style={styles.select}
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                >
                  <option value="">All Services</option>
                  <option value="plumbing">Plumbing Repair</option>
                  <option value="pipe">Pipe Installation</option>
                  <option value="toilet">Toilet Repair</option>
                  <option value="heater">Water Heater Installation</option>
                  <option value="drain">Drain Cleaning</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select
                  style={styles.select}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  style={{ ...styles.button, ...styles.secondaryButton, flex: 1 }}
                  onClick={() => {
                    setFilterDateFrom("");
                    setFilterDateTo("");
                    setFilterService("");
                    setFilterStatus("");
                  }}
                >
                  Clear
                </button>
                <button
                  style={{ ...styles.button, ...styles.primaryButton, flex: 1 }}
                  onClick={() => setShowFilterModal(false)}
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
