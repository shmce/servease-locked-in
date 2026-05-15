import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, MapPin, Plus, Trash2, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router";

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F9FAFB",
    padding: "32px",
  },
  maxWidthContainer: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  progressBar: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px 32px",
    marginBottom: "32px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
  },
  progressBarInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  stepIndicator: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    position: "relative" as const,
  },
  stepCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "600",
    zIndex: 2,
    transition: "all 0.3s ease",
  },
  stepLine: {
    flex: 1,
    height: "3px",
    backgroundColor: "#E5E7EB",
    position: "relative" as const,
    margin: "0 8px",
  },
  stepLineProgress: {
    height: "100%",
    backgroundColor: "#00BF63",
    transition: "width 0.3s ease",
    borderRadius: "2px",
  },
  stepLabel: {
    position: "absolute" as const,
    top: "50px",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "12px",
    fontWeight: "500",
    color: "#6B7280",
    whiteSpace: "nowrap" as const,
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "32px",
    marginBottom: "24px",
  },
  cardTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "8px",
  },
  cardSubtitle: {
    fontSize: "14px",
    color: "#6B7280",
    marginBottom: "32px",
  },
  formGroup: {
    marginBottom: "24px",
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
    transition: "border-color 0.3s ease",
    outline: "none",
    width: "100%",
  },
  select: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    transition: "border-color 0.3s ease",
    outline: "none",
    width: "100%",
    backgroundColor: "white",
    cursor: "pointer",
  },
  radioGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  radioOption: {
    display: "flex",
    alignItems: "center",
    padding: "16px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  radioCircle: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    border: "2px solid #E5E7EB",
    marginRight: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  radioCircleInner: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#00BF63",
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    marginTop: "16px",
    cursor: "pointer",
  },
  checkboxSquare: {
    width: "20px",
    height: "20px",
    borderRadius: "4px",
    border: "2px solid #E5E7EB",
    marginRight: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  pill: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "2px solid #E5E7EB",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: "white",
    color: "#6B7280",
  },
  pillActive: {
    backgroundColor: "#00BF63",
    borderColor: "#00BF63",
    color: "white",
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
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "32px",
  },
  serviceCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
    border: "1px solid #E5E7EB",
  },
  serviceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  serviceTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
  },
  gridTwoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  gridThreeCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "16px",
  },
  mapPlaceholder: {
    width: "100%",
    height: "300px",
    backgroundColor: "#F3F4F6",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9CA3AF",
    fontSize: "14px",
    marginTop: "16px",
    marginBottom: "24px",
    border: "2px dashed #D1D5DB",
  },
  slider: {
    width: "100%",
    height: "6px",
    borderRadius: "3px",
    background: "#E5E7EB",
    outline: "none",
    WebkitAppearance: "none" as const,
    appearance: "none" as const,
  },
  sliderValue: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "8px",
    fontSize: "12px",
    color: "#6B7280",
  },
  dayRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "#F9FAFB",
    borderRadius: "10px",
    marginBottom: "12px",
  },
  dayName: {
    width: "100px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  timeInput: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "2px solid #E5E7EB",
    fontSize: "13px",
    color: "#374151",
    outline: "none",
    flex: 1,
  },
  infoBox: {
    backgroundColor: "#ECFDF5",
    border: "1px solid #A7F3D0",
    borderRadius: "10px",
    padding: "16px",
    marginTop: "16px",
    fontSize: "13px",
    color: "#065F46",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
  },
  badgeGreen: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  },
  badgeBlue: {
    backgroundColor: "#DBEAFE",
    color: "#1E40AF",
  },
  badgePurple: {
    backgroundColor: "#E9D5FF",
    color: "#6B21A8",
  },
  badgeOrange: {
    backgroundColor: "#FED7AA",
    color: "#9A3412",
  },
};

interface Service {
  id: string;
  name: string;
  basePrice: string;
  priceUnit: string;
  calloutFee: string;
  materialsMarkup: string;
  minimumCharge: string;
  emergencyMultiplier: string;
  estimatedDuration: string;
}

