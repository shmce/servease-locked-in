import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Clock,
  Navigation,
  CheckCircle,
  Upload,
  AlertCircle,
  Image as ImageIcon,
  Send,
  DollarSign,
  Star,
  X,
} from "lucide-react";
import {
  getProviderBooking,
  getStoredProviderAccessToken,
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
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "32px",
  },
  backButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#6B7280",
    marginBottom: "16px",
    padding: "8px 0",
    transition: "color 0.3s ease",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#111827",
    letterSpacing: "-0.025em",
    marginBottom: "8px",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  statusBadge: {
    padding: "8px 16px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-block",
  },
  refNumber: {
    fontSize: "14px",
    color: "#6B7280",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "24px",
    marginBottom: "24px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "20px",
  },
  timeline: {
    display: "flex",
    justifyContent: "space-between",
    position: "relative" as const,
    marginBottom: "32px",
  },
  timelineLine: {
    position: "absolute" as const,
    top: "20px",
    left: "0",
    right: "0",
    height: "3px",
    backgroundColor: "#E5E7EB",
    zIndex: 0,
  },
  timelineProgress: {
    height: "100%",
    backgroundColor: "#00BF63",
    transition: "width 0.5s ease",
  },
  timelineStep: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    flex: 1,
    zIndex: 1,
  },
  timelineCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    border: "3px solid #E5E7EB",
    marginBottom: "8px",
    transition: "all 0.3s ease",
  },
  timelineLabel: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#9CA3AF",
    textAlign: "center" as const,
  },
  customerSection: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#E5E7EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "600",
    color: "#6B7280",
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "8px",
  },
  rating: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginBottom: "12px",
  },
  phoneNumber: {
    fontSize: "14px",
    color: "#6B7280",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
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
  detailRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    alignItems: "flex-start",
  },
  detailIcon: {
    color: "#9CA3AF",
    marginTop: "2px",
    flexShrink: 0,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: "12px",
    color: "#9CA3AF",
    marginBottom: "4px",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: "14px",
    color: "#374151",
    fontWeight: "500",
  },
  mapPlaceholder: {
    width: "100%",
    height: "200px",
    backgroundColor: "#F3F4F6",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9CA3AF",
    fontSize: "14px",
    marginTop: "12px",
    marginBottom: "12px",
    border: "2px dashed #D1D5DB",
  },
  photoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginTop: "12px",
  },
  photoItem: {
    aspectRatio: "1",
    backgroundColor: "#F3F4F6",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed #D1D5DB",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  pricingRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #F3F4F6",
  },
  pricingLabel: {
    fontSize: "14px",
    color: "#6B7280",
  },
  pricingValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 0",
    marginTop: "12px",
    borderTop: "2px solid #E5E7EB",
  },
  totalLabel: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
  },
  totalValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#00BF63",
  },
  chatContainer: {
    maxHeight: "400px",
    overflowY: "auto" as const,
    marginBottom: "16px",
  },
  chatBubble: {
    padding: "12px 16px",
    borderRadius: "12px",
    marginBottom: "12px",
    maxWidth: "70%",
  },
  chatBubbleCustomer: {
    backgroundColor: "#F3F4F6",
    marginRight: "auto",
  },
  chatBubbleProvider: {
    backgroundColor: "#D1FAE5",
    marginLeft: "auto",
  },
  chatSender: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: "4px",
  },
  chatMessage: {
    fontSize: "14px",
    color: "#374151",
  },
  chatTime: {
    fontSize: "10px",
    color: "#9CA3AF",
    marginTop: "4px",
  },
  chatInput: {
    display: "flex",
    gap: "12px",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    outline: "none",
  },
  actionButtons: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginTop: "24px",
  },
  infoBox: {
    backgroundColor: "#FEF3C7",
    border: "1px solid #FDE68A",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "20px",
    fontSize: "13px",
    color: "#92400E",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
};

function toUiStatus(status: BookingStatus): string {
  switch (status) {
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
    case "pending":
    default:
      return "pending";
  }
}

