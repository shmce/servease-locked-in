import { useState } from "react";
import { 
  Search, 
  ChevronDown,
  ChevronUp,
  Banknote,
  BookOpen,
  ShieldCheck,
  Mail,
  ExternalLink
} from "lucide-react";

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F3F4F6",
  },
  header: {
    backgroundColor: "#00BF63",
    padding: "24px 32px",
    color: "white",
  },
  headerTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    margin: 0,
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px",
  },
  searchContainer: {
    position: "relative" as const,
    marginBottom: "40px",
  },
  searchInput: {
    width: "100%",
    padding: "16px 24px 16px 56px",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    fontSize: "15px",
    color: "#374151",
    outline: "none",
    transition: "all 0.3s ease",
    backgroundColor: "white",
  },
  searchIcon: {
    position: "absolute" as const,
    left: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9CA3AF",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "16px",
  },
  faqContainer: {
    marginBottom: "48px",
  },
  faqSubtitle: {
    fontSize: "13px",
    color: "#6B7280",
    marginBottom: "20px",
  },
  faqList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  faqItem: {
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    overflow: "hidden",
    transition: "all 0.2s ease",
  },
  faqButton: {
    width: "100%",
    padding: "20px 24px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    textAlign: "left" as const,
    outline: "none",
  },
  faqHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
  },
  faqIconContainer: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  faqContent: {
    flex: 1,
  },
  faqTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "6px",
  },
  faqCategory: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
  },
  faqToggle: {
    color: "#9CA3AF",
    flexShrink: 0,
  },
  faqAnswer: {
    padding: "0 24px 20px 80px",
    fontSize: "14px",
    color: "#6B7280",
    lineHeight: "1.6",
  },
  needHelpSection: {
    marginBottom: "32px",
  },
  needHelpTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "8px",
  },
  needHelpSubtitle: {
    fontSize: "13px",
    color: "#6B7280",
    marginBottom: "20px",
  },
  contactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "16px",
  },
  contactCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
  },
  contactInfo: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  contactIconContainer: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  contactText: {
    display: "flex",
    flexDirection: "column" as const,
  },
  contactTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "4px",
  },
  contactDesc: {
    fontSize: "13px",
    color: "#6B7280",
  },
  externalIcon: {
    color: "#9CA3AF",
    flexShrink: 0,
  },
  tabsContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "32px",
    flexWrap: "wrap" as const,
  },
  tab: {
    padding: "10px 24px",
    borderRadius: "24px",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
  },
  tabActive: {
    backgroundColor: "#00BF63",
    color: "white",
  },
  tabInactive: {
    backgroundColor: "#E5E7EB",
    color: "#6B7280",
  },
};

