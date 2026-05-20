import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router";
import { useProviderData } from "../context/ProviderDataContext";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #F9FAFB, rgba(16, 185, 129, 0.05))",
    padding: "32px",
  },
  maxWidthContainer: {
    maxWidth: "1200px",
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
    backgroundColor: "#00BF63",
    color: "white",
    boxShadow: "0 4px 16px rgba(0, 191, 99, 0.25)",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    transition: "border-color 0.3s ease",
    outline: "none",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
    display: "block",
  },
  toggle: {
    width: "48px",
    height: "28px",
    borderRadius: "14px",
    cursor: "pointer",
    position: "relative" as const,
    transition: "background-color 0.3s ease",
  },
  toggleDot: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "white",
    position: "absolute" as const,
    top: "4px",
    transition: "transform 0.3s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
};

interface DaySchedule {
  available: boolean;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
}

export function SetAvailabilityPage() {
  const navigate = useNavigate();
  const {
    availabilityError,
    isAvailabilityLoading,
    providerData,
    saveAvailability,
  } = useProviderData();
  
  const [activeDay, setActiveDay] = useState("Monday");
  const [schedule, setSchedule] = useState<{ [key: string]: DaySchedule }>(
    providerData.availability
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const [copyToAll, setCopyToAll] = useState(false);
  const [recurringDaysOff, setRecurringDaysOff] = useState<string[]>([]);
  const [offReason, setOffReason] = useState("");

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    setSchedule(providerData.availability);
  }, [providerData.availability]);

  const updateSchedule = (
    day: string,
    field: keyof DaySchedule,
    value: string | boolean
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleCopyToAll = () => {
    if (copyToAll) {
      const currentDaySchedule = schedule[activeDay];
      const newSchedule = { ...schedule };
      daysOfWeek.forEach((day) => {
        if (day !== activeDay) {
          newSchedule[day] = { ...currentDaySchedule };
        }
      });
      setSchedule(newSchedule);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaveError(null);
      await saveAvailability(schedule);
      navigate("/provider/calendar");
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Unable to save availability.",
      );
    }
  };

  const currentSchedule = schedule[activeDay];

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Set Availability</h1>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>
            Configure your working hours and recurring days off
          </p>
          {(saveError || availabilityError) && (
            <p style={{ fontSize: "14px", color: "#B91C1C", marginTop: "12px" }}>
              {saveError || availabilityError}
            </p>
          )}
        </div>

        {/* Weekly Schedule Card */}
        <div style={styles.card}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#111827",
              marginBottom: "20px",
            }}
          >
            Weekly Schedule
          </h2>

          {/* Day Selector Tabs */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "24px",
              flexWrap: "wrap",
            }}
          >
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: activeDay === day ? "#00BF63" : "#F3F4F6",
                  color: activeDay === day ? "white" : "#6B7280",
                  boxShadow:
                    activeDay === day
                      ? "0 2px 8px rgba(0, 191, 99, 0.25)"
                      : "none",
                  transition: "all 0.3s ease",
                }}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Day Configuration */}
          <div
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            {/* Available Toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
                paddingBottom: "24px",
                borderBottom: "1px solid #E5E7EB",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: "4px",
                  }}
                >
                  Available on {activeDay}
                </p>
                <p style={{ fontSize: "13px", color: "#6B7280" }}>
                  Toggle to mark this day as available or unavailable
                </p>
              </div>
              <div
                onClick={() =>
                  updateSchedule(activeDay, "available", !currentSchedule.available)
                }
                style={{
                  ...styles.toggle,
                  backgroundColor: currentSchedule.available
                    ? "#00BF63"
                    : "#E5E7EB",
                }}
              >
                <div
                  style={{
                    ...styles.toggleDot,
                    transform: currentSchedule.available
                      ? "translateX(20px)"
                      : "translateX(4px)",
                  }}
                />
              </div>
            </div>

            {/* Time Configuration - Only shown when available */}
            {currentSchedule.available && (
              <>
                {/* Working Hours */}
                <div style={{ marginBottom: "24px" }}>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: "16px",
                    }}
                  >
                    Working Hours
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={styles.label}>Start Time</label>
                      <input
                        type="time"
                        value={currentSchedule.startTime}
                        placeholder="00:00"
                        onChange={(e) =>
                          updateSchedule(activeDay, "startTime", e.target.value)
                        }
                        style={{ 
                          ...styles.input, 
                          width: "100%",
                          colorScheme: "light",
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
                      <label style={styles.label}>End Time</label>
                      <input
                        type="time"
                        value={currentSchedule.endTime}
                        placeholder="00:00"
                        onChange={(e) =>
                          updateSchedule(activeDay, "endTime", e.target.value)
                        }
                        style={{ 
                          ...styles.input, 
                          width: "100%",
                          colorScheme: "light",
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

                {/* Break Time */}
                <div style={{ marginBottom: "24px" }}>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: "4px",
                    }}
                  >
                    Break Time{" "}
                    <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "400" }}>
                      (Optional)
                    </span>
                  </p>
                  <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px" }}>
                    Set a break period during your working hours
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={styles.label}>Break Start</label>
                      <input
                        type="time"
                        value={currentSchedule.breakStart}
                        onChange={(e) =>
                          updateSchedule(activeDay, "breakStart", e.target.value)
                        }
                        style={{ ...styles.input, width: "100%" }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#00BF63";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#E5E7EB";
                        }}
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Break End</label>
                      <input
                        type="time"
                        value={currentSchedule.breakEnd}
                        onChange={(e) =>
                          updateSchedule(activeDay, "breakEnd", e.target.value)
                        }
                        style={{ ...styles.input, width: "100%" }}
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

                {/* Copy to All Days */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    paddingTop: "24px",
                    borderTop: "1px solid #E5E7EB",
                  }}
                >
                  <input
                    type="checkbox"
                    id="copyToAll"
                    checked={copyToAll}
                    onChange={(e) => {
                      setCopyToAll(e.target.checked);
                      if (e.target.checked) {
                        handleCopyToAll();
                      }
                    }}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: "#00BF63",
                    }}
                  />
                  <label
                    htmlFor="copyToAll"
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      cursor: "pointer",
                    }}
                  >
                    Copy this schedule to all days
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recurring Days Off Card */}
        <div style={styles.card}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Recurring Days Off
          </h2>
          <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px" }}>
            Set specific dates when you'll be unavailable
          </p>

          <div style={{ marginBottom: "20px" }}>
            <label style={styles.label}>Select Dates</label>
            <input
              type="date"
              style={{ ...styles.input, width: "100%" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#00BF63";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
              }}
            />
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "6px" }}>
              You can add multiple dates by selecting them individually
            </p>
          </div>

          <div>
            <label style={styles.label}>
              Reason{" "}
              <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "400" }}>
                (Optional)
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g., Vacation, Personal time, Holiday..."
              value={offReason}
              onChange={(e) => setOffReason(e.target.value)}
              style={{ ...styles.input, width: "100%" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#00BF63";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
              }}
            />
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
              onClick={handleSaveChanges}
              disabled={isAvailabilityLoading}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                opacity: isAvailabilityLoading ? 0.7 : 1,
                cursor: isAvailabilityLoading ? "not-allowed" : "pointer",
              }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#059669";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#00BF63";
            }}
          >
            <Calendar style={{ width: "18px", height: "18px" }} />
              {isAvailabilityLoading ? "Saving..." : "Save Changes"}
            </button>
        </div>
      </div>
    </div>
  );
}