function formatDate(value: string): string {
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

function formatTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chatMessage, setChatMessage] = useState("");
  const [apiBooking, setApiBooking] = useState<BookingSummary | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      const token = getStoredProviderAccessToken();

      if (!token || !id) {
        return;
      }

      try {
        setDetailError(null);
        setApiBooking(await getProviderBooking(token, id));
      } catch (error) {
        setDetailError(
          error instanceof Error ? error.message : "Unable to load booking details.",
        );
      }
    };

    void loadBooking();
  }, [id]);

  // Mock data - in real app, fetch based on id
  const booking = apiBooking ? {
    id: apiBooking.id,
    refNumber: apiBooking.bookingReference,
    status: toUiStatus(apiBooking.status),
    customer: {
      name: apiBooking.customerFullName || "ServEase Customer",
      phone: apiBooking.customerContactNumber || "Contact unavailable",
      rating: 0,
      totalReviews: 0,
    },
    service: {
      type: apiBooking.serviceTitle || "Service Booking",
      date: formatDate(apiBooking.scheduledAt),
      time: formatTime(apiBooking.scheduledAt),
      location: apiBooking.serviceAddress || "Address unavailable",
      description: "Booking details from the ServEase gateway.",
      instructions: "-",
      estimatedDuration: "-",
      actualDuration: "-",
    },
    photos: [
      { id: 1, url: "" },
      { id: 2, url: "" },
    ],
    pricing: {
      serviceFee: apiBooking.totalAmount,
      platformFee: 0,
      yourEarnings: apiBooking.totalAmount,
    },
  } : {
    id: id || "1",
    refNumber: "BK-2024-001234",
    status: "upcoming",
    customer: {
      name: "Maria Santos",
      phone: "+63 917 123 4567",
      rating: 4.8,
      totalReviews: 24,
    },
    service: {
      type: "Plumbing Repair",
      date: "March 25, 2024",
      time: "2:00 PM - 4:00 PM",
      location: "123 Quezon Ave, Quezon City, Metro Manila",
      description:
        "Kitchen sink is leaking and water pressure is very low. Need urgent repair.",
      instructions: "Please bring extra tools. Building has no elevator.",
      estimatedDuration: "2 hours",
      actualDuration: "-",
    },
    photos: [
      { id: 1, url: "" },
      { id: 2, url: "" },
    ],
    pricing: {
      serviceFee: 1200,
      platformFee: 150,
      yourEarnings: 1050,
    },
  };

  const updateStatus = async (nextStatus: BookingStatus) => {
    const token = getStoredProviderAccessToken();

    if (!token || !apiBooking) {
      return;
    }

    setIsUpdating(true);
    setDetailError(null);

    try {
      setApiBooking(
        await updateProviderBookingStatus(
          token,
          apiBooking.id,
          apiBooking.status,
          nextStatus,
        ),
      );
    } catch (error) {
      setDetailError(
        error instanceof Error ? error.message : "Unable to update booking status.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const messages = [
    {
      id: 1,
      sender: "customer",
      name: "Maria Santos",
      message: "Hi! Just wanted to confirm the appointment for tomorrow.",
      time: "10:30 AM",
    },
    {
      id: 2,
      sender: "provider",
      name: "You",
      message: "Yes, I'll be there at 2:00 PM. I have all the necessary tools.",
      time: "10:45 AM",
    },
    {
      id: 3,
      sender: "customer",
      name: "Maria Santos",
      message: "Great! Thank you. See you tomorrow.",
      time: "10:46 AM",
    },
  ];

  const timelineSteps = [
    { label: "Requested", status: "completed" },
    { label: "Accepted", status: "completed" },
    { label: "On the Way", status: "current" },
    { label: "Arrived", status: "pending" },
    { label: "In Progress", status: "pending" },
    { label: "Completed", status: "pending" },
  ];

  const currentStepIndex = timelineSteps.findIndex((s) => s.status === "current");
  const progressPercentage = (currentStepIndex / (timelineSteps.length - 1)) * 100;

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

  const getTimelineCircleStyle = (status: string) => {
    switch (status) {
      case "completed":
        return {
          ...styles.timelineCircle,
          backgroundColor: "#00BF63",
          borderColor: "#00BF63",
        };
      case "current":
        return {
          ...styles.timelineCircle,
          backgroundColor: "white",
          borderColor: "#00BF63",
        };
      default:
        return styles.timelineCircle;
    }
  };

  const getTimelineLabelStyle = (status: string) => {
    if (status === "completed" || status === "current") {
      return { ...styles.timelineLabel, color: "#00BF63" };
    }
    return styles.timelineLabel;
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Handle message sending
      setChatMessage("");
    }
  };

  const initials = booking.customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        <div style={styles.header}>
          <button
            style={styles.backButton}
            onClick={() => navigate("/provider/bookings")}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#00BF63")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
          >
            <ArrowLeft size={18} />
            Back to Bookings
          </button>
          <div style={styles.headerRow}>
            <h1 style={styles.pageTitle}>{booking.refNumber}</h1>
            <div style={getStatusBadgeStyle(booking.status)}>
              {getStatusLabel(booking.status)}
            </div>
          </div>
          {detailError && (
            <p style={{ color: "#B91C1C", fontSize: "14px", marginTop: "12px" }}>
              {detailError}
            </p>
          )}
        </div>

        {/* Progress Timeline */}
        <div style={styles.card}>
          <div style={styles.timeline}>
            <div style={styles.timelineLine}>
              <div
                style={{ ...styles.timelineProgress, width: `${progressPercentage}%` }}
              />
            </div>
            {timelineSteps.map((step, index) => (
              <div key={index} style={styles.timelineStep}>
                <div style={getTimelineCircleStyle(step.status)}>
                  {step.status === "completed" && <CheckCircle size={20} color="white" />}
                  {step.status === "current" && (
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: "#00BF63",
                      }}
                    />
                  )}
                </div>
                <div style={getTimelineLabelStyle(step.status)}>{step.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Left Column */}
          <div>
            {/* Customer Info */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Customer Information</h2>
              <div style={styles.customerSection}>
                <div style={styles.avatar}>{initials}</div>
                <div style={styles.customerInfo}>
                  <div style={styles.customerName}>{booking.customer.name}</div>
                  <div style={styles.rating}>
                    <Star size={16} fill="#FCD34D" color="#FCD34D" />
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                      {booking.customer.rating}
                    </span>
                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                      ({booking.customer.totalReviews} reviews)
                    </span>
                  </div>
                  <div style={styles.phoneNumber}>
                    <Phone size={14} />
                    {booking.customer.phone}
                  </div>
                  <div style={styles.buttonGroup}>
                    <button style={{ ...styles.button, ...styles.outlinedButton }}>
                      <Phone size={16} />
                      Call
                    </button>
                    <button style={{ ...styles.button, ...styles.outlinedButton }}>
                      <MessageCircle size={16} />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Service Details</h2>

              <div style={styles.detailRow}>
                <div style={styles.detailIcon}>
                  <Calendar size={18} />
                </div>
                <div style={styles.detailContent}>
                  <div style={styles.detailLabel}>Service Type</div>
                  <div style={styles.detailValue}>{booking.service.type}</div>
                </div>
              </div>

              <div style={styles.detailRow}>
                <div style={styles.detailIcon}>
                  <Calendar size={18} />
                </div>
                <div style={styles.detailContent}>
                  <div style={styles.detailLabel}>Date & Time</div>
                  <div style={styles.detailValue}>
                    {booking.service.date} • {booking.service.time}
                  </div>
                </div>
              </div>

              <div style={styles.detailRow}>
                <div style={styles.detailIcon}>
                  <MapPin size={18} />
                </div>
                <div style={styles.detailContent}>
                  <div style={styles.detailLabel}>Location</div>
                  <div style={styles.detailValue}>{booking.service.location}</div>
                  <div style={styles.mapPlaceholder}>
                    <div style={{ textAlign: "center" }}>
                      <MapPin size={24} style={{ marginBottom: "8px" }} />
                      <div>Map Preview</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.detailRow}>
                <div style={styles.detailIcon}>
                  <AlertCircle size={18} />
                </div>
                <div style={styles.detailContent}>
                  <div style={styles.detailLabel}>Description</div>
                  <div style={styles.detailValue}>{booking.service.description}</div>
                </div>
              </div>

              {booking.photos.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <div style={styles.detailLabel}>Photos</div>
                  <div style={styles.photoGrid}>
                    {booking.photos.map((photo) => (
                      <div key={photo.id} style={styles.photoItem}>
                        <ImageIcon size={24} color="#9CA3AF" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.detailRow}>
                <div style={styles.detailIcon}>
                  <AlertCircle size={18} />
                </div>
                <div style={styles.detailContent}>
                  <div style={styles.detailLabel}>Special Instructions</div>
                  <div style={styles.detailValue}>{booking.service.instructions}</div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginTop: "16px",
                }}
              >
                <div>
                  <div style={styles.detailLabel}>Estimated Duration</div>
                  <div style={styles.detailValue}>{booking.service.estimatedDuration}</div>
                </div>
                <div>
                  <div style={styles.detailLabel}>Actual Duration</div>
                  <div style={styles.detailValue}>{booking.service.actualDuration}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Pricing Breakdown */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Pricing Breakdown</h2>

              <div style={styles.pricingRow}>
                <div style={styles.pricingLabel}>Service Fee</div>
                <div style={styles.pricingValue}>
                  ₱{booking.pricing.serviceFee.toLocaleString()}
                </div>
              </div>

              <div style={styles.pricingRow}>
                <div style={styles.pricingLabel}>Platform Fee (10%)</div>
                <div style={styles.pricingValue}>
                  -₱{booking.pricing.platformFee.toLocaleString()}
                </div>
              </div>

              <div style={styles.totalRow}>
                <div style={styles.totalLabel}>Your Earnings</div>
                <div style={styles.totalValue}>
                  ₱{booking.pricing.yourEarnings.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Actions</h2>

              {booking.status === "upcoming" && (
                <>
                  <div style={styles.infoBox}>
                    <AlertCircle size={18} style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div>
                      Make sure to arrive on time. Customer will be notified when you start your
                      trip.
                    </div>
                  </div>

                  <div style={styles.actionButtons}>
                    <button style={{ ...styles.button, ...styles.primaryButton }}>
                      <Navigation size={16} />
                      Get Directions
                    </button>
                    <button
                      disabled={isUpdating}
                      style={{ ...styles.button, ...styles.outlinedButton, opacity: isUpdating ? 0.7 : 1 }}
                      onClick={() => void updateStatus("in_progress")}
                    >
                      <CheckCircle size={16} />
                      {isUpdating ? "Updating..." : "Start Trip"}
                    </button>
                    <button
                      style={{
                        ...styles.button,
                        ...styles.dangerButton,
                        gridColumn: "1 / -1",
                      }}
                      onClick={() => navigate(`/provider/cancel-booking/${id}`)}
                    >
                      <X size={16} />
                      Cancel Booking
                    </button>
                  </div>
                </>
              )}

              {booking.status === "in-progress" && (
                <>
                  <div style={styles.actionButtons}>
                    <button
                      disabled={isUpdating}
                      style={{ ...styles.button, ...styles.primaryButton, opacity: isUpdating ? 0.7 : 1 }}
                      onClick={() => void updateStatus("completed")}
                    >
                      <CheckCircle size={16} />
                      {isUpdating ? "Updating..." : "Complete Service"}
                    </button>
                    <button style={{ ...styles.button, ...styles.outlinedButton }}>
                      <Upload size={16} />
                      Upload Photos
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Chat / Messages */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Messages</h2>

              <div style={styles.chatContainer}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      ...styles.chatBubble,
                      ...(msg.sender === "customer"
                        ? styles.chatBubbleCustomer
                        : styles.chatBubbleProvider),
                    }}
                  >
                    <div style={styles.chatSender}>{msg.name}</div>
                    <div style={styles.chatMessage}>{msg.message}</div>
                    <div style={styles.chatTime}>{msg.time}</div>
                  </div>
                ))}
              </div>

              <div style={styles.chatInput}>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  style={{ ...styles.button, ...styles.primaryButton }}
                  onClick={handleSendMessage}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
