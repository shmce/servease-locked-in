import { useState } from "react";
import { Search, Filter, MapPin, Calendar, Clock, ChevronRight, X } from "lucide-react";
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
  requestCard: {
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
  requestLeft: {
    flex: 1,
  },
  requestRight: {
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
  requestDetails: {
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

interface BookingRequest {
  id: string;
  customerName: string;
  customerPhoto?: string;
  serviceType: string;
  proposedDate: string;
  proposedTime: string;
  location: string;
  initialPrice: number;
  status: "new" | "pending" | "accepted" | "declined";
}

export function BookingRequestsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"new" | "pending" | "accepted" | "declined">("new");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterService, setFilterService] = useState("");

  const requests: BookingRequest[] = [
    {
      id: "1",
      customerName: "Maria Santos",
      serviceType: "Plumbing Repair",
      proposedDate: "March 25, 2024",
      proposedTime: "2:00 PM",
      location: "123 Quezon Ave, Quezon City",
      initialPrice: 1500,
      status: "new",
    },
    {
      id: "2",
      customerName: "Juan dela Cruz",
      serviceType: "Pipe Installation",
      proposedDate: "March 26, 2024",
      proposedTime: "10:00 AM",
      location: "456 Taft Avenue, Manila",
      initialPrice: 3500,
      status: "new",
    },
    {
      id: "3",
      customerName: "Anna Reyes",
      serviceType: "Toilet Repair",
      proposedDate: "March 24, 2024",
      proposedTime: "9:00 AM",
      location: "789 Rizal Street, Makati",
      initialPrice: 800,
      status: "pending",
    },
    {
      id: "4",
      customerName: "Carlos Mendoza",
      serviceType: "Water Heater Installation",
      proposedDate: "March 27, 2024",
      proposedTime: "1:00 PM",
      location: "321 EDSA, Pasig City",
      initialPrice: 4200,
      status: "accepted",
    },
    {
      id: "5",
      customerName: "Sofia Garcia",
      serviceType: "Drain Cleaning",
      proposedDate: "March 23, 2024",
      proposedTime: "3:00 PM",
      location: "555 Aurora Blvd, San Juan",
      initialPrice: 600,
      status: "declined",
    },
  ];

  const filteredRequests = requests.filter((request) => {
    if (request.status !== activeTab) return false;
    if (
      searchQuery &&
      !request.customerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !request.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getStatusBadgeStyle = (status: string) => {
    const baseStyle = styles.statusBadge;
    switch (status) {
      case "new":
        return { ...baseStyle, backgroundColor: "#DBEAFE", color: "#1E40AF" };
      case "pending":
        return { ...baseStyle, backgroundColor: "#FEF3C7", color: "#92400E" };
      case "accepted":
        return { ...baseStyle, backgroundColor: "#D1FAE5", color: "#065F46" };
      case "declined":
        return { ...baseStyle, backgroundColor: "#FEE2E2", color: "#991B1B" };
      default:
        return baseStyle;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "New Request";
      case "pending":
        return "Pending";
      case "accepted":
        return "Accepted";
      case "declined":
        return "Declined";
      default:
        return status;
    }
  };

  const getTabCounts = () => {
    return {
      new: requests.filter((r) => r.status === "new").length,
      pending: requests.filter((r) => r.status === "pending").length,
      accepted: requests.filter((r) => r.status === "accepted").length,
      declined: requests.filter((r) => r.status === "declined").length,
    };
  };

  const counts = getTabCounts();

  const handleViewDetails = (requestId: string) => {
    navigate(`/provider/request-details/${requestId}`);
  };

  const handleAccept = (requestId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Accept request:", requestId);
    // Handle accept logic
  };

  const handleReject = (requestId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Reject request:", requestId);
    // Handle reject logic
  };

  const renderRequestCard = (request: BookingRequest) => {
    const initials = request.customerName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    return (
      <div
        key={request.id}
        style={styles.requestCard}
        onClick={() => handleViewDetails(request.id)}
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
        <div style={styles.requestLeft}>
          <div style={styles.customerInfo}>
            <div style={styles.avatar}>{initials}</div>
            <div>
              <div style={styles.customerName}>{request.customerName}</div>
              <div style={styles.serviceType}>{request.serviceType}</div>
            </div>
          </div>
          <div style={styles.requestDetails}>
            <div style={styles.detailItem}>
              <Calendar size={16} />
              {request.proposedDate}
            </div>
            <div style={styles.detailItem}>
              <Clock size={16} />
              {request.proposedTime}
            </div>
            <div style={styles.detailItem}>
              <MapPin size={16} />
              {request.location}
            </div>
          </div>
        </div>
        <div style={styles.requestRight}>
          <div>
            <div style={getStatusBadgeStyle(request.status)}>
              {getStatusLabel(request.status)}
            </div>
            <div style={styles.price}>₱{request.initialPrice.toLocaleString()}</div>
          </div>
          {request.status === "new" && (
            <div style={styles.actionButtons}>
              <button
                style={{ ...styles.button, ...styles.primaryButton, padding: "8px 16px" }}
                onClick={(e) => handleAccept(request.id, e)}
              >
                Accept
              </button>
              <button
                style={{ ...styles.button, ...styles.dangerButton, padding: "8px 16px" }}
                onClick={(e) => handleReject(request.id, e)}
              >
                Reject
              </button>
            </div>
          )}
          {request.status !== "new" && <ChevronRight size={20} color="#9CA3AF" />}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Booking Requests</h1>
          <div style={styles.searchBar}>
            <div style={styles.searchWrapper}>
              <div style={styles.searchIcon}>
                <Search size={18} />
              </div>
              <input
                type="text"
                style={styles.searchInput}
                placeholder="Search requests..."
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
              ...(activeTab === "new" ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab("new")}
          >
            New Requests
            <span
              style={{
                ...styles.badge,
                ...(activeTab === "new" ? styles.badgeActive : {}),
              }}
            >
              {counts.new}
            </span>
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "pending" ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab("pending")}
          >
            Pending
            <span
              style={{
                ...styles.badge,
                ...(activeTab === "pending" ? styles.badgeActive : {}),
              }}
            >
              {counts.pending}
            </span>
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "accepted" ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab("accepted")}
          >
            Accepted
            <span
              style={{
                ...styles.badge,
                ...(activeTab === "accepted" ? styles.badgeActive : {}),
              }}
            >
              {counts.accepted}
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

        {filteredRequests.length > 0 ? (
          filteredRequests.map(renderRequestCard)
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>
              <Calendar size={32} color="#9CA3AF" />
            </div>
            <div style={styles.emptyStateTitle}>No requests found</div>
            <div style={styles.emptyStateText}>
              {searchQuery
                ? "Try adjusting your search"
                : `You don't have any ${activeTab} requests at the moment`}
            </div>
          </div>
        )}

        {showFilterModal && (
          <div style={styles.modal} onClick={() => setShowFilterModal(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Filter Requests</h2>
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
