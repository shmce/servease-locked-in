import { useState } from "react";
import {
  Star,
  ChevronDown,
  MessageSquare,
  Flag,
  X,
  Send,
  Info,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Styles object for reusability
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #F9FAFB, rgba(16, 185, 129, 0.05))",
    padding: "32px",
  },
  maxWidthContainer: {
    maxWidth: "1280px",
    margin: "0 auto",
  },
  pageHeader: {
    marginBottom: "40px",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "12px",
    letterSpacing: "-0.025em",
  },
  pageSubtitle: {
    fontSize: "16px",
    color: "#6B7280",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "24px",
    transition: "box-shadow 0.3s ease",
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "24px",
    textAlign: "center" as const,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
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
  tab: {
    padding: "10px 20px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap" as const,
  },
  reviewCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "20px",
    transition: "box-shadow 0.3s ease",
    display: "flex",
    flexDirection: "column" as const,
    minHeight: "300px",
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
    padding: "20px",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "20px",
    maxWidth: "700px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    transition: "border-color 0.3s ease",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    transition: "border-color 0.3s ease",
    outline: "none",
    resize: "vertical" as const,
    fontFamily: "inherit",
  },
};

interface Review {
  id: number;
  customerName: string;
  avatar: string;
  rating: number;
  date: string;
  serviceType: string;
  reviewText: string;
  photos: string[];
  businessResponse?: string;
}

