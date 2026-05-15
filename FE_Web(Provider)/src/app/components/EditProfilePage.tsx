import { useState } from "react";
import { Camera, Plus, X, Save, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router";
import { useProviderData } from "../context/ProviderDataContext";

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

interface License {
  type: string;
  number: string;
  expiry: string;
}

interface Certification {
  name: string;
}

export function EditProfilePage() {
  const navigate = useNavigate();
  const providerData = useProviderData();
  const { profile, updateProfile, services, portfolioItems } = providerData;
  
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [bio, setBio] = useState(profile.bio);
  const [serviceAreas, setServiceAreas] = useState(profile.serviceAreas);
  const [yearsExperience, setYearsExperience] = useState(profile.yearsExperience);
  const [languages, setLanguages] = useState<string[]>(profile.languages);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [licenses, setLicenses] = useState<License[]>([
    { type: "Professional Cleaning License", number: "PCL-2018-001234", expiry: "2026-12-31" },
  ]);
  const [certifications, setCertifications] = useState<Certification[]>([
    { name: "Professional Cleaning Certification - ISSA" },
    { name: "Green Cleaning Specialist" },
  ]);
  const [facebook, setFacebook] = useState(profile.facebook);
  const [instagram, setInstagram] = useState(profile.instagram);
  const [website, setWebsite] = useState(profile.website);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(profile.coverPhotoUrl);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(profile.profilePhotoUrl);

  const maxBioLength = 500;

  const availableLanguages = [
    "English",
    "Filipino",
    "Tagalog",
    "Cebuano",
    "Ilocano",
    "Mandarin",
    "Spanish",
    "Japanese",
    "Korean",
  ];

  const toggleLanguage = (language: string) => {
    if (languages.includes(language)) {
      setLanguages(languages.filter((l) => l !== language));
    } else {
      setLanguages([...languages, language]);
    }
  };

  const handleCoverPhotoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setCoverPhotoUrl(url);
        updateProfile({ coverPhotoUrl: url });
      }
    };
    input.click();
  };

  const handleProfilePhotoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setProfilePhotoUrl(url);
        updateProfile({ profilePhotoUrl: url });
      }
    };
    input.click();
  };

  const addLicense = () => {
    setLicenses([...licenses, { type: "", number: "", expiry: "" }]);
  };

  const removeLicense = (index: number) => {
    setLicenses(licenses.filter((_, i) => i !== index));
  };

  const updateLicense = (index: number, field: keyof License, value: string) => {
    const updated = [...licenses];
    updated[index][field] = value;
    setLicenses(updated);
  };

  const addCertification = () => {
    setCertifications([...certifications, { name: "" }]);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const updateCertification = (index: number, value: string) => {
    const updated = [...certifications];
    updated[index].name = value;
    setCertifications(updated);
  };

  const handleSave = () => {
    // Update profile with context
    updateProfile({
      businessName,
      bio,
      serviceAreas,
      yearsExperience,
      languages,
      facebook,
      instagram,
      website,
    });
    
    // Navigate back to profile
    navigate("/provider/profile");
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Edit Profile</h1>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>
            Update your business information and professional details
          </p>
        </div>

        {/* Cover Photo */}
        <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
          <div
            style={{
              width: "100%",
              height: "240px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <ImageWithFallback
              src={coverPhotoUrl}
              alt="Cover"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))",
              }}
            />
            <button
              style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                ...styles.button,
                ...styles.secondaryButton,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
              }}
              onClick={handleCoverPhotoUpload}
            >
              <Camera style={{ width: "16px", height: "16px" }} />
              Change Cover Photo
            </button>
          </div>
        </div>

        {/* Profile Photo */}
        <div style={{ ...styles.card, display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "4px solid #F3F4F6",
              }}
            >
              <ImageWithFallback
                src={profilePhotoUrl}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <button
              style={{
                position: "absolute",
                bottom: "0",
                right: "0",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#00BF63",
                border: "3px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              }}
              onClick={handleProfilePhotoUpload}
            >
              <Camera style={{ width: "16px", height: "16px", color: "white" }} />
            </button>
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
              Profile Photo
            </p>
            <p style={{ fontSize: "13px", color: "#6B7280" }}>
              Upload a professional photo. PNG or JPG, max 5MB.
            </p>
          </div>
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
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
            <div>
              <label style={styles.label}>Languages Spoken</label>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    ...styles.input,
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "6px",
                    cursor: "pointer",
                    minHeight: "48px",
                  }}
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                >
                  {languages.length > 0 ? (
                    languages.map((lang, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: "#D1FAE5",
                          color: "#059669",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {lang}
                        <X
                          style={{ width: "12px", height: "12px", cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLanguage(lang);
                          }}
                        />
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "#9CA3AF", fontSize: "14px" }}>Select languages...</span>
                  )}
                </div>
                {showLanguageDropdown && (
                  <>
                    <div
                      style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 10,
                      }}
                      onClick={() => setShowLanguageDropdown(false)}
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
                        maxHeight: "240px",
                        overflowY: "auto",
                      }}
                    >
                      {availableLanguages.map((lang) => (
                        <div
                          key={lang}
                          onClick={() => toggleLanguage(lang)}
                          style={{
                            padding: "12px 16px",
                            cursor: "pointer",
                            backgroundColor: languages.includes(lang) ? "#F0FDF8" : "white",
                            color: languages.includes(lang) ? "#00BF63" : "#374151",
                            fontSize: "14px",
                            fontWeight: languages.includes(lang) ? "600" : "500",
                            transition: "background-color 0.2s ease",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                          onMouseEnter={(e) => {
                            if (!languages.includes(lang)) {
                              e.currentTarget.style.backgroundColor = "#F9FAFB";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!languages.includes(lang)) {
                              e.currentTarget.style.backgroundColor = "white";
                            }
                          }}
                        >
                          <span>{lang}</span>
                          {languages.includes(lang) && (
                            <div
                              style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "4px",
                                backgroundColor: "#00BF63",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10 3L4.5 8.5L2 6"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Licenses */}
        <div style={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#111827" }}>
              Professional Licenses
            </h2>
            <button
              onClick={addLicense}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
              }}
            >
              <Plus style={{ width: "16px", height: "16px" }} />
              Add License
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {licenses.map((license, index) => (
              <div
                key={index}
                style={{
                  padding: "20px",
                  backgroundColor: "#F9FAFB",
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr auto", gap: "16px", alignItems: "end" }}>
                  <div>
                    <label style={styles.label}>License Type</label>
                    <input
                      type="text"
                      value={license.type}
                      onChange={(e) => updateLicense(index, "type", e.target.value)}
                      placeholder="e.g., Professional Cleaning License"
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
                    <label style={styles.label}>License Number</label>
                    <input
                      type="text"
                      value={license.number}
                      onChange={(e) => updateLicense(index, "number", e.target.value)}
                      placeholder="e.g., PCL-2018-001234"
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
                    <label style={styles.label}>Expiry Date</label>
                    <input
                      type="date"
                      value={license.expiry}
                      onChange={(e) => updateLicense(index, "expiry", e.target.value)}
                      style={styles.input}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#00BF63";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E5E7EB";
                      }}
                    />
                  </div>
                  <button
                    onClick={() => removeLicense(index)}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      backgroundColor: "#FEE2E2",
                      border: "1px solid #FCA5A5",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#FEF2F2";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#FEE2E2";
                    }}
                  >
                    <X style={{ width: "16px", height: "16px", color: "#DC2626" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div style={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#111827" }}>
              Certifications
            </h2>
            <button
              onClick={addCertification}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
              }}
            >
              <Plus style={{ width: "16px", height: "16px" }} />
              Add Certification
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {certifications.map((cert, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateCertification(index, e.target.value)}
                  placeholder="e.g., Professional Cleaning Certification"
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#00BF63";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                />
                <button
                  onClick={() => removeCertification(index)}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor: "#FEE2E2",
                    border: "1px solid #FCA5A5",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#FEF2F2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FEE2E2";
                  }}
                >
                  <X style={{ width: "16px", height: "16px", color: "#DC2626" }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media Links */}
        <div style={styles.card}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Social Media Links
          </h2>
          <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px" }}>
            All fields are optional
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={styles.label}>Facebook URL</label>
              <input
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/yourbusiness"
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
              <label style={styles.label}>Instagram URL</label>
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/yourbusiness"
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
              <label style={styles.label}>Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourbusiness.com"
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
          onClick={handleSave}
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
          Save Changes
        </button>
      </div>
    </div>
  );
}