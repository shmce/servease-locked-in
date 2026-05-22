import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check, MapPin, Plus, Trash2, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import {
  getCurrentUser,
  getStoredProviderAccessToken,
  upsertProviderPayoutMethod,
  replaceProviderOwnedServices,
  replaceProviderAvailabilityWindows,
  updateCurrentUserProfile,
  listCatalogCategories,
  listCatalogServices,
  listCatalogServiceAreas,
  CatalogCategory,
  CatalogServiceItem,
  ProviderOwnedServiceInput,
  AvailabilityWindowInput,
  DayOfWeek,
  ServiceAreaSummary,
} from "../../services/serveaseProviderApi";

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
  serviceId: string;
  categoryId: string;
  name: string;
  basePrice: string;
  priceUnit: string;
}

interface DaySchedule {
  day: string;
  startTime: string;
  endTime: string;
  unavailable: boolean;
}

function toAreaLabel(area: ServiceAreaSummary): string {
  return area.name || area.city;
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Payout Setup
  const [payoutMethod, setPayoutMethod] = useState("bank");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [setPrimary, setSetPrimary] = useState(false);

  // Step 2: Service Configuration
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      serviceId: "",
      categoryId: "",
      name: "",
      basePrice: "",
      priceUnit: "per hour",
    },
  ]);

  // Step 3: Service Area
  const [baseAddress, setBaseAddress] = useState("");
  const [serviceRadius, setServiceRadius] = useState(15);
  const [areaType, setAreaType] = useState<"radius" | "specific">("radius");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceAreaSummary[]>([]);
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>([]);
  const [catalogServices, setCatalogServices] = useState<CatalogServiceItem[]>([]);
  const [serviceAreasError, setServiceAreasError] = useState<string | null>(null);

  const areas = useMemo(() => {
    return serviceAreas
      .filter((area) => area.status === "active")
      .map(toAreaLabel)
      .filter(Boolean);
  }, [serviceAreas]);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      listCatalogServiceAreas(),
      listCatalogCategories(),
      listCatalogServices(),
    ])
      .then(([items, nextCategories, nextServices]) => {
        if (!isMounted) return;
        setServiceAreas(items);
        setCatalogCategories(nextCategories);
        setCatalogServices(nextServices);
        setServiceAreasError(null);
      })
      .catch((error) => {
        if (!isMounted) return;
        setServiceAreasError(
          error instanceof Error
            ? error.message
            : "Unable to load live service areas.",
        );
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const steps = [
    { number: 1, label: "Payout Setup" },
    { number: 2, label: "Services" },
    { number: 3, label: "Service Area" },
    { number: 4, label: "Availability" },
  ];

  const handleCompleteOnboarding = async () => {
    const token = getStoredProviderAccessToken();
    if (!token) {
      setSubmitError('Not authenticated. Please sign in again.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payoutLabel = payoutMethod === 'bank' ? bankName : mobileNumber;
      const last4 =
        payoutMethod === 'bank' && accountNumber.length >= 4
          ? accountNumber.slice(-4)
          : null;
      const serviceInputs: ProviderOwnedServiceInput[] = services
        .filter((s) => s.name.trim() && s.serviceId)
        .map((s) => ({
          serviceId: s.serviceId,
          title: s.name.trim(),
          price: parseFloat(s.basePrice) || null,
          pricingMode: s.priceUnit === 'per hour' ? 'hourly' : 'flat',
          isActive: true,
        }));
      const windowInputs: AvailabilityWindowInput[] = schedule.map((s) => ({
        dayOfWeek: s.day.toLowerCase() as DayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isActive: !s.unavailable,
      }));
      const currentUser = await getCurrentUser(token);
      const serviceArea =
        areaType === 'specific'
          ? selectedAreas.join(', ')
          : [
              baseAddress.trim(),
              serviceRadius > 0 ? `${serviceRadius} km radius` : null,
            ]
              .filter(Boolean)
              .join(' - ');
      await Promise.all([
        upsertProviderPayoutMethod(token, {
          methodType: payoutMethod as 'bank' | 'gcash' | 'paymaya',
          accountLabel: payoutLabel || payoutMethod,
          accountName: accountName || null,
          accountNumberLast4: last4,
          isDefault: setPrimary,
        }),
        serviceInputs.length > 0
          ? replaceProviderOwnedServices(token, serviceInputs)
          : Promise.resolve([]),
        replaceProviderAvailabilityWindows(token, windowInputs),
        currentUser.providerProfile
          ? updateCurrentUserProfile(token, {
              fullName:
                currentUser.user.fullName ||
                currentUser.providerProfile.businessName ||
                currentUser.user.email,
              contactNumber: currentUser.user.contactNumber,
              address: currentUser.customerProfile?.address ?? null,
              businessName:
                currentUser.providerProfile.businessName ||
                currentUser.user.fullName ||
                currentUser.user.email,
              bio: currentUser.providerProfile.bio ?? null,
              serviceDescription:
                currentUser.providerProfile.serviceDescription ?? null,
              serviceArea: serviceArea || null,
              yearsExperience:
                currentUser.providerProfile.yearsExperience ?? null,
            })
          : Promise.resolve(null),
      ]);
      navigate('/provider/dashboard');
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Failed to save onboarding data. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (
      currentStep === 2 &&
      services.some((service) => service.name.trim() && !service.serviceId)
    ) {
      setSubmitError("Choose a catalog service for each service you add.");
      return;
    }
    setSubmitError(null);
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteOnboarding();
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
      serviceId: "",
      categoryId: "",
      name: "",
      basePrice: "",
      priceUnit: "per hour",
    };
    setServices([...services, newService]);
  };

  const removeService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const updateServiceCatalogCategory = (id: string, categoryId: string) => {
    setServices(
      services.map((service) =>
        service.id === id ? { ...service, categoryId, serviceId: "" } : service,
      ),
    );
  };

  const updateServiceCatalogService = (id: string, serviceId: string) => {
    const catalogService = catalogServices.find((service) => service.id === serviceId);
    setServices(
      services.map((service) =>
        service.id === id
          ? {
              ...service,
              serviceId,
              categoryId: catalogService?.categoryId ?? service.categoryId,
              name: service.name.trim() ? service.name : catalogService?.name ?? "",
            }
          : service,
      ),
    );
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

      <div style={styles.infoBox}>
        <Clock size={18} style={{ marginTop: "2px", flexShrink: 0 }} />
        <div>
          You can review balances and request payouts from the Payout Method page
          after onboarding.
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

          <div style={styles.gridTwoCol}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Catalog Category</label>
              <select
                style={styles.select}
                value={service.categoryId}
                onChange={(e) => updateServiceCatalogCategory(service.id, e.target.value)}
              >
                <option value="">Choose category</option>
                {catalogCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Catalog Service</label>
              <select
                style={styles.select}
                value={service.serviceId}
                onChange={(e) => updateServiceCatalogService(service.id, e.target.value)}
                disabled={!service.categoryId}
              >
                <option value="">Choose service</option>
                {catalogServices
                  .filter((item) => item.categoryId === service.categoryId)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>
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

          <div style={styles.gridTwoCol}>
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
          {serviceAreasError && (
            <p style={{ fontSize: "13px", color: "#B45309", marginTop: "8px" }}>
              Live service areas could not be loaded. Use radius-based coverage or try again later.
            </p>
          )}
          {!serviceAreasError && areas.length === 0 && (
            <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "8px" }}>
              No active service areas are available right now. Use radius-based coverage instead.
            </p>
          )}
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

        {submitError && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '14px',
            }}
          >
            {submitError}
          </div>
        )}
        <div style={styles.buttonGroup}>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ChevronLeft size={18} />
            Back
          </button>
          <button
            style={{
              ...styles.button,
              ...styles.primaryButton,
              opacity: isSubmitting ? 0.7 : 1,
            }}
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Saving...'
              : currentStep === 4
              ? 'Finish Setup'
              : 'Continue'}
            {!isSubmitting && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
