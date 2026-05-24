import { useEffect, useState } from "react";
import { Ban, ChevronDown, CheckCircle2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { useProviderData } from "../context/ProviderDataContext";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #F9FAFB, rgba(16, 185, 129, 0.05))",
    padding: "32px",
  },
  maxWidthContainer: {
    maxWidth: "800px",
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
    padding: "32px",
    marginBottom: "24px",
  },
  button: {
    padding: "12px 24px",
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
    backgroundColor: "#EF4444",
    color: "white",
    boxShadow: "0 4px 16px rgba(239, 68, 68, 0.25)",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    transition: "border-color 0.3s ease",
    outline: "none",
    width: "100%",
    colorScheme: "light" as const,
  },
  textarea: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    transition: "border-color 0.3s ease",
    outline: "none",
    resize: "vertical" as const,
    fontFamily: "inherit",
    width: "100%",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
    display: "block",
  },
};

export function BlockTimePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addBlockedDates, availabilityError, isAvailabilityLoading } = useProviderData();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [notes, setNotes] = useState("");

  const reasonOptions = [
    "Personal time off",
    "Vacation",
    "Training/Education",
    "Maintenance",
    "Other",
  ];

  useEffect(() => {
    const date = searchParams.get("date");

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return;
    }

    setStartDate((current) => current || date);
    setEndDate((current) => current || date);
  }, [searchParams]);

  const handleBlockTime = async () => {
    if (!startDate || !endDate) {
      setFormError("Select a start and end date.");
      return;
    }
    
    // Generate all dates in the range (inclusive of both start and end)
    const datesToBlock: string[] = [];
    
    // Parse the input dates (format: YYYY-MM-DD from input type="date")
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    
    // Create start and end date objects
    const startDateObj = new Date(startYear, startMonth - 1, startDay);
    const endDateObj = new Date(endYear, endMonth - 1, endDay);
    
    // Calculate the number of days in the range
    const timeDiff = endDateObj.getTime() - startDateObj.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      setFormError("End date must be the same as or later than start date.");
      return;
    }
    
    // Generate all dates from start to end (inclusive)
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(startYear, startMonth - 1, startDay + i);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      datesToBlock.push(dateStr);
    }
    
    try {
      setFormError(null);
      await addBlockedDates(datesToBlock, notes || reason || null);
      navigate("/provider/calendar");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to block selected dates.",
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Block Time</h1>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>
            Block full dates when you're unavailable for bookings
          </p>
          {(formError || availabilityError) && (
            <p style={{ fontSize: "14px", color: "#B91C1C", marginTop: "12px" }}>
              {formError || availabilityError}
            </p>
          )}
        </div>

        {/* Main Form Card */}
        <div style={styles.card}>
          {/* Date Range Selector */}
          <div style={{ marginBottom: "24px" }}>
            <p
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "16px",
              }}
            >
              Select Date Range
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={styles.label}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#00BF63";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                />
              </div>
              <div>
                <label style={styles.label}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={styles.input}
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

          {/* Reason Dropdown */}
          <div style={{ marginBottom: "24px" }}>
            <label style={styles.label}>Reason</label>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowReasonDropdown(!showReasonDropdown)}
                style={{
                  ...styles.input,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  backgroundColor: "white",
                }}
              >
                <span style={{ color: reason ? "#374151" : "#9CA3AF" }}>
                  {reason || "Select a reason..."}
                </span>
                <ChevronDown
                  style={{
                    width: "16px",
                    height: "16px",
                    transition: "transform 0.3s ease",
                    transform: showReasonDropdown ? "rotate(180deg)" : "rotate(0deg)",
                    color: "#6B7280",
                  }}
                />
              </button>
              {showReasonDropdown && (
                <>
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 10,
                    }}
                    onClick={() => setShowReasonDropdown(false)}
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
                    {reasonOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setReason(option);
                          setShowReasonDropdown(false);
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
                          backgroundColor: reason === option ? "#F0FDF8" : "white",
                          color: reason === option ? "#00BF63" : "#374151",
                          textAlign: "left" as const,
                        }}
                        onMouseEnter={(e) => {
                          if (reason !== option) {
                            e.currentTarget.style.backgroundColor = "#F9FAFB";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (reason !== option) {
                            e.currentTarget.style.backgroundColor = "white";
                          }
                        }}
                      >
                        <span>{option}</span>
                        {reason === option && (
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
          </div>

          {/* Notes Field */}
          <div style={{ marginBottom: "24px" }}>
            <label style={styles.label}>
              Notes{" "}
              <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "400" }}>
                (Optional)
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details or context..."
              rows={4}
              style={styles.textarea}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#00BF63";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
              }}
            />
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: "32px" }}>
            <button
              onClick={handleBlockTime}
              disabled={!startDate || !endDate || !reason || isAvailabilityLoading}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                width: "100%",
                opacity:
                  !startDate || !endDate || !reason || isAvailabilityLoading
                    ? 0.5
                    : 1,
                cursor:
                  !startDate || !endDate || !reason || isAvailabilityLoading
                    ? "not-allowed"
                    : "pointer",
              }}
              onMouseEnter={(e) => {
                if (startDate && endDate && reason && !isAvailabilityLoading) {
                  e.currentTarget.style.backgroundColor = "#DC2626";
                }
              }}
              onMouseLeave={(e) => {
                if (startDate && endDate && reason && !isAvailabilityLoading) {
                  e.currentTarget.style.backgroundColor = "#EF4444";
                }
              }}
            >
              <Ban style={{ width: "18px", height: "18px" }} />
              {isAvailabilityLoading ? "Blocking..." : "Block Selected Dates"}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div
          style={{
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            gap: "12px",
          }}
        >
          <Ban style={{ width: "20px", height: "20px", color: "#DC2626", flexShrink: 0 }} />
          <div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#991B1B",
                marginBottom: "4px",
              }}
            >
              Important Information
            </p>
            <p style={{ fontSize: "13px", color: "#7F1D1D", lineHeight: "1.6" }}>
              Blocking dates will prevent new bookings during the selected period. Existing
              bookings will not be affected. You'll need to contact customers directly to
              reschedule if needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
