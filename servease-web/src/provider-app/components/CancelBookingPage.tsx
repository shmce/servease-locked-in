import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  getStoredProviderAccessToken,
  getProviderBooking,
  updateProviderBookingStatus,
  type BookingSummary,
} from "../../services/serveaseProviderApi";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  AlertTriangle,
  TrendingDown,
  X,
} from "lucide-react";

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F9FAFB",
    padding: "32px",
  },
  maxWidthContainer: {
    maxWidth: "900px",
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
  subtitle: {
    fontSize: "14px",
    color: "#6B7280",
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
  warningCard: {
    backgroundColor: "#FEF2F2",
    border: "2px solid #FEE2E2",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "24px",
  },
  warningHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "16px",
  },
  warningIcon: {
    color: "#DC2626",
    flexShrink: 0,
  },
  warningTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#991B1B",
    marginBottom: "4px",
  },
  warningSubtitle: {
    fontSize: "13px",
    color: "#B91C1C",
  },
  policyList: {
    margin: "0",
    paddingLeft: "28px",
  },
  policyItem: {
    fontSize: "13px",
    color: "#7F1D1D",
    marginBottom: "8px",
    lineHeight: "1.5",
  },
  formGroup: {
    marginBottom: "24px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  },
  required: {
    color: "#DC2626",
    marginLeft: "4px",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    outline: "none",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "border-color 0.3s ease",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    outline: "none",
    resize: "vertical" as const,
    minHeight: "120px",
    fontFamily: "inherit",
    transition: "border-color 0.3s ease",
  },
  alertBox: {
    backgroundColor: "#FEF3C7",
    border: "1px solid #FDE68A",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "24px",
    fontSize: "13px",
    color: "#92400E",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "32px",
  },
  button: {
    padding: "14px 28px",
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
    flex: 1,
  },
  primaryButton: {
    backgroundColor: "#DC2626",
    color: "white",
    boxShadow: "0 4px 16px rgba(220, 38, 38, 0.25)",
  },
  secondaryButton: {
    backgroundColor: "white",
    color: "#6B7280",
    border: "2px solid #E5E7EB",
  },
  modalOverlay: {
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
    padding: "20px",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "32px",
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  modalTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    color: "#6B7280",
    transition: "color 0.3s ease",
  },
  modalContent: {
    marginBottom: "24px",
  },
  modalText: {
    fontSize: "14px",
    color: "#6B7280",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  highlightBox: {
    backgroundColor: "#FEF2F2",
    border: "1px solid #FEE2E2",
    borderRadius: "10px",
    padding: "16px",
    marginTop: "16px",
  },
  highlightText: {
    fontSize: "13px",
    color: "#991B1B",
    fontWeight: "500",
    marginBottom: "8px",
  },
  refNumber: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: "4px",
  },
  modalButtonGroup: {
    display: "flex",
    gap: "12px",
  },
};

