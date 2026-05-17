import { useEffect, useState } from "react";
import { Plus, Save, Star, Edit2, GripVertical, Trash2, Upload } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router";
import { useProviderData } from "../context/ProviderDataContext";
import {
  addProviderPortfolioMedia,
  deleteProviderPortfolioMedia,
  getStoredProviderAccessToken,
  listCurrentProviderPortfolioMedia,
  replaceProviderPortfolioMedia,
  reorderProviderPortfolioMedia,
  uploadProviderPortfolioMedia,
  type ProviderPortfolioMediaSummary,
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
    padding: "20px",
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

interface PortfolioItem {
  id: string;
  persisted: boolean;
  beforeImage: string;
  afterImage: string;
  description: string;
  category: string;
  date: string;
  featured: boolean;
}

function toEditorItem(item: ProviderPortfolioMediaSummary, index: number): PortfolioItem {
  const date = item.createdAt
    ? new Date(item.createdAt).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return {
    id: item.id,
    persisted: true,
    beforeImage: item.fileUrl,
    afterImage: item.fileUrl,
    description: item.caption || item.fileName || `Portfolio item ${index + 1}`,
    category: item.mimeType?.startsWith("image/") ? "Image" : "Portfolio",
    date,
    featured: item.sortOrder === 0,
  };
}

function toContextItem(item: PortfolioItem) {
  return {
    id: item.id,
    imageUrl: item.afterImage || item.beforeImage,
    title: item.description || "Portfolio item",
    description: item.description,
    category: item.category,
    featured: item.featured,
  };
}

function fileNameFromUrl(fileUrl: string): string | null {
  try {
    const path = new URL(fileUrl).pathname;
    const fileName = decodeURIComponent(path.split("/").filter(Boolean).pop() ?? "");
    return fileName || null;
  } catch {
    return null;
  }
}

export function PortfolioManagementPage() {
  const navigate = useNavigate();
  const { providerData, setProviderData } = useProviderData();
  
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() =>
    providerData.portfolioItems.map((item) => ({
      id: item.id,
      persisted: true,
      beforeImage: item.imageUrl,
      afterImage: item.imageUrl,
      description: item.description,
      category: item.category,
      date: new Date().toISOString().split("T")[0],
      featured: item.featured,
    }))
  );

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [replacingItemId, setReplacingItemId] = useState<string | null>(null);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  const applyPortfolioItems = (items: PortfolioItem[]) => {
    setPortfolioItems(items);
    setProviderData({
      ...providerData,
      portfolioItems: items.map(toContextItem),
    });
  };

  const refreshPortfolio = async () => {
    const token = getStoredProviderAccessToken();

    if (!token) {
      setPortfolioError("Sign in to manage live portfolio media.");
      return;
    }

    setIsLoading(true);
    setPortfolioError(null);

    try {
      const media = await listCurrentProviderPortfolioMedia(token);
      const items = media.map(toEditorItem);
      setPortfolioItems(items);
      setProviderData({
        ...providerData,
        portfolioItems: items.map(toContextItem),
      });
    } catch (error) {
      setPortfolioError(
        error instanceof Error ? error.message : "Unable to load portfolio media.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addNewProject = () => {
    const newItem: PortfolioItem = {
      id: `draft-${Date.now().toString()}`,
      persisted: false,
      beforeImage: "",
      afterImage: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      featured: false,
    };
    setPortfolioItems([...portfolioItems, newItem]);
    setEditingId(newItem.id);
  };

  const deleteItem = async (id: string) => {
    const item = portfolioItems.find((current) => current.id === id);

    if (!item) {
      return;
    }

    if (item.persisted) {
      const token = getStoredProviderAccessToken();

      if (!token) {
        setPortfolioError("Sign in to remove live portfolio media.");
        return;
      }

      setIsSaving(true);
      setPortfolioError(null);

      try {
        await deleteProviderPortfolioMedia(token, item.id);
      } catch (error) {
        setPortfolioError(
          error instanceof Error ? error.message : "Unable to delete portfolio media.",
        );
        setIsSaving(false);
        return;
      }

      setIsSaving(false);
    }

    applyPortfolioItems(portfolioItems.filter((current) => current.id !== id));
  };

  const updateItem = (id: string, field: keyof PortfolioItem, value: string | boolean) => {
    setPortfolioItems(
      portfolioItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const updateImageUrl = (id: string, value: string) => {
    setPortfolioItems(
      portfolioItems.map((item) =>
        item.id === id
          ? {
              ...item,
              beforeImage: value,
              afterImage: value,
            }
          : item,
      ),
    );
  };

  const replacePersistedImage = async (id: string, file: File | undefined) => {
    if (!file) {
      return;
    }

    const item = portfolioItems.find((current) => current.id === id);

    if (!item?.persisted) {
      return;
    }

    const token = getStoredProviderAccessToken();

    if (!token) {
      setPortfolioError("Sign in to replace live portfolio media.");
      return;
    }

    setReplacingItemId(id);
    setPortfolioError(null);

    try {
      const upload = await uploadProviderPortfolioMedia(token, file);
      const replaced = await replaceProviderPortfolioMedia(token, id, {
        fileUrl: upload.publicUrl,
        fileName: file.name,
        mimeType: file.type || upload.contentType,
        storagePath: upload.path,
        fileSize: upload.size,
        caption: item.description.trim() || null,
      });
      const updatedItems = portfolioItems.map((current, index) =>
        current.id === id ? toEditorItem(replaced, index) : current,
      );
      applyPortfolioItems(updatedItems);
    } catch (error) {
      setPortfolioError(
        error instanceof Error ? error.message : "Unable to replace portfolio media.",
      );
    } finally {
      setReplacingItemId(null);
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
    setIsReordering(true);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = portfolioItems.findIndex((item) => item.id === draggedItem);
    const targetIndex = portfolioItems.findIndex((item) => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...portfolioItems];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    setPortfolioItems(newItems);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleSaveOrder = async () => {
    const token = getStoredProviderAccessToken();

    if (!token) {
      setPortfolioError("Sign in to save live portfolio media order.");
      return;
    }

    const persistedItems = portfolioItems.filter((item) => item.persisted);

    if (persistedItems.length === 0) {
      setIsReordering(false);
      return;
    }

    setIsSaving(true);
    setPortfolioError(null);

    try {
      const media = await reorderProviderPortfolioMedia(
        token,
        persistedItems.map((item, index) => ({
          id: item.id,
          sortOrder: index,
        })),
      );
      const items = media.map(toEditorItem);
      applyPortfolioItems(items);
      setIsReordering(false);
    } catch (error) {
      setPortfolioError(
        error instanceof Error ? error.message : "Unable to save portfolio order.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const savePortfolio = async () => {
    const token = getStoredProviderAccessToken();

    if (!token) {
      setPortfolioError("Sign in to save live portfolio media.");
      return;
    }

    const drafts = portfolioItems.filter((item) => !item.persisted);
    const invalidDraft = drafts.find((item) => !(item.afterImage || item.beforeImage).trim());

    if (invalidDraft) {
      setPortfolioError("Add an image URL before saving a new portfolio item.");
      setEditingId(invalidDraft.id);
      return;
    }

    setIsSaving(true);
    setPortfolioError(null);

    try {
      for (const item of drafts) {
        const fileUrl = (item.afterImage || item.beforeImage).trim();
        await addProviderPortfolioMedia(token, {
          fileUrl,
          fileName: fileNameFromUrl(fileUrl),
          mimeType: "image/jpeg",
          caption: item.description.trim() || null,
        });
      }

      setEditingId(null);
      setIsReordering(false);
      await refreshPortfolio();
      navigate("/provider/edit-profile");
    } catch (error) {
      setPortfolioError(
        error instanceof Error ? error.message : "Unable to save portfolio media.",
      );
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
              <h1 style={styles.pageTitle}>Portfolio Management</h1>
              <p style={{ fontSize: "16px", color: "#6B7280" }}>
                Showcase your best work with before and after photos
              </p>
            </div>
            <button
              onClick={addNewProject}
              disabled={isLoading || isSaving}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                opacity: isLoading || isSaving ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#059669";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#00BF63";
              }}
            >
              <Plus style={{ width: "18px", height: "18px" }} />
              Add New Project
            </button>
          </div>
        </div>

        {(isLoading || portfolioError) && (
          <div
            style={{
              ...styles.card,
              marginBottom: "24px",
              borderColor: portfolioError ? "#FCA5A5" : "#D1FAE5",
              backgroundColor: portfolioError ? "#FEF2F2" : "#ECFDF5",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                color: portfolioError ? "#991B1B" : "#065F46",
                fontWeight: "600",
              }}
            >
              {portfolioError ?? "Loading live portfolio media..."}
            </p>
          </div>
        )}

        {/* Save Order Button - Appears after reordering */}
        {isReordering && (
          <div
            style={{
              backgroundColor: "#FEF3C7",
              border: "1px solid #FCD34D",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ fontSize: "14px", color: "#92400E", fontWeight: "600" }}>
              Items have been reordered. Don't forget to save your changes.
            </p>
            <button
              onClick={handleSaveOrder}
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
              <Save style={{ width: "16px", height: "16px" }} />
              Save Order
            </button>
          </div>
        )}

        {/* Portfolio Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "24px",
          }}
        >
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragEnd={handleDragEnd}
              style={{
                ...styles.card,
                cursor: "grab",
                opacity: draggedItem === item.id ? 0.5 : 1,
                transition: "opacity 0.3s ease",
              }}
            >
              {/* Drag Handle & Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <GripVertical
                    style={{ width: "20px", height: "20px", color: "#9CA3AF", cursor: "grab" }}
                  />
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#111827" }}>
                      {item.description || "Untitled Project"}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#00BF63",
                          backgroundColor: "#DCFCE7",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {item.category || "Uncategorized"}
                      </span>
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{item.date}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Star
                      style={{
                        width: "16px",
                        height: "16px",
                        fill: item.featured ? "#F59E0B" : "none",
                        color: item.featured ? "#F59E0B" : "#9CA3AF",
                      }}
                    />
                    <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: "600" }}>
                      Featured
                    </span>
                    <div
                      onClick={() => updateItem(item.id, "featured", !item.featured)}
                      style={{
                        ...styles.toggle,
                        backgroundColor: item.featured ? "#00BF63" : "#E5E7EB",
                      }}
                    >
                      <div
                        style={{
                          ...styles.toggleDot,
                          transform: item.featured ? "translateX(20px)" : "translateX(4px)",
                        }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: "#F3F4F6",
                      border: "1px solid #E5E7EB",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Edit2 style={{ width: "16px", height: "16px", color: "#6B7280" }} />
                  </button>
                  <button
                    onClick={() => void deleteItem(item.id)}
                    disabled={isSaving}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: "#FEE2E2",
                      border: "1px solid #FCA5A5",
                      cursor: isSaving ? "not-allowed" : "pointer",
                      opacity: isSaving ? 0.7 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 style={{ width: "16px", height: "16px", color: "#DC2626" }} />
                  </button>
                </div>
              </div>

              {/* Before/After Photos */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                {/* Before Photo */}
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6B7280",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Before
                  </p>
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      backgroundColor: "#F3F4F6",
                      border: "2px dashed #E5E7EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {item.beforeImage ? (
                      <ImageWithFallback
                        src={item.beforeImage}
                        alt="Before"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <button
                        style={{
                          ...styles.button,
                          ...styles.secondaryButton,
                        }}
                      >
                        <Plus style={{ width: "16px", height: "16px" }} />
                        Upload
                      </button>
                    )}
                  </div>
                </div>

                {/* After Photo */}
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6B7280",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    After
                  </p>
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      backgroundColor: "#F3F4F6",
                      border: "2px dashed #E5E7EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {item.afterImage ? (
                      <ImageWithFallback
                        src={item.afterImage}
                        alt="After"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <button
                        style={{
                          ...styles.button,
                          ...styles.secondaryButton,
                        }}
                      >
                        <Plus style={{ width: "16px", height: "16px" }} />
                        Upload
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Form - Expanded when editing */}
              {editingId === item.id && (
                <div
                  style={{
                    paddingTop: "16px",
                    borderTop: "1px solid #F3F4F6",
                  }}
                >
                  <div style={{ marginBottom: "12px" }}>
                    <label style={styles.label}>Public image URL</label>
                    <input
                      type="url"
                      value={item.afterImage}
                      onChange={(e) => updateImageUrl(item.id, e.target.value)}
                      placeholder="https://..."
                      style={styles.input}
                      disabled={item.persisted}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#00BF63";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E5E7EB";
                      }}
                    />
                    {item.persisted && (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                        <label
                          style={{
                            ...styles.button,
                            ...styles.secondaryButton,
                            cursor: replacingItemId === item.id ? "not-allowed" : "pointer",
                            opacity: replacingItemId === item.id ? 0.7 : 1,
                          }}
                        >
                          <Upload style={{ width: "16px", height: "16px" }} />
                          {replacingItemId === item.id ? "Replacing..." : "Replace Image"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={replacingItemId === item.id || isSaving}
                            onChange={(event) => {
                              const file = event.currentTarget.files?.[0];
                              event.currentTarget.value = "";
                              void replacePersistedImage(item.id, file);
                            }}
                            style={{ display: "none" }}
                          />
                        </label>
                        <p style={{ fontSize: "12px", color: "#6B7280" }}>
                          Upload a new image to replace this saved portfolio item.
                        </p>
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder="Describe this project..."
                      rows={3}
                      style={styles.textarea}
                      disabled={item.persisted}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#00BF63";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E5E7EB";
                      }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={styles.label}>Service Category</label>
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => updateItem(item.id, "category", e.target.value)}
                        placeholder="e.g., Deep Cleaning"
                        style={styles.input}
                        disabled={item.persisted}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#00BF63";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#E5E7EB";
                        }}
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Date</label>
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) => updateItem(item.id, "date", e.target.value)}
                        style={styles.input}
                        disabled={item.persisted}
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
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {portfolioItems.length === 0 && (
          <div
            style={{
              ...styles.card,
              textAlign: "center",
              padding: "64px 24px",
            }}
          >
            <p style={{ fontSize: "16px", color: "#6B7280", marginBottom: "20px" }}>
              No portfolio items yet. Start by adding your first project.
            </p>
            <button
              onClick={addNewProject}
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
              Add Your First Project
            </button>
          </div>
        )}
      </div>

      {/* Sticky Footer - Only shows if changes were made */}
      {(isReordering || editingId) && (
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
            onClick={() => void savePortfolio()}
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
      )}
    </div>
  );
}
