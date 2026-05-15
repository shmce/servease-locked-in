import { useState, useEffect } from "react";
import { Plus, X, Save, ChevronDown, CheckCircle2, DollarSign, Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useProviderData } from "../context/ProviderDataContext";

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F9FAFB",
    paddingBottom: "100px",
  },
  maxWidthContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "32px",
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
    marginBottom: "20px",
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
  outlinedButton: {
    backgroundColor: "white",
    color: "#00BF63",
    border: "2px solid #00BF63",
  },
  secondaryButton: {
    backgroundColor: "white",
    color: "#6B7280",
    border: "1px solid #E5E7EB",
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
  textarea: {
    padding: "10px 14px",
    borderRadius: "8px",
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
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
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
  stickyFooter: {
    position: "fixed" as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTop: "2px solid #F3F4F6",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12px",
    zIndex: 100,
    boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.05)",
  },
};

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: string;
  priceUnit: string;
  minPrice: string;
  maxPrice: string;
  duration: string;
  durationUnit: string;
  calloutFee: string;
  emergencyRate: string;
  materialsMarkup: string;
  active: boolean;
}

export function EditServicesPricingPage() {
  const navigate = useNavigate();
  const { providerData, setProviderData } = useProviderData();
  
  const [services, setServices] = useState<Service[]>(providerData.services.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    category: s.category,
    basePrice: s.baseRate.toString(),
    priceUnit: s.priceUnit,
    minPrice: "0",
    maxPrice: "0",
    duration: s.estimatedDuration,
    durationUnit: "hours",
    calloutFee: "0",
    emergencyRate: "1.0x",
    materialsMarkup: "0",
    active: s.isActive,
  })));

  const [editingId, setEditingId] = useState<string | null>(null);

  const addNewService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: "",
      description: "",
      category: "",
      basePrice: "",
      priceUnit: "per hour",
      minPrice: "",
      maxPrice: "",
      duration: "",
      durationUnit: "hours",
      calloutFee: "",
      emergencyRate: "1.0x",
      materialsMarkup: "",
      active: true,
    };
    setServices([...services, newService]);
    setEditingId(newService.id);
  };

  const deleteService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const updateService = (id: string, field: keyof Service, value: string | boolean) => {
    setServices(
      services.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveAll = () => {
    console.log("Saving all services...", services);
    setEditingId(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={styles.pageTitle}>Edit Services & Pricing</h1>
              <p style={{ fontSize: "16px", color: "#6B7280" }}>
                Manage your service offerings and pricing structure
              </p>
            </div>
            <button
              onClick={addNewService}
              style={{
                ...styles.button,
                ...styles.outlinedButton,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F0FDF8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              <Plus style={{ width: "18px", height: "18px" }} />
              Add New Service
            </button>
          </div>
        </div>

        {/* Services List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {services.map((service) => (
            <div key={service.id} style={styles.card}>
              {/* Service Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "2px solid #F3F4F6",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#111827" }}>
                      {service.name || "New Service"}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px" }}>
                      {service.category || "Uncategorized"}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#6B7280" }}>
                      Active
                    </span>
                    <div
                      onClick={() => updateService(service.id, "active", !service.active)}
                      style={{
                        ...styles.toggle,
                        backgroundColor: service.active ? "#00BF63" : "#E5E7EB",
                      }}
                    >
                      <div
                        style={{
                          ...styles.toggleDot,
                          transform: service.active ? "translateX(20px)" : "translateX(4px)",
                        }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingId(editingId === service.id ? null : service.id)}
                    style={{
                      ...styles.button,
                      ...styles.secondaryButton,
                      padding: "8px 16px",
                    }}
                  >
                    <Edit2 style={{ width: "14px", height: "14px" }} />
                    {editingId === service.id ? "Collapse" : "Edit"}
                  </button>
                  <button
                    onClick={() => deleteService(service.id)}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: "#FEE2E2",
                      border: "1px solid #FCA5A5",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 style={{ width: "16px", height: "16px", color: "#DC2626" }} />
                  </button>
                </div>
              </div>

              {/* Service Details - Expanded when editing */}
              {editingId === service.id && (
                <div>
                  {/* Row 1 */}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={styles.label}>Service Name</label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => updateService(service.id, "name", e.target.value)}
                        placeholder="e.g., House Cleaning"
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
                      <label style={styles.label}>Category</label>
                      <input
                        type="text"
                        value={service.category}
                        onChange={(e) => updateService(service.id, "category", e.target.value)}
                        placeholder="e.g., Cleaning"
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

                  {/* Row 2 - Description */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      value={service.description}
                      onChange={(e) => updateService(service.id, "description", e.target.value)}
                      placeholder="Describe your service..."
                      rows={2}
                      style={styles.textarea}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#00BF63";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E5E7EB";
                      }}
                    />
                  </div>

                  {/* Row 3 - Pricing */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={styles.label}>Base Price</label>
                      <div style={{ position: "relative" }}>
                        <span
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#6B7280",
                          }}
                        >
                          ₱
                        </span>
                        <input
                          type="number"
                          value={service.basePrice}
                          onChange={(e) => updateService(service.id, "basePrice", e.target.value)}
                          placeholder="0"
                          style={{ ...styles.input, paddingLeft: "28px" }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#00BF63";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#E5E7EB";
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={styles.label}>Price Unit</label>
                      <select
                        value={service.priceUnit}
                        onChange={(e) => updateService(service.id, "priceUnit", e.target.value)}
                        style={{ ...styles.input, cursor: "pointer" }}
                      >
                        <option value="per hour">per hour</option>
                        <option value="per day">per day</option>
                        <option value="per project">per project</option>
                        <option value="per sqm">per sqm</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.label}>Min Price</label>
                      <div style={{ position: "relative" }}>
                        <span
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#6B7280",
                          }}
                        >
                          ₱
                        </span>
                        <input
                          type="number"
                          value={service.minPrice}
                          onChange={(e) => updateService(service.id, "minPrice", e.target.value)}
                          placeholder="0"
                          style={{ ...styles.input, paddingLeft: "28px" }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#00BF63";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#E5E7EB";
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={styles.label}>Max Price</label>
                      <div style={{ position: "relative" }}>
                        <span
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#6B7280",
                          }}
                        >
                          ₱
                        </span>
                        <input
                          type="number"
                          value={service.maxPrice}
                          onChange={(e) => updateService(service.id, "maxPrice", e.target.value)}
                          placeholder="0"
                          style={{ ...styles.input, paddingLeft: "28px" }}
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

                  {/* Row 4 - Duration & Fees */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={styles.label}>Estimated Duration</label>
                      <input
                        type="number"
                        value={service.duration}
                        onChange={(e) => updateService(service.id, "duration", e.target.value)}
                        placeholder="0"
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
                      <label style={styles.label}>Unit</label>
                      <select
                        value={service.durationUnit}
                        onChange={(e) => updateService(service.id, "durationUnit", e.target.value)}
                        style={{ ...styles.input, cursor: "pointer" }}
                      >
                        <option value="minutes">minutes</option>
                        <option value="hours">hours</option>
                        <option value="days">days</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.label}>Callout Fee</label>
                      <div style={{ position: "relative" }}>
                        <span
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#6B7280",
                          }}
                        >
                          ₱
                        </span>
                        <input
                          type="number"
                          value={service.calloutFee}
                          onChange={(e) => updateService(service.id, "calloutFee", e.target.value)}
                          placeholder="0"
                          style={{ ...styles.input, paddingLeft: "28px" }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#00BF63";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#E5E7EB";
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={styles.label}>Emergency Rate</label>
                      <select
                        value={service.emergencyRate}
                        onChange={(e) => updateService(service.id, "emergencyRate", e.target.value)}
                        style={{ ...styles.input, cursor: "pointer" }}
                      >
                        <option value="1.0x">1.0x</option>
                        <option value="1.5x">1.5x</option>
                        <option value="2.0x">2.0x</option>
                        <option value="2.5x">2.5x</option>
                        <option value="3.0x">3.0x</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.label}>Materials Markup</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="number"
                          value={service.materialsMarkup}
                          onChange={(e) => updateService(service.id, "materialsMarkup", e.target.value)}
                          placeholder="0"
                          style={{ ...styles.input, paddingRight: "28px" }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#00BF63";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#E5E7EB";
                          }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#6B7280",
                          }}
                        >
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Collapsed View */}
              {editingId !== service.id && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "4px" }}>Base Price</p>
                    <p style={{ fontSize: "16px", fontWeight: "700", color: "#00BF63" }}>
                      ₱{service.basePrice} {service.priceUnit}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "4px" }}>Duration</p>
                    <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                      {service.duration} {service.durationUnit}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "4px" }}>Emergency Rate</p>
                    <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                      {service.emergencyRate}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {services.length === 0 && (
          <div
            style={{
              ...styles.card,
              textAlign: "center",
              padding: "64px 24px",
            }}
          >
            <p style={{ fontSize: "16px", color: "#6B7280", marginBottom: "20px" }}>
              No services added yet. Start by adding your first service.
            </p>
            <button
              onClick={addNewService}
              style={{
                ...styles.button,
                ...styles.primaryButton,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#059669";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#00BF63";
              }}
            >
              <Plus style={{ width: "18px", height: "18px" }} />
              Add Your First Service
            </button>
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div style={styles.stickyFooter}>
        <button
          onClick={() => navigate("/provider/edit-profile")}
          style={{
            ...styles.button,
            ...styles.secondaryButton,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F3F4F6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => {
            // Save services to context
            setProviderData({
              ...providerData,
              services: services.map(s => ({
                id: s.id,
                name: s.name,
                description: s.description,
                category: s.category,
                baseRate: parseFloat(s.basePrice) || 0,
                priceUnit: s.priceUnit,
                estimatedDuration: s.duration,
                isActive: s.active,
              })),
            });
            setEditingId(null);
            // Navigate back to edit profile
            navigate("/provider/edit-profile");
          }}
          style={{
            ...styles.button,
            ...styles.primaryButton,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#059669";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#00BF63";
          }}
        >
          <Save style={{ width: "18px", height: "18px" }} />
          Save All Changes
        </button>
      </div>
    </div>
  );
}