export function ProviderReviewsPage() {
  const [activeFilter, setActiveFilter] = useState("All Reviews");
  const [sortBy, setSortBy] = useState("Newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [respondModal, setRespondModal] = useState<Review | null>(null);
  const [reportModal, setReportModal] = useState<Review | null>(null);
  const [response, setResponse] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [showReportReasonDropdown, setShowReportReasonDropdown] = useState(false);

  // Sample data
  const totalReviews = 200;
  const averageRating = 4.8;
  const responseRate = 92;

  const ratingDistribution = [
    { stars: 5, count: 142, percentage: 71 },
    { stars: 4, count: 38, percentage: 19 },
    { stars: 3, count: 12, percentage: 6 },
    { stars: 2, count: 5, percentage: 2.5 },
    { stars: 1, count: 3, percentage: 1.5 },
  ];

  const filterTabs = [
    "All Reviews",
    "Recent",
    "High Rated (5★, 4★)",
    "Low Rated (3★, 2★, 1★)",
    "Unanswered",
  ];

  const sortOptions = ["Newest", "Oldest", "Highest", "Lowest"];

  const reportReasons = [
    "Inappropriate content",
    "Fake review",
    "Wrong service provider",
    "Personal attack",
    "Spam",
    "Other",
  ];

  const reviews: Review[] = [
    {
      id: 1,
      customerName: "Maria S.",
      avatar: "MS",
      rating: 5,
      date: "March 15, 2026",
      serviceType: "House Cleaning",
      reviewText:
        "Excellent service! Very thorough and professional. The team arrived on time and did an amazing job cleaning our home. Highly recommend!",
      photos: [],
      businessResponse:
        "Thank you so much for your kind words, Maria! We're thrilled to hear you were satisfied with our service. Looking forward to serving you again!",
    },
    {
      id: 2,
      customerName: "John D.",
      avatar: "JD",
      rating: 5,
      date: "March 12, 2026",
      serviceType: "Plumbing",
      reviewText:
        "Fixed my plumbing issue quickly and efficiently. Great work!",
      photos: [],
    },
    {
      id: 3,
      customerName: "Sarah L.",
      avatar: "SL",
      rating: 4,
      date: "March 10, 2026",
      serviceType: "Electrical",
      reviewText:
        "Good service overall. The electrician was knowledgeable and fixed the problem. Only minor issue was arriving 15 minutes late.",
      photos: [],
    },
    {
      id: 4,
      customerName: "Robert M.",
      avatar: "RM",
      rating: 5,
      date: "March 8, 2026",
      serviceType: "Aircon Services",
      reviewText:
        "Outstanding service! The aircon is working perfectly now. Very professional team.",
      photos: [],
    },
    {
      id: 5,
      customerName: "Lisa T.",
      avatar: "LT",
      rating: 3,
      date: "March 5, 2026",
      serviceType: "House Cleaning",
      reviewText:
        "Service was okay but I expected more attention to detail. Some areas were missed.",
      photos: [],
    },
  ];

  const tips = [
    {
      label: "Be professional",
      detail: "Maintain a courteous and respectful tone throughout",
    },
    {
      label: "Thank the customer",
      detail: "Show appreciation for their feedback",
    },
    {
      label: "Address concerns",
      detail: "Acknowledge and respond to specific issues raised",
    },
    {
      label: "Keep it concise",
      detail: "Be clear and to the point — avoid lengthy responses",
    },
  ];

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div style={{ display: "flex", gap: "4px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            style={{ width: "14px", height: "14px" }}
            fill={star <= rating ? "#FFB800" : "none"}
            color="#FFB800"
          />
        ))}
      </div>
    );
  };

  const handleRespondSubmit = () => {
    if (response.trim().length === 0) return;
    console.log("Response submitted:", { reviewId: respondModal?.id, response });
    setRespondModal(null);
    setResponse("");
  };

  const handleReportSubmit = () => {
    if (!reportReason) return;
    console.log("Report submitted:", {
      reviewId: reportModal?.id,
      reason: reportReason,
      details: reportDetails,
    });
    setReportModal(null);
    setReportReason("");
    setReportDetails("");
  };

  // Filter reviews based on active filter
  const getFilteredReviews = () => {
    let filtered = [...reviews];

    switch (activeFilter) {
      case "Recent":
        // Show reviews from the last 7 days (for demo, just sort by date)
        filtered = filtered.slice(0, 3);
        break;
      case "High Rated (5★, 4★)":
        filtered = filtered.filter((r) => r.rating >= 4);
        break;
      case "Low Rated (3★, 2★, 1★)":
        filtered = filtered.filter((r) => r.rating <= 3);
        break;
      case "Unanswered":
        filtered = filtered.filter((r) => !r.businessResponse);
        break;
      case "All Reviews":
      default:
        // No filtering
        break;
    }

    return filtered;
  };

  // Sort reviews based on sort option
  const getSortedReviews = (reviewsToSort: Review[]) => {
    const sorted = [...reviewsToSort];

    switch (sortBy) {
      case "Newest":
        // Already sorted by date descending in sample data
        break;
      case "Oldest":
        sorted.reverse();
        break;
      case "Highest":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "Lowest":
        sorted.sort((a, b) => a.rating - b.rating);
        break;
    }

    return sorted;
  };

  // Get filtered and sorted reviews
  const filteredReviews = getFilteredReviews();
  const displayedReviews = getSortedReviews(filteredReviews);

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Reviews</h1>
          <p style={styles.pageSubtitle}>
            View and respond to customer feedback
          </p>
        </div>

        {/* Top Section: Overall Rating Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {/* Average Rating */}
          <div style={styles.statCard}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#111827",
                }}
              >
                {averageRating}
              </span>
              <Star
                style={{ width: "20px", height: "20px" }}
                fill="#FFB800"
                color="#FFB800"
              />
            </div>
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Average Rating
            </p>
          </div>

          {/* Total Reviews */}
          <div style={styles.statCard}>
            <p
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "8px",
              }}
            >
              {totalReviews}
            </p>
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Total Reviews
            </p>
          </div>

          {/* Response Rate */}
          <div style={styles.statCard}>
            <p
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "8px",
              }}
            >
              {responseRate}%
            </p>
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Response Rate
            </p>
          </div>

          {/* Rating Distribution */}
          <div style={{ ...styles.card, textAlign: "left" as const }}>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "16px",
              }}
            >
              Rating Breakdown
            </p>
            {ratingDistribution.map((item) => (
              <div
                key={item.stars}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    width: "32px",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#374151" }}>
                    {item.stars}
                  </span>
                  <Star
                    style={{ width: "10px", height: "10px" }}
                    fill="#FFB800"
                    color="#FFB800"
                  />
                </div>
                <div
                  style={{
                    flex: 1,
                    backgroundColor: "#F3F4F6",
                    borderRadius: "9999px",
                    height: "6px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "9999px",
                      width: `${item.percentage}%`,
                      background:
                        item.stars >= 4
                          ? "#00BF63"
                          : item.stars === 3
                          ? "#FFB800"
                          : "#F87171",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#6B7280",
                    width: "24px",
                    textAlign: "right",
                  }}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Tabs & Sort */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            border: "1px solid #F3F4F6",
            padding: "20px 24px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                style={{
                  ...styles.tab,
                  backgroundColor: activeFilter === tab ? "#00BF63" : "#F3F4F6",
                  color: activeFilter === tab ? "white" : "#6B7280",
                  boxShadow:
                    activeFilter === tab
                      ? "0 2px 8px rgba(0, 191, 99, 0.25)"
                      : "none",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
              }}
            >
              <span>Sort: {sortBy}</span>
              <ChevronDown
                style={{
                  width: "14px",
                  height: "14px",
                  transition: "transform 0.3s ease",
                  transform: showSortDropdown ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
            {showSortDropdown && (
              <>
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 10,
                  }}
                  onClick={() => setShowSortDropdown(false)}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                    border: "1px solid #E5E7EB",
                    zIndex: 20,
                    minWidth: "160px",
                    overflow: "hidden",
                  }}
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortDropdown(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        backgroundColor:
                          sortBy === option ? "#F0FDF8" : "white",
                        color: sortBy === option ? "#00BF63" : "#374151",
                        textAlign: "left" as const,
                      }}
                      onMouseEnter={(e) => {
                        if (sortBy !== option) {
                          e.currentTarget.style.backgroundColor = "#F9FAFB";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== option) {
                          e.currentTarget.style.backgroundColor = "white";
                        }
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reviews Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "24px",
          }}
        >
          {displayedReviews.map((review) => (
            <div
              key={review.id}
              style={styles.reviewCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 1px 3px rgba(0, 0, 0, 0.1)";
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(0, 191, 99, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#00BF63",
                    }}
                  >
                    {review.avatar}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: "600",
                      fontSize: "15px",
                      color: "#111827",
                      marginBottom: "4px",
                    }}
                  >
                    {review.customerName}
                  </p>
                  <StarRating rating={review.rating} />
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#9CA3AF",
                      marginTop: "4px",
                    }}
                  >
                    {review.date}
                  </p>
                </div>
                {/* Service Badge */}
                <div
                  style={{
                    backgroundColor: "#F0FDF8",
                    color: "#00BF63",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {review.serviceType}
                </div>
              </div>

              {/* Review Text */}
              <p
                style={{
                  fontSize: "14px",
                  color: "#4B5563",
                  lineHeight: "1.7",
                  marginBottom: "16px",
                }}
              >
                {review.reviewText}
              </p>

              {/* Business Response */}
              {review.businessResponse && (
                <div
                  style={{
                    backgroundColor: "#F8FFFE",
                    borderLeft: "3px solid #00BF63",
                    borderRadius: "0 8px 8px 0",
                    padding: "12px 16px",
                    marginBottom: "16px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#00BF63",
                      marginBottom: "6px",
                    }}
                  >
                    Your Response
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#4B5563",
                      lineHeight: "1.7",
                    }}
                  >
                    {review.businessResponse}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div
                style={{
                  borderTop: "1px solid #F3F4F6",
                  paddingTop: "16px",
                  display: "flex",
                  gap: "12px",
                  marginTop: "auto",
                }}
              >
                {!review.businessResponse && (
                  <button
                    onClick={() => setRespondModal(review)}
                    style={{
                      ...styles.button,
                      ...styles.primaryButton,
                      flex: 1,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#059669";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#00BF63";
                    }}
                  >
                    <MessageSquare style={{ width: "16px", height: "16px" }} />
                    Respond
                  </button>
                )}
                <button
                  onClick={() => setReportModal(review)}
                  style={{
                    ...styles.button,
                    ...styles.secondaryButton,
                    ...(review.businessResponse ? { flex: 1 } : {}),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F3F4F6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#F9FAFB";
                  }}
                >
                  <Flag style={{ width: "16px", height: "16px" }} />
                  Report
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Respond Modal */}
        {respondModal && (
          <div style={styles.modal} onClick={() => setRespondModal(null)}>
            <div
              style={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "24px",
                  borderBottom: "1px solid #F3F4F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#111827",
                  }}
                >
                  Respond to Review
                </h2>
                <button
                  onClick={() => setRespondModal(null)}
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
                  <X style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: "24px" }}>
                {/* Original Review */}
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#9CA3AF",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "12px",
                  }}
                >
                  Original Review
                </p>
                <div
                  style={{
                    backgroundColor: "#F9FAFB",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(0, 191, 99, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#00BF63",
                        }}
                      >
                        {respondModal.avatar}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontWeight: "600",
                          fontSize: "14px",
                          color: "#111827",
                          marginBottom: "4px",
                        }}
                      >
                        {respondModal.customerName}
                      </p>
                      <StarRating rating={respondModal.rating} />
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#9CA3AF",
                          marginTop: "4px",
                        }}
                      >
                        {respondModal.date}
                      </p>
                    </div>
                    <div
                      style={{
                        backgroundColor: "#F0FDF8",
                        color: "#00BF63",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {respondModal.serviceType}
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#4B5563",
                      lineHeight: "1.7",
                    }}
                  >
                    {respondModal.reviewText}
                  </p>
                </div>

                {/* Response Input */}
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#9CA3AF",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "12px",
                  }}
                >
                  Your Response
                </p>
                <textarea
                  value={response}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setResponse(e.target.value);
                    }
                  }}
                  placeholder="Write a professional response to this review..."
                  rows={5}
                  style={styles.textarea}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#00BF63";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "8px",
                    marginBottom: "24px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: response.length >= 500 ? "#EF4444" : "#9CA3AF",
                    }}
                  >
                    {response.length}/500 characters
                  </span>
                </div>

                {/* Tips */}
                <div
                  style={{
                    backgroundColor: "#F0FDF8",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    <Info
                      style={{ width: "16px", height: "16px", color: "#00BF63" }}
                    />
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#00BF63",
                      }}
                    >
                      Tips for Responding
                    </p>
                  </div>
                  <div style={{ display: "grid", gap: "8px" }}>
                    {tips.map((tip, i) => (
                      <div
                        key={i}
                        style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
                      >
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(0, 191, 99, 0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "700",
                              color: "#00BF63",
                            }}
                          >
                            {i + 1}
                          </span>
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#1F2937",
                              marginBottom: "2px",
                            }}
                          >
                            {tip.label}
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#6B7280",
                              lineHeight: "1.6",
                            }}
                          >
                            {tip.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => setRespondModal(null)}
                    style={{
                      ...styles.button,
                      ...styles.secondaryButton,
                      flex: 1,
                      padding: "14px 16px",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRespondSubmit}
                    disabled={response.trim().length === 0}
                    style={{
                      ...styles.button,
                      flex: 1,
                      padding: "14px 16px",
                      backgroundColor:
                        response.trim().length === 0 ? "#E5E7EB" : "#00BF63",
                      color:
                        response.trim().length === 0 ? "#9CA3AF" : "white",
                      cursor:
                        response.trim().length === 0 ? "not-allowed" : "pointer",
                      boxShadow:
                        response.trim().length === 0
                          ? "none"
                          : "0 4px 16px rgba(0, 191, 99, 0.25)",
                    }}
                    onMouseEnter={(e) => {
                      if (response.trim().length > 0) {
                        e.currentTarget.style.backgroundColor = "#059669";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (response.trim().length > 0) {
                        e.currentTarget.style.backgroundColor = "#00BF63";
                      }
                    }}
                  >
                    <Send style={{ width: "16px", height: "16px" }} />
                    Submit Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {reportModal && (
          <div style={styles.modal} onClick={() => setReportModal(null)}>
            <div
              style={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "24px",
                  borderBottom: "1px solid #F3F4F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#111827",
                  }}
                >
                  Report Review
                </h2>
                <button
                  onClick={() => setReportModal(null)}
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
                  <X style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: "24px" }}>
                {/* Review Being Reported */}
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#9CA3AF",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "12px",
                  }}
                >
                  Review Being Reported
                </p>
                <div
                  style={{
                    backgroundColor: "#F9FAFB",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(0, 191, 99, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#00BF63",
                        }}
                      >
                        {reportModal.avatar}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontWeight: "600",
                          fontSize: "14px",
                          color: "#111827",
                          marginBottom: "4px",
                        }}
                      >
                        {reportModal.customerName}
                      </p>
                      <StarRating rating={reportModal.rating} />
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#9CA3AF",
                          marginTop: "4px",
                        }}
                      >
                        {reportModal.date}
                      </p>
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#4B5563",
                      lineHeight: "1.7",
                    }}
                  >
                    {reportModal.reviewText}
                  </p>
                </div>

                {/* Report Reason */}
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Reason for Reporting <span style={{ color: "#EF4444" }}>*</span>
                </p>
                <div style={{ position: "relative", marginBottom: "20px" }}>
                  <button
                    onClick={() =>
                      setShowReportReasonDropdown(!showReportReasonDropdown)
                    }
                    style={{
                      ...styles.input,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      backgroundColor: "white",
                    }}
                  >
                    <span style={{ color: reportReason ? "#374151" : "#9CA3AF" }}>
                      {reportReason || "Select a reason..."}
                    </span>
                    <ChevronDown
                      style={{
                        width: "16px",
                        height: "16px",
                        transition: "transform 0.3s ease",
                        transform: showReportReasonDropdown
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </button>
                  {showReportReasonDropdown && (
                    <>
                      <div
                        style={{
                          position: "fixed",
                          inset: 0,
                          zIndex: 10,
                        }}
                        onClick={() => setShowReportReasonDropdown(false)}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 8px)",
                          left: 0,
                          right: 0,
                          backgroundColor: "white",
                          borderRadius: "12px",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                          border: "1px solid #E5E7EB",
                          zIndex: 20,
                          overflow: "hidden",
                        }}
                      >
                        {reportReasons.map((reason) => (
                          <button
                            key={reason}
                            onClick={() => {
                              setReportReason(reason);
                              setShowReportReasonDropdown(false);
                            }}
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "background-color 0.2s ease",
                              border: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              backgroundColor:
                                reportReason === reason ? "#F0FDF8" : "white",
                              color:
                                reportReason === reason ? "#00BF63" : "#374151",
                              textAlign: "left" as const,
                            }}
                            onMouseEnter={(e) => {
                              if (reportReason !== reason) {
                                e.currentTarget.style.backgroundColor =
                                  "#F9FAFB";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (reportReason !== reason) {
                                e.currentTarget.style.backgroundColor = "white";
                              }
                            }}
                          >
                            <span>{reason}</span>
                            {reportReason === reason && (
                              <CheckCircle2
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  color: "#00BF63",
                                }}
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Additional Details */}
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Additional Details{" "}
                  {reportReason === "Other" ? (
                    <span style={{ color: "#EF4444" }}>*</span>
                  ) : (
                    <span style={{ color: "#9CA3AF", fontWeight: "400" }}>
                      (Optional)
                    </span>
                  )}
                </p>
                <textarea
                  value={reportDetails}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setReportDetails(e.target.value);
                    }
                  }}
                  placeholder={
                    reportReason === "Other"
                      ? "Please describe your reason in detail..."
                      : "Add any extra context to support your report..."
                  }
                  rows={4}
                  style={{ ...styles.textarea, marginBottom: "8px" }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#00BF63";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "24px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color:
                        reportDetails.length >= 500 ? "#EF4444" : "#9CA3AF",
                    }}
                  >
                    {reportDetails.length}/500
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => setReportModal(null)}
                    style={{
                      ...styles.button,
                      ...styles.secondaryButton,
                      flex: 1,
                      padding: "14px 16px",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportSubmit}
                    disabled={
                      !reportReason ||
                      (reportReason === "Other" && !reportDetails.trim())
                    }
                    style={{
                      ...styles.button,
                      flex: 1,
                      padding: "14px 16px",
                      backgroundColor:
                        !reportReason ||
                        (reportReason === "Other" && !reportDetails.trim())
                          ? "#E5E7EB"
                          : "#EF4444",
                      color:
                        !reportReason ||
                        (reportReason === "Other" && !reportDetails.trim())
                          ? "#9CA3AF"
                          : "white",
                      cursor:
                        !reportReason ||
                        (reportReason === "Other" && !reportDetails.trim())
                          ? "not-allowed"
                          : "pointer",
                      boxShadow:
                        !reportReason ||
                        (reportReason === "Other" && !reportDetails.trim())
                          ? "none"
                          : "0 4px 16px rgba(239, 68, 68, 0.25)",
                    }}
                    onMouseEnter={(e) => {
                      if (
                        reportReason &&
                        !(reportReason === "Other" && !reportDetails.trim())
                      ) {
                        e.currentTarget.style.backgroundColor = "#DC2626";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (
                        reportReason &&
                        !(reportReason === "Other" && !reportDetails.trim())
                      ) {
                        e.currentTarget.style.backgroundColor = "#EF4444";
                      }
                    }}
                  >
                    <Flag style={{ width: "16px", height: "16px" }} />
                    Submit Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}