export function ProviderHelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Payments", "Bookings", "Verification"];

  const faqs = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="10" rx="2"/>
          <circle cx="12" cy="12" r="2"/>
          <path d="M6 12h.01M18 12h.01"/>
        </svg>
      ),
      iconColor: "#F59E0B",
      iconBg: "#FFFBEF",
      title: "How do I get paid?",
      category: "Payments & Earnings",
      categoryColor: "#F59E0B",
      categoryBg: "#FFFBEF",
      answer: "Once a booking is completed and confirmed by the customer, your earnings are automatically credited to your registered payout method. Payouts are processed every Monday and Thursday. You can track all your earnings and payout history from the Earnings tab on your dashboard. Make sure your Google bank account, or wallet details are up to date under Payout Methods in Settings."
    },
    {
      icon: <BookOpen size={20} />,
      iconColor: "#6366F1",
      iconBg: "#EEF2FF",
      title: "How do booking cancellations work?",
      category: "Managing Bookings",
      categoryColor: "#6366F1",
      categoryBg: "#EEF2FF",
      answer: "If a customer cancels a booking more than 24 hours before the scheduled time, no cancellation fee applies. Cancellations within 24 hours may result in a partial payment to you as a compensation for the late notice. If you need to cancel, please do so as early as possible through the bookings tab - repeated provider cancellations may affect your rating and visibility on the platform."
    },
    {
      icon: <ShieldCheck size={20} />,
      iconColor: "#8B5CF6",
      iconBg: "#F5F3FF",
      title: "How does profile verification work?",
      category: "Profile & Verification",
      categoryColor: "#8B5CF6",
      categoryBg: "#F5F3FF",
      answer: "Profile verification helps build trust with customers. You'll need to submit a valid Philippine government ID (e.g., PhilSys, Passport, Driver's License) and a clear selfie for identity matching. Verification is reviewed within 1-3 business days. Verified providers receive a badge on their profile and are prioritized in search results. You can check your verification status under Settings > Profile & Verification."
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="10" rx="2"/>
          <circle cx="12" cy="12" r="2"/>
          <path d="M6 12h.01M18 12h.01"/>
        </svg>
      ),
      iconColor: "#F59E0B",
      iconBg: "#FFFBEF",
      title: "How do I set or update my service rates?",
      category: "Payments & Earnings",
      categoryColor: "#F59E0B",
      categoryBg: "#FFFBEF",
      answer: "Go to your Provider Dashboard, tap on Settings, then Service Configuration. From there you can update your base rate, price unit (per hour, per project, or per sqm), and estimated duration for each service. Changes take effect immediately and will be reflected on your public profile. We recommend keeping your rates competitive by checking similar providers in your area."
    },
  ];

  const contactOptions = [
    {
      icon: <Mail size={24} />,
      iconColor: "#00BF63",
      iconBg: "#ECFDF5",
      title: "Email Support",
      description: "support@servease.ph",
      highlightEmail: true,
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      iconColor: "#1877F2",
      iconBg: "#EFF6FF",
      title: "Message us on Facebook",
      description: "Usually replies within a few hours",
      highlightEmail: false,
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Help Center</h1>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <div style={styles.searchIcon}>
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#00BF63";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 191, 99, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Tabs */}
        <div style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.tabActive : styles.tabInactive),
              }}
              onClick={() => setActiveTab(tab)}
              aria-label={`Filter by ${tab}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Frequently Asked Questions */}
        <div style={styles.faqContainer}>
          <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
          <p style={styles.faqSubtitle}>
            Tap a question to see the answer
          </p>

          <div style={styles.faqList}>
            {faqs
              .filter((faq) =>
                activeTab === "All" || faq.category.includes(activeTab)
              )
              .map((faq, index) => (
                <div key={index} style={styles.faqItem}>
                  <button
                    style={styles.faqButton}
                    onClick={() =>
                      setExpandedFaq(expandedFaq === index ? null : index)
                    }
                    onFocus={(e) => {
                      e.currentTarget.parentElement!.style.borderColor = "#00BF63";
                      e.currentTarget.parentElement!.style.boxShadow =
                        "0 0 0 3px rgba(0, 191, 99, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.parentElement!.style.borderColor = "#E5E7EB";
                      e.currentTarget.parentElement!.style.boxShadow = "none";
                    }}
                    aria-expanded={expandedFaq === index}
                    aria-label={`${faq.title} - ${faq.category}`}
                  >
                    <div style={styles.faqHeader}>
                      <div
                        style={{
                          ...styles.faqIconContainer,
                          backgroundColor: faq.iconBg,
                          color: faq.iconColor,
                        }}
                      >
                        {faq.icon}
                      </div>
                      <div style={styles.faqContent}>
                        <div style={styles.faqTitle}>{faq.title}</div>
                        <span
                          style={{
                            ...styles.faqCategory,
                            backgroundColor: faq.categoryBg,
                            color: faq.categoryColor,
                          }}
                        >
                          {faq.category}
                        </span>
                      </div>
                      <div style={styles.faqToggle}>
                        {expandedFaq === index ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </div>
                  </button>
                  {expandedFaq === index && (
                    <div style={styles.faqAnswer}>{faq.answer}</div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Still Need Help */}
        <div style={styles.needHelpSection}>
          <h2 style={styles.needHelpTitle}>Still need help?</h2>
          <p style={styles.needHelpSubtitle}>
            Our team replies instantly, within 24 hours
          </p>

          <div style={styles.contactGrid}>
            {contactOptions.map((option, index) => (
              <button
                key={index}
                style={styles.contactCard}
                onClick={() => {}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = option.iconColor;
                  e.currentTarget.style.boxShadow = `0 4px 12px ${option.iconColor}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = option.iconColor;
                  e.currentTarget.style.boxShadow = `0 4px 12px ${option.iconColor}20`;
                  e.currentTarget.style.outline = `2px solid ${option.iconColor}`;
                  e.currentTarget.style.outlineOffset = "2px";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.outline = "none";
                }}
                aria-label={`Contact via ${option.title}: ${option.description}`}
              >
                <div style={styles.contactInfo}>
                  <div
                    style={{
                      ...styles.contactIconContainer,
                      backgroundColor: option.iconBg,
                      color: option.iconColor,
                    }}
                  >
                    {option.icon}
                  </div>
                  <div style={styles.contactText}>
                    <div style={styles.contactTitle}>{option.title}</div>
                    <div
                      style={{
                        ...styles.contactDesc,
                        color: option.highlightEmail ? "#00BF63" : "#6B7280",
                        fontWeight: option.highlightEmail ? "500" : "normal",
                      }}
                    >
                      {option.description}
                    </div>
                  </div>
                </div>
                <div style={styles.externalIcon}>
                  <ExternalLink size={18} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}