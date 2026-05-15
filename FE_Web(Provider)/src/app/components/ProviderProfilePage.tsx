import { useState } from "react";
import {
  Star,
  CheckCircle2,
  Shield,
  Award,
  MessageCircle,
  Clock,
  MapPin,
  Edit2,
  Briefcase,
  Calendar,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router";
import { useProviderData } from "../context/ProviderDataContext";

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F9FAFB",
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
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "20px",
    transition: "all 0.3s ease",
  },
  statsCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "18px",
    transition: "all 0.3s ease",
    cursor: "default",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
};

export function ProviderProfilePage() {
  const [activeTab, setActiveTab] = useState("About");
  const isOwnProfile = true; // This would be determined by auth state

  const tabs = ["About", "Services & Pricing", "Portfolio", "Reviews", "Availability"];

  const badges = [
    { icon: CheckCircle2, label: "Verified", color: "#00BF63", bg: "#DCFCE7" },
    { icon: Shield, label: "Licensed", color: "#2563EB", bg: "#DBEAFE" },
    { icon: Shield, label: "Insured", color: "#7C3AED", bg: "#EDE9FE" },
    { icon: Award, label: "Top Rated", color: "#F59E0B", bg: "#FEF3C7" },
  ];

  const services = [
    { name: "House Cleaning", price: "₱500/hr" },
    { name: "Deep Cleaning", price: "₱800/hr" },
    { name: "Office Cleaning", price: "₱1,200/hr" },
  ];

  const navigate = useNavigate();
  const providerData = useProviderData();

  return (
    <div style={styles.container}>
      {/* Cover Photo */}
      <div
        style={{
          width: "100%",
          height: "320px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <ImageWithFallback
          src={providerData.profile.coverPhotoUrl}
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
      </div>

      {/* Profile Section - Profile Photo Overlaps Cover */}
      <div
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #F3F4F6",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 32px",
            position: "relative",
          }}
        >
          {/* Profile Photo & Header Info */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              paddingTop: "24px",
              paddingBottom: "32px",
            }}
          >
            {/* Left: Profile Photo & Info */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: "24px" }}>
              {/* Profile Photo - Overlapping the cover */}
              <div
                style={{
                  width: "160px",
                  height: "160px",
                  borderRadius: "16px",
                  border: "6px solid white",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                  overflow: "hidden",
                  backgroundColor: "white",
                  flexShrink: 0,
                  marginTop: "-80px",
                }}
              >
                <ImageWithFallback
                  src={providerData.profile.profilePhotoUrl}
                  alt="Provider"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* Name & Badges */}
              <div style={{ marginBottom: "12px" }}>
                <h1
                  style={{
                    fontSize: "36px",
                    fontWeight: "bold",
                    color: "#111827",
                    marginBottom: "8px",
                    letterSpacing: "-0.025em",
                  }}
                >
                  Juan Dela Cruz
                </h1>
                
                {/* Additional Info - Location, Rating, Completed Jobs */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin style={{ width: "16px", height: "16px", color: "#6B7280" }} />
                    <span style={{ fontSize: "14px", color: "#6B7280" }}>Metro Manila</span>
                  </div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#D1D5DB" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Star style={{ width: "16px", height: "16px", fill: "#F59E0B", color: "#F59E0B" }} />
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>4.9</span>
                    <span style={{ fontSize: "14px", color: "#6B7280" }}>(247 reviews)</span>
                  </div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#D1D5DB" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle2 style={{ width: "16px", height: "16px", color: "#00BF63" }} />
                    <span style={{ fontSize: "14px", color: "#6B7280" }}>532 completed jobs</span>
                  </div>
                </div>
                
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {badges.map((badge, index) => (
                    <span
                      key={index}
                      style={{
                        ...styles.badge,
                        backgroundColor: badge.bg,
                        color: badge.color,
                      }}
                    >
                      <badge.icon style={{ width: "12px", height: "12px" }} />
                      {badge.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Edit Profile Button */}
            {isOwnProfile && (
              <button
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                }}
                onClick={() => navigate("/provider/edit-profile")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#059669";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#00BF63";
                }}
              >
                <Edit2 style={{ width: "16px", height: "16px" }} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "32px",
        }}
      >
        {/* Stats Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {/* Overall Rating */}
          <div 
            style={styles.statsCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 191, 99, 0.15)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "8px",
              }}
            >
              Overall Rating
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#111827",
                }}
              >
                4.9
              </span>
              <div style={{ display: "flex", gap: "2px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    style={{
                      width: "16px",
                      height: "16px",
                      fill: star <= 4.9 ? "#F59E0B" : "none",
                      color: "#F59E0B",
                    }}
                  />
                ))}
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "#6B7280" }}>Based on 247 reviews</p>
          </div>

          {/* Completed Bookings */}
          <div 
            style={styles.statsCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 191, 99, 0.15)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "8px",
              }}
            >
              Completed Bookings
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <CheckCircle2 style={{ width: "24px", height: "24px", color: "#00BF63" }} />
              <span style={{ fontSize: "32px", fontWeight: "bold", color: "#111827" }}>
                532
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "#6B7280" }}>All-time bookings</p>
          </div>

          {/* Years of Experience */}
          <div 
            style={styles.statsCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 191, 99, 0.15)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "8px",
              }}
            >
              Experience
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Briefcase style={{ width: "24px", height: "24px", color: "#00BF63" }} />
              <span style={{ fontSize: "32px", fontWeight: "bold", color: "#111827" }}>8</span>
            </div>
            <p style={{ fontSize: "13px", color: "#6B7280" }}>Years in service</p>
          </div>

          {/* Response Rate */}
          <div 
            style={styles.statsCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 191, 99, 0.15)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "8px",
              }}
            >
              Response Rate
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <MessageCircle style={{ width: "24px", height: "24px", color: "#00BF63" }} />
              <span style={{ fontSize: "32px", fontWeight: "bold", color: "#111827" }}>
                98%
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "#6B7280" }}>Usually responds</p>
          </div>

          {/* Average Response Time */}
          <div 
            style={styles.statsCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 191, 99, 0.15)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "8px",
              }}
            >
              Avg. Response Time
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Clock style={{ width: "24px", height: "24px", color: "#00BF63" }} />
              <span style={{ fontSize: "32px", fontWeight: "bold", color: "#111827" }}>2h</span>
            </div>
            <p style={{ fontSize: "13px", color: "#6B7280" }}>Typical response</p>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            borderBottom: "2px solid #F3F4F6",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "flex", gap: "32px" }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "16px 0",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: "transparent",
                  color: activeTab === tab ? "#00BF63" : "#6B7280",
                  borderBottom: activeTab === tab ? "3px solid #00BF63" : "3px solid transparent",
                  marginBottom: "-2px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.color = "#111827";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.color = "#6B7280";
                  }
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ paddingBottom: "64px" }}>
          {activeTab === "About" && (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
              {/* About Content */}
              <div>
                <div style={{ ...styles.card, marginBottom: "24px" }}>
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#111827",
                      marginBottom: "16px",
                    }}
                  >
                    About Me
                  </h2>
                  <p style={{ fontSize: "15px", color: "#374151", lineHeight: "1.7" }}>
                    With over 8 years of professional cleaning experience, I take pride in
                    delivering exceptional service to every client. I specialize in
                    residential and commercial cleaning, using eco-friendly products and
                    proven techniques to ensure your space is spotless and healthy.
                  </p>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "#374151",
                      lineHeight: "1.7",
                      marginTop: "16px",
                    }}
                  >
                    I'm fully licensed, insured, and committed to providing reliable,
                    professional service. Customer satisfaction is my top priority, and I
                    work closely with each client to meet their specific needs and
                    preferences.
                  </p>
                </div>

                {/* Certifications */}
                <div style={styles.card}>
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#111827",
                      marginBottom: "16px",
                    }}
                  >
                    Certifications & Training
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      "Professional Cleaning Certification - ISSA",
                      "Green Cleaning Specialist",
                      "Workplace Safety & Health Training",
                    ].map((cert, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px",
                          backgroundColor: "#F9FAFB",
                          borderRadius: "8px",
                        }}
                      >
                        <Award style={{ width: "20px", height: "20px", color: "#00BF63" }} />
                        <span style={{ fontSize: "14px", color: "#374151" }}>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div>
                {/* Service Categories */}
                <div style={{ ...styles.card, marginBottom: "24px" }}>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#111827",
                      marginBottom: "16px",
                    }}
                  >
                    Service Categories
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {services.map((service, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px",
                          backgroundColor: "#F0FDF8",
                          border: "1px solid #A7F3D0",
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#DCFCE7";
                          e.currentTarget.style.borderColor = "#00BF63";
                          e.currentTarget.style.transform = "translateX(4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#F0FDF8";
                          e.currentTarget.style.borderColor = "#A7F3D0";
                          e.currentTarget.style.transform = "translateX(0)";
                        }}
                      >
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                          {service.name}
                        </span>
                        <span style={{ fontSize: "15px", fontWeight: "800", color: "#00BF63" }}>
                          {service.price}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "12px" }}>
                    Starting prices. Final cost may vary.
                  </p>
                </div>

                {/* Location */}
                <div style={{ ...styles.card, marginBottom: "24px" }}>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#111827",
                      marginBottom: "12px",
                    }}
                  >
                    Service Area
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin style={{ width: "18px", height: "18px", color: "#00BF63" }} />
                    <span style={{ fontSize: "14px", color: "#374151" }}>
                      Metro Manila, Philippines
                    </span>
                  </div>
                </div>

                {/* Availability Quick Info */}
                <div style={styles.card}>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#111827",
                      marginBottom: "12px",
                    }}
                  >
                    Typical Availability
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Calendar style={{ width: "18px", height: "18px", color: "#00BF63" }} />
                    <span style={{ fontSize: "14px", color: "#374151" }}>
                      Monday - Friday
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Clock style={{ width: "18px", height: "18px", color: "#00BF63" }} />
                    <span style={{ fontSize: "14px", color: "#374151" }}>
                      9:00 AM - 5:00 PM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Services & Pricing" && (
            <div>
              {/* Add New Service Button */}
              <div style={{ marginBottom: "24px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  style={{
                    ...styles.button,
                    ...styles.primaryButton,
                  }}
                  onClick={() => navigate("/provider/edit-services")}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#059669";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#00BF63";
                  }}
                >
                  + Add New Service
                </button>
              </div>

              {providerData.services.filter(s => s.isActive).length === 0 ? (
                <div style={styles.card}>
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#111827",
                      marginBottom: "24px",
                    }}
                  >
                    Services & Pricing
                  </h2>
                  <p style={{ fontSize: "15px", color: "#6B7280" }}>
                    No services available yet.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
                  {providerData.services.filter(s => s.isActive).map((service) => (
                    <div 
                      key={service.id} 
                      style={{
                        ...styles.card,
                        cursor: "pointer",
                        border: "1px solid #F3F4F6",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#00BF63";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 191, 99, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#F3F4F6";
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                      }}
                    >
                      <div style={{ marginBottom: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                          <h3
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              color: "#111827",
                            }}
                          >
                            {service.name}
                          </h3>
                          {/* Service Status Badge */}
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "600",
                              backgroundColor: "#DCFCE7",
                              color: "#00BF63",
                            }}
                          >
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#00BF63" }} />
                            Active
                          </span>
                        </div>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor: "#F0FDF8",
                            color: "#00BF63",
                          }}
                        >
                          {service.category}
                        </span>
                      </div>
                      
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#6B7280",
                          lineHeight: "1.6",
                          marginBottom: "16px",
                        }}
                      >
                        {service.description}
                      </p>

                      {/* Performance Insight */}
                      <div 
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 12px",
                          backgroundColor: "#FEF3C7",
                          borderRadius: "6px",
                          marginBottom: "16px",
                        }}
                      >
                        <Award style={{ width: "14px", height: "14px", color: "#F59E0B" }} />
                        <span style={{ fontSize: "12px", color: "#92400E", fontWeight: "500" }}>
                          Popular service • 23 bookings this month
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingTop: "16px",
                          borderTop: "1px solid #F3F4F6",
                          marginBottom: "16px",
                        }}
                      >
                        <div>
                          <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "4px" }}>
                            Base Rate
                          </p>
                          <p
                            style={{
                              fontSize: "24px",
                              fontWeight: "bold",
                              color: "#00BF63",
                            }}
                          >
                            ₱{service.baseRate}
                            <span style={{ fontSize: "14px", color: "#6B7280", fontWeight: "normal" }}>
                              {" "}{service.priceUnit}
                            </span>
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "4px" }}>
                            Duration
                          </p>
                          <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                            {service.estimatedDuration}
                          </p>
                        </div>
                      </div>

                      {/* Management Actions */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "13px", color: "#6B7280", fontWeight: "500" }}>Service Status:</span>
                          <button
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "600",
                              backgroundColor: "#DCFCE7",
                              color: "#00BF63",
                              border: "1px solid #00BF63",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle service active status
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#00BF63";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#DCFCE7";
                              e.currentTarget.style.color = "#00BF63";
                            }}
                          >
                            Active
                          </button>
                        </div>
                        <button
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "600",
                            backgroundColor: "white",
                            color: "#374151",
                            border: "1px solid #E5E7EB",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/provider/edit-services");
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#F9FAFB";
                            e.currentTarget.style.borderColor = "#00BF63";
                            e.currentTarget.style.color = "#00BF63";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "white";
                            e.currentTarget.style.borderColor = "#E5E7EB";
                            e.currentTarget.style.color = "#374151";
                          }}
                        >
                          <Edit2 style={{ width: "14px", height: "14px" }} />
                          Edit Service
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "Portfolio" && (
            <div>
              {providerData.portfolioItems.length === 0 ? (
                <div style={styles.card}>
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#111827",
                      marginBottom: "24px",
                    }}
                  >
                    Portfolio
                  </h2>
                  <p style={{ fontSize: "15px", color: "#6B7280" }}>
                    No portfolio items available yet.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                  {providerData.portfolioItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: "white",
                        borderRadius: "16px",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #F3F4F6",
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                        e.currentTarget.style.transform = "translateY(-4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "200px",
                          overflow: "hidden",
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
                      <div style={{ padding: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                          <h3
                            style={{
                              fontSize: "16px",
                              fontWeight: "bold",
                              color: "#111827",
                            }}
                          >
                            {item.title}
                          </h3>
                          {item.featured && (
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "10px",
                                fontWeight: "600",
                                backgroundColor: "#FEF3C7",
                                color: "#92400E",
                              }}
                            >
                              Featured
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#6B7280",
                            marginBottom: "8px",
                            lineHeight: "1.5",
                          }}
                        >
                          {item.description}
                        </p>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "600",
                            backgroundColor: "#F0FDF8",
                            color: "#00BF63",
                          }}
                        >
                          {item.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "Reviews" && (
            <div style={styles.card}>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: "24px",
                }}
              >
                Customer Reviews
              </h2>
              <p style={{ fontSize: "15px", color: "#6B7280" }}>
                Customer reviews and ratings will be displayed here.
              </p>
            </div>
          )}

          {activeTab === "Availability" && (
            <div style={styles.card}>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: "24px",
                }}
              >
                Availability Calendar
              </h2>
              <p style={{ fontSize: "15px", color: "#6B7280" }}>
                Calendar showing available time slots will be displayed here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}