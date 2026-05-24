import { useEffect, useState } from "react";
import { Save, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router";
import { useProviderData } from "../context/ProviderDataContext";
import { useProviderAuth } from "../context/ProviderAuthContext";
import {
  getStoredProviderAccessToken,
  updateCurrentUserProfile,
} from "../../services/serveaseProviderApi";

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F9FAFB",
    paddingBottom: "100px",
  },
  maxWidthContainer: {
    maxWidth: "1200px",
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
  secondaryButton: {
    backgroundColor: "white",
    color: "#6B7280",
    border: "1px solid #E5E7EB",
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

export function EditProfilePage() {
  const navigate = useNavigate();
  const providerData = useProviderData();
  const providerAuth = useProviderAuth();
  const {
    profile,
    updateProfile,
    services,
    portfolioItems,
    isProfileLoading,
    profileError,
  } = providerData;
  
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [bio, setBio] = useState(profile.bio);
  const [serviceAreas, setServiceAreas] = useState(profile.serviceAreas);
  const [yearsExperience, setYearsExperience] = useState(profile.yearsExperience);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

  const maxBioLength = 500;

  useEffect(() => {
    setBusinessName(profile.businessName);
    setBio(profile.bio);
    setServiceAreas(profile.serviceAreas);
    setYearsExperience(profile.yearsExperience);
  }, [profile]);

  const handleSave = async () => {
    const token = getStoredProviderAccessToken();
    const yearsExperienceValue = yearsExperience.trim()
      ? Number(yearsExperience)
      : null;

    if (!token) {
      setProfileSaveError("Sign in to save provider profile changes.");
      return;
    }

    if (isProfileLoading) {
      setProfileSaveError("Wait for the live provider profile to finish loading before saving.");
      return;
    }

    if (profileError) {
      setProfileSaveError("Resolve the live provider profile load error before saving changes.");
      return;
    }

    if (!businessName.trim()) {
      setProfileSaveError("Business name is required.");
      return;
    }

    if (
      yearsExperienceValue !== null &&
      (!Number.isFinite(yearsExperienceValue) || yearsExperienceValue < 0)
    ) {
      setProfileSaveError("Years of experience must be a valid number.");
      return;
    }

    setIsSavingProfile(true);
    setProfileSaveError(null);

    try {
      const nextProfile = await updateCurrentUserProfile(token, {
        fullName:
          providerAuth.profile?.user.fullName?.trim() ||
          businessName.trim(),
        contactNumber: providerAuth.profile?.user.contactNumber ?? null,
        businessName: businessName.trim(),
        bio: bio.trim() || null,
        serviceDescription: bio.trim() || null,
        serviceArea: serviceAreas.trim() || null,
        yearsExperience: yearsExperienceValue,
      });

      updateProfile({
        businessName:
          nextProfile.providerProfile?.businessName ||
          businessName.trim(),
        bio: nextProfile.providerProfile?.bio || bio,
        serviceAreas:
          nextProfile.providerProfile?.serviceArea ||
          serviceAreas,
        yearsExperience:
          nextProfile.providerProfile?.yearsExperience === null ||
          nextProfile.providerProfile?.yearsExperience === undefined
            ? yearsExperience
            : String(nextProfile.providerProfile.yearsExperience),
      });

      navigate("/provider/profile");
    } catch (error) {
      setProfileSaveError(
        error instanceof Error ? error.message : "Unable to save provider profile.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Edit Profile</h1>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>
            Update the provider profile fields shown to customers
          </p>
          {isProfileLoading && (
            <p style={{ fontSize: "14px", color: "#1D4ED8", marginTop: "12px" }}>
              Loading live provider profile...
            </p>
          )}
          {profileError && (
            <p style={{ fontSize: "14px", color: "#B91C1C", marginTop: "12px" }}>
              {profileError}
            </p>
          )}
          {profileSaveError && (
            <p style={{ fontSize: "14px", color: "#B91C1C", marginTop: "12px" }}>
              {profileSaveError}
            </p>
          )}
        </div>

        {/* Basic Information */}
        <div style={styles.card}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#111827",
              marginBottom: "20px",
            }}
          >
            Basic Information
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={styles.label}>Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
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
              <label style={styles.label}>Years of Experience</label>
              <input
                type="number"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
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

          <div style={{ marginBottom: "20px" }}>
            <label style={styles.label}>
              Bio/Description{" "}
              <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "400" }}>
                ({bio.length}/{maxBioLength})
              </span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => {
                if (e.target.value.length <= maxBioLength) {
                  setBio(e.target.value);
                }
              }}
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

          <div>
            <label style={styles.label}>Service Areas</label>
            <input
              type="text"
              value={serviceAreas}
              onChange={(e) => setServiceAreas(e.target.value)}
              placeholder="e.g., Metro Manila, Quezon City"
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

        {/* Services & Pricing Section */}
        <div style={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#111827", marginBottom: "4px" }}>
                Services & Pricing
              </h2>
              <p style={{ fontSize: "13px", color: "#6B7280" }}>
                Manage your service offerings and rates
              </p>
            </div>
            <button
              onClick={() => navigate("/provider/edit-services")}
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
              Edit Services & Pricing
              <ChevronRight style={{ width: "16px", height: "16px" }} />
            </button>
          </div>

          {services.filter(s => s.isActive).length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {services.filter(s => s.isActive).map((service) => (
                <div
                  key={service.id}
                  style={{
                    padding: "16px",
                    backgroundColor: "#F9FAFB",
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                    {service.name}
                  </h4>
                  <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "8px" }}>
                    {service.description}
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "#00BF63" }}>
                    ₱{service.baseRate} {service.priceUnit}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "14px", color: "#9CA3AF", textAlign: "center", padding: "24px" }}>
              No services added yet. Click "Edit Services & Pricing" to add your first service.
            </p>
          )}
        </div>

        {/* Portfolio Section */}
        <div style={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#111827", marginBottom: "4px" }}>
                Portfolio
              </h2>
              <p style={{ fontSize: "13px", color: "#6B7280" }}>
                Showcase your best work
              </p>
            </div>
            <button
              onClick={() => navigate("/provider/portfolio")}
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
              Manage Portfolio
              <ChevronRight style={{ width: "16px", height: "16px" }} />
            </button>
          </div>

          {portfolioItems.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              {portfolioItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    aspectRatio: "1",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid #E5E7EB",
                    backgroundColor: "#F3F4F6",
                  }}
                >
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "14px", color: "#9CA3AF", textAlign: "center", padding: "24px" }}>
              No portfolio items yet. Click "Manage Portfolio" to add your first project.
            </p>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div style={styles.stickyFooter}>
        <button
          onClick={() => navigate("/provider/profile")}
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
          onClick={() => void handleSave()}
          disabled={isSavingProfile || isProfileLoading || Boolean(profileError)}
          style={{
            ...styles.button,
            ...styles.primaryButton,
            opacity: isSavingProfile || isProfileLoading || profileError ? 0.7 : 1,
            cursor: isSavingProfile || isProfileLoading || profileError ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!isSavingProfile && !isProfileLoading && !profileError) {
              e.currentTarget.style.backgroundColor = "#059669";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSavingProfile && !isProfileLoading && !profileError) {
              e.currentTarget.style.backgroundColor = "#00BF63";
            }
          }}
        >
          <Save style={{ width: "18px", height: "18px" }} />
          {isSavingProfile ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