export function CancelBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [explanation, setExplanation] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingData, setBookingData] = useState<BookingSummary | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredProviderAccessToken();
    if (!token || !id) return;
    getProviderBooking(token, id)
      .then((booking) => {
        setBookingData(booking);
        setCancelError(null);
      })
      .catch((error: unknown) => {
        setCancelError(
          error instanceof Error ? error.message : "Unable to load booking details.",
        );
      });
  }, [id]);

  const scheduledAt = bookingData ? new Date(bookingData.scheduledAt) : null;
  const hoursUntilBooking = scheduledAt
    ? Math.max(0, (scheduledAt.getTime() - Date.now()) / 3600000)
    : 36;

  const booking = {
    id: id ?? "",
    refNumber: bookingData?.bookingReference ?? "—",
    customer: { name: bookingData?.customerFullName ?? "Customer" },
    service: {
      type: bookingData?.serviceTitle ?? "Service",
      date: scheduledAt
        ? scheduledAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : "—",
      time: scheduledAt
        ? scheduledAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
        : "—",
      location: bookingData?.serviceAddress ?? "—",
    },
    hoursUntilBooking,
  };

  const cancellationReasons = [
    "Schedule conflict",
    "Emergency",
    "Customer request",
    "Unable to fulfill service",
    "Location too far",
    "Weather conditions",
    "Health issues",
    "Others",
  ];

  const handleConfirmCancel = () => {
    setCancelError(null);
    setShowConfirmModal(true);
  };

  const handleFinalCancel = () => {
    const token = getStoredProviderAccessToken();
    if (!token || !id || !bookingData) {
      setShowConfirmModal(false);
      navigate("/provider/bookings");
      return;
    }
    setCancelling(true);
    setCancelError(null);
    updateProviderBookingStatus(
      token,
      id,
      bookingData.status,
      "cancelled",
      reason,
      explanation,
    )
      .then(() => {
        setShowConfirmModal(false);
        navigate("/provider/bookings");
      })
      .catch((error) => {
        setCancelError(
          error instanceof Error ? error.message : "Unable to cancel booking.",
        );
      })
      .finally(() => {
        setCancelling(false);
      });
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        <div style={styles.header}>
          <button
            style={styles.backButton}
            onClick={() => navigate(`/provider/booking-details/${id}`)}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#00BF63")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
          >
            <ArrowLeft size={18} />
            Back to Booking Details
          </button>
          <h1 style={styles.pageTitle}>Cancel Booking</h1>
          <p style={styles.subtitle}>
            Please review the cancellation notice and provide a reason
          </p>
          {cancelError && (
            <p style={{ color: "#B91C1C", fontSize: "14px", marginTop: "12px" }}>
              {cancelError}
            </p>
          )}
        </div>

        {/* Booking Details Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Booking Details</h2>

          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>
              <Calendar size={18} />
            </div>
            <div style={styles.detailContent}>
              <div style={styles.detailLabel}>Booking Reference</div>
              <div style={styles.detailValue}>{booking.refNumber}</div>
            </div>
          </div>

          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>
              <Calendar size={18} />
            </div>
            <div style={styles.detailContent}>
              <div style={styles.detailLabel}>Customer</div>
              <div style={styles.detailValue}>{booking.customer.name}</div>
            </div>
          </div>

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
              <Clock size={18} />
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
            </div>
          </div>
        </div>

        {/* Cancellation Notice Card */}
        <div style={styles.warningCard}>
          <div style={styles.warningHeader}>
            <AlertTriangle size={24} style={styles.warningIcon} />
            <div style={{ flex: 1 }}>
              <h3 style={styles.warningTitle}>Cancellation Notice</h3>
              <p style={styles.warningSubtitle}>
                {Math.round(booking.hoursUntilBooking)} hours remaining until booking
              </p>
            </div>
          </div>

          <ul style={styles.policyList}>
            <li style={styles.policyItem}>
              <strong>Status Change:</strong> This booking will be marked cancelled after
              confirmation.
            </li>
            <li style={styles.policyItem}>
              <strong>Account Record:</strong> The cancellation will be recorded on the
              booking history used by ServEase operations.
            </li>
            <li style={styles.policyItem}>
              <strong>Customer Notification:</strong> The customer will be immediately
              notified after the cancellation is saved.
            </li>
          </ul>
        </div>

        {/* Warning Message */}
        <div style={styles.alertBox}>
          <TrendingDown size={18} style={{ marginTop: "2px", flexShrink: 0 }} />
          <div>
            <strong>Important:</strong> Cancellation history is visible to ServEase
            operations. Please only cancel if you cannot safely or professionally
            complete this booking.
          </div>
        </div>

        {/* Cancellation Form Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Reason for Cancellation</h2>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Select reason
              <span style={styles.required}>*</span>
            </label>
            <select
              style={styles.select}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#00BF63")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            >
              <option value="">Choose a reason...</option>
              {cancellationReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Detailed explanation</label>
            <textarea
              style={styles.textarea}
              placeholder="Provide more details about why you need to cancel this booking..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#00BF63")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.buttonGroup}>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={() => navigate(`/provider/booking-details/${id}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F3F4F6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
            }}
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={handleConfirmCancel}
            disabled={!reason}
            onMouseEnter={(e) => {
              if (reason) {
                e.currentTarget.style.backgroundColor = "#B91C1C";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (reason) {
                e.currentTarget.style.backgroundColor = "#DC2626";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            <X size={16} />
            Confirm Cancellation
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          style={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowConfirmModal(false);
            }
          }}
        >
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Confirm Cancellation</h3>
              <button
                style={styles.closeButton}
                onClick={() => setShowConfirmModal(false)}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#DC2626")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
              >
                <X size={24} />
              </button>
            </div>

            <div style={styles.modalContent}>
              <p style={styles.modalText}>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>

              <div style={styles.highlightBox}>
                <div style={styles.refNumber}>{booking.refNumber}</div>
                <div style={styles.highlightText}>
                  Service: {booking.service.type}
                </div>
                <div style={styles.highlightText}>
                  Customer: {booking.customer.name}
                </div>
                <div style={styles.highlightText}>
                  Date: {booking.service.date} at {booking.service.time}
                </div>
                <div
                  style={{
                    ...styles.highlightText,
                    fontSize: "14px",
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid #FEE2E2",
                  }}
                >
                  This will mark the booking as cancelled.
                </div>
              </div>

              <p style={{ ...styles.modalText, marginTop: "16px" }}>
                <strong>Reason:</strong> {reason}
              </p>

              {explanation && (
                <p style={styles.modalText}>
                  <strong>Details:</strong> {explanation}
                </p>
              )}
            </div>

            <div style={styles.modalButtonGroup}>
              <button
                style={{ ...styles.button, ...styles.secondaryButton }}
                onClick={() => setShowConfirmModal(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F3F4F6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                Keep Booking
              </button>
              <button
                disabled={cancelling}
                style={{ ...styles.button, ...styles.primaryButton, opacity: cancelling ? 0.7 : 1 }}
                onClick={handleFinalCancel}
                onMouseEnter={(e) => {
                  if (!cancelling) e.currentTarget.style.backgroundColor = "#B91C1C";
                }}
                onMouseLeave={(e) => {
                  if (!cancelling) e.currentTarget.style.backgroundColor = "#DC2626";
                }}
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
