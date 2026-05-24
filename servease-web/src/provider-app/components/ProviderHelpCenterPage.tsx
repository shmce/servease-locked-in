import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
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
import {
  createSupportTicket,
  createSupportTicketReply,
  getStoredProviderAccessToken,
  listSupportTicketReplies,
  listSupportTickets,
  type SupportTicketReplySummary,
  type SupportTicketSummary,
} from "../../services/serveaseProviderApi";
import { pickQueryItemId } from "../utils/providerDeeplinks";

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
  supportGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 420px)",
    gap: "16px",
    marginBottom: "48px",
  },
  panel: {
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    padding: "20px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    outline: "none",
    backgroundColor: "white",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    outline: "none",
    minHeight: "96px",
    resize: "vertical" as const,
    fontFamily: "inherit",
  },
  primaryButton: {
    backgroundColor: "#00BF63",
    border: "none",
    borderRadius: "10px",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    padding: "12px 16px",
  },
  secondaryButton: {
    backgroundColor: "white",
    border: "1px solid #00BF63",
    borderRadius: "10px",
    color: "#00A356",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    padding: "10px 14px",
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

function formatTicketDate(value: string | null): string {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusLabel(status: SupportTicketSummary["status"]): string {
  return status
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function ProviderHelpCenterPage() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState("All");
  const [tickets, setTickets] = useState<SupportTicketSummary[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketReplies, setTicketReplies] = useState<SupportTicketReplySummary[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketCategory, setTicketCategory] = useState("bookings");
  const [replyMessage, setReplyMessage] = useState("");

  const tabs = ["All", "Payments", "Bookings", "Verification"];
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;

  const startSupportTicket = useCallback((
    category: string,
    subject: string,
    message = "",
  ) => {
    setSelectedTicketId(null);
    setTicketCategory(category);
    setTicketSubject(subject);
    setTicketMessage(message);
    setTicketError(null);
  }, []);

  const loadTickets = useCallback(async () => {
    const token = getStoredProviderAccessToken();

    if (!token) {
      setTicketError("Sign in to view and create support tickets.");
      return;
    }

    setIsLoadingTickets(true);
    setTicketError(null);

    try {
      const nextTickets = await listSupportTickets(token);
      setTickets(nextTickets);
      setSelectedTicketId((current) =>
        pickQueryItemId(
          location.search,
          "ticketId",
          nextTickets.map((ticket) => ticket.id),
          current ?? nextTickets[0]?.id ?? null,
        ) as string | null,
      );
    } catch (error) {
      setTicketError(
        error instanceof Error ? error.message : "Unable to load support tickets.",
      );
    } finally {
      setIsLoadingTickets(false);
    }
  }, [location.search]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");
    const subject = params.get("subject");

    if (subject) {
      startSupportTicket(category || "general", subject);
    }
  }, [location.search, startSupportTicket]);

  useEffect(() => {
    const loadReplies = async () => {
      const token = getStoredProviderAccessToken();

      if (!token || !selectedTicketId) {
        setTicketReplies([]);
        return;
      }

      setIsLoadingReplies(true);
      setTicketError(null);

      try {
        const replies = await listSupportTicketReplies(token, selectedTicketId);
        setTicketReplies(replies);
      } catch (error) {
        setTicketError(
          error instanceof Error ? error.message : "Unable to load support replies.",
        );
      } finally {
        setIsLoadingReplies(false);
      }
    };

    void loadReplies();
  }, [selectedTicketId]);

  const handleCreateTicket = async () => {
    const token = getStoredProviderAccessToken();
    const subject = ticketSubject.trim();
    const message = ticketMessage.trim();

    if (!token) {
      setTicketError("Sign in to create a support ticket.");
      return;
    }

    if (!subject) {
      setTicketError("Add a subject before creating a support ticket.");
      return;
    }

    setIsSubmittingTicket(true);
    setTicketError(null);

    try {
      const ticket = await createSupportTicket(token, {
        subject,
        message: message || null,
        category: ticketCategory,
      });
      setTickets((current) => [ticket, ...current]);
      setSelectedTicketId(ticket.id);
      setTicketSubject("");
      setTicketMessage("");
    } catch (error) {
      setTicketError(
        error instanceof Error ? error.message : "Unable to create support ticket.",
      );
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleSendReply = async () => {
    const token = getStoredProviderAccessToken();
    const message = replyMessage.trim();

    if (!token || !selectedTicketId) {
      setTicketError("Select a support ticket before replying.");
      return;
    }

    if (!message) {
      setTicketError("Write a reply before sending.");
      return;
    }

    setIsSubmittingReply(true);
    setTicketError(null);

    try {
      const reply = await createSupportTicketReply(token, selectedTicketId, message);
      setTicketReplies((current) => [...current, reply]);
      setReplyMessage("");
    } catch (error) {
      setTicketError(
        error instanceof Error ? error.message : "Unable to send support reply.",
      );
    } finally {
      setIsSubmittingReply(false);
    }
  };

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
      answer: "Once a booking is completed and confirmed by the customer, eligible earnings are reflected in your provider earnings and can be withdrawn to a saved payout method. You can track earnings and payout history from the Earnings tab on your dashboard. Make sure your bank account or wallet details are up to date under Payout Methods in Settings."
    },
    {
      icon: <BookOpen size={20} />,
      iconColor: "#6366F1",
      iconBg: "#EEF2FF",
      title: "How do booking cancellations work?",
      category: "Managing Bookings",
      categoryColor: "#6366F1",
      categoryBg: "#EEF2FF",
      answer: "Cancellation outcomes depend on the booking status and the latest ServEase operations review. If you need to cancel, please do so as early as possible through the bookings tab so the customer can be notified and support can review any follow-up."
    },
    {
      icon: <ShieldCheck size={20} />,
      iconColor: "#8B5CF6",
      iconBg: "#F5F3FF",
      title: "How does profile verification work?",
      category: "Profile & Verification",
      categoryColor: "#8B5CF6",
      categoryBg: "#F5F3FF",
      answer: "Profile verification helps build trust with customers. You'll need to submit a valid Philippine government ID (e.g., PhilSys, Passport, Driver's License) and a clear selfie for identity matching. You can check your verification status under Settings > Profile & Verification."
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
      answer: "Go to your Provider Dashboard, tap on Settings, then Service Configuration. From there you can update your service name, description, base rate, price unit, and active status. Changes take effect immediately and will be reflected on your public profile."
    },
  ];

  const contactOptions: Array<{
    icon: ReactNode;
    iconColor: string;
    iconBg: string;
    title: string;
    description: string;
    highlightEmail: boolean;
    href?: string;
    ticketCategory?: string;
    ticketSubject?: string;
    ticketMessage?: string;
  }> = [
    {
      icon: <Mail size={24} />,
      iconColor: "#00BF63",
      iconBg: "#ECFDF5",
      title: "Email Support",
      description: "support@servease.ph",
      highlightEmail: true,
      href: "mailto:support@servease.ph?subject=ServEase%20provider%20support",
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
      ticketCategory: "general",
      ticketSubject: "Facebook support request",
      ticketMessage: "I need help from the provider support team.",
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

        {/* Support Tickets */}
        <div style={styles.supportGrid}>
          <div style={styles.panel}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginBottom: "16px" }}>
              <div>
                <h2 style={{ ...styles.sectionTitle, marginBottom: "6px" }}>Your Support Tickets</h2>
                <p style={{ ...styles.faqSubtitle, marginBottom: 0 }}>
                  Track replies from ServEase support and keep one thread per issue.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadTickets()}
                disabled={isLoadingTickets}
                style={{
                  ...styles.secondaryButton,
                  opacity: isLoadingTickets ? 0.7 : 1,
                  alignSelf: "flex-start",
                }}
              >
                {isLoadingTickets ? "Loading..." : "Refresh"}
              </button>
            </div>

            {ticketError && (
              <div
                style={{
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  borderRadius: "10px",
                  color: "#991B1B",
                  fontSize: "13px",
                  marginBottom: "16px",
                  padding: "10px 12px",
                }}
              >
                {ticketError}
              </div>
            )}

            <div style={{ display: "grid", gap: "10px" }}>
              {tickets.length === 0 && !isLoadingTickets ? (
                <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
                  No support tickets yet.
                </p>
              ) : (
                tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedTicketId(ticket.id)}
                    style={{
                      backgroundColor: selectedTicketId === ticket.id ? "#F0FDF8" : "white",
                      border: `1px solid ${selectedTicketId === ticket.id ? "#86EFAC" : "#E5E7EB"}`,
                      borderRadius: "10px",
                      cursor: "pointer",
                      padding: "14px",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "6px" }}>
                      <strong style={{ color: "#111827", fontSize: "14px" }}>
                        {ticket.subject}
                      </strong>
                      <span
                        style={{
                          backgroundColor: "#DCFCE7",
                          borderRadius: "999px",
                          color: "#047857",
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "3px 8px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {statusLabel(ticket.status)}
                      </span>
                    </div>
                    <p style={{ color: "#6B7280", fontSize: "13px", margin: "0 0 6px" }}>
                      {ticket.message || "No description provided."}
                    </p>
                    <span style={{ color: "#9CA3AF", fontSize: "12px" }}>
                      {ticket.category || "general"} · {formatTicketDate(ticket.createdAt)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div style={styles.panel}>
            <h2 style={{ ...styles.sectionTitle, marginBottom: "12px" }}>
              {selectedTicket ? "Ticket Thread" : "Create Ticket"}
            </h2>

            {selectedTicket ? (
              <div>
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>
                    {selectedTicket.subject}
                  </p>
                  <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
                    {selectedTicket.message || "No description provided."}
                  </p>
                </div>

                <div style={{ display: "grid", gap: "10px", marginBottom: "16px", maxHeight: "260px", overflowY: "auto" }}>
                  {isLoadingReplies ? (
                    <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
                      Loading replies...
                    </p>
                  ) : ticketReplies.length === 0 ? (
                    <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
                      No replies yet.
                    </p>
                  ) : (
                    ticketReplies.map((reply) => (
                      <div
                        key={reply.id}
                        style={{
                          backgroundColor: "#F9FAFB",
                          border: "1px solid #E5E7EB",
                          borderRadius: "10px",
                          padding: "12px",
                        }}
                      >
                        <p style={{ color: "#374151", fontSize: "14px", lineHeight: 1.5, margin: "0 0 6px" }}>
                          {reply.message}
                        </p>
                        <span style={{ color: "#9CA3AF", fontSize: "12px" }}>
                          {formatTicketDate(reply.createdAt)}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <textarea
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                  placeholder="Reply to ServEase support..."
                  style={{ ...styles.textarea, minHeight: "84px", marginBottom: "10px" }}
                />
                <button
                  type="button"
                  onClick={() => void handleSendReply()}
                  disabled={isSubmittingReply}
                  style={{
                    ...styles.primaryButton,
                    opacity: isSubmittingReply ? 0.7 : 1,
                    width: "100%",
                  }}
                >
                  {isSubmittingReply ? "Sending..." : "Send Reply"}
                </button>
              </div>
            ) : (
              <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
                Select a ticket to view its thread.
              </p>
            )}

            <div style={{ borderTop: "1px solid #E5E7EB", marginTop: "20px", paddingTop: "20px" }}>
              <h3 style={{ color: "#111827", fontSize: "15px", fontWeight: "700", margin: "0 0 12px" }}>
                New Support Ticket
              </h3>
              <div style={{ display: "grid", gap: "10px" }}>
                <select
                  value={ticketCategory}
                  onChange={(event) => setTicketCategory(event.target.value)}
                  style={styles.input}
                >
                  <option value="bookings">Bookings</option>
                  <option value="payments">Payments</option>
                  <option value="availability">Availability</option>
                  <option value="verification">Verification</option>
                  <option value="general">General</option>
                </select>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(event) => setTicketSubject(event.target.value)}
                  placeholder="Subject"
                  style={styles.input}
                />
                <textarea
                  value={ticketMessage}
                  onChange={(event) => setTicketMessage(event.target.value)}
                  placeholder="Describe the issue..."
                  style={styles.textarea}
                />
                <button
                  type="button"
                  onClick={() => void handleCreateTicket()}
                  disabled={isSubmittingTicket}
                  style={{
                    ...styles.primaryButton,
                    opacity: isSubmittingTicket ? 0.7 : 1,
                  }}
                >
                  {isSubmittingTicket ? "Creating..." : "Create Ticket"}
                </button>
              </div>
            </div>
          </div>
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
            Support tickets are tracked in your help center
          </p>

          <div style={styles.contactGrid}>
            {contactOptions.map((option, index) => (
              <button
                key={index}
                style={styles.contactCard}
                onClick={() => {
                  if ("href" in option && option.href) {
                    window.location.href = option.href;
                    return;
                  }

                  startSupportTicket(
                    option.ticketCategory ?? "general",
                    option.ticketSubject ?? option.title,
                    option.ticketMessage ?? "",
                  );
                }}
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
