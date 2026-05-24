import { useState, useEffect } from "react";
import { Plus, X, Save, ChevronDown, CheckCircle2, DollarSign, Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useProviderData } from "../context/ProviderDataContext";
import {
  getStoredProviderAccessToken,
  listCatalogCategories,
  listCatalogServices,
  listProviderOwnedServices,
  replaceProviderOwnedServices,
  type CatalogCategory,
  type CatalogServiceItem,
  type ProviderOwnedServiceInput,
  type ProviderOwnedServiceSummary,
} from "../../services/serveaseProviderApi";

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
  serviceId: string;
  name: string;
  description: string;
  category: string;
  categoryId: string;
  basePrice: string;
  priceUnit: string;
  active: boolean;
}

export function EditServicesPricingPage() {
  const navigate = useNavigate();
  const { providerData, setProviderData } = useProviderData();
  
  const [services, setServices] = useState<Service[]>(providerData.services.map(s => ({
      id: s.id,
      serviceId: "",
      name: s.name,
      description: s.description,
      category: s.category,
      categoryId: "",
      basePrice: s.baseRate.toString(),
      priceUnit: s.priceUnit,
      active: s.isActive,
  })));

  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>([]);
  const [catalogServices, setCatalogServices] = useState<CatalogServiceItem[]>([]);

  useEffect(() => {
    const token = getStoredProviderAccessToken();

    void Promise.all([listCatalogCategories(), listCatalogServices()])
      .then(([nextCategories, nextServices]) => {
        setCatalogCategories(nextCategories);
        setCatalogServices(nextServices);
      })
      .catch(() => {
        setSaveError("Unable to load catalog services.");
      });

    if (!token) {
      return;
    }

    void listProviderOwnedServices(token)
      .then((items) => {
        setServices(items.map(toEditableService));
      })
      .catch(() => {
        setSaveError("Unable to load live services.");
      });
  }, []);

  const addNewService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      serviceId: "",
      name: "",
      description: "",
      category: "",
      categoryId: "",
      basePrice: "",
      priceUnit: "per hour",
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
  const updateServiceCatalog = (id: string, serviceId: string) => {
    const catalogService = catalogServices.find((service) => service.id === serviceId);
    const catalogCategory = catalogCategories.find(
      (category) => category.id === catalogService?.categoryId,
    );
    setServices(
      services.map((service) =>
        service.id === id
          ? {
              ...service,
              serviceId,
              categoryId: catalogService?.categoryId ?? "",
              category: catalogCategory?.name ?? "",
              name: service.name.trim() ? service.name : catalogService?.name ?? "",
            }
          : service,
      ),
    );
  };

  const persistServices = async () => {
    setSaveError(null);
    setIsSaving(true);

    try {
      const token = getStoredProviderAccessToken();
      const missingCatalogService = services.some(
        (service) => service.active && !service.serviceId,
      );
      if (missingCatalogService) {
        throw new Error("Choose a catalog service for each active service.");
      }
      const payload = services.map(toProviderServiceInput);
      const savedServices = token
        ? await replaceProviderOwnedServices(token, payload)
        : [];
      const nextServices =
        savedServices.length > 0 ? savedServices.map(toEditableService) : services;

      setServices(nextServices);
      setProviderData({
        ...providerData,
        services: nextServices.map((service) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          category: service.category,
          baseRate: parseFloat(service.basePrice) || 0,
          priceUnit: service.priceUnit,
          estimatedDuration: "Duration varies",
          isActive: service.active,
        })),
      });
      setEditingId(null);
      navigate("/provider/edit-profile");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save services.");
    } finally {
      setIsSaving(false);
    }
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
        {saveError && (
          <div
            style={{
              ...styles.card,
              borderColor: "#FCA5A5",
              color: "#991B1B",
              backgroundColor: "#FEF2F2",
            }}
          >
            {saveError}
          </div>
        )}

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
                  <CatalogServiceFields
                    categories={catalogCategories}
                    services={catalogServices}
                    selectedCategoryId={service.categoryId}
                    selectedServiceId={service.serviceId}
                    onSelectCategory={(categoryId) => {
                      setServices(
                        services.map((item) =>
                          item.id === service.id
                            ? {
                                ...item,
                                categoryId,
                                category:
                                  catalogCategories.find((category) => category.id === categoryId)
                                    ?.name ?? "",
                                serviceId: "",
                              }
                            : item,
                        ),
                      );
                    }}
                    onSelectService={(serviceId) => updateServiceCatalog(service.id, serviceId)}
                  />
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
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
                  </div>
                </div>
              )}

              {/* Collapsed View */}
              {editingId !== service.id && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "4px" }}>Base Price</p>
                    <p style={{ fontSize: "16px", fontWeight: "700", color: "#00BF63" }}>
                      ₱{service.basePrice} {service.priceUnit}
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
          onClick={() => void persistServices()}
          disabled={isSaving}
          style={{
            ...styles.button,
            ...styles.primaryButton,
            opacity: isSaving ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#059669";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#00BF63";
          }}
        >
          <Save style={{ width: "18px", height: "18px" }} />
          {isSaving ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}

function CatalogServiceFields({
  categories,
  services,
  selectedCategoryId,
  selectedServiceId,
  onSelectCategory,
  onSelectService,
}: {
  categories: CatalogCategory[];
  services: CatalogServiceItem[];
  selectedCategoryId: string;
  selectedServiceId: string;
  onSelectCategory: (categoryId: string) => void;
  onSelectService: (serviceId: string) => void;
}) {
  const effectiveCategoryId =
    selectedCategoryId ||
    services.find((service) => service.id === selectedServiceId)?.categoryId ||
    "";
  const categoryServices = services.filter(
    (service) => service.categoryId === effectiveCategoryId,
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
      <div>
        <label style={styles.label}>Catalog Category</label>
        <select
          value={effectiveCategoryId}
          onChange={(event) => onSelectCategory(event.target.value)}
          style={{ ...styles.input, cursor: "pointer" }}
        >
          <option value="">Choose category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label style={styles.label}>Catalog Service</label>
        <select
          value={selectedServiceId}
          onChange={(event) => onSelectService(event.target.value)}
          style={{ ...styles.input, cursor: "pointer" }}
          disabled={!effectiveCategoryId}
        >
          <option value="">Choose service</option>
          {categoryServices.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function toEditableService(service: ProviderOwnedServiceSummary): Service {
  return {
    id: service.id,
    serviceId: service.serviceId ?? "",
    name: service.title,
    description: service.description || "",
    category: "Marketplace Service",
    categoryId: "",
    basePrice: String(service.price ?? 0),
    priceUnit: service.pricingMode === "hourly" ? "per hour" : "per project",
    active: service.isActive,
  };
}

function toProviderServiceInput(service: Service): ProviderOwnedServiceInput {
  return {
    id: service.id,
    serviceId: service.serviceId || null,
    title: service.name.trim(),
    description: service.description.trim() || null,
    price: parseFloat(service.basePrice) || 0,
    pricingMode: service.priceUnit === "per hour" ? "hourly" : "flat",
    isActive: service.active,
  };
}