interface DaySchedule {
  day: string;
  startTime: string;
  endTime: string;
  unavailable: boolean;
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Payout Setup
  const [payoutMethod, setPayoutMethod] = useState("bank");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("savings");
  const [branch, setBranch] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [setPrimary, setSetPrimary] = useState(false);
  const [payoutSchedule, setPayoutSchedule] = useState("weekly");

  // Step 2: Service Configuration
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "Plumbing Repair",
      basePrice: "500",
      priceUnit: "per hour",
      calloutFee: "200",
      materialsMarkup: "15",
      minimumCharge: "500",
      emergencyMultiplier: "1.5",
      estimatedDuration: "2 hours",
    },
    {
      id: "2",
      name: "Pipe Installation",
      basePrice: "3000",
      priceUnit: "per project",
      calloutFee: "200",
      materialsMarkup: "20",
      minimumCharge: "2500",
      emergencyMultiplier: "2",
      estimatedDuration: "4 hours",
    },
  ]);

  // Step 3: Service Area
  const [baseAddress, setBaseAddress] = useState("");
  const [serviceRadius, setServiceRadius] = useState(15);
  const [areaType, setAreaType] = useState<"radius" | "specific">("radius");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [maxTravelDistance, setMaxTravelDistance] = useState("25");

  const areas = [
    "Quezon City",
    "Manila",
    "Makati",
    "Pasig",
    "Taguig",
    "Mandaluyong",
    "San Juan",
    "Parañaque",
    "Las Piñas",
    "Muntinlupa",
    "Caloocan",
    "Malabon",
    "Navotas",
    "Valenzuela",
  ];

  // Step 4: Availability Calendar
  const [schedule, setSchedule] = useState<DaySchedule[]>([
    { day: "Monday", startTime: "09:00", endTime: "17:00", unavailable: false },
    { day: "Tuesday", startTime: "09:00", endTime: "17:00", unavailable: false },
    { day: "Wednesday", startTime: "09:00", endTime: "17:00", unavailable: false },
    { day: "Thursday", startTime: "09:00", endTime: "17:00", unavailable: false },
    { day: "Friday", startTime: "09:00", endTime: "17:00", unavailable: false },
    { day: "Saturday", startTime: "09:00", endTime: "13:00", unavailable: false },
    { day: "Sunday", startTime: "09:00", endTime: "17:00", unavailable: true },
  ]);
  const [breakStart, setBreakStart] = useState("12:00");
  const [breakEnd, setBreakEnd] = useState("13:00");
  const [recurringDaysOff, setRecurringDaysOff] = useState<string[]>(["Sunday"]);
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState("5");
  const [advanceBookingWindow, setAdvanceBookingWindow] = useState("30");

  const steps = [
    { number: 1, label: "Payout Setup" },
    { number: 2, label: "Services" },
    { number: 3, label: "Service Area" },
    { number: 4, label: "Availability" },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      navigate("/provider/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateService = (id: string, field: keyof Service, value: string) => {
    setServices(
      services.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      )
    );
  };

  const addNewService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: "",
      basePrice: "",
      priceUnit: "per hour",
      calloutFee: "",
      materialsMarkup: "",
      minimumCharge: "",
      emergencyMultiplier: "",
      estimatedDuration: "",
    };
    setServices([...services, newService]);
  };

  const removeService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const updateSchedule = (
    day: string,
    field: keyof DaySchedule,
    value: string | boolean
  ) => {
    setSchedule(
      schedule.map((s) => (s.day === day ? { ...s, [field]: value } : s))
    );
  };

  const copyToAllDays = () => {
    const mondaySchedule = schedule.find((s) => s.day === "Monday");
    if (mondaySchedule) {
      setSchedule(
        schedule.map((s) => ({
          ...s,
          startTime: mondaySchedule.startTime,
          endTime: mondaySchedule.endTime,
          unavailable: false,
        }))
      );
    }
  };

  const toggleRecurringDayOff = (day: string) => {
    setRecurringDaysOff((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const renderProgressBar = () => (
    <div style={styles.progressBar}>
      <div style={styles.progressBarInner}>
        <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>
          Step {currentStep} of 4
        </div>
        <div style={{ fontSize: "13px", color: "#9CA3AF" }}>
          {Math.round((currentStep / 4) * 100)}% Complete
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
        {steps.map((step, index) => (
          <div key={step.number} style={{ ...styles.stepIndicator }}>
            <div
              style={{
                ...styles.stepCircle,
                backgroundColor:
                  currentStep > step.number
                    ? "#00BF63"
                    : currentStep === step.number
                    ? "#00BF63"
                    : "white",
                color:
                  currentStep >= step.number ? "white" : "#9CA3AF",
                border:
                  currentStep >= step.number
                    ? "2px solid #00BF63"
                    : "2px solid #E5E7EB",
              }}
            >
              {currentStep > step.number ? (
                <Check size={18} />
              ) : (
                step.number
              )}
            </div>
            {index < steps.length - 1 && (
              <div style={styles.stepLine}>
                <div
                  style={{
                    ...styles.stepLineProgress,
                    width: currentStep > step.number ? "100%" : "0%",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ position: "relative", marginTop: "16px" }}>
        {steps.map((step, index) => (
          <div
            key={step.number}
            style={{
              position: "absolute",
              left: `${(index / (steps.length - 1)) * 100}%`,
              transform: "translateX(-50%)",
              fontSize: "12px",
              fontWeight: "500",
              color: currentStep >= step.number ? "#00BF63" : "#9CA3AF",
              whiteSpace: "nowrap",
            }}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Payout Setup</h2>
      <p style={styles.cardSubtitle}>
        Configure how you'd like to receive your earnings
      </p>

      <div style={styles.formGroup}>
        <label style={styles.label}>Payout Method</label>
        <div style={styles.radioGroup}>
          <div
            style={{
              ...styles.radioOption,
              borderColor: payoutMethod === "bank" ? "#00BF63" : "#E5E7EB",
              backgroundColor: payoutMethod === "bank" ? "#F0FDF4" : "white",
            }}
            onClick={() => setPayoutMethod("bank")}
          >
            <div
              style={{
                ...styles.radioCircle,
                borderColor: payoutMethod === "bank" ? "#00BF63" : "#E5E7EB",
              }}
            >
              {payoutMethod === "bank" && <div style={styles.radioCircleInner} />}
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "14px", color: "#111827" }}>
                Bank Transfer
              </div>
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
                Direct deposit to your bank account
              </div>
            </div>
          </div>

          <div
            style={{
              ...styles.radioOption,
              borderColor: payoutMethod === "gcash" ? "#00BF63" : "#E5E7EB",
              backgroundColor: payoutMethod === "gcash" ? "#F0FDF4" : "white",
            }}
            onClick={() => setPayoutMethod("gcash")}
          >
            <div
              style={{
                ...styles.radioCircle,
                borderColor: payoutMethod === "gcash" ? "#00BF63" : "#E5E7EB",
              }}
            >
              {payoutMethod === "gcash" && <div style={styles.radioCircleInner} />}
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "14px", color: "#111827" }}>
                GCash
              </div>
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
                Instant transfer to your GCash wallet
              </div>
            </div>
          </div>

          <div
            style={{
              ...styles.radioOption,
              borderColor: payoutMethod === "paymaya" ? "#00BF63" : "#E5E7EB",
              backgroundColor: payoutMethod === "paymaya" ? "#F0FDF4" : "white",
            }}
            onClick={() => setPayoutMethod("paymaya")}
          >
            <div
              style={{
                ...styles.radioCircle,
                borderColor: payoutMethod === "paymaya" ? "#00BF63" : "#E5E7EB",
              }}
            >
              {payoutMethod === "paymaya" && <div style={styles.radioCircleInner} />}
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "14px", color: "#111827" }}>
                PayMaya
              </div>
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
                Instant transfer to your PayMaya wallet
              </div>
            </div>
          </div>
        </div>
      </div>

      {payoutMethod === "bank" && (
        <>
          <div style={styles.formGroup}>
            <label style={styles.label}>Bank Name</label>
            <select
              style={styles.select}
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            >
              <option value="">Select Bank</option>
              <option value="BDO">BDO Unibank</option>
              <option value="BPI">Bank of the Philippine Islands</option>
              <option value="Metrobank">Metrobank</option>
              <option value="Security Bank">Security Bank</option>
              <option value="UnionBank">UnionBank</option>
              <option value="RCBC">RCBC</option>
              <option value="Chinabank">Chinabank</option>
              <option value="PNB">Philippine National Bank</option>
            </select>
          </div>

          <div style={styles.gridTwoCol}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Account Name</label>
              <input
                type="text"
                style={styles.input}
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Full name as it appears on account"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Account Number</label>
              <input
                type="text"
                style={styles.input}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
              />
            </div>
          </div>

          <div style={styles.gridTwoCol}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Account Type</label>
              <select
                style={styles.select}
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
              >
                <option value="savings">Savings</option>
                <option value="checking">Checking</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Branch</label>
              <input
                type="text"
                style={styles.input}
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Branch name or location"
              />
            </div>
          </div>
        </>
      )}

      {(payoutMethod === "gcash" || payoutMethod === "paymaya") && (
        <div style={styles.gridTwoCol}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Mobile Number</label>
            <input
              type="text"
              style={styles.input}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="+63 9XX XXX XXXX"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Account Name</label>
            <input
              type="text"
              style={styles.input}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Name registered to account"
            />
          </div>
        </div>
      )}

      <div style={styles.checkbox} onClick={() => setSetPrimary(!setPrimary)}>
        <div
          style={{
            ...styles.checkboxSquare,
            backgroundColor: setPrimary ? "#00BF63" : "white",
            borderColor: setPrimary ? "#00BF63" : "#E5E7EB",
          }}
        >
          {setPrimary && <Check size={14} color="white" />}
        </div>
        <span style={{ fontSize: "14px", color: "#374151" }}>
          Set as primary payout method
        </span>
      </div>

      <div style={{ ...styles.formGroup, marginTop: "32px" }}>
        <label style={styles.label}>Payout Schedule</label>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            style={{
              ...styles.pill,
              ...(payoutSchedule === "weekly" ? styles.pillActive : {}),
            }}
            onClick={() => setPayoutSchedule("weekly")}
          >
            Weekly
          </button>
          <button
            style={{
              ...styles.pill,
              ...(payoutSchedule === "biweekly" ? styles.pillActive : {}),
            }}
            onClick={() => setPayoutSchedule("biweekly")}
          >
            Biweekly
          </button>
        </div>
      </div>

      <div style={styles.infoBox}>
        <Calendar size={18} style={{ marginTop: "2px", flexShrink: 0 }} />
        <div>
          Payouts are processed every {payoutSchedule === "weekly" ? "Friday" : "1st and 15th of the month"}. 
          Funds typically arrive within 1-3 business days.
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Service Configuration</h2>
      <p style={styles.cardSubtitle}>
        Set pricing and details for the services you offer
      </p>

      {services.map((service, index) => (
        <div key={service.id} style={styles.serviceCard}>
          <div style={styles.serviceHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={styles.serviceTitle}>Service {index + 1}</span>
              <span style={{ ...styles.badge, ...styles.badgeGreen }}>Active</span>
            </div>
            {services.length > 1 && (
              <button
                style={{
                  ...styles.button,
                  ...styles.secondaryButton,
                  padding: "8px 12px",
                }}
                onClick={() => removeService(service.id)}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Service Name</label>
            <input
              type="text"
              style={styles.input}
              value={service.name}
              onChange={(e) => updateService(service.id, "name", e.target.value)}
              placeholder="e.g., Plumbing Repair, Pipe Installation"
            />
          </div>

          <div style={styles.gridThreeCol}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Base Price</label>
              <input
                type="text"
                style={styles.input}
                value={service.basePrice}
                onChange={(e) => updateService(service.id, "basePrice", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Price Unit</label>
              <select
                style={styles.select}
                value={service.priceUnit}
                onChange={(e) => updateService(service.id, "priceUnit", e.target.value)}
              >
                <option value="per hour">Per Hour</option>
                <option value="per project">Per Project</option>
                <option value="per day">Per Day</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Callout Fee</label>
              <input
                type="text"
                style={styles.input}
                value={service.calloutFee}
                onChange={(e) =>
                  updateService(service.id, "calloutFee", e.target.value)
                }
                placeholder="0.00"
              />
            </div>
          </div>

          <div style={styles.gridThreeCol}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Materials Markup (%)</label>
              <input
                type="text"
                style={styles.input}
                value={service.materialsMarkup}
                onChange={(e) =>
                  updateService(service.id, "materialsMarkup", e.target.value)
                }
                placeholder="0"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Minimum Charge</label>
              <input
                type="text"
                style={styles.input}
                value={service.minimumCharge}
                onChange={(e) =>
                  updateService(service.id, "minimumCharge", e.target.value)
                }
                placeholder="0.00"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Emergency Multiplier</label>
              <input
                type="text"
                style={styles.input}
                value={service.emergencyMultiplier}
                onChange={(e) =>
                  updateService(service.id, "emergencyMultiplier", e.target.value)
                }
                placeholder="1.5"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Estimated Duration</label>
            <input
              type="text"
              style={styles.input}
              value={service.estimatedDuration}
              onChange={(e) =>
                updateService(service.id, "estimatedDuration", e.target.value)
              }
              placeholder="e.g., 2 hours, 1 day"
            />
          </div>
        </div>
      ))}

      <button
        style={{ ...styles.button, ...styles.outlinedButton }}
        onClick={addNewService}
      >
        <Plus size={18} />
        Add New Service
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Service Area</h2>
      <p style={styles.cardSubtitle}>
        Define where you can provide your services
      </p>

      <div style={styles.formGroup}>
        <label style={styles.label}>Base Location</label>
        <input
          type="text"
          style={styles.input}
          value={baseAddress}
          onChange={(e) => setBaseAddress(e.target.value)}
          placeholder="Enter your base address"
        />
      </div>

      <div style={styles.mapPlaceholder}>
        <div style={{ textAlign: "center" }}>
          <MapPin size={32} style={{ marginBottom: "8px" }} />
          <div>Map with draggable pin</div>
          <div style={{ fontSize: "12px", marginTop: "4px" }}>
            Drag the pin to set your exact location
          </div>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Service Radius: {serviceRadius} km</label>
        <input
          type="range"
          min="5"
          max="50"
          value={serviceRadius}
          onChange={(e) => setServiceRadius(parseInt(e.target.value))}
          style={{
            ...styles.slider,
            background: `linear-gradient(to right, #00BF63 0%, #00BF63 ${
              ((serviceRadius - 5) / 45) * 100
            }%, #E5E7EB ${((serviceRadius - 5) / 45) * 100}%, #E5E7EB 100%)`,
          }}
        />
        <div style={styles.sliderValue}>
          <span>5 km</span>
          <span>50 km</span>
        </div>
      </div>

      <div style={{ ...styles.formGroup, marginTop: "32px" }}>
        <label style={styles.label}>Coverage Type</label>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            style={{
              ...styles.pill,
              ...(areaType === "radius" ? styles.pillActive : {}),
            }}
            onClick={() => setAreaType("radius")}
          >
            Radius-based
          </button>
          <button
            style={{
              ...styles.pill,
              ...(areaType === "specific" ? styles.pillActive : {}),
            }}
            onClick={() => setAreaType("specific")}
          >
            Specific Areas
          </button>
        </div>
      </div>

      {areaType === "specific" && (
        <div style={{ ...styles.formGroup, marginTop: "24px" }}>
          <label style={styles.label}>Select Service Areas</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginTop: "12px",
            }}
          >
            {areas.map((area) => (
              <div
                key={area}
                style={styles.checkbox}
                onClick={() => toggleArea(area)}
              >
                <div
                  style={{
                    ...styles.checkboxSquare,
                    backgroundColor: selectedAreas.includes(area)
                      ? "#00BF63"
                      : "white",
                    borderColor: selectedAreas.includes(area)
                      ? "#00BF63"
                      : "#E5E7EB",
                  }}
                >
                  {selectedAreas.includes(area) && (
                    <Check size={14} color="white" />
                  )}
                </div>
                <span style={{ fontSize: "13px", color: "#374151" }}>{area}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ ...styles.formGroup, marginTop: "32px" }}>
        <label style={styles.label}>Maximum Travel Distance (km)</label>
        <input
          type="text"
          style={styles.input}
          value={maxTravelDistance}
          onChange={(e) => setMaxTravelDistance(e.target.value)}
          placeholder="Enter maximum distance"
        />
      </div>

      <div style={styles.infoBox}>
        <MapPin size={18} style={{ marginTop: "2px", flexShrink: 0 }} />
        <div>
          Your service area affects which booking requests you'll receive. You can always 
          update this later in your settings.
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Availability Calendar</h2>
      <p style={styles.cardSubtitle}>
        Set your working hours and availability preferences
      </p>

      <div style={styles.formGroup}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <label style={styles.label}>Weekly Schedule</label>
          <button
            style={{ ...styles.button, ...styles.secondaryButton, padding: "8px 16px" }}
            onClick={copyToAllDays}
          >
            Copy Monday to All Days
          </button>
        </div>

        {schedule.map((day) => (
          <div key={day.day} style={styles.dayRow}>
            <div style={styles.dayName}>{day.day}</div>
            <input
              type="time"
              style={styles.timeInput}
              value={day.startTime}
              onChange={(e) =>
                updateSchedule(day.day, "startTime", e.target.value)
              }
              disabled={day.unavailable}
            />
            <span style={{ color: "#9CA3AF" }}>to</span>
            <input
              type="time"
              style={styles.timeInput}
              value={day.endTime}
              onChange={(e) =>
                updateSchedule(day.day, "endTime", e.target.value)
              }
              disabled={day.unavailable}
            />
            <div
              style={styles.checkbox}
              onClick={() =>
                updateSchedule(day.day, "unavailable", !day.unavailable)
              }
            >
              <div
                style={{
                  ...styles.checkboxSquare,
                  backgroundColor: day.unavailable ? "#00BF63" : "white",
                  borderColor: day.unavailable ? "#00BF63" : "#E5E7EB",
                }}
              >
                {day.unavailable && <Check size={14} color="white" />}
              </div>
              <span style={{ fontSize: "13px", color: "#6B7280" }}>
                Unavailable
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...styles.formGroup, marginTop: "32px" }}>
        <label style={styles.label}>Break Times</label>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <label style={{ ...styles.label, fontSize: "12px", color: "#6B7280" }}>
              Break Start
            </label>
            <input
              type="time"
              style={styles.input}
              value={breakStart}
              onChange={(e) => setBreakStart(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ ...styles.label, fontSize: "12px", color: "#6B7280" }}>
              Break End
            </label>
            <input
              type="time"
              style={styles.input}
              value={breakEnd}
              onChange={(e) => setBreakEnd(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ ...styles.formGroup, marginTop: "24px" }}>
        <label style={styles.label}>Recurring Days Off</label>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
            (day) => (
              <button
                key={day}
                style={{
                  ...styles.pill,
                  ...(recurringDaysOff.includes(day) ? styles.pillActive : {}),
                }}
                onClick={() => toggleRecurringDayOff(day)}
              >
                {day.slice(0, 3)}
              </button>
            )
          )}
        </div>
      </div>

      <div style={styles.gridTwoCol}>
        <div style={{ ...styles.formGroup, marginTop: "32px" }}>
          <label style={styles.label}>Max Bookings Per Day</label>
          <input
            type="text"
            style={styles.input}
            value={maxBookingsPerDay}
            onChange={(e) => setMaxBookingsPerDay(e.target.value)}
            placeholder="e.g., 5"
          />
        </div>
        <div style={{ ...styles.formGroup, marginTop: "32px" }}>
          <label style={styles.label}>Advance Booking Window (days)</label>
          <input
            type="text"
            style={styles.input}
            value={advanceBookingWindow}
            onChange={(e) => setAdvanceBookingWindow(e.target.value)}
            placeholder="e.g., 30"
          />
        </div>
      </div>

      <div style={styles.infoBox}>
        <Clock size={18} style={{ marginTop: "2px", flexShrink: 0 }} />
        <div>
          Your availability helps customers find the best time to book your services. 
          You can always block specific dates later for personal time off.
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {renderProgressBar()}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <div style={styles.buttonGroup}>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft size={18} />
            Back
          </button>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={handleNext}
          >
            {currentStep === 4 ? "Finish Setup" : "Continue"}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
