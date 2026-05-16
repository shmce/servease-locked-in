import { useEffect, useMemo, useState } from "react";
import { Search, Filter, MapPin, Calendar, Clock, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router";
import {
  getStoredProviderAccessToken,
  listProviderBookings,
  updateProviderBookingStatus,
  type BookingStatus,
  type BookingSummary,
} from "../../services/serveaseProviderApi";

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
  dangerButton: {
    backgroundColor: "white",
    color: "#DC2626",
    border: "1px solid #FEE2E2",
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
  card: {
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
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  customerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
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
  details: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap" as const,
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#6B7280",
  },
  price: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "12px",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
    marginBottom: "12px",
  },
  actionButtons: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    minWidth: "180px",
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

type TabType = "new-requests" | "upcoming" | "in-progress" | "completed" | "cancelled" | "declined";

interface Item {
  id: string;
  backendStatus: BookingStatus;
  customerName: string;
  serviceType: string;
  date: string;
  time: string;
  location: string;
  distance?: string;
  price: number;
  status: TabType;
}

function toTabStatus(status: BookingStatus): TabType {
  switch (status) {
    case "pending":
      return "new-requests";
    case "confirmed":
      return "upcoming";
    case "in_progress":
      return "in-progress";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    case "rejected":
      return "declined";
    default:
      return "upcoming";
  }
}

function formatBookingDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatBookingTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function toItem(booking: BookingSummary): Item {
  return {
    id: booking.id,
    backendStatus: booking.status,
    customerName: booking.customerFullName || "ServEase Customer",
    serviceType: booking.serviceTitle || "Service Booking",
    date: formatBookingDate(booking.scheduledAt),
    time: formatBookingTime(booking.scheduledAt),
    location: booking.serviceAddress || "Address unavailable",
    price: booking.totalAmount,
    status: toTabStatus(booking.status),
  };
}

export function UnifiedBookingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("new-requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterService, setFilterService] = useState("");

  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      const token = getStoredProviderAccessToken();

      if (!token) {
        setError("Sign in to load provider bookings from the backend.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const bookings = await listProviderBookings(token);
        setItems(bookings.map(toItem));
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to load bookings.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadBookings();
  }, []);

  const filteredItems = useMemo(() => items.filter((item) => {
    if (item.status !== activeTab) return false;
    if (
      searchQuery &&
      !item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  }), [activeTab, items, searchQuery]);

  const getStatusBadgeStyle = (status: string) => {
    const baseStyle = styles.statusBadge;
    switch (status) {
      case "new-requests":
        return { ...baseStyle, backgroundColor: "#DBEAFE", color: "#1E40AF" };
      case "upcoming":
        return { ...baseStyle, backgroundColor: "#E0E7FF", color: "#4338CA" };
      case "in-progress":
        return { ...baseStyle, backgroundColor: "#FEF3C7", color: "#92400E" };
      case "completed":
        return { ...baseStyle, backgroundColor: "#D1FAE5", color: "#065F46" };
      case "cancelled":
        return { ...baseStyle, backgroundColor: "#FEE2E2", color: "#991B1B" };
      case "declined":
        return { ...baseStyle, backgroundColor: "#F3F4F6", color: "#4B5563" };
      default:
        return baseStyle;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new-requests":
        return "New Request";
      case "upcoming":
        return "Upcoming";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "declined":
        return "Declined";
      default:
        return status;
    }
  };

  const getTabCounts = () => {
    return {
      newRequests: items.filter((i) => i.status === "new-requests").length,
      upcoming: items.filter((i) => i.status === "upcoming").length,
      inProgress: items.filter((i) => i.status === "in-progress").length,
      completed: items.filter((i) => i.status === "completed").length,
      cancelled: items.filter((i) => i.status === "cancelled").length,
      declined: items.filter((i) => i.status === "declined").length,
    };
  };

  const counts = getTabCounts();

  const handleViewDetails = (item: Item) => {
    if (item.status === "new-requests") {
      navigate(`/provider/request-details/${item.id}`);
    } else {
      navigate(`/provider/booking-details/${item.id}`);
    }
  };

  const transitionItem = async (
    itemId: string,
    nextStatus: BookingStatus,
  ) => {
    const item = items.find((item) => item.id === itemId);

    if (!item) {
      return;
    }

    const token = getStoredProviderAccessToken();
    setBusyItemId(itemId);
    setError(null);

    try {
      if (!token) {
        throw new Error("Sign in to update bookings through the backend.");
      }

      const booking = await updateProviderBookingStatus(
        token,
        itemId,
        item.backendStatus,
        nextStatus,
      );
      const updatedItem = toItem(booking);
      setItems((prev) =>
        prev.map((current) => (current.id === itemId ? updatedItem : current)),
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to update booking status.",
      );
    } finally {
      setBusyItemId(null);
    }
  };

  const handleAccept = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    void transitionItem(itemId, "confirmed");
  };

  const handleReject = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    void transitionItem(itemId, "rejected");
  };

  const renderCard = (item: Item) => {
    const initials = item.customerName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    const isNewRequest = item.status === "new-requests";

    return (
      <div
        key={item.id}
        style={styles.card}
        onClick={() => handleViewDetails(item)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
          e.currentTarget.style.cursor = "pointer";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
        }}
      >
        <div style={styles.cardLeft}>
          <div style={styles.customerInfo}>
            <div style={styles.avatar}>{initials}</div>
            <div>
              <div style={styles.customerName}>{item.customerName}</div>
              <div style={styles.serviceType}>{item.serviceType}</div>
            </div>
          </div>
          <div style={styles.details}>
            <div style={styles.detailItem}>
              <Calendar size={16} />
              {item.date}
            </div>
            <div style={styles.detailItem}>
              <Clock size={16} />
              {item.time}
            </div>
            <div style={styles.detailItem}>
              <MapPin size={16} />
              {item.location}
              {item.distance && ` (${item.distance})`}
            </div>
          </div>
        </div>
        <div style={styles.cardRight}>
          <div>
            <div style={getStatusBadgeStyle(item.status)}>
              {getStatusLabel(item.status)}
            </div>
            <div style={styles.price}>₱{item.price.toLocaleString()}</div>
          </div>
          {isNewRequest && (
            <div style={styles.actionButtons}>
              <button
                disabled={busyItemId === item.id}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  opacity: busyItemId === item.id ? 0.7 : 1,
                  padding: "8px 16px",
                }}
                onClick={(e) => handleAccept(item.id, e)}
              >
                {busyItemId === item.id ? "Updating..." : "Accept"}
              </button>
              <button
                disabled={busyItemId === item.id}
                style={{
                  ...styles.button,
                  ...styles.dangerButton,
                  opacity: busyItemId === item.id ? 0.7 : 1,
                  padding: "8px 16px",
                }}
                onClick={(e) => handleReject(item.id, e)}
              >
                Reject
              </button>
            </div>
          )}
          {!isNewRequest && <ChevronRight size={20} color="#9CA3AF" />}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Bookings & Requests</h1>
          <div style={styles.searchBar}>
            <div style={styles.searchWrapper}>
              <div style={styles.searchIcon}>
                <Search size={18} />
              </div>
              <input
                type="text"
                style={styles.searchInput}
                placeholder="Search..."
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

        {error && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "12px",
              color: "#991B1B",
              fontSize: "14px",
              marginBottom: "16px",
              padding: "12px 16px",
            }}
          >
            {error}
          </div>
        )}

        {isLoading && (
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #F3F4F6",
              borderRadius: "12px",
              color: "#6B7280",
              fontSize: "14px",
              marginBottom: "16px",
              padding: "12px 16px",
            }}
          >
            Loading provider bookings...
          </div>
        )}

        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "new-requests" ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab("new-requests")}
          >
            New Requests
            <span
              style={{
                ...styles.badge,
                ...(activeTab === "new-requests" ? styles.badgeActive : {}),
              }}
            >
              {counts.newRequests}
            </span>
          </button>
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
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "declined" ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab("declined")}
          >
            Declined
            <span
              style={{
                ...styles.badge,
                ...(activeTab === "declined" ? styles.badgeActive : {}),
              }}
            >
              {counts.declined}
            </span>
          </button>
        </div>

        {filteredItems.length > 0 ? (
          filteredItems.map(renderCard)
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>
              <Calendar size={32} color="#9CA3AF" />
            </div>
            <div style={styles.emptyStateTitle}>No items found</div>
            <div style={styles.emptyStateText}>
              {searchQuery
                ? "Try adjusting your search"
                : `You don't have any ${activeTab.replace("-", " ")} at the moment`}
            </div>
          </div>
        )}

        {showFilterModal && (
          <div style={styles.modal} onClick={() => setShowFilterModal(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Filter</h2>
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

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  style={{ ...styles.button, ...styles.secondaryButton, flex: 1 }}
                  onClick={() => {
                    setFilterDateFrom("");
                    setFilterDateTo("");
                    setFilterService("");
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
